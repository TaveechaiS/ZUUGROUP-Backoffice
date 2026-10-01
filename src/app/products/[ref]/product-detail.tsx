'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonClass, inputClass, money, type Masters, type ProductView } from '../product-ui';
import { Update } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';

export function ProductDetail({ initialProduct, masters, isAdmin }: { initialProduct: ProductView; masters: Masters; isAdmin: boolean }) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');
  const [name, setName] = useState(product.name);
  const [drugId, setDrugId] = useState(product.drugId);
  const [warehouseId, setWarehouseId] = useState(product.defaultWarehouseId);
  const [unit, setUnit] = useState(product.unit);
  const [salePrice, setSalePrice] = useState(product.salePrice);
  const [status, setStatus] = useState(product.status);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); await patch({ action: 'update', name, drugId, defaultWarehouseId: warehouseId,
      categoryId: product.categoryId, dosageFormId: product.dosageFormId, unit, salePrice, status });
  }
  async function patch(body: Record<string, unknown>) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await Update<{ product: ProductView }>(`/api/products/${product.id}`, body);
      setProduct(result.product);
      setNotice(body.action === 'delete' ? 'ลบสินค้าแล้ว' : body.action === 'restore' ? 'กู้คืนสินค้าแล้ว' : 'บันทึกข้อมูลแล้ว');
      setReason(''); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'บันทึกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }
  return <main className="flex flex-1 flex-col gap-6 p-6 pb-10 text-[#26364b]">
    <nav><Link href="/products" className="text-sm text-[#1a58a7] hover:underline">← กลับไปรายการสินค้า</Link></nav>
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d9e3ee] pb-5"><div><h1 className="m-0 text-2xl font-semibold">{product.name}</h1><p className="mb-0 mt-1 text-sm text-[#718096]">รหัส {product.code} · รหัสนี้คงเดิมหลังสร้าง</p></div><span className="rounded-full bg-[#eff5fc] px-3 py-1.5 text-xs text-[#174a8b]">{product.deletedAt ? 'ลบแล้ว' : product.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}</span></header>
    {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SuccessAlertComponent title={notice} isOpen={Boolean(notice)} onClose={() => setNotice('')} />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]"><section className="rounded-xl border border-[#e3e9f0] bg-white p-6"><h2 className="mt-0 text-base font-semibold">ข้อมูลหลักสินค้า</h2>
      <div className="grid gap-4 border-b border-[#e3e9f0] pb-5 text-sm sm:grid-cols-2"><Datum label="หมวดหมู่ยา" value={`${product.categoryCode} · ${product.category}`} /><Datum label="รูปแบบยา" value={`${product.dosageFormCode} · ${product.dosageForm}`} /><Datum label="เลขลำดับ" value={product.sequence} /><Datum label="ตัวยา" value={product.drug} /><Datum label="คลังที่เกี่ยวข้อง" value={product.warehouse} /><Datum label="ราคาขาย" value={`${money(product.salePrice)} บาท`} /></div>
      {isAdmin && !product.deletedAt ? <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="ชื่อสินค้า"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} /></Field><Field label="ตัวยา / ชื่อสามัญ"><select className={inputClass} value={drugId} onChange={(event) => setDrugId(event.target.value)}>{masters.drugs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="หน่วยประจำ"><input className={inputClass} value={unit} onChange={(event) => setUnit(event.target.value)} required maxLength={80} /></Field><Field label="คลังที่เกี่ยวข้อง"><select className={inputClass} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}>{masters.warehouses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="ราคาขาย (บาท)"><input className={inputClass} type="number" min="0" step="0.01" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} required /></Field><Field label="สถานะ"><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ACTIVE">ใช้งาน</option><option value="INACTIVE">ไม่ใช้งาน</option></select></Field><p className="col-span-full m-0 text-xs text-[#718096]">การเปลี่ยนคลังที่เกี่ยวข้องไม่ย้ายยอดสินค้า</p><div className="col-span-full flex justify-end"><button className={buttonClass} disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</button></div></form> : <p className="mt-5 text-sm text-[#718096]">{product.deletedAt ? 'สินค้านี้ถูกลบเชิงตรรกะ กู้คืนก่อนจึงจะแก้ไขได้' : 'ข้อมูลนี้อ่านได้ตามสิทธิ์ของคุณ'}</p>}
    </section><aside className="rounded-xl border border-[#e3e9f0] bg-white p-5"><h2 className="mt-0 text-base font-semibold">สถานะคลัง</h2><p className="m-0 text-sm leading-6 text-[#718096]">คลังที่เลือกเป็นข้อมูลอ้างอิง ยังไม่มีการรับเข้า โอน ตัดสต็อก หรือยอดคงเหลือในโมดูลนี้</p></aside></div>
    {isAdmin && <section className="rounded-xl border border-[#efc8c8] bg-white p-5"><h2 className="mt-0 text-base font-semibold text-[#a63333]">{product.deletedAt ? 'กู้คืนสินค้า' : 'ลบสินค้า'}</h2><p className="text-sm text-[#718096]">{product.deletedAt ? 'กู้คืนแล้วจะแสดงในรายการปกติ โดยใช้รหัสเดิม' : 'ลบเชิงตรรกะและซ่อนจากรายการปกติ รหัสเดิมยังถูกจองไว้'}</p><label className="block text-xs text-[#53647c]">เหตุผล<textarea className="mt-1.5 min-h-20 w-full rounded-md border border-[#d9e3ee] p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} /></label><button disabled={busy || !reason.trim()} onClick={() => patch({ action: product.deletedAt ? 'restore' : 'delete', reason })} className="mt-3 rounded-md border border-[#c74b4b] px-4 py-2 text-sm font-medium text-[#a63333] disabled:opacity-50">{product.deletedAt ? 'กู้คืนสินค้า' : 'ลบสินค้า'}</button></section>}
  </main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-xs font-medium text-[#53647c]">{label}{children}</label>; }
function Datum({ label, value }: { label: string; value: string }) { return <div><span className="text-xs text-[#718096]">{label}</span><div className="mt-1 font-medium">{value}</div></div>; }
