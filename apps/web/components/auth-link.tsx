'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@comodities/database';
import { supabase } from '../lib/supabase';

export function AuthLink() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return (
      <button
        className="nav-action"
        onClick={() => {
          void supabase.auth.signOut();
        }}
      >
        Sign out
      </button>
    );
  }

  return (
    <a className="nav-action" href="/sign-in">
      Sign in
    </a>
  );
}
