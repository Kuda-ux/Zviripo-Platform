import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export * from './database.types';
export type { Session, User } from '@supabase/supabase-js';

export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

export function createSupabaseClient(url: string, anonymousKey: string) {
  return createClient<Database>(url, anonymousKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export * from './auth';
export * from './marketplace';
export * from './merchant';
export * from './device';
