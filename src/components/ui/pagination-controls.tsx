'use client';
export default function PaginationControls({
  page,
  pages,
  total,
  count,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  count: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e9f0] px-6 py-5 text-sm text-[#758195]">
      <span>
        แสดง {count} จาก {total} รายการ
      </span>
      <nav className="flex items-center gap-1" aria-label="เปลี่ยนหน้ารายการ">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]"
        >
          ‹ ก่อนหน้า
        </button>
        {Array.from(
          { length: Math.min(5, pages) },
          (_, index) => Math.max(1, Math.min(page - 2, pages - 4)) + index,
        ).map((number) => (
          <button
            key={number}
            type="button"
            aria-current={page === number ? 'page' : undefined}
            onClick={() => onChange(number)}
            className={`h-9 min-w-9 rounded border px-1 text-sm ${page === number ? 'border-[#1a58a7] bg-[#1a58a7] font-semibold text-white' : 'border-[#e3e9f0] text-[#758195] hover:bg-[#f7f9fc]'}`}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]"
        >
          ถัดไป ›
        </button>
      </nav>
    </div>
  );
}
