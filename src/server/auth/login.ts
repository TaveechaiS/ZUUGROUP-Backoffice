import 'server-only';

import { createSupabaseLoginClient } from '@/lib/supabase/server';
import {
  getPrismaClient,
  isClosedDatabaseConnection,
  readWithConnectionRetry,
} from '@/server/db/prisma';

import type { LoginResult } from '@/types/api/auth';

export async function signIn(email: string, password: string): Promise<LoginResult> {
  if (!email.trim() || !password) {
    return { ok: false, status: 400, code: 'required', error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return {
      ok: false,
      status: 503,
      code: 'config',
      error: 'ระบบเข้าสู่ระบบยังไม่พร้อมใช้งาน กรุณาแจ้งผู้ดูแลระบบ',
    };
  }

  const { client: supabase, commitCookies } = await createSupabaseLoginClient();
  let auth;
  try {
    auth = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  } catch {
    return {
      ok: false,
      status: 503,
      code: 'temporary',
      error: 'เชื่อมต่อระบบเข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง',
    };
  }
  if (auth.error || !auth.data.user) {
    if (auth.error?.status === 429) {
      return {
        ok: false,
        status: 429,
        code: 'temporary',
        error: 'เข้าสู่ระบบถี่เกินไป กรุณารอสักครู่แล้วลองอีกครั้ง',
      };
    }
    if (
      auth.error &&
      (auth.error.status === 0 || (auth.error.status && auth.error.status >= 500))
    ) {
      return {
        ok: false,
        status: 503,
        code: 'temporary',
        error: 'ระบบเข้าสู่ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองอีกครั้ง',
      };
    }
    return { ok: false, status: 401, code: 'invalid', error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  }
  if (!auth.data.session?.access_token) {
    return {
      ok: false,
      status: 503,
      code: 'temporary',
      error: 'ระบบเข้าสู่ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองอีกครั้ง',
    };
  }

  // Reject the newly created session locally; other devices keep their sessions.
  const rejectSession = async () => {
    // Cookies stay staged even if Auth is temporarily unreachable during cleanup.
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* no cookies committed */
    }
  };
  let phase: 'account_lookup' | 'last_login_update' = 'account_lookup';
  try {
    const account = await readWithConnectionRetry((prisma) =>
      prisma.authAccount.findUnique({
        where: {
          provider_providerUserId: { provider: 'supabase', providerUserId: auth.data.user!.id },
        },
        include: { user: { include: { userRole: true } } },
      }),
    );
    if (
      !account ||
      account.user.deletedAt ||
      account.user.status !== 'ACTIVE' ||
      !account.user.userRole
    ) {
      await rejectSession();
      return {
        ok: false,
        status: 403,
        code: 'inactive',
        error: 'บัญชีนี้ยังไม่พร้อมใช้งาน กรุณาติดต่อ Admin',
      };
    }
    phase = 'last_login_update';
    const lastLoginAt = new Date();
    const updateLastLogin = () =>
      getPrismaClient().user.update({
        where: { id: account.userId },
        data: { lastLoginAt },
      });
    try {
      await updateLastLogin();
    } catch (error) {
      if (!isClosedDatabaseConnection(error)) throw error;
      await updateLastLogin();
    }
    commitCookies();
    return {
      ok: true,
      user: {
        id: account.user.id,
        name: account.user.name,
        employeeCode: account.user.employeeCode,
        roleId: account.user.userRole.roleId,
      },
      accessToken: auth.data.session.access_token,
      tokenType: 'Bearer',
      expiresIn: auth.data.session.expires_in,
    };
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : 'UNKNOWN';
    console.error('Login persistence failed', { phase, code });
    await rejectSession();
    return {
      ok: false,
      status: 503,
      code: 'temporary',
      error: 'ระบบเชื่อมต่อข้อมูลชั่วคราวไม่ได้ กรุณาลองเข้าสู่ระบบอีกครั้ง',
    };
  }
}
