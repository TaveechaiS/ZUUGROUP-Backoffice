import { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { RecordError } from '@/server/validation/records';
import { customerDocumentsRead } from '@/server/customers/documents';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    return Response.json(
      await customerDocumentsRead(request.nextUrl.searchParams, user.userRole.roleId === 'ADMIN', {
        id: user.id,
        roleId: user.userRole.roleId,
      }),
      { headers },
    );
  } catch (error) {
    const known = error instanceof RecordError;
    return Response.json(
      { error: { message: known ? error.message : 'เชื่อมต่อข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่' } },
      { status: known ? error.status : 503, headers },
    );
  }
}
