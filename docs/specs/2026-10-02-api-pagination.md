# TASK-064 — ทุกหน้ารายการแบ่งหน้าผ่าน API

สถานะ: อนุมัติ 2026-10-02 จากคำสั่ง “ทำ” หลังผลตรวจ. เจ้าของขอ pagination ผ่าน API และให้ใช้ design ที่มีแล้ว.

- ทุกหน้ารายการหลักดึงครั้งละ 10 รายการ; API รับ limit (default10/max50) และ offset (default0,0..100000), ตรวจเลขจำนวนเต็ม; คืนจำนวนทั้งหมดตรง filter พร้อมข้อมูลหน้า.
- products/users เปลี่ยนจากโหลดทั้งหมดแล้ว slice/filter ที่ client เป็น GET API ฝั่ง DB. เก็บ response users/products เดิมและเพิ่ม pagination {page,pageSize,total,totalPages,offset,limit}. แท็บ current/deleted, search/status/role/category ทำฝั่ง DB; deleted products และ users/audit คงสิทธิ์เดิม.
- Audit Logs เปลี่ยนจาก Server Component เรียก service ตรงเป็น Client เรียก GET /api/audit-logs; แยก actions filter GET /api/audit-logs/filters; ใช้วันที่ พ.ศ./Asia/Bangkok เดิมและไม่เพิ่ม raw audit JSON.
- 14 โมดูลและรายงานมี GET DB pagination10 แล้ว; ตรวจการรีเซ็ตหน้าและ stale request. คง response contract/filters เดิม, ป้องกันหน้าค้างเกินจำนวนหน้าหลังข้อมูลลดลง.
- public products/masters ค่าเริ่มต้น20เปลี่ยน10; คงข้อมูลสาธารณะที่อนุมัติ ไม่เปิดข้อมูล users/audit.
- ใช้ pagination markup/className เดิมของแต่ละหน้า. สินค้าใช้ชุดปุ่มที่มีในรายการรายโมดูล; ไม่ออกแบบใหม่. ใช้ service/http.ts, AbortSignal, debounce และ loading/error เดิม; หน้าใหม่ไม่โหลดทั้งหมดจาก server แล้วส่งลง client.
- GET sort คงที่ เช่น createdAt DESC,id DESC. count/list ใน transaction เดียวเพื่อ total ตรงรายการขณะอ่าน.
- CSV ผู้ใช้ยังส่งออกทั้งหมดตาม filter เดิมผ่าน GET /api/users/export แยกจาก API pagination; Admin เท่านั้นและหนี CSV formula เดิม. ปุ่มส่งออกไม่แอบเปลี่ยนเป็นส่งเฉพาะหน้า.
- ไม่แก้ schema/seed/auth rules หรือทำ pagination ให้ฟอร์มรายละเอียด/Dashboard cards ที่ไม่ใช่รายการเต็ม. คงฟังก์ชัน listUsers/listProducts เดิมเมื่อมีผู้ใช้ภายในอื่นจนตรวจ usage ครบ.
- เก็บคู่มือ/Collection local ให้ตรง query/response; ไม่ push Cloud Postman หรือ Git ใน Task นี้.

ตรวจรับ: หน้า1สิบ/หน้า2ห้าเมื่อมี15; Network โหลดเฉพาะหน้า, filter/resetpage1, deleted/statusroleถูกต้อง, countตรงDB, empty/error, keyboardปุ่มเดิม, CSVเต็มตาม filter, unauthorized401/403. Static checks และ focused query tests ที่ไม่แก้ DB; ไม่ยิง live HTTP/ล็อกอินอัตโนมัติตามคำสั่งเดิม.
