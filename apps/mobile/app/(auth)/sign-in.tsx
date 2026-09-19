import { colors, radii, spacing, typography } from '@comodities/ui';
import { signInWithEmail, signUpWithEmail } from '@comodities/database';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function SignInScreen() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    setMessage(null);

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

    router.replace('/(consumer)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>ZVIRIPO</Text>
        <Text style={styles.title}>
          {mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}
        </Text>
        <Text style={styles.description}>
          Sign in to publish products, run your shop, or save items across devices.
        </Text>

        <View style={styles.form}>
          {mode === 'sign-up' ? (
            <View>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                accessibilityLabel="Display name"
                autoCapitalize="words"
                onChangeText={setDisplayName}
                placeholder="Your name or shop name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={displayName}
              />
            </View>
          ) : null}
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={email}
            />
          </View>
          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput
              accessibilityLabel="Password"
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy || !email.trim() || !password}
            onPress={submit}
            style={[styles.primary, (busy || !email.trim() || !password) && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryText}>
                {mode === 'sign-in' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {mode === 'sign-in'
                ? 'New here? Create an account'
                : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  page: { padding: spacing[5], paddingBottom: spacing[12] },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { color: colors.brand[700], fontWeight: '900' },
  eyebrow: {
    marginTop: spacing[5],
    color: colors.brand[700],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: '900',
  },
  description: {
    marginTop: spacing[3],
    color: colors.muted,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  form: { marginTop: spacing[8], gap: spacing[4] },
  label: { marginBottom: spacing[2], color: colors.ink, fontSize: 12, fontWeight: '800' },
  input: {
    minHeight: 54,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  message: { color: colors.success, fontSize: 13, fontWeight: '700' },
  primary: {
    minHeight: 54,
    marginTop: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.surface, fontWeight: '900' },
  switch: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  switchText: { color: colors.brand[700], fontWeight: '800' },
});
