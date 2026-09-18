import type { TypedSupabaseClient } from './index';

export async function registerDevice(
  client: TypedSupabaseClient,
  deviceId: string,
  businessId: string | null,
  platform: 'android' | 'ios' | 'web',
  appVersion: string,
) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { data: null, error: userError };

  const { data, error } = await client
    .from('devices')
    .upsert(
      {
        id: deviceId,
        profile_id: userData.user.id,
        business_id: businessId,
        platform,
        app_version: appVersion,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  return { data, error };
}
