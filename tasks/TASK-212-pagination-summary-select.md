# TASK-212 — Combobox แทนเลขแรกของข้อความ Pagination

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

ย้ายselectแทนเลขแรกเรียบร้อย. ESLint/diff/Paginationcontrols/actualstockpageVMผ่าน; ไม่API/DB/handlerchanges.

1. เปลี่ยนsummaryของpagination-controls.tsxให้“แสดง [select] จาก total รายการ” ในlabelเดียว.
2. คงselectvaluepageSize/options/aria-label/id/disabled/onChange10-20-50-100. ไม่มีhandlerใช้countเป็นเลขข้อความ.
3. ESLint/diff/ทดสอบPaginationcontrolsและactualpageเดิม. UATเลือก20ในข้อความเปลี่ยนเป็นแสดง[20]จากtotalรายการและกลับหน้า1ตามเดิม.
