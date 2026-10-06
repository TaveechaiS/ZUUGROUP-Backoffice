# ZUUGROUP — กติกาสำหรับผู้ทำงาน

1. ใช้ `docs/specs/2026-09-23-1550-project-specs.md` เป็น Source of Truth ของความต้องการ
2. ใช้ `docs/plans/2026-09-23-1635-project-plan.md` เป็นลำดับงาน
3. ห้ามเริ่มเขียนโค้ด, สร้างฐานข้อมูล หรือเดากฎธุรกิจที่อยู่ใน OPEN จนกว่าเจ้าของโครงการอนุมัติเอกสารและ Task นั้นพร้อมเริ่ม
4. ก่อนแก้ไฟล์ ให้ตรวจ `tasks/ACTIVE.md` และบันทึกขอบเขตงานของตน เพื่อไม่ให้ AI หรือผู้ทำงานหลายคนแก้ส่วนเดียวกันพร้อมกัน
5. ใช้เฉพาะ Branch `AI`, `Dev`, `Main`; ห้ามสร้าง Branch ย่อยและห้าม Force Push
6. ใช้ภาษาไทยใน UI, แสดง พ.ศ. และเวลา Asia/Bangkok ตาม Specs
7. ห้ามเพิ่ม Role `Inventory`; ผู้ตรวจนับทำงาน Manual นอกระบบ Admin เพียงคีย์ผลเพื่อเทียบยอด โดยไม่ปรับยอดหรือสร้าง Ledger อัตโนมัติ
8. ทุกงานที่มีพฤติกรรมต้องส่งหัวข้อ `⚠️ ต้องทดสอบโดยคุณ` พร้อมวิธีและผลที่ควรเห็น
9. ก่อนเริ่มงานทุกครั้ง รวมถึงงานย่อยใน Phase ให้แจ้งขอบเขตและลำดับทำงานแก่เจ้าของโครงการก่อนลงมือ
10. ก่อนแก้ไฟล์ทุกครั้ง ให้อ่าน `tasks/ACTIVE.md` และบันทึก/ปรับ Task ให้ระบุขอบเขตเฉพาะของงานนั้น
11. บันทึกข้อมูลและข้อกำหนดใหม่ที่เจ้าของโครงการให้ไว้ใน Specs; ปรับ Plan ให้สอดคล้องก่อนเริ่มลงมือ หากข้อมูลขัดกันหรือเปลี่ยนขอบเขต ให้หยุดส่วนที่ได้รับผลกระทบและแก้ Specs/Plan ก่อนเขียนโค้ด
12. งานย่อยต้องมีแผนย่อยที่บอกลำดับ ผลลัพธ์ ไฟล์ที่จะเปลี่ยน และวิธีตรวจรับ แม้งานนั้นอยู่ใน Phase ที่อนุมัติแล้วก็ตาม
13. สไตล์ของ UI ให้เขียนใน `className` เช่น `text-sm poppins-bold`, `md:px-5`, `bg-blue-700`, `border-gray-100`. เปลี่ยนเฉพาะคลาสสีที่อ้าง `var(--สี)` เป็นชื่อ Tailwind; สีที่กำหนดเป็น `#hex` ให้คงค่าตามเจ้าของ ห้ามแทนด้วยสี palette อื่น. สีหลักเดิมรักษาผ่าน Tailwind theme tokens ใน globals.css. น้ำหนักฟอนต์ใช้ `poppins-thin/extralight/light/regular/medium/semibold/bold/extrabold/black` ที่อยู่ใน CSS แทน `font-*` ทุกน้ำหนัก. ใช้ `globals.css` สำหรับ imports, theme/tokens ขนาด, ฟอนต์ และกฎพื้นฐานของแอป ตาม [ข้อกำหนดล่าสุด](docs/specs/2026-10-03-tailwind-colors-poppins.md)

14. ทุกหน้าที่แสดงป้ายสถานะ รวมถึงสถานะใหม่ในอนาคต ต้องใช้ `src/components/ui/status-badge.tsx` ตาม [มาตรฐานป้ายสถานะ](docs/STATUS-BADGE-GUIDE.md): พื้นหลังระดับ `50`, ตัวหนังสือระดับ `600`, มุมมนและจุดสีด้านหน้า. เพิ่มการจับคู่สีใน component กลาง ห้ามเขียน pill/style สถานะแยกในแต่ละหน้า; คงข้อความและค่าธุรกิจจริง. คอลัมน์ที่แสดงสถานะต้องมีหัวชื่อ `สถานะ` และใช้ `scope="col"`; ตรวจทั้ง desktop และ mobile.

15. ทุกหน้าที่แสดงข้อมูลต้องใช้ `src/components/ui/loading-component.tsx` ระหว่างโหลด และ `src/components/ui/not-found-component.tsx` เมื่อโหลดสำเร็จแต่ไม่มีข้อมูลหรือ API ตอบ 404 ตาม `docs/DATA-STATES-GUIDE.md`. ห้ามทำข้อความ/ภาพ loading หรือ empty แยกเอง; อย่าแสดง NotFound ขณะโหลดหรือแทนข้อผิดพลาด 401/403/500/503. ตารางใช้ content Loading ใน parent relative/min-height; SSR ใช้ loading/not-found กลางที่สืบทอดได้. ใช้กับหน้าใหม่ด้วย ไม่สร้าง loading ปลอมให้หน้าตัวอย่างที่ไม่มี fetch.

<!-- BEGIN:nextjs-agent-rules -->


# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
