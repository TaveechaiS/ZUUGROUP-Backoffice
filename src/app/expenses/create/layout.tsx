import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireActiveUser } from '@/server/auth/current-user';
export default async function Layout({ children }: { children: ReactNode }) {
  const user = await requireActiveUser();
  if (!['ADMIN', 'ACCOUNTING_CFO'].includes(user.userRole?.roleId ?? '')) redirect('/expenses');
  return children;
}
