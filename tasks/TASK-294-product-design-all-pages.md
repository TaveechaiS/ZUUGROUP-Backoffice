# TASK-294 — ทุกหน้าใช้ design หน้าสินค้า — 15 ตุลาคม 2569

OWNER_APPROVED (15 ต.ค. 2569 ตัวเลือก A: หน้ารายการไม่มี h1 แถบแท็บอยู่บนสุด ปุ่มเพิ่มอยู่ขวาของแถบแท็บ).

## มาตรฐาน (จาก /products, /products/[id], /products/create)

- รายการ: section `flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6`; แถบแท็บ `border-b border-[#d9e3ee]` ปุ่มแท็บ `border-b-2 px-1 py-3 text-sm`; กล่องตัวกรอง `grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3` ป้าย `text-xs text-[#53647c]` ช่อง `mt-1.5 ${filterClass}` (h-10); กรอบตาราง `relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white`; table `w-full border-collapse text-left text-sm`; thead `bg-[#f8f9fb] text-xs text-[#65758b]`; th `px-4 py-3 poppins-semibold` scope=col; tr `border-t border-[#edf0f4] hover:bg-[#fafbfc]`; td `px-4 py-3`; pagination ใน `border-t border-[#edf0f4] p-3` พร้อมจำนวนต่อหน้า.
- รายละเอียด: `min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8`; หัว h2 `text-lg poppins-semibold text-[#344256]` + ปุ่มขวา; การ์ด `rounded-lg border border-[#d9e3ee] p-4 md:p-6` หัว h3 `text-base poppins-semibold text-[#1a58a7]`; ปุ่มท้าย `flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5`.
- สร้าง/ฟอร์ม: กรอบ/การ์ด/ปุ่มท้ายเหมือนรายละเอียด; ช่องกรอก inputClass (h-11).
- ปุ่ม: primaryButtonClass / secondaryButtonClass `rounded-lg px-5 py-2.5 text-sm poppins-medium`.

## ลำดับ / ไฟล์

1. form-classes.ts: เพิ่ม filterClass, ปุ่มกลับเป็น rounded-lg px-5 py-2.5 (แก้ TASK-293). แก้จำนวนหน้า /10 → pageSize ใน /products และ /products/stock/[warehouse].
2. หน้ารายการ (VISION 1), หน้ารายละเอียด (VISION 2), หน้าสร้าง/ฟอร์ม (VISION 3) ทำพร้อมกันคนละกลุ่มไฟล์.
3. รวม ตรวจ diff (ไม่มี comment, ข้อความ/ข้อมูลไม่เปลี่ยน), route test, tsc, eslint, build.

ไม่ทำ: สี #hex, ข้อความ, คอลัมน์, ตัวกรอง, สิทธิ์, API, StatusBadge/Loading/NotFound, admin-shell/Side, login, หน้าแรก.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- หน้ารายการ 10 หน้า (customers, orders, quotes, purchases, users, audit-logs, territories, customer-options, product-options, products/stock): ลบ h1 แถบแท็บบนสุด (หน้าที่ไม่มีแท็บสถานะใช้แท็บเดียวชื่อหน้าเดิม; audit-logs ใช้ "ทั้งหมด"), ตัวกรอง h-10, ตาราง/pagination ในกรอบ. หน้าที่ตรงแล้ว + report-table: ตัวกรอง filterClass, รายงานใช้ชื่อรายงานเป็นแท็บ ยอดรวม/ส่งออกขวา. /customers/requests: แท็บ "ทั้งหมด" ของผู้ขอแสดงเป็น "คำขอของฉัน".
- หน้ารายละเอียด 14 หน้า: h2 text-lg #344256, หัวการ์ด h3, ตารางย่อยมาตรฐาน, ปุ่มท้าย border-t pt-5; users/[employeeCode], settings/[id] การ์ดแบบสินค้า; territories/[id] pagination ในแถบท้าย.
- หน้าสร้าง 12 หน้า + ฟอร์มใน components: h2 text-lg, การ์ด, ตารางรายการ, แถวปุ่มท้าย; document-ui Section หัว h3 + ลูกศรแบบสินค้า (มีผลกับหน้า [id] เอกสารด้วย). users/create, settings/create เปลี่ยนจากกล่อง shadow เป็นการ์ด เพิ่มหัวการ์ด "ข้อมูลบัญชี" / "ข้อมูลการตั้งค่า".
- route test, csv test, tsc, eslint, next build ผ่าน. หน้าจอจริง/มือถือยังไม่ตรวจ.

ไม่ได้แก้: ลิงก์ "← กลับ" ข้อความเล็ก, ปุ่มเล็ก "ลบที่อยู่" ในฟอร์มลูกค้า, ช่องเลือกไฟล์แนบ.

⚠️ ต้องทดสอบโดยคุณ: เปิด /products แล้วเทียบกับ /customers, /orders, /quotes, /purchases, /users, /audit-logs, /customers/territories, /settings/customer-options, /products/stock, /reports/* → แถบแท็บบนสุด, กล่องตัวกรองเทา ช่องสูงเท่ากัน, หัวตารางตัวเล็กเทา, แถว hover, pagination อยู่ในกรอบตารางพร้อมเลือกจำนวนต่อหน้า; /products เลือก 20 แถวต่อหน้า จำนวนหน้าต้องถูก. เปิด /products/<รหัส> เทียบกับ /orders/<id>, /purchases/<id>, /users/<รหัส>, /settings/<id> → หัวข้อขนาดเดียวกัน การ์ดขอบมน ปุ่มท้ายมีเส้นคั่น. เปิด /products/create เทียบกับ /orders/create, /users/create, /settings/create, /products/stock/create → การ์ดพับได้ ปุ่มท้ายขวา. Login Sales เปิด /customers/requests เห็นแท็บ "คำขอของฉัน". ทำบนมือถือด้วย ตารางเลื่อนแนวนอนได้ ไม่ล้นจอ.
