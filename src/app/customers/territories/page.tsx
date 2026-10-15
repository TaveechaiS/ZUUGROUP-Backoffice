'use client';
import { use, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { RecordListResponse, RecordDetailResponse } from '@/types/api/records';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { filterClass, inputClass, primaryButtonClass } from '@/components/ui/form-classes';

const apiPath = '/api/sales-territories';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'deleted'>(
    use(searchParams).tab === 'deleted' ? 'deleted' : 'active',
  );
  const errorId = useId();
  const lock = useRef(false);
  const [result, setResult] = useState<RecordListResponse | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setOffset(0));
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        search,
        offset: String(offset),
        limit: String(pageSize),
        include: 'config',
      });
      if (tab === 'deleted') params.set('deleted', 'true');
      Get<RecordListResponse>(
        withTableSort(apiPath + '?' + params, { key: sort.key, direction: sort.direction }),
        controller.signal,
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          setResult(data);
          setCanWrite(Boolean(data.config?.canWrite));
          if (offset && !data.data.length) setOffset(0);
        })
        .catch((caught) => {
          if (!controller.signal.aborted)
            setError(caught instanceof Error ? caught.message : 'โหลดเขตขายไม่สำเร็จ');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, offset, pageSize, refresh, sort.key, sort.direction, tab]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || success || !canWrite) return;
    if (!name.trim()) {
      setFormError('กรุณากรอกชื่อเขต');
      return;
    }
    if (name.trim().length > 500 || notes.trim().length > 4000) {
      setFormError('ชื่อเขตหรือหมายเหตุยาวเกินกำหนด');
      return;
    }
    lock.current = true;
    setBusy(true);
    setFormError('');
    try {
      await Post<RecordDetailResponse>(apiPath, { name: name.trim(), notes: notes.trim() });
      setName('');
      setNotes('');
      setSearch('');
      setOffset(0);
      setRefresh((value) => value + 1);
      setSuccess(true);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'เพิ่มเขตไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const rows = loading || error ? [] : (result?.data ?? []);
  const detailPath = (id: string) =>
    '/customers/territories/' + id + (tab === 'deleted' ? '?deleted=true' : '');
  return (
    <section
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
      aria-label="เขตขาย"
    >
      {canWrite && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
          <div role="tablist" aria-label="มุมมองเขตขาย" className="flex flex-wrap gap-5">
            {(
              [
                ['active', 'เขตขาย'],
                ['deleted', 'ลบแล้ว'],
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => {
                  setTab(value);
                  setOffset(0);
                }}
                className={`border-b-2 px-1 py-3 text-sm ${tab === value ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-5">
        {canWrite && tab === 'active' && (
          <div className="min-w-0 rounded-lg border border-[#d9e3ee] p-4 md:p-6">
            <div id="add-territory" className="flex min-w-0 scroll-mt-6 flex-col gap-2">
              <h3 className="text-sm poppins-medium text-[#344256]">
                เพิ่มเขตขาย
                <span aria-hidden="true" className="ml-1 text-red-600">
                  *
                </span>
              </h3>
              <form noValidate onSubmit={create} className="flex min-w-0 flex-1 flex-col gap-4">
                <fieldset disabled={busy || success} className="min-w-0 flex-1 space-y-4">
                  <input
                    name="name"
                    aria-label="ชื่อเขต"
                    placeholder="ชื่อเขต"
                    required
                    maxLength={500}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                    aria-invalid={Boolean(formError)}
                    aria-describedby={formError ? errorId : undefined}
                  />
                  <textarea
                    name="notes"
                    aria-label="หมายเหตุ"
                    placeholder="หมายเหตุ"
                    maxLength={4000}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className={`${inputClass} min-h-20 py-3`}
                  />
                  {formError && (
                    <p id={errorId} role="alert" className="text-sm poppins-regular text-red-600">
                      {formError}
                    </p>
                  )}
                </fieldset>
                <div className="flex min-h-11 justify-end gap-3">
                  <button type="submit" disabled={busy || success} className={primaryButtonClass}>
                    {busy ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3">
          <label className="text-xs text-[#53647c]">
            ค้นหา
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="ค้นหาชื่อเขต"
              className={`mt-1.5 ${filterClass}`}
            />
          </label>
        </div>
        {error && (
          <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
            {error}
            <button
              type="button"
              onClick={() => setRefresh((value) => value + 1)}
              className="text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          </div>
        )}
        <div
          className="relative min-h-52 min-w-0 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
          aria-busy={loading}
        >
          <SortableTable
            sort={sort}
            columns={['name', 'managerName', 'salesCount', 'memberCount']}
            className="w-full min-w-[580px] border-collapse text-left text-sm"
          >
            <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
              <tr>
                {['ชื่อเขต', 'ผู้จัดการ (Manager)', 'ฝ่ายขาย (Sales)', 'ลูกค้า'].map((label) => (
                  <th scope="col" key={label} className="px-4 py-3 poppins-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`ดูรายละเอียด ${item.name}`}
                  onClick={() => router.push(detailPath(item.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(detailPath(item.id));
                    }
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="break-words px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{String(item.managerName || '—')}</td>
                  <td className="px-4 py-3">{item.salesCount ?? 0} คน</td>
                  <td className="px-4 py-3">{Number(item.memberCount ?? 0)} ราย</td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
          <LoadingComponent
            isVisible={loading && !error}
            variant="content"
            label="กำลังโหลดเขตขาย..."
          />
          {!loading && !error && !rows.length && (
            <NotFoundComponent
              title="ไม่พบเขตขาย"
              onRefresh={() => setRefresh((value) => value + 1)}
            />
          )}
          <div className="border-t border-[#edf0f4] p-3">
            <PaginationControls
              page={Math.floor(offset / pageSize) + 1}
              pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
              total={result?.pagination.total ?? 0}
              count={rows.length}
              onChange={(page) => setOffset((page - 1) * pageSize)}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setOffset(0);
              }}
              disabled={loading || busy}
            />
          </div>
        </div>
      </div>
      <SuccessAlertComponent
        isOpen={success}
        title="เพิ่มเขตขายแล้ว"
        onClose={() => setSuccess(false)}
      />
    </section>
  );
}
