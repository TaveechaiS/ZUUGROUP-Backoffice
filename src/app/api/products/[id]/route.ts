import { getCurrentApiUser } from '@/server/auth/current-user';
import { getProductById } from '@/server/products/service';
import { resourceQuery } from '@/server/validation/resource-api';
import { uuidPattern } from '@/server/validation/products';
import { mutationBody, ResourceQueryError } from '@/server/validation/resource-api';
import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { ProductError, updateProduct } from '@/server/products/service';

async function mutate(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error, user } = await authorizeUserManagement(request, 'สินค้า');
  if (error || !user) return error;
  try {
    const { id } = await context.params;
    const body = mutationBody(await request.json(), request.method, ['reason']);
    if (request.method === 'DELETE') body.action = 'delete';
    return NextResponse.json({ product: await updateProduct(id, body, user.id) });
  } catch (caught) {
    if (caught instanceof ProductError || caught instanceof ResourceQueryError)
      return NextResponse.json({ error: caught.message }, { status: caught.status });
    return NextResponse.json({ error: 'บันทึกสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return mutate(request, context);
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return mutate(request, context);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentApiUser(request);
  if (!actor) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  try {
    resourceQuery(request.nextUrl.searchParams, []);
    const { id } = await context.params;
    if (!uuidPattern.test(id)) throw new ResourceQueryError('ID ต้องเป็น UUID');
    const product = await getProductById(
      id,
      ['ADMIN', 'ACCOUNTING_CFO'].includes(actor.userRole?.roleId ?? ''),
    );
    if (!product || (product.deletedAt && actor.userRole?.roleId !== 'ADMIN'))
      return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
    return NextResponse.json({ product }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof ResourceQueryError ? e.message : 'โหลดสินค้าไม่สำเร็จ' },
      { status: e instanceof ResourceQueryError ? 400 : 503 },
    );
  }
}
