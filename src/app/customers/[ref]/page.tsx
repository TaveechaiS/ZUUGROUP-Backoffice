import { MockDetailPage } from '@/components/pages/mock-detail-page';
import { mockData } from '../data';

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <MockDetailPage href="/customers" refCode={ref} config={mockData} labels={{ subtitle: 'ประเภท / จังหวัด', owner: 'ผู้ดูแล', value: 'เงื่อนไข' }} />;
}
