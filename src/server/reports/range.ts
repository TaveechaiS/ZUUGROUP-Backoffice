import 'server-only';
import { RecordError } from '@/server/validation/records';
import { addDays, bangkokDay, day } from '@/server/operations/domain';

export const likeOf = (search: string) => '%' + search.replace(/[\%_]/g, '\$&') + '%';

export function reportRange(params: URLSearchParams) {
  const today = bangkokDay();
  const from = params.get('from') ? day(params.get('from')) : today.slice(0, 8) + '01';
  const to = params.get('to') ? day(params.get('to')) : today;
  if (to < from) throw new RecordError(400, 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม');
  if (addDays(from, 366) < to) throw new RecordError(400, 'ช่วงวันที่ต้องไม่เกิน 366 วัน');
  return { from, to };
}
