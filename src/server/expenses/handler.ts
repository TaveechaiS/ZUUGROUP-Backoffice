import type { NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { RecordError } from '@/server/validation/records';
import type { Actor } from '@/server/operations/service';
import { expenseRead, expenseWrite, readExpenseFile, uploadExpenseFile } from './service';

const headers = { 'Cache-Control': 'private, no-store' };

export async function expensesHandler(
  request: NextRequest,
  target: { expenseId?: string; fileId?: string; upload?: boolean } = {},
) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new RecordError(401, 'กรุณาเข้าสู่ระบบ');
    const actor: Actor = { id: user.id, name: user.name, roleId: user.userRole.roleId };
    if (target.fileId) {
      const result = await readExpenseFile(actor, target.fileId);
      return new Response(result.bytes, {
        headers: {
          'Content-Type': result.file.type,
          'Content-Length': String(result.file.size),
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "sandbox; default-src 'none'",
          'Content-Disposition': `inline; filename="attachment"; filename*=UTF-8''${encodeURIComponent(result.file.name)}`,
        },
      });
    }
    if (request.method === 'GET')
      return Response.json(
        await expenseRead(actor, request.nextUrl.searchParams, target.expenseId),
        { headers },
      );
    if (!hasSameOrigin(request)) throw new RecordError(403, 'คำขอไม่ถูกต้อง');
    if (target.upload) {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        throw new RecordError(400, 'กรุณาแนบไฟล์');
      }
      return Response.json(await uploadExpenseFile(actor, target.expenseId!, form.get('file')), {
        status: 201,
        headers,
      });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new RecordError(400, 'กรุณาส่ง JSON ที่ถูกต้อง');
    }
    const result = await expenseWrite(
      actor,
      request.method === 'DELETE' ? { ...(body as object), action: 'cancel' } : body,
      target.expenseId,
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
