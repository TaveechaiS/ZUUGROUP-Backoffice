import { requireAdmin } from '@/server/auth/current-user';
import type { ReactNode } from 'react';
export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}
