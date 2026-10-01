# TASK-061: เติม SuccessAlert ให้ครบ flow สำเร็จ

เจ้าของแจ้งหลัง checkpoint ว่า `SuccessAlertComponent` ยังไม่เสร็จ. จากการตรวจไฟล์พบ component แล้วและใช้หลังแก้สินค้า/กู้คืนรายการ แต่ flow สร้างสินค้า, สร้างผู้ใช้, สร้าง/แก้รายการโมดูล และจัดการผู้ใช้ยังไม่มี alert ที่มองเห็นได้หรือเปลี่ยนหน้าทันที.

- หลังคำขอสำเร็จ ให้แสดง SuccessAlert ภาษาไทยใน flow ข้างต้น รวมถึงเพิ่มข้อมูลแม่สินค้าบนหน้าเพิ่มสินค้า.
- Flow ที่ต้องเปลี่ยน URL หลังสร้าง/ลบ/แก้รหัสพนักงาน ให้รอผู้ใช้ปิด alert ก่อนนำทาง เพื่อให้มองเห็นผลสำเร็จจริง.
- ผลล้มเหลวคงแสดง error ตามเดิมและห้ามเปิด SuccessAlert.
- คง props เดิมของ `SuccessAlertComponent` (`title`, `description`, `isOpen`, `onClose`, `showCloseButton`, `textButton`, `autoCloseDelay`) และปรับ animation/accessibility เฉพาะที่จำเป็น.
- ไม่เปลี่ยน endpoint, DB, RBAC หรือกฎธุรกิจ.

ตรวจรับ: หลัง create/update/delete/restore ที่สำเร็จเห็น alert และปิดได้; การนำทางเกิดหลังปิดใน flow ที่ระบุ; error ไม่แสดง alert; lint/type-check/build ผ่าน.
