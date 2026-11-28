import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { productHistory } from '@/server/products/history';
import { ProductError } from '@/server/validation/products';
import { PaginationError } from '@/server/pagination';
import { RecordError } from '@/server/validation/records';
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentApiUser(request);
  if (!actor) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  try {
    const { id } = await context.params;
    const role = actor.userRole?.roleId ?? '';
    return NextResponse.json(
      await productHistory(
        id,
        request.nextUrl.searchParams,
        role === 'ADMIN',
        ['ADMIN', 'ACCOUNTING_CFO'].includes(role),
      ),
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    const known =
      error instanceof ProductError ||
      error instanceof PaginationError ||
      error instanceof RecordError;
    return NextResponse.json(
      { error: known ? error.message : 'โหลดประวัติไม่สำเร็จ' },
      {
        status:
          error instanceof ProductError || error instanceof RecordError
            ? error.status
            : error instanceof PaginationError
              ? 400
              : 503,
      },
    );
  }
}
