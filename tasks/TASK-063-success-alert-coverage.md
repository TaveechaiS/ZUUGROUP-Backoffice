# TASK-063 — ตรวจให้ SuccessAlert ครบทุกปุ่มเปลี่ยนข้อมูล

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ 2026-10-02 และขอ custom modal แทน browser confirm
- Branch: AI
- ผู้รับผิดชอบ: AI
- Specs: docs/specs/2026-10-02-success-alert-coverage.md
- Plan: docs/plans/2026-10-02-success-alert-coverage-plan.md

ทำแล้ว: ConfirmationDialog กลางแทน native confirm ในลบรายการ/ผู้ใช้และเพิ่มยืนยันลบสินค้า. ใช้ dialog ของเว็บพร้อม cancel focus/keyboard/modal backdrop; pending ห้ามปิดหรือกดซ้ำ. เพิ่ม ref guards ในทุกกลุ่ม mutation UI, ข้อความเฉพาะระงับ/เปิดบัญชีและประเภทข้อมูลแม่. ไม่แก้ API/DB และไม่ยิง HTTP. lint/type-check/build/diff-check ผ่าน; rg ไม่พบ browser alert/confirm ใน src. ยังไม่ได้ตรวจหน้าจอจริง; คู่มือ docs/TEST-SUCCESS-ALERT.md พร้อม UAT.

## ⚠️ ต้องทดสอบโดยคุณ

แก้ตามคำท้วงเพิ่มเติม: shared record edit, product edit และ user profile edit มี confirmation สีน้ำเงินก่อน PATCH โดย snapshot ค่าจากฟอร์ม; cancel คงค่าและไม่ส่งคำขอ. SuccessAlert/error flow เดิมยังใช้หลัง server ตอบ. type-check/lint/diff-check ผ่านรอบนี้; build ผ่านรอบก่อนเพิ่ม edit confirmation. ยังไม่ได้ UAT browser/HTTP.

หลังอนุมัติและทำงาน: เพิ่ม/แก้/ลบ/กู้คืนรายการทดลอง → alert ครั้งเดียวหลังบันทึกจริง; ปิดแล้วไปหน้าที่ควรไป. รวมเปลี่ยนบทบาท/สถานะ/ตั้งรหัสผ่านและเพิ่มข้อมูลแม่. Failed/cancel ต้องไม่มี success; กดซ้ำระหว่างรอไม่มีข้อมูลซ้ำ. วิธีละเอียดในแผนย่อย.
