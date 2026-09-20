import { colors, radii, spacing, type IconName } from '@comodities/ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { recentSearches } from '../../src/lib/recent-searches';
import { listSaved, type SavedListing } from '../../src/lib/saved';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, Chip, Row, SectionHeader } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

export default function ProfileScreen() {
  const { session, businesses, signOut } = useAuth();
  const [saved, setSaved] = useState<SavedListing[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      listSaved().then(setSaved);
      recentSearches().then(setRecent);
    }, []),
  );

  const displayName =
    (session?.user?.user_metadata?.display_name as string | undefined) ??
    session?.user?.email ??
    null;
  const initial = (displayName ?? 'Z')[0]?.toUpperCase();

  const soon: Array<{ label: string; icon: IconName; detail: string }> = [
    { label: 'My requests', icon: 'request', detail: 'Requests you post will appear here.' },
    { label: 'Receipts', icon: 'receipt', detail: 'Digital receipts from Zviripo shops.' },
    {
      label: 'Notifications',
      icon: 'notifications',
      detail: 'Only useful alerts — saved items, responses.',
    },
  ];

  return (
    <Screen>
      <Text role="label" tone="brand">
        MY ZVIRIPO
      </Text>
      <Text role="headingXl" style={styles.title}>
        {displayName ? `Hi, ${displayName.split(' ')[0]}` : 'Your economic workspace'}
      </Text>

      <Card style={styles.identity}>
        <Row gap={spacing[3]}>
          <View style={styles.avatar}>
            <Text role="headingMd" tone="brand">
              {initial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text role="headingSm">{displayName ?? 'Not signed in'}</Text>
            <Text role="bodySm" tone="muted">
              {session
                ? session.user.email
                : 'Sign in to sell, post requests and keep your saved items across devices.'}
            </Text>
          </View>
        </Row>
        <Row gap={spacing[2]} style={{ marginTop: spacing[4] }}>
          {session ? (
            <>
              {businesses.length > 0 ? (
                <Button
                  icon="business"
                  label={
                    businesses.length === 1
                      ? businesses[0].business.name
                      : `${businesses.length} businesses`
                  }
                  onPress={() => router.push('/(merchant)')}
                  size="sm"
                  variant="primary"
                />
              ) : (
                <Button
                  icon="business"
                  label="Set up a business"
                  onPress={() => router.push('/(merchant)/setup')}
                  size="sm"
                />
              )}
              <Button
                icon="signOut"
                label="Sign out"
                onPress={async () => {
                  await signOut();
                  router.replace('/');
                }}
                size="sm"
                variant="secondary"
              />
            </>
          ) : (
            <Button
              label="Sign in or create account"
              onPress={() => router.push('/(auth)/sign-in')}
              size="sm"
              variant="gold"
            />
          )}
        </Row>
      </Card>

      <SectionHeader title="Saved items" />
      {saved.length === 0 ? (
        <EmptyState
          compact
          detail="Tap the heart on any product to keep it here — saved on this device."
          icon="save"
          title="Nothing saved yet"
          action={{
            label: 'Browse nearby',
            onPress: () => router.push('/(consumer)/discover'),
            variant: 'secondary',
          }}
        />
      ) : (
        <View style={styles.list}>
          {saved.map((item) => (
            <Press
              accessibilityRole="button"
              key={item.listing_id}
              onPress={() => router.push(`/product/${item.listing_id}`)}
              style={styles.row}
            >
              <Icon color={colors.danger} name="saved" size={18} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} role="headingSm">
                  {item.product_name}
                </Text>
                <Text numberOfLines={1} role="caption" tone="muted">
                  {item.business_name}
                </Text>
              </View>
              <Icon color={colors.muted} name="forward" size={18} />
            </Press>
          ))}
        </View>
      )}

      {recent.length > 0 ? (
        <>
          <SectionHeader title="Recent searches" />
          <Row gap={spacing[2]} style={{ flexWrap: 'wrap' }}>
            {recent.map((q) => (
              <Chip
                key={q}
                label={q}
                onPress={() => router.push({ pathname: '/(consumer)/discover', params: { q } })}
              />
            ))}
          </Row>
        </>
      ) : null}

      <SectionHeader title="Coming to My Zviripo" />
      <View style={styles.list}>
        {soon.map((item) => (
          <View key={item.label} style={[styles.row, styles.rowMuted]}>
            <Icon color={colors.muted} name={item.icon} size={18} />
            <View style={{ flex: 1 }}>
              <Text role="headingSm" tone="muted">
                {item.label}
              </Text>
              <Text role="caption" tone="muted">
                {item.detail}
              </Text>
            </View>
            <Text role="label" tone="muted">
              SOON
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing[2] },
  identity: { marginTop: spacing[5] },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand.tint,
  },
  list: { gap: spacing[2] },
  row: {
    minHeight: 60,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  rowMuted: { backgroundColor: colors.paper },
});
