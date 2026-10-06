'use client';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, Get, Post, HttpError } from '@/service/http';
import {
  PRODUCT_OPTION_FIELDS,
  PRODUCT_TEXT_FIELDS,
  PRODUCT_FILE_LIMIT,
  PRODUCT_IMAGE_TYPES,
  type ProductDraft,
  type ProductHistoryEntry,
} from '@/types/api/product-full';
import type { ProductView } from '@/types/api/products';
import type { ProductOption } from '@/types/api/product-options';
import type { Pagination } from '@/types/api';
import type { LotRow, PageData } from '@/types/api/operations';
import PaginationControls from '@/components/ui/pagination-controls';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import { useRouteData } from '@/components/ui/route-data';

import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import StatusBadge from '@/components/ui/status-badge';
import ProductRecordHistory from './product-record-history';

const requiredFields = new Set([
  'รหัสสินค้าภายในบริษัท',
  'ชื่อสินค้าเต็ม',
  'กลุ่มรหัส',
  'รูปแบบ',
  'ประเภทผลิตภัณฑ์',
  'หมวดหมู่สินค้า',
  'หน่วยสินค้า',
  'ราคาขาย',
]);

const productSections = [
  {
    title: 'ข้อมูลทั่วไป',
    fields: [
      ['รหัสสินค้าภายในบริษัท', 'รหัสอ้างอิงของสินค้า เช่น กลุ่มรหัส–รูปแบบ–เลขลำดับ'],
      ['ชื่อสินค้าเต็ม', 'ชื่อภาษาไทยและภาษาอังกฤษ พร้อมรายละเอียดที่ใช้แยกสินค้า'],
      ['ชื่อการค้า', 'ชื่อผลิตภัณฑ์บนบรรจุภัณฑ์'],
      ['ยี่ห้อ', 'แบรนด์ของผลิตภัณฑ์ เลือกจากรายการกลาง'],
      ['ประเภทผลิตภัณฑ์', 'ยา เครื่องสำอาง เครื่องมือแพทย์ หรือประเภทอื่น'],
      ['หมวดหมู่สินค้า', 'กลุ่มที่ใช้จัดรายการ ค้นหา และทำรายงาน'],
      ['หน่วยสินค้า', 'หน่วยที่ใช้ระบุจำนวนสินค้า เช่น เม็ด ขวด กล่อง หรือลัง'],
      ['บริษัทผู้ผลิต', 'บริษัทหรือโรงงานที่ผลิตสินค้า'],
      ['ราคาขาย', 'ราคาขายต่อหน่วยสินค้า'],
      ['รายละเอียดสินค้า', 'คำอธิบายเพิ่มเติมเกี่ยวกับตัวสินค้า'],
    ],
  },
  {
    title: 'ข้อมูลยาและทะเบียน',
    fields: [
      ['ตัวยาสำคัญ', 'ชื่อสามัญทางยา รองรับผลิตภัณฑ์ที่มีหลายตัวยา'],
      ['ความแรง', 'ปริมาณ หน่วย และฐานความแรงของตัวยาแต่ละตัว'],
      ['รูปแบบยา', 'เช่น ยาเม็ด แคปซูล น้ำเชื่อม ยาฉีด หรือครีม'],
      ['ข้อมูลทะเบียนผลิตภัณฑ์', 'ประเภททะเบียนและเลขทะเบียน เช่น เลขทะเบียนตำรับยา'],
      ['ประเภทตามกฎหมาย', 'ประเภทของผลิตภัณฑ์ที่ตรวจสอบแล้ว พร้อมแหล่งอ้างอิง'],
      ['สรรพคุณ / ข้อบ่งใช้', 'ข้อมูลตามฉลากหรือเอกสารกำกับผลิตภัณฑ์'],
      ['คำเตือนและข้อห้ามใช้', 'คำเตือน ข้อห้าม และข้อมูลความปลอดภัยตามเอกสารกำกับ'],
      ['เงื่อนไขการสั่งจ่าย', 'เงื่อนไขที่ต้องตรวจสอบก่อนขาย พร้อมข้อมูลอ้างอิง'],
    ],
  },
  {
    title: 'รูปสินค้าและเอกสาร',
    fields: [
      ['รูปสินค้า', 'รูปหลัก รูปกล่อง ฉลาก และตัวสินค้า'],
      ['เอกสารแนบ', 'รูปหรือ PDF พร้อมประเภทเอกสาร ชื่อ และวันที่ที่เกี่ยวข้อง'],
    ],
  },
] as const;

export default function Page() {
  const { product: routeProduct, isAdmin } = useRouteData();
  const router = useRouter();
  const [updatedProduct, setProduct] = useState<ProductView | null>(null);
  const product = updatedProduct ?? routeProduct;
  const [openSections, setOpenSections] = useState<string[]>(['ข้อมูลทั่วไป']);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<'save' | 'cancel' | null>(null);
  const [options, setOptions] = useState<Record<string, ProductOption[]>>({});
  const [kept, setKept] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ kind: 'image' | 'document'; file: File }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [progress, setProgress] = useState('');
  const lock = useRef(false);
  const pending = useRef<{
    id: string;
    signature: string;
    body: { requestId: string; expectedVersion: string; data: ProductDraft; keepFileIds: string[] };
    files: { id: string; kind: string; file: File }[];
  } | null>(null);
  const [historyRevision, setHistoryRevision] = useState(0);
  if (!product) return <NotFoundComponent title="ไม่พบข้อมูลสินค้า" />;
  const values: Record<string, string | undefined> = {
    รหัสสินค้าภายในบริษัท: product.code,
    ชื่อสินค้าเต็ม: product.name,
    หมวดหมู่สินค้า: product.category?.name,
    หน่วยสินค้า: product.unit,
    ราคาขาย: product.salePrice,
    ตัวยาสำคัญ: product.drug?.name,
    รูปแบบยา: product.dosageForm?.name,
    เลขลำดับ: product.sequence,
    รหัสสินค้าเต็ม: product.code,
  };
  const current = { ...values, ...product.details?.fields };
  const initial = () => ({
    ...Object.fromEntries(Object.entries(current).map(([label, value]) => [label, value ?? ''])),
    ...product.details?.options,
  });
  const dirty =
    Object.keys(draft).some((label) => draft[label] !== (initial()[label] ?? '')) ||
    newFiles.length > 0 ||
    kept.length !== (product.details?.files.length ?? 0);
  async function beginEdit() {
    if (lock.current || !product) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const batch = await Get<{ options: Record<string, ProductOption[]> }>(
        '/api/product-options?kinds=' +
          [...new Set(Object.values(PRODUCT_OPTION_FIELDS))].join(','),
      );
      const lists = { ...batch.options };
      const next = initial();
      for (const [label, kind] of Object.entries(PRODUCT_OPTION_FIELDS)) {
        const id = product.details?.options[label];
        next[label] = id ?? lists[kind]?.find((option) => option.name === current[label])?.id ?? '';
        if (id && !lists[kind]?.some((option) => option.id === id))
          lists[kind] = [
            ...(lists[kind] ?? []),
            {
              id,
              kind,
              name: current[label] ?? '',
              code:
                label === 'กลุ่มรหัส'
                  ? product.code.split('-')[0]
                  : label === 'รูปแบบ'
                    ? product.code.split('-')[1]
                    : null,
              active: false,
              version: 0,
            } as ProductOption,
          ];
      }
      if (!product.details) next['ชื่อสินค้าเต็ม (ไทย)'] = product.name;
      setOptions(lists);
      setDraft(next);
      setKept(product.details?.files.map((file) => file.id) ?? []);
      setNewFiles([]);
      setConflict(false);
      setEditing(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'โหลดตัวเลือกไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function resolvePending() {
    if (!pending.current) return null;
    const previous = await Get<{ status: string; product?: { id: string; code: string } }>(
      `/api/products/full/requests/${pending.current.id}`,
    ).catch((error) => {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    });
    if (previous?.status === 'complete') return previous.product!;
    if (previous) await Delete(`/api/products/full/requests/${pending.current.id}`);
    pending.current = null;
    return null;
  }
  async function finishSave(result: { id: string; code: string }) {
    const latest = await Get<{ product: ProductView }>(`/api/products/${result.id}`);
    setProduct(latest.product);
    pending.current = null;
    setEditing(false);
    setNewFiles([]);
    setError('');
    setConflict(false);
    setAlert('save');
    setHistoryRevision((n) => n + 1);
    router.replace(`/products/${encodeURIComponent(latest.product.code)}`);
    router.refresh();
  }
  async function cancelEdit() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const completed = await resolvePending();
      if (completed) {
        await finishSave(completed);
        return;
      }
      if (dirty) setAlert('cancel');
      else setEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ยกเลิกไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function closeAlert() {
    if (alert === 'cancel') {
      setDraft({});
      setEditing(false);
    }
    setAlert(null);
  }
  async function saveEdit() {
    if (lock.current || !product) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const fields = Object.fromEntries(
        [...Object.keys(PRODUCT_OPTION_FIELDS), ...PRODUCT_TEXT_FIELDS].map((label) => [
          label,
          draft[label] ?? '',
        ]),
      );
      const hashes = await Promise.all(
        newFiles.map(async ({ file }) =>
          Array.from(
            new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())),
            (byte) => byte.toString(16).padStart(2, '0'),
          ).join(''),
        ),
      );
      const signature = JSON.stringify([
        fields,
        draft['เลขลำดับ'],
        kept,
        newFiles.map(({ kind, file }, i) => [kind, file.name, file.type, file.size, hashes[i]]),
      ]);
      if (pending.current) {
        const previous = await Get<{ status: string; product?: { id: string; code: string } }>(
          `/api/products/full/requests/${pending.current.id}`,
        ).catch((error) => {
          if (error instanceof HttpError && error.status === 404) return null;
          throw error;
        });
        if (previous?.status === 'complete') {
          await finishSave(previous.product!);
          return;
        }
        if (!previous) pending.current = null;
        else if (previous.status === 'cancelled' || pending.current.signature !== signature)
          await resolvePending();
      }
      if (!pending.current) {
        if (!product.version) throw new Error('กรุณาโหลดข้อมูลสินค้าล่าสุดก่อนแก้ไข');
        const id = crypto.randomUUID();
        const files = newFiles.map((file) => ({ ...file, id: crypto.randomUUID() }));
        pending.current = {
          id,
          signature,
          files,
          body: {
            requestId: id,
            expectedVersion: product.version,
            keepFileIds: [...kept],
            data: {
              fields,
              sequence: draft['เลขลำดับ'] ?? '',
              files: files.map(({ id, kind, file }, index) => ({
                id,
                kind,
                name: file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ',
                type: file.type,
                size: file.size,
                digest: hashes[index],
              })),
            },
          },
        };
      }
      const request = pending.current;
      setProgress('ตรวจข้อมูลสินค้า');
      const started = await Post<{ status: string }>(
        `/api/products/${product.id}/edit-requests`,
        request.body,
      );
      if (started.status !== 'complete')
        for (let index = 0; index < request.files.length; index++) {
          setProgress(`อัปโหลดไฟล์ ${index + 1}/${request.files.length}`);
          const item = request.files[index],
            form = new FormData();
          form.append('fileId', item.id);
          form.append('kind', item.kind);
          form.append('file', item.file);
          await Post(`/api/products/full/requests/${request.id}/files`, form);
        }
      setProgress('บันทึกสินค้า');
      const result = await Post<{ product: { id: string; code: string } }>(
        `/api/products/full/requests/${request.id}`,
      );
      await finishSave(result.product);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
      setConflict(
        error instanceof HttpError &&
          error.status === 409 &&
          error.message.includes('ถูกเปลี่ยนแล้ว'),
      );
    } finally {
      lock.current = false;
      setBusy(false);
      setProgress('');
    }
  }
  async function reloadLatest() {
    if (lock.current || !product) return;
    lock.current = true;
    setBusy(true);
    try {
      const completed = await resolvePending();
      if (completed) {
        await finishSave(completed);
        return;
      }
      const latest = await Get<{ product: ProductView }>(`/api/products/${product.id}`);
      setProduct(latest.product);
      setEditing(false);
      setNewFiles([]);
      setConflict(false);
      setError('');
      router.replace(`/products/${encodeURIComponent(latest.product.code)}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const priceFields = ['ราคาขาย'];
  const textAreas = [
    'รายละเอียดสินค้า',
    'สรรพคุณ / ข้อบ่งใช้',
    'คำเตือนและข้อห้ามใช้',
    'เงื่อนไขการสั่งจ่าย',
  ];
  const editInputClass =
    'mt-2 min-h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100';
  const input = (label: string) => {
    const kind = PRODUCT_OPTION_FIELDS[label as keyof typeof PRODUCT_OPTION_FIELDS];
    if (kind)
      return (
        <EditOption
          label={label}
          value={draft[label] ?? ''}
          items={options[kind] ?? []}
          disabled={busy}
          onChange={(value) => setDraft((old) => ({ ...old, [label]: value }))}
        />
      );
    if (label === 'รหัสสินค้าเต็ม') {
      const group = options.codeGroup?.find((item) => item.id === draft['กลุ่มรหัส'])?.code;
      const format = options.codeFormat?.find((item) => item.id === draft['รูปแบบ'])?.code;
      return (
        <input
          aria-label={label}
          readOnly
          value={
            group && format && draft['เลขลำดับ']
              ? `${group}-${format}-${draft['เลขลำดับ'].padStart(5, '0')}`
              : ''
          }
          className={editInputClass + ' bg-[#f8f9fb]'}
        />
      );
    }
    return textAreas.includes(label) ? (
      <textarea
        aria-label={label}
        rows={3}
        disabled={busy}
        value={draft[label] ?? ''}
        onChange={(event) => setDraft((previous) => ({ ...previous, [label]: event.target.value }))}
        className={editInputClass}
      />
    ) : (
      <input
        aria-label={label}
        type={priceFields.includes(label) ? 'number' : 'text'}
        disabled={busy}
        inputMode={label === 'เลขลำดับ' ? 'numeric' : undefined}
        step={priceFields.includes(label) ? 'any' : undefined}
        value={draft[label] ?? ''}
        onChange={(event) => setDraft((previous) => ({ ...previous, [label]: event.target.value }))}
        className={editInputClass}
      />
    );
  };
  const cell = (label: string, value?: string) => (
    <div key={label} className="min-w-0 basis-full sm:basis-[calc(50%-1rem)]">
      <dt className="text-sm poppins-medium text-[#344256]">
        {label}
        {editing && requiredFields.has(label) && <span className="ml-1 text-red-600">*</span>}
      </dt>
      {['รูปสินค้า', 'เอกสารแนบ'].includes(label) ? (
        <dd className="mt-2">
          {product.details?.files
            .filter((file) => !editing || kept.includes(file.id))
            .filter((file) => file.kind === (label === 'รูปสินค้า' ? 'image' : 'document'))
            .length ? (
            <ul className="flex list-none flex-wrap gap-3 p-0">
              {product.details.files
                .filter((file) => !editing || kept.includes(file.id))
                .filter((file) => file.kind === (label === 'รูปสินค้า' ? 'image' : 'document'))
                .map((file) => (
                  <li
                    key={file.id}
                    className="w-full min-w-0 rounded-md border border-[#d9e3ee] p-3 sm:w-52"
                  >
                    {file.type.startsWith('image/') && (
                      <Image
                        src={`/api/products/full/files/${file.id}`}
                        alt={file.name}
                        width={184}
                        height={128}
                        unoptimized
                        className="mb-2 h-32 w-full rounded object-contain"
                      />
                    )}
                    <a
                      href={`/api/products/full/files/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-sm poppins-medium text-[#1a58a7] hover:underline"
                    >
                      {file.name}
                    </a>
                    <p className="mt-1 text-xs poppins-regular text-[#65758b]">
                      {(file.size / 1024).toLocaleString('th-TH', { maximumFractionDigits: 1 })} KB
                    </p>
                    {editing && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setKept((ids) => ids.filter((id) => id !== file.id))}
                        className="mt-2 text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        นำไฟล์ออก
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            '—'
          )}
          {editing && (
            <div className="mt-3 space-y-2">
              <input
                aria-label={`เพิ่ม${label}`}
                type="file"
                multiple
                disabled={busy}
                accept={
                  label === 'รูปสินค้า'
                    ? PRODUCT_IMAGE_TYPES.join(',')
                    : [...PRODUCT_IMAGE_TYPES, 'application/pdf'].join(',')
                }
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  const allowed =
                    label === 'รูปสินค้า'
                      ? PRODUCT_IMAGE_TYPES
                      : [...PRODUCT_IMAGE_TYPES, 'application/pdf'];
                  if (
                    files.some(
                      (file) =>
                        !file.size ||
                        file.size > PRODUCT_FILE_LIMIT ||
                        !allowed.includes(file.type),
                    )
                  )
                    setError('แนบรูปภาพหรือ PDF ตามประเภทไฟล์ ขนาดไม่เกิน 10 MB ต่อไฟล์');
                  else {
                    setNewFiles((old) => [
                      ...old,
                      ...files.map((file) => ({
                        kind: label === 'รูปสินค้า' ? ('image' as const) : ('document' as const),
                        file,
                      })),
                    ]);
                    setError('');
                  }
                  event.target.value = '';
                }}
                className="w-full rounded-md border border-[#d9e3ee] p-3 text-sm text-[#344256] file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-[#1a58a7]"
              />
              <p className="text-xs text-[#65758b]">
                ไม่เกิน 10 MB ต่อไฟล์ · เพิ่มหลายไฟล์ได้ ·
                เปลี่ยนไฟล์โดยนำไฟล์เดิมออกแล้วแนบไฟล์ใหม่
              </p>
              {newFiles.map(
                (item, index) =>
                  item.kind === (label === 'รูปสินค้า' ? 'image' : 'document') && (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-md border border-[#d9e3ee] p-3 text-sm text-[#344256]"
                    >
                      <span className="min-w-0 flex-1 break-words">
                        {item.file.name} · {(item.file.size / 1024).toFixed(1)} KB (ใหม่)
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setNewFiles((files) => files.filter((_, i) => i !== index))}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        นำไฟล์ออก
                      </button>
                    </div>
                  ),
              )}
              <p className="text-xs text-[#65758b]">
                แนบ{' '}
                {kept.filter((id) =>
                  product.details?.files.some(
                    (file) =>
                      file.id === id &&
                      file.kind === (label === 'รูปสินค้า' ? 'image' : 'document'),
                  ),
                ).length +
                  newFiles.filter(
                    (item) => item.kind === (label === 'รูปสินค้า' ? 'image' : 'document'),
                  ).length}{' '}
                ไฟล์
              </p>
            </div>
          )}
        </dd>
      ) : editing ? (
        <dd>{input(label)}</dd>
      ) : (
        <dd className="mt-2 min-h-11 break-words rounded-md border border-[#d9e3ee] bg-[#f8f9fb] px-3 py-2.5 text-sm poppins-regular text-[#344256]">
          {(current[label] ?? value)
            ? label === 'ราคาขาย'
              ? money(current[label] ?? value)
              : (current[label] ?? value)
            : '—'}
        </dd>
      )}
    </div>
  );
  return (
    <article className="min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg poppins-semibold text-[#344256]">
          รายละเอียดสินค้า — {product.code}
        </h2>
        <Link
          href="/products"
          className="rounded-md border border-[#d9e3ee] px-4 py-2 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50"
        >
          กลับรายการสินค้า
        </Link>
      </div>
      {productSections.map((section) => (
        <details
          key={section.title}
          open={openSections.includes(section.title)}
          onToggle={(event) => {
            const open = event.currentTarget.open;
            setOpenSections((current) =>
              open
                ? current.includes(section.title)
                  ? current
                  : [...current, section.title]
                : current.filter((title) => title !== section.title),
            );
          }}
          className="group min-w-0 rounded-lg border border-[#d9e3ee] p-4 md:p-6"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
            <h3 className="text-base poppins-semibold text-[#1a58a7]">{section.title}</h3>
            <svg
              width="23"
              height="13"
              viewBox="0 0 23 13"
              fill="none"
              aria-hidden="true"
              className="shrink-0 -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
            >
              <path
                d="M1.5 1.5L11.5 11.5L21.5 1.5"
                stroke="#1A58A7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          {openSections.includes(section.title) && (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-5">
              {section.fields.map(([label]) => {
                if (label === 'รหัสสินค้าภายในบริษัท')
                  return (
                    <div key={label} className="basis-full">
                      <dt className="text-sm poppins-medium text-[#344256]">
                        {label}
                        {editing && requiredFields.has(label) && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </dt>
                      <dd>
                        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-5">
                          {cell('กลุ่มรหัส')}
                          {cell('รูปแบบ')}
                          {cell('เลขลำดับ', product.sequence)}
                          {cell('รหัสสินค้าเต็ม', product.code)}
                        </dl>
                      </dd>
                    </div>
                  );
                if (label === 'ชื่อสินค้าเต็ม')
                  return (
                    <div key={label} className="basis-full">
                      <dt className="text-sm poppins-medium text-[#344256]">
                        {label}
                        {editing && requiredFields.has(label) && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </dt>
                      <dd className="mt-2 break-words text-sm poppins-regular text-[#344256]">
                        {editing
                          ? draft['ชื่อสินค้าเต็ม (ไทย)'] ||
                            draft['ชื่อสินค้าเต็ม (ภาษาอังกฤษ)'] ||
                            '—'
                          : current[label] || '—'}
                      </dd>
                      <dd>
                        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-5">
                          {cell('ชื่อสินค้าเต็ม (ไทย)')}
                          {cell('ชื่อสินค้าเต็ม (ภาษาอังกฤษ)')}
                        </dl>
                      </dd>
                    </div>
                  );
                return cell(label, values[label]);
              })}
            </dl>
          )}
        </details>
      ))}
      <LotHistory productId={product.id} currentOnly />
      <LotHistory productId={product.id} />
      <ProductHistory productId={product.id} revision={historyRevision} />
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          <p>{error}</p>
          {conflict && (
            <>
              <p className="mt-2">
                ข้อมูลที่กรอกยังอยู่ หากโหลดข้อมูลล่าสุด ข้อมูลที่ยังไม่บันทึกจะถูกแทนที่
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={reloadLatest}
                className="mt-3 rounded-md border border-red-300 px-3 py-2 poppins-medium disabled:opacity-50"
              >
                โหลดข้อมูลล่าสุดและเริ่มแก้ไขใหม่
              </button>
            </>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="text-right text-sm text-[#65758b]">
          {progress || 'กำลังดำเนินการ...'}
        </p>
      )}
      <ProductRecordHistory
        productId={product.id}
        createdAt={product.createdAt}
        revision={historyRevision}
      />
      {isAdmin && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={busy}
                className="rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium text-[#344256] hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={busy || conflict}
                className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
              >
                บันทึก
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={beginEdit}
              disabled={busy}
              className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
            >
              แก้ไข
            </button>
          )}
        </div>
      )}
      <SuccessAlertComponent
        isOpen={alert !== null}
        title={alert === 'save' ? 'บันทึกข้อมูลสินค้าแล้ว' : 'ยกเลิกการแก้ไข'}
        description={
          alert === 'save'
            ? 'บันทึกข้อมูลและไฟล์แนบเรียบร้อยแล้ว ดูรายการเปลี่ยนแปลงได้ในประวัติการแก้ไขสินค้า'
            : 'ข้อมูลที่เปลี่ยนในรอบนี้จะไม่ถูกเก็บ กดตกลงเพื่อกลับไปดูข้อมูลก่อนแก้ไข'
        }
        onClose={closeAlert}
      />
    </article>
  );
}

function EditOption({
  label,
  value,
  items,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  items: ProductOption[];
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const selected = items.find((item) => item.id === value);
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setActive(
            Math.max(
              0,
              items.findIndex((item) => item.id === value),
            ),
          );
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActive((n) =>
              Math.max(0, Math.min(items.length - 1, n + (event.key === 'ArrowDown' ? 1 : -1))),
            );
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault();
            if (items[active]) onChange(items[active].id);
            setOpen(false);
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
          if (event.key === 'Home' && open) {
            event.preventDefault();
            setActive(0);
          }
          if (event.key === 'End' && open) {
            event.preventDefault();
            setActive(items.length - 1);
          }
        }}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-left text-sm poppins-regular text-[#344256] focus-visible:outline-2 focus-visible:outline-[#1a58a7] disabled:opacity-50"
      >
        <span>
          {selected?.name || `เลือก${label}`}
          {selected && !selected.active ? ' (รายการเดิม)' : ''}
        </span>
        <span aria-hidden="true" className="text-[#8994a5]">
          ⌄
        </span>
      </button>
      {value && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('')}
          className="mt-1 text-xs text-[#65758b] hover:underline"
          aria-label={`ล้าง${label}`}
        >
          ล้าง
        </button>
      )}
      {open && (
        <div
          ref={list}
          role="listbox"
          id={id}
          aria-label={label}
          onMouseDown={(event) => event.preventDefault()}
          className="absolute z-30 mt-1 max-h-[min(25rem,50vh)] w-full overflow-y-auto rounded-md border border-[#d9e3ee] bg-white shadow-sm"
        >
          {items.map((item, index) => (
            <div
              role="option"
              id={`${id}-${index}`}
              key={item.id}
              aria-selected={value === item.id}
              onMouseEnter={() => setActive(index)}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={`flex h-10 cursor-pointer items-center whitespace-nowrap px-3 text-sm text-[#344256] ${active === index ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
            >
              {item.code ? `${item.code} — ` : ''}
              {item.name}
              {!item.active ? ' (รายการเดิม)' : ''}
            </div>
          ))}
          {!items.length && <p className="p-3 text-sm text-[#65758b]">ยังไม่มีรายการ</p>}
        </div>
      )}
    </div>
  );
}

function ProductHistory({ productId, revision }: { productId: string; revision: number }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const { key: sortKey, direction: sortDirection } = sort;
  const [response, setResponse] = useState<{
    data: ProductHistoryEntry[];
    pagination: Pagination;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await Get<{ data: ProductHistoryEntry[]; pagination: Pagination }>(
          withTableSort(
            `/api/products/${productId}/history?limit=${pageSize}&offset=${(page - 1) * pageSize}`,
            { key: sortKey, direction: sortDirection },
          ),
          controller.signal,
        );
        if (alive) setResponse(data);
      } catch (error) {
        if (alive) setError(error instanceof Error ? error.message : 'โหลดประวัติไม่สำเร็จ');
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [open, productId, revision, page, pageSize, sortKey, sortDirection, retry]);
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-base poppins-semibold text-[#1a58a7] [&::-webkit-details-marker]:hidden">
        ประวัติการแก้ไขสินค้า
        <svg
          width="23"
          height="13"
          viewBox="0 0 23 13"
          fill="none"
          aria-hidden="true"
          className="-rotate-90 transition-transform group-open:rotate-0"
        >
          <path
            d="M1.5 1.5L11.5 11.5L21.5 1.5"
            stroke="#1A58A7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      {open && (
        <div className="mt-4">
          {loading ? (
            <LoadingComponent isVisible />
          ) : error ? (
            <div role="alert" className="text-sm text-red-600">
              {error}
              <button
                type="button"
                onClick={() => setRetry((n) => n + 1)}
                className="ml-3 underline"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <SortableTable
                  sort={sort}
                  columns={['occurredAt', 'actorName', null]}
                  className="w-full text-left text-sm text-[#344256]"
                >
                  <thead className="bg-[#f8f9fb]">
                    <tr>
                      {['วันและเวลา', 'ผู้แก้ไข', 'รายการเปลี่ยนแปลง'].map((label) => (
                        <th key={label} scope="col" className="p-3 poppins-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response?.data.map((entry) => (
                      <tr key={entry.id} className="border-b border-[#d9e3ee]">
                        <td className="p-3 align-top whitespace-nowrap">
                          {dateTime(entry.occurredAt)}
                        </td>
                        <td className="p-3 align-top">{entry.actorName}</td>
                        <td className="min-w-72 p-3">
                          {entry.action === 'PRODUCT_CREATED_FULL' ? (
                            <p className="mb-2 poppins-medium">เพิ่มสินค้า</p>
                          ) : null}
                          {entry.changes.length
                            ? entry.changes.map((change) => (
                                <div
                                  key={change.field}
                                  className="mb-3 whitespace-pre-wrap break-words"
                                >
                                  <p className="poppins-medium">{change.field}</p>
                                  <p className="text-[#65758b]">เดิม: {change.before || '—'}</p>
                                  <p>ใหม่: {change.after || '—'}</p>
                                </div>
                              ))
                            : 'บันทึกโดยไม่มีข้อมูลเปลี่ยนแปลง'}
                        </td>
                      </tr>
                    ))}
                    {!response?.data.length && (
                      <tr>
                        <td colSpan={3} className="p-5 text-center text-[#65758b]">
                          <NotFoundComponent title="ยังไม่มีประวัติการแก้ไข" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </SortableTable>
              </div>
              <PaginationControls
                page={page}
                pages={response?.pagination.totalPages ?? 1}
                total={response?.pagination.total ?? 0}
                count={response?.data.length ?? 0}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onChange={setPage}
              />
            </>
          )}
        </div>
      )}
    </details>
  );
}

function LotHistory({
  productId,
  currentOnly = false,
}: {
  productId: string;
  currentOnly?: boolean;
}) {
  const { isAdmin } = useRouteData();
  const [open, setOpen] = useState(currentOnly);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<PageData<LotRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [warehouseCode, setWarehouseCode] = useState('');
  const [destroyTarget, setDestroyTarget] = useState<LotRow | null>(null);
  const [destroyPending, setDestroyPending] = useState<{
    action: 'destroy';
    lotId: string;
    warehouseId: string;
    expectedQuantity: number;
    confirmed: true;
    reason: string;
    idempotencyKey: string;
  } | null>(null);
  const [destroyConfirm, setDestroyConfirm] = useState(false);
  const [destroyBusy, setDestroyBusy] = useState(false);
  const [destroyError, setDestroyError] = useState('');
  const [destroySuccess, setDestroySuccess] = useState(false);
  const disposalView = currentOnly && warehouseCode === 'DISPOSAL';
  async function destroyLot() {
    if (!isAdmin || !destroyTarget || destroyBusy) return;
    const balance = destroyTarget.balances.find((item) => item.warehouseCode === 'DISPOSAL');
    if (!balance) return;
    const body = destroyPending ?? {
      action: 'destroy' as const,
      lotId: destroyTarget.id,
      warehouseId: balance.warehouseId,
      expectedQuantity: balance.quantity,
      confirmed: true as const,
      reason: 'ยืนยันทำลายล็อตจากคลังรอทำลาย',
      idempotencyKey: crypto.randomUUID(),
    };
    setDestroyPending(body);
    setDestroyBusy(true);
    setDestroyError('');
    try {
      await Post('/api/inventory', body);
      setResult((previous) =>
        previous
          ? {
              ...previous,
              data: previous.data.map((lot) =>
                lot.id === body.lotId
                  ? {
                      ...lot,
                      quantity: lot.quantity - body.expectedQuantity,
                      disposalDestroyed: true,
                      balances: lot.balances.map((item) =>
                        item.warehouseId === body.warehouseId
                          ? { ...item, quantity: 0, available: 0, disposalDestroyed: true }
                          : item,
                      ),
                    }
                  : lot,
              ),
            }
          : previous,
      );
      setDestroyPending(null);
      setDestroyConfirm(false);
      setDestroySuccess(true);
    } catch (caught) {
      const definitive = caught instanceof HttpError && caught.status >= 400 && caught.status < 500;
      if (definitive) setDestroyPending(null);
      setDestroyError(
        (caught instanceof Error ? caught.message : 'บันทึกทำลายไม่สำเร็จ') +
          (definitive ? '' : ' กดลองอีกครั้งเพื่อส่งคำขอเดิม'),
      );
    } finally {
      setDestroyBusy(false);
    }
  }
  useEffect(() => {
    if (!currentOnly) return;
    const code = new URLSearchParams(window.location.search).get('warehouse') ?? '';
    const timer = setTimeout(() => {
      if (['MAIN', 'MARKETING', 'DISPOSAL'].includes(code)) {
        setWarehouseCode(code);
        setPage(1);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentOnly, productId]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      Get<PageData<LotRow>>(
        withTableSort(
          '/api/inventory?view=lots&productId=' +
            encodeURIComponent(productId) +
            (currentOnly
              ? '&remaining=true&warehouseCode=' + encodeURIComponent(warehouseCode)
              : '') +
            '&limit=' +
            pageSize +
            '&offset=' +
            (page - 1) * pageSize,
          { key: sort.key, direction: sort.direction },
        ),
        controller.signal,
      )
        .then((value) => {
          if (controller.signal.aborted) return;
          setResult(value);
          const last = Math.max(1, Math.ceil(value.pagination.total / pageSize));
          if (page > last) setPage(last);
        })
        .catch((caught) => {
          if (!controller.signal.aborted)
            setError(caught instanceof Error ? caught.message : 'โหลดประวัติล็อตไม่สำเร็จ');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    open,
    productId,
    page,
    pageSize,
    retry,
    currentOnly,
    warehouseCode,
    sort.key,
    sort.direction,
  ]);
  const rows = result?.data ?? [];
  const showsCost = rows.some((lot) => lot.unitCost !== undefined);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group min-w-0 rounded-lg border border-[#d9e3ee] p-4 md:p-6"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
        <h3 className="text-base poppins-semibold text-[#1a58a7]">
          {currentOnly ? 'ล็อตสินค้าคงเหลือ' : 'ประวัติล็อตสินค้า'}
        </h3>
        <svg
          width="23"
          height="13"
          viewBox="0 0 23 13"
          fill="none"
          aria-hidden="true"
          className="shrink-0 -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
        >
          <path
            d="M1.5 1.5L11.5 11.5L21.5 1.5"
            stroke="#1A58A7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      {open && (
        <div className="mt-4 space-y-4">
          {currentOnly && (
            <div
              role="tablist"
              aria-label="ล็อตคงเหลือแยกคลัง"
              className="flex flex-wrap gap-4 border-b border-[#d9e3ee]"
            >
              {[
                ['', 'ทั้งหมด'],
                ['MAIN', 'คลังหลัก'],
                ['MARKETING', 'คลังการตลาด'],
                ['DISPOSAL', 'คลังรอทำลาย'],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  disabled={destroyBusy || Boolean(destroyPending)}
                  aria-selected={warehouseCode === code}
                  onClick={() => {
                    setWarehouseCode(code);
                    setPage(1);
                  }}
                  className={
                    'border-b-2 px-1 py-2 text-sm ' +
                    (warehouseCode === code
                      ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]'
                      : 'border-transparent text-[#65758b]')
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <ListRequestState error={error} retry={() => setRetry((value) => value + 1)} />
          {destroyError && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {destroyError}
            </p>
          )}
          {loading ? (
            <LoadingComponent isVisible />
          ) : (
            !error && (
              <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                <SortableTable
                  sort={sort}
                  columns={[
                    'receiptCode',
                    'createdAt',
                    'manufacturedOn',
                    'expiresOn',
                    'expiresOn',
                    'receivedQuantity',
                    'quantity',
                    'warehouseName',
                    ...(showsCost ? ['totalCost', 'unitCost'] : []),
                    ...(disposalView ? [null] : !currentOnly ? ['disposalDestroyed'] : []),
                  ]}
                  className="w-full whitespace-nowrap text-left text-sm"
                >
                  <thead className="bg-[#f7f9fc] text-[#65758b]">
                    <tr>
                      {[
                        'ID',
                        'วันที่รับเข้า',
                        'วันผลิต',
                        'วันหมดอายุ',
                        'เหลือก่อนหมดอายุ',
                        'จำนวนรับเข้า',
                        'คงเหลือ',
                        'คงเหลือแยกคลัง',
                        ...(showsCost ? ['ต้นทุนรวมล็อต', 'ต้นทุนต่อชิ้น'] : []),
                        ...(disposalView ? ['จัดการ'] : !currentOnly ? ['สถานะ'] : []),
                      ].map((label) => (
                        <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((lot) => {
                      const balances = currentOnly
                        ? lot.balances.filter(
                            (balance) =>
                              balance.quantity > 0 &&
                              (!warehouseCode || balance.warehouseCode === warehouseCode),
                          )
                        : lot.balances;
                      const quantity = currentOnly
                        ? balances.reduce((sum, balance) => sum + balance.quantity, 0)
                        : lot.quantity;
                      const remaining = Math.ceil(
                        (Date.parse(lot.expiresOn.slice(0, 10)) - Date.parse(today)) / 86400000,
                      );
                      return (
                        <tr key={lot.id} className="border-t border-[#d9e3ee]">
                          <td className="px-4 py-3">
                            <Link
                              href={'/products/stock/receipts/' + encodeURIComponent(lot.id)}
                              className="text-[#1a58a7] hover:underline"
                            >
                              {lot.receiptCode}
                            </Link>
                          </td>
                          <td className="px-4 py-3">{dateTime(lot.createdAt)}</td>
                          <td className="px-4 py-3">{dateOnly(lot.manufacturedOn)}</td>
                          <td className="px-4 py-3">{dateOnly(lot.expiresOn)}</td>
                          <td className="px-4 py-3">
                            {Number.isFinite(remaining)
                              ? remaining.toLocaleString('th-TH') + ' วัน'
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {lot.receivedQuantity} {lot.unit}
                          </td>
                          <td className="px-4 py-3">
                            {quantity} {lot.unit}
                          </td>
                          <td className="px-4 py-3">
                            {balances
                              .map(
                                (balance) =>
                                  balance.warehouseName +
                                  ': ' +
                                  balance.quantity +
                                  ' ' +
                                  balance.unit,
                              )
                              .join(' / ')}
                          </td>
                          {showsCost && (
                            <td className="px-4 py-3">
                              {lot.totalCost !== undefined ? money(lot.totalCost) : '—'}
                            </td>
                          )}
                          {showsCost && (
                            <td className="px-4 py-3">
                              {lot.unitCost !== undefined ? money(lot.unitCost) : '—'}
                            </td>
                          )}
                          {(disposalView || !currentOnly) && (
                            <td className="px-4 py-3">
                              {lot.balances.some(
                                (balance) =>
                                  balance.warehouseCode === 'DISPOSAL' && balance.disposalDestroyed,
                              ) ? (
                                <StatusBadge value="ทำลายแล้ว" />
                              ) : disposalView && isAdmin ? (
                                <button
                                  type="button"
                                  disabled={
                                    destroyBusy ||
                                    Boolean(destroyPending && destroyPending.lotId !== lot.id)
                                  }
                                  onClick={() => {
                                    setDestroyTarget(lot);
                                    setDestroyError('');
                                    setDestroyConfirm(true);
                                  }}
                                  className="rounded-lg bg-red-600 px-4 py-2 text-sm poppins-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {destroyPending?.lotId === lot.id ? 'ลองอีกครั้ง' : 'ทำลายแล้ว'}
                                </button>
                              ) : (
                                <span className="text-[#65758b]">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </SortableTable>
                {!rows.length && (
                  <NotFoundComponent
                    title={
                      currentOnly
                        ? 'ไม่มีล็อตสินค้าคงเหลือในคลังที่เลือก'
                        : 'ยังไม่มีประวัติล็อตสินค้า'
                    }
                  />
                )}
                <PaginationControls
                  page={page}
                  pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
                  total={result?.pagination.total ?? 0}
                  count={rows.length}
                  onChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  disabled={loading}
                />
              </div>
            )
          )}
        </div>
      )}
      <ConfirmationDialog
        isOpen={destroyConfirm}
        title="ยืนยันทำลายสินค้า"
        description={
          'ID ' +
          (destroyTarget?.receiptCode ?? '') +
          ' จำนวน ' +
          (destroyTarget?.balances.find((balance) => balance.warehouseCode === 'DISPOSAL')
            ?.quantity ?? 0) +
          ' ' +
          (destroyTarget?.unit ?? '') +
          ' ในคลังรอทำลาย จะตัดยอดทั้งหมดของล็อตนี้ในคลังรอทำลาย'
        }
        busy={destroyBusy}
        confirmLabel="ยืนยันทำลายแล้ว"
        busyLabel="กำลังบันทึก…"
        variant="danger"
        onCancel={() => {
          if (!destroyBusy) setDestroyConfirm(false);
        }}
        onConfirm={destroyLot}
      />
      <SuccessAlertComponent
        isOpen={destroySuccess}
        title="บันทึกทำลายแล้ว"
        description="ตัดยอดล็อตนี้ในคลังรอทำลายแล้ว และเก็บประวัติการทำลายไว้ ไม่สามารถกดทำลายซ้ำ"
        onClose={() => setDestroySuccess(false)}
      />
    </details>
  );
}

const dateOnly = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value.slice(0, 10) + 'T00:00:00+07:00'));

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
