# ข้อกำหนด — Postman เรียก Supabase Data API โดยตรง

**วันที่:** 2026-10-01 (Asia/Bangkok)
**สถานะ:** เจ้าของโครงการให้เชื่อม Postman ไป Supabase โดยตรง และขอไม่ทดสอบในรอบนี้

- เพิ่มคำขอ GET ใน Collection `Zuugroup` เพื่ออ่านตารางข้อมูลหลักสินค้า (`product_categories`, `dosage_forms`, `drugs`, `warehouses`, `products`) จาก `{{supabaseUrl}}/rest/v1` โดยตรง เลือกเฉพาะคอลัมน์ที่จำเป็น จำกัด 50 แถว และไม่เพิ่มคำขอแก้ไขข้อมูล
- ใช้ `apikey: {{supabasePublishableKey}}` จาก project ปัจจุบัน และ `Authorization: Bearer {{activeToken}}` ที่ได้จาก POST login; ไม่ใช้ `SUPABASE_SECRET_KEY` หรือ `service_role` ใน Postman เพราะข้าม RLS
- ห้ามนำข้อมูลผู้ใช้, บัญชี Auth, Role/Permission หรือ Audit ที่ละเอียดอ่อนไปอ่านตรงจาก Postman Data API ในรอบนี้
- การใส่ publishable key และ token ไม่เท่ากับให้สิทธิ์อ่าน DB: `GRANT` และ RLS ของ DB เป็นตัวกำหนดการเข้าถึง ตารางสินค้าปัจจุบันเปิด RLS และถอนสิทธิ์ของ `authenticated` ไว้ จึงยังไม่อ้างว่าคำขอ Data API อ่านข้อมูลได้
- งานเปิดสิทธิ์ Data API ใน DB ต้องออกแบบและอนุมัติแยก โดยต้องตรวจสถานะผู้ใช้และ Role จาก DB ตาม Specs หลักก่อน จึงจะเปลี่ยน GRANT/RLS; การเชื่อมครั้งนี้ไม่แก้ schema, policy หรือข้อมูลใน DB
- ผู้ใช้ขอให้ไม่ส่งคำขอทดสอบในรอบนี้ ผลใช้งานจริงต้องตรวจโดยผู้ใช้ภายหลัง
