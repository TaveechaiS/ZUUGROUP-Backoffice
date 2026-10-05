import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { ProductError } from '@/server/validation/products';
import { listProductOptions, writeProductOption } from './options';
export async function productOptionsHandler(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new ProductError('กรุณาเข้าสู่ระบบ', 401);
    const admin = user.userRole.roleId === 'ADMIN';
    if (request.method === 'GET')
      return Response.json(await listProductOptions(request.nextUrl.searchParams, admin), {
        headers,
      });
    if (!admin || !hasSameOrigin(request))
      throw new ProductError('ไม่มีสิทธิ์จัดการข้อมูลพื้นฐานสินค้า', 403);
    if (request.method !== 'POST' && request.method !== 'PATCH')
      throw new ProductError('คำสั่งไม่รองรับ', 405);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ProductError('กรุณาส่ง JSON ที่ถูกต้อง');
    }
    return Response.json(
      { item: await writeProductOption(body, user.id, request.method) },
      { status: request.method === 'POST' ? 201 : 200, headers },
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof ProductError ? error.message : 'เชื่อมต่อข้อมูลไม่ได้ กรุณาลองใหม่',
      },
      { status: error instanceof ProductError ? error.status : 503, headers },
    );
  }
}
