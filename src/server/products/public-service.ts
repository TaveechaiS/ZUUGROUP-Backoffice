import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { readWithConnectionRetry } from '@/server/db/prisma';

export class PublicApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
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
    if (!/^\d+$/.test(raw)) throw new PublicApiError(`${key} ต้องเป็นจำนวนเต็มตั้งแต่ ${min} ถึง ${max}`);
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      throw new PublicApiError(`${key} ต้องอยู่ระหว่าง ${min} ถึง ${max}`);
    }
    return value;
  };
  return { search, offset: integer('offset', 0, 0, 100000), limit: integer('limit', 20, 1, 50) };
}

const productSelect = {
  id: true, code: true, name: true, categoryId: true, dosageFormId: true, drugId: true, unit: true,
  category: { select: { name: true } },
  dosageForm: { select: { name: true } },
  drug: { select: { name: true } },
} as const;

type PublicProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
function productData(row: PublicProduct) {
  return { ...row, category: row.category.name, dosageForm: row.dosageForm.name, drug: row.drug.name };
}

export async function publicProducts(params: URLSearchParams) {
  const { search, offset, limit } = publicQuery(params);
  const categoryId = params.get('categoryId');
  const dosageFormId = params.get('dosageFormId');
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE', deletedAt: null,
    ...(categoryId ? { categoryId: publicId(categoryId) } : {}),
    ...(dosageFormId ? { dosageFormId: publicId(dosageFormId) } : {}),
    ...(search ? { OR: [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ] } : {}),
  };
  return readWithConnectionRetry(async (prisma) => {
    const [rows, total] = await Promise.all([
      prisma.product.findMany({ where, select: productSelect, orderBy: { code: 'asc' }, skip: offset, take: limit }),
      prisma.product.count({ where }),
    ]);
    return { data: rows.map(productData), pagination: { offset, limit, total, hasMore: offset + rows.length < total } };
  });
}

export async function publicProduct(id: string) {
  publicId(id);
  const row = await readWithConnectionRetry(prisma => prisma.product.findFirst({
    where: { id, status: 'ACTIVE', deletedAt: null }, select: productSelect,
  }));
  if (!row) throw new PublicApiError('ไม่พบสินค้า', 404);
  return { data: productData(row) };
}

type MasterType = 'categories' | 'dosage-forms' | 'drugs';
function masterType(type: string): MasterType {
  if (type !== 'categories' && type !== 'dosage-forms' && type !== 'drugs') {
    throw new PublicApiError('ไม่พบกลุ่มข้อมูลแม่', 404);
  }
  return type;
}

export async function publicMasterList(type: string, params: URLSearchParams) {
  const kind = masterType(type);
  const { search, offset, limit } = publicQuery(params);
  return readWithConnectionRetry(async (prisma) => {
    const common = { skip: offset, take: limit };
    const namedWhere: Prisma.DrugWhereInput = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const codedWhere = search ? { OR: [
      { code: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } },
    ] } : {};
    const codedSelect = { id: true, code: true, name: true } as const;
    const [data, total] = kind === 'categories'
      ? await Promise.all([
        prisma.productCategory.findMany({ ...common, where: codedWhere, select: codedSelect, orderBy: { code: 'asc' } }),
        prisma.productCategory.count({ where: codedWhere }),
      ])
      : kind === 'dosage-forms'
        ? await Promise.all([
          prisma.dosageForm.findMany({ ...common, where: codedWhere, select: codedSelect, orderBy: { code: 'asc' } }),
          prisma.dosageForm.count({ where: codedWhere }),
        ])
        : await Promise.all([
          prisma.drug.findMany({ ...common, where: namedWhere, select: { id: true, name: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
          prisma.drug.count({ where: namedWhere }),
        ]);
    return { data, pagination: { offset, limit, total, hasMore: offset + data.length < total } };
  });
}

export async function publicMaster(type: string, id: string) {
  const kind = masterType(type);
  publicId(id);
  const codedSelect = { id: true, code: true, name: true } as const;
  const data = await readWithConnectionRetry(async (prisma) => kind === 'categories'
    ? prisma.productCategory.findUnique({ where: { id }, select: codedSelect })
    : kind === 'dosage-forms'
      ? prisma.dosageForm.findUnique({ where: { id }, select: codedSelect })
      : prisma.drug.findUnique({ where: { id }, select: { id: true, name: true } }));
  if (!data) throw new PublicApiError('ไม่พบข้อมูลแม่', 404);
  return { data };
}

export async function publicMasters() {
  const params = new URLSearchParams({ limit: '50' });
  const [categories, dosageForms, drugs] = await Promise.all([
    publicMasterList('categories', params), publicMasterList('dosage-forms', params), publicMasterList('drugs', params),
  ]);
  return { categories: categories.data, dosageForms: dosageForms.data, drugs: drugs.data,
    pagination: { categories: categories.pagination, dosageForms: dosageForms.pagination, drugs: drugs.pagination } };
}
