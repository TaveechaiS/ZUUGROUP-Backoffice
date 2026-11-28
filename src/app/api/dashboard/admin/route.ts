import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { adminDashboard } from '@/server/dashboard/admin';
import { RecordError } from '@/server/validation/records';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    if (user.userRole.roleId !== 'ADMIN') throw new RecordError(403, 'ไม่มีสิทธิ์ดูข้อมูลนี้');
    return Response.json(await adminDashboard(new URL(request.url).searchParams), { headers });
  } catch (error) {
    const known = error instanceof RecordError;
    return Response.json(
      {
        error: {
          message: known ? error.message : 'เชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      { status: known ? error.status : 503, headers },
    );
  }
}
