# แผนย่อย — TASK-025 Responsive ของ App Shell

**วันที่:** 2026-09-25 (Asia/Bangkok)
**อ้างอิง:** Project Specs รุ่น 0.3, Project Plan รุ่น 0.2, TASK-007 ถึง TASK-023 และแนวทาง Tailwind ใน `docs/specs/2026-09-24-ui-inline-utilities.md`

## ขอบเขต

ตรวจและปรับเฉพาะ App Shell ที่มีอยู่ ได้แก่ Sidebar หลัก, Topbar, customer secondary navigation, พื้นที่เนื้อหา, Dashboard placeholder และ module placeholder ให้ใช้งานบนมือถือ/แท็บเล็ต/Desktop โดยยึดพฤติกรรมและ breakpoint ที่มีในโค้ดปัจจุบัน (`md`/`xl`) และไม่เพิ่มหน้าจอหรือกฎธุรกิจใหม่ งานนี้เติมการตรวจ Responsive ที่ถูกเลื่อนไว้หลัง TASK-023.

รายการ breakpoint/รูปแบบที่ขาดการออกแบบเป็น OPEN-08 ใน Specs; งานนี้จะคงโครงและรูปแบบที่มีอยู่ และไม่ตัดสินใจแทนผู้ใช้ในประเด็นนั้น.

## ลำดับงานและผลลัพธ์

1. ตรวจ `tasks/ACTIVE.md`, Specs, component ปัจจุบัน และ git diff เพื่อแยกงานค้างจากการเปลี่ยนแปลงที่มีอยู่ — ได้ขอบเขตและ baseline ชัดเจน.
2. ตรวจ classes และโครงสร้าง Sidebar/Topbar/content/placeholder ที่จอแคบ, tablet และ desktop — บันทึกปัญหา layout ที่เกิดจาก code ที่มีอยู่.
3. แก้เฉพาะ utility `className` ใน `src/components/layout/sidebar.tsx` และ `src/components/layout/admin-shell.tsx` เท่าที่จำเป็น เพื่อไม่ให้เนื้อหาหลักล้นจอ/ถูกบัง, navigation ใช้งานได้, และลำดับ shell อ่านได้ตามเดิม.
4. ตรวจ lint, type-check, production build และ `git diff --check`; ทบทวน diff ว่าไม่มี CSS component ใน `globals.css`, business logic หรือ route เปลี่ยน. Type-check/build/diff-check ผ่าน; lint ค้างโดยไม่มีผลลัพธ์และยังไม่ยืนยัน.
5. ส่งรายการตรวจ UAT ให้ผู้ใช้ที่ viewport มือถือ, tablet และ desktop พร้อมผลที่คาดว่าจะเห็น; คงสถานะ `READY_FOR_USER_TEST` จนกว่าผู้ใช้ตรวจ.

## ไฟล์ที่คาดว่าจะเปลี่ยน

- `src/components/layout/sidebar.tsx`
- `src/components/layout/admin-shell.tsx`
- `tasks/TASK-025-responsive-shell.md`
- `tasks/ACTIVE.md`

## วิธีตรวจรับ

- AI: TypeScript type-check, production build และ `git diff --check` ผ่าน; lint ยังไม่ยืนยันเพราะคำสั่งค้าง.
- ผู้ใช้: ตรวจ viewport แคบ (ประมาณ 390px), tablet (ประมาณ 768–1024px), desktop; ทดสอบ scroll เมนูแนวนอน/แนวตั้ง, โลโก้ย่อ/ขยายบน desktop, Topbar, customer secondary navigation และ placeholder.
- ผลที่คาด: ไม่มี horizontal overflow ของหน้าโดยไม่ตั้งใจ; control/ข้อความไม่ซ้อนหรือถูกตัด; เมนูและเนื้อหายังเข้าถึงได้; Desktop คงรูปแบบ Sidebar ขยาย/ย่อ.
