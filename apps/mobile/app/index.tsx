import { colors, copy, spacing } from '@comodities/ui';
import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Logo } from '../src/components/brand';
import { useAuth } from '../src/lib/auth-context';
import { Button } from '../src/ui/button';
import { Press } from '../src/ui/pressable';
import { Text } from '../src/ui/text';

export default function WelcomeScreen() {
  const { session, businesses } = useAuth();
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width - spacing[12], 360);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.hero}>
          <Logo variant="lockup" width={logoWidth} />
        </View>

        <View style={styles.copy}>
          <Text role="headingLg" tone="onDark">
            Zimbabwe’s everyday economy, connected.
          </Text>
          <Text role="body" tone="onDarkMuted" style={styles.lede}>
            Find what you need nearby. Sell what you have. Keep your shop running even when the
            internet doesn’t.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            fullWidth
            icon="search"
            label="Find something nearby"
            onPress={() => router.push('/(consumer)')}
            size="lg"
            variant="gold"
          />
          <Button
            fullWidth
            icon="business"
            label={businesses.length > 0 ? 'Open my business' : 'Set up my business'}
            onPress={() => router.push('/(merchant)')}
            size="lg"
            variant="onDark"
          />
          {!session ? (
            <Press
              accessibilityRole="button"
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.signIn}
            >
              <Text role="headingSm" tone="onDarkMuted">
                Already have an account?{' '}
                <Text role="headingSm" tone="onDark">
                  Sign in
                </Text>
              </Text>
            </Press>
          ) : null}
        </View>

        <Text align="center" role="caption" tone="onDarkMuted" style={styles.footer}>
          {copy.tagline}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand.night },
  page: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    justifyContent: 'space-between',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: spacing[3], maxWidth: 480 },
  lede: {},
  actions: { marginTop: spacing[8], gap: spacing[3] },
  signIn: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: spacing[6] },
});
