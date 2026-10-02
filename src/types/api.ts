/** Shared response shapes only. Endpoints and page data flows live in their routes. */
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  offset: number;
  limit: number;
};

/** Records/public endpoints use hasMore; preserve this separate wire shape. */
export type OffsetPagination = { offset: number; limit: number; total: number; hasMore: boolean };
export type DataResponse<T> = { data: T };
export type ApiErrorResponse = { error: string | { message: string } };
export type OkResponse = { ok: true };
export type ListQuery = { limit?: number; offset?: number; search?: string };
