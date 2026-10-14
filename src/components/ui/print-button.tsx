'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-[#d9e3ee] bg-white px-4 py-2 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50 print:hidden"
    >
      พิมพ์ / PDF
    </button>
  );
}
