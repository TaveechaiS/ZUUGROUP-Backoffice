export class ResourceQueryError extends Error {
  readonly status = 400;
}

export function resourceQuery(params: URLSearchParams, allowed: readonly string[]) {
  const view = params.get('view');
  const raw = params.get('include');
  const include = raw === null ? [] : raw.split(',');
  if (
    params.getAll('view').length > 1 ||
    params.getAll('include').length > 1 ||
    (view !== null && (!allowed.includes(view) || raw !== null)) ||
    include.some((key) => !allowed.includes(key)) ||
    new Set(include).size !== include.length
  )
    throw new ResourceQueryError('view หรือ include ไม่ถูกต้อง');
  return { view, include };
}

/** Restore/delete accept only their command fields; never silently discard edits. */
export function mutationBody(body: unknown, method: string, allowed: readonly string[]) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ResourceQueryError('ข้อมูลไม่ถูกต้อง');
  const value = body as Record<string, unknown>;
  if (method === 'DELETE' || value.action === 'restore') {
    if (
      (method === 'DELETE' && value.action !== undefined && value.action !== 'delete') ||
      (value.action === 'restore' && method !== 'PATCH') ||
      Object.keys(value).some((key) => key !== 'action' && !allowed.includes(key))
    )
      throw new ResourceQueryError('คำสั่งลบหรือกู้คืนต้องไม่ปะปนข้อมูลแก้ไข');
  } else if (value.action === 'delete') {
    throw new ResourceQueryError('กรุณาใช้ DELETE สำหรับลบข้อมูล');
  }
  return value;
}
