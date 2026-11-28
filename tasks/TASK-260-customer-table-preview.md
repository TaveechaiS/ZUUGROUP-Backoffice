# TASK-260 — ตารางลูกค้า — 6 ตุลาคม 2569

เจ้าของอนุมัติข้อเสนอตาราง: 6คอลัมน์รหัส/ชื่อบริษัทและจังหวัด/ผู้ติดต่อและเบอร์/สถานะใบอนุญาตพร้อมวันหมดอายุ/เครดิตและวงเงิน/เขต. ใช้componentsกลางตามคำขอ.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → backup customers/page.tsxเดิมไว้local-backups/TASK-260-customers-list-before.tsx → customers/page.tsxUItext5ตัวอย่างPHA/CLN/HOS/WSL/GOVพร้อมค้นหาclient/SortableTable/PaginationControls/StatusBadge/NotFound → lint/type/route → UAT. หัวสถานะใช้สถานะscopecolตามAGENTS14.

หน้าเดิมอ่านAPIlegacyแต่ยังไม่มีfieldsใหม่ครบ รอบนี้previewตามworkflow234หยุดGET/mutationในหน้ารายการเฉพาะ ไม่ลบหรือเปลี่ยนDB/API. ตัวอย่างชื่อ/ติดต่อ/วงเงิน/เขตชัดเจนไม่ใช่ข้อมูลจริง. กฎสถานะใบอนุญาตยังOPENใช้badgeยังไม่ระบุ/วันหมด— ไม่มีexpirylogic. No fakeLoadingบนstaticpreviewตามDATA-STATES-GUIDE; ขั้นเชื่อมใช้Loadingกลาง. ไม่เปิดIDปลอม; การกดแถวเข้าIDทำขั้นรายละเอียด/เชื่อมจริงตามworkflow.

⚠️ ต้องทดสอบโดยคุณ: เปิด /customers มี6คอลัมน์ จังหวัดใต้ชื่อ เบอร์ใต้ผู้ติดต่อ เครดิตและวงเงินในช่องเดียว. กดหัวตารางเรียง/ค้นรหัสชื่อจังหวัดเบอร์เขตได้ ค้นไม่พบแสดงNotFoundกลาง และปุ่มเพิ่มเข้าหน้าcreate. มือถือตารางเลื่อนแนวนอนได้. ข้อมูลเป็นตัวอย่างและไม่บันทึกจริง.
