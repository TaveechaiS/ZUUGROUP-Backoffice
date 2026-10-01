import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth/current-user';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { createProduct, listProducts, ProductError } from '@/server/products/service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  return NextResponse.json({ products: await listProducts(user.userRole?.roleId === 'ADMIN') });
}
export async function POST(request: NextRequest) {
  const { error, user } = await authorizeUserManagement(request, 'สินค้า');
  if (error || !user) return error;
  try {
    const body = await request.json() as Record<string, unknown>;
    return NextResponse.json({ product: await createProduct(body, user.id) }, { status: 201 });
  } catch (caught) {
    if (caught instanceof ProductError) return NextResponse.json({ error: caught.message }, { status: caught.status });
    return NextResponse.json({ error: 'สร้างสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง' }, { status: 500 });
  }
}
