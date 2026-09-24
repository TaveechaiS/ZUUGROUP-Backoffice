import { APP_CONFIG } from '@/config/app';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 px-6 py-12">
      <p className="text-sm font-medium text-neutral-600">{APP_CONFIG.name} · ระบบหลังบ้าน</p>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">เตรียมระบบพื้นฐานแล้ว</h1>
      <p className="max-w-2xl text-base leading-7 text-neutral-700">
        โครงการเชื่อมต่อกับ Supabase Cloud สำหรับพัฒนา งานโมดูลและสิทธิ์ผู้ใช้จะเริ่มตาม Gate ในเอกสารโครงการ
      </p>
      <p className="text-sm text-neutral-600">เขตเวลา: {APP_CONFIG.timeZone}</p>
    </main>
  );
}
