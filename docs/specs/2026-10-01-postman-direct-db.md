# ข้อกำหนด — ตรวจ DB โดยตรงใน Postman

**วันที่:** 2026-10-01 (Asia/Bangkok)
**สถานะ:** เตรียมไฟล์ SQL; รอผู้ใช้เชื่อม Postman Desktop
**อ้างอิง:** คำขอเจ้าของโครงการให้ต่อ Supabase PostgreSQL โดยตรงจาก Postman

- ใช้ Postman **Data request → PostgreSQL** แยกจาก HTTP Collection `Zuugroup`
- เตรียมเฉพาะ `SELECT` สำหรับสินค้า รายการผู้ใช้ ประวัติเหตุการณ์ และหมวดสินค้า; จำกัด 50 แถวต่อคำขอและไม่ดึง Password, Token หรือ JSON before/after ของ Audit
- ใช้ connection string จาก Supabase Dashboard → Connect → Session pooler ที่เครื่องผู้ใช้; ไม่บันทึกข้อมูลเชื่อมต่อหรือรหัสผ่านลง repository/แชต/Collection
- เปิด Read-only ใน Settings ของ Postman Data request ก่อนรัน; การดู DB โดยตรงใช้สิทธิ์ของบัญชีฐานข้อมูลและไม่ใช่การตรวจ RBAC/API ของเว็บ
- ไม่สร้างหรือเปลี่ยน schema, policy, grant หรือข้อมูลใน DB
