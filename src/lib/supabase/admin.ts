import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from '@/lib/env';

export function hasSupabaseAdminKey(): boolean {
  return Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('ยังไม่ได้กำหนด SUPABASE_SECRET_KEY หรือ SUPABASE_SERVICE_ROLE_KEY');

  return createClient(getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
