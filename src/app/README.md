# จุดแก้แต่ละหน้าของ ZUU

แต่ละ URL มีโฟลเดอร์ของตัวเองใน `src/app` เช่น:

| URL | ดีไซน์หน้า | ข้อมูลตัวอย่าง |
|---|---|---|
| `/` Dashboard | `page.tsx`, `dashboard-page-content.tsx` | `data.ts` |
| `/customers` ลูกค้า | `customers/page.tsx` | `customers/data.ts` |
| `/customers/dashboard` | `customers/dashboard/page.tsx` | `customers/dashboard/data.ts` |
| `/customers/list` | `customers/list/page.tsx` | `customers/list/data.ts` |
| `/customers/groups` | `customers/groups/page.tsx` | `customers/groups/data.ts` |
| `/customers/territories` | `customers/territories/page.tsx` | `customers/territories/data.ts` |
| `/customers/documents` | `customers/documents/page.tsx` | `customers/documents/data.ts` |
| `/products` สินค้า | `products/page.tsx` | `products/data.ts` |
| `/stock-counts` ตรวจนับ | `stock-counts/page.tsx` | `stock-counts/data.ts` |
| `/suppliers` ผู้ขาย | `suppliers/page.tsx` | `suppliers/data.ts` |
| `/purchases` จัดซื้อ | `purchases/page.tsx` | `purchases/data.ts` |
| `/expenses` ค่าใช้จ่าย | `expenses/page.tsx` | `expenses/data.ts` |
| `/quotes` ใบเสนอราคา | `quotes/page.tsx` | `quotes/data.ts` |
| `/orders` คำสั่งซื้อ | `orders/page.tsx` | `orders/data.ts` |
| `/billing` วางบิล | `billing/page.tsx` | `billing/data.ts` |
| `/promotions` โปรโมชัน | `promotions/page.tsx` | `promotions/data.ts` |
| `/users` ผู้ใช้งาน | `users/page.tsx`, `users/users-page-content.tsx` | `users/data.ts` |
| `/reports/sales` รายงานยอดขาย | `reports/sales/page.tsx` | `reports/sales/data.ts` |
| `/reports/inventory` รายงานคลัง | `reports/inventory/page.tsx` | `reports/inventory/data.ts` |
| `/reports/finance` รายงานการเงิน | `reports/finance/page.tsx` | `reports/finance/data.ts` |
| `/audit-logs` ประวัติการทำรายการ | `audit-logs/page.tsx` | `audit-logs/data.ts` |
| `/settings` ตั้งค่า | `settings/page.tsx` | `settings/data.ts` |

เริ่มจาก `page.tsx` ของหน้านั้นเมื่อต้องการเพิ่มหรือแทนองค์ประกอบเฉพาะหน้า; แก้ข้อความ Tab, Filters, หัวคอลัมน์ และข้อมูลใน `data.ts`. หน้า list ทั้งหมดยังใช้ component ร่วม; การแก้ตารางหรือ Filter ใน component กลางจะกระทบทุกหน้า list. หากต้องการดีไซน์ต่างเฉพาะหน้า ให้แทน `<ModuleListPage>` ใน `page.tsx` ของหน้านั้นด้วย component เฉพาะหน้า.

- ดีไซน์รายการที่ทุกหน้าใช้ร่วมกัน: `src/components/pages/module-list-page.tsx`
- ดีไซน์ Sidebar: `src/components/layout/sidebar.tsx`
- ดีไซน์ Topbar: `src/components/layout/admin-shell.tsx`
- รายชื่อเมนู/URL: `src/config/navigation.ts`
- ตัวช่วยสร้างข้อมูลตัวอย่าง: `src/features/mock/mock-config.ts`

ข้อมูลยังเป็นตัวอย่างสำหรับนำเสนอ. การเพิ่มรายการในหน้าจออยู่ใน browser ชั่วคราวและหายเมื่อรีเฟรช.
