import {
  RecordError,
  uuid,
  text,
  integer,
  cleanBody,
  recordReason,
} from '@/server/validation/records';
export { RecordError } from '@/server/validation/records';
import type {
  RecordListResponse,
  RecordDetailResponse,
  RecordOptionsResponse,
  RecordFiltersResponse,
  RecordConfigResponse,
} from '@/types/api/records';
import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient, readWithConnectionRetry } from '@/server/db/prisma';
import { moduleFor, RECORD_MODULES } from '@/features/records/types';
import type { RecordModule, RecordRow } from '@/types/api/records';
const snake = (key: string) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
// All identifiers originate in our static module registry. Values are bound parameters.
const column = (key: string) => Prisma.raw('"' + snake(key) + '"');
const table = (module: RecordModule) => Prisma.raw('"' + module.table + '"');
const select = (m: RecordModule) =>
  Prisma.join([
    ...['id', ...m.fields.map((f) => f.key), 'createdAt', 'updatedAt', 'deletedAt'].map(
      (key) => Prisma.sql`${column(key)} AS ${Prisma.raw('"' + key + '"')}`,
    ),
    ...(m.key === 'customer-groups' || m.key === 'sales-territories'
      ? [
          Prisma.sql`(SELECT count(*)::int FROM customers c WHERE ${Prisma.raw(m.key === 'customer-groups' ? 'c.group_id' : 'c.territory_id')}=${table(m)}.id AND c.deleted_at IS NULL) AS "memberCount"`,
        ]
      : []),
    ...(m.key === 'sales-territories'
      ? [
          Prisma.sql`(SELECT name FROM users WHERE id=sales_territories.manager_id) AS "managerName"`,
          Prisma.sql`(SELECT name FROM users WHERE id=sales_territories.sales_id) AS "salesName"`,
        ]
      : []),
    ...(m.key === 'customers'
      ? [
          Prisma.sql`(SELECT name FROM sales_territories WHERE id=customers.territory_id) AS "territoryName"`,
          Prisma.sql`(SELECT u.name FROM users u JOIN sales_territories t ON t.manager_id=u.id WHERE t.id=customers.territory_id) AS "managerName"`,
          Prisma.sql`(SELECT u.name FROM users u JOIN sales_territories t ON t.sales_id=u.id WHERE t.id=customers.territory_id) AS "salesName"`,
        ]
      : []),
  ]);
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
function output(m: RecordModule, row: DbRow): RecordRow {
  return {
    ...Object.fromEntries(
      m.fields.map((f) => [f.key, row[f.key] === null ? null : String(row[f.key] ?? '')]),
    ),
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
    ...(row.memberCount !== undefined ? { memberCount: Number(row.memberCount) } : {}),
    ...['managerName', 'salesName', 'territoryName'].reduce(
      (names, key) => (row[key] !== undefined ? { ...names, [key]: row[key] ?? null } : names),
      {},
    ),
  };
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
  for (const key of new Set([
    'status',
    ...m.display.slice(0, 3).filter((key): key is string => Boolean(key)),
  ])) {
    const v = text(params, key);
    if (v && key) clauses.push(Prisma.sql`${column(key)}=${v}`);
  }
  for (const f of m.fields.filter((f) => f.relation)) {
    const v = text(params, f.key);
    if (v) {
      if (!uuid(v)) throw new RecordError(400, `${f.label} ต้องเป็น UUID`);
      clauses.push(Prisma.sql`${column(f.key)}=${v}::uuid`);
    }
  }
  if (m.key === 'customers') {
    const territoryName = text(params, 'territoryName');
    if (territoryName)
      clauses.push(
        Prisma.sql`territory_id IN (SELECT id FROM sales_territories WHERE name=${territoryName} AND deleted_at IS NULL)`,
      );
  }
  return Prisma.join(clauses, ' AND ');
}
export async function recordList(
  m: RecordModule,
  params: URLSearchParams,
): Promise<RecordListResponse> {
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
export async function recordDetail(
  m: RecordModule,
  id: string,
  includeDeleted = false,
): Promise<RecordDetailResponse> {
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
export async function recordFilters(m: RecordModule): Promise<RecordFiltersResponse> {
  const keys = [
    ...new Set(['status', ...m.display.slice(0, 3).filter((key): key is string => Boolean(key))]),
  ];
  const entries = await Promise.all(
    keys.map(async (key) => {
      const rows = await readWithConnectionRetry((db) =>
        db.$queryRaw<{ value: string }[]>(
          Prisma.sql`SELECT DISTINCT ${column(key)} AS value FROM ${table(m)} WHERE deleted_at IS NULL AND ${column(key)}<>'' ORDER BY value`,
        ),
      );
      return [key, rows.map((row) => row.value)] as const;
    }),
  );
  const data = Object.fromEntries(entries);
  if (m.key === 'customers') {
    const rows = await readWithConnectionRetry((db) =>
      db.$queryRaw<{ name: string }[]>(
        Prisma.sql`SELECT DISTINCT name FROM sales_territories WHERE deleted_at IS NULL ORDER BY name`,
      ),
    );
    data.territoryName = rows.map((row) => row.name);
  }
  return { data };
}
export async function recordOptions(
  m: RecordModule,
  params: URLSearchParams,
): Promise<RecordOptionsResponse> {
  const rows = await recordList(m, params);
  return {
    data: rows.data.map((r) => ({ id: r.id, code: r.code, name: r.name })),
    pagination: rows.pagination,
  };
}
export async function recordConfig(
  m: RecordModule,
  canWrite: boolean,
): Promise<RecordConfigResponse> {
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
  const reason = recordReason(body);
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
              f.relation === 'warehouses'
                ? { table: 'warehouses' }
                : f.relation === 'users'
                  ? { table: 'users' }
                  : recordModule(f.relation!);
            const active =
              f.relation === 'warehouses' ? Prisma.empty : Prisma.sql`AND deleted_at IS NULL`;
            const found = await tx.$queryRaw<{ id: string }[]>(
              Prisma.sql`SELECT id FROM ${Prisma.raw('"' + t.table + '"')} WHERE id=${value}::uuid ${active} FOR KEY SHARE`,
            );
            if (!found.length) throw new RecordError(400, `${f.label} ไม่มีหรือถูกลบแล้ว`);
            if (f.relation === 'users') {
              const role = f.key === 'managerId' ? 'MANAGER' : 'SALES';
              const matches = await tx.$queryRaw<{ id: string }[]>(
                Prisma.sql`SELECT u.id FROM users u JOIN user_roles r ON r.user_id=u.id WHERE u.id=${value}::uuid AND r.role_id=${role} AND u.status='ACTIVE' FOR UPDATE OF u`,
              );
              if (!matches.length)
                throw new RecordError(400, `${f.label} ต้องเป็นบัญชีที่ใช้งานอยู่และมีบทบาทตรงกัน`);
              const taken = await tx.$queryRaw<{ id: string }[]>(
                Prisma.sql`SELECT id FROM sales_territories WHERE (manager_id=${value}::uuid OR sales_id=${value}::uuid) AND id<>COALESCE(${id}::uuid,'00000000-0000-0000-0000-000000000000'::uuid)`,
              );
              if (taken.length) throw new RecordError(409, 'ผู้ใช้งานคนนี้อยู่ในเขตอื่นแล้ว');
            }
          }
        }
      let rows: DbRow[];
      if (m.key === 'sales-territories' && action === 'delete') {
        const assigned = await tx.$queryRaw<{ total: number }[]>(
          Prisma.sql`SELECT count(*)::int AS total FROM customers WHERE territory_id=${id}::uuid AND deleted_at IS NULL`,
        );
        if (assigned[0].total || before?.managerId || before?.salesId)
          throw new RecordError(409, 'เขตยังมีลูกค้าหรือผู้รับผิดชอบ กรุณาย้ายออกก่อนลบ');
      }
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
      filters: '/api/' + m.key + '?view=filters',
    })),
  };
}
