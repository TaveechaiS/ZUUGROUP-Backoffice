import { resourceQuery, ResourceQueryError } from '@/server/validation/resource-api';
import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, hasSupabaseAdminKey } from '@/lib/supabase/admin';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { getPrismaClient } from '@/server/db/prisma';
import { paginatedUsers } from '@/server/users/service';
import { userCreateInput } from '@/server/validation/users';
import { PaginationError } from '@/server/pagination';
import { RecordError } from '@/server/validation/records';
import { assignUserTerritory } from '@/server/users/territory';

export async function GET(request: NextRequest) {
  const { error } = await authorizeUserManagement(request);
  if (error) return error;
  try {
    const { view } = resourceQuery(request.nextUrl.searchParams, ['options']);
    if (view === 'options') {
      const params = new URLSearchParams(request.nextUrl.searchParams);
      params.set('role', params.get('roleId') ?? '');
      params.set('status', 'ACTIVE');
      params.set('deleted', 'false');
      const result = await paginatedUsers(params);
      return NextResponse.json(
        {
          data: result.users.map((user) => ({
            id: user.id,
            code: user.employeeCode,
            name: user.name,
          })),
          pagination: result.pagination,
        },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return NextResponse.json(await paginatedUsers(request.nextUrl.searchParams), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (caught) {
    return NextResponse.json(
      {
        error:
          caught instanceof PaginationError ||
          caught instanceof ResourceQueryError ||
          caught instanceof RecordError
            ? caught.message
            : 'โหลดผู้ใช้งานไม่สำเร็จ',
      },
      {
        status:
          caught instanceof PaginationError ||
          caught instanceof ResourceQueryError ||
          caught instanceof RecordError
            ? 400
            : 503,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, user: actor } = await authorizeUserManagement(request);
  if (error || !actor) return error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const input = userCreateInput(body);
  if (!input)
    return NextResponse.json(
      { error: 'กรุณากรอกข้อมูลให้ครบและตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร' },
      { status: 400 },
    );
  const { name, email, team, password, roleId, territoryId } = input;

  const prisma = getPrismaClient();
  const duplicate = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ error: 'อีเมลนี้มีอยู่แล้ว' }, { status: 409 });
  if (!hasSupabaseAdminKey()) {
    return NextResponse.json(
      { error: 'ยังไม่ได้ตั้งค่า Server key สำหรับจัดการบัญชี กรุณาแจ้งผู้ดูแลระบบ' },
      { status: 503 },
    );
  }

  const admin = createSupabaseAdminClient();
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) {
    return NextResponse.json(
      { error: 'สร้างบัญชี Auth ไม่สำเร็จ กรุณาตรวจอีเมลหรือบัญชีที่มีอยู่' },
      { status: 409 },
    );
  }
  const employeeCode = `EMP-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeCode,
          name,
          email,
          team: team || null,
          authAccounts: { create: { provider: 'supabase', providerUserId: created.data.user!.id } },
          userRole: { create: { roleId } },
        },
      });
      if (territoryId) await assignUserTerritory(tx, user.id, territoryId);
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          targetUserId: user.id,
          actorRole: 'ADMIN',
          action: 'USER_CREATED',
          requestId: randomUUID(),
          after: { employeeCode, email, roleId, status: 'ACTIVE', territoryId: territoryId ?? null },
        },
      });
    });
  } catch (caught) {
    const cleanup = await admin.auth.admin.deleteUser(created.data.user.id);
    return NextResponse.json(
      {
        error: cleanup.error
          ? 'บันทึกผู้ใช้ไม่สำเร็จและต้องให้เจ้าของโครงการตรวจบัญชี Auth ที่ค้างอยู่'
          : caught instanceof RecordError ? caught.message : 'บันทึกผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง',
      },
      { status: !cleanup.error && caught instanceof RecordError ? caught.status : 500 },
    );
  }
  return NextResponse.json({ ok: true, employeeCode }, { status: 201 });
}
