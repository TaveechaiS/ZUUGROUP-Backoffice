# จุดแก้แต่ละหน้าของ ZUU

ทุกหน้าเก็บข้อความ JSX state และฟังก์ชันเรียก API ใน page.tsx ของ route นั้นแล้ว (TASK-071) ไม่ใช้ components/pages หรือ import/re-export component ทั้งหน้าจากไฟล์อื่น

| หน้า | จุดแก้ |
|---|---|
| Dashboard | src/app/page.tsx |
| Orders รายการ | src/app/orders/page.tsx |
| Orders เพิ่ม | src/app/orders/create/page.tsx |
| Orders รายละเอียด/แก้/ลบ | src/app/orders/[id]/page.tsx |
| โมดูลอื่น | src/app/{ชื่อโมดูล}/page.tsx, create/page.tsx, [id]/page.tsx |
| ลูกค้าและกลุ่มย่อย | src/app/customers/**/page.tsx; ลูกค้ารายละเอียดใช้ [id] |
| สินค้า | src/app/products/page.tsx, create/page.tsx, [id]/page.tsx |
| ผู้ใช้ | src/app/users/page.tsx, create/page.tsx, [employeeCode]/page.tsx |
| ประวัติ | src/app/audit-logs/page.tsx |
| รายงาน | src/app/reports/{sales,inventory,finance}/page.tsx |

ไฟล์ layout.tsx ของ route เก็บการตรวจสิทธิ์และการอ่านข้อมูลเริ่มต้นที่ต้องอยู่บน server เท่านั้น ไม่ประกอบ UI ทั้งหน้า การแก้ field/คอลัมน์/label ให้แก้ใน page.tsx ที่ต้องการ

ชิ้นส่วนเล็กยังใช้ร่วมกัน: Pagination, SearchCombobox, StatusBadge, Loading, SuccessAlert, ConfirmationDialog และ HTTP transport แต่ endpoint/query/data flow อยู่ในหน้าแต่ละ route Combobox รับ options/callback และไม่โหลด API เอง

API handler อยู่ src/app/api/**/route.ts ตามเดิม types/api.ts และ types/api/* เก็บรูปร่าง request/response ไม่ใช่ endpoint; runtime validators อยู่ src/server/validation/* ห้ามย้าย Prisma/secret เข้า client หากเพิ่ม field จริงต้องแก้ Specs/API/DB ตามกติกา ดู [API-CONTRACTS](../../docs/API-CONTRACTS.md)

Alias /customers/list/create และ report create ที่เดิม redirect คง behavior เดิม

คู่มือพร้อมขั้นตอนตรวจ: [ROUTE-PAGES-GUIDE](../../docs/ROUTE-PAGES-GUIDE.md)

TASK-072 เกษียณ /design-preview และ placeholder เก่าที่ไม่มีจุดเรียกใช้แล้ว หน้าข้อมูลปัจจุบันอ่าน API/DB; modules.json เป็น definition ที่ server ใช้ ไม่ใช่แถวข้อมูล Mock

TASK-074: หน้าแต่ละ route ใช้ GET collection พร้อม include filters/config เฉพาะครั้งแรกหรือ reload; Combobox ใช้ view=options/status ใช้ view=filters; ลบ DELETE และกู้คืน PATCH action restore ดู API-CONTRACTS ไม่เปลี่ยน JSX/state/text ไปไว้หน้ากลาง
