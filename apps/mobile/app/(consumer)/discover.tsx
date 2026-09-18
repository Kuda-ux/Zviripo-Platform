import { colors, radii, spacing, typography } from '@comodities/ui';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/product-card';
import { Screen } from '../../src/components/screen';
import { fetchMarketplace } from '../../src/lib/marketplace';
import type { ProductPreview } from '../../src/data/demo';

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

  return (
    <Screen>
      <Text style={styles.eyebrow}>DISCOVER</Text>
      <Text style={styles.title}>Find it nearby.</Text>
      <TextInput
        accessibilityLabel="Search Comodities"
        placeholder="Try “fridge under $150”"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => load(query)}
        returnKeyType="search"
        style={styles.search}
      />
      <View style={styles.filters}>
        {['All', 'Products', 'Shops', 'Services', 'Jobs'].map((filter) => (
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
        <Text style={styles.resultCount}>Loading live inventory…</Text>
      ) : error ? (
        <Text style={styles.resultCount}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.resultCount}>
          No public listings yet. Published stock will appear here.
        </Text>
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
  },
  search: {
    minHeight: 56,
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
    minHeight: 38,
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
  results: { gap: spacing[4], alignItems: 'center' },
});
