import type { TypedSupabaseClient } from './index.js';

export async function signUpWithEmail(
  client: TypedSupabaseClient,
  email: string,
  password: string,
  metadata: { display_name?: string; phone?: string } = {},
) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  return { data, error };
}

export async function signInWithEmail(
  client: TypedSupabaseClient,
  email: string,
  password: string,
) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithPhone(
  client: TypedSupabaseClient,
  phone: string,
  options?: { channel?: 'sms' | 'whatsapp' },
) {
  const { data, error } = await client.auth.signInWithOtp({
    phone,
    options,
  });
  return { data, error };
}

export async function verifyPhoneOtp(client: TypedSupabaseClient, phone: string, token: string) {
  const { data, error } = await client.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  return { data, error };
}

export async function signOut(client: TypedSupabaseClient) {
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getSession(client: TypedSupabaseClient) {
  const { data, error } = await client.auth.getSession();
  return { session: data.session, error };
}

export async function getUser(client: TypedSupabaseClient) {
  const { data, error } = await client.auth.getUser();
  return { user: data.user, error };
}

export function onAuthStateChange(
  client: TypedSupabaseClient,
  callback: (event: string, session: unknown) => void,
) {
  const { data } = client.auth.onAuthStateChange(callback);
  return data.subscription;
}
