# TASK-191 — IDแบบตัวอักษร-ปี-เลข

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/PlanบันทึกGRreadonly/yearBEreadonly/เลข1–99999แก้ได้pad5.
2. operations/service.tshelperprefixBangkokyear ใช้nextmax5digitsในปีปัจจุบัน เฉพาะAdmin รับใหม่validateprefix+year+serial; คงretrycompleteก่อนvalidate/unique.
3. stock/create/page.tsxสามช่องอยู่ในcodefieldเดิม เปลี่ยนเลขประกอบfullcode ไม่แก้prefix/year. prepareส่งcanonicalpad5; nextโหลดครั้งแรกคงmanualเมื่อretry.
4. scripts/test-linked-operations.mjsfixtureใช้nextReceiptCodeสองครั้ง รับcodeรูปแบบใหม่; readfixturebyreceiptId. ไม่รันscriptกับDBจริงรอบนี้.
5. MocknextBEyear/pad/manual/editable/invalidprefix/year/seq/contractretry; lint/type/diff. ไม่DBwrite/schema.

⚠️ ต้องทดสอบโดยคุณ: เปิดเพิ่มสต็อกIDเป็นGR-2569-00001หรือเลขถัดไป GR/ปีแก้ไม่ได้ เปลี่ยนเลขเช่น12ต้องเป็นGR-2569-00012หลังออกช่องและบันทึก. เลขซ้ำแจ้งแก้ใหม่ได้.

ผลตรวจ: scoped ESLint และ TypeScript ผ่าน. Mock ฟอร์มผ่าน readonly GR/ปี, แก้เลขและ pad5, validation, confirmation/cancel, retry ด้วย idempotency key เดิม. Mock service ผ่านปี Bangkok วันที่ UTC 31 ธ.ค. ซึ่งเข้า 1 ม.ค. เป็น พ.ศ. 2570, query แยก prefix ปี, next 00001/00016, overflow 409, prefix/year/sequence ผิด 400. ไม่รัน integration กับ DB จริง ไม่เขียน DB และยังไม่ได้ตรวจเบราว์เซอร์.
