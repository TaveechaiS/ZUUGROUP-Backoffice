import { Prisma } from '@/generated/prisma/client';
import { RecordError } from '@/server/validation/records';

/** Called in the same transaction as the user profile and its audit event. */
export async function assignUserTerritory(tx: Prisma.TransactionClient, userId: string, territoryId: string | null) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(87654038)::text AS locked`;
  const old = await tx.salesTerritory.findMany({
    where: { OR: [{ managerId: userId }, { salesMembers: { some: { userId } } }] },
    select: { id: true },
  });
  const ids = [...new Set([...old.map((row) => row.id), ...(territoryId ? [territoryId] : [])])].sort();
  if (ids.length) await tx.$queryRaw(Prisma.sql`SELECT id FROM sales_territories
    WHERE id=ANY(${ids}::uuid[]) ORDER BY id FOR UPDATE`);
  await tx.$queryRaw`SELECT id FROM users WHERE id=${userId}::uuid FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id: userId }, include: { userRole: true } });
  if (!user || user.deletedAt) throw new RecordError(409, 'บัญชีไม่พร้อมแก้ไข กรุณาโหลดใหม่');
  const role = user.userRole?.roleId;
  if (territoryId && role !== 'SALES' && role !== 'MANAGER')
    throw new RecordError(400, 'เลือกเขตได้เฉพาะฝ่ายขายและผู้จัดการ');
  if (territoryId && user.status !== 'ACTIVE' && !old.some((row) => row.id === territoryId))
    throw new RecordError(400, 'ต้องเปิดใช้งานบัญชีก่อนเลือกเขตใหม่');
  if (territoryId) {
    const territory = await tx.salesTerritory.findUnique({ where: { id: territoryId } });
    if (!territory || territory.deletedAt) throw new RecordError(400, 'ไม่พบเขตที่เลือกหรือเขตถูกลบแล้ว');
    if (role === 'MANAGER' && territory.managerId && territory.managerId !== userId)
      throw new RecordError(409, 'เขตนี้มีผู้จัดการแล้ว กรุณาเลือกเขตอื่น');
  }
  const current = await tx.salesTerritory.findMany({
    where: { OR: [{ managerId: userId }, { salesMembers: { some: { userId } } }] },
    select: { id: true },
  });
  if (current.some((row) => !ids.includes(row.id)))
    throw new RecordError(409, 'เขตของผู้ใช้งานเปลี่ยนแล้ว กรุณาโหลดใหม่');
  await tx.salesTerritorySales.deleteMany({ where: { userId } });
  await tx.salesTerritory.updateMany({ where: { salesId: userId }, data: { salesId: null } });
  await tx.salesTerritory.updateMany({ where: { managerId: userId }, data: { managerId: null } });
  if (territoryId && role === 'SALES')
    await tx.salesTerritorySales.create({ data: { userId, territoryId } });
  if (territoryId && role === 'MANAGER')
    await tx.salesTerritory.update({ where: { id: territoryId }, data: { managerId: userId } });
  // Maintain the legacy first-member projection, including the territory the user left.
  for (const id of ids) {
    const first = await tx.salesTerritorySales.findFirst({ where: { territoryId: id }, orderBy: { userId: 'asc' } });
    await tx.salesTerritory.update({ where: { id }, data: { salesId: first?.userId ?? null } });
  }
  return { before: old[0]?.id ?? null, after: territoryId };
}
