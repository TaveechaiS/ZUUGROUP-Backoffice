# แผนย่อย TASK-064 — คงดีไซน์ pagination และเปลี่ยนแหล่งข้อมูลเป็น API

สถานะ READY_FOR_USER_TEST; เจ้าของอนุมัติ 2026-10-02 หลังผลตรวจให้ดำเนิน TASK-064 ตามแผนนี้

ผล: ทำ API/query/client/filter/CSV/clamp/Postman local ครบแล้ว เพิ่ม hook use-paginated-list และ UI loading/pagination กลางตามดีไซน์เดิม ตรวจ offline query contract/type-check/lint/build ผ่าน รอ UAT ไม่แก้ DB/schema/seed ไม่ทดสอบ live HTTP ไม่ commit/push

| ขั้น | ผลลัพธ์ | ไฟล์หลัก | ตรวจรับ |
|---|---|---|---|
| 1 | ยืนยัน contract/สิทธิ์/ดีไซน์เดิม | Specs/Plan/Task/ACTIVE | เจ้าของอนุมัติ |
| 2 | pagination input และ query users/products | src/server/pagination.ts, users/service.ts, products/service.ts, public-service.ts, api/users/route.ts, api/products/route.ts, products/filters/route.ts, users/export/route.ts | skip/take/count+filter, validation, Admin deleted/CSV |
| 3 | Audit API และ filters | audit-logs/service.ts, api/audit-logs/route.ts, filters/route.ts | ไม่เปิด rawJSON, Admin เท่านั้น, default10 |
| 4 | เชื่อมหน้าเข้ากับ API และใช้ pagination เดิม | app/users/page.tsx/users-list-content.tsx, products/page.tsx/products-list.tsx, audit-logs/page.tsx/audit-list.tsx, components/pages/module-list-page.tsx | ไม่มี full-list props/slice, filter reset1, cancel stale, overflowหน้า |
| 5 | คู่มือและ Collection local | docs/API-NAME-GUIDE.md, postman/*, docs/TEST-API-PAGINATION.md | queryตรงendpoint, ไม่มีsecret |
| 6 | static checks/focused tests และ UAT | Task/ACTIVE | lint/type-check/build และเจ้าของ Network/UAT |

อ่าน local Next.js guide/ACTIVE ก่อนโค้ด. ไม่เพิ่ม design/library หรือ migration. อย่าไล่แก้ทุก component ที่มีปุ่มก่อนหน้าเมื่อเป็น form select ที่มี API pagination อยู่แล้ว.
