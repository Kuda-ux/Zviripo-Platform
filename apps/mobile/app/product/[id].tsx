import { colors, radii, spacing, typography } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchMarketplaceListing, toProductPreview } from '../../src/lib/marketplace';
import type { MarketplaceListing } from '@comodities/database';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchMarketplaceListing(id).then(({ listing, error }) => {
      setListing(listing);
      setError(error);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
        <Text style={styles.centerText}>Loading listing…</Text>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.centerText}>{error ?? 'Listing not found'}</Text>
        <Pressable onPress={() => router.back()} style={styles.primary}>
          <Text style={styles.primaryText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const product = toProductPreview(listing);

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
            {listing.category_name ?? 'General'} · {listing.business_area ?? 'Nearby'}
          </Text>
          <View style={styles.shop}>
            <View style={styles.shopMark}>
              <Text style={styles.shopMarkText}>{listing.business_name[0]}</Text>
            </View>
            <View style={styles.shopBody}>
              <Text style={styles.shopName}>{listing.business_name}</Text>
              <Text style={styles.meta}>
                Verified business · {listing.available_quantity} in stock
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.description}>
            {listing.product_description ??
              'Availability is linked to the merchant’s current shop inventory. Confirm collection details with the seller.'}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
  },
  centerText: { color: colors.muted, fontSize: typography.size.body },
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
