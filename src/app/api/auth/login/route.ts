import { isLoginBody } from '@/server/validation/auth';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { signIn } from '@/server/auth/login';

const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 403, headers });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'ข้อมูลไม่ถูกต้อง กรุณาส่ง JSON ที่มีอีเมลและรหัสผ่าน' },
      { status: 400, headers },
    );
  }
  if (!isLoginBody(body))
    return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400, headers });
  try {
    const result = await signIn(body.email, body.password);
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: result.status, headers });
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json(
      { error: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง' },
      { status: 500, headers },
    );
  }
}
