import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentApiUser } from '@/server/auth/current-user';
import { hasSameOrigin } from '@/server/auth/api-authorization';
import { CustomerError } from '@/server/validation/customer-error';
import {
  customerDetail,
  deleteCustomer,
  listCustomers,
  nextCustomerSequence,
  restoreCustomer,
} from './service';
import {
  beginCustomerEditRequest,
  beginCustomerRequest,
  cancelCustomerRequest,
  commitCustomerRequest,
  customerRequestStatus,
  readCustomerFile,
  uploadCustomerFile,
} from './full';

type Action =
  | 'list'
  | 'detail'
  | 'next'
  | 'begin'
  | 'beginEdit'
  | 'status'
  | 'upload'
  | 'commit'
  | 'cancel'
  | 'file'
  | 'delete'
  | 'restore';
const headers = { 'Cache-Control': 'private, no-store' };

export async function customerHandler(request: NextRequest, action: Action, id?: string) {
  try {
    const user = await getCurrentApiUser(request);
    if (!user?.userRole) throw new CustomerError('กรุณาเข้าสู่ระบบ', 401);
    const admin = user.userRole.roleId === 'ADMIN';
    if (action === 'list')
      return NextResponse.json(
        await listCustomers(request.nextUrl.searchParams, admin, {
          id: user.id,
          roleId: user.userRole.roleId,
        }),
        {
          headers,
        },
      );
    if (action === 'detail')
      return NextResponse.json(
        await customerDetail(id!, admin, request.nextUrl.searchParams.get('deleted') === 'true', {
          id: user.id,
          roleId: user.userRole.roleId,
        }),
        { headers },
      );
    if (action === 'file') {
      const result = await readCustomerFile(id!, admin);
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
    const requester =
      ['SALES', 'MANAGER'].includes(user.userRole.roleId) &&
      ['begin', 'upload', 'status', 'cancel', 'next'].includes(action);
    if (!admin && !requester) throw new CustomerError('ไม่มีสิทธิ์จัดการข้อมูลลูกค้า', 403);
    if (action !== 'next' && action !== 'status' && !hasSameOrigin(request))
      throw new CustomerError('คำขอไม่ถูกต้อง', 403);
    if (action === 'next')
      return NextResponse.json(
        {
          sequence: await nextCustomerSequence(
            request.nextUrl.searchParams.get('codeGroupId') ?? '',
          ),
        },
        { headers },
      );
    if (action === 'status')
      return NextResponse.json(await customerRequestStatus(id!, user.id), { headers });
    if (action === 'delete') {
      let body: unknown = {};
      try {
        body = await request.json();
      } catch {
        throw new CustomerError('กรุณาระบุเหตุผลการลบ');
      }
      return NextResponse.json({ customer: await deleteCustomer(id!, body, user.id) }, { headers });
    }
    if (action === 'restore') {
      let body: { action?: unknown } = {};
      try {
        body = await request.json();
      } catch {
        throw new CustomerError('กรุณาส่ง JSON ที่ถูกต้อง');
      }
      if (body?.action !== 'restore') throw new CustomerError('คำสั่งไม่รองรับ');
      return NextResponse.json({ customer: await restoreCustomer(id!, user.id) }, { headers });
    }
    if (action === 'beginEdit') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new CustomerError('กรุณาส่ง JSON ที่ถูกต้อง');
      }
      return NextResponse.json(await beginCustomerEditRequest(id!, body, user.id), {
        status: 201,
        headers,
      });
    }
    if (action === 'begin') {
      let body: { requestId?: unknown; data?: unknown };
      try {
        body = await request.json();
      } catch {
        throw new CustomerError('กรุณาส่ง JSON ที่ถูกต้อง');
      }
      return NextResponse.json(
        await beginCustomerRequest(String(body?.requestId ?? ''), body?.data, user.id),
        { status: 201, headers },
      );
    }
    if (action === 'upload') {
      if (Number(request.headers.get('content-length') ?? 0) > 10485760 + 65536)
        throw new CustomerError('ไฟล์ต้องไม่เกิน 10 MB', 413);
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File) || form.getAll('file').length !== 1)
        throw new CustomerError('กรุณาแนบไฟล์ทีละไฟล์');
      return NextResponse.json(
        await uploadCustomerFile(
          id!,
          String(form.get('fileId') ?? ''),
          user.id,
          String(form.get('documentTypeId') ?? ''),
          file,
        ),
        { status: 201, headers },
      );
    }
    if (action === 'commit')
      return NextResponse.json(
        { customer: await commitCustomerRequest(id!, user.id) },
        { headers },
      );
    return NextResponse.json(await cancelCustomerRequest(id!, user.id), { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof CustomerError
            ? error.message
            : 'ดำเนินการข้อมูลลูกค้าไม่สำเร็จ กรุณาลองใหม่',
      },
      { status: error instanceof CustomerError ? error.status : 503, headers },
    );
  }
}
