import type { Pagination } from '@/types/api';
export type UserRow = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  userRole: { roleId: string; role: { name: string } } | null;
  team: string;
  territoryId?: string | null;
  territory?: { id: string; code: string; name: string } | null;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLoginAt: string | null;
  deletedAt: string | null;
  deletedByUser: { name: string; employeeCode: string } | null;
  deleteReason: string | null;
};

export type RoleId = 'ADMIN' | 'SALES' | 'MANAGER' | 'ACCOUNTING_CFO';
export type UserCreateRequest = {
  name: string;
  email: string;
  team?: string;
  territoryId?: string | null;
  password: string;
  roleId: RoleId;
};
export type UserUpdateRequest =
  | { action: 'role'; roleId: RoleId }
  | { action: 'status'; status: UserRow['status'] }
  | { action: 'password'; password: string }
  | {
      action: 'profile';
      employeeCode: string;
      name: string;
      email: string;
      team: string;
      territoryId?: string | null;
    }
  | { action: 'restore'; reason: string };
export type UsersListResponse = { users: UserRow[]; pagination: Pagination };
export type UserCreatedResponse = { ok: true; employeeCode: string };

export type UserDeleteRequest = { reason: string };
export type UserResponse = { user: UserRow };
