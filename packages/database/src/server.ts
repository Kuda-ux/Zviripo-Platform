import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type { Database, Tables, Inserts } from './database.types.js';

export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

export function createServiceClient(url: string, serviceRoleKey: string) {
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
