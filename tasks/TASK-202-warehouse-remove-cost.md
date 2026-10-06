# TASK-202 — เอาราคาต้นทุนออกจากตารางคลัง

สถานะ: COMPLETED

1. ACTIVE/Specs/Plan.
2. src/app/products/page.tsx และstock/[warehouse]/page.tsx ถอน headerราคาต้นทุน/cell—/mappingnullตำแหน่ง5. คงราคาขายและจำนวนสต็อกถัดกัน.
3. scoped lint/type และตรวจheaders/cells/sortkeysจำนวนเท่ากันทั้งroot/MAIN/MARKETING/DISPOSAL. ไม่แก้ตารางล็อตหรือAPI/DB.

ผล: ลบ3จุดใน2pageแล้ว ESLint/TypeScript/diffผ่าน; mockroot/MAIN/MARKETING8คอลัมน์และDISPOSAL7 header/cell/sortจำนวนตรง ราคาขายตามด้วยจำนวนสต็อก และไม่มีราคาต้นทุน. คงตารางล็อต ไม่ DBwrite.
