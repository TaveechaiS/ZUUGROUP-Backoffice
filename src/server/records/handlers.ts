import { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { mutationBody, resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
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
export async function recordHandler(request: NextRequest, key: string, id?: string) {
  try {
    const entity = recordModule(key),
      params = request.nextUrl.searchParams;
    const write = request.method !== 'GET';
    const query = !write
      ? resourceQuery(params, id ? [] : ['filters', 'config', 'options'])
      : { view: null, include: [] };
    const needsAdmin = write || params.get('deleted') === 'true';
    let user: Awaited<ReturnType<typeof getCurrentApiUser>> = null;
    if (needsAdmin || query.view === 'config' || query.include.includes('config'))
      user = await getCurrentApiUser(request);
    if (needsAdmin) {
      if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
      if (!user) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
      if (user.userRole?.roleId !== 'ADMIN') throw new RecordError(403, 'ไม่มีสิทธิ์จัดการข้อมูล');
    }
    let result: unknown;
    if (!write) {
      const metadata = async (part: string) =>
        part === 'config'
          ? recordConfig(entity, user?.userRole?.roleId === 'ADMIN')
          : part === 'filters'
            ? recordFilters(entity)
            : recordOptions(entity, params);
      if (query.view) result = await metadata(query.view);
      else if (id) result = await recordDetail(entity, id, params.get('deleted') === 'true');
      else {
        const [list, entries] = await Promise.all([
          recordList(entity, params),
          Promise.all(
            query.include
              .filter((part) => part !== 'options')
              .map(async (part) => {
                const response = await metadata(part);
                return [part, part === 'options' ? response : response.data];
              }),
          ),
        ]);
        result = {
          ...list,
          ...Object.fromEntries(entries),
          ...(query.include.includes('options')
            ? {
                options: {
                  data: list.data.map((row) => ({ id: row.id, code: row.code, name: row.name })),
                  pagination: list.pagination,
                },
              }
            : {}),
        };
      }
    } else {
      let body: unknown = {};
      const rawBody = await request.text();
      if (rawBody.trim()) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
        }
      }
      const command = mutationBody(body, request.method, ['reason']);
      const operation =
        request.method === 'DELETE'
          ? 'delete'
          : command.action === 'restore'
            ? 'restore'
            : request.method === 'PATCH'
              ? 'update'
              : 'create';
      if ((operation === 'create' && id) || (operation !== 'create' && !id))
        throw new RecordError(405, 'วิธีเรียก API ไม่ถูกต้อง');
      if (operation === 'restore') {
        body = { ...command };
        delete (body as Record<string, unknown>).action;
      }
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
            e instanceof RecordError || e instanceof ResourceQueryError
              ? e.message
              : 'เชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว กรุณาลองใหม่',
        },
      },
      {
        status: e instanceof RecordError || e instanceof ResourceQueryError ? e.status : 503,
        headers,
      },
    );
  }
}
