import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { paginationQuery, paginationResult } from '@/server/pagination';
import { tableSort } from '@/server/validation/table-sort';
import { ProductError, uuidPattern } from '@/server/validation/products';
import type { ProductDetails, ProductHistoryEntry } from '@/types/api/product-full';

type Snapshot = {
  code?: string;
  name?: string;
  unit?: string;
  salePrice?: string;
  details?: ProductDetails;
};
function fields(snapshot: Snapshot | null, showCost: boolean) {
  const result: Record<string, string> = { ...(snapshot?.details?.fields ?? {}) };
  if (snapshot?.code) result['รหัสสินค้าเต็ม'] = snapshot.code;
  if (!snapshot?.details && snapshot) {
    result['ชื่อสินค้าเต็ม'] = snapshot.name ?? '';
    result['หน่วยสินค้า'] = snapshot.unit ?? '';
    result['ราคาขาย'] = snapshot.salePrice ?? '';
  }
  for (const kind of ['image', 'document'] as const) {
    result[kind === 'image' ? 'รูปสินค้า' : 'เอกสารแนบ'] = (snapshot?.details?.files ?? [])
      .filter((file) => file.kind === kind)
      .map((file) => `${file.name} (${file.id})`)
      .join('\n');
  }
  if (!showCost) delete result['ราคาต้นทุน'];
  return result;
}
export async function productHistory(
  id: string,
  params: URLSearchParams,
  isAdmin: boolean,
  showCost: boolean,
) {
  if (!uuidPattern.test(id)) throw new ProductError('ID ต้องเป็น UUID');
  const { offset, limit } = paginationQuery(params);
  const sort = tableSort(params, ['occurredAt', 'actorName']);
  return readWithConnectionRetry((db) =>
    db.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({ where: { id }, select: { deletedAt: true } });
        if (!product || (!isAdmin && product.deletedAt)) throw new ProductError('ไม่พบสินค้า', 404);
        const where = Prisma.sql`a.action IN ('PRODUCT_CREATED_FULL','PRODUCT_UPDATED_FULL') AND a.after->>'id'=${id.toLowerCase()}`;
        const totals = await tx.$queryRaw<{ total: number }[]>(
          Prisma.sql`SELECT count(*)::int AS total FROM audit_events a WHERE ${where}`,
        );
        const order =
          sort.key === 'actorName'
            ? Prisma.sql`coalesce(u.name,'ระบบ')`
            : Prisma.sql`a.occurred_at`;
        const direction = sort.key && sort.direction === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
        const rows = await tx.$queryRaw<
          {
            id: string;
            occurredAt: Date;
            actorName: string;
            action: string;
            before: Snapshot | null;
            after: Snapshot | null;
          }[]
        >(
          Prisma.sql`SELECT a.id,a.occurred_at AS "occurredAt",coalesce(u.name,'ระบบ') AS "actorName",a.action,a.before,a.after FROM audit_events a LEFT JOIN users u ON u.id=a.actor_user_id WHERE ${where} ORDER BY ${order} ${direction},a.id DESC LIMIT ${limit} OFFSET ${offset}`,
        );
        const data: ProductHistoryEntry[] = rows.map((row) => {
          const before = fields(row.before, showCost),
            after = fields(row.after, showCost);
          return {
            id: row.id,
            occurredAt: row.occurredAt.toISOString(),
            actorName: row.actorName,
            action: row.action,
            changes: [...new Set([...Object.keys(before), ...Object.keys(after)])]
              .filter((key) => (before[key] ?? '') !== (after[key] ?? ''))
              .map((field) => ({ field, before: before[field] ?? '', after: after[field] ?? '' })),
          };
        });
        return { data, pagination: paginationResult(totals[0].total, offset, limit) };
      },
      { isolationLevel: 'RepeatableRead' },
    ),
  );
}
