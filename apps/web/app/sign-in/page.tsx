'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail } from '@comodities/database';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured for this deployment.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');

    const result =
      mode === 'sign-in'
        ? await signInWithEmail(supabase, email.trim(), password)
        : await signUpWithEmail(supabase, email.trim(), password, {
            display_name: displayName.trim() || undefined,
          });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'sign-up') {
      setMessage('Check your email to confirm your account, then sign in.');
      setMode('sign-in');
      return;
    }

    router.push('/');
  }

  return (
    <main className="auth-page">
      <a className="brand" href="/">
        Comodities
      </a>
      <div className="auth-card">
        <p className="eyebrow">COMODITIES ACCOUNT</p>
        <h1 className="auth-title">
          {mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}
        </h1>
        <p className="auth-lede">
          Sign in to save items, manage your shop, or publish stock to the marketplace.
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'sign-up' ? (
            <label className="field">
              <span>Display name</span>
              <input
                autoComplete="name"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name or shop name"
                value={displayName}
              />
            </label>
          ) : null}
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={password}
            />
          </label>
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="auth-message" role="status">
              {message}
            </p>
          ) : null}
          <button className="nav-action auth-submit" disabled={busy || !email || !password}>
            {busy ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
          <button
            className="auth-switch"
            onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            type="button"
          >
            {mode === 'sign-in'
              ? 'New here? Create an account'
              : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
