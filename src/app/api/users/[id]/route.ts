import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, hasSupabaseAdminKey } from '@/lib/supabase/admin';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { getPrismaClient } from '@/server/db/prisma';
import { isRoleId, passwordIsValid } from '@/server/users/service';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { error, user: actor } = await authorizeUserManagement(request);
  if (error || !actor) return error;
  const { id } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const action = body.action;
  if (!['role', 'status', 'password', 'profile', 'delete', 'restore'].includes(String(action))) {
    return NextResponse.json({ error: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  }
  if (action === 'role' && !isRoleId(body.roleId)) {
    return NextResponse.json({ error: 'บทบาทไม่ถูกต้อง' }, { status: 400 });
  }
  if (action === 'status' && body.status !== 'ACTIVE' && body.status !== 'SUSPENDED') {
    return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  }
  if (action === 'password' && (typeof body.password !== 'string' || !passwordIsValid(body.password))) {
    return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
  }
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if ((action === 'delete' || action === 'restore') && (!reason || [...reason].length > 500)) {
    return NextResponse.json({ error: 'กรุณาระบุเหตุผลไม่เกิน 500 ตัวอักษร' }, { status: 400 });
  }
  if (action === 'profile' && (
    typeof body.employeeCode !== 'string' || !body.employeeCode.trim() ||
    ['create', '.', '..'].includes(body.employeeCode.trim().toLowerCase()) ||
    [...body.employeeCode.trim()].length > 40 ||
    /[\\/?#\x00-\x1f\x7f]/.test(body.employeeCode.trim()) ||
    typeof body.name !== 'string' || !body.name.trim() ||
    typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    typeof body.team !== 'string'
  )) return NextResponse.json({ error: 'ข้อมูลบัญชีไม่ถูกต้อง: รหัสพนักงานต้องไม่เกิน 40 ตัวอักษร และห้ามใช้ create หรือเครื่องหมาย / \\ ? #' }, { status: 400 });

  const prisma = getPrismaClient();
  if (action === 'password') {
    const target = await prisma.user.findUnique({ where: { id }, select: { deletedAt: true } });
    if (!target) return NextResponse.json({ error: 'ไม่พบบัญชี' }, { status: 404 });
    if (target.deletedAt) return NextResponse.json({ error: 'ต้องกู้คืนบัญชีก่อนจัดการข้อมูล' }, { status: 409 });
    if (!hasSupabaseAdminKey()) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า Server key สำหรับจัดการบัญชี' }, { status: 503 });
    const account = await prisma.authAccount.findFirst({ where: { userId: id, provider: 'supabase' } });
    if (!account) return NextResponse.json({ error: 'ไม่พบบัญชี Auth' }, { status: 404 });
    await prisma.auditEvent.create({
      data: { actorUserId: actor.id, targetUserId: id, actorRole: 'ADMIN',
        action: 'PASSWORD_RESET_REQUESTED', requestId: randomUUID() },
    });
    const admin = createSupabaseAdminClient();
    const result = await admin.auth.admin.updateUserById(account.providerUserId, { password: body.password as string });
    if (result.error) return NextResponse.json({ error: 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ' }, { status: 502 });
    await prisma.auditEvent.create({
      data: { actorUserId: actor.id, targetUserId: id, actorRole: 'ADMIN',
        action: 'PASSWORD_RESET', requestId: randomUUID() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'profile') {
    const target = await prisma.user.findUnique({
      where: { id }, include: { authAccounts: { where: { provider: 'supabase' } } },
    });
    if (!target || !target.authAccounts[0]) return NextResponse.json({ error: 'ไม่พบบัญชี' }, { status: 404 });
    if (target.deletedAt) return NextResponse.json({ error: 'ต้องกู้คืนบัญชีก่อนจัดการข้อมูล' }, { status: 409 });
    const employeeCode = (body.employeeCode as string).trim();
    const name = (body.name as string).trim();
    const email = (body.email as string).trim().toLowerCase();
    const team = (body.team as string).trim();
    const duplicate = await prisma.user.findFirst({
      where: { id: { not: id }, OR: [
        { email: { equals: email, mode: 'insensitive' } },
        { employeeCode: { equals: employeeCode, mode: 'insensitive' } },
      ] }, select: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: 'อีเมลหรือรหัสพนักงานนี้มีอยู่แล้ว' }, { status: 409 });

    const emailChanged = email !== target.email;
    if (emailChanged && !hasSupabaseAdminKey()) {
      return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า Server key สำหรับแก้อีเมล' }, { status: 503 });
    }
    const admin = emailChanged ? createSupabaseAdminClient() : null;
    if (admin) {
      const changed = await admin.auth.admin.updateUserById(target.authAccounts[0].providerUserId,
        { email, email_confirm: true });
      if (changed.error) return NextResponse.json({ error: 'แก้อีเมลใน Auth ไม่สำเร็จ' }, { status: 502 });
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id }, data: { employeeCode, name, email, team: team || null } });
        await tx.auditEvent.create({ data: {
          actorUserId: actor.id, targetUserId: id, actorRole: 'ADMIN',
          action: 'USER_PROFILE_CHANGED', requestId: randomUUID(),
          before: { employeeCode: target.employeeCode, name: target.name, email: target.email, team: target.team },
          after: { employeeCode, name, email, team },
        } });
      });
    } catch {
      if (admin) {
        const restored = await admin.auth.admin.updateUserById(target.authAccounts[0].providerUserId,
          { email: target.email, email_confirm: true });
        if (restored.error) return NextResponse.json({ error: 'บันทึกไม่สำเร็จและต้องตรวจอีเมลใน Auth ที่อาจไม่ตรงกับระบบ' }, { status: 500 });
      }
      return NextResponse.json({ error: 'บันทึกข้อมูลบัญชีไม่สำเร็จ' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(87654037)::text AS locked`;
      const currentActor = await tx.user.findUnique({
        where: { id: actor.id }, include: { userRole: true },
      });
      if (!currentActor || currentActor.deletedAt || currentActor.status !== 'ACTIVE' ||
          currentActor.userRole?.roleId !== 'ADMIN') throw new Error('FORBIDDEN');
      const target = await tx.user.findUnique({
        where: { id }, include: { userRole: true, authAccounts: { where: { provider: 'supabase' } } },
      });
      if (!target || !target.userRole) throw new Error('NOT_FOUND');
      if (action === 'delete' || action === 'restore') {
        if (action === 'delete' && target.id === actor.id) throw new Error('SELF_ACCESS_CHANGE');
        if (action === 'delete' && target.deletedAt) throw new Error('ALREADY_DELETED');
        if (action === 'restore' && !target.deletedAt) throw new Error('NOT_DELETED');
        if (action === 'restore') {
          if (!target.authAccounts[0]) throw new Error('AUTH_MISSING');
          const duplicate = await tx.user.findFirst({
            where: { id: { not: id }, OR: [
              { email: { equals: target.email, mode: 'insensitive' } },
              { employeeCode: { equals: target.employeeCode, mode: 'insensitive' } },
            ] }, select: { id: true },
          });
          if (duplicate) throw new Error('DUPLICATE');
        }
        if (action === 'delete' && target.userRole.roleId === 'ADMIN' && target.status === 'ACTIVE') {
          const activeAdmins = await tx.user.count({
            where: { status: 'ACTIVE', deletedAt: null, userRole: { roleId: 'ADMIN' } },
          });
          if (activeAdmins <= 1) throw new Error('LAST_ADMIN');
        }
        const deletedAt = action === 'delete' ? new Date() : null;
        await tx.user.update({ where: { id }, data: {
          deletedAt, deletedById: action === 'delete' ? actor.id : null,
          deleteReason: action === 'delete' ? reason : null,
        } });
        await tx.auditEvent.create({ data: {
          actorUserId: actor.id, targetUserId: id, actorRole: 'ADMIN',
          action: action === 'delete' ? 'USER_DELETED' : 'USER_RESTORED',
          requestId: randomUUID(),
          before: { status: target.status, deletedAt: target.deletedAt?.toISOString() ?? null,
            deletedById: target.deletedById, deleteReason: target.deleteReason },
          after: { status: target.status, deletedAt: deletedAt?.toISOString() ?? null,
            reason },
        } });
        return;
      }
      if (target.deletedAt) throw new Error('DELETED');
      const nextRoleId = action === 'role' ? body.roleId as string : target.userRole.roleId;
      const nextStatus = action === 'status' ? body.status as 'ACTIVE' | 'SUSPENDED' : target.status;
      if (target.id === actor.id && (nextRoleId !== 'ADMIN' || nextStatus !== 'ACTIVE')) {
        throw new Error('SELF_ACCESS_CHANGE');
      }
      if (target.userRole.roleId === 'ADMIN' && target.status === 'ACTIVE' &&
          (nextRoleId !== 'ADMIN' || nextStatus !== 'ACTIVE')) {
        const activeAdmins = await tx.user.count({
          where: { status: 'ACTIVE', deletedAt: null, userRole: { roleId: 'ADMIN' } },
        });
        if (activeAdmins <= 1) throw new Error('LAST_ADMIN');
      }
      if (action === 'role') {
        await tx.userRole.update({ where: { userId: id }, data: { roleId: nextRoleId } });
      } else {
        await tx.user.update({ where: { id }, data: { status: nextStatus } });
      }
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id, targetUserId: id, actorRole: 'ADMIN',
          action: action === 'role' ? 'USER_ROLE_CHANGED' : 'USER_STATUS_CHANGED',
          requestId: randomUUID(),
          before: { roleId: target.userRole.roleId, status: target.status },
          after: { roleId: nextRoleId, status: nextStatus },
        },
      });
    });
  } catch (caught) {
    if (caught instanceof Error && caught.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }
    if (caught instanceof Error && caught.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์จัดการผู้ใช้' }, { status: 403 });
    }
    if (caught instanceof Error && caught.message === 'LAST_ADMIN') {
      return NextResponse.json({ error: 'ต้องมี Admin ที่ใช้งานได้อย่างน้อยหนึ่งบัญชี' }, { status: 409 });
    }
    if (caught instanceof Error && caught.message === 'SELF_ACCESS_CHANGE') {
      return NextResponse.json({ error: 'ไม่สามารถระงับ ลบ หรือเปลี่ยนบทบาท Admin ของบัญชีที่กำลังใช้งาน กรุณาให้ Admin อีกบัญชีดำเนินการ' }, { status: 409 });
    }
    if (caught instanceof Error && ['ALREADY_DELETED', 'NOT_DELETED', 'DELETED'].includes(caught.message)) {
      return NextResponse.json({ error: 'สถานะบัญชีเปลี่ยนแล้ว กรุณาโหลดหน้าใหม่' }, { status: 409 });
    }
    if (caught instanceof Error && caught.message === 'DUPLICATE') {
      return NextResponse.json({ error: 'อีเมลหรือรหัสพนักงานซ้ำ ต้องแก้ข้อมูลก่อนกู้คืน' }, { status: 409 });
    }
    if (caught instanceof Error && caught.message === 'AUTH_MISSING') {
      return NextResponse.json({ error: 'ไม่พบบัญชี Auth ที่เชื่อมโยง กรุณาตรวจสอบก่อนกู้คืน' }, { status: 409 });
    }
    return NextResponse.json({ error: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
