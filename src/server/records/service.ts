import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient, readWithConnectionRetry } from '@/server/db/prisma';
import {
  moduleFor,
  RECORD_MODULES,
  type RecordModule,
  type RecordRow,
} from '@/features/records/types';
export class RecordError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const snake = (key: string) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
// All identifiers originate in our static module registry. Values are bound parameters.
const column = (key: string) => Prisma.raw('"' + snake(key) + '"');
const table = (module: RecordModule) => Prisma.raw('"' + module.table + '"');
const select = (m: RecordModule) =>
  Prisma.join(
    [...['id', ...m.fields.map((f) => f.key), 'createdAt', 'updatedAt', 'deletedAt'].map(
      (key) => Prisma.sql`${column(key)} AS ${Prisma.raw('"' + key + '"')}`,
    ),...(m.key==='customer-groups'||m.key==='sales-territories'?[Prisma.sql`(SELECT count(*)::int FROM customers c WHERE ${Prisma.raw(m.key==='customer-groups'?'c.group_id':'c.territory_id')}=${table(m)}.id AND c.deleted_at IS NULL) AS "memberCount"`]:[])],
  );
type DbRow = Record<string, unknown> & {
  id: string;
  code: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
export function recordModule(key: string) {
  const m = moduleFor(key);
  if (!m) throw new RecordError(404, 'ไม่พบโมดูล');
  return m;
}
const uuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
function output(m: RecordModule, row: DbRow): RecordRow {
  const value = (key: string | null) => (key ? String(row[key] ?? '') : '');
  const [type, detail, owner, valueKey] = m.display;
  const fields = Object.fromEntries(
    m.fields.map((f) => [f.key, row[f.key] === null ? null : String(row[f.key] ?? '')]),
  );
  return {
    id: row.id,
    ref: row.code,
    title: row.name,
    subtitle: [value(type), value(detail)].filter(Boolean).join(' · '),
    owner: value(owner),
    value:
      row.memberCount !== undefined ? `${row.memberCount} ราย` : valueKey === 'amount'
        ? row.amount === null
          ? '—'
          : new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(
              Number(row.amount),
            )
        : value(valueKey),
    status: row.status,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    fields,
  };
}
function text(params: URLSearchParams, key: string) {
  const v = (params.get(key) ?? '').trim();
  if (v.length > 200) throw new RecordError(400, `${key} ยาวเกิน 200 ตัวอักษร`);
  return v;
}
function integer(params: URLSearchParams, key: string, fallback: number, min: number, max: number) {
  const v = params.get(key);
  if (v === null) return fallback;
  if (!/^\d+$/.test(v) || !Number.isSafeInteger(Number(v)) || Number(v) < min || Number(v) > max)
    throw new RecordError(400, `${key} ต้องเป็นจำนวนเต็ม ${min}–${max}`);
  return Number(v);
}
function predicate(m: RecordModule, params: URLSearchParams) {
  const removed = params.get('deleted') ?? 'false';
  if (!['false', 'true'].includes(removed))
    throw new RecordError(400, 'deleted ต้องเป็น true หรือ false');
  const clauses: Prisma.Sql[] = [
    removed === 'true' ? Prisma.sql`deleted_at IS NOT NULL` : Prisma.sql`deleted_at IS NULL`,
  ];
  const search = text(params, 'search');
  if (search) {
    const fields = m.fields.filter((f) => f.type !== 'number' && !f.relation);
    const like = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
    clauses.push(
      Prisma.sql`(${Prisma.join(
        fields.map((f) => Prisma.sql`${column(f.key)} ILIKE ${like}`),
        ' OR ',
      )})`,
    );
  }
  for (const [param, key] of [
    ['status', 'status'],
    ['owner', m.display[2]],
    ['type', m.display[0]],
    ['category', m.display[0]],
    ['detail', m.display[1]],
  ] as const) {
    const v = text(params, param);
    if (v && key) clauses.push(Prisma.sql`${column(key)}=${v}`);
  }
  for (const f of m.fields.filter((f) => f.relation)) {
    const v = text(params, f.key);
    if (v) {
      if (!uuid(v)) throw new RecordError(400, `${f.label} ต้องเป็น UUID`);
      clauses.push(Prisma.sql`${column(f.key)}=${v}::uuid`);
    }
  }
  return Prisma.join(clauses, ' AND ');
}
export async function recordList(m: RecordModule, params: URLSearchParams) {
  const offset = integer(params, 'offset', 0, 0, 100000),
    limit = integer(params, 'limit', 10, 1, 50),
    where = predicate(m, params);
  return readWithConnectionRetry(async (db) => {
    const [rows, counts] = await db.$transaction(
      [
        db.$queryRaw<DbRow[]>(
          Prisma.sql`SELECT ${select(m)} FROM ${table(m)} WHERE ${where} ORDER BY created_at DESC,id ASC OFFSET ${offset} LIMIT ${limit}`,
        ),
        db.$queryRaw<{ total: number }[]>(
          Prisma.sql`SELECT count(*)::int total FROM ${table(m)} WHERE ${where}`,
        ),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    const total = counts[0].total;
    return {
      data: rows.map((r) => output(m, r)),
      pagination: { offset, limit, total, hasMore: offset + rows.length < total },
    };
  });
}
export async function recordDetail(m: RecordModule, id: string, includeDeleted = false) {
  if (id.length > 200) throw new RecordError(400, 'รหัสยาวเกินกำหนด');
  const match = uuid(id) ? Prisma.sql`id=${id}::uuid OR code=${id}` : Prisma.sql`code=${id}`;
  const rows = await readWithConnectionRetry((db) =>
    db.$queryRaw<DbRow[]>(
      Prisma.sql`SELECT ${select(m)} FROM ${table(m)} WHERE (${match}) ${includeDeleted ? Prisma.empty : Prisma.sql`AND deleted_at IS NULL`} LIMIT 1`,
    ),
  );
  if (!rows[0]) {
    const mapping = uuid(id)
      ? await readWithConnectionRetry((db) =>
          db.recordImportMap.findUnique({ where: { sourceId: id } }),
        )
      : null;
    if (mapping?.entity === m.key && mapping.recordId !== id)
      return recordDetail(m, mapping.recordId, includeDeleted);
    throw new RecordError(404, 'ไม่พบรายการ');
  }
  return { data: output(m, rows[0]) };
}
export async function recordFilters(m: RecordModule) {
  const groups = await Promise.all(
    ['status', m.display[2], m.display[0], m.display[1]].map((key) =>
      key
        ? readWithConnectionRetry((db) =>
            db.$queryRaw<{ value: string }[]>(
              Prisma.sql`SELECT DISTINCT ${column(key)} AS value FROM ${table(m)} WHERE deleted_at IS NULL AND ${column(key)}<>'' ORDER BY value`,
            ),
          )
        : Promise.resolve([]),
    ),
  );
  return {
    data: {
      statuses: groups[0].map((r) => r.value),
      owners: groups[1].map((r) => r.value),
      types: groups[2].map((r) => r.value),
      details: groups[3].map((r) => r.value),
    },
  };
}
export async function recordOptions(m: RecordModule, params: URLSearchParams) {
  const rows = await recordList(m, params);
  return {
    data: rows.data.map((r) => ({ id: r.id, code: r.ref, name: r.title })),
    pagination: rows.pagination,
  };
}
export async function recordConfig(m: RecordModule, canWrite: boolean) {
  const counts = await readWithConnectionRetry((db) =>
    db.$queryRaw<{ total: number }[]>(
      Prisma.sql`SELECT count(*)::int total FROM ${table(m)} WHERE deleted_at IS NULL`,
    ),
  );
  return {
    data: {
      ...m,
      canWrite,
      metrics: [{ label: 'รายการทั้งหมด', value: String(counts[0].total), note: 'รายการในระบบ' }],
    },
  };
}
type Actor = { id: string; roleId: string };
function cleanBody(m: RecordModule, body: unknown, partial: boolean) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new RecordError(400, 'กรุณาส่ง JSON object');
  const input = body as Record<string, unknown>;
  const allowed = new Set([...m.fields.map((f) => f.key), 'expectedUpdatedAt']);
  if (Object.keys(input).some((k) => !allowed.has(k)))
    throw new RecordError(400, 'มีฟิลด์ที่ไม่รองรับ');
  const values: Record<string, string | null> = {};
  for (const f of m.fields) {
    if (!(f.key in input) && partial) continue;
    const raw = input[f.key] ?? '';
    if (typeof raw !== 'string' && typeof raw !== 'number')
      throw new RecordError(400, `${f.label} ไม่ถูกต้อง`);
    const v = String(raw).trim();
    if (v.length > (f.type === 'textarea' ? 4000 : 500))
      throw new RecordError(400, `${f.label} ยาวเกินกำหนด`);
    if (f.required && !v) throw new RecordError(400, `กรุณากรอก${f.label}`);
    if (f.type === 'number' && v && !/^\d{1,12}(\.\d{1,2})?$/.test(v))
      throw new RecordError(400, `${f.label} ต้องเป็นจำนวนไม่ติดลบและทศนิยมไม่เกิน 2 หลัก`);
    if (f.relation && v && !uuid(v))
      throw new RecordError(400, `${f.label} ต้องเป็น ID ที่ถูกต้อง`);
    if (f.key === 'fileUrl' && v) {
      try {
        const u = new URL(v);
        if (!['https:', 'http:'].includes(u.protocol)) throw new Error();
      } catch {
        throw new RecordError(400, 'ลิงก์ไฟล์ต้องเป็น http หรือ https');
      }
    }
    values[f.key] = (f.type === 'number' || f.relation) && !v ? null : v;
  }
  if (!Object.keys(values).length) throw new RecordError(400, 'ไม่มีข้อมูลที่แก้ไข');
  if (
    'expectedUpdatedAt' in input &&
    (typeof input.expectedUpdatedAt !== 'string' ||
      Number.isNaN(Date.parse(input.expectedUpdatedAt)))
  )
    throw new RecordError(400, 'expectedUpdatedAt ไม่ถูกต้อง');
  return { values, expected: input.expectedUpdatedAt as string | undefined };
}
export async function recordWrite(
  m: RecordModule,
  action: 'create' | 'update' | 'delete' | 'restore',
  id: string | null,
  body: unknown,
  actor: Actor,
) {
  const parsed =
    action === 'create' || action === 'update' ? cleanBody(m, body, action === 'update') : null;
  if (id && !uuid(id)) throw new RecordError(400, 'ID ต้องเป็น UUID');
  const deleteBody =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const reason = String(deleteBody.reason ?? '').trim();
  if (reason.length > 1000) throw new RecordError(400, 'เหตุผลยาวเกินกำหนด');
  try {
    return await getPrismaClient().$transaction(async (tx) => {
      let before: DbRow | null = null;
      if (id) {
        const locked = await tx.$queryRaw<DbRow[]>(
          Prisma.sql`SELECT ${select(m)} FROM ${table(m)} WHERE id=${id}::uuid FOR UPDATE`,
        );
        before = locked[0] ?? null;
        if (!before) throw new RecordError(404, 'ไม่พบรายการ');
        if (action !== 'restore' && before.deletedAt) throw new RecordError(409, 'รายการถูกลบแล้ว');
        if (action === 'restore' && !before.deletedAt)
          throw new RecordError(409, 'รายการยังไม่ถูกลบ');
        if (
          parsed?.expected &&
          before.updatedAt.toISOString() !== new Date(parsed.expected).toISOString()
        )
          throw new RecordError(409, 'ข้อมูลถูกแก้ไขแล้ว กรุณาเปิดรายการใหม่');
      }
      if (parsed)
        for (const f of m.fields.filter((f) => f.relation)) {
          const value = parsed.values[f.key];
          if (value) {
            const t =
              f.relation === 'warehouses' ? { table: 'warehouses' } : recordModule(f.relation!);
            const active =
              f.relation === 'warehouses' ? Prisma.empty : Prisma.sql`AND deleted_at IS NULL`;
            const found = await tx.$queryRaw<{ id: string }[]>(
              Prisma.sql`SELECT id FROM ${Prisma.raw('"' + t.table + '"')} WHERE id=${value}::uuid ${active} FOR KEY SHARE`,
            );
            if (!found.length) throw new RecordError(400, `${f.label} ไม่มีหรือถูกลบแล้ว`);
          }
        }
      let rows: DbRow[];
      if (action === 'create') {
        const entries = Object.entries(parsed!.values);
        const vals = entries.map(([k, v]) =>
          moduleFor(m.key)!.fields.find((f) => f.key === k)?.relation
            ? Prisma.sql`${v}::uuid`
            : moduleFor(m.key)!.fields.find((f) => f.key === k)?.type === 'number'
              ? Prisma.sql`${v}::numeric`
              : Prisma.sql`${v}`,
        );
        rows = await tx.$queryRaw<DbRow[]>(
          Prisma.sql`INSERT INTO ${table(m)} (${Prisma.join(entries.map(([k]) => column(k)))}) VALUES (${Prisma.join(vals)}) RETURNING ${select(m)}`,
        );
      } else {
        const setters =
          action === 'update'
            ? Object.entries(parsed!.values).map(([k, v]) => {
                const f = m.fields.find((f) => f.key === k)!;
                return f.relation
                  ? Prisma.sql`${column(k)}=${v}::uuid`
                  : f.type === 'number'
                    ? Prisma.sql`${column(k)}=${v}::numeric`
                    : Prisma.sql`${column(k)}=${v}`;
              })
            : action === 'delete'
              ? [
                  Prisma.sql`deleted_at=now(),deleted_by_id=${actor.id}::uuid,delete_reason=${reason || null}`,
                ]
              : [Prisma.sql`deleted_at=NULL,deleted_by_id=NULL,delete_reason=NULL`];
        rows = await tx.$queryRaw<DbRow[]>(
          Prisma.sql`UPDATE ${table(m)} SET ${Prisma.join([...setters, Prisma.sql`updated_at=clock_timestamp()`])} WHERE id=${id}::uuid RETURNING ${select(m)}`,
        );
      }
      const after = output(m, rows[0]);
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: actor.roleId,
          action: `${m.key}.${action}`,
          requestId: crypto.randomUUID(),
          schemaVersion: 1,
          ...(before ? { before: JSON.parse(JSON.stringify(output(m, before))) } : {}),
          after: JSON.parse(JSON.stringify(after)),
        },
      });
      return { data: after };
    });
  } catch (e) {
    if (e instanceof RecordError) throw e;
    const error = e as { code?: string; meta?: { code?: string } };
    if (error.code === 'P2002' || error.meta?.code === '23505')
      throw new RecordError(409, 'รหัส / เลขอ้างอิงนี้มีอยู่แล้ว');
    if (error.code === 'P2003' || error.meta?.code === '23503')
      throw new RecordError(409, 'ข้อมูลที่อ้างอิงไม่พร้อมใช้งาน');
    throw e;
  }
}
export async function recordCatalog() {
  return {
    data: RECORD_MODULES.map((m) => ({
      key: m.key,
      title: m.title,
      list: '/api/' + m.key,
      detail: '/api/' + m.key + '/{id}',
      filters: '/api/' + m.key + '/filters',
    })),
  };
}
