import { NextResponse, type NextRequest } from 'next/server';
import { recordHandler } from '@/server/records/handlers';
import { customerHandler } from '@/server/customers/handler';
import { getCurrentApiUser } from '@/server/auth/current-user';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// view=options/filters/config stays on the shared records API for relation pickers in other
// modules, but customer names are real data now, so it requires a signed-in user.
export async function GET(request: NextRequest) {
  if (!request.nextUrl.searchParams.has('view')) return customerHandler(request, 'list');
  if (!(await getCurrentApiUser(request))?.userRole)
    return NextResponse.json(
      { error: 'กรุณาเข้าสู่ระบบ' },
      { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
    );
  return recordHandler(request, 'customers');
}
