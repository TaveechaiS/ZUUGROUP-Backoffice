# แผนย่อย TASK-063 — SuccessAlert ครบ mutation

งานแก้ตามคำท้วง: (1) ConfirmationDialog รองรับ variant primary และ label/ข้อความ pending (2) shared record-form, product-detail, user-detail snapshot ค่าแก้ไขและเปิด modal ก่อน PATCH (3) cancel คงค่า, success/error flow เดิม (4) lint/type-check/diff-check และปรับ TEST-SUCCESS-ALERT. ขอบเขต UI เดิมที่อนุมัติ; ไม่เปลี่ยน endpoint/schema.

สถานะ IN_PROGRESS; เจ้าของอนุมัติ 2026-10-02 พร้อม custom modal แทน native confirm. เพิ่มไฟล์ src/components/ui/confirmation-dialog.tsx และเชื่อมลบใน record-detail-page.tsx, product-detail.tsx, user-detail-content.tsx ก่อนเก็บ coverage/guards. ตรวจยกเลิกไม่ส่งคำขอและ success/error ไม่ซ้อน modal.

ผล 2026-10-02: ขั้น implementation/static checks เสร็จ; ConfirmationDialog และ pending guards เชื่อมครบตาม inventory; lint/type-check/build/diff-check ผ่าน, ไม่มี window.confirm/window.alert ใน src. สถานะ READY_FOR_USER_TEST, คู่มือ docs/TEST-SUCCESS-ALERT.md. ยังไม่ตรวจ browser/HTTP จริง.

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | ยืนยัน action inventory และมาตรฐานข้อความ | Specs/Plan/Task/ACTIVE, คู่มือ UAT | แยก flow ที่มีแล้วกับธุรกิจที่ยังไม่เปิด |
| 2 | ป้องกันกดซ้ำและจัด state สำเร็จ/error | record-form-page.tsx, record-detail-page.tsx, module-list-page.tsx, create-product-form.tsx, product-detail.tsx, create-user-form.tsx, user-detail-content.tsx | pending guard+disabled; ไม่มี success เมื่อ failed/cancel |
| 3 | ข้อความตาม action และการนำทางหลังปิด | ไฟล์ข้างต้น; success-alert-component.tsx เฉพาะพบข้อบกพร่อง | หนึ่ง alert ต่อหนึ่ง operation; ปิดทุกช่องทางใช้ callback เดียว |
| 4 | ตาราง UAT ทุกปุ่มและเงื่อนไขล้มเหลว | docs/TEST-SUCCESS-ALERT.md (จะสร้างหลังอนุมัติ) | happy path, duplicate click, validation, cancel, keyboard, error |
| 5 | static checks และเจ้าของทดสอบจริง | Task/ACTIVE | lint/type-check/build; UAT แยกจาก static |

อ่าน Next.js local docs และ ACTIVE ก่อนโค้ด. ไม่เขียน component ใหม่เพื่อเลียนแบบสิ่งที่มีแล้ว; แก้ช่องว่างตาม inventory. ไม่สร้าง unit test ที่สะท้อน implementation ของ alert แบบง่าย. หากจะตรวจ HTTP/Browser อัตโนมัติ ต้องมีคำสั่งใหม่จากเจ้าของเนื่องจากคำสั่งเดิมให้งดทดสอบ API.

## วิธีทดสอบที่ให้เจ้าของ

1. ใช้รายการทดลองใหม่ในแต่ละโมดูล; เพิ่ม → เห็นข้อความเฉพาะหลังบันทึก → ปิด → รายละเอียดของรายการถูกต้อง.
2. แก้ค่า → เห็น alert หนึ่งครั้ง → ปิด/refresh → ค่าใหม่ยังอยู่.
3. ลบและยืนยัน → alert → ปิด → หายจากรายการปกติ; กู้คืนในแท็บลบแล้ว → alert → กลับรายการ.
4. สินค้า: เพิ่มและแก้/เปลี่ยนสถานะ/ลบ/กู้คืน; เพิ่มหมวด/รูปแบบ/ตัวยาทีละประเภท → ตัวเลือกใหม่ตรง DB. อย่าตรวจด้วยรายการจริงที่มีเอกสารอ้างอิง.
5. บัญชีทดลอง: สร้าง/แก้/เปลี่ยนรหัสพนักงาน/บทบาท/ระงับ/เปิด/ตั้งรหัส/ลบ/กู้คืน → ข้อความตรง action; ไม่ใช้ Admin ตัวเองหรือคนสุดท้าย.
6. กดเร็วซ้ำ/กด Enter ซ้ำขณะรอ → ต้องไม่สร้างหลายรายการหรือหลาย alert. กดยกเลิกยืนยันลบ → ไม่มี alert และไม่ลบ.
7. กรอกข้อมูลไม่ครบ/รหัสซ้ำ/สิทธิ์ไม่พอ/ตัดเครือข่ายก่อนส่ง → error ไม่มี SuccessAlert. ตรวจ network-failure บนข้อมูลทดลองและตรวจ DB ก่อนส่งซ้ำ.
8. ปิดด้วยตกลง/X/Escape/พื้นหลัง และ Tab/Shift+Tab → ปิด/นำทางถูกต้องและ focus ไม่หลุดหลัง dialog; เปิด reduced motion → ไม่มี motion ที่รบกวน.
