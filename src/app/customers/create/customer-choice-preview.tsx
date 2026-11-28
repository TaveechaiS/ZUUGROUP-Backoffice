'use client';

import { useState } from 'react';
import SearchCombobox from '@/components/ui/search-combobox';

export type ChoiceOption = { id: string; label: string };

// Binary choices are a checkbox (checked = first option); lists are a searchable combobox.
// The selected value is submitted through a hidden input named `name`.
export default function CustomerChoicePreview({
  label,
  name,
  options,
  required = false,
  binary = false,
  inputId,
  initialValue = '',
  onChange,
}: {
  label: string;
  name: string;
  options: ChoiceOption[];
  required?: boolean;
  binary?: boolean;
  inputId?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue || (binary ? (options[1]?.id ?? '') : ''));
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const choose = (next: string) => {
    setValue(next);
    onChange?.(next);
  };
  if (binary) {
    return (
      <div className="flex min-h-10 items-center gap-3">
        <input type="hidden" name={name} value={value} />
        <input
          id={inputId}
          type="checkbox"
          aria-label={label}
          checked={value === options[0].id}
          onChange={(event) => choose(event.target.checked ? options[0].id : options[1].id)}
          className="h-4 w-4 shrink-0 cursor-pointer accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        />
        <span className="text-sm poppins-regular text-[#344256]">
          ติ๊ก: {options[0].label} / ไม่ติ๊ก: {options[1].label}
        </span>
      </div>
    );
  }
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <SearchCombobox
        local
        field={{ key: `${name}-search`, label, required }}
        value={value}
        onChange={choose}
        invalid={false}
        options={options
          .filter((option) =>
            option.label.toLocaleLowerCase('th').includes(search.trim().toLocaleLowerCase('th')),
          )
          .map((option) => ({ id: option.id, code: option.label, name: '' }))}
        search={search}
        offset={offset}
        loading={loading}
        error={error}
        more={false}
        setSearch={setSearch}
        setOffset={setOffset}
        setLoading={setLoading}
        setError={setError}
      />
    </>
  );
}
