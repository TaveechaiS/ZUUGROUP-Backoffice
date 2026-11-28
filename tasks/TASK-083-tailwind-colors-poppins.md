# TASK-083 — มาตรฐานสีและฟอนต์

สถานะ: COMPLETE

คำขอเจ้าของ 2026-10-03 อนุมัติให้ปรับทั้งหมดและบันทึกรูปแบบไว้. ขอบเขต/ลำดับ/ตรวจรับตาม [Specs](../docs/specs/2026-10-03-tailwind-colors-poppins.md) และ [Plan](../docs/plans/2026-10-03-tailwind-colors-poppins-plan.md).

ข้อแก้ไขล่าสุดตามเจ้าของ: เปลี่ยนเฉพาะคลาสสีที่เดิมใช้ var เป็นชื่อ Tailwind; ค่า #hex ต้องคงเดิม. รายงานรอบแรกด้านล่างเรื่องแปลง hex/palette ถูกแทนที่ด้วยข้อแก้ไขนี้.

ผลแก้ไข: เทียบ source เดิมจาก Git และคืน hex เฉพาะจุด 63 ไฟล์ รวม 1,987 ค่า; ตรวจ Counter รายไฟล์เท่าต้นฉบับทั้งหมด. คืน SuccessIcon #1DD882, shadow #fff, สีพื้น body และทุกคลาส hex เดิม. กำหนด @theme blue 11 ระดับตาม palette ต้นฉบับเพื่อให้ blue-700 เป็น #1a58a7 และระดับอื่นตรงเดิม. คง Poppins, Loading, sticky Header และ fallback `-` ที่ทำแล้ว.

ตรวจล่าสุด: ค่า hex ตรงครบ, lint/type-check/build ผ่าน. AGENTS/Specs/Plan/คู่มือแก้ให้เก็บ hex เดิมแล้ว. เจ้าของตรวจสี Sidebar/Header/ปุ่ม/ตาราง/ฟอร์มทั้ง desktop/mobile ว่ากลับมาตามภาพเดิม.

## ประวัติรอบแรก (แทนที่ด้วยข้อแก้ไขล่าสุดแล้ว)

การจับคู่: blue tokens ใช้ blue ระดับเดียวกัน; ink-950/700/500 ใช้ gray-900/600/500, line ใช้ gray-200, canvas ใช้ gray-50, surface ใช้ white. Hex น้ำเงินเดิม #1a58a7/#174a8b/#2465b4 ใช้ blue-700/800/600. Hex เนื้อหาจับคู่ gray-900/800/700/600/500/400 ตามความเข้ม; เส้นอ่อนใช้ gray-100/200 หรือ blue-100; สี error ใช้ red-100/300/500/700. ค่า 650 ใช้ Poppins 600.

ผลดำเนินการ:

- แปลงหน้า Dashboard/Login/Audit และหน้ารายการ/รายละเอียด/สร้างของ billing, customers (รวม dashboard/documents/groups/list/territories), expenses, orders, products, promotions, purchases, quotes, reports (finance/inventory/sales), settings, stock-counts, suppliers และ users.
- แปลง `admin-shell`, `sidebar`, `confirmation-dialog`, `loading-component`, `not-found-component`, `pagination-controls`, `search-combobox`, `status-badge`, `success-alert-component`, `icons/status-icons` และค่าคลาส `products/product-ui.ts`/`users/user-ui.ts`.
- ถอน palette tokens ที่ไม่มีผู้ใช้จาก globals.css; สี body ใช้ Tailwind tokens. คงคลาสน้ำหนัก Poppins 100–900 และ fallback ไทย. SuccessIcon ใช้ `fill-emerald-400`; เงา inset ใช้ white token ของ Tailwind.
- AGENTS ข้อ 13 บันทึกมาตรฐานสีและน้ำหนักฟอนต์; Specs หลักและคู่มือ UI/StatusBadge อ้างกติกาใหม่สำหรับงานต่อไป.

ผลตรวจ: `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build` และ `git diff --check` ผ่าน. ตรวจค้น `src` ไม่พบสี hex, color var เดิม หรือ `font-*` ที่กำหนดน้ำหนัก/monospace ตกค้าง; ตัวแปร Next font family และตัวแปรขนาด layout ยังคงอยู่ตามหน้าที่. ยังไม่ได้ตรวจภาพใน browser.

ตรวจรับโดยเจ้าของ: เปิด Login/Dashboard/หน้ารายการ/ฟอร์ม/รายละเอียดและ Loading/dialog ทั้ง desktop/mobile. สีจะเป็น palette Tailwind มาตรฐาน ฟอนต์ไทย/อังกฤษต้องอ่านได้และน้ำหนักตรงตามตำแหน่ง. ตรวจ focus/hover/error ของช่องและปุ่ม รวมป้ายสถานะสี 50/600.


ตรวจรับ 2026-10-03: เจ้าของยืนยัน “ok แล้ว” กับรายการ UI และการใช้งานจริงที่สรุปให้ รวมขอบเขตงานนี้ตามผลล่าสุด. รายงานที่ระบุรอ UAT ด้านบนเป็นประวัติก่อนคำยืนยันนี้; กรณีพิเศษที่ไม่ได้ระบุในรายการตรวจรับไม่ถือว่ามีผลทดสอบแยก. ดู CHECKPOINT-2026-10-03.md.
