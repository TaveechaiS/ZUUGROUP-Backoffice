import { ModuleListPage } from '@/components/pages/module-list-page';
import { mockData } from './data';

export default function Page() {
  return <ModuleListPage href="/promotions" config={mockData} />;
}
