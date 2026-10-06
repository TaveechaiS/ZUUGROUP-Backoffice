import { Prisma } from '@/generated/prisma/client';
import { RecordError } from '@/server/validation/records';

export async function validateTerritorySales(
  tx: Prisma.TransactionClient,
  territoryId: string | null,
  salesIds: string[],
) {
  // Stable lock order serializes overlapping assignments, including members being removed.
  const users = await tx.$queryRaw<{ id: string; valid: boolean }[]>(Prisma.sql`
    SELECT u.id, (u.deleted_at IS NULL AND u.status='ACTIVE' AND r.role_id='SALES') AS valid
    FROM users u LEFT JOIN user_roles r ON r.user_id=u.id
    WHERE u.id=ANY(${salesIds}::uuid[]) OR u.id IN
      (SELECT user_id FROM sales_territory_sales WHERE territory_id=${territoryId}::uuid)
    ORDER BY u.id FOR UPDATE OF u`);
  const valid = new Set(users.filter((user) => user.valid).map((user) => user.id));
  if (salesIds.some((id) => !valid.has(id)))
    throw new RecordError(400, 'ฝ่ายขายต้องเป็นบัญชีที่ใช้งานอยู่และมีบทบาท Sales');
  const taken = await tx.$queryRaw<{ userId: string }[]>(Prisma.sql`
    SELECT user_id AS "userId" FROM sales_territory_sales
    WHERE user_id=ANY(${salesIds}::uuid[])
      AND territory_id<>COALESCE(${territoryId}::uuid,'00000000-0000-0000-0000-000000000000'::uuid)
    UNION ALL SELECT manager_id AS "userId" FROM sales_territories
    WHERE manager_id=ANY(${salesIds}::uuid[])
      AND id<>COALESCE(${territoryId}::uuid,'00000000-0000-0000-0000-000000000000'::uuid)`);
  if (taken.length) throw new RecordError(409, 'ฝ่ายขายที่เลือกอยู่ในเขตอื่นแล้ว');
}

export async function replaceTerritorySales(
  tx: Prisma.TransactionClient,
  territoryId: string,
  salesIds: string[],
) {
  await tx.$executeRaw(Prisma.sql`DELETE FROM sales_territory_sales
    WHERE territory_id=${territoryId}::uuid AND NOT(user_id=ANY(${salesIds}::uuid[]))`);
  if (salesIds.length)
    await tx.$executeRaw(Prisma.sql`INSERT INTO sales_territory_sales(territory_id,user_id)
      SELECT ${territoryId}::uuid, user_id FROM unnest(${salesIds}::uuid[]) AS members(user_id)
      ON CONFLICT(territory_id,user_id) DO NOTHING`);
}
