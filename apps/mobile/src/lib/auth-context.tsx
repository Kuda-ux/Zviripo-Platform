import type { Session } from '@comodities/database';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getBusinessesForProfile, registerDevice } from '@comodities/database';
import { supabase } from './supabase';
import type { Business, BusinessMemberRole } from '@comodities/database';

interface BusinessMembership {
  business: Business;
  role: BusinessMemberRole;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  businesses: BusinessMembership[];
  deviceId: string;
  refreshBusinesses: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const deviceId = useMemo(() => createDeviceId(), []);

  async function refreshBusinesses() {
    if (!session?.user?.id) {
      setBusinesses([]);
      return;
    }
    const { data } = await getBusinessesForProfile(supabase, session.user.id);
    setBusinesses(data ?? []);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshBusinesses();
    if (session?.user?.id) {
      registerDevice(supabase, deviceId, null, 'android', '0.1.0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      businesses,
      deviceId,
      refreshBusinesses,
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setBusinesses([]);
      },
    }),
    [session, loading, businesses, deviceId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
