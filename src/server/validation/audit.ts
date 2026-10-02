import { PaginationError, paginationQuery, queryText } from './pagination';
export function auditQuery(params: URLSearchParams) {
  const { offset, limit } = paginationQuery(params);
  const q = queryText(params, 'q', 100);
  const action = queryText(params, 'action', 100);
  if (action && !/^[A-Za-z0-9_.:-]+$/.test(action)) throw new PaginationError('action ไม่ถูกต้อง');
  return { offset, limit, q, action };
}
