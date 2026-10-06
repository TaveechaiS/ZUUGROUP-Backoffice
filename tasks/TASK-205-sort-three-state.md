# TASK-205 — Sortกลับลำดับเดิมได้

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/Plan.
2. src/components/ui/sortable-table.tsx useTableSort callback third samekey clearskey/asc default; labelปุ่มdescคือคืนลำดับเดิม. default renderer/queryใช้ทางเดิมอยู่แล้ว.
3. scopedlint/mock cycle3/localoriginalorder/normalcolor/aria/queryempty/newkeyasc/onChangepage reset. ไม่API/DB.

⚠️ ต้องทดสอบโดยคุณ: กดหัวคอลัมน์เดียว3ครั้งต้องขึ้น→ลง→ลำดับเดิม ไอคอนครั้ง3สีปกติ และตารางแบ่งหน้ากลับหน้า1.

ผล: ESLint/TypeScript/diffผ่าน; mockasc/desc/originalrows, thirdaria-none/currentColor55%/noquery, newcolumnascและonChangecallbackทุกclickผ่าน. ไม่DBwrite ยังไม่browser.
