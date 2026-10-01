import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth/current-user';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { createProductMaster, productMasters, ProductError } from '@/server/products/service';

export async function GET() {
  if (!await getCurrentUser()) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  return NextResponse.json(await productMasters());
}
export async function POST(request: NextRequest) {
  const { error, user } = await authorizeUserManagement(request, 'ข้อมูลแม่สินค้า');
  if (error || !user) return error;
  try {
    const body = await request.json() as Record<string, unknown>;
    return NextResponse.json({ item: await createProductMaster(body.type, body, user.id) }, { status: 201 });
  } catch (caught) {
    if (caught instanceof ProductError) return NextResponse.json({ error: caught.message }, { status: caught.status });
    return NextResponse.json({ error: 'เพิ่มรายการแม่ไม่สำเร็จ' }, { status: 500 });
  }
}
