import { resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import {
  createProduct,
  paginatedProducts,
  ProductError,
  productListFilters,
} from '@/server/products/service';
import { PaginationError } from '@/server/pagination';

export async function GET(request: NextRequest) {
  const user = await getCurrentApiUser(request);
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  try {
    const parts = resourceQuery(request.nextUrl.searchParams, ['filters']);
    if (parts.view)
      return NextResponse.json(await productListFilters(), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    const [list, filters] = await Promise.all([
      paginatedProducts(request.nextUrl.searchParams, user.userRole?.roleId === 'ADMIN'),
      parts.include.includes('filters') ? productListFilters() : Promise.resolve(undefined),
    ]);
    return NextResponse.json(
      { ...list, ...(filters ? { filters } : {}) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (caught) {
    return NextResponse.json(
      {
        error:
          caught instanceof PaginationError ||
          caught instanceof ResourceQueryError ||
          caught instanceof ProductError
            ? caught.message
            : 'โหลดสินค้าไม่สำเร็จ',
      },
      {
        status:
          caught instanceof PaginationError ||
          caught instanceof ResourceQueryError ||
          caught instanceof ProductError
            ? caught.status
            : 503,
      },
    );
  }
}
export async function POST(request: NextRequest) {
  const { error, user } = await authorizeUserManagement(request, 'สินค้า');
  if (error || !user) return error;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    return NextResponse.json({ product: await createProduct(body, user.id) }, { status: 201 });
  } catch (caught) {
    if (caught instanceof ProductError)
      return NextResponse.json({ error: caught.message }, { status: caught.status });
    return NextResponse.json({ error: 'สร้างสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง' }, { status: 500 });
  }
}
