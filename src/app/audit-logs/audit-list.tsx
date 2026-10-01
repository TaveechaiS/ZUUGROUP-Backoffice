import Link from 'next/link';
import { listAuditEvents } from '@/server/audit-logs/service';

type AuditListData = Awaited<ReturnType<typeof listAuditEvents>>;

const actionNames: Record<string, string> = {
  ADMIN_RECOVERED: 'กู้คืนบัญชี Admin',
  PRODUCT_SAMPLE_SEEDED: 'เพิ่มสินค้าตัวอย่าง',
  PRODUCT_CREATED: 'เพิ่มสินค้า',
  PRODUCT_UPDATED: 'แก้ไขสินค้า',
  PRODUCT_DELETED: 'ลบสินค้า',
  PRODUCT_RESTORED: 'กู้คืนสินค้า',
  PRODUCT_MASTER_CREATED: 'เพิ่มข้อมูลแม่สินค้า',
  USER_CREATED: 'เพิ่มผู้ใช้งาน',
  USER_PROFILE_CHANGED: 'แก้ไขผู้ใช้งาน',
  USER_ROLE_CHANGED: 'เปลี่ยนบทบาท',
  USER_STATUS_CHANGED: 'เปลี่ยนสถานะผู้ใช้งาน',
  USER_DELETED: 'ลบผู้ใช้งาน',
  USER_RESTORED: 'กู้คืนผู้ใช้งาน',
  USER_RESTORED_AFTER_GUARD_FAILURE: 'กู้คืนผู้ใช้งานหลังตรวจสิทธิ์',
  PASSWORD_RESET_REQUESTED: 'ขอตั้งรหัสผ่านใหม่',
  PASSWORD_RESET: 'ตั้งรหัสผ่านใหม่',
};

function actionName(action: string) {
  return actionNames[action] ?? action;
}

function pageHref(data: AuditListData, page: number) {
  const params = new URLSearchParams();
  if (data.q) params.set('q', data.q);
  if (data.action) params.set('action', data.action);
  params.set('page', String(page));
  return `/audit-logs?${params}`;
}

export function AuditList({ data }: { data: AuditListData }) {
  return <section className="flex flex-1 flex-col gap-5 p-6 pb-7 text-[#26364b]" aria-label="ประวัติการทำรายการ">
    <header>
      <p className="m-0 text-xs font-semibold text-[#1a58a7]">จัดการระบบ / Audit Logs</p>
      <h1 className="mb-1 mt-2 text-2xl font-semibold">ประวัติการทำรายการ</h1>
      <p className="m-0 text-sm text-[#718096]">เหตุการณ์ที่ระบบบันทึกจริง เรียงจากล่าสุดก่อน</p>
    </header>
    <form action="/audit-logs" method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e4e9f0] bg-[#f8f9fb] p-5">
      <label className="min-w-52 flex-1 text-xs text-[#344256]">ค้นหา
        <input name="q" defaultValue={data.q} maxLength={100} placeholder="เหตุการณ์ รหัสคำขอ หรือผู้ทำรายการ" className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm outline-none focus:border-[#1a58a7]" />
      </label>
      <label className="min-w-48 text-xs text-[#344256]">ประเภทการทำรายการ
        <select name="action" defaultValue={data.action} className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm outline-none focus:border-[#1a58a7]">
          <option value="">ทุกประเภท</option>
          {data.actions.map((action) => <option key={action} value={action}>{actionName(action)}</option>)}
        </select>
      </label>
      <button className="h-10 rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white">ค้นหา</button>
    </form>
    <div className="overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white">
      <table className="w-full min-w-[850px] border-collapse text-left text-sm">
        <thead className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]"><tr>{['วันเวลา', 'การทำรายการ', 'ผู้ทำ / บทบาท', 'ผู้ใช้งานที่เกี่ยวข้อง', 'รหัสคำขอ'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
        <tbody>{data.rows.map((event) => <tr key={event.id} className="border-t border-[#edf0f4] align-top text-[#526176]">
          <td className="whitespace-nowrap px-4 py-4">{event.occurredAt}</td>
          <td className="px-4 py-4"><span className="font-medium text-[#26364b]">{actionName(event.action)}</span><span className="mt-1 block text-xs text-[#8492a6]">{event.action}</span></td>
          <td className="px-4 py-4">{event.actorName ?? 'ระบบ'}<span className="block text-xs text-[#8492a6]">{event.actorCode ? `${event.actorCode} · ` : ''}{event.actorRole ?? '—'}</span></td>
          <td className="px-4 py-4">{event.targetName ?? '—'}{event.targetCode && <span className="block text-xs text-[#8492a6]">{event.targetCode}</span>}</td>
          <td className="break-all px-4 py-4 font-mono text-xs">{event.requestId}</td>
        </tr>)}</tbody>
      </table>
      {data.rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#8492a6]">{data.q || data.action ? 'ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข' : 'ยังไม่มีประวัติการทำรายการ'}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm text-[#758195]">
        <span>แสดง {data.rows.length} จาก {data.total} รายการ</span>
        <div className="flex items-center gap-2"><span>{data.page} / {data.pages}</span>
          {data.page > 1 ? <Link href={pageHref(data, data.page - 1)} className="rounded border px-3 py-1 hover:bg-[#f8f9fb]">ก่อนหน้า</Link> : <span className="rounded border px-3 py-1 opacity-40">ก่อนหน้า</span>}
          {data.page < data.pages ? <Link href={pageHref(data, data.page + 1)} className="rounded border px-3 py-1 hover:bg-[#f8f9fb]">ถัดไป</Link> : <span className="rounded border px-3 py-1 opacity-40">ถัดไป</span>}
        </div>
      </div>
    </div>
  </section>;
}
