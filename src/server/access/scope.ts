import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { RecordError } from '@/server/validation/records';

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
