'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonClass, inputClass, type Master, type Masters } from '../product-ui';
import { Get, Post } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';

export function CreateProductForm({ initialMasters }: { initialMasters: Masters }) {
  const router = useRouter();
  const [masters, setMasters] = useState(initialMasters);
  const [categoryId, setCategoryId] = useState(initialMasters.categories[0]?.id ?? '');
  const [dosageFormId, setDosageFormId] = useState(initialMasters.dosageForms[0]?.id ?? '');
  const [drugId, setDrugId] = useState(initialMasters.drugs[0]?.id ?? '');
  const [warehouseId, setWarehouseId] = useState(initialMasters.warehouses[0]?.id ?? '');
  const [sequence, setSequence] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [masterType, setMasterType] = useState<'category' | 'dosageForm' | 'drug'>('drug');
  const [masterName, setMasterName] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [createdPath, setCreatedPath] = useState('');

  useEffect(() => {
    if (!categoryId || !dosageFormId) return;
    const controller = new AbortController();
    Get<{ sequence: string }>(`/api/products/next-sequence?categoryId=${encodeURIComponent(categoryId)}&dosageFormId=${encodeURIComponent(dosageFormId)}`, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setSequence(result.sequence ?? ''); })
      .catch(() => { if (!controller.signal.aborted) setSequence(''); });
    return () => controller.abort();
  }, [categoryId, dosageFormId]);

  const category = masters.categories.find((item) => item.id === categoryId);
  const form = masters.dosageForms.find((item) => item.id === dosageFormId);
  const preview = category && form && /^[0-9]{4}$/.test(sequence) ? `${category.code}-${form.code}-${sequence}` : 'เลือกรายการและเลขลำดับ';
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const result = await Post<{ product: { code: string } }>('/api/products',
        { ...values, categoryId, dosageFormId, drugId, defaultWarehouseId: warehouseId, sequence });
      setCreatedPath(`/products/${encodeURIComponent(result.product.code)}`);
      setSuccessTitle('สร้างสินค้าแล้ว');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'สร้างสินค้าไม่สำเร็จ'); setBusy(false); }
  }
  async function addMaster(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    try {
      const result = await Post<{ item: Master }>('/api/products/masters',
        { type: masterType, name: masterName, code: masterCode });
      const item = result.item as Master;
      const key = masterType === 'category' ? 'categories' : masterType === 'dosageForm' ? 'dosageForms' : 'drugs';
      setMasters((current) => ({ ...current, [key]: [...current[key], item] }));
      if (masterType === 'category') setCategoryId(item.id);
      if (masterType === 'dosageForm') setDosageFormId(item.id);
      if (masterType === 'drug') setDrugId(item.id);
      setMasterName(''); setMasterCode('');
      setSuccessTitle('เพิ่มข้อมูลแม่สินค้าแล้ว');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'เพิ่มรายการไม่สำเร็จ'); }
  }
  return <main className="flex flex-1 flex-col gap-6 p-6 pb-10 text-[#26364b]">
    <SuccessAlertComponent title={successTitle} isOpen={Boolean(successTitle)} onClose={() => {
      setSuccessTitle('');
      if (createdPath) {
        const path = createdPath;
        setCreatedPath('');
        router.push(path);
        router.refresh();
      }
    }} />
    <header><Link href="/products" className="text-sm text-[#1a58a7] hover:underline">← กลับไปรายการสินค้า</Link><h1 className="mb-0 mt-3 text-2xl font-semibold">เพิ่มสินค้า</h1></header>
    <form onSubmit={create} className="grid max-w-4xl gap-6 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm">
      <section><h2 className="mt-0 text-base font-semibold">รหัสและข้อมูลอ้างอิง</h2><div className="grid gap-4 sm:grid-cols-2">
        <Field label="หมวดหมู่ยา"><select required className={inputClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">เลือกหมวดหมู่</option>{masters.categories.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field>
        <Field label="รูปแบบยา"><select required className={inputClass} value={dosageFormId} onChange={(event) => setDosageFormId(event.target.value)}><option value="">เลือกรูปแบบยา</option>{masters.dosageForms.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field>
        <Field label="ตัวยา / ชื่อสามัญ"><select required className={inputClass} value={drugId} onChange={(event) => setDrugId(event.target.value)}><option value="">เลือกตัวยา</option>{masters.drugs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="คลังที่เกี่ยวข้อง"><select required className={inputClass} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}><option value="">เลือกคลัง</option>{masters.warehouses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="เลขลำดับ 4 หลัก"><input className={inputClass} value={sequence} onChange={(event) => setSequence(event.target.value)} required pattern="[0-9]{4}" maxLength={4} inputMode="numeric" /></Field>
        <div className="rounded-md bg-[#eff5fc] p-3 text-sm"><span className="block text-xs text-[#65758b]">รหัสสินค้าที่จะสร้าง</span><strong className="mt-1 block text-[#174a8b]">{preview}</strong><span className="mt-1 block text-xs text-[#65758b]">เลขที่แสดงอาจเปลี่ยนเมื่อมีคนบันทึกพร้อมกัน ระบบจะตรวจซ้ำก่อนสร้าง</span></div>
      </div></section>
      <section><h2 className="mt-0 text-base font-semibold">ข้อมูลสินค้า</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="ชื่อสินค้า"><input className={inputClass} name="name" required maxLength={160} /></Field><Field label="หน่วยประจำ"><input className={inputClass} name="unit" required maxLength={80} placeholder="เช่น กล่อง" /></Field><Field label="ราคาขาย (บาท)"><input className={inputClass} name="salePrice" type="number" min="0" max="9999999999.99" step="0.01" defaultValue="0" required /></Field><Field label="สถานะ"><select className={inputClass} name="status"><option value="ACTIVE">ใช้งาน</option><option value="INACTIVE">ไม่ใช้งาน</option></select></Field></div></section>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-[#e3e9f0] pt-5"><Link href="/products" className="rounded-md border border-[#d9e3ee] px-4 py-2.5 text-sm">ยกเลิก</Link><button className={buttonClass} disabled={busy}>{busy ? 'กำลังบันทึก...' : 'สร้างสินค้า'}</button></div>
    </form>
    <details className="max-w-4xl rounded-md border border-[#d9e3ee] bg-white p-4"><summary className="cursor-pointer text-sm font-semibold text-[#1a58a7]">+ เพิ่มหมวด รูปแบบยา หรือตัวยาใหม่</summary><form onSubmit={addMaster} className="mt-4"><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs">ประเภท<select className={inputClass} value={masterType} onChange={(event) => setMasterType(event.target.value as typeof masterType)}><option value="drug">ตัวยา</option><option value="category">หมวดหมู่ยา</option><option value="dosageForm">รูปแบบยา</option></select></label><label className="text-xs">ชื่อ<input className={inputClass} value={masterName} onChange={(event) => setMasterName(event.target.value)} maxLength={160} required /></label>{masterType !== 'drug' && <label className="text-xs">รหัส 2–3 หลัก<input className={inputClass} value={masterCode} onChange={(event) => setMasterCode(event.target.value.toUpperCase())} minLength={2} maxLength={3} required /></label>}</div><button className="mt-3 rounded-md border border-[#1a58a7] px-3 py-2 text-sm font-medium text-[#1a58a7]">เพิ่มรายการแม่</button></form></details>
  </main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-xs font-medium text-[#53647c]">{label}{children}</label>; }
