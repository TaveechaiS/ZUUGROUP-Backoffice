import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { RecordError } from '@/server/validation/records';
import { id } from '@/server/operations/domain';

type Scoped = { id: string; roleId: string };

export const territoryCustomers = (userId: string) =>
  Prisma.sql`(SELECT sc.id FROM customers sc JOIN sales_territory_sales sm ON sm.territory_id=sc.territory_id WHERE sm.user_id=${userId}::uuid)`;

export function customerScope(actor: Scoped, customerId: Prisma.Sql) {
  return actor.roleId === 'SALES'
    ? Prisma.sql`AND ${customerId} IN ${territoryCustomers(actor.id)}`
    : Prisma.empty;
}

export async function assertCustomerInScope(
  tx: Prisma.TransactionClient,
  actor: Scoped,
  customerId: string,
) {
  if (actor.roleId !== 'SALES') return;
  const rows = await tx.$queryRaw<{ ok: boolean }[]>(
    Prisma.sql`SELECT ${customerId}::uuid IN ${territoryCustomers(actor.id)} AS ok`,
  );
  if (!rows[0]?.ok) throw new RecordError(403, 'ลูกค้ารายนี้ไม่อยู่ในเขตของคุณ');
}

export function allowRead(actor: { roleId: string }, roles: string[]) {
  if (!roles.includes(actor.roleId)) throw new RecordError(403, 'ไม่มีสิทธิ์ดูข้อมูลนี้');
}

export function salesFilters(
  actor: Scoped,
  params: URLSearchParams,
  territory: Prisma.Sql,
  seller: Prisma.Sql,
) {
  if (actor.roleId === 'SALES') return Prisma.empty;
  const territoryId = params.get('territoryId');
  const sellerId = params.get('sellerId');
  return Prisma.sql`${territoryId ? Prisma.sql`AND ${territory}=${id(territoryId, 'เขตขาย')}::uuid` : Prisma.empty} ${sellerId ? Prisma.sql`AND ${seller}=${id(sellerId, 'ผู้ขาย')}::uuid` : Prisma.empty}`;
}

export async function salesFilterOptions(tx: Prisma.TransactionClient, actor: Scoped) {
  if (actor.roleId === 'SALES') return {};
  const territories = await tx.$queryRaw<{ id: string; name: string }[]>(
    Prisma.sql`SELECT id,name FROM sales_territories WHERE deleted_at IS NULL ORDER BY name,id`,
  );
  const sellers = await tx.$queryRaw<{ id: string; name: string }[]>(
    Prisma.sql`SELECT u.id,u.name FROM users u WHERE EXISTS(SELECT 1 FROM user_roles r WHERE r.user_id=u.id AND r.role_id='SALES') OR EXISTS(SELECT 1 FROM sales_orders so WHERE so.created_by_id=u.id) OR EXISTS(SELECT 1 FROM quotations q WHERE q.created_by_id=u.id) ORDER BY u.name,u.id`,
  );
  return { filters: { territories, sellers } };
}
