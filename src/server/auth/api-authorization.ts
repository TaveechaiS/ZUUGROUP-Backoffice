import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth/current-user';

export async function authorizeUserManagement(request: NextRequest, resource = 'ผู้ใช้') {
  const origin = request.headers.get('origin');
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol === 'http' || forwardedProtocol === 'https'
    ? `${forwardedProtocol}:` : request.nextUrl.protocol;
  const hosts = [request.headers.get('host'), request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()]
    .filter((host): host is string => Boolean(host));
  let sameOrigin = !origin;
  if (origin) {
    try {
      const source = new URL(origin);
      sameOrigin = source.origin === origin && source.protocol === protocol && hosts.includes(source.host);
    } catch {
      sameOrigin = false;
    }
  }
  if (!sameOrigin) {
    return { error: NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 403 }), user: null };
  }

  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 }), user: null };
  if (user.userRole?.roleId !== 'ADMIN') {
    return { error: NextResponse.json({ error: `ไม่มีสิทธิ์จัดการ${resource}` }, { status: 403 }), user: null };
  }
  return { error: null, user };
}
