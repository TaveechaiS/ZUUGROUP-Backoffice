import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { ProductError } from '@/server/validation/products';
import {
  beginProductRequest,
  beginProductEditRequest,
  cancelProductRequest,
  commitProductRequest,
  nextFullSequence,
  productRequestStatus,
  readProductFile,
  uploadProductFile,
} from './full';

export async function fullProductHandler(
  request: NextRequest,
  action: 'next' | 'begin' | 'begin-edit' | 'upload' | 'commit' | 'cancel' | 'file' | 'status',
  id?: string,
) {
  try {
    if (action === 'file') {
      const actor = await getCurrentApiUser(request);
      if (!actor) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
      const result = await readProductFile(id!, actor.userRole?.roleId === 'ADMIN');
      return new NextResponse(result.bytes, {
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
    const { user, error } = await authorizeUserManagement(request, 'สินค้า');
    if (error || !user) return error;
    if (action === 'status')
      return NextResponse.json(await productRequestStatus(id!, user.id), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    if (action === 'next')
      return NextResponse.json(
        {
          sequence: await nextFullSequence(
            request.nextUrl.searchParams.get('groupId') ?? '',
            request.nextUrl.searchParams.get('formatId') ?? '',
          ),
        },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    if (action === 'begin') {
      const body = await request.json();
      return NextResponse.json(await beginProductRequest(body.requestId, body.data, user.id), {
        status: 201,
      });
    }
    if (action === 'begin-edit')
      return NextResponse.json(await beginProductEditRequest(id!, await request.json(), user.id), {
        status: 201,
      });
    if (action === 'upload') {
      if (Number(request.headers.get('content-length') ?? 0) > 10485760 + 65536)
        throw new ProductError('ไฟล์ต้องไม่เกิน 10 MB', 413);
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File) || form.getAll('file').length !== 1)
        throw new ProductError('กรุณาแนบไฟล์ทีละไฟล์');
      return NextResponse.json(
        await uploadProductFile(
          id!,
          String(form.get('fileId') ?? ''),
          user.id,
          String(form.get('kind') ?? ''),
          file,
        ),
        { status: 201 },
      );
    }
    if (action === 'commit')
      return NextResponse.json({ product: await commitProductRequest(id!, user.id) });
    return NextResponse.json(await cancelProductRequest(id!, user.id));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ProductError
            ? error.message
            : error instanceof SyntaxError
              ? 'ข้อมูลไม่ถูกต้อง'
              : 'ดำเนินการสินค้าไม่สำเร็จ กรุณาลองใหม่',
      },
      {
        status:
          error instanceof ProductError ? error.status : error instanceof SyntaxError ? 400 : 503,
      },
    );
  }
}
