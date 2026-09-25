# งานที่กำลังทำ

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-029 | AI | READY_FOR_USER_TEST | เว็บ Mock ทุกเมนู; ข้อมูลแยกโฟลเดอร์รายหน้า โครง UI ใช้ร่วมกัน | งานเดิมผ่าน lint/type-check/build/diff-check; ตำแหน่งไฟล์ย้ายโดย TASK-030 ไป `src/app/README.md` |
| TASK-030 | AI | READY_FOR_USER_TEST | จัดหน้าแต่ละ URL ใต้ `src/app`; ปรับขนาดเนื้อหา Tab, Filter, ตาราง, กล่อง และตัวอักษรเทียบ TPSO โดยคงสีและพฤติกรรม ZUU | 22 route มี `page.tsx`/`data.ts`; lint, build, type-check และ diff-check ผ่าน; รอผู้ใช้ตรวจภาพและการใช้งาน |
| TASK-031 | AI | READY_FOR_USER_TEST | ปรับ padding กรอบเนื้อหาหลักใน `AdminShell` ตามกรอบที่ผู้ใช้ชี้เป็น `p-6` | แก้เฉพาะ className ของ wrapper ใต้ Topbar; ตรวจ class/diff แล้ว; รอผู้ใช้ตรวจภาพ |
| TASK-032 | AI | READY_FOR_USER_TEST | ลบเส้นคั่นคอลัมน์และเพิ่มกรอบนอกครบสี่ด้านของตารางรายการกับตารางผู้ใช้งาน | ใช้ `border` รอบนอกตามคำแก้ล่าสุด; ไม่มี `border-r` ในเซลล์; ตรวจ class/diff แล้ว |
| TASK-033 | AI | READY_FOR_USER_TEST | แสดงข้อความในตารางเต็มโดยขึ้นบรรทัดใหม่แทน `...` | หัวตาราง/เซลล์/การ์ดมือถือเลิกใช้ `truncate`; ตรวจ class/diff แล้ว; รอผู้ใช้ตรวจภาพ |
