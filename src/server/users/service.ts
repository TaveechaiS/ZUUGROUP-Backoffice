import 'server-only';

import { getPrismaClient } from '@/server/db/prisma';

export const ROLE_IDS = ['ADMIN', 'SALES', 'MANAGER', 'ACCOUNTING_CFO'] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && ROLE_IDS.some((role) => role === value);
}

export function passwordIsValid(password: string): boolean {
  return [...password].length >= 8;
}

const userInclude = {
  userRole: { include: { role: true } },
  deletedByUser: { select: { name: true, employeeCode: true } },
} as const;
const dateFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok',
});

function toUserRow(user: {
  id: string; employeeCode: string; name: string; email: string;
  team: string | null; status: 'ACTIVE' | 'SUSPENDED'; lastLoginAt: Date | null;
  userRole: { roleId: string; role: { name: string } } | null;
  deletedAt: Date | null; deleteReason: string | null;
  deletedByUser: { name: string; employeeCode: string } | null;
}) {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    name: user.name,
    email: user.email,
    roleId: user.userRole?.roleId ?? null,
    role: user.userRole?.role.name ?? 'ยังไม่มีบทบาท',
    team: user.team ?? '',
    status: user.status,
    lastActive: user.lastLoginAt ? dateFormat.format(user.lastLoginAt) : 'ยังไม่เคยเข้าใช้',
    deletedAt: user.deletedAt ? dateFormat.format(user.deletedAt) : null,
    deletedBy: user.deletedByUser
      ? `${user.deletedByUser.name} (${user.deletedByUser.employeeCode})` : null,
    deleteReason: user.deleteReason,
  };
}

export async function listUsers() {
  const users = await getPrismaClient().user.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
  return users.map(toUserRow);
}

export async function getUserByEmployeeCode(employeeCode: string) {
  const user = await getPrismaClient().user.findFirst({
    where: { employeeCode: { equals: employeeCode, mode: 'insensitive' } },
    include: userInclude,
  });
  return user ? toUserRow(user) : null;
}
