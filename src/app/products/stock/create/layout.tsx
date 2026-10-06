import type { ReactNode } from 'react';
import { requireAdmin } from '@/server/auth/current-user';

export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}
