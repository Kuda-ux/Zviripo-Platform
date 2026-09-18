import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductPreview } from '../data/demo';

export function ProductCard({ product }: { product: ProductPreview }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/product/${product.id}`)}
      style={styles.card}
    >
      <View style={[styles.image, { backgroundColor: product.tone }]}>
        <Text style={styles.imageLabel}>{product.name.slice(0, 1)}</Text>
        <View style={styles.save}>
          <Text>♡</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.tag}>{product.tag}</Text>
        </View>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text numberOfLines={1} style={styles.shop}>
          {product.shop}
        </Text>
        <Text style={styles.location}>
          {product.area} · {product.distance}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: spacing[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  image: { height: 132, alignItems: 'center', justifyContent: 'center' },
  imageLabel: { color: colors.ink, fontSize: 42, fontWeight: '900', opacity: 0.18 },
  save: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  body: { padding: spacing[4] },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: colors.ink, fontSize: typography.size.title, fontWeight: '900' },
  tag: { color: colors.success, fontSize: 11, fontWeight: '800' },
  name: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.body,
    fontWeight: '700',
  },
  shop: { marginTop: spacing[2], color: colors.muted, fontSize: typography.size.caption },
  location: { marginTop: spacing[1], color: colors.muted, fontSize: typography.size.caption },
});
