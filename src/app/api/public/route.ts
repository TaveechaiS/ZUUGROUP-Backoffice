import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Zuugroup', authentication: 'none',
    description: 'GET ข้อมูลสินค้าสาธารณะจากฐานข้อมูลจริง สำหรับดูโครงสร้างและเชื่อมต่อ API',
    endpoints: [
      { method: 'GET', path: '/api/public/products', description: 'รายการสินค้า Active ที่ยังไม่ลบ', params: ['search', 'offset', 'limit', 'categoryId', 'dosageFormId'] },
      { method: 'GET', path: '/api/public/products/{id}', description: 'รายละเอียดสินค้าจาก UUID' },
      { method: 'GET', path: '/api/public/products/masters', description: 'ข้อมูลแม่สินค้า รวมไม่เกิน 50 รายการต่อกลุ่ม' },
      { method: 'GET', path: '/api/public/masters/{type}', description: 'รายการข้อมูลแม่', types: ['categories', 'dosage-forms', 'drugs'], params: ['search', 'offset', 'limit'] },
      { method: 'GET', path: '/api/public/masters/{type}/{id}', description: 'รายละเอียดข้อมูลแม่จาก UUID', types: ['categories', 'dosage-forms', 'drugs'] },
    ],
    fields: {
      product: { id: 'UUID สินค้า', code: 'รหัสสินค้า', name: 'ชื่อสินค้า', categoryId: 'UUID หมวด', category: 'ชื่อหมวด', dosageFormId: 'UUID รูปแบบยา', dosageForm: 'ชื่อรูปแบบยา', drugId: 'UUID ตัวยา', drug: 'ชื่อตัวยา', unit: 'หน่วยประจำ' },
      master: { id: 'UUID', code: 'รหัส (หมวดและรูปแบบยา)', name: 'ชื่อ' },
    },
    pagination: { offset: 'เริ่มต้น 0 สูงสุด 100000', limit: 'เริ่มต้น 10 สูงสุด 50', total: 'จำนวนรายการที่ตรงตัวกรอง', hasMore: 'มีหน้าถัดไปหรือไม่' },
    errors: { 400: 'Params หรือ UUID ไม่ถูกต้อง', 404: 'ไม่พบข้อมูล', 503: 'ฐานข้อมูลไม่พร้อม' },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
