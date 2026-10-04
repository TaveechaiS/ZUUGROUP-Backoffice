import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { RecordError } from '@/server/validation/records';
import { resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
import {
  inventoryRead,
  inventoryWrite,
  operationOptions,
  orderRead,
  orderWrite,
  type Actor,
} from './service';
const headers = { 'Cache-Control': 'private, no-store' };
export async function operationsHandler(
  request: NextRequest,
  resource: 'inventory' | 'orders',
  orderId?: string,
) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    if (request.method === 'GET') {
      const params = request.nextUrl.searchParams;
      const query = resourceQuery(
        params,
        resource === 'inventory'
          ? ['stock', 'products', 'lots', 'receipts', 'movements', 'options']
          : ['options'],
      );
      if (query.include.length) throw new ResourceQueryError('API นี้ใช้ view ไม่รองรับ include');
      const result =
        resource === 'inventory'
          ? await inventoryRead(actor, params)
          : params.get('view') === 'options'
            ? await operationOptions(actor)
            : await orderRead(actor, params, orderId);
      return Response.json(result, { headers });
    }
    if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
    }
    const result =
      resource === 'inventory'
        ? await inventoryWrite(actor, body)
        : await orderWrite(
            actor,
            request.method === 'DELETE' ? { ...(body as object), action: 'cancel' } : body,
            orderId,
          );
    return Response.json(result, { status: request.method === 'POST' ? 201 : 200, headers });
  } catch (error) {
    return Response.json(
      {
        error: {
          message:
            error instanceof RecordError || error instanceof ResourceQueryError
              ? error.message
              : 'เชื่อมต่อข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      {
        status:
          error instanceof RecordError || error instanceof ResourceQueryError ? error.status : 503,
        headers,
      },
    );
  }
}
