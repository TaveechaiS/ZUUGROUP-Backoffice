import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { fullDraft } from '@/server/validation/product-full';
import { ProductError, uuidPattern } from '@/server/validation/products';
import {
  type ProductDraft,
  type ProductFileView,
  type ProductDetails,
  type ProductEditContext,
} from '@/types/api/product-full';
import { PRODUCT_OPTION_FIELDS } from '@/config/products';
import type { ProductOption } from '@/types/api/product-options';
import { inspectProductFile, productStorage } from './storage';

type RequestRow = {
  id: string;
  actorId: string;
  productId: string;
  payload: ProductDraft & { edit?: ProductEditContext };
  digest: string;
  status: string;
};
type FileRow = ProductFileView & { path: string; digest: string };
type Tx = Prisma.TransactionClient;
const db = () => getPrismaClient();
const digest = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
function checkedId(value: string) {
  if (!uuidPattern.test(value)) throw new ProductError('รหัสไม่ถูกต้อง');
  return value.toLowerCase();
}
async function optionsFor(tx: Tx, draft: ProductDraft, previous?: ProductDetails) {
  const result: Record<string, ProductOption> = {};
  for (const [label, kind] of Object.entries(PRODUCT_OPTION_FIELDS)) {
    const id = draft.fields[label];
    if (!id) continue;
    const rows = await tx.$queryRaw<ProductOption[]>(
      Prisma.sql`SELECT id,kind,name,code,active,version FROM product_options WHERE id=${id}::uuid AND kind=${kind} AND (active=true OR ${previous?.options[label] === id}) FOR SHARE`,
    );
    if (!rows[0]) throw new ProductError(`${label}ถูกปิดหรือไม่พบ กรุณาเลือกใหม่`, 409);
    result[label] = rows[0];
  }
  return result;
}
async function editableProduct(tx: Tx, edit: ProductEditContext) {
  const rows = await tx.$queryRaw<
    {
      id: string;
      code: string;
      name: string;
      unit: string;
      sequence: number;
      salePrice: string;
      details: ProductDetails | null;
      version: string;
    }[]
  >(
    Prisma.sql`SELECT id,code,name,unit,sequence,sale_price::text AS "salePrice",details,md5(to_jsonb(p)::text) AS version FROM products p WHERE id=${edit.targetProductId}::uuid AND deleted_at IS NULL FOR UPDATE`,
  );
  if (!rows[0]) throw new ProductError('ไม่พบสินค้าที่แก้ไข', 404);
  if (rows[0].version !== edit.expectedVersion)
    throw new ProductError(
      'ข้อมูลสินค้าถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนแก้ไขอีกครั้ง',
      409,
    );
  const files = rows[0].details?.files ?? [];
  if (edit.keepFileIds.some((id) => !files.some((file) => file.id === id)))
    throw new ProductError('ไฟล์เดิมไม่ใช่ของสินค้านี้', 409);
  return rows[0];
}
export async function beginProductEditRequest(targetId: string, body: unknown, actorId: string) {
  if (!body || typeof body !== 'object') throw new ProductError('ข้อมูลไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  const requestId = checkedId(String(input.requestId ?? ''));
  const targetProductId = checkedId(targetId);
  if (typeof input.expectedVersion !== 'string' || !/^[a-f0-9]{32}$/.test(input.expectedVersion))
    throw new ProductError('กรุณาระบุรุ่นข้อมูลสินค้า');
  if (
    !Array.isArray(input.keepFileIds) ||
    input.keepFileIds.some((id) => typeof id !== 'string' || !uuidPattern.test(id))
  )
    throw new ProductError('รายการไฟล์เดิมไม่ถูกต้อง');
  const keepFileIds = input.keepFileIds.map((id: string) => id.toLowerCase());
  if (new Set(keepFileIds).size !== keepFileIds.length) throw new ProductError('รายการไฟล์เดิมซ้ำ');
  const draft = fullDraft(input.data);
  if (draft.files.some((file) => keepFileIds.includes(file.id)))
    throw new ProductError('รหัสไฟล์ใหม่ซ้ำกับไฟล์เดิม');
  const edit = { targetProductId, expectedVersion: input.expectedVersion, keepFileIds };
  const payload = { ...draft, edit };
  const hash = digest(JSON.stringify(payload));
  return db().$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO product_create_requests(id,actor_id,product_id,payload,digest) VALUES(${requestId}::uuid,${actorId}::uuid,${randomUUID()}::uuid,${JSON.stringify(payload)}::jsonb,${hash}) ON CONFLICT DO NOTHING`,
    );
    const request = await requestFor(tx, requestId, actorId);
    if (request.digest !== hash || request.status === 'cancelled')
      throw new ProductError('คำขอนี้ใช้กับข้อมูลอื่นแล้ว กรุณาส่งใหม่', 409);
    if (request.status === 'pending') {
      const previous = await editableProduct(tx, edit);
      await optionsFor(tx, draft, previous.details ?? undefined);
    }
    return { requestId, status: request.status };
  });
}
export async function nextFullSequence(group: string, format: string) {
  group = checkedId(group);
  format = checkedId(format);
  return db().$transaction(async (tx) => {
    const options = await tx.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM product_options WHERE active AND ((id=${group}::uuid AND kind='codeGroup') OR (id=${format}::uuid AND kind='codeFormat'))`,
    );
    if (options.length !== 2) throw new ProductError('กลุ่มรหัสหรือรูปแบบถูกปิด กรุณาเลือกใหม่');
    const rows = await tx.$queryRaw<{ number: number }[]>(
      Prisma.sql`SELECT coalesce(max(sequence),0)+1 AS number FROM products WHERE code_group_id=${group}::uuid AND code_format_id=${format}::uuid`,
    );
    if (rows[0].number > 99999) throw new ProductError('เลขลำดับในกลุ่มนี้เต็มแล้ว', 409);
    return String(rows[0].number).padStart(5, '0');
  });
}
export async function beginProductRequest(requestId: string, body: unknown, actorId: string) {
  requestId = checkedId(requestId);
  const payload = fullDraft(body);
  const hash = digest(JSON.stringify(payload));
  return db().$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO product_create_requests(id,actor_id,product_id,payload,digest) VALUES(${requestId}::uuid,${actorId}::uuid,${randomUUID()}::uuid,${JSON.stringify(payload)}::jsonb,${hash}) ON CONFLICT DO NOTHING`,
    );
    const request = await requestFor(tx, requestId, actorId);
    if (request.digest !== hash || request.status === 'cancelled')
      throw new ProductError('คำขอนี้ใช้กับข้อมูลอื่นแล้ว กรุณาส่งใหม่', 409);
    if (request.status === 'pending') await optionsFor(tx, payload);
    return { requestId, status: request.status };
  });
}
async function requestFor(tx: Tx, requestId: string, actorId: string) {
  requestId = checkedId(requestId);
  const rows = await tx.$queryRaw<RequestRow[]>(
    Prisma.sql`SELECT id,actor_id AS "actorId",product_id AS "productId",payload,digest,status FROM product_create_requests WHERE id=${requestId}::uuid AND actor_id=${actorId}::uuid FOR UPDATE`,
  );
  if (!rows[0]) throw new ProductError('ไม่พบคำขอของคุณ', 404);
  return rows[0];
}
export async function uploadProductFile(
  requestId: string,
  fileId: string,
  actorId: string,
  kind: string,
  file: File,
) {
  requestId = checkedId(requestId);
  fileId = checkedId(fileId);
  // Check size before reading the bytes into memory.
  if (!file.size || file.size > 10485760) throw new ProductError('ไฟล์ต้องไม่เกิน 10 MB');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = inspectProductFile(bytes, kind, file.type);
  const hash = digest(bytes);
  const path = `${actorId}/${requestId}/${fileId}`;
  let uploaded = false;
  try {
    return await db().$transaction(
      async (tx) => {
        const request = await requestFor(tx, requestId, actorId);
        if (request.status === 'cancelled') throw new ProductError('คำขอนี้ถูกยกเลิกแล้ว', 409);
        const declared = request.payload.files.find((item) => item.id === fileId);
        const suppliedName = file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ';
        if (
          !declared ||
          declared.kind !== kind ||
          declared.digest !== hash ||
          declared.size !== file.size ||
          declared.name !== suppliedName ||
          (declared.type && declared.type !== type)
        )
          throw new ProductError('ไฟล์นี้ไม่ตรงกับรายการไฟล์ที่แจ้งไว้', 409);
        const existing = await tx.$queryRaw<FileRow[]>(
          Prisma.sql`SELECT id,kind,name,type,size,path,digest FROM product_files WHERE id=${fileId}::uuid AND request_id=${requestId}::uuid`,
        );
        if (existing[0]) {
          if (existing[0].digest !== hash || existing[0].kind !== kind)
            throw new ProductError('รหัสไฟล์นี้ถูกใช้งานแล้ว', 409);
          const stored = existing[0];
          return {
            id: stored.id,
            kind: stored.kind,
            name: stored.name,
            type: stored.type,
            size: stored.size,
          };
        }
        if (request.status !== 'pending') throw new ProductError('คำขอนี้ไม่รับไฟล์เพิ่มแล้ว', 409);
        const name = file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ';
        const { error } = await productStorage().upload(path, bytes, {
          contentType: type,
          upsert: false,
        });
        if (error) {
          // A response may be lost after Storage accepts the file. Reuse only identical bytes.
          const existingObject = await productStorage().download(path);
          if (
            existingObject.error ||
            !existingObject.data ||
            digest(new Uint8Array(await existingObject.data.arrayBuffer())) !== hash
          )
            throw new ProductError('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่', 503);
        }
        uploaded = true;
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO product_files(id,request_id,kind,name,type,size,path,digest) VALUES(${fileId}::uuid,${requestId}::uuid,${kind},${name},${type},${file.size},${path},${hash})`,
        );
        return { id: fileId, kind, name, type, size: file.size };
      },
      { timeout: 60000 },
    );
  } catch (error) {
    if (uploaded) await productStorage().remove([path]);
    throw error;
  }
}
export async function commitProductRequest(requestId: string, actorId: string) {
  requestId = checkedId(requestId);
  try {
    return await db().$transaction(
      async (tx) => {
        const request = await requestFor(tx, requestId, actorId);
        if (request.status === 'complete') {
          const rows = await tx.$queryRaw<{ id: string; code: string }[]>(
            Prisma.sql`SELECT id,code FROM products WHERE id=${request.payload.edit?.targetProductId ?? request.productId}::uuid`,
          );
          return rows[0];
        }
        if (request.status !== 'pending') throw new ProductError('คำขอนี้ถูกยกเลิกแล้ว', 409);
        const draft = fullDraft(request.payload);
        const edit = request.payload.edit;
        const previous = edit ? await editableProduct(tx, edit) : undefined;
        const options = await optionsFor(tx, draft, previous?.details ?? undefined);
        const group = options['กลุ่มรหัส'];
        const format = options['รูปแบบ'];
        await tx.$queryRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${`full-product:${group.id}:${format.id}`}))::text`,
        );
        const highest = await tx.$queryRaw<{ number: number }[]>(
          Prisma.sql`SELECT coalesce(max(sequence),0)+1 AS number FROM products WHERE code_group_id=${group.id}::uuid AND code_format_id=${format.id}::uuid`,
        );
        const number = draft.sequence ? Number(draft.sequence) : highest[0].number;
        if (number > 99999) throw new ProductError('เลขลำดับเต็มแล้ว', 409);
        const code = `${group.code}-${format.code}-${String(number).padStart(5, '0')}`;
        const duplicates = await tx.$queryRaw<{ id: string }[]>(
          Prisma.sql`SELECT id FROM products WHERE (code=${code} OR (code_group_id=${group.id}::uuid AND code_format_id=${format.id}::uuid AND sequence=${number})) AND id<>${edit?.targetProductId ?? request.productId}::uuid`,
        );
        if (duplicates.length)
          throw new ProductError('เลขลำดับหรือรหัสสินค้านี้มีอยู่แล้ว กรุณาเลือกเลขใหม่', 409);
        const fields = { ...draft.fields };
        const optionIds: Record<string, string> = {};
        for (const [label, option] of Object.entries(options)) {
          fields[label] = option.name;
          optionIds[label] = option.id;
        }
        fields['รหัสสินค้าเต็ม'] = code;
        fields['เลขลำดับ'] = String(number).padStart(5, '0');
        fields['ชื่อสินค้าเต็ม'] =
          fields['ชื่อสินค้าเต็ม (ไทย)'] || fields['ชื่อสินค้าเต็ม (ภาษาอังกฤษ)'];
        const fileRows = await tx.$queryRaw<(ProductFileView & { digest: string })[]>(
          Prisma.sql`SELECT id,kind,name,type,size,digest FROM product_files WHERE request_id=${requestId}::uuid ORDER BY created_at,id`,
        );
        if (
          fileRows.length !== draft.files.length ||
          draft.files.some(
            (expected) =>
              !fileRows.some(
                (file) =>
                  file.id === expected.id &&
                  file.kind === expected.kind &&
                  file.digest === expected.digest &&
                  file.size === expected.size,
              ),
          )
        )
          throw new ProductError('ไฟล์แนบยังอัปโหลดไม่ครบ กรุณาลองบันทึกอีกครั้ง', 409);
        const files = fileRows.map(({ id, kind, name, type, size }) => ({
          id,
          kind,
          name,
          type,
          size,
        }));
        const retained =
          previous?.details?.files.filter((file) => edit!.keepFileIds.includes(file.id)) ?? [];
        const details = { fields, options: optionIds, files: [...retained, ...files] };
        const productId = edit?.targetProductId ?? request.productId;
        if (edit) {
          await tx.$executeRaw(
            Prisma.sql`UPDATE products SET code=${code},sequence=${number},name=${fields['ชื่อสินค้าเต็ม']},category_id=${options['หมวดหมู่สินค้า'].id}::uuid,dosage_form_id=${options['รูปแบบยา']?.id ?? null}::uuid,drug_id=${options['ตัวยาสำคัญ']?.id ?? null}::uuid,unit=${options['หน่วยสินค้า'].name},sale_price=${fields['ราคาขาย']}::numeric,code_group_id=${group.id}::uuid,code_format_id=${format.id}::uuid,details=${JSON.stringify(details)}::jsonb,updated_at=clock_timestamp() WHERE id=${productId}::uuid`,
          );
        } else
          await tx.$executeRaw(
            Prisma.sql`INSERT INTO products(id,code,sequence,name,category_id,dosage_form_id,drug_id,default_warehouse_id,unit,sale_price,status,is_sample,updated_at,code_group_id,code_format_id,details) VALUES(${request.productId}::uuid,${code},${number},${fields['ชื่อสินค้าเต็ม']},${options['หมวดหมู่สินค้า'].id}::uuid,${options['รูปแบบยา']?.id ?? null}::uuid,${options['ตัวยาสำคัญ']?.id ?? null}::uuid,NULL,${options['หน่วยสินค้า'].name},${fields['ราคาขาย']}::numeric,'ACTIVE',false,now(),${group.id}::uuid,${format.id}::uuid,${JSON.stringify(details)}::jsonb)`,
          );
        await tx.$executeRaw(
          Prisma.sql`UPDATE product_create_requests SET status='complete',updated_at=now() WHERE id=${requestId}::uuid`,
        );
        await tx.auditEvent.create({
          data: {
            actorUserId: actorId,
            actorRole: 'ADMIN',
            action: edit ? 'PRODUCT_UPDATED_FULL' : 'PRODUCT_CREATED_FULL',
            requestId,
            ...(previous ? { before: JSON.parse(JSON.stringify(previous)) } : {}),
            after: JSON.parse(JSON.stringify({ id: productId, code, details })),
          },
        });
        return { id: productId, code };
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
      throw new ProductError('รหัสสินค้าหรือเลขลำดับซ้ำ กรุณาเลือกใหม่', 409);
    throw error;
  }
}
export async function cancelProductRequest(requestId: string, actorId: string) {
  requestId = checkedId(requestId);
  // Freeze the request before external cleanup; a cleanup failure must not make
  // metadata for already-removed files eligible for a later product commit.
  await db().$transaction(async (tx) => {
    const request = await requestFor(tx, requestId, actorId);
    if (request.status === 'complete')
      throw new ProductError('สินค้านี้บันทึกแล้ว ไม่สามารถยกเลิกคำขอได้', 409);
    await tx.$executeRaw(
      Prisma.sql`UPDATE product_create_requests SET status='cancelled',updated_at=now() WHERE id=${requestId}::uuid`,
    );
  });
  const paths: string[] = [];
  const prefix = `${actorId}/${requestId}`;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await productStorage().list(prefix, { limit: 1000, offset });
    if (error) throw new ProductError('ตรวจไฟล์ค้างไม่สำเร็จ กรุณาลองใหม่', 503);
    paths.push(...(data ?? []).map((item) => `${prefix}/${item.name}`));
    if ((data?.length ?? 0) < 1000) break;
  }
  for (let index = 0; index < paths.length; index += 1000) {
    const { error } = await productStorage().remove(paths.slice(index, index + 1000));
    if (error) throw new ProductError('ล้างไฟล์ไม่สำเร็จ กรุณาลองใหม่', 503);
  }
  await db().$transaction(async (tx) => {
    await requestFor(tx, requestId, actorId);
    await tx.$executeRaw(Prisma.sql`DELETE FROM product_files WHERE request_id=${requestId}::uuid`);
  });
  return { cancelled: true };
}
export async function productRequestStatus(requestId: string, actorId: string) {
  return db().$transaction(async (tx) => {
    const request = await requestFor(tx, requestId, actorId);
    const rows =
      request.status === 'complete'
        ? await tx.$queryRaw<{ id: string; code: string }[]>(
            Prisma.sql`SELECT id,code FROM products WHERE id=${request.payload.edit?.targetProductId ?? request.productId}::uuid`,
          )
        : [];
    return { status: request.status, ...(rows[0] ? { product: rows[0] } : {}) };
  });
}
export async function readProductFile(fileId: string, isAdmin: boolean) {
  fileId = checkedId(fileId);
  const rows = await db().$queryRaw<FileRow[]>(
    Prisma.sql`SELECT f.id,f.kind,f.name,f.type,f.size,f.path,f.digest FROM product_files f JOIN product_create_requests r ON r.id=f.request_id JOIN products p ON p.id=coalesce((r.payload->'edit'->>'targetProductId')::uuid,r.product_id) WHERE f.id=${fileId}::uuid AND r.status='complete' AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(p.details->'files','[]'::jsonb)) entry WHERE entry->>'id'=f.id::text) ${isAdmin ? Prisma.empty : Prisma.sql`AND p.deleted_at IS NULL`}`,
  );
  if (!rows[0]) throw new ProductError('ไม่พบไฟล์', 404);
  const { data, error } = await productStorage().download(rows[0].path);
  if (error || !data) throw new ProductError('เปิดไฟล์ไม่สำเร็จ', 503);
  return { file: rows[0], bytes: await data.arrayBuffer() };
}
