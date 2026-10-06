import type { AuditListResponse } from '@/types/api/audit';
import 'server-only';
import { tableSort } from '@/server/validation/table-sort';
import type { Prisma } from '@/generated/prisma/client';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { paginationResult } from '@/server/pagination';
import { auditQuery } from '@/server/validation/audit';
export async function paginatedAuditEvents(params: URLSearchParams): Promise<AuditListResponse> {
  const { offset, limit, q, action } = auditQuery(params);
  const sort = tableSort(params, [
    'occurredAt',
    'action',
    'actor',
    'actorRole',
    'target',
    'requestId',
  ]);
  const orderBy: Prisma.AuditEventOrderByWithRelationInput[] = sort.key
    ? [
        sort.key === 'actor' || sort.key === 'target'
          ? { [sort.key]: { name: sort.direction } }
          : { [sort.key]: sort.direction },
        { id: 'asc' },
      ]
    : [{ occurredAt: 'desc' }, { id: 'desc' }];
  const where: Prisma.AuditEventWhereInput = {
    ...(action ? { action } : {}),
    ...(q
      ? {
          OR: [
            { action: { contains: q, mode: 'insensitive' } },
            { requestId: { contains: q, mode: 'insensitive' } },
            { actor: { is: { name: { contains: q, mode: 'insensitive' } } } },
            { actor: { is: { employeeCode: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  };
  return readWithConnectionRetry(async (db) => {
    const [total, events] = await db.$transaction(
      [
        db.auditEvent.count({ where }),
        db.auditEvent.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          select: {
            id: true,
            occurredAt: true,
            action: true,
            actorRole: true,
            requestId: true,
            actor: { select: { name: true, employeeCode: true } },
            target: { select: { name: true, employeeCode: true } },
          },
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return {
      rows: events.map((row) => ({
        id: row.id,
        occurredAt: row.occurredAt.toISOString(),
        action: row.action,
        actorRole: row.actorRole,
        requestId: row.requestId,
        actor: row.actor,
        target: row.target,
      })),
      pagination: paginationResult(total, offset, limit),
    };
  });
}
export async function auditFilters() {
  const rows = await readWithConnectionRetry((db) =>
    db.auditEvent.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  );
  return { actions: rows.map((row) => row.action) };
}
