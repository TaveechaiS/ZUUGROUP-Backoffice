export const inputClass =
  'block h-11 w-full [&:is(textarea)]:h-auto rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#8994a5] focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f7f9fc] disabled:text-[#8994a5] aria-invalid:border-red-600';
export const filterClass =
  'h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm text-[#26364b] outline-none focus:border-[#1a58a7]';
export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium text-[#344256] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';
const filterBox = 'grid grid-cols-1 gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3';
const filterGrids = [
  '',
  'sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
  'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]',
  'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]',
  'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]',
];
export const filterGridClass = (others: number) =>
  `${filterBox} ${filterGrids[Math.min(Math.max(others, 0), 4)]}`.trim();
