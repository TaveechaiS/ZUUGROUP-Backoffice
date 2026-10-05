'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Attachment = { id: string; file: File; url: string };

export function acceptsProductAttachment(file: Pick<File, 'type' | 'name'>, imagesOnly: boolean) {
  return (
    file.type.startsWith('image/') ||
    (!imagesOnly && (file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name))))
  );
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toLocaleString('th-TH', { maximumFractionDigits: 1 })} KB`
    : `${(bytes / (1024 * 1024)).toLocaleString('th-TH', { maximumFractionDigits: 1 })} MB`;
}

export default function ProductAttachmentField({
  id,
  imagesOnly,
}: {
  id: string;
  imagesOnly: boolean;
}) {
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

  function removeAttachment(attachment: Attachment) {
    URL.revokeObjectURL(attachment.url);
    urls.current.delete(attachment.id);
    setAttachments((current) => current.filter((item) => item.id !== attachment.id));
  }

  return (
    <div className="mt-2">
      <input
        id={id}
        type="file"
        multiple
        accept={imagesOnly ? 'image/*' : 'image/*,.pdf,application/pdf'}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
        className="block w-full rounded-md border border-[#d9e3ee] bg-white p-2 text-sm poppins-regular text-[#344256] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          const accepted = files.filter((file) => acceptsProductAttachment(file, imagesOnly));
          const rejected = files.filter((file) => !acceptsProductAttachment(file, imagesOnly));
          const added: Attachment[] = [];
          try {
            for (const file of accepted) {
              const attachment = { id: crypto.randomUUID(), file, url: URL.createObjectURL(file) };
              added.push(attachment);
              urls.current.set(attachment.id, attachment.url);
            }
            setAttachments((current) => [...current, ...added]);
            setError(
              rejected.length
                ? `ไฟล์ที่ไม่รองรับ: ${rejected.map((file) => file.name).join(', ')}`
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
      <p aria-live="polite" className="mt-2 text-xs leading-5 poppins-regular text-[#65758b]">
        {attachments.length
          ? `แนบแล้ว ${attachments.length} ไฟล์ เลือกเพิ่มได้`
          : 'ยังไม่ได้แนบไฟล์'}
      </p>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 break-words text-xs leading-5 poppins-regular text-red-600"
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
                {fileSize(attachment.file.size)}
              </p>
              <button
                type="button"
                onClick={() => removeAttachment(attachment)}
                aria-label={`นำไฟล์ ${attachment.file.name} ออก`}
                className="mt-3 rounded border border-[#d9e3ee] px-3 py-1.5 text-xs poppins-medium text-[#344256] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
