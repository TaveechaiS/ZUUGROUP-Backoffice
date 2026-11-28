import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { nextProductSequence } from '@/server/products/service';

export async function GET(request: NextRequest) {
  if (!(await getCurrentApiUser(request)))
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const categoryId = request.nextUrl.searchParams.get('categoryId') ?? '';
  const dosageFormId = request.nextUrl.searchParams.get('dosageFormId') ?? '';
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dosageFormId)
  ) {
    return NextResponse.json({ error: 'กรุณาเลือกหมวดและรูปแบบยา' }, { status: 400 });
  }
  return NextResponse.json({
    sequence: String(await nextProductSequence(categoryId, dosageFormId)).padStart(4, '0'),
  });
}
