import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, hasSupabaseAdminKey } from '@/lib/supabase/admin';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { getPrismaClient } from '@/server/db/prisma';
import { isRoleId, listUsers, passwordIsValid } from '@/server/users/service';

export async function GET(request: NextRequest) {
  const { error } = await authorizeUserManagement(request);
  if (error) return error;
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: NextRequest) {
  const { error, user: actor } = await authorizeUserManagement(request);
  if (error || !actor) return error;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const team = typeof body.team === 'string' ? body.team.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isRoleId(body.roleId) || !passwordIsValid(password)) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบและตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
  }
  const roleId = body.roleId;

  const prisma = getPrismaClient();
  const duplicate = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ error: 'อีเมลนี้มีอยู่แล้ว' }, { status: 409 });
  if (!hasSupabaseAdminKey()) {
    return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า Server key สำหรับจัดการบัญชี กรุณาแจ้งผู้ดูแลระบบ' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) {
    return NextResponse.json({ error: 'สร้างบัญชี Auth ไม่สำเร็จ กรุณาตรวจอีเมลหรือบัญชีที่มีอยู่' }, { status: 409 });
  }
  const employeeCode = `EMP-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeCode, name, email, team: team || null,
          authAccounts: { create: { provider: 'supabase', providerUserId: created.data.user!.id } },
          userRole: { create: { roleId } },
        },
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id, targetUserId: user.id, actorRole: 'ADMIN',
          action: 'USER_CREATED', requestId: randomUUID(),
          after: { employeeCode, email, roleId, status: 'ACTIVE' },
        },
      });
    });
  } catch {
    const cleanup = await admin.auth.admin.deleteUser(created.data.user.id);
    return NextResponse.json({
      error: cleanup.error
        ? 'บันทึกผู้ใช้ไม่สำเร็จและต้องให้เจ้าของโครงการตรวจบัญชี Auth ที่ค้างอยู่'
        : 'บันทึกผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง',
    }, { status: 500 });
  }
  return NextResponse.json({ ok: true, employeeCode }, { status: 201 });
}
