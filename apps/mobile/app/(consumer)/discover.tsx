import type { MarketplaceListing } from '@comodities/database';
import { colors, copy, radii, spacing } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { BusinessCard, ProductCard } from '../../src/components/commerce';
import { Screen, screenPadding } from '../../src/components/screen';
import { businessesFrom, fetchMarketplace } from '../../src/lib/marketplace';
import { clearRecentSearches, recentSearches, rememberSearch } from '../../src/lib/recent-searches';
import { Input } from '../../src/ui/input';
import { Chip, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState, ErrorState, Skeleton } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

type Kind = 'All' | 'Products' | 'Shops' | 'Services' | 'Jobs' | 'Requests';
const KINDS: Kind[] = ['All', 'Products', 'Shops', 'Services', 'Jobs', 'Requests'];
const LIVE_KINDS: Kind[] = ['All', 'Products', 'Shops'];

export default function DiscoverScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [kind, setKind] = useState<Kind>('All');
  const [draft, setDraft] = useState(params.q ?? '');
  const [query, setQuery] = useState(params.q ?? '');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const result = await fetchMarketplace(q || undefined, 60);
    setListings(result.listings);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(query);
  }, [query, load]);

  useEffect(() => {
    recentSearches().then(setRecent);
  }, [query]);

  useEffect(() => {
    if (params.q !== undefined) {
      setDraft(params.q);
      setQuery(params.q);
    }
  }, [params.q]);

  const submit = (value = draft) => {
    const q = value.trim();
    setDraft(q);
    setQuery(q);
    if (q) rememberSearch(q);
  };

  const shops = useMemo(() => businessesFrom(listings), [listings]);
  const showProducts = kind === 'All' || kind === 'Products';
  const showShops = kind === 'All' || kind === 'Shops';
  const comingSoon = !LIVE_KINDS.includes(kind);
  const empty = !loading && !error && listings.length === 0;

  const header = (
    <View style={styles.header}>
      <Text role="label" tone="brand">
        DISCOVER
      </Text>
      <Text role="headingXl" style={styles.title}>
        Find it nearby.
      </Text>
      <View style={styles.search}>
        <Input
          autoCorrect={false}
          icon="search"
          onChangeText={setDraft}
          onSubmitEditing={() => submit()}
          placeholder="Products, shops, services, jobs…"
          prominent
          returnKeyType="search"
          value={draft}
        />
      </View>
      <Row gap={spacing[2]} style={styles.chips}>
        {KINDS.map((k) => (
          <Chip active={kind === k} key={k} label={k} onPress={() => setKind(k)} />
        ))}
      </Row>

      {!query && recent.length > 0 ? (
        <View style={styles.recent}>
          <Row justify="space-between">
            <Text role="caption" tone="muted">
              Recent searches
            </Text>
            <Press
              accessibilityRole="button"
              onPress={async () => {
                await clearRecentSearches();
                setRecent([]);
              }}
              style={styles.clear}
            >
              <Text role="caption" tone="brand">
                Clear
              </Text>
            </Press>
          </Row>
          <Row gap={spacing[2]} style={styles.recentChips}>
            {recent.map((r) => (
              <Chip key={r} label={r} onPress={() => submit(r)} />
            ))}
          </Row>
        </View>
      ) : null}

      {comingSoon ? (
        <EmptyState
          detail={`${kind} are not on Zviripo yet. ${copy.comingSoon.detail} Meanwhile, you can post what you need.`}
          icon={kind === 'Services' ? 'services' : kind === 'Jobs' ? 'opportunities' : 'request'}
          style={styles.block}
          title={`${kind} — ${copy.comingSoon.label.toLowerCase()}`}
          action={{
            label: 'Post a request',
            onPress: () => router.push('/action/request'),
            variant: 'gold',
          }}
        />
      ) : loading ? (
        <View style={styles.block}>
          <Skeleton height={14} width={160} />
          <Row gap={spacing[3]} style={{ marginTop: spacing[3] }}>
            <Skeleton height={228} radius={radii.lg} width="48%" />
            <Skeleton height={228} radius={radii.lg} width="48%" />
          </Row>
        </View>
      ) : error ? (
        <ErrorState error={error} onRetry={() => load(query)} style={styles.block} />
      ) : empty ? (
        <EmptyState
          action={{
            label: copy.empty.search(query).action,
            onPress: () => router.push('/action/request'),
            variant: 'gold',
          }}
          detail={query ? copy.empty.search(query).detail : copy.empty.marketplace.detail}
          icon="request"
          style={styles.block}
          title={query ? copy.empty.search(query).title : copy.empty.marketplace.title}
        />
      ) : (
        <>
          {showShops && shops.length > 0 ? (
            <View style={styles.block}>
              <Text role="caption" tone="muted">
                {shops.length} {shops.length === 1 ? 'shop' : 'shops'}
              </Text>
              <FlatList
                contentContainerStyle={{ gap: spacing[3], paddingTop: spacing[3] }}
                data={shops}
                horizontal
                keyExtractor={(s) => s.id}
                renderItem={({ item }) => (
                  <BusinessCard business={item} onPress={() => submit(item.name)} />
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ) : null}
          {showProducts ? (
            <Text role="caption" tone="muted" style={styles.count}>
              {listings.length} {listings.length === 1 ? 'product' : 'products'}
              {query ? ` for “${query}”` : ' around you'}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <Screen scroll={false}>
      <FlatList
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        data={showProducts && !comingSoon && !loading && !error ? listings : []}
        initialNumToRender={8}
        keyExtractor={(l) => l.listing_id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        numColumns={2}
        renderItem={({ item }) => <ProductCard fluid listing={item} />}
        windowSize={7}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { ...screenPadding, paddingTop: spacing[4], paddingBottom: spacing[16] },
  header: { marginBottom: spacing[3] },
  title: { marginTop: spacing[2] },
  search: { marginTop: spacing[4] },
  chips: { marginTop: spacing[3], flexWrap: 'wrap' },
  recent: { marginTop: spacing[4] },
  recentChips: { marginTop: spacing[2], flexWrap: 'wrap' },
  clear: { minHeight: 32, justifyContent: 'center' },
  block: { marginTop: spacing[5] },
  count: { marginTop: spacing[5] },
  columns: { gap: spacing[3], marginBottom: spacing[3] },
});
