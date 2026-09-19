import { createSupabaseClient } from '@comodities/database';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createSupabaseClient(
  supabaseUrl || 'https://unconfigured.supabase.local',
  supabaseAnonKey || 'unconfigured-anon-key',
);
