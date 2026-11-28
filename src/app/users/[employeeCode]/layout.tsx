import type { ReactNode } from 'react';
import { requireAdmin } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';
import { notFound, redirect } from 'next/navigation';
import { getUserByEmployeeCode } from '@/server/users/service';
import { userPath } from '../user-ui';
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Record<string, string>>;
}) {
  const actor = await requireAdmin();
  const { employeeCode } = await params;
  const user = await getUserByEmployeeCode(employeeCode);
  if (!user) notFound();
  if (user.employeeCode !== employeeCode) redirect(userPath(user.employeeCode));
  return (
    <RouteDataProvider key={user.employeeCode} data={{ actorId: actor.id, user }}>
      {children}
    </RouteDataProvider>
  );
}
