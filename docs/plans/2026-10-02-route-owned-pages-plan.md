# แผน TASK-071 — แยกโค้ดราย Route

สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติ 2026-10-02

งานต่อที่เจ้าของอนุมัติ `[id]`: เปลี่ยนโฟลเดอร์ customers/products → เปลี่ยน params ใน page/layout → ปรับ README/คู่มือ/test-route-pages → next typegen/type-check และ offline integrity ตรวจรับด้วย URL รายละเอียดเดิม ไม่แก้ schema/DB/API

ผล: ครบ54หน้าที่เคยใช้full-page components และserver auth/data layouts ตามจำเป็น ไม่มีcomponents/pagesแล้ว ชิ้นส่วนComboboxไม่เรียกAPI state/query/API functionsอยู่ในroute ใช้typeกลางเฉพาะresponse ไม่เพิ่มendpointเพราะข้อมูลเริ่มต้นspecialpageคงอ่านserverlayoutได้ ตรวจtype-check/lint/build/offline migration integrity+paginationผ่าน คู่มือROUTE-PAGES-GUIDEและsrc/app/READMEอัปเดตแล้ว รอUAT ไม่commit/push

ยืนยันจากตัวอย่าง: แต่ละ page.tsx มีข้อความ/JSX เฉพาะหน้าและฟังก์ชัน API/query/state ของตัวเอง ชิ้นส่วนเล็กและ service/http ยังใช้ร่วมกันได้ หลีกเลี่ยงการคัดลอก wrapper เดิมโดยคง registry กลางสร้างทุก field หรือ hook กลางซ่อน data flow ทั้งหน้า ฟอร์มย้ายเป็น JSX รายfieldใน route

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | ยืนยันขอบเขตชิ้นส่วนเล็กและรูปแบบหน้า orders เป็นตัวอย่าง | Specs/Plan/Task/ACTIVE | เจ้าของอนุมัติ Task |
| 2 | แยก Combobox/RelationName และชิ้นส่วน UI เล็กที่ใช้ซ้ำ | src/components/ui/*, src/service/* | ไม่ใช่ component ทั้งหน้า; คง keyboard/ARIA |
| 3 | ย้ายรายการทั่วไป18 URL จาก ModuleListPage ไปแต่ละ page.tsx | src/app/{customers และกลุ่มย่อย,suppliers,purchases,expenses,quotes,orders,promotions,billing,stock-counts,settings,reports/*}/page.tsx | JSX/state/API/filter/pagination อยู่ใน route แก้หน้าเดียวได้ |
| 4 | ย้าย create และ dynamic detail ของ14โมดูล | src/app/**/create/page.tsx, src/app/**/[id]/page.tsx, customers/[ref]/page.tsx และ auth layout เฉพาะ route | local form/edit/delete/restore เดิม สิทธิ์ไม่ลดลง |
| 5 | ย้ายหน้าเฉพาะ users/products/audit/dashboard เข้า page.tsx | src/app/users/**, products/**, audit-logs/*, app/page.tsx, server data layout/provider/API เท่าที่จำเป็น | คง initial data/role/notFound และ URL ตาม employeeCode/productCode |
| 6 | ลบ full-page component ที่ไม่มีผู้ใช้ และอัปเดตคู่มือแผนที่ไฟล์ | src/components/pages/*, old route content files, src/app/README.md, docs/* | ไม่เหลือ import/re-export ทั้งหน้าและ directory components/pages |
| 7 | ตรวจ regression static/contract และ UAT | tests script เฉพาะความเสี่ยง, Task/ACTIVE | type-check/lint/build/DB offline tests; เจ้าของลอง flows |

ใช้ Next.js client page สำหรับ interaction และ server layout/data boundary ตามจำเป็น มี auth guard ที่ API ทุก mutation คงเดิม ไม่ใช้ hooks ใน Server Component ไม่ย้าย DB/secret เข้า browser อ่าน local Next guides ก่อนแก้โค้ด

Alias /customers/list/create และ report create ที่เดิม redirect คง redirect ไม่สร้าง flow ใหม่ ไม่เปลี่ยน Sidebar/Topbar/StatusBadgeมาตรฐาน ไม่ commit/push โดยไม่ได้รับคำสั่ง
