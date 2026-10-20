# TASK-087 — คำสั่งตรวจโครงการ

สถานะ: APPROVED จากคำตอบ “ok” ของเจ้าของต่อข้อเสนอรวมชุดตรวจ 2026-10-03

เพิ่ม `npm run verify` สำหรับชุดตรวจมาตรฐานก่อน commit. ใช้เครื่องมือและ tests ที่มีอยู่ ไม่เพิ่ม dependency. ทำงานจาก root โครงการและเรียก Node/local binaries โดยไม่สร้าง shell command จากข้อความ.

ลำดับ: ESLint → Next typegen → TypeScript แบบไม่เขียน incremental cache → API contracts → pagination → route pages → resource API → API field names → production build. typegen ทำก่อน type-check เพื่อให้เครื่องใหม่มี Next route types; build ตรวจการประกอบแอปจริง.

ทุกขั้นมีชื่อ/ลำดับและเวลาที่ใช้. ขั้นใดไม่ผ่านให้หยุดทันที ส่ง exit code ไม่เป็นศูนย์และชื่อขั้นที่ผิดพลาด; ไม่แสดงว่าผ่านครบ. กดหยุดต้องยุติกระบวนการและไม่เดินขั้นถัดไป. รันครบแล้วแสดงจำนวนขั้นที่ผ่านและเวลารวม.

Core offline tests 5 ชุดไม่ใช้ HTTP/DB หรือ credential. Build/typegen สร้างไฟล์ generated ตาม Next.js; build อาจต้องใช้เครือข่ายเพื่อรับฟอนต์หากยังไม่มี cache จึงไม่รับประกันว่า verify ทั้งคำสั่งทำงานโดยไม่มีเครือข่าย. ไม่รัน seed/migrate/recovery หรือคำสั่งเขียนข้อมูลจริง.

`npm run verify:seed` เลิกใช้แล้วตั้งแต่ TASK-309 (2026-10-20) พร้อม seed TASK-052/076; ข้อมูลอ้างอิงดู Specs หลักหัวข้อ TASK-309.

ตรวจรับ: verify ผ่านครบ 9 ขั้นในโครงการปัจจุบัน; จำลองขั้นล้มเหลวแล้วขั้นถัดไปไม่รันและ exit code ตรง; seed ไม่มี snapshot แจ้งวิธีเตรียมไฟล์. ผลผ่านเป็น code checks ไม่แทนการทดสอบหน้าจอของเจ้าของ.
