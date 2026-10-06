export function warehouseQuery(params: URLSearchParams) {
  const offset = Number(params.get('offset') ?? 0),
    limit = Number(params.get('limit') ?? 10),
    search = params.get('search')?.trim() ?? '';
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > 100000 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    search.length > 200
  )
    return null;
  return { offset, limit, search };
}
