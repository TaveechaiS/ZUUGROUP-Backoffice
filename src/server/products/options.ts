import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import {
  isProductOptionKind,
  PRODUCT_OPTION_KINDS,
  type ProductOptionKind,
} from '@/config/product-options';
import { ProductError, uuidPattern } from '@/server/validation/products';
import type { ProductOption, ProductOptionsResponse } from '@/types/api/product-options';

const legacyTables = {
  category: 'product_categories',
  dosageForm: 'dosage_forms',
  ingredient: 'drugs',
} as const;
function nameValue(value: unknown) {
  const name = typeof value === 'string' ? value.normalize('NFKC').trim().replace(/\s+/g, ' ') : '';
  if (!name || [...name].length > 160) throw new ProductError('กรุณากรอกชื่อไม่เกิน 160 ตัวอักษร');
  return name;
}
function integer(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || Number(value) > max)
    throw new ProductError('จำนวนรายการหรือหน้าไม่ถูกต้อง');
  return Number(value);
}
export async function listProductOptions(
  params: URLSearchParams,
  isAdmin: boolean,
): Promise<ProductOptionsResponse> {
  const kind = params.get('kind');
  if (!isProductOptionKind(kind)) throw new ProductError('ประเภทข้อมูลไม่ถูกต้อง');
  const inactive = params.get('includeInactive') ?? 'false';
  if (!['true', 'false'].includes(inactive)) throw new ProductError('ตัวกรองไม่ถูกต้อง');
  if (inactive === 'true' && !isAdmin) throw new ProductError('ไม่มีสิทธิ์ดูรายการที่ปิด', 403);
  const limit = integer(params.get('limit'), 50, 100);
  const offset = integer(params.get('offset'), 0, 1000000);
  if (!limit) throw new ProductError('จำนวนรายการต้องมากกว่า 0');
  const search = (params.get('search') ?? '').normalize('NFKC').trim();
  if (search.length > 160) throw new ProductError('คำค้นยาวเกินไป');
  const pattern = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
  const itemId = params.get('id');
  if (itemId && !uuidPattern.test(itemId)) throw new ProductError('รหัสรายการไม่ถูกต้อง');
  return getPrismaClient().$transaction(
    async (tx) => {
      const where = Prisma.sql`kind=${kind} ${itemId ? Prisma.sql`AND id=${itemId}::uuid` : Prisma.empty} ${inactive === 'true' ? Prisma.empty : Prisma.sql`AND active=true`} AND (name ILIKE ${pattern} OR code ILIKE ${pattern})`;
      const data = await tx.$queryRaw<ProductOption[]>(
        Prisma.sql`SELECT id,kind,name,code,active,version FROM product_options WHERE ${where} ORDER BY name,id LIMIT ${limit} OFFSET ${offset}`,
      );
      const count = await tx.$queryRaw<{ total: number }[]>(
        Prisma.sql`SELECT count(*)::int AS total FROM product_options WHERE ${where}`,
      );
      return { data, pagination: { total: count[0].total, limit, offset } };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
export async function writeProductOption(body: unknown, actorId: string, method: 'POST' | 'PATCH') {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ProductError('ข้อมูลไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  try {
    return await getPrismaClient().$transaction(async (tx) => {
      let before: (ProductOption & { legacy: boolean }) | undefined;
      let item: ProductOption;
      if (method === 'POST') {
        if (!isProductOptionKind(input.kind)) throw new ProductError('ประเภทข้อมูลไม่ถูกต้อง');
        const kind: ProductOptionKind = input.kind;
        const name = nameValue(input.name);
        const code =
          typeof input.code === 'string' ? input.code.trim().toUpperCase() || null : null;
        if (
          (PRODUCT_OPTION_KINDS[kind].codeRequired && !code) ||
          (code && !/^[A-Z0-9]{2,3}$/.test(code))
        )
          throw new ProductError('รหัสต้องเป็น A-Z หรือ 0-9 จำนวน 2–3 ตัว');
        const id = randomUUID();
        const legacy = Object.hasOwn(legacyTables, kind);
        if (legacy) {
          const table = Prisma.raw(legacyTables[kind as keyof typeof legacyTables]);
          if (kind === 'ingredient')
            await tx.$executeRaw(
              Prisma.sql`INSERT INTO ${table}(id,name) VALUES(${id}::uuid,${name})`,
            );
          else
            await tx.$executeRaw(
              Prisma.sql`INSERT INTO ${table}(id,name,code) VALUES(${id}::uuid,${name},${code})`,
            );
        }
        const rows = await tx.$queryRaw<ProductOption[]>(
          Prisma.sql`INSERT INTO product_options(id,kind,name,code,legacy) VALUES(${id}::uuid,${kind},${name},${code},${legacy}) RETURNING id,kind,name,code,active,version`,
        );
        item = rows[0];
      } else {
        if (typeof input.id !== 'string' || !uuidPattern.test(input.id))
          throw new ProductError('รหัสรายการไม่ถูกต้อง');
        if (!Number.isInteger(input.version) || Number(input.version) < 1)
          throw new ProductError('เวอร์ชันข้อมูลไม่ถูกต้อง');
        if ('kind' in input || 'code' in input)
          throw new ProductError('เปลี่ยนประเภทหรือรหัสไม่ได้');
        if (!('name' in input) && !('active' in input))
          throw new ProductError('กรุณาระบุข้อมูลที่แก้ไข');
        if ('active' in input && typeof input.active !== 'boolean')
          throw new ProductError('สถานะรายการไม่ถูกต้อง');
        const rows = await tx.$queryRaw<(ProductOption & { legacy: boolean })[]>(
          Prisma.sql`SELECT * FROM product_options WHERE id=${input.id}::uuid FOR UPDATE`,
        );
        before = rows[0];
        if (!before) throw new ProductError('ไม่พบรายการ', 404);
        if (before.version !== input.version)
          throw new ProductError('รายการถูกแก้ไขแล้ว กรุณาโหลดใหม่', 409);
        const name = 'name' in input ? nameValue(input.name) : before.name;
        const active = typeof input.active === 'boolean' ? input.active : before.active;
        if (before.legacy && name !== before.name) {
          const table = Prisma.raw(legacyTables[before.kind as keyof typeof legacyTables]);
          const changed = await tx.$executeRaw(
            Prisma.sql`UPDATE ${table} SET name=${name} WHERE id=${before.id}::uuid`,
          );
          if (!changed) throw new ProductError('ข้อมูลอ้างอิงไม่ครบ กรุณาโหลดใหม่', 409);
        }
        const changed = await tx.$queryRaw<ProductOption[]>(
          Prisma.sql`UPDATE product_options SET name=${name},active=${active},version=version+1,updated_at=now() WHERE id=${before.id}::uuid RETURNING id,kind,name,code,active,version`,
        );
        item = changed[0];
      }
      await tx.auditEvent.create({
        data: {
          actorUserId: actorId,
          actorRole: 'ADMIN',
          action: method === 'POST' ? 'PRODUCT_OPTION_CREATED' : 'PRODUCT_OPTION_UPDATED',
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
      throw new ProductError('ชื่อหรือรหัสนี้มีอยู่แล้วในชุดข้อมูล', 409);
    throw error;
  }
}
