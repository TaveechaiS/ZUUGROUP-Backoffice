import Link from 'next/link';
import { ADMIN_PAGES } from '@/config/navigation';
import { requireAdmin } from '@/server/auth/current-user';

const groups = [
  { phase: 'Phase 3–4', title: 'ระบบและผู้ใช้งาน', note: 'บัญชีผู้ใช้ใช้งานจริง ส่วน Audit และตั้งค่าระบบยังเป็นตัวอย่าง', paths: ['/users', '/audit-logs', '/settings'] },
  { phase: 'Phase 5', title: 'ข้อมูลหลักและคลัง', note: 'ใช้ดูโครงรายการและหน้าเพิ่มก่อนยืนยันข้อมูลจริง', paths: ['/customers', '/products', '/stock-counts'] },
  { phase: 'Phase 6', title: 'จัดซื้อและค่าใช้จ่าย', note: 'ตัวอย่างหน้าจอ ยังไม่มีการเปลี่ยนยอดสต็อก', paths: ['/suppliers', '/purchases', '/expenses'] },
  { phase: 'Phase 7', title: 'ขายและส่งของ', note: 'ตัวอย่างเส้นทางเอกสาร ยังไม่มีกฎอนุมัติหรือจัดส่งจริง', paths: ['/quotes', '/orders', '/promotions'] },
  { phase: 'Phase 8–9', title: 'การเงินและรายงาน', note: 'ตัวอย่างการจัดวาง ยังไม่คำนวณยอดหรือออกรายงานจริง', paths: ['/billing', '/reports/sales', '/reports/inventory', '/reports/finance'] },
] as const;

export default async function Page() {
  await requireAdmin();
  return (
    <main className="flex flex-1 flex-col gap-7 p-6 pb-10 text-[#26364b]">
      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold tracking-wide text-[#1a58a7]">ภาพรวมหน้าระบบ</p>
        <h1 className="m-0 text-2xl font-semibold">เส้นทางหน้าระบบ</h1>
        <p className="mb-0 mt-2 text-sm leading-6 text-[#718096]">เปิดดูรูปแบบรายการและหน้าเพิ่มของแต่ละโมดูลได้จากที่นี่ หน้า Detail ตัวอย่างเริ่มที่ลูกค้าและสินค้า ข้อมูลจริงและกฎการทำงานจะเติมหลังได้รับข้อกำหนด</p>
      </header>

      <div className="grid gap-8 xl:grid-cols-2">
        {groups.map((group) => (
          <section key={group.phase} className="min-w-0 border-t border-[#d9e3ee] pt-4" aria-labelledby={`heading-${group.phase}`}>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xs font-semibold text-[#1a58a7]">{group.phase}</span>
              <h2 id={`heading-${group.phase}`} className="m-0 text-lg font-semibold">{group.title}</h2>
            </div>
            <p className="mb-4 mt-0 text-sm text-[#718096]">{group.note}</p>
            <ul className="m-0 divide-y divide-[#e8edf3] border-y border-[#e8edf3] p-0">
              {group.paths.map((path) => {
                const page = ADMIN_PAGES.find((item) => item.href === path);
                if (!page) return null;
                const hasDetail = path === '/customers' || path === '/products';
                return <li key={path} className="list-none">
                  <Link href={path} className="group flex min-h-14 items-center justify-between gap-4 py-3 text-sm hover:text-[#1a58a7] focus-visible:outline-2 focus-visible:outline-[#1a58a7]">
                    <span className="min-w-0"><span className="block font-medium">{page.label}</span><span className="mt-0.5 block text-xs text-[#8492a6]">{hasDetail ? 'รายการ · เพิ่ม · รายละเอียดตัวอย่าง' : path === '/users' ? 'จัดการบัญชีจริง' : 'รายการ · เพิ่มตัวอย่าง'}</span></span>
                    <span aria-hidden="true" className="shrink-0 text-lg text-[#9aa8b8] group-hover:translate-x-1 group-hover:text-[#1a58a7]">→</span>
                  </Link>
                </li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
