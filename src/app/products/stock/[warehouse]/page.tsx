import { notFound } from 'next/navigation';
import ProductStockList from '@/components/operations/product-stock-list';

const warehouses = {
  main: { code: 'MAIN', title: 'คลังหลัก' },
  marketing: { code: 'MARKETING', title: 'คลังการตลาด' },
  disposal: { code: 'DISPOSAL', title: 'คลังรอทำลาย' },
} as const;

export default async function Page({ params }: { params: Promise<{ warehouse: string }> }) {
  const { warehouse } = await params;
  if (!Object.hasOwn(warehouses, warehouse)) notFound();
  const selected = warehouses[warehouse as keyof typeof warehouses];
  return <ProductStockList key={warehouse} warehouseCode={selected.code} />;
}
