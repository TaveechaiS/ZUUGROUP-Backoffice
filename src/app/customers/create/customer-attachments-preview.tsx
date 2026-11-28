'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { CUSTOMER_FILE_LIMIT, CUSTOMER_IMAGE_TYPES } from '@/config/customers';
import type { CustomerOption } from '@/types/api/customer-options';

export type SelectedFile = { id: string; documentTypeId: string; file: File };
type Attachment = SelectedFile & { url: string };

// One upload slot per active document type from ข้อมูลพื้นฐานลูกค้า.
export default function CustomerAttachmentsPreview({
  documentTypes,
  onChange,
}: {
  documentTypes: CustomerOption[];
  onChange: (files: SelectedFile[]) => void;
}) {
  const [byType, setByType] = useState<Record<string, SelectedFile[]>>({});
  useEffect(() => onChange(Object.values(byType).flat()), [byType, onChange]);
  if (!documentTypes.length)
    return (
      <p className="mt-4 text-sm poppins-regular text-[#65758b]">
        ยังไม่มีประเภทเอกสารแนบที่เปิดใช้ — เพิ่มได้ที่ ตั้งค่าระบบ → ข้อมูลพื้นฐานลูกค้า
      </p>
    );
  return (
    <div className="mt-4 space-y-6">
      {documentTypes.map((type) => (
        <AttachmentField
          key={type.id}
          documentTypeId={type.id}
          label={`ไฟล์${type.name}`}
          onChange={(files) => setByType((current) => ({ ...current, [type.id]: files }))}
        />
      ))}
    </div>
  );
}

function AttachmentField({
  documentTypeId,
  label,
  onChange,
}: {
  documentTypeId: string;
  label: string;
  onChange: (files: SelectedFile[]) => void;
}) {
  const id = useId();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState('');
  const urls = useRef(new Map<string, string>());

  useEffect(() => {
    const ownedUrls = urls.current;
    return () => {
      for (const url of ownedUrls.values()) URL.revokeObjectURL(url);
      ownedUrls.clear();
    };
  }, []);
  function update(next: Attachment[]) {
    setAttachments(next);
    onChange(next.map(({ id: fileId, file }) => ({ id: fileId, documentTypeId, file })));
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm poppins-medium text-[#344256]">
        {label}
      </label>
      <input
        id={id}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,.pdf,application/pdf"
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
        className="mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white p-2 text-sm poppins-regular text-[#344256] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          const accepted = files.filter(
            (file) =>
              (CUSTOMER_IMAGE_TYPES.includes(file.type) ||
                file.type === 'application/pdf' ||
                (!file.type && /\.pdf$/i.test(file.name))) &&
              file.size > 0 &&
              file.size <= CUSTOMER_FILE_LIMIT,
          );
          const rejected = files.filter((file) => !accepted.includes(file));
          const added: Attachment[] = [];
          try {
            for (const file of accepted) {
              const attachment = {
                id: crypto.randomUUID(),
                documentTypeId,
                file,
                url: URL.createObjectURL(file),
              };
              added.push(attachment);
              urls.current.set(attachment.id, attachment.url);
            }
            update([...attachments, ...added]);
            setError(
              rejected.length
                ? `ไฟล์ที่ไม่รองรับ/เกิน 10 MB/ว่าง: ${rejected.map((file) => file.name).join(', ')}`
                : '',
            );
          } catch {
            for (const attachment of added) {
              URL.revokeObjectURL(attachment.url);
              urls.current.delete(attachment.id);
            }
            setError('แสดงไฟล์ที่เลือกไม่ได้ กรุณาลองเลือกอีกครั้ง');
          }
        }}
      />
      <p
        id={`${id}-help`}
        aria-live="polite"
        className="mt-2 text-xs leading-5 poppins-regular text-[#65758b]"
      >
        {attachments.length
          ? `แนบแล้ว ${attachments.length} ไฟล์ เลือกเพิ่มได้`
          : 'ยังไม่ได้แนบไฟล์'}{' '}
        — ไม่เกิน 10 MB ต่อไฟล์
      </p>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 break-words text-xs poppins-regular text-red-600"
        >
          {error}
        </p>
      )}
      {attachments.length > 0 && (
        <ul className="mt-3 flex list-none flex-wrap gap-3 p-0">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="min-w-0 w-full rounded-md border border-[#d9e3ee] p-3 sm:w-52"
            >
              {attachment.file.type.startsWith('image/') ? (
                <Image
                  src={attachment.url}
                  alt={attachment.file.name}
                  width={184}
                  height={128}
                  unoptimized
                  className="mb-3 h-32 w-full rounded bg-blue-50 object-contain"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="mb-3 flex h-32 items-center justify-center rounded bg-blue-50 text-sm poppins-semibold text-blue-700"
                >
                  PDF
                </div>
              )}
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-words text-sm poppins-medium text-[#1a58a7] underline-offset-2 hover:underline"
              >
                {attachment.file.name}
              </a>
              <p className="mt-1 text-xs poppins-regular text-[#65758b]">
                {(
                  attachment.file.size / (attachment.file.size < 1024 * 1024 ? 1024 : 1024 * 1024)
                ).toLocaleString('th-TH', { maximumFractionDigits: 1 })}{' '}
                {attachment.file.size < 1024 * 1024 ? 'KB' : 'MB'}
              </p>
              <button
                type="button"
                aria-label={`นำไฟล์ ${attachment.file.name} ออก`}
                className="mt-3 rounded border border-[#d9e3ee] px-3 py-1.5 text-xs poppins-medium text-[#344256] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                onClick={() => {
                  URL.revokeObjectURL(attachment.url);
                  urls.current.delete(attachment.id);
                  update(attachments.filter((item) => item.id !== attachment.id));
                }}
              >
                นำออก
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
