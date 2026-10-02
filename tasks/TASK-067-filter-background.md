# TASK-067 — พื้นหลัง Filter สีขาว

สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติด้วยคำขอ 2026-10-02

Specs: docs/specs/2026-09-24-ui-inline-utilities.md
Plan: docs/plans/2026-09-23-1635-project-plan.md

## แผนย่อย

1. ตรวจพื้นหลังแถบและช่อง filter ใน shared module list, users, products และ audit
2. เปลี่ยนพื้นที่ filter ที่ยังมีพื้นเทาเป็น bg-white คงเส้นขอบ ระยะและพฤติกรรม
3. ตรวจ lint/diff และให้เจ้าของตรวจหน้าจอ

ไฟล์ที่เปลี่ยน: src/components/pages/module-list-page.tsx, src/app/users/users-list-content.tsx, src/app/products/products-list.tsx, src/app/audit-logs/audit-list.tsx

ผลที่ต้องได้: แถบค้นหาและ filter พื้นขาวทุกหน้ารายการ ช่องเลือกยังอ่านได้และกรองได้ตามเดิม

ผลตรวจ: เปลี่ยนแถบ filter ทั้งสี่จุดเป็น bg-white แล้ว ช่องค้นหา/select เดิมพื้นขาวอยู่แล้ว lint และ diff-check ผ่าน ยังไม่ได้ทดสอบหน้าจอจริง

## ⚠️ ต้องทดสอบโดยคุณ

รีเฟรชหน้ารายการผู้ใช้ สินค้า ประวัติการทำรายการ และโมดูลอื่น ทั้ง desktop/mobile แถบ filter และช่องค้นหา/เลือกต้องพื้นขาว การค้นหาและกรองทำงานเหมือนเดิม
