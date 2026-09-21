import { getMarketplaceByBusiness, type MarketplaceListing } from '@comodities/database';
import { colors, radii, spacing } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Availability, Price, ProductCard, productTone } from '../../src/components/commerce';
import { fetchMarketplaceListing } from '../../src/lib/marketplace';
import { useSaved } from '../../src/lib/saved';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, IconButton, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { ErrorState, Skeleton } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [more, setMore] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { saved, toggle } = useSaved(listing);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const result = await fetchMarketplaceListing(id);
    setListing(result.listing);
    setError(result.error);
    setLoading(false);
    if (result.listing) {
      const { data } = await getMarketplaceByBusiness(supabase, result.listing.business_id);
      setMore(data.filter((l) => l.listing_id !== result.listing?.listing_id).slice(0, 6));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const phone = listing?.business_phone ?? null;
  const canCall = !!phone;
  const canDirect = listing?.business_latitude != null && listing?.business_longitude != null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View
          style={[
            styles.media,
            { backgroundColor: listing ? productTone(listing.product_id) : colors.brand.tint },
          ]}
        >
          <View style={styles.mediaBar}>
            <IconButton accessibilityLabel="Back" icon="back" onPress={() => router.back()} />
            <Row gap={spacing[2]}>
              {listing ? (
                <IconButton
                  accessibilityLabel="Share this listing"
                  icon="forward"
                  onPress={() =>
                    Share.share({
                      message: `${listing.product_name} at ${listing.business_name} on Zviripo`,
                    })
                  }
                />
              ) : null}
              {listing ? (
                <IconButton
                  accessibilityLabel={saved ? 'Remove from saved' : 'Save this item'}
                  icon={saved ? 'saved' : 'save'}
                  onPress={toggle}
                />
              ) : null}
            </Row>
          </View>
          {listing ? (
            <Text role="display" style={styles.initial}>
              {listing.product_name.slice(0, 1)}
            </Text>
          ) : null}
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={{ gap: spacing[3] }}>
              <Skeleton height={34} width={140} />
              <Skeleton height={24} width="80%" />
              <Skeleton height={16} width="50%" />
              <Skeleton height={88} radius={radii.lg} />
            </View>
          ) : error || !listing ? (
            <ErrorState error={error ?? new Error('not found')} onRetry={load} />
          ) : (
            <>
              <Row justify="space-between">
                <Price currency={listing.currency_code} minor={listing.price_minor} size="lg" />
                <Availability quantity={listing.available_quantity} />
              </Row>
              <Text role="headingLg" style={styles.name}>
                {listing.product_name}
              </Text>
              <Text role="bodySm" tone="muted">
                {[listing.product_brand, listing.category_name ?? 'General']
                  .filter(Boolean)
                  .join(' · ')}
              </Text>

              <Card style={styles.seller}>
                <Row gap={spacing[3]}>
                  <View style={styles.sellerMark}>
                    <Text role="headingSm" tone="brand">
                      {listing.business_name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text role="headingSm">{listing.business_name}</Text>
                    <Row gap={4}>
                      <Icon color={colors.muted} name="location" size={13} />
                      <Text role="caption" tone="muted">
                        {listing.business_area ?? 'Area not shared'}
                      </Text>
                    </Row>
                  </View>
                </Row>
                <View style={styles.trust}>
                  <Row gap={spacing[2]}>
                    <Icon color={colors.success} name="synced" size={16} />
                    <Text role="caption" tone="muted">
                      Availability is the shop’s live stock count.
                    </Text>
                  </Row>
                  <Row gap={spacing[2]}>
                    <Icon color={colors.muted} name="info" size={16} />
                    <Text role="caption" tone="muted">
                      Business verification is not live yet. Confirm details before you travel or
                      pay.
                    </Text>
                  </Row>
                </View>
              </Card>

              <Text role="headingSm" style={styles.sectionTitle}>
                About this item
              </Text>
              <Text role="body" tone={listing.product_description ? 'ink' : 'muted'}>
                {listing.product_description ?? 'The seller has not added a description yet.'}
              </Text>

              {more.length > 0 ? (
                <>
                  <Text role="headingSm" style={styles.sectionTitle}>
                    More from {listing.business_name}
                  </Text>
                  <ScrollView
                    contentContainerStyle={styles.rail}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.railWrap}
                  >
                    {more.map((l) => (
                      <ProductCard key={l.listing_id} listing={l} width={176} />
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      {listing && !loading ? (
        <View style={styles.footer}>
          {canCall ? (
            <Button
              fullWidth
              icon="mobileMoney"
              label="Call the shop"
              onPress={() => Linking.openURL(`tel:${phone}`)}
              size="lg"
              variant="gold"
            />
          ) : (
            <Button
              fullWidth
              icon="request"
              label="Request something similar"
              onPress={() => router.push('/action/request')}
              size="lg"
              variant="gold"
            />
          )}
          <Row gap={spacing[2]} style={{ marginTop: spacing[2] }}>
            {canDirect ? (
              <Press
                accessibilityRole="button"
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${listing.business_latitude},${listing.business_longitude}`,
                  )
                }
                style={styles.secondary}
              >
                <Icon color={colors.ink} name="location" size={18} />
                <Text role="caption" style={{ fontWeight: '800' }}>
                  Directions
                </Text>
              </Press>
            ) : null}
            {canCall ? (
              <Press
                accessibilityRole="button"
                onPress={() => router.push('/action/request')}
                style={styles.secondary}
              >
                <Icon color={colors.ink} name="request" size={18} />
                <Text role="caption" style={{ fontWeight: '800' }}>
                  Request similar
                </Text>
              </Press>
            ) : null}
          </Row>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  page: { paddingBottom: spacing[24] },
  media: { height: 280, alignItems: 'center', justifyContent: 'center' },
  mediaBar: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  initial: { fontSize: 96, lineHeight: 100, opacity: 0.14 },
  body: { padding: spacing[5] },
  name: { marginTop: spacing[3], marginBottom: spacing[1] },
  seller: { marginTop: spacing[5] },
  sellerMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.brand.tint,
  },
  trust: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: { marginTop: spacing[6], marginBottom: spacing[2] },
  railWrap: { marginHorizontal: -spacing[5] },
  rail: { paddingHorizontal: spacing[5], gap: spacing[3] },
  footer: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondary: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
});
