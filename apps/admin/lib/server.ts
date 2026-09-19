import { createServiceClient } from '@comodities/database/server';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isServiceConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const adminSupabase = createServiceClient(
  supabaseUrl || 'https://unconfigured.supabase.local',
  serviceRoleKey || 'unconfigured-service-key',
);
