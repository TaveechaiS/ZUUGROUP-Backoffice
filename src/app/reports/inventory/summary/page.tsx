import Link from 'next/link';

export default function Page() {
  return (
    <section className="px-4 py-6 md:px-6">
      <h2 className="text-lg poppins-semibold text-gray-900">สรุปคงเหลือ</h2>
      <p className="mt-3 text-sm poppins-regular text-gray-600">
        รอกำหนดวันอ้างอิงและเชื่อมยอดคงเหลือ ยอดจอง และพร้อมขายจากข้อมูลคลังจริง
      </p>
      <Link
        href="/reports/inventory/legacy"
        className="mt-5 inline-block rounded-md border border-blue-100 px-4 py-2 text-sm poppins-medium text-blue-700 hover:bg-blue-50"
      >
        ดูข้อมูลหลักสินค้าเดิม
      </Link>
    </section>
  );
}
