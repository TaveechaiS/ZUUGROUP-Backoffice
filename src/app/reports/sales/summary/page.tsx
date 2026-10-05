import Link from 'next/link';

export default function Page() {
  return (
    <section className="px-4 py-6 md:px-6">
      <h2 className="text-lg poppins-semibold text-gray-900">สรุปยอดขาย</h2>
      <p className="mt-3 text-sm poppins-regular text-gray-600">
        รอยืนยันจุดรับรู้ยอดขาย วันที่อ้างอิง และวิธีคิดยอดก่อนแสดงรายงาน
      </p>
      <Link
        href="/reports/sales/legacy"
        className="mt-5 inline-block rounded-md border border-blue-100 px-4 py-2 text-sm poppins-medium text-blue-700 hover:bg-blue-50"
      >
        ดูรายการคำสั่งซื้อเดิม
      </Link>
    </section>
  );
}
