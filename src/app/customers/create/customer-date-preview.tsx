'use client';

import { useState } from 'react';

export default function CustomerDatePreview({
  label,
  name,
  initialValue = '',
}: {
  label: string;
  name: string;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const display = value
    ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Bangkok',
      }).format(new Date(`${value}T12:00:00+07:00`))
    : 'วว / ดด / พ.ศ.';

  return (
    <div className="relative">
      <input
        type="date"
        name={name}
        aria-label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="block h-11 w-full min-w-0 rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-transparent outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center text-sm poppins-regular ${value ? 'text-[#344256]' : 'text-[#8994a5]'}`}
      >
        {display}
      </span>
    </div>
  );
}
