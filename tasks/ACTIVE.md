# งานที่กำลังทำ

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-037 | AI | IN_PROGRESS | Auth/RBAC และจัดการผู้ใช้จริง; ป้องกัน Admin ตัดสิทธิ์บัญชีตนเองและแก้ Login ของผู้ใช้ที่ลบ | คืนบัญชี `admin` หลักและบันทึก Audit แล้ว; self-guard ผ่าน API 409 ทั้งลบ/ระงับ/ลด Role ด้วยบัญชีชั่วคราวที่ล้างแล้ว; รอ UAT หน้าเว็บและ console |
| TASK-038 | AI | READY_FOR_USER_TEST | แยกฟอร์มเพิ่มรายการของหน้า Mock ที่ใช้ `ModuleListPage` ทั้ง 20 หน้าเป็น URL `<หน้ารายการ>/create`; คงการทำงานตัวอย่างในแท็บ | route ครบ 20/20; lint/type-check/build/diff-check และตรวจ storage ผ่าน; รอผู้ใช้ตรวจหน้าและการนำทาง |
| TASK-039 | AI | READY_FOR_USER_TEST | ปิดสิทธิ์เรียก `public.rls_auto_enable()` จากผู้ใช้ API ทั่วไปตาม Security Advisor โดยคง event trigger | Deploy migration แล้ว; `anon`/`authenticated` EXECUTE=false, trigger `ensure_rls` ยังเปิด, คำเตือนเดิมหาย; รอตรวจพฤติกรรม trigger ในสภาพแวดล้อมทดสอบ |
