import { inventoryQuery } from '@/server/validation/reports';
import 'server-only';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { Prisma } from '@/generated/prisma/client';
import { recordModule, recordList, recordFilters, RecordError } from './service';
import type { RecordRow } from '@/types/api/records';
export const REPORTS = {
  sales: {
    source: 'orders',
    title: 'รายงานคำสั่งซื้อ',
    page: '/orders',
    note: 'รายการและยอดหัวคำสั่งซื้อ ยังไม่ใช่ยอดขายรับรู้',
  },
  finance: {
    source: 'billing',
    title: 'รายงานหัวเอกสารวางบิล',
    page: '/billing',
    note: 'ยอดหัวเอกสาร ยังไม่หักรับชำระหรือคำนวณลูกหนี้สุทธิ',
  },
  inventory: {
    source: 'products',
    title: 'รายงานข้อมูลสินค้า',
    page: '/products',
    note: 'ข้อมูลหลักสินค้า ยังไม่มียอดคงเหลือหรือ Lot',
  },
} as const;
import type { ReportKey } from '@/types/api/reports';
export type { ReportKey } from '@/types/api/reports';
export function reportKey(value: string): ReportKey {
  if (!(value in REPORTS)) throw new RecordError(404, 'ไม่พบรายงาน');
  return value as ReportKey;
}
export async function reportData(key: ReportKey, params: URLSearchParams) {
  if (params.get('deleted') === 'true') throw new RecordError(400, 'รายงานไม่รวมข้อมูลที่ลบแล้ว');
  if (key !== 'inventory') return recordList(recordModule(REPORTS[key].source), params);
  const { offset, limit, search } = inventoryQuery(params);
  const where = {
    deletedAt: null,
    status: 'ACTIVE' as const,
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(params.get('category.name') ? { category: { name: params.get('category.name')! } } : {}),
    ...(params.get('dosageForm.name')
      ? { dosageForm: { name: params.get('dosageForm.name')! } }
      : {}),
  };
  return readWithConnectionRetry(async (db) => {
    const [products, total] = await db.$transaction([
      db.product.findMany({
        where,
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { name: true } },
          dosageForm: { select: { name: true } },
        },
        orderBy: { code: 'asc' },
        skip: offset,
        take: limit,
      }),
      db.product.count({ where }),
    ]);
    return {
      data: products.map(
        (p) =>
          ({
            id: p.id,
            code: p.code,
            name: p.name,
            category: p.category,
            dosageForm: p.dosageForm,
            unit: p.unit,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
            deletedAt: null,
            updatedAt: p.updatedAt.toISOString(),
          }) satisfies RecordRow,
      ),
      pagination: { offset, limit, total, hasMore: offset + products.length < total },
    };
  });
}
export async function reportFilters(key: ReportKey) {
  if (key !== 'inventory') return recordFilters(recordModule(REPORTS[key].source));
  return readWithConnectionRetry(async (db) => {
    const [categories, forms] = await Promise.all([
      db.productCategory.findMany({
        where: { products: { some: { deletedAt: null, status: 'ACTIVE' } } },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
      db.dosageForm.findMany({
        where: { products: { some: { deletedAt: null, status: 'ACTIVE' } } },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    return {
      data: {
        status: [],
        'category.name': categories.map((c) => c.name),
        'dosageForm.name': forms.map((c) => c.name),
      },
    };
  });
}
export async function reportConfig(key: ReportKey) {
  const report = REPORTS[key];
  const base =
    key === 'inventory'
      ? {
          key: 'products',
          model: 'Product',
          table: 'products',
          page: '/products',
          fields: [],
          display: ['category.name', 'dosageForm.name', null, 'unit'],
          columns: ['สินค้า', 'หมวด / รูปแบบ', '', 'หน่วย'],
          action: '',
          tabs: ['ทั้งหมด'],
          filters: ['ทุกหมวด'],
          eyebrow: '',
          description: '',
        }
      : recordModule(report.source);
  return {
    data: { ...base, title: report.title, description: report.note, canWrite: false, metrics: [] },
  };
}
export async function dashboardData() {
  return readWithConnectionRetry(async (db) => {
    const [counts, activity] = await Promise.all([
      db.$queryRaw<{ customers: number; orders: number; quotes: number; products: number }[]>(
        Prisma.sql`SELECT (SELECT count(*)::int FROM customers WHERE deleted_at IS NULL) customers,(SELECT count(*)::int FROM sales_orders WHERE deleted_at IS NULL) orders,(SELECT count(*)::int FROM quotations WHERE deleted_at IS NULL) quotes,(SELECT count(*)::int FROM products WHERE deleted_at IS NULL) products`,
      ),
      db.$queryRaw<
        {
          id: string;
          code: string;
          name: string;
          status: string;
          module: string;
          createdAt: Date;
        }[]
      >(
        Prisma.sql`SELECT * FROM (SELECT id,code,name,status,'quotes'::text module,created_at AS "createdAt" FROM quotations WHERE deleted_at IS NULL UNION ALL SELECT id,code,name,status,'purchases'::text module,created_at AS "createdAt" FROM purchase_orders WHERE deleted_at IS NULL UNION ALL SELECT id,code,name,status,'billing'::text module,created_at AS "createdAt" FROM invoices WHERE deleted_at IS NULL) events ORDER BY "createdAt" DESC,id ASC LIMIT 10`,
      ),
    ]);
    return {
      data: {
        counts: counts[0],
        activity: activity.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        unavailable: ['ยอดขายรับรู้', 'ลูกหนี้สุทธิ', 'คงเหลือและ Lot'],
      },
    };
  });
}
