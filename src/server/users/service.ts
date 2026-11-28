import 'server-only';
import { tableSort } from '@/server/validation/table-sort';

import { getPrismaClient, readWithConnectionRetry } from '@/server/db/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { paginationQuery, paginationResult, queryChoice, queryText } from '@/server/pagination';

import { ROLE_IDS } from '@/server/validation/users';
export { ROLE_IDS, isRoleId, passwordIsValid } from '@/server/validation/users';
import type { UserRow, UsersListResponse } from '@/types/api/users';
const userInclude = {
  managedTerritories: { select: { id: true, code: true, name: true } },
  territorySalesMemberships: {
    include: { territory: { select: { id: true, code: true, name: true } } },
  },
  userRole: { include: { role: true } },
  deletedByUser: { select: { name: true, employeeCode: true } },
} as const;

function toUserRow(user: {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  team: string | null;
  managedTerritories: { id: string; code: string; name: string }[];
  territorySalesMemberships: { territory: { id: string; code: string; name: string } }[];
  status: 'ACTIVE' | 'SUSPENDED';
  lastLoginAt: Date | null;
  userRole: { roleId: string; role: { name: string } } | null;
  deletedAt: Date | null;
  deleteReason: string | null;
  deletedByUser: { name: string; employeeCode: string } | null;
}): UserRow {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    name: user.name,
    email: user.email,
    userRole: user.userRole
      ? { roleId: user.userRole.roleId, role: { name: user.userRole.role.name } }
      : null,
    team: user.team ?? '',
    territory: user.territorySalesMemberships[0]?.territory ?? user.managedTerritories[0] ?? null,
    territoryId:
      user.territorySalesMemberships[0]?.territory.id ?? user.managedTerritories[0]?.id ?? null,
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    deletedAt: user.deletedAt?.toISOString() ?? null,
    deletedByUser: user.deletedByUser,
    deleteReason: user.deleteReason,
  };
}

export function userListWhere(params: URLSearchParams): Prisma.UserWhereInput {
  const search = queryText(params, 'search');
  const role = queryChoice(params, 'role', ['', ...ROLE_IDS]);
  const status = queryChoice(params, 'status', ['', 'ACTIVE', 'SUSPENDED']);
  const deleted = queryChoice(params, 'deleted', ['false', 'true'], 'false');
  return {
    deletedAt: deleted === 'true' ? { not: null } : null,
    ...(role ? { userRole: { is: { roleId: role } } } : {}),
    ...(status ? { status: status as 'ACTIVE' | 'SUSPENDED' } : {}),
    ...(search
      ? {
          OR: ['name', 'email', 'employeeCode'].map((key) => ({
            [key]: { contains: search, mode: 'insensitive' },
          })),
        }
      : {}),
  };
}
export async function paginatedUsers(params: URLSearchParams): Promise<UsersListResponse> {
  const { offset, limit } = paginationQuery(params);
  const where = userListWhere(params);
  const orderBy = userSortOrder(params);
  return readWithConnectionRetry(async (db) => {
    const [total, rows] = await db.$transaction(
      [
        db.user.count({ where }),
        db.user.findMany({
          where,
          include: userInclude,
          orderBy,
          skip: offset,
          take: limit,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return { users: rows.map(toUserRow), pagination: paginationResult(total, offset, limit) };
  });
}
export async function exportUsers(params: URLSearchParams) {
  const where = userListWhere(params);
  const orderBy = userSortOrder(params);
  const rows = await readWithConnectionRetry((db) =>
    db.user.findMany({
      where,
      include: userInclude,
      orderBy,
    }),
  );
  return rows.map(toUserRow);
}
function userSortOrder(params: URLSearchParams): Prisma.UserOrderByWithRelationInput[] {
  const sort = tableSort(params, [
    'name',
    'employeeCode',
    'email',
    'team',
    'status',
    'lastLoginAt',
    'deletedAt',
    'role',
  ]);
  if (!sort.key) return [{ createdAt: 'desc' }, { id: 'desc' }];
  const primary: Prisma.UserOrderByWithRelationInput =
    sort.key === 'role'
      ? { userRole: { role: { name: sort.direction } } }
      : ['lastLoginAt', 'deletedAt', 'team'].includes(sort.key)
        ? { [sort.key]: { sort: sort.direction, nulls: 'last' } }
        : { [sort.key]: sort.direction };
  return [primary, { id: 'asc' }];
}

export async function getUserByEmployeeCode(employeeCode: string) {
  const user = await getPrismaClient().user.findFirst({
    where: { employeeCode: { equals: employeeCode, mode: 'insensitive' } },
    include: userInclude,
  });
  return user ? toUserRow(user) : null;
}

export async function getUserById(id: string) {
  const user = await readWithConnectionRetry((db) =>
    db.user.findUnique({ where: { id }, include: userInclude }),
  );
  return user ? toUserRow(user) : null;
}
