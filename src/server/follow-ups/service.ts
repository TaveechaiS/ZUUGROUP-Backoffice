import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { assertCustomerInScope, customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, day, bangkokDay } from '@/server/operations/domain';
import {
  allow,
  command,
  nextDocumentCode,
  page,
  pageResult,
  query,
  type Actor,
  type Tx,
} from '@/server/operations/service';
import { likeOf, optionalRange } from '@/server/reports/range';
import { FOLLOW_UP_CHANNELS, FOLLOW_UP_FILTERS } from '@/config/follow-ups';
import type { FollowUpRow } from '@/types/api/follow-ups';

export const FOLLOW_UP_WRITERS = ['ADMIN', 'MANAGER', 'SALES'];

async function fields(tx: Tx, b: Record<string, unknown>, actor: Actor) {
  const customerId = id(b.customerId, 'ลูกค้า');
  await assertCustomerInScope(tx, actor, customerId);
  const customer = await query<{ id: string }>(
    tx,
    Prisma.sql`SELECT id FROM customers WHERE id=${customerId}::uuid AND deleted_at IS NULL FOR KEY SHARE`,
  );
  if (!customer[0]) throw new RecordError(400, 'ไม่พบลูกค้า');
  const contactedOn = day(b.contactedOn);
  if (contactedOn > bangkokDay()) throw new RecordError(400, 'วันที่ติดต่อต้องไม่เกินวันนี้');
  const nextOn =
    b.nextOn === undefined || b.nextOn === null || b.nextOn === '' ? null : day(b.nextOn);
  if (nextOn && nextOn < contactedOn)
    throw new RecordError(400, 'วันนัดครั้งถัดไปต้องไม่ก่อนวันที่ติดต่อ');
  const channel = str(b.channel, 'ช่องทาง');
  if (!(FOLLOW_UP_CHANNELS as readonly string[]).includes(channel))
    throw new RecordError(400, 'ช่องทางไม่ถูกต้อง');
  return {
    customerId,
    contactedOn,
    nextOn,
    channel,
    name: str(b.name, 'หัวข้อ', true, 200),
    summary: str(b.summary, 'สรุปการติดต่อ', false, 2000),
    notes: str(b.notes, 'หมายเหตุ', false),
  };
}

export async function followUpWrite(actor: Actor, raw: unknown, followUpId?: string) {
  const b = object(raw),
    action = followUpId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, FOLLOW_UP_WRITERS);
  return command(actor, b, `follow-ups.${action}`, async (tx) => {
    if (action === 'create') {
      const f = await fields(tx, b, actor),
        newId = randomUUID(),
        code = await nextDocumentCode(tx, 'FU');
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO customer_follow_ups(id,code,name,status,customer_id,contacted_on,channel,next_on,follow_up_text,notes,owner,created_by_id) VALUES(${newId}::uuid,${code},${f.name},'รอติดตาม',${f.customerId}::uuid,${f.contactedOn}::date,${f.channel},${f.nextOn}::date,${f.summary},${f.notes},${actor.name},${actor.id}::uuid)`,
      );
      return { data: { id: newId, code } };
    }
    const fid = id(followUpId);
    const before = (
      await query<{ status: string; updatedAt: Date; createdById: string | null }>(
        tx,
        Prisma.sql`SELECT status,updated_at AS "updatedAt",created_by_id AS "createdById" FROM customer_follow_ups WHERE id=${fid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบรายการติดตาม');
    if (actor.roleId === 'SALES' && before.createdById !== actor.id)
      throw new RecordError(403, 'Sales แก้ได้เฉพาะรายการที่บันทึกเอง');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.status !== 'รอติดตาม') throw new RecordError(409, 'รายการนี้ปิดแล้ว');
    if (action === 'edit') {
      const f = await fields(tx, b, actor);
      await tx.$executeRaw(
        Prisma.sql`UPDATE customer_follow_ups SET name=${f.name},customer_id=${f.customerId}::uuid,contacted_on=${f.contactedOn}::date,channel=${f.channel},next_on=${f.nextOn}::date,follow_up_text=${f.summary},notes=${f.notes},updated_at=clock_timestamp() WHERE id=${fid}::uuid`,
      );
      return { data: { id: fid } };
    }
    if (action === 'done') {
      const result = str(b.result, 'ผลการติดตาม', true, 2000);
      await tx.$executeRaw(
        Prisma.sql`UPDATE customer_follow_ups SET status='เสร็จแล้ว',result=${result},updated_at=clock_timestamp() WHERE id=${fid}::uuid`,
      );
      return { data: { id: fid, status: 'เสร็จแล้ว' } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      await tx.$executeRaw(
        Prisma.sql`UPDATE customer_follow_ups SET status='ยกเลิก',cancel_reason=${reason},updated_at=clock_timestamp() WHERE id=${fid}::uuid`,
      );
      return { data: { id: fid, status: 'ยกเลิก', reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const display = (today: string) =>
  Prisma.sql`CASE WHEN f.status='รอติดตาม' AND f.next_on<${today}::date THEN 'เกินนัด' WHEN f.status='รอติดตาม' AND f.next_on=${today}::date THEN 'ครบนัดวันนี้' ELSE f.status END`;
const from = Prisma.sql`customer_follow_ups f JOIN customers c ON c.id=f.customer_id LEFT JOIN users u ON u.id=f.created_by_id`;
const select = (today: string) =>
  Prisma.sql`f.id,f.code,f.name,${display(today)} AS status,f.status AS "savedStatus",f.customer_id AS "customerId",c.code AS "customerCode",c.name AS "customerName",f.contacted_on::text AS "contactedOn",f.channel,f.next_on::text AS "nextOn",f.follow_up_text AS summary,f.result,f.notes,f.cancel_reason AS "cancelReason",f.created_by_id AS "createdById",COALESCE(u.name,f.owner) AS "createdByName",f.created_at AS "createdAt",f.updated_at AS "updatedAt"`;

export async function followUpRead(actor: Actor, params: URLSearchParams, followUpId?: string) {
  const today = bangkokDay();
  return getPrismaClient().$transaction(
    async (tx) => {
      if (followUpId) {
        const match = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          followUpId,
        )
          ? Prisma.sql`(f.id=${followUpId}::uuid OR f.code=${followUpId})`
          : Prisma.sql`f.code=${followUpId}`;
        const row = (
          await query<FollowUpRow>(
            tx,
            Prisma.sql`SELECT ${select(today)} FROM ${from} WHERE ${match} AND f.deleted_at IS NULL ${customerScope(actor, Prisma.sql`f.customer_id`)}`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบรายการติดตาม');
        return { data: row, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        status = params.get('status') ?? '',
        customerId = params.get('customerId') ?? '',
        channel = params.get('channel') ?? '';
      if (channel && !(FOLLOW_UP_CHANNELS as readonly string[]).includes(channel))
        throw new RecordError(400, 'ช่องทางไม่ถูกต้อง');
      if (status && !(FOLLOW_UP_FILTERS as readonly string[]).includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const statusWhere =
        status === 'รอติดตาม'
          ? Prisma.sql`AND f.status='รอติดตาม'`
          : status
            ? Prisma.sql`AND ${display(today)}=${status}`
            : Prisma.empty;
      const where = Prisma.sql`f.deleted_at IS NULL AND (f.code ILIKE ${like} OR f.name ILIKE ${like} OR c.name ILIKE ${like} OR c.code ILIKE ${like}) ${statusWhere} ${customerId ? Prisma.sql`AND f.customer_id=${id(customerId, 'ลูกค้า')}::uuid` : Prisma.empty} ${channel ? Prisma.sql`AND f.channel=${channel}` : Prisma.empty} ${optionalRange(params, Prisma.sql`f.contacted_on`)} ${customerScope(actor, Prisma.sql`f.customer_id`)}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`f.code`,
          customerName: Prisma.sql`c.name`,
          contactedOn: Prisma.sql`f.contacted_on`,
          nextOn: Prisma.sql`f.next_on`,
          status: display(today),
        },
        Prisma.sql`f.status='รอติดตาม' DESC,f.next_on NULLS LAST,f.contacted_on DESC`,
        Prisma.sql`f.id`,
      );
      const rows = await query<FollowUpRow>(
        tx,
        Prisma.sql`SELECT ${select(today)} FROM ${from} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${from} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
