export class PaginationError extends Error {
  readonly status = 400;
}
export function paginationQuery(params: URLSearchParams) {
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < min || value > max)
      throw new PaginationError(`${key} ต้องเป็นจำนวนเต็ม ${min}–${max}`);
    return value;
  };
  return { offset: integer('offset', 0, 0, 100000), limit: integer('limit', 10, 1, 100) };
}
export function queryText(params: URLSearchParams, key: string, max = 160) {
  const value = (params.get(key) ?? '').trim();
  if (value.length > max) throw new PaginationError(`${key} ยาวเกิน ${max} ตัวอักษร`);
  return value;
}
export function queryChoice(
  params: URLSearchParams,
  key: string,
  choices: readonly string[],
  fallback = '',
) {
  const value = params.get(key) ?? fallback;
  if (!choices.includes(value)) throw new PaginationError(`${key} ไม่ถูกต้อง`);
  return value;
}
