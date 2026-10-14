export const ROLE_IDS = ['ADMIN', 'SALES', 'MANAGER', 'ACCOUNTING_CFO'] as const;
import type { RoleId, UserCreateRequest } from '@/types/api/users';
import { uuidPattern } from './products';

export function validUserTerritory(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'string' && uuidPattern.test(value))
  );
}

export function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && ROLE_IDS.some((role) => role === value);
}

export function passwordIsValid(password: string): boolean {
  return [...password].length >= 8;
}

export function userCreateInput(
  body: Record<string, unknown>,
): (UserCreateRequest & { team: string }) | null {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const team = typeof body.team === 'string' ? body.team.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (
    !name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isRoleId(body.roleId) ||
    !passwordIsValid(password) ||
    !validUserTerritory(body.territoryId) ||
    (Boolean(body.territoryId) && body.roleId !== 'SALES' && body.roleId !== 'MANAGER')
  ) {
    return null;
  }
  const roleId = body.roleId;

  return {
    name,
    email,
    team,
    password,
    roleId,
    territoryId:
      typeof body.territoryId === 'string' && body.territoryId
        ? body.territoryId.toLowerCase()
        : null,
  };
}

export function userUpdateError(body: Record<string, unknown>): string | null {
  const action = body.action;
  if (action === 'profile' && !validUserTerritory(body.territoryId)) return 'เขตขายไม่ถูกต้อง';
  if (!['role', 'status', 'password', 'profile', 'delete', 'restore'].includes(String(action))) {
    return 'คำสั่งไม่ถูกต้อง';
  }
  if (action === 'role' && !isRoleId(body.roleId)) {
    return 'บทบาทไม่ถูกต้อง';
  }
  if (action === 'status' && body.status !== 'ACTIVE' && body.status !== 'SUSPENDED') {
    return 'สถานะไม่ถูกต้อง';
  }
  if (
    action === 'password' &&
    (typeof body.password !== 'string' || !passwordIsValid(body.password))
  ) {
    return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
  }
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if ((action === 'delete' || action === 'restore') && (!reason || [...reason].length > 500)) {
    return 'กรุณาระบุเหตุผลไม่เกิน 500 ตัวอักษร';
  }
  if (
    action === 'profile' &&
    (typeof body.employeeCode !== 'string' ||
      !body.employeeCode.trim() ||
      ['create', '.', '..'].includes(body.employeeCode.trim().toLowerCase()) ||
      [...body.employeeCode.trim()].length > 40 ||
      /[\\/?#\x00-\x1f\x7f]/.test(body.employeeCode.trim()) ||
      typeof body.name !== 'string' ||
      !body.name.trim() ||
      typeof body.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
      typeof body.team !== 'string')
  )
    return 'ข้อมูลบัญชีไม่ถูกต้อง: รหัสพนักงานต้องไม่เกิน 40 ตัวอักษร และห้ามใช้ create หรือเครื่องหมาย / \\ ? #';

  return null;
}
