# TASK-216 — Checkpoint สินค้าและสต็อก

เจ้าของอนุมัติ checkpoint 6 ตุลาคม 2569. เก็บ local commit บน AI; ไม่ push/deploy หรือเปลี่ยน DB ในงานนี้.

สถานะ CHECKPOINT_READY. TypeScript/ESLintไฟล์โค้ดเปลี่ยนและใหม่ทั้งหมด/diffผ่าน. เอกสารส่งต่อพร้อมและเก็บใน commit เดียวกับงาน. ตรวจ hash จริงจาก Git log; next-env.d.ts ที่ tracked เก็บเส้นอ้างอิง .next/types ตาม build ล่าสุด ไม่รวม generated runtime หรือ secrets.

แผนย่อย:

1. ตรวจ branch/status/diff และไฟล์ใหม่ในงาน TASK154–215; คงงานเดิม ไม่รวม secrets, backups หรือ generated runtime.
2. บันทึก Specs/Plan/ACTIVE/HANDOFF และ CHECKPOINT-2026-10-06.md พร้อมขอบเขต ผลทดสอบ และงานรอ UAT.
3. ตรวจ lint/type/diff; ใช้ผล build/DB rollback/UI VM ของ TASK215 ที่ผ่านแล้ว. ไม่รัน seed หรือธุรกรรมธุรกิจใหม่.
4. Stage เฉพาะงานที่ตรวจแล้ว เก็บ local commit และตรวจ hash/status. Hash จริงอ่านจาก Git log.

ผลลัพธ์ที่ตรวจรับ: commit งานพร้อมเอกสารสำหรับเริ่มต่อ; UAT ตาม checkpoint ยังต้องให้เจ้าของตรวจในเว็บจริง.
