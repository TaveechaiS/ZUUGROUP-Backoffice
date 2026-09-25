# แผนย่อย — TASK-029 เว็บ Mock สำหรับนำเสนอ (ทุกเมนู)

**วันที่:** 2026-09-25 (Asia/Bangkok)
**ขอบเขต:** ทำหน้าจอ Mock ครบตามเมนูหลักที่ยืนยัน เพื่อให้เจ้าของนำเสนอและตรวจพร้อมกัน; ไม่ต่อ Auth, DB, Storage หรือ API และไม่ถือว่า Gate ใดผ่าน.

## ลำดับงาน

1. บันทึกแนวทาง Mock เพื่อเสนอไว้ใน Specs §22.4 และลงทะเบียน TASK-029 ใน `tasks/ACTIVE.md`.
2. ทำเนื้อหา Mock สำหรับ Dashboard, ลูกค้าและเมนูรอง, สินค้า/คลัง, จัดซื้อ/ผู้ขาย/ค่าใช้จ่าย, งานขาย/จัดส่ง, การเงิน/โปรโมชัน/รายงาน และจัดการระบบ.
3. แสดงข้อมูลสมมุติที่ติดป้าย Mock; ใช้ search, tabs/filter และฟอร์มสาธิตตามความเหมาะสม; ทุก action อยู่ใน Browser และไม่เก็บข้อมูลหลัง refresh.
4. คงหน้า `/users` พร้อมตัวเลือกหนึ่ง Role ต่อคน; อย่าเพิ่ม Authorization จริง, Audit จริง หรือ Upload จริง.
5. จัด responsive layout/empty states และตรวจ diff/lint/type โดยไม่เรียก backend และไม่เพิ่ม Migration/API.
6. ส่งเว็บ Mock ทั้งชุดให้เจ้าของตรวจพร้อมกัน; ปิด Task หลังเจ้าของอนุมัติภาพรวม.

### ปรับตามภาพอ้างอิง 2026-09-25

1. เอา Page header ชื่อหน้า/คำอธิบายออกจากหน้ารายการ; ย้ายปุ่มหลักไปขวาของแถว Search/Filter ใต้ Tab bar.
2. เอา KPI cards ออกจากทุกหน้ารายการ; เก็บ KPI ไว้เฉพาะ Dashboard.
3. จัดลำดับ Tab → Filter → ตารางเส้นคั่นกระชับ → Pagination → Export ให้ตรงภาพ; เนื้อหา responsive.

### เก็บรายละเอียดภาพอีกครั้ง

1. ใช้หน้าลูกค้าเป็นแม่แบบ: Tab ข้อความเรียบพร้อมเส้นใต้สีน้ำเงินของรายการที่เลือก ไม่มีจำนวนหรือป้ายอื่นในแถบ.
2. แถว Filter แสดง label เล็กเหนือช่อง, ช่อง Search และ Select ทรงเหลี่ยมขอบบาง, ปุ่มเพิ่มอยู่ขวาสุดและสูงเท่าช่อง.
3. ตาราง Desktop มี 7 คอลัมน์ตามข้อมูลของหน้า, หัวตารางพื้นอ่อน, หนึ่งบรรทัดต่อเซลล์, 10 แถวต่อหน้า; Footer แสดงจำนวนและตัวเลขหน้า, ปุ่ม Export อยู่มุมซ้ายใต้ตาราง.
4. ปรับหน้าผู้ใช้งานและหน้าอื่นให้ใช้จังหวะ ระยะ และสีเดียวกัน; Mobile เปลี่ยนเป็นรายการอ่านง่าย.
5. ตรวจ lint, type-check, build และภาพหน้าจอหาก Browser ใช้งานได้ จากนั้นส่งทุกหน้าให้เจ้าของตรวจพร้อมกัน.

### ถอด Sidebar ย่อยลูกค้าก่อนแตกหน้า

1. ถอดการแสดง Sidebar ย่อยลูกค้าจาก App Shell และลบ component/รายการนำทางที่ไม่ใช้; เก็บ route Mock ย่อยเดิมไว้ชั่วคราว.
2. ให้หน้า `/customers` ใช้พื้นที่หลักเต็มโดยไม่เปลี่ยน Tab, Filter, ตาราง หรือ Sidebar หลัก.
3. ตรวจภาพ Desktop/Mobile ว่าไม่มีแถบเมนูย่อยและเนื้อหาไม่ถูกบีบ; ตรวจ lint/type-check/build แล้วส่งให้เจ้าของตรวจ.

**ผลลัพธ์:** หน้าลูกค้า Mock หนึ่งหน้าหลักโดยยังไม่มี Sidebar ย่อย; รูปแบบการแตกหน้าใหม่รอคำสั่งครั้งถัดไป.
**ไฟล์รอบนี้:** `src/components/layout/admin-shell.tsx`, `src/components/layout/sidebar.tsx`, `src/config/navigation.ts`, Specs, Plan, Task และ Handoff.
**ตรวจรับ:** เปิด `/customers` แล้วเห็น Topbar → Tab → Filter → ตาราง โดยไม่มี Sidebar ย่อยทั้ง Desktop/Mobile; เมนูหลักลูกค้ายังเปิดหน้าเดิมได้.

### ปรับขนาด Body หน้าลูกค้าตามไฟล์ตัวอย่าง

1. คง Topbar และหน้าอื่นไว้เหมือนเดิม; เปลี่ยนเฉพาะ spacing/size ใน `/customers`.
2. ใช้ Tab-area padding 24px, Tab text 14px และ bottom spacing 16px; Filter card padding 24px กับ gap ระหว่างช่อง 20px.
3. เว้น 24px ก่อนตาราง; ใช้หัวตาราง 12px × 14px, แถวข้อมูล 16px × 14px และ Pagination vertical padding 20px ตามตัวอย่าง.
4. ตรวจภาพ Desktop/Mobile และตรวจ lint/type-check/build.

**ผลลัพธ์:** หน้า `/customers` ใช้ขนาด Body ตามตัวอย่าง โดย Topbar ไม่เปลี่ยน.
**ไฟล์รอบนี้:** `src/features/mock/mock-module-page.tsx`, Specs, Plan, Task, `tasks/ACTIVE.md`, Handoff.
**ตรวจรับ:** หน้าลูกค้ามีระยะ Tab/Filter/Table ที่กว้างขึ้น; หน้าผู้ใช้งาน/สินค้าและ Topbar ยังมีขนาดเดิม.

### แยกข้อมูล Mock เป็นโฟลเดอร์ราย route

1. ย้าย config และ rows ของแต่ละ route ไป `src/features/mock/pages/<route>/data.ts` โดยรักษาข้อมูลและพฤติกรรมเดิม.
2. ย้าย type/helper ที่ใช้ร่วมกันไปไฟล์กลาง และให้ `mock-data.ts` เป็น registry รวม รวมถึง re-export ข้อมูล Dashboard.
3. คง `mock-module-page.tsx` เป็น shared renderer; ไม่สร้างโครง UI หรือ page component ซ้ำแต่ละ route.
4. ตรวจว่า route/config ไม่ตกหล่น แล้วรัน lint/type-check/build.

**ผลลัพธ์:** แก้ข้อมูลของหน้าใดได้ในโฟลเดอร์ของหน้านั้น โดยไม่แก้ข้อมูลหน้าอื่น.
**ไฟล์รอบนี้:** `src/features/mock/mock-data.ts`, `src/features/mock/mock-config.ts`, `src/features/mock/pages/**/data.ts`, `src/features/mock/pages/README.md`, Specs, Plan, Task, `tasks/ACTIVE.md`, Handoff.
**ตรวจรับ:** registry มี route ครบ; แต่ละ `data.ts` มี config ของ route เดียว; Dashboard มีโฟลเดอร์ข้อมูลของตน; หน้าเว็บใช้ข้อมูลและแสดงผลเหมือนเดิม.

## ไฟล์ที่จะเปลี่ยน

- `src/app/page.tsx`
- `src/app/[...segments]/page.tsx`
- `src/features/users/users-management-mock.tsx`
- `src/features/mock/mock-module-page.tsx` (สร้างใหม่)
- `src/features/mock/mock-data.ts` (สร้างใหม่)
- `docs/specs/2026-09-23-1550-project-specs.md`
- `docs/plans/2026-09-23-1635-project-plan.md`
- `docs/plans/2026-09-25-users-management-mock-plan.md`
- `docs/HANDOFF.md`, `tasks/ACTIVE.md`, `tasks/TASK-029-users-management-mock.md`, `tasks/COMPLETED.md`

## เงื่อนไขตรวจรับ

- ทุกเส้นทางใน `ADMIN_PAGES` แสดงหน้าจอที่เกี่ยวข้องแทน placeholder; Dashboard และรายการโมดูลพอแสดงภาพรวมให้ผู้ใช้เสนอได้.
- `/users` มีค้นหา, กรองสถานะ/Role และแบบฟอร์มสาธิต; Role หนึ่งรายการต่อผู้ใช้.
- หน้าจอ/ข้อมูลตัวอย่างระบุชัดว่าเป็น “ข้อมูลจำลอง”; การบันทึกเปลี่ยนเฉพาะ state ชั่วคราวใน Browser.
- เลือก Role ได้หนึ่งค่าเท่านั้น; ไม่ทำ Auth, RBAC จริง, API, DB, upload, notification หรือ credential persistence.
- ภาษาไทยและรูปแบบ responsive ใช้ Tailwind utility ใน `className` ตามข้อกำหนด UI.
- Task อยู่ `READY_FOR_USER_TEST` จนกว่าเจ้าของตรวจหน้าและยืนยัน.
- หน้ารายการไม่มี Page header หรือ KPI cards; Dashboard คง KPI; มี Pagination และ Export ตามแบบอ้างอิง.
