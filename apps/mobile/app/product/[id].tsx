import { colors, radii, spacing, typography } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { products } from '../../src/data/demo';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = products.find((item) => item.id === id) ?? products[0];
  const [saved, setSaved] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.image, { backgroundColor: product.tone }]}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.icon}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={saved ? 'Remove saved item' : 'Save item'}
            onPress={() => setSaved((value) => !value)}
            style={styles.save}
          >
            <Text style={styles.icon}>{saved ? '♥' : '♡'}</Text>
          </Pressable>
          <Text style={styles.initial}>{product.name[0]}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}</Text>
            <Text style={styles.stock}>{product.tag}</Text>
          </View>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.meta}>
            {product.area} · {product.distance}
          </Text>
          <View style={styles.shop}>
            <View style={styles.shopMark}>
              <Text style={styles.shopMarkText}>{product.shop[0]}</Text>
            </View>
            <View style={styles.shopBody}>
              <Text style={styles.shopName}>{product.shop}</Text>
              <Text style={styles.meta}>Verified business · Usually responds quickly</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.description}>
            Availability is linked to the merchant’s current shop inventory. Confirm collection
            details with the seller.
          </Text>
          <Pressable onPress={() => router.push('/action/contact-seller')} style={styles.primary}>
            <Text style={styles.primaryText}>Contact seller</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/action/request')} style={styles.secondary}>
            <Text style={styles.secondaryText}>Request something similar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  page: { paddingBottom: spacing[12] },
  image: { height: 330, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.ink, fontSize: 96, fontWeight: '900', opacity: 0.12 },
  back: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  save: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  icon: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  body: { padding: spacing[5] },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: colors.ink, fontSize: 32, fontWeight: '900' },
  stock: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.success,
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: spacing[3],
    color: colors.ink,
    fontSize: typography.size.title,
    fontWeight: '900',
  },
  meta: { marginTop: spacing[1], color: colors.muted, fontSize: 12 },
  shop: {
    marginTop: spacing[6],
    paddingVertical: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  shopMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[900],
  },
  shopMarkText: { color: colors.surface, fontWeight: '900' },
  shopBody: { flex: 1, marginLeft: spacing[3] },
  shopName: { color: colors.ink, fontWeight: '900' },
  sectionTitle: { marginTop: spacing[6], color: colors.ink, fontSize: 18, fontWeight: '900' },
  description: { marginTop: spacing[2], color: colors.muted, lineHeight: 23 },
  primary: {
    minHeight: 54,
    marginTop: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  primaryText: { color: colors.surface, fontWeight: '900' },
  secondary: {
    minHeight: 54,
    marginTop: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
  },
  secondaryText: { color: colors.ink, fontWeight: '900' },
});
