import { getUserById } from '@/server/users/service';
import { resourceQuery } from '@/server/validation/resource-api';
import { uuidPattern } from '@/server/validation/products';
import { mutationBody, ResourceQueryError } from '@/server/validation/resource-api';
import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, hasSupabaseAdminKey } from '@/lib/supabase/admin';
import { authorizeUserManagement } from '@/server/auth/api-authorization';
import { getPrismaClient } from '@/server/db/prisma';
import { userUpdateError } from '@/server/validation/users';

type Context = { params: Promise<{ id: string }> };

async function mutate(request: NextRequest, context: Context) {
  const { error, user: actor } = await authorizeUserManagement(request);
  if (error || !actor) return error;
  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = mutationBody(await request.json(), request.method, ['reason']);
    if (request.method === 'DELETE') body.action = 'delete';
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof ResourceQueryError ? caught.message : 'ข้อมูลไม่ถูกต้อง' },
      { status: 400 },
    );
  }
  const validationError = userUpdateError(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const action = body.action;
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  const prisma = getPrismaClient();
  if (action === 'password') {
    const target = await prisma.user.findUnique({ where: { id }, select: { deletedAt: true } });
    if (!target) return NextResponse.json({ error: 'ไม่พบบัญชี' }, { status: 404 });
    if (target.deletedAt)
      return NextResponse.json({ error: 'ต้องกู้คืนบัญชีก่อนจัดการข้อมูล' }, { status: 409 });
    if (!hasSupabaseAdminKey())
      return NextResponse.json(
        { error: 'ยังไม่ได้ตั้งค่า Server key สำหรับจัดการบัญชี' },
        { status: 503 },
      );
    const account = await prisma.authAccount.findFirst({
      where: { userId: id, provider: 'supabase' },
    });
    if (!account) return NextResponse.json({ error: 'ไม่พบบัญชี Auth' }, { status: 404 });
    await prisma.auditEvent.create({
      data: {
        actorUserId: actor.id,
        targetUserId: id,
        actorRole: 'ADMIN',
        action: 'PASSWORD_RESET_REQUESTED',
        requestId: randomUUID(),
      },
    });
    const admin = createSupabaseAdminClient();
    const result = await admin.auth.admin.updateUserById(account.providerUserId, {
      password: body.password as string,
    });
    if (result.error)
      return NextResponse.json({ error: 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ' }, { status: 502 });
    await prisma.auditEvent.create({
      data: {
        actorUserId: actor.id,
        targetUserId: id,
        actorRole: 'ADMIN',
        action: 'PASSWORD_RESET',
        requestId: randomUUID(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'profile') {
    const target = await prisma.user.findUnique({
      where: { id },
      include: { authAccounts: { where: { provider: 'supabase' } } },
    });
    if (!target || !target.authAccounts[0])
      return NextResponse.json({ error: 'ไม่พบบัญชี' }, { status: 404 });
    if (target.deletedAt)
      return NextResponse.json({ error: 'ต้องกู้คืนบัญชีก่อนจัดการข้อมูล' }, { status: 409 });
    const employeeCode = (body.employeeCode as string).trim();
    const name = (body.name as string).trim();
    const email = (body.email as string).trim().toLowerCase();
    const team = (body.team as string).trim();
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { employeeCode: { equals: employeeCode, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    if (duplicate)
      return NextResponse.json({ error: 'อีเมลหรือรหัสพนักงานนี้มีอยู่แล้ว' }, { status: 409 });

    const emailChanged = email !== target.email;
    if (emailChanged && !hasSupabaseAdminKey()) {
      return NextResponse.json(
        { error: 'ยังไม่ได้ตั้งค่า Server key สำหรับแก้อีเมล' },
        { status: 503 },
      );
    }
    const admin = emailChanged ? createSupabaseAdminClient() : null;
    if (admin) {
      const changed = await admin.auth.admin.updateUserById(target.authAccounts[0].providerUserId, {
        email,
        email_confirm: true,
      });
      if (changed.error)
        return NextResponse.json({ error: 'แก้อีเมลใน Auth ไม่สำเร็จ' }, { status: 502 });
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: { employeeCode, name, email, team: team || null },
        });
        await tx.auditEvent.create({
          data: {
            actorUserId: actor.id,
            targetUserId: id,
            actorRole: 'ADMIN',
            action: 'USER_PROFILE_CHANGED',
            requestId: randomUUID(),
            before: {
              employeeCode: target.employeeCode,
              name: target.name,
              email: target.email,
              team: target.team,
            },
            after: { employeeCode, name, email, team },
          },
        });
      });
    } catch {
      if (admin) {
        const restored = await admin.auth.admin.updateUserById(
          target.authAccounts[0].providerUserId,
          { email: target.email, email_confirm: true },
        );
        if (restored.error)
          return NextResponse.json(
            { error: 'บันทึกไม่สำเร็จและต้องตรวจอีเมลใน Auth ที่อาจไม่ตรงกับระบบ' },
            { status: 500 },
          );
      }
      return NextResponse.json({ error: 'บันทึกข้อมูลบัญชีไม่สำเร็จ' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(87654037)::text AS locked`;
      const currentActor = await tx.user.findUnique({
        where: { id: actor.id },
        include: { userRole: true },
      });
      if (
        !currentActor ||
        currentActor.deletedAt ||
        currentActor.status !== 'ACTIVE' ||
        currentActor.userRole?.roleId !== 'ADMIN'
      )
        throw new Error('FORBIDDEN');
      const target = await tx.user.findUnique({
        where: { id },
        include: { userRole: true, authAccounts: { where: { provider: 'supabase' } } },
      });
      if (!target || !target.userRole) throw new Error('NOT_FOUND');
      if (action === 'delete' || (action === 'role' && body.roleId !== target.userRole.roleId)) {
        await tx.$queryRaw`SELECT id FROM users WHERE id=${id}::uuid FOR UPDATE`;
        const linked = await tx.salesTerritory.count({
          where: { OR: [{ managerId: id }, { salesId: id }] },
        });
        if (linked) throw new Error('TERRITORY_ASSIGNED');
      }
      if (action === 'delete' || action === 'restore') {
        if (action === 'delete' && target.id === actor.id) throw new Error('SELF_ACCESS_CHANGE');
        if (action === 'delete' && target.deletedAt) throw new Error('ALREADY_DELETED');
        if (action === 'restore' && !target.deletedAt) throw new Error('NOT_DELETED');
        if (action === 'restore') {
          if (!target.authAccounts[0]) throw new Error('AUTH_MISSING');
          const duplicate = await tx.user.findFirst({
            where: {
              id: { not: id },
              OR: [
                { email: { equals: target.email, mode: 'insensitive' } },
                { employeeCode: { equals: target.employeeCode, mode: 'insensitive' } },
              ],
            },
            select: { id: true },
          });
          if (duplicate) throw new Error('DUPLICATE');
        }
        if (
          action === 'delete' &&
          target.userRole.roleId === 'ADMIN' &&
          target.status === 'ACTIVE'
        ) {
          const activeAdmins = await tx.user.count({
            where: { status: 'ACTIVE', deletedAt: null, userRole: { roleId: 'ADMIN' } },
          });
          if (activeAdmins <= 1) throw new Error('LAST_ADMIN');
        }
        const deletedAt = action === 'delete' ? new Date() : null;
        await tx.user.update({
          where: { id },
          data: {
            deletedAt,
            deletedById: action === 'delete' ? actor.id : null,
            deleteReason: action === 'delete' ? reason : null,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorUserId: actor.id,
            targetUserId: id,
            actorRole: 'ADMIN',
            action: action === 'delete' ? 'USER_DELETED' : 'USER_RESTORED',
            requestId: randomUUID(),
            before: {
              status: target.status,
              deletedAt: target.deletedAt?.toISOString() ?? null,
              deletedById: target.deletedById,
              deleteReason: target.deleteReason,
            },
            after: { status: target.status, deletedAt: deletedAt?.toISOString() ?? null, reason },
          },
        });
        return;
      }
      if (target.deletedAt) throw new Error('DELETED');
      const nextRoleId = action === 'role' ? (body.roleId as string) : target.userRole.roleId;
      const nextStatus =
        action === 'status' ? (body.status as 'ACTIVE' | 'SUSPENDED') : target.status;
      if (target.id === actor.id && (nextRoleId !== 'ADMIN' || nextStatus !== 'ACTIVE')) {
        throw new Error('SELF_ACCESS_CHANGE');
      }
      if (
        target.userRole.roleId === 'ADMIN' &&
        target.status === 'ACTIVE' &&
        (nextRoleId !== 'ADMIN' || nextStatus !== 'ACTIVE')
      ) {
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
          actorUserId: actor.id,
          targetUserId: id,
          actorRole: 'ADMIN',
          action: action === 'role' ? 'USER_ROLE_CHANGED' : 'USER_STATUS_CHANGED',
          requestId: randomUUID(),
          before: { roleId: target.userRole.roleId, status: target.status },
          after: { roleId: nextRoleId, status: nextStatus },
        },
      });
    });
  } catch (caught) {
    if (caught instanceof Error && caught.message === 'TERRITORY_ASSIGNED') {
      return NextResponse.json(
        {
          error:
            'ผู้ใช้งานยังรับผิดชอบเขตอยู่ กรุณาเปลี่ยนผู้รับผิดชอบในหน้าเขตก่อนลบหรือเปลี่ยนบทบาท',
        },
        { status: 409 },
      );
    }
    if (caught instanceof Error && caught.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }
    if (caught instanceof Error && caught.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์จัดการผู้ใช้' }, { status: 403 });
    }
    if (caught instanceof Error && caught.message === 'LAST_ADMIN') {
      return NextResponse.json(
        { error: 'ต้องมี Admin ที่ใช้งานได้อย่างน้อยหนึ่งบัญชี' },
        { status: 409 },
      );
    }
    if (caught instanceof Error && caught.message === 'SELF_ACCESS_CHANGE') {
      return NextResponse.json(
        {
          error:
            'ไม่สามารถระงับ ลบ หรือเปลี่ยนบทบาท Admin ของบัญชีที่กำลังใช้งาน กรุณาให้ Admin อีกบัญชีดำเนินการ',
        },
        { status: 409 },
      );
    }
    if (
      caught instanceof Error &&
      ['ALREADY_DELETED', 'NOT_DELETED', 'DELETED'].includes(caught.message)
    ) {
      return NextResponse.json(
        { error: 'สถานะบัญชีเปลี่ยนแล้ว กรุณาโหลดหน้าใหม่' },
        { status: 409 },
      );
    }
    if (caught instanceof Error && caught.message === 'DUPLICATE') {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสพนักงานซ้ำ ต้องแก้ข้อมูลก่อนกู้คืน' },
        { status: 409 },
      );
    }
    if (caught instanceof Error && caught.message === 'AUTH_MISSING') {
      return NextResponse.json(
        { error: 'ไม่พบบัญชี Auth ที่เชื่อมโยง กรุณาตรวจสอบก่อนกู้คืน' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, context: Context) {
  return mutate(request, context);
}
export async function DELETE(request: NextRequest, context: Context) {
  return mutate(request, context);
}

export async function GET(request: NextRequest, context: Context) {
  const { error } = await authorizeUserManagement(request);
  if (error) return error;
  try {
    resourceQuery(request.nextUrl.searchParams, []);
    const { id } = await context.params;
    if (!uuidPattern.test(id)) throw new ResourceQueryError('ID ต้องเป็น UUID');
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    return NextResponse.json({ user }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof ResourceQueryError ? e.message : 'โหลดผู้ใช้ไม่สำเร็จ' },
      { status: e instanceof ResourceQueryError ? 400 : 503 },
    );
  }
}
