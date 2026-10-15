import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { uuidPattern } from '@/server/validation/products';
import { CustomerError } from '@/server/validation/customer-error';
import { customerDraft } from '@/server/validation/customers';
import type { CustomerDetails, CustomerDraft, CustomerFileView } from '@/types/api/customers';
import { customerStorage, inspectCustomerFile } from './storage';

type EditContext = { targetCustomerId: string; expectedUpdatedAt: string; keepFileIds: string[] };
type RequestRow = {
  id: string;
  actorId: string;
  customerId: string;
  payload: CustomerDraft & { edit?: EditContext };
  digest: string;
  status: string;
};
type PreviousRow = {
  id: string;
  code: string;
  codeGroupId: string;
  sequence: number;
  status: string;
  details: CustomerDetails;
  current: boolean;
};
// Edit requests keep a random customer_id (it is unique); the edited customer lives in payload.edit.
const targetOf = (request: RequestRow) =>
  request.payload.edit?.targetCustomerId ?? request.customerId;
type OptionRow = {
  id: string;
  kind: string;
  name: string;
  code: string | null;
  days: number | null;
};
type Tx = Prisma.TransactionClient;
const db = () => getPrismaClient();
const digest = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');

function checkedId(value: string) {
  if (!uuidPattern.test(value)) throw new CustomerError('รหัสไม่ถูกต้อง');
  return value.toLowerCase();
}

// Every referenced choice must still exist and be active when the request starts and commits.
async function referencesFor(tx: Tx, draft: CustomerDraft) {
  const wanted: [string, string, string][] = [
    [draft.codeGroupId, 'codeGroup', 'กลุ่มรหัสลูกค้า'],
    ...(draft.fields.creditTermId
      ? [[draft.fields.creditTermId, 'creditTerm', 'ระยะเวลาเครดิต'] as [string, string, string]]
      : []),
    ...(draft.fields.creditStartId
      ? [
          [draft.fields.creditStartId, 'creditStart', 'วันเริ่มนับเครดิต'] as [
            string,
            string,
            string,
          ],
        ]
      : []),
    ...[...new Set(draft.files.map((file) => file.documentTypeId))].map(
      (id) => [id, 'documentType', 'ประเภทเอกสารแนบ'] as [string, string, string],
    ),
  ];
  const rows = await tx.$queryRaw<OptionRow[]>(
    Prisma.sql`SELECT id,kind,name,code,days FROM customer_options WHERE active AND id IN (${Prisma.join(wanted.map(([id]) => Prisma.sql`${id}::uuid`))}) FOR SHARE`,
  );
  const options = new Map(rows.map((row) => [row.id, row]));
  for (const [id, kind, label] of wanted)
    if (options.get(id)?.kind !== kind)
      throw new CustomerError(`${label}ถูกปิดหรือไม่พบ กรุณาเลือกใหม่`, 409);
  let territory: { id: string; name: string } | null = null;
  if (draft.fields.territoryId) {
    const territories = await tx.$queryRaw<{ id: string; name: string }[]>(
      Prisma.sql`SELECT id,name FROM sales_territories WHERE id=${draft.fields.territoryId}::uuid AND deleted_at IS NULL FOR SHARE`,
    );
    if (!territories[0]) throw new CustomerError('เขตขายถูกลบหรือไม่พบ กรุณาเลือกใหม่', 409);
    territory = territories[0];
  }
  return {
    group: options.get(draft.codeGroupId)!,
    creditTerm: draft.fields.creditTermId ? options.get(draft.fields.creditTermId)! : null,
    options,
    territory,
  };
}

async function requestFor(tx: Tx, requestId: string, actorId: string) {
  const rows = await tx.$queryRaw<RequestRow[]>(
    Prisma.sql`SELECT id,actor_id AS "actorId",customer_id AS "customerId",payload,digest,status FROM customer_create_requests WHERE id=${checkedId(requestId)}::uuid AND actor_id=${actorId}::uuid FOR UPDATE`,
  );
  if (!rows[0]) throw new CustomerError('ไม่พบคำขอของคุณ', 404);
  return rows[0];
}

export async function beginCustomerRequest(requestId: string, body: unknown, actorId: string) {
  requestId = checkedId(requestId);
  const payload = customerDraft(body);
  const hash = digest(JSON.stringify(payload));
  return db().$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO customer_create_requests(id,actor_id,customer_id,payload,digest) VALUES(${requestId}::uuid,${actorId}::uuid,${randomUUID()}::uuid,${JSON.stringify(payload)}::jsonb,${hash}) ON CONFLICT DO NOTHING`,
    );
    const request = await requestFor(tx, requestId, actorId);
    if (request.digest !== hash || request.status === 'cancelled')
      throw new CustomerError('คำขอนี้ใช้กับข้อมูลอื่นแล้ว กรุณาส่งใหม่', 409);
    if (request.status === 'pending') await referencesFor(tx, payload);
    return { requestId, status: request.status };
  });
}

// Locks the customer being edited and rejects stale forms (updatedAt compared to the millisecond).
async function editableCustomer(tx: Tx, edit: EditContext) {
  const rows = await tx.$queryRaw<PreviousRow[]>(
    Prisma.sql`SELECT id,code,code_group_id AS "codeGroupId",sequence,status,details,date_trunc('milliseconds',updated_at)=${edit.expectedUpdatedAt}::timestamptz AS current FROM customers WHERE id=${edit.targetCustomerId}::uuid AND deleted_at IS NULL AND details IS NOT NULL FOR UPDATE`,
  );
  if (!rows[0]) throw new CustomerError('ไม่พบลูกค้าที่แก้ไข หรือถูกลบแล้ว', 404);
  if (!rows[0].current)
    throw new CustomerError(
      'ข้อมูลลูกค้าถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนแก้ไขอีกครั้ง',
      409,
    );
  if (edit.keepFileIds.some((id) => !rows[0].details.files.some((file) => file.id === id)))
    throw new CustomerError('ไฟล์เดิมไม่ใช่ของลูกค้ารายนี้', 409);
  return rows[0];
}

export async function beginCustomerEditRequest(targetId: string, body: unknown, actorId: string) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new CustomerError('ข้อมูลไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  const requestId = checkedId(String(input.requestId ?? ''));
  if (
    typeof input.expectedUpdatedAt !== 'string' ||
    Number.isNaN(Date.parse(input.expectedUpdatedAt))
  )
    throw new CustomerError('กรุณาระบุเวลาแก้ไขล่าสุดของข้อมูล');
  if (
    !Array.isArray(input.keepFileIds) ||
    input.keepFileIds.some((id) => typeof id !== 'string' || !uuidPattern.test(id))
  )
    throw new CustomerError('รายการไฟล์เดิมไม่ถูกต้อง');
  const keepFileIds = (input.keepFileIds as string[]).map((id) => id.toLowerCase());
  if (new Set(keepFileIds).size !== keepFileIds.length)
    throw new CustomerError('รายการไฟล์เดิมซ้ำ');
  const draft = customerDraft(input.data);
  if (draft.files.some((file) => keepFileIds.includes(file.id)))
    throw new CustomerError('รหัสไฟล์ใหม่ซ้ำกับไฟล์เดิม');
  const edit = {
    targetCustomerId: checkedId(targetId),
    expectedUpdatedAt: new Date(input.expectedUpdatedAt).toISOString(),
    keepFileIds,
  };
  const payload = { ...draft, edit };
  const hash = digest(JSON.stringify(payload));
  return db().$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO customer_create_requests(id,actor_id,customer_id,payload,digest) VALUES(${requestId}::uuid,${actorId}::uuid,${randomUUID()}::uuid,${JSON.stringify(payload)}::jsonb,${hash}) ON CONFLICT DO NOTHING`,
    );
    const request = await requestFor(tx, requestId, actorId);
    if (request.digest !== hash || request.status === 'cancelled')
      throw new CustomerError('คำขอนี้ใช้กับข้อมูลอื่นแล้ว กรุณาส่งใหม่', 409);
    if (request.status === 'pending') {
      await editableCustomer(tx, edit);
      await referencesFor(tx, draft);
    }
    return { requestId, status: request.status };
  });
}

export async function uploadCustomerFile(
  requestId: string,
  fileId: string,
  actorId: string,
  documentTypeId: string,
  file: File,
) {
  requestId = checkedId(requestId);
  fileId = checkedId(fileId);
  documentTypeId = checkedId(documentTypeId);
  // Check size before reading the bytes into memory.
  if (!file.size || file.size > 10485760) throw new CustomerError('ไฟล์ต้องไม่เกิน 10 MB');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = inspectCustomerFile(bytes, file.type);
  const hash = digest(bytes);
  const path = `${actorId}/${requestId}/${fileId}`;
  let uploaded = false;
  try {
    return await db().$transaction(
      async (tx) => {
        const request = await requestFor(tx, requestId, actorId);
        if (request.status === 'cancelled') throw new CustomerError('คำขอนี้ถูกยกเลิกแล้ว', 409);
        const declared = request.payload.files.find((item) => item.id === fileId);
        const name = file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ';
        if (
          !declared ||
          declared.documentTypeId !== documentTypeId ||
          declared.digest !== hash ||
          declared.size !== file.size ||
          declared.name !== name ||
          (declared.type && declared.type !== type)
        )
          throw new CustomerError('ไฟล์นี้ไม่ตรงกับรายการไฟล์ที่แจ้งไว้', 409);
        const existing = await tx.$queryRaw<{ id: string; digest: string }[]>(
          Prisma.sql`SELECT id,digest FROM customer_files WHERE id=${fileId}::uuid AND request_id=${requestId}::uuid`,
        );
        if (existing[0]) {
          if (existing[0].digest !== hash) throw new CustomerError('รหัสไฟล์นี้ถูกใช้งานแล้ว', 409);
          return { id: fileId, documentTypeId, name, type, size: file.size };
        }
        if (request.status !== 'pending')
          throw new CustomerError('คำขอนี้ไม่รับไฟล์เพิ่มแล้ว', 409);
        const { error } = await customerStorage().upload(path, bytes, {
          contentType: type,
          upsert: false,
        });
        if (error) {
          // A response may be lost after Storage accepts the file. Reuse only identical bytes.
          const existingObject = await customerStorage().download(path);
          if (
            existingObject.error ||
            !existingObject.data ||
            digest(new Uint8Array(await existingObject.data.arrayBuffer())) !== hash
          )
            throw new CustomerError('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่', 503);
        }
        uploaded = true;
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO customer_files(id,request_id,document_type_id,name,type,size,path,digest) VALUES(${fileId}::uuid,${requestId}::uuid,${documentTypeId}::uuid,${name},${type},${file.size},${path},${hash})`,
        );
        return { id: fileId, documentTypeId, name, type, size: file.size };
      },
      { timeout: 60000 },
    );
  } catch (error) {
    if (uploaded) await customerStorage().remove([path]);
    throw error;
  }
}

export async function commitCustomerRequest(requestId: string, actorId: string) {
  requestId = checkedId(requestId);
  try {
    return await db().$transaction(
      async (tx) => {
        const request = await requestFor(tx, requestId, actorId);
        const targetId = targetOf(request);
        if (request.status === 'complete') {
          const rows = await tx.$queryRaw<{ id: string; code: string }[]>(
            Prisma.sql`SELECT id,code FROM customers WHERE id=${targetId}::uuid`,
          );
          return rows[0];
        }
        if (request.status !== 'pending') throw new CustomerError('คำขอนี้ถูกยกเลิกแล้ว', 409);
        const { edit, ...stored } = request.payload;
        const draft = customerDraft(stored);
        const previous = edit ? await editableCustomer(tx, edit) : undefined;
        const { group, creditTerm, options, territory } = await referencesFor(tx, draft);
        await tx.$queryRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${`customer-code:${group.id}`}))::text`,
        );
        const highest = await tx.$queryRaw<{ number: number }[]>(
          Prisma.sql`SELECT coalesce(max(sequence),0)+1 AS number FROM customers WHERE code_group_id=${group.id}::uuid`,
        );
        // Editing without a new number keeps the current one while the group is unchanged.
        const number = draft.sequence
          ? Number(draft.sequence)
          : previous && previous.codeGroupId === group.id
            ? previous.sequence
            : highest[0].number;
        if (number > 999999) throw new CustomerError('เลขรันในกลุ่มนี้เต็มแล้ว', 409);
        const code = `${group.code}-${String(number).padStart(4, '0')}`;
        const duplicates = await tx.$queryRaw<{ id: string }[]>(
          Prisma.sql`SELECT id FROM customers WHERE (code=${code} OR (code_group_id=${group.id}::uuid AND sequence=${number})) AND id<>${targetId}::uuid`,
        );
        if (duplicates.length)
          throw new CustomerError('รหัสลูกค้านี้มีอยู่แล้ว กรุณาเปลี่ยนเลขรัน', 409);
        const fileRows = await tx.$queryRaw<
          (Omit<CustomerFileView, 'documentTypeName'> & { digest: string })[]
        >(
          Prisma.sql`SELECT id,document_type_id AS "documentTypeId",name,type,size,digest FROM customer_files WHERE request_id=${requestId}::uuid ORDER BY created_at,id`,
        );
        if (
          fileRows.length !== draft.files.length ||
          draft.files.some(
            (expected) =>
              !fileRows.some(
                (file) =>
                  file.id === expected.id &&
                  file.documentTypeId === expected.documentTypeId &&
                  file.digest === expected.digest &&
                  file.size === expected.size,
              ),
          )
        )
          throw new CustomerError('ไฟล์แนบยังอัปโหลดไม่ครบ กรุณาลองบันทึกอีกครั้ง', 409);
        const files: CustomerFileView[] = fileRows.map(
          ({ id, documentTypeId, name, type, size }) => ({
            id,
            documentTypeId,
            documentTypeName: options.get(documentTypeId)!.name,
            name,
            type,
            size,
          }),
        );
        const fields = draft.fields;
        const retained =
          previous?.details.files.filter((file) => edit!.keepFileIds.includes(file.id)) ?? [];
        const details = {
          fields,
          shippingAddresses: draft.shippingAddresses,
          files: [...retained, ...files],
        };
        if (previous)
          await tx.$executeRaw(
            Prisma.sql`UPDATE customers SET code=${code},name=${fields.name},status=${fields.customerStatus},category=${group.name},province=${fields.billingProvince},payment_terms=${creditTerm?.name ?? ''},territory_id=${territory?.id ?? null}::uuid,notes=${fields.notes},code_group_id=${group.id}::uuid,sequence=${number},contact_name=${fields.contactName},phone=${fields.phone},credit_term_id=${creditTerm?.id ?? null}::uuid,credit_days=${creditTerm?.days ?? null},credit_limit=${fields.creditLimit || null}::numeric,license_status=${fields.licenseStatus},license_expires_at=${fields.licenseExpiresAt || null}::date,details=${JSON.stringify(details)}::jsonb,updated_at=clock_timestamp() WHERE id=${targetId}::uuid`,
          );
        else
          await tx.$executeRaw(
            Prisma.sql`INSERT INTO customers(id,code,name,status,category,province,payment_terms,territory_id,notes,code_group_id,sequence,contact_name,phone,credit_term_id,credit_days,credit_limit,license_status,license_expires_at,details,updated_at)
              VALUES(${targetId}::uuid,${code},${fields.name},${fields.customerStatus},${group.name},${fields.billingProvince},${creditTerm?.name ?? ''},${territory?.id ?? null}::uuid,${fields.notes},${group.id}::uuid,${number},${fields.contactName},${fields.phone},${creditTerm?.id ?? null}::uuid,${creditTerm?.days ?? null},${fields.creditLimit || null}::numeric,${fields.licenseStatus},${fields.licenseExpiresAt || null}::date,${JSON.stringify(details)}::jsonb,now())`,
          );
        await tx.$executeRaw(
          Prisma.sql`UPDATE customer_create_requests SET status='complete',updated_at=now() WHERE id=${requestId}::uuid`,
        );
        await tx.auditEvent.create({
          data: {
            actorUserId: actorId,
            actorRole: 'ADMIN',
            action: previous ? 'CUSTOMER_UPDATED_FULL' : 'CUSTOMER_CREATED_FULL',
            requestId,
            ...(previous
              ? {
                  before: JSON.parse(
                    JSON.stringify({
                      id: previous.id,
                      code: previous.code,
                      status: previous.status,
                      details: previous.details,
                    }),
                  ),
                }
              : {}),
            after: JSON.parse(
              JSON.stringify({ id: targetId, code, status: fields.customerStatus, details }),
            ),
          },
        });
        return { id: targetId, code };
      },
      { timeout: 30000 },
    );
  } catch (error) {
    const e = error as {
      code?: string;
      meta?: { code?: string; driverAdapterError?: { cause?: { originalCode?: string } } };
    };
    if (
      e.code === 'P2002' ||
      e.meta?.code === '23505' ||
      e.meta?.driverAdapterError?.cause?.originalCode === '23505'
    )
      throw new CustomerError('รหัสลูกค้าหรือเลขรันซ้ำ กรุณาเปลี่ยนเลขรัน', 409);
    throw error;
  }
}

export async function cancelCustomerRequest(requestId: string, actorId: string) {
  requestId = checkedId(requestId);
  // Freeze the request before external cleanup so removed files can never be committed later.
  await db().$transaction(async (tx) => {
    const request = await requestFor(tx, requestId, actorId);
    if (request.status === 'complete')
      throw new CustomerError('ลูกค้ารายนี้บันทึกแล้ว ไม่สามารถยกเลิกคำขอได้', 409);
    await tx.$executeRaw(
      Prisma.sql`UPDATE customer_create_requests SET status='cancelled',updated_at=now() WHERE id=${requestId}::uuid`,
    );
  });
  const paths: string[] = [];
  const prefix = `${actorId}/${requestId}`;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await customerStorage().list(prefix, { limit: 1000, offset });
    if (error) throw new CustomerError('ตรวจไฟล์ค้างไม่สำเร็จ กรุณาลองใหม่', 503);
    paths.push(...(data ?? []).map((item) => `${prefix}/${item.name}`));
    if ((data?.length ?? 0) < 1000) break;
  }
  for (let index = 0; index < paths.length; index += 1000) {
    const { error } = await customerStorage().remove(paths.slice(index, index + 1000));
    if (error) throw new CustomerError('ล้างไฟล์ไม่สำเร็จ กรุณาลองใหม่', 503);
  }
  await db().$transaction(async (tx) => {
    await requestFor(tx, requestId, actorId);
    await tx.$executeRaw(
      Prisma.sql`DELETE FROM customer_files WHERE request_id=${requestId}::uuid`,
    );
  });
  return { cancelled: true };
}

export async function customerRequestStatus(requestId: string, actorId: string) {
  return db().$transaction(async (tx) => {
    const request = await requestFor(tx, requestId, actorId);
    const rows =
      request.status === 'complete'
        ? await tx.$queryRaw<{ id: string; code: string }[]>(
            Prisma.sql`SELECT id,code FROM customers WHERE id=${targetOf(request)}::uuid`,
          )
        : [];
    return { status: request.status, ...(rows[0] ? { customer: rows[0] } : {}) };
  });
}

// A file stays readable while the customer's current details still list it (edits may retain
// files uploaded by an earlier request). Deleted customers' files are Admin-only.
export async function readCustomerFile(
  fileId: string,
  isAdmin = false,
  actor?: { id: string; roleId: string },
) {
  fileId = checkedId(fileId);
  const rows = await db().$queryRaw<{ name: string; type: string; size: number; path: string }[]>(
    Prisma.sql`SELECT f.name,f.type,f.size,f.path FROM customer_files f JOIN customer_create_requests r ON r.id=f.request_id JOIN customers c ON EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.details->'files','[]'::jsonb)) entry WHERE entry->>'id'=f.id::text) WHERE f.id=${fileId}::uuid AND r.status='complete' ${isAdmin ? Prisma.empty : Prisma.sql`AND c.deleted_at IS NULL`} ${actor ? customerScope(actor, Prisma.sql`c.id`) : Prisma.empty} LIMIT 1`,
  );
  if (!rows[0]) throw new CustomerError('ไม่พบไฟล์', 404);
  const { data, error } = await customerStorage().download(rows[0].path);
  if (error || !data) throw new CustomerError('เปิดไฟล์ไม่สำเร็จ', 503);
  return { file: rows[0], bytes: await data.arrayBuffer() };
}
