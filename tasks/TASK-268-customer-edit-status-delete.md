# TASK-268 — แก้ไขลูกค้า/สถานะ/ลบกู้คืน/ผู้สร้างผู้แก้ — 7 ตุลาคม 2569

OWNER_APPROVED: แก้ไขลูกค้าทุกช่อง (รวมกลุ่มรหัส/เลขรัน ตรวจซ้ำ, ที่อยู่จัดส่ง, ไฟล์แนบเพิ่ม/นำออก) แบบกันแก้ทับด้วย version; สถานะลูกค้า ใช้งาน/ระงับ/เลิกค้าขาย (ค่าเริ่มต้นใช้งาน, ป้ายสีกลาง, ตัวกรอง); ลบแบบกู้คืนได้ Admin ใส่เหตุผล แท็บ ลบแล้ว ดู/กู้คืน; หน้าแสดงมีชื่อผู้สร้าง/ผู้แก้ไขล่าสุดจาก audit. ทั้งหมด Admin เท่านั้น ไม่แตะสิทธิ์ Role อื่น.

ผล: IMPLEMENTED / WAITING_FOR_UAT (7 ตุลาคม 2569).
- DB: `node scripts/setup-customer-status.mjs` (--dry-run ได้) ลง Supabase แล้ว: default status=ใช้งาน, ลูกค้าเต็ม 15 รายเป็น ใช้งาน, check ใช้งาน/ระงับ/เลิกค้าขาย, index (deleted_at,status). Prisma default อัปเดต.
- API: POST /api/customers/{id}/edit-requests (expectedUpdatedAt กันแก้ทับ 409, keepFileIds) → upload/commit เดิม; DELETE /api/customers/{id} {reason} ลบแบบกู้คืนได้; PATCH {action:'restore'}; list ?status= ?deleted=true(Admin) sort status; detail ?deleted=true(Admin) + history ผู้สร้าง/ผู้แก้ล่าสุดจาก audit; ไฟล์ของลูกค้าที่ลบเปิดได้เฉพาะ Admin. audit CUSTOMER_UPDATED_FULL/DELETED/RESTORED.
- หน้า: ฟอร์มกลาง create/customer-form.tsx ใช้ทั้งเพิ่มและแก้ไข (ค่าเดิมทุกช่อง, สถานะลูกค้า, กลุ่มเดิมคงเลขเดิม, ไฟล์เดิมเก็บ/นำออก, ไฟล์ใหม่); /customers/[id]/edit (requireAdmin); หน้าแสดงมีป้ายสถานะลูกค้า, ผู้สร้าง/ผู้แก้, ปุ่มแก้ไข, ลบพร้อมเหตุผล+ยืนยัน, กู้คืนในมุมมองลบแล้ว; รายการมีแท็บ รายชื่อลูกค้า/ลบแล้ว (Admin), ตัวกรอง สถานะลูกค้า + ผลตรวจใบอนุญาต, คอลัมน์สถานะแสดงสถานะลูกค้า + ใบอนุญาต.
- Postman local ลูกค้า 12 คำขอ (เพิ่ม แก้ไข/ลบ/กู้คืน; GET รายละเอียดเก็บ customerUpdatedAt).
- ทดสอบ: test-customer-full 12 checks ผ่าน (เพิ่ม edit stale/keep number/swap file/status/audit/history และ delete/restore/deleted tab/สิทธิ์), test-route-pages 79 routes ผ่าน, tsc (ยกเว้น type เก่าใน .next ก่อน build)/eslint/next build ผ่าน, HTTP anonymous PATCH/DELETE/edit-requests 401 และหน้า edit redirect login.

⚠️ ต้องทดสอบโดยคุณ:
1. เปิดลูกค้า → แก้ไข: ทุกช่องมีค่าเดิม รวมกลุ่มรหัส/เลขรัน/ที่อยู่จัดส่ง/ไฟล์เดิม; เปลี่ยนชื่อ+สถานะเป็น ระงับ → บันทึก → หน้าแสดงเปลี่ยนตาม รหัสเดิม, ผู้แก้ไขล่าสุดเป็นชื่อคุณ.
2. เปิดแก้ไขสองแท็บ บันทึกแท็บแรกแล้วบันทึกแท็บที่สอง ต้องขึ้นว่าข้อมูลถูกเปลี่ยนแล้ว.
3. ไฟล์เดิมกด นำออก แล้วบันทึก ต้องหายจากหน้าแสดง; แนบไฟล์ใหม่ได้.
4. หน้าแสดง → กรอกเหตุผล → ลบลูกค้า → ยืนยัน: กลับรายการและไม่เห็นลูกค้านั้น; แท็บ ลบแล้ว เห็นพร้อมเหตุผล → เปิด → กู้คืน → กลับมาในรายการ.
5. ตัวกรองสถานะลูกค้า ระงับ/ใช้งาน ทำงาน.
