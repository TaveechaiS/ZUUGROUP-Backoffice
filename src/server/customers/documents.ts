import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { id } from '@/server/operations/domain';
import { page, pageResult, query } from '@/server/operations/service';
import { likeOf } from '@/server/reports/range';
import type { CustomerDocumentRow } from '@/types/api/customer-documents';

const from = Prisma.sql`customers c CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.details->'files','[]'::jsonb)) entry JOIN customer_files f ON f.id=(entry->>'id')::uuid LEFT JOIN customer_options t ON t.id=f.document_type_id`;
const select = Prisma.sql`f.id,f.name,f.type,f.size,f.created_at AS "createdAt",c.id AS "customerId",c.code AS "customerCode",c.name AS "customerName",COALESCE(t.name,entry->>'documentTypeName','-') AS "documentTypeName",c.license_expires_at::text AS "licenseExpiresAt"`;

export async function customerDocumentsRead(
  params: URLSearchParams,
  admin: boolean,
  actor: { id: string; roleId: string },
) {
  const { offset, limit, search } = page(params),
    like = likeOf(search),
    documentTypeId = params.get('documentTypeId') ?? '';
  const where = Prisma.sql`${admin ? Prisma.sql`true` : Prisma.sql`c.deleted_at IS NULL`} AND (c.name ILIKE ${like} OR c.code ILIKE ${like} OR f.name ILIKE ${like}) ${documentTypeId ? Prisma.sql`AND f.document_type_id=${id(documentTypeId, 'ประเภทเอกสาร')}::uuid` : Prisma.empty} ${customerScope(actor, Prisma.sql`c.id`)}`;
  const order = sqlTableOrder(
    params,
    {
      customerName: Prisma.sql`c.name`,
      documentTypeName: Prisma.sql`t.name`,
      name: Prisma.sql`f.name`,
      createdAt: Prisma.sql`f.created_at`,
      licenseExpiresAt: Prisma.sql`c.license_expires_at`,
    },
    Prisma.sql`f.created_at DESC`,
    Prisma.sql`f.id`,
  );
  return getPrismaClient().$transaction(
    async (tx) => {
      const rows = await query<CustomerDocumentRow>(
        tx,
        Prisma.sql`SELECT ${select} FROM ${from} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${from} WHERE ${where}`,
      );
      const documentTypes = await query<{ id: string; name: string }>(
        tx,
        Prisma.sql`SELECT id,name FROM customer_options WHERE kind='documentType' ORDER BY name,id`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), documentTypes };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
