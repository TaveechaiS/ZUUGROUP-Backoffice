import Link from 'next/link';
export default function SettingsHome() {
  return (
    <section className="p-4 md:p-6">
      <h2 className="text-lg poppins-semibold text-[#344256]">ตั้งค่าระบบ</h2>
      <Link
        href="/settings/product-options"
        className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-[#d9e3ee] p-5 text-base poppins-medium text-[#1a58a7] hover:bg-blue-50"
      >
        ข้อมูลพื้นฐานสินค้า<span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
