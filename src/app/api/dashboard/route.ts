import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { dashboardData } from '@/server/dashboard/service';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole)
      return Response.json({ error: { message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401, headers });
    const data = await dashboardData({
      id: user.id,
      name: user.name,
      roleId: user.userRole.roleId,
    });
    return Response.json({ data }, { headers });
  } catch {
    return Response.json(
      { error: { message: 'เชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่' } },
      { status: 503, headers },
    );
  }
}
