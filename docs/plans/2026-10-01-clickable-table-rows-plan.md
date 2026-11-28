# แผนย่อย TASK-057

1. อ่าน `tasks/ACTIVE.md` และคู่มือ Next.js ที่เกี่ยวข้อง; ระบุขอบเขตใน Specs/Plan/Task.
2. แก้ `src/components/pages/module-list-page.tsx` ให้แถว desktop และ mobile เปิด URL รายละเอียดเมื่อกดทั้งแถว พร้อมคีย์บอร์ด; คงแถวที่ไม่มี URL ตามเดิม.
3. แก้ `src/app/products/products-list.tsx` และ `src/app/users/users-list-content.tsx` ให้เปิดรายละเอียดจากทั้งแถว; ถอดการพึ่งพาชื่อ/คอลัมน์ท้ายเป็นจุดกดหลัก.
4. ตรวจ lint, type-check, build; บันทึกผลใน `tasks/TASK-057-clickable-table-rows.md` และ `tasks/ACTIVE.md`.

ผลลัพธ์: แถวรายการที่มีหน้ารายละเอียดเปิดได้จากทุกเซลล์ในตาราง.

วิธีตรวจรับ: เปิดรายการโมดูล/สินค้า/ผู้ใช้งานแล้วกดเซลล์กลางและท้ายแถว, ทดสอบแถวมือถือและ Enter/Space, ตรวจปุ่มกู้คืนในแท็บลบแล้ว.
