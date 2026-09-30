import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPrismaClient } from '@/server/db/prisma';

export const getCurrentUser = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const account = await getPrismaClient().authAccount.findUnique({
    where: {
      provider_providerUserId: { provider: 'supabase', providerUserId: data.user.id },
    },
    include: { user: { include: { userRole: { include: { role: true } } } } },
  });
  if (!account || account.user.deletedAt || account.user.status !== 'ACTIVE' || !account.user.userRole) return null;
  return account.user;
});

export async function requireActiveUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  const user = await requireActiveUser();
  if (user.userRole?.roleId !== 'ADMIN') redirect('/');
  return user;
}
