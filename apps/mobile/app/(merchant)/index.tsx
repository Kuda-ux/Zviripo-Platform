import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../../src/components/metric-card';
import { Screen } from '../../src/components/screen';
import { SectionHeader } from '../../src/components/section-header';
import { SyncPill } from '../../src/components/sync-pill';

export default function MerchantDashboard() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.business}>Mbare Value Store</Text>
        </View>
        <SyncPill />
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY'S BUSINESS</Text>
        <Text style={styles.heroValue}>$184.50</Text>
        <Text style={styles.heroDetail}>32 transactions · 47 items sold</Text>
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Outstanding credit" value="$68" detail="5 customers" />
        <MetricCard label="Low stock" value="4" detail="Review inventory" />
      </View>
      <SectionHeader title="Quick actions" />
      <View style={styles.actions}>
        <Link href="/(merchant)/sell" style={styles.sell}>
          Sell now
        </Link>
        {[
          ['Add stock', '/action/add-stock'],
          ['Customers', '/action/customers'],
          ['Credit', '/action/credit'],
        ].map(([item, href]) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() => router.push(href as never)}
            style={styles.action}
          >
            <Text style={styles.actionText}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <SectionHeader
        title="Insights"
        action="View all"
        onAction={() => router.push('/action/insights')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(merchant)/inventory')}
        style={styles.insight}
      >
        <View>
          <Text style={styles.insightLabel}>RESTOCK SOON</Text>
          <Text style={styles.insightTitle}>Roller meal is moving quickly</Text>
          <Text style={styles.insightDetail}>Only 2 left · Usually sells 4 per day</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/action/insights')}
        style={styles.insight}
      >
        <View>
          <Text style={styles.insightLabel}>MARKETPLACE</Text>
          <Text style={styles.insightTitle}>18 products visible nearby</Text>
          <Text style={styles.insightDetail}>All published stock is up to date</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { color: colors.muted, fontSize: typography.size.caption },
  business: { marginTop: 2, color: colors.ink, fontSize: 18, fontWeight: '900' },
  hero: {
    marginTop: spacing[8],
    padding: spacing[6],
    borderRadius: radii.large,
    backgroundColor: colors.brand[900],
  },
  heroLabel: { color: colors.brand[100], fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  heroValue: {
    marginTop: spacing[4],
    color: colors.surface,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  heroDetail: { marginTop: spacing[2], color: '#b8d0c5' },
  metrics: { marginTop: spacing[3], flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  sell: {
    minHeight: 50,
    width: '100%',
    paddingVertical: 15,
    overflow: 'hidden',
    color: colors.brand[900],
    textAlign: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[500],
    fontWeight: '900',
    fontSize: 17,
  },
  action: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  actionText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  insight: {
    minHeight: 94,
    marginBottom: spacing[3],
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  insightLabel: { color: colors.brand[700], fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  insightTitle: { marginTop: spacing[2], color: colors.ink, fontWeight: '900' },
  insightDetail: { marginTop: spacing[1], color: colors.muted, fontSize: typography.size.caption },
  arrow: { color: colors.muted, fontSize: 28 },
});
