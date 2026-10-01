# งานที่กำลังทำ

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-037 | AI | IN_PROGRESS | Auth/RBAC และจัดการผู้ใช้จริง; ตรวจสิทธิ์ Role/สถานะและ guard Admin | `admin` เข้าใช้ได้; self-guard ผ่าน API 409, SALES ถูกปฏิเสธจากหน้าจัดการ/API และ session เดิมของบัญชีระงับ/ลบถูกปฏิเสธ; รอ UAT หน้าเว็บและ recovery |
| TASK-038 | AI | READY_FOR_USER_TEST | แยกฟอร์มเพิ่มรายการของหน้า Mock ที่ใช้ `ModuleListPage` ทั้ง 20 หน้าเป็น URL `<หน้ารายการ>/create`; คงการทำงานตัวอย่างในแท็บ | route ครบ 20/20; lint/type-check/build/diff-check และตรวจ storage ผ่าน; รอผู้ใช้ตรวจหน้าและการนำทาง |
| TASK-039 | AI | READY_FOR_USER_TEST | ปิดสิทธิ์เรียก `public.rls_auto_enable()` จากผู้ใช้ API ทั่วไปตาม Security Advisor โดยคง event trigger | Deploy migration แล้ว; `anon`/`authenticated` EXECUTE=false, trigger `ensure_rls` ยังเปิด, คำเตือนเดิมหาย; รอตรวจพฤติกรรม trigger ในสภาพแวดล้อมทดสอบ |
| TASK-040 | AI | READY_FOR_USER_TEST | ภาพรวมเส้นทาง Phase 3–9 และ Detail Mock ลูกค้า/สินค้า; ไฟล์ตามแผนย่อย TASK-040 | route และลิงก์รายการครบ, lint/type-check/build/diff-check ผ่าน; รอเจ้าของโครงการตรวจดีไซน์และการคลิก |
