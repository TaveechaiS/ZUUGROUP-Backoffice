'use client';

import { useId, useState } from 'react';
import CustomerChoicePreview from './customer-choice-preview';
import CustomerAddressPicker, { type AddressValue } from './customer-address-picker';

const addressKeys = {
  province: 'billingProvince',
  district: 'billingDistrict',
  subdistrict: 'billingSubdistrict',
  postcode: 'billingPostcode',
} as const;

type BillingField = { key: string; label: string; placeholder: string; multiline?: boolean };
const inputClass =
  'mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#8994a5] focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 aria-invalid:border-red-600';
const binaryChoices: Record<string, [string, string]> = {
  vatStatus: ['จดทะเบียน', 'ไม่จดทะเบียน'],
  branchType: ['สำนักงานใหญ่', 'สาขา'],
};

export default function CustomerBillingPreview({
  fields,
  initial = {},
}: {
  fields: BillingField[];
  initial?: Record<string, string>;
}) {
  const id = useId();
  const [taxId, setTaxId] = useState(initial.taxId ?? '');
  const [touched, setTouched] = useState(false);
  const [address, setAddress] = useState<AddressValue>({
    province: initial.billingProvince ?? '',
    district: initial.billingDistrict ?? '',
    subdistrict: initial.billingSubdistrict ?? '',
    postcode: initial.billingPostcode ?? '',
  });
  const label = (key: string) => fields.find((field) => field.key === key)?.label ?? key;
  const taxError = !touched
    ? ''
    : !taxId
      ? 'กรุณากรอกเลขประจำตัวผู้เสียภาษี'
      : !/^[0-9]{13}$/.test(taxId)
        ? 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลขครบ 13 หลัก'
        : '';

  return (
    <fieldset className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
      {fields.map((field, index) => {
        // The four billing address parts render once, as one cascading picker.
        if (field.key === 'billingSubdistrict')
          return (
            <div key="billing-address" className="contents">
              {Object.entries(addressKeys).map(([part, key]) => (
                <input
                  key={key}
                  type="hidden"
                  name={key}
                  value={address[part as keyof AddressValue]}
                />
              ))}
              <CustomerAddressPicker
                idPrefix={`${id}-billing`}
                required
                value={address}
                onChange={setAddress}
                labels={{
                  province: label('billingProvince'),
                  district: label('billingDistrict'),
                  subdistrict: label('billingSubdistrict'),
                  postcode: label('billingPostcode'),
                }}
              />
            </div>
          );
        if ((Object.values(addressKeys) as string[]).includes(field.key)) return null;
        const isTaxId = field.key === 'taxId';
        const required = field.key !== 'branchNumber';
        const fieldId = `${id}-${index}`;
        const choices = binaryChoices[field.key];
        return (
          <div key={field.key} className={`min-w-0 ${field.multiline ? 'sm:col-span-2' : ''}`}>
            <label htmlFor={fieldId} className="block text-sm poppins-medium text-[#344256]">
              {field.label}
              {required && (
                <span aria-hidden="true" className="ml-1 text-red-600">
                  *
                </span>
              )}
            </label>
            {choices ? (
              <div className="mt-2 poppins-regular">
                <CustomerChoicePreview
                  binary
                  inputId={fieldId}
                  initialValue={initial[field.key]}
                  name={field.key}
                  label={field.label}
                  options={choices.map((choice) => ({ id: choice, label: choice }))}
                  required={required}
                />
              </div>
            ) : field.multiline ? (
              <textarea
                id={fieldId}
                name={field.key}
                defaultValue={initial[field.key]}
                aria-required={required}
                placeholder={field.placeholder}
                rows={3}
                className={`${inputClass} min-h-24 resize-y`}
              />
            ) : (
              <input
                id={fieldId}
                name={field.key}
                type="text"
                {...(isTaxId ? {} : { defaultValue: initial[field.key] })}
                aria-required={required}
                placeholder={field.placeholder}
                className={`${inputClass} h-11`}
                {...(isTaxId
                  ? {
                      inputMode: 'numeric' as const,
                      maxLength: 13,
                      value: taxId,
                      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                        setTaxId(event.target.value),
                      onBlur: () => setTouched(true),
                      'aria-invalid': Boolean(taxError),
                      'aria-describedby': taxError ? `${id}-tax-error` : undefined,
                    }
                  : {})}
              />
            )}
            {isTaxId && taxError && (
              <p
                id={`${id}-tax-error`}
                role="alert"
                className="mt-2 text-xs poppins-regular text-red-600"
              >
                {taxError}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
