import { LoadingIcon } from '@/components/icons/status-icons';

interface LoadingProps {
  isVisible: boolean;
  padding?: string;
  label?: string;
}

export default function LoadingComponent({
  isVisible,
  padding = 'p-6',
  label = 'กำลังโหลดข้อมูล...',
}: LoadingProps) {
  if (!isVisible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-white/90 backdrop-blur-[4px]"
    >
      <div className={`flex flex-col items-center gap-5 text-center ${padding}`}>
        <div className="relative grid h-28 w-28 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-[var(--blue-100)]" />
          <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-[var(--blue-300)] border-t-[var(--blue-700)] motion-safe:animate-[spin_1.8s_linear_infinite]" />
          <span className="absolute inset-2 rounded-full border border-[var(--blue-100)]" />
          <LoadingIcon className="relative h-14 w-14 text-[var(--blue-700)] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />
        </div>
        <p className="m-0 text-sm font-semibold tracking-wide text-[var(--ink-950)]">{label}</p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue-300)] motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue-500)] motion-safe:animate-[pulse_1.8s_ease-in-out_300ms_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue-300)] motion-safe:animate-[pulse_1.8s_ease-in-out_600ms_infinite]" />
        </div>
      </div>
    </div>
  );
}
