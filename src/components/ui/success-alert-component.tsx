'use client';

import { useEffect, useId, useRef } from 'react';
import { CloseIcon, SuccessIcon } from '@/components/icons/status-icons';

interface SuccessAlertComponentProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  isOpen?: boolean;
  showCloseButton?: boolean;
  textButton?: string;
  autoCloseDelay?: number;
}

export default function SuccessAlertComponent({
  title = 'ดำเนินการสำเร็จ',
  description,
  onClose,
  isOpen = false,
  showCloseButton = true,
  textButton = 'ตกลง',
  autoCloseDelay = 0,
}: SuccessAlertComponentProps) {
  const titleId = useId();
  const descriptionId = useId();
  const actionRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    actionRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current?.();
      if (event.key === 'Tab') {
        const first = showCloseButton ? closeButtonRef.current : actionRef.current;
        const last = actionRef.current;
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    const timer =
      autoCloseDelay > 0
        ? window.setTimeout(() => closeRef.current?.(), autoCloseDelay)
        : undefined;
    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (timer !== undefined) window.clearTimeout(timer);
      previousFocus?.focus();
    };
  }, [isOpen, autoCloseDelay, showCloseButton]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 motion-safe:transition-opacity motion-safe:duration-300 starting:opacity-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-md rounded-xl bg-white px-7 py-8 text-center shadow-xl motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-out starting:translate-y-3 starting:scale-95 starting:opacity-0"
      >
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="absolute right-4 top-4 rounded p-1 text-[#8994a5] transition hover:text-[#344256] focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
        <SuccessIcon className="mx-auto mb-5 h-20 w-20 motion-safe:animate-[pulse_800ms_ease-out_1]" />
        <h2 id={titleId} className="m-0 text-xl poppins-semibold text-[#26364b]">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mb-0 mt-2 text-sm leading-6 text-[#718096]">
            {description}
          </p>
        )}
        <button
          ref={actionRef}
          type="button"
          onClick={onClose}
          className="mt-6 min-w-32 rounded-lg bg-[#1a58a7] px-6 py-2.5 text-sm poppins-semibold text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
        >
          {textButton}
        </button>
      </div>
    </div>
  );
}
