import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { RecordError } from '@/server/validation/records';
import type { Actor } from '@/server/operations/service';
import { purchaseRead, purchaseWrite, supplierRead, supplierWrite } from './service';

const headers = { 'Cache-Control': 'private, no-store' };

export async function purchasingHandler(
  request: NextRequest,
  resource: 'suppliers' | 'purchases',
  recordId?: string,
) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    if (request.method === 'GET') {
      const params = request.nextUrl.searchParams;
      const result =
        resource === 'suppliers'
          ? await supplierRead(actor, params, recordId)
          : await purchaseRead(actor, params, recordId);
      return Response.json(result, { headers });
    }
    if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
    }
    if (request.method === 'DELETE')
      body = { ...(body as object), action: resource === 'suppliers' ? 'delete' : 'cancel' };
    const result =
      resource === 'suppliers'
        ? await supplierWrite(actor, body, recordId)
        : await purchaseWrite(actor, body, recordId);
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
