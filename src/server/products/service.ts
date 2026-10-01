import 'server-only';

import { randomUUID } from 'node:crypto';
import type { Prisma, ProductStatus } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';

const include = { category: true, dosageForm: true, drug: true, defaultWarehouse: true } as const;
const codePattern = /^[A-Z0-9]{2,3}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class ProductError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function requiredString(value: unknown, label: string, max = 160) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || [...text].length > max) throw new ProductError(`กรุณากรอก${label}ไม่เกิน ${max} ตัวอักษร`);
  return text;
}
function requiredId(value: unknown, label: string) {
  if (typeof value !== 'string' || !uuidPattern.test(value)) throw new ProductError(`กรุณาเลือก${label}`);
  return value;
}
function price(value: unknown) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(text) || Number(text) > 9999999999.99) {
    throw new ProductError('ราคาขายต้องเป็นตัวเลขตั้งแต่ 0 บาท และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
  }
  return text;
}
function sequence(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^[0-9]{4}$/.test(value) || value === '0000') {
    throw new ProductError('เลขลำดับต้องเป็นเลข 4 หลัก ระหว่าง 0001 ถึง 9999');
  }
  return Number(value);
}
export function productInput(body: Record<string, unknown>, creating = false) {
  const status: ProductStatus | null = body.status === 'INACTIVE' ? 'INACTIVE' : body.status === 'ACTIVE' ? 'ACTIVE' : null;
  if (!status) throw new ProductError('สถานะสินค้าไม่ถูกต้อง');
  return {
    name: requiredString(body.name, 'ชื่อสินค้า'),
    categoryId: requiredId(body.categoryId, 'หมวดหมู่'),
    dosageFormId: requiredId(body.dosageFormId, 'รูปแบบยา'),
    drugId: requiredId(body.drugId, 'ตัวยา'),
    defaultWarehouseId: requiredId(body.defaultWarehouseId, 'คลังที่เกี่ยวข้อง'),
    unit: requiredString(body.unit, 'หน่วยประจำ', 80),
    salePrice: price(body.salePrice),
    status,
    sequence: creating ? sequence(body.sequence) : null,
  };
}
type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof include }>;
export function productView(product: ProductWithRelations) {
  return {
    id: product.id, code: product.code, name: product.name, sequence: String(product.sequence).padStart(4, '0'),
    categoryId: product.categoryId, category: product.category.name, categoryCode: product.category.code,
    dosageFormId: product.dosageFormId, dosageForm: product.dosageForm.name, dosageFormCode: product.dosageForm.code,
    drugId: product.drugId, drug: product.drug.name,
    defaultWarehouseId: product.defaultWarehouseId, warehouse: product.defaultWarehouse.name,
    unit: product.unit, salePrice: product.salePrice.toFixed(2), status: product.status,
    isSample: product.isSample, deletedAt: product.deletedAt?.toISOString() ?? null,
    deleteReason: product.deleteReason, createdAt: product.createdAt.toISOString(),
  };
}
export async function listProducts(includeDeleted = false) {
  const rows = await getPrismaClient().product.findMany({
    where: includeDeleted ? undefined : { deletedAt: null }, include, orderBy: { createdAt: 'desc' },
  });
  return rows.map(productView);
}
export async function getProductById(id: string) {
  return getPrismaClient().product.findUnique({ where: { id }, include });
}
export async function getProductByCode(code: string) {
  const row = await getPrismaClient().product.findUnique({ where: { code }, include });
  return row ? productView(row) : null;
}
export async function productMasters() {
  const prisma = getPrismaClient();
  const [categories, dosageForms, drugs, warehouses] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { code: 'asc' } }),
    prisma.dosageForm.findMany({ orderBy: { code: 'asc' } }),
    prisma.drug.findMany({ orderBy: { name: 'asc' } }),
    prisma.warehouse.findMany({ orderBy: { code: 'asc' } }),
  ]);
  return { categories, dosageForms, drugs, warehouses };
}
export async function nextProductSequence(categoryId: string, dosageFormId: string) {
  const row = await getPrismaClient().product.findFirst({
    where: { categoryId, dosageFormId }, orderBy: { sequence: 'desc' }, select: { sequence: true },
  });
  return Math.min((row?.sequence ?? 0) + 1, 10000);
}
export async function createProduct(body: Record<string, unknown>, actorId: string) {
  const input = productInput(body, true);
  const prisma = getPrismaClient();
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`product:${input.categoryId}:${input.dosageFormId}`}))::text AS locked`;
      const [category, dosageForm, drug, warehouse] = await Promise.all([
        tx.productCategory.findUnique({ where: { id: input.categoryId } }),
        tx.dosageForm.findUnique({ where: { id: input.dosageFormId } }),
        tx.drug.findUnique({ where: { id: input.drugId } }),
        tx.warehouse.findUnique({ where: { id: input.defaultWarehouseId } }),
      ]);
      if (!category || !dosageForm || !drug || !warehouse) throw new ProductError('ข้อมูลแม่ที่เลือกไม่พบ กรุณาโหลดหน้าใหม่');
      const highest = await tx.product.findFirst({
        where: { categoryId: input.categoryId, dosageFormId: input.dosageFormId },
        orderBy: { sequence: 'desc' }, select: { sequence: true },
      });
      const number = input.sequence ?? (highest?.sequence ?? 0) + 1;
      if (number > 9999) throw new ProductError('เลขลำดับของหมวดและรูปแบบยานี้ครบ 9999 แล้ว');
      const code = `${category.code}-${dosageForm.code}-${String(number).padStart(4, '0')}`;
      if (await tx.product.findUnique({ where: { code }, select: { id: true } })) {
        throw new ProductError('รหัสนี้มีสินค้าแล้ว กรุณาเลือกเลขลำดับอื่น', 409);
      }
      const row = await tx.product.create({
        data: { ...input, sequence: number, code, salePrice: input.salePrice }, include,
      });
      await tx.auditEvent.create({ data: { actorUserId: actorId, actorRole: 'ADMIN',
        action: 'PRODUCT_CREATED', requestId: randomUUID(),
        after: { productId: row.id, code, name: row.name, categoryId: row.categoryId,
          dosageFormId: row.dosageFormId, drugId: row.drugId, defaultWarehouseId: row.defaultWarehouseId,
          unit: row.unit, salePrice: row.salePrice.toFixed(2), status: row.status },
      } });
      return productView(row);
    });
  } catch (error) {
    if (error instanceof ProductError) throw error;
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      throw new ProductError('รหัสหรือข้อมูลนี้มีอยู่แล้ว กรุณาลองอีกครั้ง', 409);
    }
    throw error;
  }
}
export async function updateProduct(id: string, body: Record<string, unknown>, actorId: string) {
  const action = body.action;
  const prisma = getPrismaClient();
  return prisma.$transaction(async (tx) => {
    const old = await tx.product.findUnique({ where: { id } });
    if (!old) throw new ProductError('ไม่พบสินค้า', 404);
    let data;
    if (action === 'delete' || action === 'restore') {
      const reason = requiredString(body.reason, 'เหตุผล', 500);
      if (action === 'delete' && old.deletedAt || action === 'restore' && !old.deletedAt) {
        throw new ProductError('สถานะการลบของสินค้านี้เปลี่ยนไปแล้ว', 409);
      }
      data = { deletedAt: action === 'delete' ? new Date() : null,
        deletedById: action === 'delete' ? actorId : null,
        deleteReason: action === 'delete' ? reason : null };
    } else if (action === 'update') {
      if (old.deletedAt) throw new ProductError('ต้องกู้คืนสินค้าก่อนแก้ไข', 409);
      const input = productInput(body);
      if (old.categoryId !== input.categoryId || old.dosageFormId !== input.dosageFormId) {
        throw new ProductError('หมวดและรูปแบบยาที่กำหนดรหัสสินค้าเปลี่ยนไม่ได้หลังสร้าง');
      }
      const [drug, warehouse] = await Promise.all([
        tx.drug.findUnique({ where: { id: input.drugId } }),
        tx.warehouse.findUnique({ where: { id: input.defaultWarehouseId } }),
      ]);
      if (!drug || !warehouse) throw new ProductError('ข้อมูลแม่ที่เลือกไม่พบ');
      data = { name: input.name, drugId: input.drugId, defaultWarehouseId: input.defaultWarehouseId,
        unit: input.unit, salePrice: input.salePrice, status: input.status };
    } else throw new ProductError('คำสั่งไม่ถูกต้อง');
    const row = await tx.product.update({ where: { id }, data, include });
    await tx.auditEvent.create({ data: { actorUserId: actorId, actorRole: 'ADMIN',
      action: action === 'delete' ? 'PRODUCT_DELETED' : action === 'restore' ? 'PRODUCT_RESTORED' : 'PRODUCT_UPDATED',
      requestId: randomUUID(),
      before: { productId: old.id, code: old.code, name: old.name, drugId: old.drugId,
        defaultWarehouseId: old.defaultWarehouseId, unit: old.unit,
        salePrice: old.salePrice.toFixed(2), status: old.status, deletedAt: old.deletedAt?.toISOString() ?? null },
      after: { productId: row.id, code: row.code, name: row.name, drugId: row.drugId,
        defaultWarehouseId: row.defaultWarehouseId, unit: row.unit,
        salePrice: row.salePrice.toFixed(2), status: row.status,
        deletedAt: row.deletedAt?.toISOString() ?? null, reason: body.reason ?? null },
    } });
    return productView(row);
  });
}
export async function createProductMaster(type: unknown, body: Record<string, unknown>, actorId: string) {
  const name = requiredString(body.name, 'ชื่อรายการแม่');
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (type !== 'drug' && type !== 'category' && type !== 'dosageForm') throw new ProductError('ประเภทรายการแม่ไม่ถูกต้อง');
  if (type !== 'drug' && !codePattern.test(code)) throw new ProductError('รหัสต้องเป็นตัวอักษรหรือตัวเลข 2–3 หลัก');
  try {
    return await getPrismaClient().$transaction(async (tx) => {
      const item = type === 'drug' ? await tx.drug.create({ data: { name } })
        : type === 'category' ? await tx.productCategory.create({ data: { name, code } })
        : await tx.dosageForm.create({ data: { name, code } });
      await tx.auditEvent.create({ data: { actorUserId: actorId, actorRole: 'ADMIN',
        action: 'PRODUCT_MASTER_CREATED', requestId: randomUUID(),
        after: { type, id: item.id, name, code: type === 'drug' ? null : code },
      } });
      return item;
    });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      throw new ProductError('ชื่อหรือรหัสนี้มีอยู่แล้ว', 409);
    }
    throw error;
  }
}
