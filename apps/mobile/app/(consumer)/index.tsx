import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { ScrollView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/product-card';
import { Screen } from '../../src/components/screen';
import { SectionHeader } from '../../src/components/section-header';
import { products } from '../../src/data/demo';

const actions = [
  ['Buy', 'Find products nearby', '/(consumer)/discover'],
  ['Sell', 'Reach local buyers', '/action/sell'],
  ['Request', 'Tell people what you need', '/action/request'],
  ['Services', 'Find skilled help', '/action/services'],
] as const;

export default function ConsumerHome() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.location}>Mbare, Harare</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(consumer)/profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>TM</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>What are you looking for?</Text>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search products, shops and services"
          placeholder="Products, shops, services..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={() => router.push('/(consumer)/discover')}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.actionGrid}>
        {actions.map(([title, detail, href]) => (
          <Pressable
            accessibilityRole="button"
            key={title}
            onPress={() => router.push(href)}
            style={styles.action}
          >
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDetail}>{detail}</Text>
          </Pressable>
        ))}
      </View>
      <SectionHeader
        title="Near you"
        action="See all"
        onAction={() => router.push('/(consumer)/discover')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ScrollView>
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
          <Text style={styles.opportunityTitle}>Electrician needed tomorrow</Text>
          <Text style={styles.opportunityDetail}>Waterfalls · Posted 18 min ago</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <SectionHeader title="Shops near you" />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/action/shop-profile')}
        style={styles.shop}
      >
        <View style={styles.shopLogo}>
          <Text style={styles.shopLogoText}>MV</Text>
        </View>
        <View>
          <Text style={styles.shopName}>Mbare Value Store</Text>
          <Text style={styles.opportunityDetail}>Verified · 1.2 km · Open</Text>
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: colors.muted, fontSize: typography.size.caption },
  location: { marginTop: 2, color: colors.ink, fontSize: typography.size.body, fontWeight: '800' },
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
    maxWidth: 330,
    marginTop: spacing[8],
    color: colors.ink,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  search: {
    minHeight: 58,
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
  actionTitle: { color: colors.surface, fontSize: 17, fontWeight: '900' },
  actionDetail: { color: '#a9c4b8', fontSize: 11, lineHeight: 15 },
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
    backgroundColor: '#fff0d8',
  },
  opportunityBadgeText: { color: colors.warning, fontSize: 10, fontWeight: '900' },
  opportunityBody: { flex: 1, marginLeft: spacing[3] },
  opportunityTitle: { color: colors.ink, fontWeight: '800' },
  opportunityDetail: {
    marginTop: spacing[1],
    color: colors.muted,
    fontSize: typography.size.caption,
  },
  arrow: { color: colors.muted, fontSize: 28 },
  shop: {
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
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
  shopName: { color: colors.ink, fontWeight: '900' },
});
