import { colors, radii, spacing, typography } from '@comodities/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/product-card';
import { Screen } from '../../src/components/screen';
import { products } from '../../src/data/demo';

export default function DiscoverScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.shop} ${product.area}`.toLowerCase().includes(query.toLowerCase()),
  );
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
      <Text style={styles.resultCount}>
        {visibleProducts.length} {activeFilter.toLowerCase()} results around Mbare
      </Text>
      <View style={styles.results}>
        {visibleProducts.map((product) => (
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
