import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, anonymousKey: string) {
  return createClient(url, anonymousKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
