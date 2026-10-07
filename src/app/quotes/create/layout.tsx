import { requireActiveUser } from '@/server/auth/current-user';
import type { ReactNode } from 'react';
// TASK-275: Sales and Admin create quotations; the API enforces the roles.
export default async function Layout({ children }: { children: ReactNode }) {
  await requireActiveUser();
  return children;
}
