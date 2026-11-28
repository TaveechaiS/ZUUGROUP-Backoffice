# Checkpoint — 2026-10-03

Branch: AI. ต่อจาก c7a3c92; hash checkpoint ดูจาก Git log.

เจ้าของยืนยัน “ok แล้ว” ต่อรายการตรวจ UI, การใช้งานจริง และ commit/checkpoint รอบล่าสุด.

งานรอบนี้:

- TASK-078: Dashboard กดลองใหม่หลัง error แสดง Loading ระหว่างรอ.
- TASK-079: หน้า [id] ใช้ได้แล้วหลังสร้าง dev cache ใหม่; เจ้าของยืนยันก่อนหน้านี้.
- TASK-080–081: ค้นหา/filter/pagination แสดง Loading ในตาราง 21 หน้า; โลโก้ `/Logoloading.png` ขนาดใกล้ไอคอนเดิมพร้อมวงแหวน. Route/session loading เต็มจอตามเดิม.
- TASK-082: ข้อกำหนดสุดท้ายยกเลิกการล็อก Header ตอนเลื่อน; Header และแถบสี 10px เลื่อนตามหน้าปกติทั้ง desktop/mobile.
- TASK-083: น้ำหนักข้อความใช้ poppins-*; เปลี่ยนเฉพาะคลาสสี var เป็นชื่อ Tailwind. Hex เดิมครบ 63 ไฟล์/1,987 จุด; Tailwind blue theme รักษาสีหลัก #1a58a7 และ palette เดิม. กติกาเก็บใน AGENTS/Specs.
- TASK-084: ข้อมูลว่างใน UI แสดง `-`; คง empty defaults ของฟอร์ม/search/ID/API และค่าตัวเลข 0.
- package-lock: เปลี่ยน devOptional → dev สำหรับ @types/react-dom โดยไม่เปลี่ยน version/resolved/integrity.

ผลตรวจรับจากเจ้าของ:

- สีเดิม, Header ตอนเลื่อน, Loading ในตาราง, ฟอนต์, ข้อมูลว่าง - บนคอม/มือถือ.
- เพิ่ม/แก้/ลบ/กู้คืน, ยกเลิก/ยืนยัน, SuccessAlert, ค้นหาและแบ่งหน้า.

ผลตรวจโค้ด: lint/type-check/build ผ่านในรอบ UI; หลังแก้ Header ล่าสุด lint/type-check/diff-check ผ่าน. ก่อน commit ตรวจไฟล์และ staged diff; ไม่รวม env/snapshots/secret.

งานต่อ: รอรายละเอียดข้อมูลธุรกิจจริง กฎแต่ละโมดูล ฟิลเตอร์และขอบเขตสิทธิ์เพิ่มเติม. Deploy ยังพักตามเจ้าของ. ผลตรวจเฉพาะกรณีพิเศษที่ไม่ได้ระบุในรายการตรวจรับ เช่น reduced motion/ความล้มเหลวของ API/last-Admin guard ไม่ถือว่าเจ้าของยืนยันแยกในรอบนี้.
