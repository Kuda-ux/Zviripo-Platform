import { colors, copy, spacing, type IconName } from '@comodities/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

const menu: Array<{ label: string; slug: string; icon: IconName; live?: boolean }> = [
  { label: 'Marketplace listings', slug: 'sell', icon: 'sell', live: true },
  { label: 'Business insights', slug: 'insights', icon: 'trendUp', live: true },
  { label: 'Customers', slug: 'customers', icon: 'profile' },
  { label: 'Credit / On Book', slug: 'credit', icon: 'receipt' },
  { label: 'Verification', slug: 'verification', icon: 'verified' },
  { label: 'Team & devices', slug: 'team', icon: 'business' },
  { label: 'Settings & support', slug: 'settings', icon: 'settings' },
];

export default function MerchantMore() {
  const { businesses, session, signOut } = useAuth();
  const business = businesses[0]?.business ?? null;

  if (!session || !business) {
    return (
      <Screen>
        <EmptyState
          action={{
            label: session ? 'Create my business' : 'Sign in',
            onPress: () => router.push(session ? '/(merchant)/setup' : '/(auth)/sign-in'),
          }}
          detail="Business tools are tied to your business account."
          icon="business"
          title={session ? 'Set up your shop' : 'Sign in to run your shop'}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text role="label" tone="brand" style={styles.label}>
        TOOLS
      </Text>
      <Text role="headingXl">Business tools</Text>

      <Card style={styles.business} tone="forest">
        <Text role="headingMd" tone="onDark">
          {business.name}
        </Text>
        <Text role="bodySm" tone="onDarkMuted" style={{ marginTop: spacing[1] }}>
          {business.area ? `${business.area} · ` : ''}Active on Zviripo
        </Text>
      </Card>

      <Card style={styles.menu}>
        {menu.map((item, index) => (
          <Press
            accessibilityLabel={`${item.label}${item.live ? '' : `. ${copy.comingSoon.label}`}`}
            accessibilityRole="button"
            key={item.slug}
            onPress={() => router.push(`/action/${item.slug}` as never)}
            style={[styles.row, index < menu.length - 1 && styles.rowBorder]}
          >
            <Row gap={spacing[3]}>
              <Icon color={colors.brand.forestDeep} name={item.icon} size={20} />
              <Text role="body" style={{ fontWeight: '700' }}>
                {item.label}
              </Text>
            </Row>
            {item.live ? (
              <Icon color={colors.muted} name="forward" size={18} />
            ) : (
              <Text role="caption" tone="muted">
                {copy.comingSoon.label}
              </Text>
            )}
          </Press>
        ))}
      </Card>

      <Button
        fullWidth
        label="Switch to shopping"
        onPress={() => router.push('/(consumer)' as never)}
        style={styles.switch}
        variant="secondary"
      />
      <Button fullWidth label="Sign out" onPress={signOut} style={styles.signOut} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: spacing[2] },
  business: { marginTop: spacing[5] },
  menu: { marginTop: spacing[4], padding: 0, overflow: 'hidden' },
  row: {
    minHeight: 56,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  switch: { marginTop: spacing[5] },
  signOut: { marginTop: spacing[2] },
});
