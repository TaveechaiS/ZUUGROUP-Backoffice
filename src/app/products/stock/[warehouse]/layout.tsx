import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

const warehouses = new Set(['main', 'marketing', 'disposal']);

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ warehouse: string }>;
}) {
  const { warehouse } = await params;
  if (!warehouses.has(warehouse)) notFound();
  return children;
}
