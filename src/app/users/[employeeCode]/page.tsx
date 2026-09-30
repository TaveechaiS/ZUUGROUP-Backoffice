import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/server/auth/current-user';
import { getUserByEmployeeCode } from '@/server/users/service';
import { userPath } from '../user-ui';
import { UserDetailContent } from './user-detail-content';

export default async function Page({ params }: { params: Promise<{ employeeCode: string }> }) {
  const actor = await requireAdmin();
  const { employeeCode } = await params;
  const user = await getUserByEmployeeCode(employeeCode);
  if (!user) notFound();
  if (user.employeeCode !== employeeCode) redirect(userPath(user.employeeCode));
  return <UserDetailContent key={user.employeeCode} initialUser={user} actorId={actor.id} />;
}
