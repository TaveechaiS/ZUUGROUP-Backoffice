# TASK-251 — วันหมดอายุเลือกปฏิทิน — 6 ตุลาคม 2569

เจ้าของให้วันหมดอายุใบอนุญาตเลือกวันที่ได้ด้วยicon. ใช้native dateinputและไอคอนปฏิทินของbrowser ไม่พบcalendarcomponentในrepo. แสดงวันที่เลือกในช่องเป็นพ.ศ.ด้วยIntl localeไทย/AsiaBangkok; machinevalueISOdateเก็บเฉพาะlocalstate.

IMPLEMENTED / WAITING_FOR_UAT: วันหมดอายุใช้datepreviewclientแล้ว scopedESLint/TypeScriptผ่าน. ไม่มีbrowserตรวจปฏิทินจริง/API/DB.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/customer-date-preview.tsx → page.tsxเลือกcomponentเฉพาะวันหมดอายุ → scopedlint/type → UAT. ไม่API/DB/required/กฎบล็อกใบอนุญาต.

⚠️ ต้องทดสอบโดยคุณ: เปิดหมวดใบอนุญาตกดiconปฏิทินวันหมดอายุ เลือกวันที่แล้วช่องแสดงวัน/เดือน/พ.ศ.; แก้/ล้างวันที่ได้. มือถือเปิดdatepickerของเครื่องและไม่ล้น. หน้าตาปฏิทินใช้localebrowserแต่ข้อความในช่องเป็นพ.ศ.
