# TASK-054 — เชื่อมค่า Supabase ใน `.env.local`

เจ้าของให้ Supabase URL, publishable key, secret key, JWKS URL และ metadata การเชื่อมต่อฐานข้อมูล พร้อมระบุว่าจะดูแลรหัสผ่านเอง. ห้ามบันทึกค่า key หรือรหัสผ่านในเอกสารและไฟล์ที่ติดตามโดย Git.

- จับคู่ `SUPABASE_URL` ที่เจ้าของให้กับ `NEXT_PUBLIC_SUPABASE_URL` ที่แอปใช้ และ `SUPABASE_PUBLISHABLE_KEY` กับ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `SUPABASE_SECRET_KEY` ใช้เฉพาะเซิร์ฟเวอร์; ห้ามเพิ่ม `NEXT_PUBLIC_` หรือส่งผ่าน browser HTTP client.
- เก็บ `SUPABASE_JWKS_URL` ใน `.env.local` เป็น metadata ที่เจ้าของให้; โค้ดปัจจุบันยังไม่ได้อ่านตัวแปรนี้.
- `DATABASE_URL` ใช้ pooler host/port/database/user ที่เจ้าของให้. รักษารหัสผ่านเดิมในไฟล์ ไม่แสดงหรือย้ายลงเอกสาร. หลังเจ้าของวางค่าใหม่ `DIRECT_URL` ไม่มีในไฟล์; Runtime Login ไม่อ่านค่านี้ แต่ Prisma migration ต้องใช้ direct connection string ที่เจ้าของจะนำจาก Supabase Dashboard มาใส่เองก่อนรัน.
- `.env.local` ต้องถูก ignore โดย Git. ไม่ยิงคำขอ Supabase หรือฐานข้อมูลในงานนี้.
