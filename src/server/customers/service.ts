import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { uuidPattern } from '@/server/validation/products';
import { CustomerError } from '@/server/validation/customer-error';
import { CUSTOMER_LIST_STATUSES, LICENSE_WARNING_DAYS } from '@/config/customers';
import type {
  CustomerDetailResponse,
  CustomerListResponse,
  CustomerListRow,
} from '@/types/api/customers';

const db = () => getPrismaClient();
const rowColumns = Prisma.sql`c.id,c.code,c.name,c.province,c.contact_name AS "contactName",c.phone,c.status,c.license_status AS "licenseStatus",to_char(c.license_expires_at,'YYYY-MM-DD') AS "licenseExpiresAt",c.credit_days AS "creditDays",ct.name AS "creditTermName",c.credit_limit::text AS "creditLimit",c.territory_id AS "territoryId",t.name AS "territoryName",c.deleted_at AS "deletedAt",c.delete_reason AS "deleteReason"`;
const joins = Prisma.sql`FROM customers c LEFT JOIN sales_territories t ON t.id=c.territory_id LEFT JOIN customer_options ct ON ct.id=c.credit_term_id`;

// Matches customerListStatus(): the filter returns exactly the rows showing that badge.
const today = Prisma.sql`(now() AT TIME ZONE 'Asia/Bangkok')::date`;
function statusFilter(status: string) {
  if (!status) return Prisma.empty;
  if (status === 'ใบอนุญาตหมดอายุ')
    return Prisma.sql`AND c.status='ใช้งาน' AND c.license_expires_at < ${today}`;
  if (status === 'ใบอนุญาตใกล้หมดอายุ')
    return Prisma.sql`AND c.status='ใช้งาน' AND c.license_expires_at BETWEEN ${today} AND ${today} + ${LICENSE_WARNING_DAYS}::int`;
  if (status === 'ใช้งาน')
    return Prisma.sql`AND c.status='ใช้งาน' AND (c.license_expires_at IS NULL OR c.license_expires_at > ${today} + ${LICENSE_WARNING_DAYS}::int)`;
  return Prisma.sql`AND c.status=${status}`;
}

function integer(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || Number(value) > max)
    throw new CustomerError('จำนวนรายการหรือหน้าไม่ถูกต้อง');
  return Number(value);
}

export async function listCustomers(
  params: URLSearchParams,
  canWrite: boolean,
  scope: { id: string; roleId: string } = { id: '', roleId: 'ADMIN' },
): Promise<CustomerListResponse> {
  const allowed = new Set([
    'search',
    'territoryId',
    'groupId',
    'province',
    'licenseStatus',
    'status',
    'deleted',
    'limit',
    'offset',
    'sortBy',
    'sortDirection',
    'include',
  ]);
  if ([...params.keys()].some((key) => !allowed.has(key)))
    throw new CustomerError('ตัวกรองไม่รองรับ');
  const limit = integer(params.get('limit'), 10, 100);
  const offset = integer(params.get('offset'), 0, 1000000);
  if (!limit) throw new CustomerError('จำนวนรายการต้องมากกว่า 0');
  const search = (params.get('search') ?? '').normalize('NFKC').trim();
  if (search.length > 160) throw new CustomerError('คำค้นยาวเกินไป');
  const pattern = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
  const territoryId = params.get('territoryId') ?? '';
  if (territoryId && !uuidPattern.test(territoryId)) throw new CustomerError('เขตขายไม่ถูกต้อง');
  const groupId = params.get('groupId') ?? '';
  if (groupId && !uuidPattern.test(groupId)) throw new CustomerError('กลุ่มลูกค้าไม่ถูกต้อง');
  const province = (params.get('province') ?? '').trim();
  // An empty license result is shown and filtered as ยังไม่ระบุ.
  const licenseStatus = (params.get('licenseStatus') ?? '').trim();
  if (licenseStatus.length > 160) throw new CustomerError('สถานะไม่ถูกต้อง');
  if (province.length > 120) throw new CustomerError('จังหวัดไม่ถูกต้อง');
  const status = params.get('status') ?? '';
  if (status && !(CUSTOMER_LIST_STATUSES as readonly string[]).includes(status))
    throw new CustomerError('สถานะลูกค้าไม่ถูกต้อง');
  const deleted = params.get('deleted') ?? 'false';
  if (!['true', 'false'].includes(deleted)) throw new CustomerError('ตัวกรองไม่ถูกต้อง');
  if (deleted === 'true' && !canWrite) throw new CustomerError('ไม่มีสิทธิ์ดูลูกค้าที่ลบแล้ว', 403);
  const include = (params.get('include') ?? '').split(',').filter(Boolean);
  if (include.some((part) => !['filters', 'config'].includes(part)))
    throw new CustomerError('include ไม่รองรับ');
  let order: Prisma.Sql;
  try {
    order = sqlTableOrder(
      params,
      {
        code: Prisma.sql`c.code`,
        name: Prisma.sql`c.name`,
        contactName: Prisma.sql`c.contact_name`,
        licenseStatus: Prisma.sql`c.license_status`,
        status: Prisma.sql`c.status`,
        creditDays: Prisma.sql`c.credit_days`,
        province: Prisma.sql`c.province`,
        territoryName: Prisma.sql`t.name`,
      },
      Prisma.sql`c.created_at DESC,c.id`,
      Prisma.sql`c.code,c.id`,
    );
  } catch {
    throw new CustomerError('คอลัมน์หรือทิศทางเรียงข้อมูลไม่ถูกต้อง');
  }
  // Only customers created through the full form are listed; legacy rows have no details.
  const where = Prisma.sql`${deleted === 'true' ? Prisma.sql`c.deleted_at IS NOT NULL` : Prisma.sql`c.deleted_at IS NULL`} AND c.details IS NOT NULL
    ${statusFilter(status)}
    ${territoryId ? Prisma.sql`AND c.territory_id=${territoryId}::uuid` : Prisma.empty}
    ${groupId ? Prisma.sql`AND c.group_id=${groupId}::uuid` : Prisma.empty}
    ${customerScope(scope, Prisma.sql`c.id`)}
    ${province ? Prisma.sql`AND c.province=${province}` : Prisma.empty}
    ${licenseStatus ? Prisma.sql`AND (c.license_status=${licenseStatus} OR (${licenseStatus}='ยังไม่ระบุ' AND c.license_status=''))` : Prisma.empty}
    ${search ? Prisma.sql`AND (c.code ILIKE ${pattern} OR c.name ILIKE ${pattern} OR c.province ILIKE ${pattern} OR c.contact_name ILIKE ${pattern} OR c.phone ILIKE ${pattern} OR coalesce(t.name,'') ILIKE ${pattern})` : Prisma.empty}`;
  return db().$transaction(
    async (tx) => {
      const data = await tx.$queryRaw<CustomerListRow[]>(
        Prisma.sql`SELECT ${rowColumns} ${joins} WHERE ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
      );
      const count = await tx.$queryRaw<{ total: number }[]>(
        Prisma.sql`SELECT count(*)::int AS total ${joins} WHERE ${where}`,
      );
      const result: CustomerListResponse = {
        data,
        pagination: { total: count[0].total, limit, offset },
      };
      if (include.includes('filters')) {
        const provinces = await tx.$queryRaw<{ province: string }[]>(
          Prisma.sql`SELECT DISTINCT province FROM customers WHERE deleted_at IS NULL AND details IS NOT NULL AND province<>'' ${customerScope(scope, Prisma.sql`id`)} ORDER BY province`,
        );
        const territories = await tx.$queryRaw<{ id: string; name: string }[]>(
          Prisma.sql`SELECT id,name FROM sales_territories WHERE deleted_at IS NULL ${scope.roleId === 'SALES' ? Prisma.sql`AND id IN (SELECT territory_id FROM sales_territory_sales WHERE user_id=${scope.id}::uuid)` : Prisma.empty} ORDER BY name,id`,
        );
        const groups = await tx.$queryRaw<{ id: string; name: string }[]>(
          Prisma.sql`SELECT id,COALESCE(NULLIF(name,''),code) AS name FROM customer_groups WHERE deleted_at IS NULL ORDER BY 2,id`,
        );
        const statuses = await tx.$queryRaw<{ status: string }[]>(
          Prisma.sql`SELECT DISTINCT CASE WHEN license_status='' THEN 'ยังไม่ระบุ' ELSE license_status END AS status FROM customers WHERE deleted_at IS NULL AND details IS NOT NULL ${customerScope(scope, Prisma.sql`id`)} ORDER BY 1`,
        );
        result.filters = {
          provinces: provinces.map((row) => row.province),
          territories,
          groups,
          licenseStatuses: statuses.map((row) => row.status),
        };
      }
      if (include.includes('config')) result.config = { canWrite };
      return result;
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

export async function customerDetail(
  id: string,
  canWrite: boolean,
  includeDeleted = false,
  scope: { id: string; roleId: string } = { id: '', roleId: 'ADMIN' },
): Promise<CustomerDetailResponse> {
  if (includeDeleted && !canWrite) throw new CustomerError('ไม่มีสิทธิ์ดูลูกค้าที่ลบแล้ว', 403);
  if (!uuidPattern.test(id)) throw new CustomerError('ไม่พบลูกค้า', 404);
  const rows = await db().$queryRaw<CustomerDetailResponse['data'][]>(
    Prisma.sql`SELECT ${rowColumns},c.sequence,c.details,c.created_at AS "createdAt",c.updated_at AS "updatedAt",
      CASE WHEN g.id IS NULL THEN NULL ELSE jsonb_build_object('id',g.id,'code',g.code,'name',g.name) END AS "codeGroup",
      CASE WHEN ct.id IS NULL THEN NULL ELSE jsonb_build_object('id',ct.id,'name',ct.name,'days',ct.days) END AS "creditTerm",
      (SELECT jsonb_build_object('id',s.id,'name',s.name) FROM customer_options s WHERE s.id=NULLIF(c.details->'fields'->>'creditStartId','')::uuid) AS "creditStart"
      ${joins} LEFT JOIN customer_options g ON g.id=c.code_group_id
      WHERE c.id=${id}::uuid ${includeDeleted ? Prisma.empty : Prisma.sql`AND c.deleted_at IS NULL`} AND c.details IS NOT NULL ${customerScope(scope, Prisma.sql`c.id`)}`,
  );
  if (!rows[0]) throw new CustomerError('ไม่พบลูกค้า', 404);
  // Creator and latest editor come from the audit trail written by the save/delete/restore actions.
  const history = await db().$queryRaw<
    { action: string; occurredAt: Date; actorName: string | null }[]
  >(
    Prisma.sql`SELECT a.action,a.occurred_at AS "occurredAt",u.name AS "actorName" FROM audit_events a LEFT JOIN users u ON u.id=a.actor_user_id WHERE a.action IN ('CUSTOMER_CREATED_FULL','CUSTOMER_UPDATED_FULL','CUSTOMER_DELETED','CUSTOMER_RESTORED') AND a.after->>'id'=${id} ORDER BY a.occurred_at,a.id`,
  );
  const created = history.find((entry) => entry.action === 'CUSTOMER_CREATED_FULL');
  const latest = history.at(-1);
  return {
    data: {
      ...rows[0],
      history: {
        createdBy: created?.actorName ?? null,
        updatedBy: latest?.actorName ?? null,
        updatedAt: latest?.occurredAt.toISOString() ?? null,
      },
    },
    config: { canWrite },
  };
}

export async function nextCustomerSequence(codeGroupId: string) {
  if (!uuidPattern.test(codeGroupId)) throw new CustomerError('กรุณาเลือกกลุ่มรหัสลูกค้า');
  const group = await db().$queryRaw<{ id: string }[]>(
    Prisma.sql`SELECT id FROM customer_options WHERE id=${codeGroupId}::uuid AND kind='codeGroup' AND active`,
  );
  if (!group[0]) throw new CustomerError('กลุ่มรหัสถูกปิดหรือไม่พบ กรุณาเลือกใหม่', 409);
  const rows = await db().$queryRaw<{ number: number }[]>(
    Prisma.sql`SELECT coalesce(max(sequence),0)+1 AS number FROM customers WHERE code_group_id=${codeGroupId}::uuid`,
  );
  if (rows[0].number > 999999) throw new CustomerError('เลขรันในกลุ่มนี้เต็มแล้ว', 409);
  return String(rows[0].number).padStart(4, '0');
}

// Soft delete keeps the row (and its code) so documents that reference it stay valid.
export async function deleteCustomer(id: string, body: unknown, actorId: string) {
  if (!uuidPattern.test(id)) throw new CustomerError('ไม่พบลูกค้า', 404);
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (!reason || [...reason].length > 500)
    throw new CustomerError('กรุณาระบุเหตุผลการลบไม่เกิน 500 ตัวอักษร');
  return db().$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; code: string }[]>(
      Prisma.sql`UPDATE customers SET deleted_at=clock_timestamp(),deleted_by_id=${actorId}::uuid,delete_reason=${reason},updated_at=clock_timestamp() WHERE id=${id}::uuid AND deleted_at IS NULL AND details IS NOT NULL RETURNING id,code`,
    );
    if (!rows[0]) throw new CustomerError('ไม่พบลูกค้า หรือถูกลบไปแล้ว', 404);
    await tx.auditEvent.create({
      data: {
        actorUserId: actorId,
        actorRole: 'ADMIN',
        action: 'CUSTOMER_DELETED',
        requestId: randomUUID(),
        after: { id: rows[0].id, code: rows[0].code, reason },
      },
    });
    return rows[0];
  });
}

export async function restoreCustomer(id: string, actorId: string) {
  if (!uuidPattern.test(id)) throw new CustomerError('ไม่พบลูกค้า', 404);
  return db().$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; code: string }[]>(
      Prisma.sql`UPDATE customers SET deleted_at=NULL,deleted_by_id=NULL,delete_reason=NULL,updated_at=clock_timestamp() WHERE id=${id}::uuid AND deleted_at IS NOT NULL AND details IS NOT NULL RETURNING id,code`,
    );
    if (!rows[0]) throw new CustomerError('ไม่พบลูกค้าที่ลบแล้ว', 404);
    await tx.auditEvent.create({
      data: {
        actorUserId: actorId,
        actorRole: 'ADMIN',
        action: 'CUSTOMER_RESTORED',
        requestId: randomUUID(),
        after: { id: rows[0].id, code: rows[0].code },
      },
    });
    return rows[0];
  });
}
