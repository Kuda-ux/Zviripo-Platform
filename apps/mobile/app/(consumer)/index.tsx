import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/product-card';
import { Screen } from '../../src/components/screen';
import { SectionHeader } from '../../src/components/section-header';
import { useAuth } from '../../src/lib/auth-context';
import { fetchMarketplace } from '../../src/lib/marketplace';
import type { ProductPreview } from '../../src/data/demo';

const actions = [
  ['Buy', 'Products nearby', '/(consumer)/discover'],
  ['Sell', 'Reach local buyers', '/(merchant)/sell'],
  ['Request', 'Ask for it', '/action/request'],
  ['Services', 'Skilled help', '/action/services'],
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ConsumerHome() {
  const { session } = useAuth();
  const [items, setItems] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMarketplace().then(({ items, error }) => {
      setItems(items);
      setError(error);
      setLoading(false);
    });
  }, []);

  const shops = [...new Map(items.map((item) => [item.shop, item])).values()].slice(0, 5);
  const newest = items.slice(0, 6);
  const firstName =
    (session?.user?.user_metadata?.display_name as string | undefined)?.split(' ')[0] ?? 'there';

  const submitSearch = () => {
    router.push('/(consumer)/discover');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {greeting()}, {firstName}
          </Text>
          <Text style={styles.location}>Mbare, Harare</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            onPress={() => router.push('/(consumer)/activity')}
            style={styles.iconButton}
          >
            <Text style={styles.iconButtonText}>🔔</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Profile"
            accessibilityRole="button"
            onPress={() => router.push('/(consumer)/profile')}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() ?? 'Z'}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>What are you looking for today?</Text>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search products, shops and services"
          placeholder="Try “rice near me” or “plumber in Mbare”"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.actionGrid}>
        {actions.map(([title, detail, href]) => (
          <Pressable
            accessibilityRole="button"
            key={title}
            onPress={() => router.push(href)}
            style={[styles.action, title === 'Sell' && styles.actionGold]}
          >
            <Text style={[styles.actionTitle, title === 'Sell' && styles.actionTitleGold]}>
              {title}
            </Text>
            <Text style={[styles.actionDetail, title === 'Sell' && styles.actionDetailGold]}>
              {detail}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader
        title="Available near you"
        action="See all"
        onAction={() => router.push('/(consumer)/discover')}
      />
      {loading ? (
        <Text style={styles.empty}>Loading live inventory…</Text>
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing nearby yet.</Text>
          <Text style={styles.emptyBody}>
            Be the first to ask — merchants near you will see it.
          </Text>
          <Pressable onPress={() => router.push('/action/request')} style={styles.emptyCta}>
            <Text style={styles.emptyCtaText}>Post a request</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
      )}

      {shops.length > 0 ? (
        <>
          <SectionHeader title="Shops near you" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopRow}>
            {shops.map((shop) => (
              <Pressable
                accessibilityRole="button"
                key={shop.shop}
                onPress={() => router.push('/(consumer)/discover')}
                style={styles.shop}
              >
                <View style={styles.shopLogo}>
                  <Text style={styles.shopLogoText}>{shop.shop.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text numberOfLines={1} style={styles.shopName}>
                  {shop.shop}
                </Text>
                <Text style={styles.shopArea}>{shop.area}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      {newest.length > 0 ? (
        <>
          <SectionHeader title="New on Zviripo" />
          <View style={styles.newList}>
            {newest.map((product) => (
              <Pressable
                accessibilityRole="button"
                key={product.id}
                onPress={() => router.push(`/product/${product.id}`)}
                style={styles.newItem}
              >
                <View style={[styles.newMark, { backgroundColor: product.tone }]}>
                  <Text style={styles.newMarkText}>{product.name[0]}</Text>
                </View>
                <View style={styles.newBody}>
                  <Text numberOfLines={1} style={styles.newName}>
                    {product.name}
                  </Text>
                  <Text style={styles.newMeta}>
                    {product.shop} · {product.price}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="Opportunities" />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/action/services')}
        style={styles.opportunity}
      >
        <View style={styles.opportunityBadge}>
          <Text style={styles.opportunityBadgeText}>WORK</Text>
        </View>
        <View style={styles.opportunityBody}>
          <Text style={styles.opportunityTitle}>Jobs and opportunities are coming</Text>
          <Text style={styles.opportunityDetail}>
            Post what you offer — providers near you will appear here.
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: {},
  greeting: { color: colors.muted, fontSize: typography.size.caption, fontWeight: '700' },
  location: { marginTop: 2, color: colors.ink, fontSize: typography.size.body, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonText: { fontSize: 17 },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
  },
  avatarText: { color: colors.brand[900], fontWeight: '800' },
  title: {
    maxWidth: 340,
    marginTop: spacing[8],
    color: colors.ink,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  search: {
    minHeight: 62,
    marginTop: spacing[5],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  searchIcon: {
    marginRight: spacing[3],
    color: colors.brand[700],
    fontSize: 26,
    fontWeight: '900',
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: typography.size.body },
  actionGrid: {
    marginTop: spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing[3],
  },
  action: {
    width: '48.5%',
    minHeight: 92,
    padding: spacing[4],
    justifyContent: 'space-between',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[900],
  },
  actionGold: { backgroundColor: colors.accent[500] },
  actionTitle: { color: colors.surface, fontSize: 17, fontWeight: '900' },
  actionTitleGold: { color: colors.brand[900] },
  actionDetail: { color: '#a9c4b8', fontSize: 11, lineHeight: 15 },
  actionDetailGold: { color: '#5f4a12' },
  empty: { marginVertical: spacing[4], color: colors.muted, fontSize: typography.size.caption },
  emptyCard: {
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
  shopRow: { marginBottom: spacing[2] },
  shop: {
    width: 110,
    marginRight: spacing[3],
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  shopLogo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[100],
  },
  shopLogoText: { color: colors.brand[900], fontWeight: '900' },
  shopName: { marginTop: spacing[2], color: colors.ink, fontSize: 12, fontWeight: '800' },
  shopArea: { marginTop: 2, color: colors.muted, fontSize: 11 },
  newList: { gap: spacing[2] },
  newItem: {
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  newMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.small,
  },
  newMarkText: { color: colors.ink, fontSize: 18, fontWeight: '900', opacity: 0.4 },
  newBody: { flex: 1, marginLeft: spacing[3] },
  newName: { color: colors.ink, fontWeight: '800' },
  newMeta: { marginTop: 2, color: colors.muted, fontSize: 12 },
  opportunity: {
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  opportunityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: radii.small,
    backgroundColor: colors.accent[100],
  },
  opportunityBadgeText: { color: colors.accent[700], fontSize: 10, fontWeight: '900' },
  opportunityBody: { flex: 1, marginLeft: spacing[3] },
  opportunityTitle: { color: colors.ink, fontWeight: '800' },
  opportunityDetail: {
    marginTop: spacing[1],
    color: colors.muted,
    fontSize: typography.size.caption,
    lineHeight: 17,
  },
  arrow: { color: colors.muted, fontSize: 28 },
});
