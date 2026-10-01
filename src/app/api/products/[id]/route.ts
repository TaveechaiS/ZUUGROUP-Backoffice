import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { ProductError, updateProduct } from '@/server/products/service';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error, user } = await authorizeUserManagement(request, 'สินค้า');
  if (error || !user) return error;
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    return NextResponse.json({ product: await updateProduct(id, body, user.id) });
  } catch (caught) {
    if (caught instanceof ProductError) return NextResponse.json({ error: caught.message }, { status: caught.status });
    return NextResponse.json({ error: 'บันทึกสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง' }, { status: 500 });
  }
}
