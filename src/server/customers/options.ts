import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { uuidPattern } from '@/server/validation/products';
import { CustomerError } from '@/server/validation/customer-error';
import {
  CUSTOMER_OPTION_KINDS,
  isCustomerOptionKind,
  type CustomerOptionKind,
} from '@/config/customer-options';
import type { CustomerOption, CustomerOptionsResponse } from '@/types/api/customer-options';

const columns = Prisma.sql`id,kind,name,code,days,active,version`;

// Complete active sets for the customer form; settings table pagination stays separate.
export async function batchCustomerOptions(params: URLSearchParams) {
  const kinds = (params.get('kinds') ?? '').split(',');
  if (
    params.getAll('kinds').length !== 1 ||
    new Set(kinds).size !== kinds.length ||
    !kinds.every(isCustomerOptionKind)
  )
    throw new CustomerError('ประเภทข้อมูลไม่ถูกต้อง');
  if ([...params.keys()].some((key) => key !== 'kinds'))
    throw new CustomerError('ชุดตัวเลือกไม่รองรับตัวกรองหรือการแบ่งหน้า');
  const rows = await getPrismaClient().$queryRaw<CustomerOption[]>(
    Prisma.sql`SELECT ${columns} FROM customer_options WHERE active=true AND kind IN (${Prisma.join(kinds)}) ORDER BY kind,coalesce(days,0),name,id`,
  );
  return {
    options: Object.fromEntries(
      kinds.map((kind) => [kind, rows.filter((row) => row.kind === kind)]),
    ),
  };
}

function nameValue(value: unknown) {
  const name = typeof value === 'string' ? value.normalize('NFKC').trim().replace(/\s+/g, ' ') : '';
  if (!name || [...name].length > 160) throw new CustomerError('กรุณากรอกชื่อไม่เกิน 160 ตัวอักษร');
  return name;
}

function daysValue(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 365)
    throw new CustomerError('จำนวนวันต้องเป็นจำนวนเต็ม 0–365');
  return Number(value);
}

function integer(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || Number(value) > max)
    throw new CustomerError('จำนวนรายการหรือหน้าไม่ถูกต้อง');
  return Number(value);
}

export async function listCustomerOptions(
  params: URLSearchParams,
  isAdmin: boolean,
): Promise<CustomerOptionsResponse> {
  const kind = params.get('kind');
  if (!isCustomerOptionKind(kind)) throw new CustomerError('ประเภทข้อมูลไม่ถูกต้อง');
  const inactive = params.get('includeInactive') ?? 'false';
  if (!['true', 'false'].includes(inactive)) throw new CustomerError('ตัวกรองไม่ถูกต้อง');
  if (inactive === 'true' && !isAdmin) throw new CustomerError('ไม่มีสิทธิ์ดูรายการที่ปิด', 403);
  const limit = integer(params.get('limit'), 10, 100);
  const offset = integer(params.get('offset'), 0, 1000000);
  if (!limit) throw new CustomerError('จำนวนรายการต้องมากกว่า 0');
  const search = (params.get('search') ?? '').normalize('NFKC').trim();
  if (search.length > 160) throw new CustomerError('คำค้นยาวเกินไป');
  const pattern = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
  let order: Prisma.Sql;
  try {
    order = sqlTableOrder(
      params,
      {
        code: Prisma.sql`code`,
        name: Prisma.sql`name`,
        days: Prisma.sql`days`,
        active: Prisma.sql`active`,
      },
      kind === 'creditTerm' ? Prisma.sql`days,name,id` : Prisma.sql`name,id`,
      Prisma.sql`id`,
    );
  } catch {
    throw new CustomerError('คอลัมน์หรือทิศทางเรียงข้อมูลไม่ถูกต้อง');
  }
  return getPrismaClient().$transaction(
    async (tx) => {
      const where = Prisma.sql`kind=${kind} ${inactive === 'true' ? Prisma.empty : Prisma.sql`AND active=true`} AND (name ILIKE ${pattern} OR coalesce(code,'') ILIKE ${pattern})`;
      const data = await tx.$queryRaw<CustomerOption[]>(
        Prisma.sql`SELECT ${columns} FROM customer_options WHERE ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
      );
      const count = await tx.$queryRaw<{ total: number }[]>(
        Prisma.sql`SELECT count(*)::int AS total FROM customer_options WHERE ${where}`,
      );
      return { data, pagination: { total: count[0].total, limit, offset } };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

export async function writeCustomerOption(
  body: unknown,
  actorId: string,
  method: 'POST' | 'PATCH',
) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new CustomerError('ข้อมูลไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  try {
    return await getPrismaClient().$transaction(async (tx) => {
      let before: CustomerOption | undefined;
      let item: CustomerOption;
      if (method === 'POST') {
        const allowed = new Set(['kind', 'name', 'code', 'days']);
        if (Object.keys(input).some((key) => !allowed.has(key)))
          throw new CustomerError('พบช่องข้อมูลที่ระบบไม่รองรับ');
        if (!isCustomerOptionKind(input.kind)) throw new CustomerError('ประเภทข้อมูลไม่ถูกต้อง');
        const kind: CustomerOptionKind = input.kind;
        const definition = CUSTOMER_OPTION_KINDS[kind];
        const name = nameValue(input.name);
        const code =
          typeof input.code === 'string' ? input.code.trim().toUpperCase() || null : null;
        if (definition.codeRequired ? !code || !/^[A-Z0-9]{2,3}$/.test(code) : code)
          throw new CustomerError(
            definition.codeRequired
              ? 'รหัสต้องเป็น A-Z หรือ 0-9 จำนวน 2–3 ตัว'
              : 'รายการนี้ไม่ใช้รหัส',
          );
        if (!definition.daysRequired && input.days !== undefined && input.days !== null)
          throw new CustomerError('รายการนี้ไม่ใช้จำนวนวัน');
        const days = definition.daysRequired ? daysValue(input.days) : null;
        const rows = await tx.$queryRaw<CustomerOption[]>(
          Prisma.sql`INSERT INTO customer_options(kind,name,code,days) VALUES(${kind},${name},${code},${days}) RETURNING ${columns}`,
        );
        item = rows[0];
      } else {
        const allowed = new Set(['id', 'version', 'name', 'days', 'active']);
        if (Object.keys(input).some((key) => !allowed.has(key)))
          throw new CustomerError('เปลี่ยนประเภทหรือรหัสไม่ได้');
        if (typeof input.id !== 'string' || !uuidPattern.test(input.id))
          throw new CustomerError('รหัสรายการไม่ถูกต้อง');
        if (!Number.isInteger(input.version) || Number(input.version) < 1)
          throw new CustomerError('เวอร์ชันข้อมูลไม่ถูกต้อง');
        if (!('name' in input) && !('active' in input) && !('days' in input))
          throw new CustomerError('กรุณาระบุข้อมูลที่แก้ไข');
        if ('active' in input && typeof input.active !== 'boolean')
          throw new CustomerError('สถานะรายการไม่ถูกต้อง');
        const rows = await tx.$queryRaw<CustomerOption[]>(
          Prisma.sql`SELECT ${columns} FROM customer_options WHERE id=${input.id}::uuid FOR UPDATE`,
        );
        before = rows[0];
        if (!before) throw new CustomerError('ไม่พบรายการ', 404);
        if (before.version !== input.version)
          throw new CustomerError('รายการถูกแก้ไขแล้ว กรุณาโหลดใหม่', 409);
        if ('days' in input && !CUSTOMER_OPTION_KINDS[before.kind].daysRequired)
          throw new CustomerError('รายการนี้ไม่ใช้จำนวนวัน');
        const name = 'name' in input ? nameValue(input.name) : before.name;
        const days = 'days' in input ? daysValue(input.days) : before.days;
        const active = typeof input.active === 'boolean' ? input.active : before.active;
        const changed = await tx.$queryRaw<CustomerOption[]>(
          Prisma.sql`UPDATE customer_options SET name=${name},days=${days},active=${active},version=version+1,updated_at=now() WHERE id=${before.id}::uuid RETURNING ${columns}`,
        );
        item = changed[0];
      }
      await tx.auditEvent.create({
        data: {
          actorUserId: actorId,
          actorRole: 'ADMIN',
          action: method === 'POST' ? 'CUSTOMER_OPTION_CREATED' : 'CUSTOMER_OPTION_UPDATED',
          requestId: randomUUID(),
          ...(before ? { before: JSON.parse(JSON.stringify(before)) } : {}),
          after: JSON.parse(JSON.stringify(item)),
        },
      });
      return item;
    });
  } catch (error) {
    const e = error as {
      code?: string;
      meta?: { code?: string; driverAdapterError?: { cause?: { originalCode?: string } } };
    };
    if (
      e.code === 'P2002' ||
      e.meta?.code === '23505' ||
      e.meta?.driverAdapterError?.cause?.originalCode === '23505'
    )
      throw new CustomerError('ชื่อหรือรหัสนี้มีอยู่แล้วในชุดข้อมูล', 409);
    throw error;
  }
}
