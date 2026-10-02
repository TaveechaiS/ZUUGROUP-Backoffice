import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const message =
    !configured || error === 'config'
      ? 'ยังไม่ได้ตั้งค่า Supabase Publishable key ใน .env.local กรุณาแจ้งผู้ดูแลระบบ'
      : error === 'required'
        ? 'กรุณากรอกอีเมลและรหัสผ่าน'
        : error === 'inactive'
          ? 'บัญชีนี้ยังไม่พร้อมใช้งาน กรุณาติดต่อ Admin'
          : error === 'temporary'
            ? 'ระบบเชื่อมต่อข้อมูลชั่วคราวไม่ได้ กรุณาลองเข้าสู่ระบบอีกครั้ง'
            : error
              ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
              : '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--blue-50)] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-7 shadow-lg">
        <p className="text-sm font-semibold text-[var(--blue-700)]">ZUUGROUP</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--ink-950)]">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-[var(--ink-700)]">ใช้บัญชีที่ Admin จัดเตรียมให้</p>
        {message && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}
        <form action={login} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-[var(--ink-950)]">
            อีเมล
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="h-11 rounded-lg border border-[var(--line)] px-3 outline-none focus:border-[var(--blue-700)]"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[var(--ink-950)]">
            รหัสผ่าน
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 rounded-lg border border-[var(--line)] px-3 outline-none focus:border-[var(--blue-700)]"
            />
          </label>
          <button
            disabled={!configured}
            className="mt-2 min-h-11 rounded-lg bg-[var(--blue-700)] px-4 font-semibold text-white hover:bg-[var(--blue-800)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="mt-5 text-xs text-[var(--ink-700)]">
          หากลืมรหัสผ่าน กรุณาติดต่อ Admin เพื่อกำหนดรหัสใหม่
        </p>
      </section>
    </main>
  );
}
