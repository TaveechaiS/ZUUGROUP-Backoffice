import { UsersListContent } from './users-list-content';
import { requireAdmin } from '@/server/auth/current-user';
import { listUsers } from '@/server/users/service';

export default async function Page() {
  await requireAdmin();
  return <UsersListContent users={await listUsers()} />;
}
