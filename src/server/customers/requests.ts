import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { str, id } from '@/server/operations/domain';
import { page, pageResult, type Actor } from '@/server/operations/service';
import { likeOf, optionalRange } from '@/server/reports/range';
import { commitCustomerRequest } from './full';
import type { CustomerRequestDetail, CustomerRequestRow } from '@/types/api/customer-requests';

export const REQUESTERS = ['SALES', 'MANAGER'];
export const REQUEST_STATUS_TEXT: Record<string, string> = {
  submitted: 'รอตรวจสอบ',
  returned: 'ส่งกลับแก้ไข',
  rejected: 'ไม่อนุมัติ',
  complete: 'อนุมัติแล้ว',
  cancelled: 'ยกเลิก',
  pending: 'ร่าง',
};
const statusSql = Prisma.sql`CASE r.status WHEN 'submitted' THEN 'รอตรวจสอบ' WHEN 'returned' THEN 'ส่งกลับแก้ไข' WHEN 'rejected' THEN 'ไม่อนุมัติ' WHEN 'complete' THEN 'อนุมัติแล้ว' WHEN 'cancelled' THEN 'ยกเลิก' ELSE 'ร่าง' END`;
const db = () => getPrismaClient();
const from = Prisma.sql`customer_create_requests r JOIN users a ON a.id=r.actor_id LEFT JOIN user_roles ar ON ar.user_id=a.id LEFT JOIN users rv ON rv.id=r.reviewed_by_id LEFT JOIN customer_options g ON g.id=(r.payload->>'codeGroupId')::uuid LEFT JOIN sales_territories t ON t.id=NULLIF(r.payload->'fields'->>'territoryId','')::uuid LEFT JOIN customers c ON c.id=r.customer_id AND r.status='complete'`;
const select = Prisma.sql`r.id,${statusSql} AS status,r.payload->'fields'->>'name' AS name,COALESCE(g.name,'-') AS "codeGroupName",COALESCE(t.name,'-') AS "territoryName",a.id AS "requesterId",a.name AS "requesterName",COALESCE(ar.role_id,'') AS "requesterRole",r.submitted_at AS "submittedAt",COALESCE(rv.name,'') AS "reviewerName",r.reviewed_at AS "reviewedAt",r.review_reason AS "reviewReason",c.id AS "customerId",c.code AS "customerCode",r.updated_at AS "updatedAt"`;

export async function submitCustomerRequest(requestId: string, actor: Actor) {
  if (!REQUESTERS.includes(actor.roleId))
    throw new RecordError(403, 'ส่งคำขอได้เฉพาะ Sales / Manager');
  const rid = id(requestId, 'คำขอ');
  return db().$transaction(async (tx) => {
    const request = (
      await tx.$queryRaw<{ status: string; files: number; declared: number }[]>(
        Prisma.sql`SELECT r.status,(SELECT count(*)::int FROM customer_files f WHERE f.request_id=r.id) AS files,jsonb_array_length(coalesce(r.payload->'files','[]'::jsonb)) AS declared FROM customer_create_requests r WHERE r.id=${rid}::uuid AND r.actor_id=${actor.id}::uuid AND r.payload->'edit' IS NULL FOR UPDATE`,
      )
    )[0];
    if (!request) throw new RecordError(404, 'ไม่พบคำขอของคุณ');
    if (request.status === 'submitted') return { id: rid, status: 'รอตรวจสอบ' };
    if (request.status !== 'pending') throw new RecordError(409, 'คำขอนี้ส่งแล้วหรือปิดแล้ว');
    if (request.files !== request.declared)
      throw new RecordError(409, 'ไฟล์แนบยังอัปโหลดไม่ครบ กรุณาลองใหม่');
    await tx.$executeRaw(
      Prisma.sql`UPDATE customer_create_requests SET status='submitted',submitted_at=now(),updated_at=now() WHERE id=${rid}::uuid`,
    );
    return { id: rid, status: 'รอตรวจสอบ' };
  });
}

export async function reviewCustomerRequest(requestId: string, actor: Actor, raw: unknown) {
  if (actor.roleId !== 'ADMIN') throw new RecordError(403, 'ตรวจคำขอได้เฉพาะ Admin');
  const rid = id(requestId, 'คำขอ');
  const body = (raw ?? {}) as Record<string, unknown>;
  const action = str(body.action, 'คำสั่ง');
  if (!['approve', 'return', 'reject'].includes(action))
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  const reason = action === 'approve' ? '' : str(body.reason, 'เหตุผล');
  const requester = await db().$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { status: string; actorId: string; updatedAt: Date; reviewed: boolean }[]
    >(
      Prisma.sql`SELECT status,actor_id AS "actorId",updated_at AS "updatedAt",reviewed_by_id IS NOT NULL AS reviewed FROM customer_create_requests WHERE id=${rid}::uuid AND submitted_at IS NOT NULL FOR UPDATE`,
    );
    if (!rows[0]) throw new RecordError(404, 'ไม่พบคำขอ');
    if (
      body.expectedUpdatedAt !== undefined &&
      String(body.expectedUpdatedAt) !== rows[0].updatedAt.toISOString()
    )
      throw new RecordError(409, 'คำขอถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    const stuckApproval = action === 'approve' && rows[0].status === 'pending' && rows[0].reviewed;
    if (rows[0].status !== 'submitted' && !stuckApproval)
      throw new RecordError(409, 'คำขอนี้ตรวจแล้ว');
    await tx.$executeRaw(
      Prisma.sql`UPDATE customer_create_requests SET status=${action === 'approve' ? 'pending' : action === 'return' ? 'returned' : 'rejected'},reviewed_by_id=${actor.id}::uuid,reviewed_at=now(),review_reason=${reason},updated_at=now() WHERE id=${rid}::uuid`,
    );
    return rows[0].actorId;
  });
  if (action !== 'approve')
    return { id: rid, status: REQUEST_STATUS_TEXT[action === 'return' ? 'returned' : 'rejected'] };
  try {
    const customer = await commitCustomerRequest(rid, requester);
    await db().auditEvent.create({
      data: {
        actorUserId: actor.id,
        actorRole: actor.roleId,
        action: 'CUSTOMER_REQUEST_APPROVED',
        requestId: randomUUID(),
        after: { requestId: rid, customerId: customer.id, code: customer.code },
      },
    });
    return { id: rid, status: 'อนุมัติแล้ว', customer };
  } catch (error) {
    await db().$executeRaw(
      Prisma.sql`UPDATE customer_create_requests SET status='submitted',reviewed_by_id=NULL,reviewed_at=NULL,updated_at=now() WHERE id=${rid}::uuid AND status='pending'`,
    );
    throw error;
  }
}

export async function customerRequestList(actor: Actor, params: URLSearchParams) {
  const { offset, limit, search } = page(params),
    like = likeOf(search),
    status = params.get('status') ?? '';
  const statusKey = Object.entries(REQUEST_STATUS_TEXT).find(([, text]) => text === status)?.[0];
  if (status && !statusKey) throw new RecordError(400, 'สถานะไม่ถูกต้อง');
  const where = Prisma.sql`r.submitted_at IS NOT NULL ${actor.roleId === 'ADMIN' ? Prisma.empty : Prisma.sql`AND r.actor_id=${actor.id}::uuid`} AND (r.payload->'fields'->>'name' ILIKE ${like} OR a.name ILIKE ${like}) ${statusKey ? Prisma.sql`AND r.status=${statusKey}` : Prisma.empty} ${optionalRange(params, Prisma.sql`r.submitted_at`, true)}`;
  return db().$transaction(
    async (tx) => {
      const rows = await tx.$queryRaw<CustomerRequestRow[]>(
        Prisma.sql`SELECT ${select} FROM ${from} WHERE ${where} ORDER BY r.status='submitted' DESC,r.submitted_at DESC,r.id OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await tx.$queryRaw<{ total: number }[]>(
        Prisma.sql`SELECT count(*)::int AS total FROM ${from} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

export async function customerRequestDetail(actor: Actor, requestId: string) {
  const rid = id(requestId, 'คำขอ');
  return db().$transaction(
    async (tx) => {
      const row = (
        await tx.$queryRaw<(CustomerRequestDetail & { payload: CustomerRequestDetail['draft'] })[]>(
          Prisma.sql`SELECT ${select},r.payload FROM ${from} WHERE r.id=${rid}::uuid AND r.submitted_at IS NOT NULL ${actor.roleId === 'ADMIN' ? Prisma.empty : Prisma.sql`AND r.actor_id=${actor.id}::uuid`}`,
        )
      )[0];
      if (!row) throw new RecordError(404, 'ไม่พบคำขอ');
      const { payload, ...rest } = row;
      const fields = payload.fields;
      const options = await tx.$queryRaw<{ id: string; name: string }[]>(
        Prisma.sql`SELECT id,name FROM customer_options WHERE id IN (${Prisma.join(
          [fields.creditTermId, fields.creditStartId]
            .filter(Boolean)
            .map((value) => Prisma.sql`${value}::uuid`)
            .concat([Prisma.sql`NULL::uuid`]),
        )})`,
      );
      const files = await tx.$queryRaw<CustomerRequestDetail['files']>(
        Prisma.sql`SELECT f.id,f.name,f.type,f.size,COALESCE(o.name,'-') AS "documentTypeName" FROM customer_files f LEFT JOIN customer_options o ON o.id=f.document_type_id WHERE f.request_id=${rid}::uuid ORDER BY f.created_at,f.id`,
      );
      const duplicates = await tx.$queryRaw<CustomerRequestDetail['duplicates']>(
        Prisma.sql`SELECT c.id,c.code,c.name,CASE WHEN c.details->'fields'->>'taxId'=${fields.taxId ?? ''} AND ${fields.taxId ?? ''}<>'' THEN 'เลขภาษีตรงกัน' WHEN lower(c.name)=lower(${fields.name ?? ''}) THEN 'ชื่อตรงกัน' ELSE 'เบอร์โทรตรงกัน' END AS reason FROM customers c WHERE c.deleted_at IS NULL AND c.id IS DISTINCT FROM ${rest.customerId ?? null}::uuid AND ((${fields.taxId ?? ''}<>'' AND c.details->'fields'->>'taxId'=${fields.taxId ?? ''}) OR lower(c.name)=lower(${fields.name ?? ''}) OR (${fields.phone ?? ''}<>'' AND c.phone=${fields.phone ?? ''})) ORDER BY c.code LIMIT 10`,
      );
      const name = (value?: string) => options.find((option) => option.id === value)?.name ?? '';
      return {
        data: {
          ...rest,
          draft: payload,
          creditTermName: name(fields.creditTermId),
          creditStartName: name(fields.creditStartId),
          files,
          duplicates,
        },
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
