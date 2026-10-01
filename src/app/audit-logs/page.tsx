import { requireAdmin } from '@/server/auth/current-user';
import { listAuditEvents } from '@/server/audit-logs/service';
import { AuditList } from './audit-list';

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; action?: string }> }) {
  await requireAdmin();
  return <AuditList data={await listAuditEvents(await searchParams)} />;
}
