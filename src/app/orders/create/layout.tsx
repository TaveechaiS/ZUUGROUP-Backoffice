import { requireActiveUser } from '@/server/auth/current-user';
import type { ReactNode } from 'react';
export default async function Layout({ children }: { children: ReactNode }) {
  await requireActiveUser();
  return children;
}
