import 'server-only';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRequiredEnv } from '@/lib/env';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies; session refresh belongs in the Proxy.
          }
        },
      },
    },
  );
}

// Login must finish the application account checks before sending session cookies.
export async function createSupabaseLoginClient() {
  const cookieStore = await cookies();
  const pending = new Map<string, { name: string; value: string; options: CookieOptions }>();
  const client = createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          const combined = new Map(cookieStore.getAll().map((cookie) => [cookie.name, cookie]));
          pending.forEach((cookie, name) => combined.set(name, cookie));
          return [...combined.values()];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => pending.set(cookie.name, cookie));
        },
      },
    },
  );
  return {
    client,
    commitCookies() {
      pending.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
    },
  };
}
