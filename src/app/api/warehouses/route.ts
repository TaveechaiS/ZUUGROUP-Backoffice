import { resourceQuery } from '@/server/validation/resource-api';
import { warehouseQuery } from '@/server/validation/warehouses';
import { readWithConnectionRetry } from '@/server/db/prisma';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  let withOptions = false;
  try {
    const parts = resourceQuery(new URL(request.url).searchParams, ['options']);
    withOptions = parts.include.includes('options');
  } catch (e) {
    return Response.json(
      { error: { message: e instanceof Error ? e.message : 'Params ไม่ถูกต้อง' } },
      { status: 400 },
    );
  }
  const query = warehouseQuery(new URL(request.url).searchParams);
  if (!query) return Response.json({ error: { message: 'Params ไม่ถูกต้อง' } }, { status: 400 });
  const { offset, limit, search } = query;
  try {
    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const result = await readWithConnectionRetry(async (db) => {
      const [data, total] = await Promise.all([
        db.warehouse.findMany({
          where,
          select: { id: true, code: true, name: true },
          orderBy: { code: 'asc' },
          skip: offset,
          take: limit,
        }),
        db.warehouse.count({ where }),
      ]);
      return { data, pagination: { offset, limit, total, hasMore: offset + data.length < total } };
    });
    return Response.json(
      { ...result, ...(withOptions ? { options: result } : {}) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ error: { message: 'โหลดคลังไม่สำเร็จ' } }, { status: 503 });
  }
}
