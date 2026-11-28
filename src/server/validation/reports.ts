import { RecordError } from './records';
export function inventoryQuery(params: URLSearchParams) {
  const integer = (k: string, d: number, max: number) => {
    const v = params.get(k);
    if (v === null) return d;
    if (!/^\d+$/.test(v) || Number(v) > max || Number(v) < (k === 'limit' ? 1 : 0))
      throw new RecordError(400, `${k} ไม่ถูกต้อง`);
    return Number(v);
  };
  const offset = integer('offset', 0, 100000),
    limit = integer('limit', 10, 100),
    search = params.get('search')?.trim() ?? '';
  if (search.length > 200) throw new RecordError(400, 'คำค้นยาวเกินกำหนด');
  return { offset, limit, search };
}
