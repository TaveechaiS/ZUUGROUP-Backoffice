import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function SuccessIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 90 90" fill="none" aria-hidden="true" {...props}>
      <circle cx="45" cy="45" r="45" fill="#1DD882" />
      <path
        d="m25 45 14 14 27-27"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyStateIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 16.2a4 4 0 0 1 5.6 0M9 10h.01M15 10h.01" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 5 5 15M5 5l10 10" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.4 4.4" />
    </svg>
  );
}

export function LoadingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="30" height="30" rx="9" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M17 19h14M17 24h10M17 29h7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="31" cy="29" r="3" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14 1V5M6 1V5M1 9H19M3 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3Z" />
    </svg>
  );
}
