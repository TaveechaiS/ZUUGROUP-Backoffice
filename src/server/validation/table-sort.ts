import { RecordError } from './records';
import { Prisma } from '@/generated/prisma/client';
export function tableSort(params: URLSearchParams, allowed: readonly string[]) {
  const key = params.get('sortBy') ?? '';
  const direction = params.get('sortDirection') ?? 'asc';
  if (
    params.getAll('sortBy').length > 1 ||
    params.getAll('sortDirection').length > 1 ||
    (key && !allowed.includes(key)) ||
    !['asc', 'desc'].includes(direction)
  )
    throw new RecordError(400, 'คอลัมน์หรือทิศทางเรียงข้อมูลไม่ถูกต้อง');
  return { key, direction: direction as 'asc' | 'desc' };
}
export function sqlTableOrder(
  params: URLSearchParams,
  columns: Record<string, Prisma.Sql>,
  fallback: Prisma.Sql,
  tie: Prisma.Sql,
) {
  const sort = tableSort(params, Object.keys(columns));
  return sort.key
    ? Prisma.sql`${columns[sort.key]} ${sort.direction === 'asc' ? Prisma.sql`ASC NULLS LAST` : Prisma.sql`DESC NULLS LAST`},${tie}`
    : fallback;
}
