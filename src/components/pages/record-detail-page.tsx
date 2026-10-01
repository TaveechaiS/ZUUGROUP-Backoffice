'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { moduleFor, type RecordConfig, type RecordRow } from '@/features/records/types';
import { Delete, Get } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { RecordFormPage } from './record-form-page';
export function RecordDetailPage({ moduleKey, id }: { moduleKey: string; id: string }) {
  const entity = moduleFor(moduleKey)!;
  const router = useRouter();
  const [row, setRow] = useState<RecordRow | null>(null),
    [config, setConfig] = useState<RecordConfig | null>(null),
    [error, setError] = useState(''),
    [edit, setEdit] = useState(false),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [afterClosePath, setAfterClosePath] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      Get<{ data: RecordRow }>(
        '/api/' + moduleKey + '/' + encodeURIComponent(id),
        controller.signal,
      ),
      Get<{ data: RecordConfig }>('/api/' + moduleKey + '/config', controller.signal),
    ])
      .then(([r, c]) => {
        setRow(r.data);
        setConfig(c.data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [moduleKey, id]);
  async function remove() {
    if (!window.confirm('ลบรายการนี้? สามารถกู้คืนได้ในแท็บลบแล้ว')) return;
    setBusy(true);
    setError('');
    try {
      await Delete('/api/' + moduleKey + '/' + row!.id, { reason });
      setNotice('ลบรายการแล้ว');
      setAfterClosePath(entity.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }
  if (!row || !config)
    return (
      error ? (
        <section role="alert" className="p-6">
          {error}
          <Link href={entity.page} className="ml-3 text-[#1a58a7]">
            กลับรายการ
          </Link>
        </section>
      ) : <LoadingComponent isVisible />
    );
  if (edit)
    return (
      <RecordFormPage
        moduleKey={moduleKey}
        record={row}
        onSaved={(r) => {
          setRow(r);
          setEdit(false);
          setNotice('บันทึกข้อมูลแล้ว');
        }}
      />
    );
  const date = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  });
  return (
    <section className="flex flex-1 flex-col gap-5 p-6">
      <SuccessAlertComponent
        title={notice}
        isOpen={Boolean(notice)}
        onClose={() => {
          setNotice('');
          if (afterClosePath) {
            const path = afterClosePath;
            setAfterClosePath('');
            router.push(path);
            router.refresh();
          }
        }}
      />
      <Link href={entity.page} className="text-sm text-[#1a58a7]">
        ← {entity.title}
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-xl font-semibold">{row.title}</h1>
          <p className="text-sm text-[#718096]">
            {row.ref} · แก้ไขล่าสุด {date.format(new Date(row.updatedAt))}
          </p>
        </div>
        {config.canWrite && (
          <button
            onClick={() => setEdit(true)}
            className="rounded bg-[#1a58a7] px-4 py-2 text-sm text-white"
          >
            แก้ไขข้อมูล
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <dl className="grid max-w-4xl gap-4 rounded-xl border border-[#d9e3ee] bg-white p-5 sm:grid-cols-2">
        {entity.fields.map((f) => (
          <div key={f.key}>
            <dt className="text-xs text-[#718096]">{f.label}</dt>
            <dd className="m-0 mt-1 break-words text-sm">
              {f.relation ? (
                <RelationName moduleKey={f.relation} id={row.fields[f.key] ?? ''} />
              ) : (
                row.fields[f.key] || '—'
              )}
            </dd>
          </div>
        ))}
      </dl>
      {config.canWrite && (
        <div className="max-w-4xl rounded-xl border border-red-200 p-5">
          <h2 className="text-sm font-semibold text-red-700">ลบรายการ</h2>
          <label className="block text-sm">
            เหตุผล
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              className="mt-2 h-10 w-full rounded border border-[#d9e3ee] px-3"
            />
          </label>
          <button
            disabled={busy}
            onClick={remove}
            className="mt-4 rounded border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
          >
            {busy ? 'กำลังลบ...' : 'ลบรายการ'}
          </button>
        </div>
      )}
    </section>
  );
}
function RelationName({ moduleKey, id }: { moduleKey: string; id: string }) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    Get<{ data: { title?: string; name?: string } }>(
      '/api/' + moduleKey + '/' + id,
      controller.signal,
    )
      .then((r) => setName(r.data.title ?? r.data.name ?? ''))
      .catch(() => {});
    return () => controller.abort();
  }, [moduleKey, id]);
  return id ? name || 'รายการที่เชื่อมไว้' : '—';
}
