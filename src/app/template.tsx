import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { requireActiveUser } from '@/server/auth/current-user';

export default async function Template({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get('x-zuu-pathname');
  if (pathname !== '/login') await requireActiveUser();
  return children;
}
