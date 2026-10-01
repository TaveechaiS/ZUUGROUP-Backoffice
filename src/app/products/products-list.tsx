'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { money, type ProductView } from './product-ui';

export function ProductsList({ products, isAdmin }: { products: ProductView[]; isAdmin: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<'current' | 'deleted'>('current');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const categories = [...new Set(products.map((product) => product.category))];
  const filtered = useMemo(() => products.filter((product) => {
    if (Boolean(product.deletedAt) !== (tab === 'deleted')) return false;
    if (query && !`${product.code} ${product.name} ${product.drug}`.toLocaleLowerCase('th').includes(query.toLocaleLowerCase('th'))) return false;
    if (category && product.category !== category) return false;
    if (status && product.status !== status) return false;
    return true;
  }), [products, tab, query, category, status]);
  return <main className="flex flex-1 flex-col gap-5 p-6 pb-10 text-[#26364b]">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <h1 className="m-0 text-2xl font-semibold">สินค้า</h1>
      {isAdmin && <Link className="rounded-md bg-[#1a58a7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174a8b]" href="/products/create">+ เพิ่มสินค้า</Link>}
    </header>
    <div role="tablist" aria-label="สถานะรายการสินค้า" className="flex gap-5 border-b border-[#d9e3ee]">
      {([['current', 'รายการปกติ'], ['deleted', 'ลบแล้ว']] as const).filter(([key]) => isAdmin || key === 'current').map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`border-b-2 px-1 pb-3 text-sm ${tab === key ? 'border-[#1a58a7] font-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}>{label}</button>)}
    </div>
    <div className="grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-4 md:grid-cols-3">
      <label className="text-xs text-[#53647c]">ค้นหาชื่อ / รหัส / ตัวยา<input className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาสินค้า" /></label>
      <label className="text-xs text-[#53647c]">หมวดหมู่<select className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">ทุกหมวด</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label>
      <label className="text-xs text-[#53647c]">สถานะ<select className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">ทุกสถานะ</option><option value="ACTIVE">ใช้งาน</option><option value="INACTIVE">ไม่ใช้งาน</option></select></label>
    </div>
    <p className="m-0 text-sm text-[#718096]">พบ {filtered.length} รายการ</p>
    <div className="overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="bg-[#f8f9fb] text-xs text-[#65758b]"><tr>{['รหัส / สินค้า', 'หมวด / รูปแบบ', 'ตัวยา / หน่วย', 'ราคาขาย', 'คลังที่เกี่ยวข้อง', 'สถานะ'].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{filtered.map((product) => {
        const href = `/products/${encodeURIComponent(product.code)}`;
        return <tr key={product.id} role="link" tabIndex={0} aria-label={`ดูรายละเอียด ${product.name}`} onClick={() => router.push(href)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); router.push(href); } }} className="cursor-pointer border-t border-[#edf0f4] align-top hover:bg-[#fafbfc] focus-visible:bg-[#eff5fc] focus-visible:outline-2 focus-visible:outline-[#1a58a7]"><td className="px-4 py-4"><span className="font-semibold text-[#1a58a7]">{product.code}</span><div className="mt-1">{product.name}</div></td><td className="px-4 py-4">{product.category}<div className="text-xs text-[#718096]">{product.dosageForm}</div></td><td className="px-4 py-4">{product.drug}<div className="text-xs text-[#718096]">{product.unit}</div></td><td className="px-4 py-4">{money(product.salePrice)} บาท</td><td className="px-4 py-4">{product.warehouse}</td><td className="px-4 py-4">{product.deletedAt ? 'ลบแล้ว' : product.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}</td></tr>;
      })}</tbody></table>
      {!filtered.length && <p className="p-8 text-center text-sm text-[#718096]">ไม่พบสินค้าตามเงื่อนไขนี้</p>}
    </div>
  </main>;
}
