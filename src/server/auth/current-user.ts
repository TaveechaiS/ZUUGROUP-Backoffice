import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { canSeePage } from '@/config/access';

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

export const getCurrentUser = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return findActiveUser(data.user.id);
});

export async function getCurrentApiUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization === null) return getCurrentUser();
  const token = /^Bearer ([^\s]+)$/i.exec(authorization)?.[1];
  if (
    !token ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
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
