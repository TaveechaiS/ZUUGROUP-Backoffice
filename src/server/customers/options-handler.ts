import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { CustomerError } from '@/server/validation/customer-error';
import { batchCustomerOptions, listCustomerOptions, writeCustomerOption } from './options';

export async function customerOptionsHandler(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new CustomerError('กรุณาเข้าสู่ระบบ', 401);
    const admin = user.userRole.roleId === 'ADMIN';
    if (request.method === 'GET')
      return Response.json(
        request.nextUrl.searchParams.has('kinds')
          ? await batchCustomerOptions(request.nextUrl.searchParams)
          : await listCustomerOptions(request.nextUrl.searchParams, admin),
        { headers },
      );
    if (!admin || !hasSameOrigin(request))
      throw new CustomerError('ไม่มีสิทธิ์จัดการข้อมูลพื้นฐานลูกค้า', 403);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new CustomerError('กรุณาส่ง JSON ที่ถูกต้อง');
    }
    return Response.json(
      { item: await writeCustomerOption(body, user.id, request.method as 'POST' | 'PATCH') },
      { status: request.method === 'POST' ? 201 : 200, headers },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof CustomerError ? error.message : 'เชื่อมต่อข้อมูลไม่ได้ กรุณาลองใหม่',
      },
      { status: error instanceof CustomerError ? error.status : 503, headers },
    );
  }
}
