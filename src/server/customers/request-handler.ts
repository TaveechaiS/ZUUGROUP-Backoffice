import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { RecordError } from '@/server/validation/records';
import { CustomerError } from '@/server/validation/customer-error';
import type { Actor } from '@/server/operations/service';
import {
  customerRequestDetail,
  customerRequestList,
  reviewCustomerRequest,
  submitCustomerRequest,
} from './requests';

const headers = { 'Cache-Control': 'private, no-store' };

export async function customerRequestsHandler(request: NextRequest, requestId?: string) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    if (request.method === 'GET')
      return Response.json(
        requestId
          ? await customerRequestDetail(actor, requestId)
          : await customerRequestList(actor, request.nextUrl.searchParams),
        { headers },
      );
    if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
    }
    const result =
      body?.action === 'submit'
        ? await submitCustomerRequest(requestId ?? '', actor)
        : await reviewCustomerRequest(requestId ?? '', actor, body);
    return Response.json({ data: result }, { headers });
  } catch (error) {
    const known = error instanceof RecordError || error instanceof CustomerError;
    return Response.json(
      {
        error: {
          message: known ? (error as Error).message : 'เชื่อมต่อข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      { status: known ? (error as RecordError).status : 503, headers },
    );
  }
}
