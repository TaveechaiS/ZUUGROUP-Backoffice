import Image from 'next/image';

interface LoadingProps {
  isVisible: boolean;
  padding?: string;
  label?: string;
  variant?: 'screen' | 'content';
}

export default function LoadingComponent({
  isVisible,
  padding = 'p-6',
  label = 'กำลังโหลดข้อมูล...',
  variant = 'screen',
}: LoadingProps) {
  if (!isVisible) return null;
  const inContent = variant === 'content';
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={
        inContent
          ? 'absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-[2px]'
          : 'fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-white/90 backdrop-blur-[4px]'
      }
    >
      <div className={`flex flex-col items-center gap-5 text-center ${padding}`}>
        <div
          className={`relative grid place-items-center overflow-hidden ${inContent ? 'h-16 w-16' : 'h-28 w-28'}`}
          aria-hidden="true"
        >
          <span className="absolute inset-0 rounded-full border border-blue-100" />
          <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-blue-300 border-t-blue-700 motion-safe:animate-[spin_1.8s_linear_infinite]" />
          <span className="absolute inset-2 rounded-full border border-blue-100" />
          <Image
            src="/Logoloading.png"
            alt=""
            width={494}
            height={320}
            loading="eager"
            unoptimized
            draggable={false}
            className={`pointer-events-none absolute left-1/2 top-1/2 h-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none motion-safe:animate-[pulse_2.4s_ease-in-out_infinite] ${inContent ? 'w-20' : 'w-36'}`}
          />
        </div>
        <p className="m-0 text-sm poppins-semibold tracking-wide text-gray-900">{label}</p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-300 motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-[pulse_1.8s_ease-in-out_300ms_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-300 motion-safe:animate-[pulse_1.8s_ease-in-out_600ms_infinite]" />
        </div>
      </div>
    </div>
  );
}
