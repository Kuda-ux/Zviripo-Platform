import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type { Database, Tables, Inserts, Views } from './database.types.js';

export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

export function createSupabaseClient(url: string, anonymousKey: string) {
  return createClient<Database>(url, anonymousKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export * from './auth.js';
export * from './marketplace.js';
export * from './merchant.js';
export * from './device.js';
