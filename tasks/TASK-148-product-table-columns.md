# TASK-148 — ตารางสินค้า 7 คอลัมน์ทั้งสี่หน้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; อนุมัติจากคำขอเจ้าของ 5 ตุลาคม 2569

ผลตรวจ: ESLint/Prettier และ git diff --check ผ่าน. renderToStaticMarkup ด้วยข้อมูลจำลองและ mock hooks ตรวจทั้ง ALL/MAIN/MARKETING/DISPOSAL แต่ละแบบมีหัว/เซลล์7ช่อง ชื่อเป็นข้อความไม่มีรูป scope col และหัวคงเหลือตรงขอบเขต. ตรวจ route ทั้งสี่ใช้ component กลางและ API quantity รวมเฉพาะคลังเมื่อระบุ warehouseCode. ยังไม่ทดสอบข้อมูลสด/การคลิก/ภาพจริงใน browser. ตารางลด min-width จาก950เป็น760pxและช่องชื่อใช้28%พร้อมขึ้นบรรทัดได้.

## แผนย่อย

### รอบแก้ตารางไม่แสดง

ผลแก้: AdminShell render children ของสี่ route แล้ว. ตรวจ renderToStaticMarkup ผ่าน AdminShell และ ProductStockList ด้วย mock dependencies/ข้อมูล ทั้งสี่ route มีหัวและเซลล์7ช่อง; /customers ยังไม่แสดง children ตามโหมดเดิม. ESLint/Prettier/diff ผ่าน. ไม่มี browser เชื่อมอยู่ในเครื่องมือ จึงยังไม่ตรวจภาพจริงหรือข้อมูลสด.

1. บันทึกข้อยกเว้นโหมดพัก children เดิมใน Specs/Plan/ACTIVE ตามคำขอทำตารางทั้งสี่หน้า.
2. แก้ src/components/layout/admin-shell.tsx render children เฉพาะ /products และ /products/stock/main,marketing,disposal. คง ProductCreatePreview และ NavigationOnlyTabs หน้าอื่น.
3. ตรวจ ESLint/Prettier และ render AdminShell ด้วย mock route ทั้งสี่และหน้าอื่น เพื่อยืนยันว่า children แสดงจริงเฉพาะขอบเขตที่อนุมัติ. ตรวจ diff และส่ง UAT.

ไฟล์เพิ่มในขอบเขต: src/components/layout/admin-shell.tsx. สาเหตุเดิม: shell ไม่ render children แม้ route และตารางย่อยถูกแก้แล้ว.

1. อ่าน ACTIVE/Specs/Plan และตรวจทั้งสี่ route ใช้ ProductStockList กลาง API quantity กรองคลังแล้ว.
2. บันทึก Specs/Plan/Design ก่อนแก้โค้ด.
3. แก้ src/components/operations/product-stock-list.tsx ให้มีรหัส/ชื่อ/หมวดหมู่/หน่วย/ราคา/คงเหลือ/สถานะ ถอนจอง/พร้อมใช้/พร้อมขายคลังหลัก ใช้ชื่อคงเหลือรวมหน้ารวม คง badge คำเตือนเดิมใต้สถานะเฉพาะหน้ารวม/MAIN. ชื่อไม่มีรูป ไม่มีจัดการ คง row navigation และตัวกรองเดิม.
4. ตรวจ ESLint และ render โครงสร้าง component ทั้งสี่รูปแบบ หัว/เซลล์ 7 คอลัมน์ สถานะมี scope col ชื่อแบบข้อความ หัวคงเหลือตามคลัง. ตรวจ diff และบันทึกผล.

ไฟล์ที่จะเปลี่ยน: component กลางข้างต้น, ACTIVE, Specs/Plan หลัก, docs/designs/stock-screen-design.md และ Task นี้. ผลลัพธ์: ตารางทั้งสี่หน้ามีชุดคอลัมน์เดียวกัน ยอดแสดงตามขอบเขตคลังเดิม ไม่เปลี่ยน API/DB/สถานะจริง.

## ⚠️ ต้องทดสอบโดยคุณ

เปิด /products และ /products/stock/main, marketing, disposal บนคอม/มือถือ: เห็น 7 คอลัมน์ ไม่มีรูปหรือจัดการ ไม่มีจอง/พร้อมใช้/พร้อมขายคลังหลัก. หน้ารวมแสดงคงเหลือรวม สามคลังแสดงยอดเฉพาะคลัง. ค้นหา/กรอง/แบ่งหน้าและกดแถวหรือ Enter เปิดรายละเอียดได้. หน้ารวม/MAIN ยังเห็นคำเตือน MAIN ใต้สถานะเมื่อยอดพร้อมขายต่ำกว่า50 หน้าการตลาด/รอทำลายไม่แสดงคำเตือนนี้.
