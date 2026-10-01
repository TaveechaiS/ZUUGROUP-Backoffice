import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { readWithConnectionRetry } from '@/server/db/prisma';

const pageSize = 20;
const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok',
});

export type AuditListFilters = { page?: string; q?: string; action?: string };

export async function listAuditEvents(filters: AuditListFilters) {
  const requestedPage = Number(filters.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const q = (filters.q ?? '').trim().slice(0, 100);
  const action = /^[A-Z_]{1,80}$/.test(filters.action ?? '') ? filters.action! : '';
  const where: Prisma.AuditEventWhereInput = {
    ...(action ? { action } : {}),
    ...(q ? { OR: [
      { action: { contains: q, mode: 'insensitive' } },
      { requestId: { contains: q, mode: 'insensitive' } },
      { actor: { is: { name: { contains: q, mode: 'insensitive' } } } },
      { actor: { is: { employeeCode: { contains: q, mode: 'insensitive' } } } },
    ] } : {}),
  };

  return readWithConnectionRetry(async (prisma) => {
    const [total, actionRows] = await Promise.all([
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } }),
    ]);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, pages);
    const rows = await prisma.auditEvent.findMany({
      where,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, occurredAt: true, action: true, actorRole: true, requestId: true,
        actor: { select: { name: true, employeeCode: true } },
        target: { select: { name: true, employeeCode: true } },
      },
    });
    return {
      rows: rows.map((row) => ({
        id: row.id,
        occurredAt: dateTime.format(row.occurredAt),
        action: row.action,
        actorRole: row.actorRole,
        actorName: row.actor?.name ?? null,
        actorCode: row.actor?.employeeCode ?? null,
        targetName: row.target?.name ?? null,
        targetCode: row.target?.employeeCode ?? null,
        requestId: row.requestId,
      })),
      actions: actionRows.map((row) => row.action),
      total, page: currentPage, pages, q, action,
    };
  });
}
