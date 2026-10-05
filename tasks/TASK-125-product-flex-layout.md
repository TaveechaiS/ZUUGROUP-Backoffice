# TASK-125 — Flex ฟอร์มสินค้าเต็มกรอบ

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569. ปรับ w-full ไม่มี max-width และใช้ flex-wrap/basis แล้ว. ESLint/diff whitespace ผ่าน. ยังไม่ตรวจภาพหลัง login; คงช่อง/Combobox/required/พฤติกรรมเดิม ไม่ commit/deploy.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan → product-create-preview.tsx ลบ max-width/จัดกลาง เปลี่ยน grid เป็น flex-wrap; basis-full มือถือ/textarea และครึ่งพื้นที่หัก gap สำหรับช่องทั่วไปบนคอม → ESLint/diff. ผลลัพธ์ฟอร์มเต็มพื้นที่เนื้อหาและปรับตาม Side หลัก โดยคงช่องและพฤติกรรมเดิม.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดเพิ่มสินค้า ขยายหน้าต่างและย่อ/ขยาย Side หลัก ฟอร์มต้องเต็มพื้นที่ภายใน padding ช่องทั่วไปเรียง 2 คอลัมน์ ช่องรายละเอียดเต็มแถว. มือถือเรียงหนึ่งคอลัมน์ ไม่มีเลื่อนแนวนอนจากฟอร์ม.
