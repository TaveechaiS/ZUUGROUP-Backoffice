# แผนย่อย TASK-084

1. อ่าน ACTIVE และตรวจทุกจุด `?? ''`/placeholder ใน src; บันทึก Specs/Plan ก่อน source edits.
2. เปลี่ยน `String(row.field ?? '') || '—'` สำหรับข้อความแสดงผลเป็น `String(row.field ?? '-') || '-'`, fallback ของชื่อสัมพันธ์และ Role ใน Header เป็น `?? '-'`, และ literal placeholder `—` ใน UI เป็น `-`.
3. คง empty defaults ของฟอร์ม/search/ID/API; ตรวจ lint/type-check/diff-check และบันทึกผลใน TASK/ACTIVE.

ไฟล์: `src/app/**/*.tsx` ที่มี display fallback, `src/components/layout/admin-shell.tsx`, `src/components/ui/status-badge.tsx`, Specs/Plan หลักและย่อย, TASK-084/ACTIVE. ไม่แก้ค่าที่ส่งหรือเก็บในฐานข้อมูล.

ผลลัพธ์/วิธีตรวจรับ: ข้อมูล optional ที่ว่างแสดง `-` อย่างสม่ำเสมอ; ทดสอบ 0, ฟอร์มว่าง และค้นหาว่างยังทำงานถูกต้อง.
