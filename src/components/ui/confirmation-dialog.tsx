'use client';

import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from '@/components/icons/status-icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  busy?: boolean;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  busyLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  busy = false,
  confirmLabel = 'ยืนยันลบ',
  variant = 'danger',
  busyLabel = 'กำลังลบ...',
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || busy) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onCancel();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink-950)] shadow-xl backdrop:bg-black/50 motion-safe:transition-[opacity,transform] motion-safe:duration-200 starting:scale-95 starting:opacity-0"
    >
      <div className="relative px-7 py-7">
        <button
          type="button"
          aria-label="ยกเลิก"
          disabled={busy}
          onClick={onCancel}
          className="absolute right-4 top-4 rounded p-1 text-[var(--ink-500)] hover:text-[var(--ink-950)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] disabled:opacity-40"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <p
          className={`mb-3 text-xs font-semibold ${variant === 'danger' ? 'text-red-700' : 'text-[var(--blue-700)]'}`}
        >
          {variant === 'danger' ? 'ยืนยันการลบ' : 'ยืนยันการแก้ไข'}
        </p>
        <h2 id={titleId} className="m-0 pr-5 text-xl font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-6 text-[var(--ink-700)]">
          {description}
        </p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-[var(--line)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${variant === 'danger' ? 'bg-red-700 hover:bg-red-800 focus-visible:outline-red-700' : 'bg-[var(--blue-700)] hover:bg-[var(--blue-800)] focus-visible:outline-[var(--blue-700)]'}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
