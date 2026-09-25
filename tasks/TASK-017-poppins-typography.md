# TASK-017 — Poppins และน้ำหนักตัวอักษร

**สถานะ:** DONE

**Specs:** [Poppins และ fallback ภาษาไทย](../docs/specs/2026-09-24-poppins-typography.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-poppins-typography-plan.md)

**Branch / Commit ตั้งต้น:** `AI` / `846c251`

**ขอบเขต:** โหลด Poppins และ Noto Sans Thai; เพิ่มคลาสน้ำหนัก 100–900; ใช้กับ UI ปัจจุบันใน Sidebar, Topbar, Dashboard และ module placeholders. คงขนาดตัวอักษรและ layout.

**ไฟล์:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

**แผนตรวจรับ:** Desktop ตรวจ Poppins สำหรับอักษร Latin, Noto Sans Thai สำหรับอักษรไทย, ความอ่านง่ายของ Sidebar/Topbar/placeholder, และยืนยันว่าขนาดตัวอักษรและ layout ไม่เปลี่ยน. การตรวจ Responsive/Mobile รอหลังงานหลัก.



**ผลตรวจ AI:** production build ผ่านหลังระบุน้ำหนักใน 
ext/font/google อย่างชัดเจน; ยังรอเจ้าของโครงการตรวจหน้าจอ Desktop.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้า Admin บน Desktop: อังกฤษควรใช้ Poppins และข้อความไทยควรใช้ Noto Sans Thai fallback.
- ตรวจ Sidebar แบบขยาย/ย่อ, Topbar, Dashboard และ module placeholder: น้ำหนักหัวข้อ/เมนูควรตรงกับเดิม ขนาดข้อความและระยะจัดวางไม่ควรเปลี่ยน.
- Mobile/Responsive จะตรวจภายหลังตามคำขอเจ้าของโครงการ.

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
