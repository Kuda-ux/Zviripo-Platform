import { colors, radii, spacing, typography } from '@comodities/ui';
import { createBusiness } from '@comodities/database';
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
import { useAuth } from '../../src/lib/auth-context';
import { supabase } from '../../src/lib/supabase';

export default function BusinessSetupScreen() {
  const { refreshBusinesses } = useAuth();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);

    const { data, error: createError } = await createBusiness(supabase, {
      name: name.trim(),
      area: area.trim() || null,
      phone: phone.trim() || null,
    });

    if (createError || !data) {
      setBusy(false);
      setError(createError?.message ?? 'Could not create the business.');
      return;
    }

    await refreshBusinesses();
    setBusy(false);
    router.replace('/(merchant)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>BUSINESS SETUP</Text>
        <Text style={styles.title}>Tell us about your shop.</Text>
        <Text style={styles.description}>
          This takes less than a minute. You can add products and start selling right after.
        </Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Business name</Text>
            <TextInput
              accessibilityLabel="Business name"
              onChangeText={setName}
              placeholder="e.g. Mbare Value Store"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={name}
            />
          </View>
          <View>
            <Text style={styles.label}>Area / suburb</Text>
            <TextInput
              accessibilityLabel="Area"
              onChangeText={setArea}
              placeholder="e.g. Mbare, Harare"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={area}
            />
          </View>
          <View>
            <Text style={styles.label}>Business phone</Text>
            <TextInput
              accessibilityLabel="Business phone"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="e.g. +263 77 000 0000"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={phone}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy || !name.trim()}
            onPress={submit}
            style={[styles.primary, (busy || !name.trim()) && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryText}>Create my business</Text>
            )}
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
});
