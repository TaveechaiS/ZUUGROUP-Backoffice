import { requireAdmin } from '@/server/auth/current-user';
import { CreateUserForm } from './create-user-form';

export default async function Page() {
  await requireAdmin();
  return <CreateUserForm />;
}
