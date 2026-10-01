import { MockDetailPage } from '@/components/pages/mock-detail-page';
import { mockData } from '../data';

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <MockDetailPage href="/products" refCode={ref} config={mockData} labels={{ subtitle: 'หมวด / หน่วย', owner: 'คลังตัวอย่าง', value: 'ยอดรวมตัวอย่าง' }} />;
}
