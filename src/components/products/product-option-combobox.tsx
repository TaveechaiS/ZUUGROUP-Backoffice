'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Get } from '@/service/http';
import { PRODUCT_OPTION_KINDS, type ProductOptionKind } from '@/config/product-options';
import type { ProductOption, ProductOptionsResponse } from '@/types/api/product-options';

export default function ProductOptionCombobox({
  id,
  kind,
  required = false,
  canManage = false,
}: {
  id: string;
  kind: ProductOptionKind;
  required?: boolean;
  canManage?: boolean;
}) {
  const label = PRODUCT_OPTION_KINDS[kind].label;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const selectedRef = useRef<ProductOption | null>(null);
  const [items, setItems] = useState<ProductOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const message = selectionError || error;
  const [active, setActive] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const requestVersion = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validateSelection = () => {
      setRefresh((v) => v + 1);
      const previous = selectedRef.current;
      if (!previous) return;
      Get<ProductOptionsResponse>(`/api/product-options?kind=${kind}&id=${previous.id}`)
        .then(({ data }) => {
          if (selectedRef.current?.id !== previous.id) return;
          selectedRef.current = data[0] ?? null;
          setSelected(data[0] ?? null);
          setSelectionError(data[0] ? '' : 'รายการที่เลือกถูกปิดแล้ว กรุณาเลือกใหม่');
        })
        .catch(() => setSelectionError('ตรวจสอบรายการที่เลือกไม่ได้ กรุณาลองใหม่'));
    };
    window.addEventListener('focus', validateSelection);
    return () => window.removeEventListener('focus', validateSelection);
  }, [kind]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const version = ++requestVersion.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ kind, search: query, limit: '50', offset: '0' });
      Get<ProductOptionsResponse>('/api/product-options?' + params, controller.signal)
        .then((response) => {
          if (version !== requestVersion.current || controller.signal.aborted) return;
          setItems(response.data);
          setTotal(response.pagination.total);
          setActive(0);
        })
        .catch((e: Error) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [kind, open, query, refresh]);
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function choose(item: ProductOption) {
    selectedRef.current = item;
    setSelected(item);
    setOpen(false);
    setQuery('');
    setError('');
    setSelectionError('');
  }
  async function loadMore() {
    const version = requestVersion.current;
    const params = new URLSearchParams({
      kind,
      search: query,
      limit: '50',
      offset: String(items.length),
    });
    setLoading(true);
    try {
      const response = await Get<ProductOptionsResponse>('/api/product-options?' + params);
      if (version === requestVersion.current) {
        setItems((current) => [
          ...current,
          ...response.data.filter((item) => !current.some((v) => v.id === item.id)),
        ]);
        setTotal(response.pagination.total);
      }
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }
  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      <input type="hidden" name={`product-option-${kind}`} value={selected?.id ?? ''} />
      <input
        id={id}
        role="combobox"
        aria-label={label}
        aria-required={required}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && items[active] ? `${id}-option-${items[active].id}` : undefined
        }
        aria-describedby={message ? `${id}-error` : undefined}
        autoComplete="off"
        placeholder={`ค้นหาและเลือก${label}`}
        value={open ? query : (selected?.name ?? '')}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setItems([]);
          setOpen(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setOpen(false);
            setQuery('');
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActive((value) =>
              Math.max(0, Math.min(items.length - 1, value + (event.key === 'ArrowDown' ? 1 : -1))),
            );
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (open && items[active] && !loading) choose(items[active]);
            else setOpen(true);
          } else if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
          }
        }}
        className="block h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 pr-9 text-sm poppins-regular text-[#344256] outline-none transition-colors placeholder:text-[#8994a5] hover:border-blue-300 focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-0 flex h-11 items-center opacity-30"
      >
        <svg
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L7 7L13 1"
            stroke="#101828"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-md border border-[#d9e3ee] bg-white shadow-sm"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div
            ref={listRef}
            id={`${id}-options`}
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                id={`${id}-option-${item.id}`}
                role="option"
                aria-selected={selected?.id === item.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
                className={`cursor-pointer px-3 py-2 text-sm poppins-regular text-[#344256] ${index === active ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
              >
                {item.code ? `${item.code} — ${item.name}` : item.name}
              </div>
            ))}
          </div>
          {loading && (
            <p role="status" className="px-3 py-2 text-sm poppins-regular text-[#65758b]">
              กำลังโหลด...
            </p>
          )}
          {!loading && !message && !items.length && (
            <p role="status" className="px-3 py-2 text-sm poppins-regular text-[#65758b]">
              ไม่พบรายการ
            </p>
          )}
          {!loading && items.length < total && (
            <button
              type="button"
              onClick={loadMore}
              className="w-full px-3 py-2 text-sm poppins-medium text-[#1a58a7]"
            >
              แสดงเพิ่มเติม
            </button>
          )}
          {canManage && !loading && !items.length && (
            <Link
              href={`/settings/product-options?kind=${kind}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm poppins-medium text-[#1a58a7]"
            >
              ไปตั้งค่า{label}
            </Link>
          )}
          {error && (
            <button
              type="button"
              onClick={() => setRefresh((v) => v + 1)}
              className="px-3 py-2 text-sm poppins-medium text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          )}
        </div>
      )}
      {message && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm poppins-regular text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
