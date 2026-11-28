'use client';

import { useEffect, useState } from 'react';
import SearchCombobox from '@/components/ui/search-combobox';
import { inputClass } from '@/components/ui/form-classes';

// TASK-270: province → district → sub-district from the bundled Thai address file; picking a
// sub-district fills the postcode. Values that are not in the file (typed before) stay selectable.
type SubDistrict = [name: string, zip: string];
type District = [name: string, subDistricts: SubDistrict[]];
type Province = [name: string, districts: District[]];
export type AddressValue = {
  province: string;
  district: string;
  subdistrict: string;
  postcode: string;
};

let dataset: Promise<Province[]> | null = null;
function loadAddresses() {
  dataset ??= fetch('/data/thai-address.json')
    .then((response) => {
      if (!response.ok) throw new Error('โหลดข้อมูลที่อยู่ไม่สำเร็จ');
      return response.json() as Promise<{ provinces: Province[] }>;
    })
    .then((data) => data.provinces)
    .catch((error) => {
      dataset = null;
      throw error;
    });
  return dataset;
}


export default function CustomerAddressPicker({
  value,
  onChange,
  labels,
  required = false,
  idPrefix,
}: {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  labels: Record<keyof AddressValue, string>;
  required?: boolean;
  idPrefix: string;
}) {
  const [provinces, setProvinces] = useState<Province[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadAddresses()
      .then((data) => {
        if (active) setProvinces(data);
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const districts = provinces?.find(([name]) => name === value.province)?.[1] ?? [];
  const subDistricts = districts.find(([name]) => name === value.district)?.[1] ?? [];
  const names = (rows: [string, unknown][], current: string) => {
    const list = rows.map(([name]) => name);
    return current && !list.includes(current) ? [current, ...list] : list;
  };
  return (
    <>
      <Choice
        id={`${idPrefix}-province`}
        label={labels.province}
        required={required}
        value={value.province}
        options={names(provinces ?? [], value.province)}
        loading={!provinces && !error}
        error={error}
        onChange={(province) => onChange({ province, district: '', subdistrict: '', postcode: '' })}
      />
      <Choice
        id={`${idPrefix}-district`}
        label={labels.district}
        required={required}
        value={value.district}
        options={names(districts, value.district)}
        loading={!provinces && !error}
        error={error}
        onChange={(district) => onChange({ ...value, district, subdistrict: '', postcode: '' })}
      />
      <Choice
        id={`${idPrefix}-subdistrict`}
        label={labels.subdistrict}
        required={required}
        value={value.subdistrict}
        options={names(subDistricts, value.subdistrict)}
        loading={!provinces && !error}
        error={error}
        onChange={(subdistrict) =>
          onChange({
            ...value,
            subdistrict,
            postcode: subDistricts.find(([name]) => name === subdistrict)?.[1] ?? value.postcode,
          })
        }
      />
      <label htmlFor={`${idPrefix}-postcode`} className="min-w-0">
        <FieldLabel text={labels.postcode} required={required} />
        <input
          id={`${idPrefix}-postcode`}
          value={value.postcode}
          inputMode="numeric"
          maxLength={10}
          placeholder="เติมอัตโนมัติเมื่อเลือกตำบล / แขวง"
          onChange={(event) => onChange({ ...value, postcode: event.target.value })}
          aria-required={required}
          className={`${inputClass} mt-2`}
        />
      </label>
    </>
  );
}

function FieldLabel({ text, required }: { text: string; required: boolean }) {
  return (
    <span className="block text-sm poppins-medium text-[#344256]">
      {text}
      {required && (
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      )}
    </span>
  );
}

function Choice({
  id,
  label,
  required,
  value,
  options,
  loading,
  error,
  onChange,
}: {
  id: string;
  label: string;
  required: boolean;
  value: string;
  options: string[];
  loading: boolean;
  error: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const query = search.trim().toLocaleLowerCase('th');
  return (
    <div className="min-w-0">
      <FieldLabel text={label} required={required} />
      <div className="mt-2 poppins-regular">
        <SearchCombobox
          local
          field={{ key: id, label, required }}
          value={value}
          onChange={onChange}
          invalid={false}
          options={options
            .filter((option) => option.toLocaleLowerCase('th').includes(query))
            .map((option) => ({ id: option, code: option, name: '' }))}
          search={search}
          offset={offset}
          loading={loading}
          error={error}
          more={false}
          setSearch={setSearch}
          setOffset={setOffset}
          setLoading={() => {}}
          setError={() => {}}
        />
      </div>
    </div>
  );
}
