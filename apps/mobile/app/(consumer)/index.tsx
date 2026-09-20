import type { MarketplaceListing } from '@comodities/database';
import { colors, copy, radii, spacing, type IconName } from '@comodities/ui';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Wordmark } from '../../src/components/brand';
import { BusinessCard, ListingRow, ProductCard } from '../../src/components/commerce';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { useConnectivity } from '../../src/lib/connectivity';
import { businessesFrom, fetchMarketplace } from '../../src/lib/marketplace';
import { Icon } from '../../src/ui/icon';
import { Input } from '../../src/ui/input';
import { Card, IconButton, Row, SectionHeader } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState, ErrorState, Skeleton } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

const intents: Array<{
  title: string;
  detail: string;
  icon: IconName;
  href: string;
  gold?: boolean;
}> = [
  { title: 'Buy', detail: 'Products nearby', icon: 'cart', href: '/(consumer)/discover' },
  { title: 'Sell', detail: 'Reach local buyers', icon: 'sell', href: '/(merchant)', gold: true },
  { title: 'Request', detail: 'Ask for what you need', icon: 'request', href: '/action/request' },
  { title: 'Services', detail: 'Skilled help', icon: 'services', href: '/action/services' },
];

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function ConsumerHome() {
  const { session } = useAuth();
  const connectivity = useConnectivity();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const result = await fetchMarketplace();
    setListings(result.listings);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shops = businessesFrom(listings).slice(0, 8);
  const newest = listings.slice(0, 5);
  const firstName = (session?.user?.user_metadata?.display_name as string | undefined)?.split(
    ' ',
  )[0];

  const submitSearch = () => {
    const q = search.trim();
    router.push(q ? { pathname: '/(consumer)/discover', params: { q } } : '/(consumer)/discover');
  };

  return (
    <Screen
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <Row justify="space-between">
        <View>
          <Text role="caption" tone="muted">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </Text>
          <Wordmark />
        </View>
        <Row gap={spacing[2]}>
          <IconButton
            accessibilityLabel="Activity and notifications"
            icon="notifications"
            onPress={() => router.push('/(consumer)/activity')}
          />
          <IconButton
            accessibilityLabel={session ? 'Your profile' : 'Sign in'}
            icon="profile"
            onPress={() => router.push(session ? '/(consumer)/profile' : '/(auth)/sign-in')}
            tone="tint"
          />
        </Row>
      </Row>

      {connectivity === 'offline' ? (
        <Card style={styles.offline} tone="tint">
          <Row gap={spacing[2]}>
            <Icon color={colors.warning} name="offline" size={18} />
            <Text role="bodySm">You’re offline. Showing what we loaded last.</Text>
          </Row>
        </Card>
      ) : null}

      <Text role="headingXl" style={styles.title}>
        What are you looking for today?
      </Text>
      <View style={styles.search}>
        <Input
          icon="search"
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          placeholder="Try “rice near me” or “plumber in Mbare”"
          prominent
          returnKeyType="search"
          value={search}
        />
      </View>

      <View style={styles.intents}>
        {intents.map((intent) => (
          <Press
            accessibilityLabel={`${intent.title}. ${intent.detail}`}
            accessibilityRole="button"
            key={intent.title}
            onPress={() => router.push(intent.href as never)}
            style={[styles.intent, intent.gold && styles.intentGold]}
          >
            <Icon
              color={intent.gold ? colors.brand.night : colors.onDark}
              name={intent.icon}
              size={22}
            />
            <View>
              <Text
                role="headingSm"
                style={{ color: intent.gold ? colors.brand.night : colors.onDark }}
              >
                {intent.title}
              </Text>
              <Text role="caption" style={{ color: intent.gold ? '#5f4a12' : colors.onDarkMuted }}>
                {intent.detail}
              </Text>
            </View>
          </Press>
        ))}
      </View>

      <SectionHeader
        action="See all"
        onAction={() => router.push('/(consumer)/discover')}
        title="Available near you"
      />
      {loading ? (
        <Row gap={spacing[3]}>
          {[0, 1].map((i) => (
            <Skeleton height={228} key={i} radius={radii.lg} width={200} />
          ))}
        </Row>
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : listings.length === 0 ? (
        <EmptyState
          action={{
            label: copy.empty.marketplace.action,
            onPress: () => router.push('/action/request'),
          }}
          detail={copy.empty.marketplace.detail}
          icon="request"
          title={copy.empty.marketplace.title}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.rail}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.railWrap}
        >
          {listings.slice(0, 10).map((listing) => (
            <ProductCard key={listing.listing_id} listing={listing} />
          ))}
        </ScrollView>
      )}

      {shops.length > 0 ? (
        <>
          <SectionHeader title="Shops near you" />
          <ScrollView
            contentContainerStyle={styles.rail}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.railWrap}
          >
            {shops.map((shop) => (
              <BusinessCard
                business={shop}
                key={shop.id}
                onPress={() =>
                  router.push({ pathname: '/(consumer)/discover', params: { q: shop.name } })
                }
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {newest.length > 0 ? (
        <>
          <SectionHeader title="New on Zviripo" />
          <View style={styles.list}>
            {newest.map((listing) => (
              <ListingRow key={listing.listing_id} listing={listing} />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="Can’t find it?" />
      <Card tone="forest">
        <Text role="label" style={{ color: colors.gold[500] }}>
          REQUEST ECONOMY
        </Text>
        <Text role="headingMd" tone="onDark" style={{ marginTop: spacing[2] }}>
          Ask for it. Nearby shops can respond.
        </Text>
        <Text role="bodySm" tone="onDarkMuted" style={{ marginTop: spacing[1] }}>
          Post what you need, your area and budget.
        </Text>
        <Press
          accessibilityRole="button"
          onPress={() => router.push('/action/request')}
          style={styles.requestCta}
        >
          <Text role="headingSm" style={{ color: colors.brand.night }}>
            Post a request
          </Text>
          <Icon color={colors.brand.night} name="forward" size={16} />
        </Press>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  offline: { marginTop: spacing[4], paddingVertical: spacing[3] },
  title: { marginTop: spacing[8], maxWidth: 320 },
  search: { marginTop: spacing[4] },
  intents: {
    marginTop: spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing[3],
  },
  intent: {
    width: '48.5%',
    minHeight: 96,
    padding: spacing[4],
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    backgroundColor: colors.brand.forest,
  },
  intentGold: { backgroundColor: colors.gold[500] },
  railWrap: { marginHorizontal: -spacing[5] },
  rail: { paddingHorizontal: spacing[5], gap: spacing[3] },
  list: { gap: spacing[2] },
  requestCta: {
    minHeight: 48,
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[2],
    borderRadius: radii.md,
    backgroundColor: colors.gold[500],
  },
});
