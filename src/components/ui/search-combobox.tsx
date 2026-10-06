'use client';
import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from 'react';
type Option = { id: string; code: string; name: string };
type Props = {
  local?: boolean;
  field: { key: string; label: string; required: boolean };
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  errorId?: string;
  statusModule?: string;
  options: Option[];
  search: string;
  offset: number;
  loading: boolean;
  error: string;
  more: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
  setOffset: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
};
export default function SearchCombobox({
  local = false,
  field,
  value,
  onChange,
  invalid,
  errorId,
  statusModule,
  options,
  search,
  offset,
  loading,
  error,
  more,
  setSearch,
  setOffset,
  setLoading,
  setError,
}: Props) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null);
  const optionLabel = (option: Option) =>
    option.name ? option.code + ' · ' + option.name : option.code;
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  const selectedLabel = value
    ? selected?.id === value
      ? selected.label
      : options.find((option) => option.id === value)
        ? (() => {
            const option = options.find((item) => item.id === value)!;
            return optionLabel(option);
          })()
        : statusModule
          ? value
          : 'รายการที่เลือกไว้'
    : '';
  function choose(index: number) {
    const option = index === 0 ? undefined : options[index - 1];
    if (index > 0 && (!option || loading || error)) return;
    onChange(option?.id ?? '');
    setSelected(option ? { id: option.id, label: optionLabel(option) } : null);
    setOpen(false);
  }
  function startSearch() {
    setOpen(true);
    setActive(0);
    if (!local && !statusModule && (search || offset)) setLoading(true);
    setSearch('');
    setOffset(0);
  }
  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <input
        name={field.key}
        aria-invalid={invalid}
        aria-describedby={errorId}
        role="combobox"
        aria-label={field.label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-required={field.required}
        aria-activedescendant={
          open && ((!loading && !error) || active === 0) ? `${listId}-${active}` : undefined
        }
        autoComplete="off"
        placeholder={selectedLabel || `ค้นหาและเลือก${field.label}`}
        value={open ? search : selectedLabel}
        onFocus={startSearch}
        onClick={() => {
          if (!open) startSearch();
        }}
        onChange={(e) => {
          setOpen(true);
          if (!local && !statusModule) {
            setLoading(true);
            setError('');
          }
          setActive(0);
          setSearch(e.target.value);
          setOffset(0);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
              startSearch();
              return;
            }
            const max = loading || error ? 0 : options.length;
            setActive((index) =>
              Math.max(0, Math.min(max, index + (event.key === 'ArrowDown' ? 1 : -1))),
            );
          } else if (event.key === 'Enter' && open) {
            event.preventDefault();
            choose(active);
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          } else if (event.key === 'Tab') {
            setOpen(false);
          }
        }}
        className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white pl-3 pr-8 text-sm outline-none focus:border-[#1a58a7] aria-invalid:border-red-600"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-2.5 text-sm text-[#718096]"
      >
        ⌄
      </span>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-[#d9e3ee] bg-white shadow-lg">
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={field.label}
            aria-busy={loading}
            className="m-0 max-h-[min(25rem,50vh)] list-none overflow-y-auto p-0"
          >
            <li
              id={`${listId}-0`}
              role="option"
              aria-selected={!value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(event) => {
                event.preventDefault();
                choose(0);
              }}
              className={`flex h-10 cursor-pointer items-center rounded px-3 text-sm ${active === 0 ? 'bg-blue-50 text-blue-700' : 'text-[#344256] hover:bg-blue-50'}`}
            >
              ยังไม่ระบุ
            </li>
            {!loading &&
              !error &&
              options.map((option, index) => (
                <li
                  key={option.id}
                  id={`${listId}-${index + 1}`}
                  role="option"
                  aria-selected={value === option.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(event) => {
                    event.preventDefault();
                    choose(index + 1);
                  }}
                  className={`flex h-10 cursor-pointer items-center overflow-hidden whitespace-nowrap rounded px-3 text-sm ${active === index + 1 ? 'bg-blue-50 text-blue-700' : 'text-[#344256] hover:bg-blue-50'}`}
                >
                  {optionLabel(option)}
                </li>
              ))}
          </ul>
          {loading ? (
            <p role="status" className="m-0 px-4 py-2 text-xs text-[#718096]">
              กำลังค้นหา...
            </p>
          ) : error ? (
            <p role="alert" className="m-0 px-4 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : !options.length ? (
            <p role="status" className="m-0 px-4 py-2 text-xs text-[#718096]">
              ไม่พบรายการ
            </p>
          ) : null}
          {!local && !statusModule && (
            <div className="flex justify-between border-t border-[#e3e9f0] p-2 text-xs text-[#1a58a7]">
              <button
                type="button"
                disabled={loading || offset === 0}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setLoading(true);
                  setActive(0);
                  setOffset((n) => Math.max(0, n - 10));
                }}
                className="rounded px-2 py-1 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={loading || !more || Boolean(error)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setLoading(true);
                  setActive(0);
                  setOffset((n) => n + 10);
                }}
                className="rounded px-2 py-1 disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
