import { MockCreatePage } from '@/components/pages/mock-create-page';
import { requireActiveUser } from '@/server/auth/current-user';
import { mockData } from '../data';

export default async function Page() {
  await requireActiveUser();
  return <MockCreatePage href="/billing" title={mockData.title} action={mockData.action} />;
}
