import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/product-card';
import { Screen } from '../../src/components/screen';
import { fetchMarketplace } from '../../src/lib/marketplace';
import type { ProductPreview } from '../../src/data/demo';

const FILTERS = ['All', 'Products', 'Shops', 'Services', 'Jobs', 'Requests'];

export default function DiscoverScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(search?: string) {
    setLoading(true);
    const { items, error } = await fetchMarketplace(search);
    setItems(items);
    setError(error);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const searched = query.trim().length > 0;

  return (
    <Screen>
      <Text style={styles.eyebrow}>DISCOVER</Text>
      <Text style={styles.title}>Find it nearby.</Text>
      <TextInput
        accessibilityLabel="Search Zviripo"
        placeholder="Products, shops, services, jobs…"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => load(query)}
        returnKeyType="search"
        style={styles.search}
      />
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            accessibilityRole="button"
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={[styles.filter, activeFilter === filter && styles.filterActive]}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <Text style={styles.resultCount}>Searching Zviripo…</Text>
      ) : error ? (
        <Text style={styles.resultCount}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {searched ? `Can’t find “${query.trim()}” nearby?` : 'Nothing nearby yet.'}
          </Text>
          <Text style={styles.emptyBody}>
            Post a request — shops and providers near you can respond with what they have.
          </Text>
          <Pressable onPress={() => router.push('/action/request')} style={styles.emptyCta}>
            <Text style={styles.emptyCtaText}>Post a request</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.resultCount}>
          {items.length} {activeFilter.toLowerCase()} results around you
        </Text>
      )}
      <View style={styles.results}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    marginTop: spacing[4],
    color: colors.brand[700],
    fontSize: typography.size.caption,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.display,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  search: {
    minHeight: 60,
    marginTop: spacing[5],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: typography.size.body,
  },
  filters: { marginTop: spacing[4], flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  filter: {
    minHeight: 40,
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  filterActive: { borderColor: colors.brand[900], backgroundColor: colors.brand[900] },
  filterText: { color: colors.muted, fontSize: typography.size.caption, fontWeight: '800' },
  filterTextActive: { color: colors.surface },
  resultCount: {
    marginVertical: spacing[5],
    color: colors.muted,
    fontSize: typography.size.caption,
    fontWeight: '700',
  },
  emptyCard: {
    marginVertical: spacing[5],
    padding: spacing[5],
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  emptyTitle: { color: colors.ink, fontWeight: '900', fontSize: 17 },
  emptyBody: { marginTop: spacing[1], color: colors.muted, fontSize: 13, lineHeight: 19 },
  emptyCta: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  emptyCtaText: { color: colors.surface, fontWeight: '900' },
  results: { gap: spacing[4], alignItems: 'center' },
});
