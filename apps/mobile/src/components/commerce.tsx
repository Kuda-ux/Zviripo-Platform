import type { MarketplaceListing } from '@comodities/database';
import { colors, radii, spacing } from '@comodities/ui';
import { formatMinor } from '@comodities/utils';
import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../ui/icon';
import { Press } from '../ui/pressable';
import { Text } from '../ui/text';

type Currency = 'USD' | 'ZWG';

export function Price({
  minor,
  currency,
  size = 'md',
  tone = 'ink',
}: {
  minor: number;
  currency: Currency;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'onDark';
}) {
  const role = size === 'lg' ? 'numericLg' : size === 'sm' ? 'numericSm' : 'numeric';
  return (
    <Text accessibilityLabel={formatMinor(minor, currency)} role={role} tone={tone}>
      {formatMinor(minor, currency)}
    </Text>
  );
}

export function Availability({ quantity, compact }: { quantity: number; compact?: boolean }) {
  const out = quantity <= 0;
  const low = !out && quantity <= 3;
  const fg = out ? colors.danger : low ? colors.warning : colors.success;
  const label = out
    ? 'Out of stock'
    : low
      ? `Only ${quantity} left`
      : compact
        ? 'Available'
        : `${quantity} available`;
  return (
    <View style={styles.availability}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text role="caption" style={{ color: fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

/** Deterministic soft tone per product so cards without images still read distinctly. */
export function productTone(seed: string) {
  const tones = [colors.brand.tint, colors.gold[100], colors.infoSoft, colors.successSoft];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return tones[Math.abs(h) % tones.length];
}

export function ProductCard({
  listing,
  width = 200,
  fluid,
  style,
}: {
  listing: MarketplaceListing;
  width?: number;
  /** Fill the parent (grid cell) instead of a fixed rail width. */
  fluid?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press
      accessibilityLabel={`${listing.product_name}, ${formatMinor(listing.price_minor, listing.currency_code as Currency)}, from ${listing.business_name}`}
      accessibilityRole="button"
      onPress={() => router.push(`/product/${listing.listing_id}`)}
      style={[styles.card, fluid ? styles.fluid : { width }, style]}
    >
      <View style={[styles.media, { backgroundColor: productTone(listing.product_id) }]}>
        <Text role="display" style={styles.mediaInitial}>
          {listing.product_name.slice(0, 1)}
        </Text>
      </View>
      <View style={styles.body}>
        <Price currency={listing.currency_code as Currency} minor={listing.price_minor} size="sm" />
        <Text numberOfLines={2} role="headingSm" style={styles.name}>
          {listing.product_name}
        </Text>
        <Text numberOfLines={1} role="bodySm" tone="muted">
          {listing.business_name}
        </Text>
        <View style={styles.meta}>
          <Icon color={colors.muted} name="location" size={13} />
          <Text numberOfLines={1} role="caption" tone="muted">
            {listing.business_area ?? 'Nearby'}
          </Text>
        </View>
        <Availability compact quantity={listing.available_quantity} />
      </View>
    </Press>
  );
}

export function ListingRow({ listing }: { listing: MarketplaceListing }) {
  return (
    <Press
      accessibilityRole="button"
      onPress={() => router.push(`/product/${listing.listing_id}`)}
      style={styles.row}
    >
      <View style={[styles.rowMedia, { backgroundColor: productTone(listing.product_id) }]}>
        <Text role="headingMd" style={styles.mediaInitial}>
          {listing.product_name.slice(0, 1)}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text numberOfLines={1} role="headingSm">
          {listing.product_name}
        </Text>
        <Text numberOfLines={1} role="bodySm" tone="muted">
          {listing.business_name} · {listing.business_area ?? 'Nearby'}
        </Text>
        <Availability compact quantity={listing.available_quantity} />
      </View>
      <Price currency={listing.currency_code as Currency} minor={listing.price_minor} size="sm" />
    </Press>
  );
}

export interface BusinessSummary {
  id: string;
  name: string;
  area: string | null;
  listingCount: number;
}

export function BusinessCard({
  business,
  onPress,
}: {
  business: BusinessSummary;
  onPress?: () => void;
}) {
  return (
    <Press
      accessibilityLabel={`${business.name}, ${business.area ?? 'nearby'}, ${business.listingCount} products`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.business}
    >
      <View style={styles.businessMark}>
        <Text role="headingSm" tone="brand">
          {business.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text numberOfLines={1} role="caption" style={styles.businessName}>
        {business.name}
      </Text>
      <Text numberOfLines={1} role="caption" tone="muted">
        {business.area ?? 'Nearby'}
      </Text>
      <Text role="caption" tone="brand" style={{ marginTop: 2 }}>
        {business.listingCount} {business.listingCount === 1 ? 'product' : 'products'}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  availability: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: radii.pill },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  fluid: { flex: 1 },
  media: { height: 112, alignItems: 'center', justifyContent: 'center' },
  mediaInitial: { color: colors.ink, opacity: 0.16 },
  body: { padding: spacing[3], gap: spacing[1] },
  name: { marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: {
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  rowMedia: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  business: {
    width: 128,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  businessMark: {
    width: 48,
    height: 48,
    marginBottom: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.brand.tint,
  },
  businessName: { fontWeight: '800' },
});
