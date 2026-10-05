'use client';

import { useEffect, useRef, useState } from 'react';

type NameKind = 'brand' | 'manufacturer';
const nameConfig = {
  brand: { label: 'ยี่ห้อ', storageKey: 'zuugroup.product-brand-names.v1' },
  manufacturer: { label: 'บริษัทผู้ผลิต', storageKey: 'zuugroup.product-manufacturer-names.v1' },
};
const normalize = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ');
const identity = (name: string) => normalize(name).toLocaleLowerCase('th');

export function readProductNames(
  storage: Pick<Storage, 'getItem'>,
  kind: NameKind = 'brand',
): string[] {
  const raw = storage.getItem(nameConfig[kind].storageKey);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some((name) => typeof name !== 'string')) {
    throw new Error('Invalid brand list');
  }
  const names = new Map<string, string>();
  for (const name of parsed as string[]) {
    const clean = normalize(name);
    if (clean && !names.has(identity(clean))) names.set(identity(clean), clean);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, 'th'));
}

export function rememberProductName(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  name: string,
  kind: NameKind = 'brand',
) {
  const clean = normalize(name);
  if (!clean) throw new Error('Empty brand');
  const names = readProductNames(storage, kind);
  const existing = names.find((item) => identity(item) === identity(clean));
  if (existing) return { name: existing, names };
  const updated = [...names, clean].sort((a, b) => a.localeCompare(b, 'th'));
  storage.setItem(nameConfig[kind].storageKey, JSON.stringify(updated));
  return { name: clean, names: updated };
}

export default function ProductNameCombobox({ id, kind }: { id: string; kind: NameKind }) {
  const { label } = nameConfig[kind];
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const cleanSearch = normalize(search);
  const filtered = names.filter((name) => identity(name).includes(identity(search)));
  const canCreate =
    Boolean(cleanSearch) && !names.some((name) => identity(name) === identity(search));
  const choices = [
    ...filtered.map((name) => ({ name, create: false })),
    ...(canCreate ? [{ name: cleanSearch, create: true }] : []),
  ];

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function openList() {
    try {
      setNames(readProductNames(window.localStorage, kind));
      setError('');
    } catch {
      setError(`อ่านรายการ${label}ที่จำไว้ไม่ได้ กรุณาตรวจการอนุญาตจัดเก็บข้อมูลของเบราว์เซอร์`);
    }
    setSearch('');
    setActive(0);
    setOpen(true);
  }

  function choose(index: number) {
    const choice = choices[index];
    if (!choice) return;
    if (choice.create) {
      try {
        const result = rememberProductName(window.localStorage, choice.name, kind);
        setNames(result.names);
        setSelected(result.name);
        setError('');
      } catch {
        setError(`ยังจำ${label}ไม่ได้ กรุณาตรวจการอนุญาตจัดเก็บข้อมูลแล้วลองอีกครั้ง`);
        return;
      }
    } else {
      setSelected(choice.name);
    }
    setSearch('');
    setOpen(false);
  }

  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setSearch('');
        }
      }}
    >
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-activedescendant={open && choices[active] ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
        autoComplete="off"
        placeholder={`พิมพ์${label}ใหม่ หรือค้นหา${label}เดิม`}
        value={open ? search : selected}
        onFocus={openList}
        onClick={() => {
          if (!open) openList();
        }}
        onChange={(event) => {
          setSearch(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
              openList();
              return;
            }
            if (choices.length)
              setActive(
                (index) =>
                  (index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length,
              );
          } else if (event.key === 'Enter' && open) {
            event.preventDefault();
            choose(active);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            setSearch('');
          } else if (event.key === 'Tab') {
            setOpen(false);
            setSearch('');
          }
        }}
        className="block h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 pr-9 text-sm poppins-regular text-[#344256] outline-none transition-colors placeholder:text-[#8994a5] hover:border-blue-300 focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 text-sm text-[#65758b]"
      >
        ⌄
      </span>
      <div
        hidden={!open}
        className="absolute z-20 mt-1 w-full rounded-md border border-[#d9e3ee] bg-white"
      >
        <ul
          ref={listRef}
          id={`${id}-options`}
          role="listbox"
          aria-label={label}
          className="m-0 max-h-64 list-none overflow-y-auto p-1"
        >
          {choices.map((choice, index) => (
            <li
              key={`${choice.create ? 'new' : 'existing'}-${choice.name}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={!choice.create && selected === choice.name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={`cursor-pointer rounded px-3 py-2 text-sm poppins-regular ${active === index ? 'bg-blue-50 text-blue-700' : 'text-[#344256] hover:bg-blue-50'}`}
            >
              {choice.create ? `เพิ่ม${label} “${choice.name}”` : choice.name}
            </li>
          ))}
        </ul>
        {open && !choices.length && (
          <p role="status" className="px-3 py-2 text-sm poppins-regular text-[#65758b]">
            ยังไม่มี{label} พิมพ์ชื่อเพื่อเพิ่มรายการ
          </p>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs leading-5 poppins-regular text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
