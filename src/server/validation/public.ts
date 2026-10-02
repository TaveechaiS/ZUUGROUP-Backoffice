export class PublicApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function publicId(id: string) {
  if (!uuid.test(id)) throw new PublicApiError('ID ต้องเป็น UUID');
  return id;
}

export function publicQuery(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim();
  if ([...search].length > 160) throw new PublicApiError('คำค้นต้องไม่เกิน 160 ตัวอักษร');
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const raw = params.get(key);
    if (raw === null || raw === '') return fallback;
    if (!/^\d+$/.test(raw))
      throw new PublicApiError(`${key} ต้องเป็นจำนวนเต็มตั้งแต่ ${min} ถึง ${max}`);
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      throw new PublicApiError(`${key} ต้องอยู่ระหว่าง ${min} ถึง ${max}`);
    }
    return value;
  };
  return { search, offset: integer('offset', 0, 0, 100000), limit: integer('limit', 10, 1, 50) };
}
