import { notFound } from 'next/navigation';
import { ModulePlaceholder } from '@/components/layout/admin-shell';
import { ADMIN_PAGES, getAdminPage } from '@/config/navigation';

type RouteProps = { params: Promise<{ segments: string[] }> };

export function generateStaticParams() {
  return ADMIN_PAGES.filter((page) => page.href !== '/').map((page) => ({
    segments: page.href.slice(1).split('/'),
  }));
}

export default async function ModulePage({ params }: RouteProps) {
  const { segments } = await params;
  const page = getAdminPage(segments.join('/'));
  if (!page) notFound();

  return <ModulePlaceholder page={page} />;
}
