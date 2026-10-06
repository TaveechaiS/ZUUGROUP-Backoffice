'use client';
import { useEffect, useState } from 'react';
import SearchCombobox from './search-combobox';
import { Get } from '@/service/http';
import type { RecordOptionsResponse } from '@/types/api/records';

type Option = { id: string; code: string; name: string };
export default function UserTerritoryPicker({ value, onChange, initial }: {
  value: string; onChange: (value: string) => void; initial?: Option | null;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ view: 'options', search, offset: String(offset), limit: '10' });
      Get<RecordOptionsResponse>('/api/sales-territories?' + params, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          setOptions(result.data); setMore(result.pagination.hasMore); setError(''); setLoading(false);
        }).catch((caught) => {
          if (controller.signal.aborted) return;
          setError(caught instanceof Error ? caught.message : 'โหลดเขตไม่สำเร็จ'); setLoading(false);
        });
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, offset]);
  return <div className="text-sm poppins-medium text-[#35465d]">
    <span>เขตขาย</span>
    <SearchCombobox field={{ key: 'territorySearch', label: 'เขตขาย', required: false }}
      value={value} onChange={onChange} invalid={false}
      options={initial && initial.id === value && !options.some((option) => option.id === value)
        ? [initial, ...options] : options}
      search={search} offset={offset} loading={loading} error={error} more={more}
      setSearch={setSearch} setOffset={setOffset} setLoading={setLoading} setError={setError} />
    <input type="hidden" name="territoryId" value={value} />
  </div>;
}
