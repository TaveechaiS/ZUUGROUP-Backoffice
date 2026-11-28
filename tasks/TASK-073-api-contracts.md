# TASK-073 — API types/validation/Postman

- สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติเอกสารและสั่งเริ่ม TASK-073 2026-10-02 พักงาน Deploy
- Branch: AI
- Specs: docs/specs/2026-10-02-api-contracts.md
- Plan: docs/plans/2026-10-02-api-contracts-plan.md
- เจ้าของตกลงทิศทาง “ok”; รายละเอียดข้อมูล/สิทธิ์/ตัวกรองใหม่รอข้อมูลจริง

ขอบเขต: ย้าย response/request types, แยก pure validators เดิม, บันทึกcontract และแก้collections localให้ตรง คง endpoint/response/behavior/Auth/RBAC/DB

ผล implementation: สร้าง src/types/api/* 6กลุ่มและshared envelopes/types; pure validators10ไฟล์ใน src/server/validation; clientไม่ infer typeจากserverserviceและใช้response typesกลาง คงpagesแยก/URL/response/RBAC/DB สร้าง docs/API-CONTRACTS.md พร้อมroute inventory ปรับCollections local167+29คำขอ เพิ่ม12write requestsตามhandlerเดิมและตัวอย่างempty response ไม่ยิง live API/login ไม่ syncCloud ไม่commit/push

ตรวจ: type-check/buildผ่าน offline API contracts191app requests/validators/type-only, pagination และ59page integrityผ่าน เทียบ39validation outcomesกับก่อนย้ายตรง full lint0errors พบ14type warningsแล้วลบimportและตรวจcreate pagesซ้ำไม่มีwarning diffผ่าน ไม่มีschema/migration/DBเปลี่ยน

ข้อจำกัดเดิมที่คงไว้: malformed null body ในบางrouteยังตอบgeneric failure และquery conversionต่างกันตามกลุ่ม ไม่เปลี่ยนbehaviorเพื่อ refactor รายละเอียดใน API-CONTRACTS.md

⚠️ ต้องทดสอบโดยคุณหลัง implementation: หน้าเดิมและ Postman GET/pagination/validation ต้องให้ผลเหมือนเดิม ใช้ขั้นตอนในแผนย่อย
