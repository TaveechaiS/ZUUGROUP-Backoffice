# แผนย่อย TASK-040 — ภาพรวมหน้าระบบและ Detail ตัวอย่าง

**วันที่:** 2026-10-01 (Asia/Bangkok)
**ผลลัพธ์:** เจ้าของโครงการเปิดดูภาพรวมหน้า และตรวจดีไซน์หน้า Detail ลูกค้า/สินค้าได้

## ลำดับและไฟล์

1. บันทึกข้อกำหนด Mock ใน `docs/specs/2026-10-01-design-preview-amendment.md`, แผนนี้, `tasks/TASK-040-design-preview.md` และ `tasks/ACTIVE.md`
2. ทำหน้า `/design-preview` แสดงกลุ่มหน้า Phase 3–9 จาก `src/config/navigation.ts` ใน `src/app/design-preview/page.tsx`; ไม่เพิ่ม Sidebar
3. เพิ่มหน้า `/customers/[ref]` และ `/products/[ref]` ด้วย component ใช้ร่วมกันใน `src/components/pages/mock-detail-page.tsx`; อ่านแถวจำลองเดิมและรายการชั่วคราวในแท็บ
4. เชื่อมแถวของ `/customers` และ `/products` จาก `src/components/pages/module-list-page.tsx` ไป Detail ทั้ง desktop/mobile; โมดูลอื่นคงพฤติกรรมเดิม
5. ตรวจ lint, type-check, build, `git diff --check`, เส้นทางรายการ→Detail→กลับ และกรณี ref ที่ไม่พบ

## ขอบเขตการตรวจรับ

- เปิด `/design-preview` เห็นลิงก์หน้าแต่ละกลุ่มและป้ายสถานะ Mock/ระบบจริงตรงกับปัจจุบัน
- เปิดแถวลูกค้า/สินค้า เห็นข้อมูลตัวอย่างเดิมและกลับรายการได้; จอแคบยังอ่านได้
- ข้อมูลที่เพิ่มจาก `/create` เปิด Detail ได้ในแท็บเดิม; ref ที่ไม่มีแสดงข้อความชัดเจน
- ไม่มีการเขียน DB, API, Supabase Auth หรือกฎ OPEN
