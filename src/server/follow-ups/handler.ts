import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { RecordError } from '@/server/validation/records';
import type { Actor } from '@/server/operations/service';
import { followUpRead, followUpWrite } from './service';

const headers = { 'Cache-Control': 'private, no-store' };

export async function followUpsHandler(request: NextRequest, followUpId?: string) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    if (request.method === 'GET')
      return Response.json(await followUpRead(actor, request.nextUrl.searchParams, followUpId), {
        headers,
      });
    if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
    }
    const result = await followUpWrite(
      actor,
      request.method === 'DELETE' ? { ...(body as object), action: 'cancel' } : body,
      followUpId,
    );
    return Response.json(result, { status: request.method === 'POST' ? 201 : 200, headers });
  } catch (error) {
    const known = error instanceof RecordError;
    return Response.json(
      {
        error: {
          message: known ? error.message : 'เชื่อมต่อข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      { status: known ? error.status : 503, headers },
    );
  }
}
