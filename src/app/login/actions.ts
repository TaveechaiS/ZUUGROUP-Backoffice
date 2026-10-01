'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPrismaClient, isClosedDatabaseConnection, readWithConnectionRetry } from '@/server/db/prisma';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/login?error=required');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect('/login?error=config');
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect('/login?error=invalid');

  let account;
  try {
    account = await readWithConnectionRetry((prisma) => prisma.authAccount.findUnique({
      where: { provider_providerUserId: { provider: 'supabase', providerUserId: data.user.id } },
      include: { user: { include: { userRole: true } } },
    }));
  } catch (caught) {
    if (!isClosedDatabaseConnection(caught)) throw caught;
    await supabase.auth.signOut();
    redirect('/login?error=temporary');
  }
  if (!account || account.user.deletedAt || account.user.status !== 'ACTIVE' || !account.user.userRole) {
    await supabase.auth.signOut();
    redirect('/login?error=inactive');
  }
  await getPrismaClient().user.update({
    where: { id: account.userId }, data: { lastLoginAt: new Date() },
  });
  redirect('/');
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
