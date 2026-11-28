'use client';

import { useId, useRef, useState } from 'react';
import SearchCombobox from '@/components/ui/search-combobox';
import { Get } from '@/service/http';
import type { CustomerOption } from '@/types/api/customer-options';
import { inputClass } from '@/components/ui/form-classes';


// Picking a group asks the API for its next free number; the user may still edit it.
// The server re-checks duplicates when the customer is saved.
export default function CustomerCodePreview({
  groups,
  initialGroup = '',
  initialSequence = '',
}: {
  groups: CustomerOption[];
  initialGroup?: string;
  initialSequence?: string;
}) {
  const id = useId();
  const [group, setGroup] = useState(initialGroup);
  const [sequence, setSequence] = useState(initialSequence);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sequenceError, setSequenceError] = useState('');
  const latest = useRef('');
  const code = groups.find((item) => item.id === group)?.code ?? '';
  const options = groups
    .filter((option) =>
      `${option.code} ${option.name}`
        .toLocaleLowerCase('th')
        .includes(search.trim().toLocaleLowerCase('th')),
    )
    .map((option) => ({ id: option.id, code: option.code ?? '', name: option.name }));
  const fullCode = code && /[1-9]/.test(sequence) ? `${code}-${sequence.padStart(4, '0')}` : '';

  function chooseGroup(value: string) {
    setGroup(value);
    setSequenceError('');
    latest.current = value;
    if (!value) return;
    // Going back to the customer's own group restores its current number while editing.
    if (value === initialGroup && initialSequence) {
      setSequence(initialSequence);
      return;
    }
    Get<{ sequence: string }>('/api/customers/next-sequence?codeGroupId=' + value)
      .then((result) => {
        if (latest.current === value) setSequence(result.sequence);
      })
      .catch((e: Error) => {
        if (latest.current === value) setSequenceError(e.message);
      });
  }

  return (
    <fieldset className="mt-4 min-w-0">
      <legend className="text-sm poppins-medium text-[#344256]">
        รหัสลูกค้า
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </legend>
      <input type="hidden" name="codeGroupId" value={group} />
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 poppins-regular">
          <SearchCombobox
            local
            field={{ key: 'customer-code-group', label: 'กลุ่มรหัสลูกค้า', required: true }}
            value={group}
            onChange={chooseGroup}
            invalid={false}
            options={options}
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
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-sequence`} className="sr-only">
            เลขรัน
          </label>
          <input
            id={`${id}-sequence`}
            name="sequence"
            type="text"
            inputMode="numeric"
            aria-required="true"
            maxLength={6}
            placeholder="เลขรัน เช่น 0001"
            value={sequence}
            onChange={(event) => {
              if (/^\d*$/.test(event.target.value)) setSequence(event.target.value);
            }}
            onBlur={() => {
              if (/[1-9]/.test(sequence)) setSequence(sequence.padStart(4, '0'));
            }}
            className={inputClass}
          />
        </div>
      </div>
      {sequenceError && (
        <p role="alert" className="mt-2 text-xs poppins-regular text-red-600">
          {sequenceError}
        </p>
      )}
      <label htmlFor={`${id}-full-code`} className="sr-only">
        รหัสลูกค้าเต็ม
      </label>
      <input
        id={`${id}-full-code`}
        type="text"
        readOnly
        value={fullCode}
        placeholder="รหัสลูกค้าเต็ม"
        className={`${inputClass} mt-4 bg-blue-50`}
      />
    </fieldset>
  );
}
