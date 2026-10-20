import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { isAuthRetryableFetchError, isAuthSessionMissingError } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { canSeePage } from '@/config/access';
import { isSessionExpired } from '@/lib/auth/session-expiry';

async function findActiveUser(providerUserId: string) {
  const account = await readWithConnectionRetry((prisma) =>
    prisma.authAccount.findUnique({
      where: { provider_providerUserId: { provider: 'supabase', providerUserId } },
      include: { user: { include: { userRole: { include: { role: true } } } } },
    }),
  );
  if (
    !account ||
    account.user.deletedAt ||
    account.user.status !== 'ACTIVE' ||
    !account.user.userRole
  )
    return null;
  return account.user;
}

const unavailable = (error: { status?: number } | null) =>
  !!error && (isAuthRetryableFetchError(error) || (error.status ?? 0) >= 500);

const readSessionUser = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { user: null, unavailable: false };
  }
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase.auth.getUser();
  if (unavailable(error)) ({ data, error } = await supabase.auth.getUser());
  if (error && !isAuthSessionMissingError(error))
    console.warn('getCurrentUser failed', error.name, error.status, error.code);
  if (error || !data.user) return { user: null, unavailable: unavailable(error) };
  if (isSessionExpired((await supabase.auth.getSession()).data.session?.access_token))
    return { user: null, unavailable: false };
  return { user: await findActiveUser(data.user.id), unavailable: false };
});

export const getCurrentUser = cache(async () => (await readSessionUser()).user);

export async function getCurrentApiUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization === null) {
    const session = await readSessionUser();
    if (session.unavailable) throw new Error('AUTH_UNAVAILABLE');
    return session.user;
  }
  const token = /^Bearer ([^\s]+)$/i.exec(authorization)?.[1];
  if (
    !token ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (unavailable(error)) throw new Error('AUTH_UNAVAILABLE');
  if (error || !data.user || isSessionExpired(token)) return null;
  return findActiveUser(data.user.id);
}

export async function requireActiveUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requirePage(href: string) {
  const user = await requireActiveUser();
  if (!canSeePage(href, user.userRole?.roleId ?? '')) redirect('/');
  return user;
}

export async function requireAdmin() {
  const user = await requireActiveUser();
  if (user.userRole?.roleId !== 'ADMIN') redirect('/');
  return user;
}
