# TASK-167 — รายการCombobox → ช่องเพิ่ม → ตาราง

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: selector staticSearchCombobox10kindและpanelเดียวkeykindพร้อม routeเปิดmanagerแล้ว. ESLint/diff/SSRcodeGroup+brandตรวจ1combobox/1form/1table ลำดับและcodeRequiredถูกผ่าน. ไม่รันDBmutation รอตรวจbrowser/CRUDจริง.

1. บันทึกACTIVE/Specs/Plan.
2. product-options-manager.tsxใช้SearchComboboxกลางสำหรับรายการ10kind ค้นได้/keyboardเดิม. panelเดียวkeykindรีเซ็ตform/query/pageเมื่อเปลี่ยน.
3. ช่องเพิ่มตามkind ตามด้วยค้นหา/ตารางเดิม. settings/product-options/page.tsxแสดงmanagerตามinitialKindเหมือนเดิม.
4. ตรวจlint/renderโครง1combobox/1form/1tableและลำดับ/diff.

ไฟล์: manager, routepage, ACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: เลือกรายการและค้นด้วยComboboxได้ ฟอร์มแสดงชื่อ/รหัสตรงkind ตารางเปลี่ยนตาม; เพิ่มแก้/เปิดปิดยังทำงานAPIเดิม. ลิงก์kind=brandเลือกยี่ห้อเริ่มต้น. คอม/มือถือไม่ล้น.
