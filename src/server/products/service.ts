import 'server-only';
import { tableSort } from '@/server/validation/table-sort';

import { randomUUID } from 'node:crypto';
import { Prisma, type ProductStatus } from '@/generated/prisma/client';
import { getPrismaClient, readWithConnectionRetry } from '@/server/db/prisma';
import {
  PaginationError,
  paginationQuery,
  paginationResult,
  queryChoice,
  queryText,
} from '@/server/pagination';

const include = { category: true, dosageForm: true, drug: true, defaultWarehouse: true } as const;
import {
  ProductError,
  productInput,
  requiredString,
  uuidPattern,
  productMasterInput,
} from '@/server/validation/products';
import type { ProductView, ProductsListResponse } from '@/types/api/products';
import type { ProductDetails } from '@/types/api/product-full';
export { ProductError, productInput } from '@/server/validation/products';
type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof include }>;
export function productView(product: ProductWithRelations, showCost = false): ProductView {
  const details = product.details
    ? (JSON.parse(JSON.stringify(product.details)) as ProductDetails)
    : undefined;
  if (details && !showCost) delete details.fields['ราคาต้นทุน'];
  return {
    id: product.id,
    ...(details ? { details } : {}),
    code: product.code,
    name: product.name,
    sequence: String(product.sequence).padStart(product.codeGroupId ? 5 : 4, '0'),
    categoryId: product.categoryId,
    category: { id: product.category.id, name: product.category.name, code: product.category.code },
    dosageFormId: product.dosageFormId ?? '',
    dosageForm: {
      id: product.dosageForm?.id ?? '',
      name: product.dosageForm?.name ?? '',
      code: product.dosageForm?.code ?? '',
    },
    drugId: product.drugId ?? '',
    drug: { id: product.drug?.id ?? '', name: product.drug?.name ?? '' },
    defaultWarehouseId: product.defaultWarehouseId ?? '',
    defaultWarehouse: {
      id: product.defaultWarehouse?.id ?? '',
      name: product.defaultWarehouse?.name ?? '',
      code: product.defaultWarehouse?.code ?? '',
    },
    unit: product.unit,
    salePrice: product.salePrice.toFixed(2),
    status: product.status,
    deletedAt: product.deletedAt?.toISOString() ?? null,
    deleteReason: product.deleteReason,
    createdAt: product.createdAt.toISOString(),
  };
}
export async function paginatedProducts(
  params: URLSearchParams,
  isAdmin: boolean,
): Promise<ProductsListResponse> {
  const { offset, limit } = paginationQuery(params);
  let sort: ReturnType<typeof tableSort>;
  try {
    sort = tableSort(params, [
      'name',
      'code',
      'categoryId',
      'dosageFormId',
      'unit',
      'salePrice',
      'status',
    ]);
  } catch {
    throw new ProductError('คอลัมน์หรือทิศทางเรียงข้อมูลไม่ถูกต้อง');
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = sort.key
    ? [
        sort.key === 'categoryId'
          ? { category: { name: sort.direction } }
          : sort.key === 'dosageFormId'
            ? { dosageForm: { name: sort.direction } }
            : { [sort.key]: sort.direction },
        { id: 'asc' },
      ]
    : [{ createdAt: 'desc' }, { id: 'desc' }];
  const deleted = queryChoice(params, 'deleted', ['false', 'true'], 'false');
  if (deleted === 'true' && !isAdmin) throw new ProductError('ไม่มีสิทธิ์ดูสินค้าที่ลบแล้ว', 403);
  const status = queryChoice(params, 'status', ['', 'ACTIVE', 'INACTIVE']);
  const search = queryText(params, 'search');
  const categoryId = queryText(params, 'categoryId');
  if (categoryId && !uuidPattern.test(categoryId))
    throw new PaginationError('categoryId ต้องเป็น UUID');
  const where: Prisma.ProductWhereInput = {
    deletedAt: deleted === 'true' ? { not: null } : null,
    ...(status ? { status: status as ProductStatus } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { drug: { is: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  };
  return readWithConnectionRetry(async (db) => {
    const [total, rows] = await db.$transaction(
      [
        db.product.count({ where }),
        db.product.findMany({
          where,
          include,
          orderBy,
          skip: offset,
          take: limit,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return {
      products: rows.map((row) => productView(row, isAdmin)),
      pagination: paginationResult(total, offset, limit),
    };
  });
}
export async function productListFilters() {
  const categories = await readWithConnectionRetry((db) =>
    db.productCategory.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    }),
  );
  return { categories };
}
export async function getProductByCode(code: string, showCost = false) {
  return productDetail({ code }, showCost);
}
async function productDetail(where: Prisma.ProductWhereUniqueInput, showCost: boolean) {
  return readWithConnectionRetry((db) =>
    db.$transaction(
      async (tx) => {
        const row = await tx.product.findUnique({ where, include });
        if (!row) return null;
        const versions = await tx.$queryRaw<{ version: string }[]>(
          Prisma.sql`SELECT md5(to_jsonb(p)::text) AS version FROM products p WHERE id=${row.id}::uuid`,
        );
        return { ...productView(row, showCost), version: versions[0].version };
      },
      { isolationLevel: 'RepeatableRead' },
    ),
  );
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
    where: { categoryId, dosageFormId },
    orderBy: { sequence: 'desc' },
    select: { sequence: true },
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
      if (!category || !dosageForm || !drug || !warehouse)
        throw new ProductError('ข้อมูลแม่ที่เลือกไม่พบ กรุณาโหลดหน้าใหม่');
      const highest = await tx.product.findFirst({
        where: { categoryId: input.categoryId, dosageFormId: input.dosageFormId },
        orderBy: { sequence: 'desc' },
        select: { sequence: true },
      });
      const number = input.sequence ?? (highest?.sequence ?? 0) + 1;
      if (number > 9999) throw new ProductError('เลขลำดับของหมวดและรูปแบบยานี้ครบ 9999 แล้ว');
      const code = `${category.code}-${dosageForm.code}-${String(number).padStart(4, '0')}`;
      if (await tx.product.findUnique({ where: { code }, select: { id: true } })) {
        throw new ProductError('รหัสนี้มีสินค้าแล้ว กรุณาเลือกเลขลำดับอื่น', 409);
      }
      const row = await tx.product.create({
        data: { ...input, sequence: number, code, salePrice: input.salePrice },
        include,
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: actorId,
          actorRole: 'ADMIN',
          action: 'PRODUCT_CREATED',
          requestId: randomUUID(),
          after: {
            productId: row.id,
            code,
            name: row.name,
            categoryId: row.categoryId,
            dosageFormId: row.dosageFormId,
            drugId: row.drugId,
            defaultWarehouseId: row.defaultWarehouseId,
            unit: row.unit,
            salePrice: row.salePrice.toFixed(2),
            status: row.status,
          },
        },
      });
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
      if ((action === 'delete' && old.deletedAt) || (action === 'restore' && !old.deletedAt)) {
        throw new ProductError('สถานะการลบของสินค้านี้เปลี่ยนไปแล้ว', 409);
      }
      data = {
        deletedAt: action === 'delete' ? new Date() : null,
        deletedById: action === 'delete' ? actorId : null,
        deleteReason: action === 'delete' ? reason : null,
      };
    } else if (action === 'update') {
      if (old.details)
        throw new ProductError('สินค้านี้ใช้ข้อมูลแบบใหม่ กรุณาแก้ผ่านแบบฟอร์มข้อมูลครบ', 409);
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
      data = {
        name: input.name,
        drugId: input.drugId,
        defaultWarehouseId: input.defaultWarehouseId,
        unit: input.unit,
        salePrice: input.salePrice,
        status: input.status,
      };
    } else throw new ProductError('คำสั่งไม่ถูกต้อง');
    const row = await tx.product.update({ where: { id }, data, include });
    await tx.auditEvent.create({
      data: {
        actorUserId: actorId,
        actorRole: 'ADMIN',
        action:
          action === 'delete'
            ? 'PRODUCT_DELETED'
            : action === 'restore'
              ? 'PRODUCT_RESTORED'
              : 'PRODUCT_UPDATED',
        requestId: randomUUID(),
        before: {
          productId: old.id,
          code: old.code,
          name: old.name,
          drugId: old.drugId,
          defaultWarehouseId: old.defaultWarehouseId,
          unit: old.unit,
          salePrice: old.salePrice.toFixed(2),
          status: old.status,
          deletedAt: old.deletedAt?.toISOString() ?? null,
        },
        after: {
          productId: row.id,
          code: row.code,
          name: row.name,
          drugId: row.drugId,
          defaultWarehouseId: row.defaultWarehouseId,
          unit: row.unit,
          salePrice: row.salePrice.toFixed(2),
          status: row.status,
          deletedAt: row.deletedAt?.toISOString() ?? null,
          reason: body.reason ?? null,
        },
      },
    });
    return productView(row);
  });
}
export async function createProductMaster(
  kind: unknown,
  body: Record<string, unknown>,
  actorId: string,
) {
  const { name, code, type } = productMasterInput(kind, body);
  try {
    return await getPrismaClient().$transaction(async (tx) => {
      const item =
        type === 'drug'
          ? await tx.drug.create({ data: { name } })
          : type === 'category'
            ? await tx.productCategory.create({ data: { name, code } })
            : await tx.dosageForm.create({ data: { name, code } });
      await tx.auditEvent.create({
        data: {
          actorUserId: actorId,
          actorRole: 'ADMIN',
          action: 'PRODUCT_MASTER_CREATED',
          requestId: randomUUID(),
          after: { type, id: item.id, name, code: type === 'drug' ? null : code },
        },
      });
      return item;
    });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      throw new ProductError('ชื่อหรือรหัสนี้มีอยู่แล้ว', 409);
    }
    throw error;
  }
}

export async function getProductById(id: string, showCost = false) {
  return productDetail({ id }, showCost);
}
