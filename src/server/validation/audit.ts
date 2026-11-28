import { addDays, day } from './dates';
import { RecordError } from '@/server/validation/records';
import { PaginationError, paginationQuery, queryText } from './pagination';
export function auditQuery(params: URLSearchParams) {
  const { offset, limit } = paginationQuery(params);
  const q = queryText(params, 'q', 100);
  const action = queryText(params, 'action', 100);
  if (action && !/^[A-Za-z0-9_.:-]+$/.test(action)) throw new PaginationError('action ไม่ถูกต้อง');
  const from = params.get('from') ? day(params.get('from')) : '';
  const to = params.get('to') ? day(params.get('to')) : '';
  if (from && to && to < from) throw new RecordError(400, 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม');
  const occurredAt = {
    ...(from ? { gte: new Date(from + 'T00:00:00+07:00') } : {}),
    ...(to ? { lt: new Date(addDays(to, 1) + 'T00:00:00+07:00') } : {}),
  };
  return { offset, limit, q, action, occurredAt };
}
