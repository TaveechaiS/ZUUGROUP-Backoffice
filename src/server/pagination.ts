export {
  PaginationError,
  paginationQuery,
  queryText,
  queryChoice,
} from '@/server/validation/pagination';
import type { Pagination } from '@/types/api';
export function paginationResult(total: number, offset: number, limit: number): Pagination {
  return {
    total,
    offset,
    limit,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
