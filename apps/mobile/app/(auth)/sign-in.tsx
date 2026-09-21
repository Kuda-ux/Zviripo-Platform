import { signInWithEmail, signUpWithEmail } from '@comodities/database';
import { colors, spacing } from '@comodities/ui';
import { humanizeError } from '@comodities/utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../src/components/brand';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, IconButton, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { Text } from '../../src/ui/text';
import { Input } from '../../src/ui/input';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);

  const valid = email.trim().includes('@') && password.length >= 6;

  async function submit() {
    if (!valid) return;
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
      setError(humanizeError(result.error, 'auth'));
      return;
    }
    if (mode === 'sign-up' && !result.data.session) {
      setMessage('Check your email for a confirmation link, then sign in here.');
      setMode('sign-in');
      return;
    }
    router.replace('/(consumer)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <Row justify="space-between">
            <IconButton
              accessibilityLabel="Back"
              icon="back"
              onPress={() => router.back()}
              tone="onDark"
            />
            <Logo variant="wordmark" width={128} />
          </Row>

          <Text role="headingXl" tone="onDark" style={styles.title}>
            {mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}
          </Text>
          <Text role="body" tone="onDarkMuted" style={styles.lede}>
            {mode === 'sign-in'
              ? 'Sign in to run your shop, post requests and keep saved items.'
              : 'One account for buying, selling and running a business.'}
          </Text>

          <Card style={styles.form}>
            {mode === 'sign-up' ? (
              <Input
                autoCapitalize="words"
                icon="profile"
                label="Your name"
                onChangeText={setDisplayName}
                placeholder="e.g. Tariro Moyo"
                value={displayName}
              />
            ) : null}
            <Input
              autoCapitalize="none"
              autoComplete="email"
              icon="mail"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />
            <Input
              autoComplete={mode === 'sign-in' ? 'password' : 'new-password'}
              hint={mode === 'sign-up' ? 'At least 6 characters.' : undefined}
              icon="lock"
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={submit}
              placeholder="Password"
              returnKeyType="go"
              secureTextEntry
              value={password}
            />

            {error ? (
              <View accessibilityRole="alert" style={styles.alert}>
                <Icon color={colors.danger} name="warning" size={18} />
                <View style={{ flex: 1 }}>
                  <Text role="headingSm" tone="danger">
                    {error.title}
                  </Text>
                  <Text role="bodySm" tone="muted">
                    {error.detail}
                  </Text>
                </View>
              </View>
            ) : null}
            {message ? (
              <View accessibilityRole="alert" style={[styles.alert, styles.alertInfo]}>
                <Icon color={colors.success} name="mail" size={18} />
                <Text role="bodySm" style={{ flex: 1 }}>
                  {message}
                </Text>
              </View>
            ) : null}

            <Button
              disabled={!valid}
              fullWidth
              label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
              loading={busy}
              onPress={submit}
              size="lg"
              variant="gold"
            />
          </Card>

          <Press
            accessibilityRole="button"
            onPress={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError(null);
              setMessage(null);
            }}
            style={styles.switch}
          >
            <Text role="headingSm" tone="onDarkMuted">
              {mode === 'sign-in' ? 'New to Zviripo? ' : 'Already have an account? '}
              <Text role="headingSm" tone="onDark">
                {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
              </Text>
            </Text>
          </Press>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand.night },
  fill: { flex: 1 },
  page: { padding: spacing[5], paddingBottom: spacing[12] },
  title: { marginTop: spacing[10] },
  lede: { marginTop: spacing[2], maxWidth: 420 },
  form: { marginTop: spacing[6], gap: spacing[4] },
  alert: {
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
  },
  alertInfo: { backgroundColor: colors.successSoft },
  switch: { minHeight: 48, marginTop: spacing[5], alignItems: 'center', justifyContent: 'center' },
});
