import { spacing } from '@comodities/ui';
import { createBusiness } from '@comodities/database';
import { humanizeError } from '@comodities/utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Input } from '../../src/ui/input';
import { IconButton } from '../../src/ui/layout';
import { Text } from '../../src/ui/text';

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
      setError(
        humanizeError(createError ?? new Error('Could not create the business.'), 'save').detail,
      );
      return;
    }

    await refreshBusinesses();
    setBusy(false);
    router.replace('/(merchant)');
  }

  return (
    <Screen>
      <IconButton accessibilityLabel="Back" icon="back" onPress={() => router.back()} />
      <Text role="label" tone="brand" style={styles.eyebrow}>
        BUSINESS SETUP
      </Text>
      <Text role="headingXl" style={styles.title}>
        Tell us about your shop
      </Text>
      <Text role="body" tone="muted" style={styles.description}>
        This takes less than a minute. You can add products and start selling right after.
      </Text>

      <View style={styles.form}>
        <Input
          label="Business name"
          onChangeText={setName}
          placeholder="e.g. Mbare Value Store"
          value={name}
        />
        <Input
          label="Area / suburb"
          onChangeText={setArea}
          placeholder="e.g. Mbare, Harare"
          value={area}
        />
        <Input
          keyboardType="phone-pad"
          label="Business phone"
          onChangeText={setPhone}
          placeholder="e.g. +263 77 000 0000"
          value={phone}
        />

        {error ? (
          <Text role="bodySm" tone="danger">
            {error}
          </Text>
        ) : null}

        <Button
          disabled={!name.trim()}
          fullWidth
          label="Create my business"
          loading={busy}
          onPress={submit}
          size="lg"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: spacing[5] },
  title: { marginTop: spacing[1] },
  description: { marginTop: spacing[2] },
  form: { marginTop: spacing[6], gap: spacing[4] },
});
