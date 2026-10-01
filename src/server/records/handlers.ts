import { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import {
  recordConfig,
  recordDetail,
  recordFilters,
  recordList,
  recordModule,
  recordOptions,
  recordWrite,
  RecordError,
} from './service';
const headers = { 'Cache-Control': 'no-store' };
export async function recordHandler(
  request: NextRequest,
  key: string,
  id?: string,
  action?: 'filters' | 'config' | 'options' | 'restore',
) {
  try {
    const entity = recordModule(key),
      params = request.nextUrl.searchParams;
    const write = request.method !== 'GET';
    const needsAdmin = write || params.get('deleted') === 'true';
    let user: Awaited<ReturnType<typeof getCurrentApiUser>> = null;
    if (needsAdmin || action === 'config') user = await getCurrentApiUser(request);
    if (needsAdmin) {
      if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
      if (!user) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
      if (user.userRole?.roleId !== 'ADMIN') throw new RecordError(403, 'ไม่มีสิทธิ์จัดการข้อมูล');
    }
    let result: unknown;
    if (request.method === 'GET')
      result =
        action === 'config'
          ? await recordConfig(entity, user?.userRole?.roleId === 'ADMIN')
          : action === 'filters'
            ? await recordFilters(entity)
            : action === 'options'
              ? await recordOptions(entity, params)
              : id
                ? await recordDetail(entity, id, params.get('deleted') === 'true')
                : await recordList(entity, params);
    else {
      let body: unknown = {};
      const rawBody = await request.text();
      if (rawBody.trim()) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
        }
      }
      const operation =
        action === 'restore'
          ? 'restore'
          : request.method === 'DELETE'
            ? 'delete'
            : request.method === 'PATCH'
              ? 'update'
              : 'create';
      if ((operation === 'create' && id) || (operation !== 'create' && !id))
        throw new RecordError(405, 'วิธีเรียก API ไม่ถูกต้อง');
      result = await recordWrite(entity, operation, id ?? null, body, {
        id: user!.id,
        roleId: user!.userRole!.roleId,
      });
    }
    return Response.json(result, { status: write && !id ? 201 : 200, headers });
  } catch (e) {
    return Response.json(
      {
        error: {
          message:
            e instanceof RecordError ? e.message : 'เชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      { status: e instanceof RecordError ? e.status : 503, headers },
    );
  }
}
