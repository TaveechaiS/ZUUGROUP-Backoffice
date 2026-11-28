import type { ReactNode } from 'react';
import { requirePage } from '@/server/auth/current-user';

export default async function Layout({ children }: { children: ReactNode }) {
  await requirePage('/reports/finance');
  return children;
}
