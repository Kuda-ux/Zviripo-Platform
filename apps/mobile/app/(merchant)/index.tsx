import { colors, radii, spacing, typography } from '@comodities/ui';
import { getSales, listBusinessProducts } from '@comodities/database';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../../src/components/metric-card';
import { Screen } from '../../src/components/screen';
import { SectionHeader } from '../../src/components/section-header';
import { SyncPill } from '../../src/components/sync-pill';
import { useAuth } from '../../src/lib/auth-context';
import { pendingSaleCount, syncPendingSales } from '../../src/lib/offline-pos';
import { supabase } from '../../src/lib/supabase';

function formatCurrency(minor: number, currency: 'USD' | 'ZWG' = 'USD') {
  const amount = minor / 100;
  return currency === 'USD' ? `$${amount.toFixed(2)}` : `Z$ ${amount.toFixed(2)}`;
}

export default function MerchantDashboard() {
  const { session, loading, businesses } = useAuth();
  const business = businesses[0]?.business ?? null;

  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [pending, setPending] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [listedCount, setListedCount] = useState(0);
  const [lowItems, setLowItems] = useState<string[]>([]);

  useEffect(() => {
    pendingSaleCount().then(setPending);
    syncPendingSales().then(({ pending }) => setPending(pending));
    if (!business) return;
    getSales(supabase, business.id, 100).then(({ data }) => {
      const today = new Date();
      const sameDay = data.filter((sale) => {
        const occurred = new Date(sale.occurred_at);
        return (
          occurred.getFullYear() === today.getFullYear() &&
          occurred.getMonth() === today.getMonth() &&
          occurred.getDate() === today.getDate()
        );
      });
      setTodayTotal(sameDay.reduce((sum, sale) => sum + sale.total_minor, 0));
      setTodayCount(sameDay.length);
      setItemCount(
        sameDay.reduce(
          (sum, sale) =>
            sum +
            ((sale.sale_items as { quantity: number }[] | undefined) ?? []).reduce(
              (inner, item) => inner + Number(item.quantity),
              0,
            ),
          0,
        ),
      );
    });
    listBusinessProducts(supabase, business.id).then(({ data }) => {
      const low = data.filter(
        (row) => (row.inventory?.quantity ?? 0) <= (row.inventory?.low_stock_threshold ?? 3),
      );
      setLowStock(low.length);
      setLowItems(low.map((row) => row.product?.name ?? row.sku ?? 'Unnamed product').slice(0, 3));
      setListedCount(data.filter((row) => row.is_listed).length);
    });
  }, [business?.id]);

  const state = useMemo(() => {
    if (loading) return 'loading';
    if (!session) return 'signed-out';
    if (!business) return 'no-business';
    return 'ready';
  }, [loading, session, business]);

  if (state === 'loading') {
    return (
      <Screen>
        <Text style={styles.greeting}>Loading your workspace…</Text>
      </Screen>
    );
  }

  if (state === 'signed-out') {
    return (
      <Screen>
        <Text style={styles.eyebrow}>BUSINESS</Text>
        <Text style={styles.title}>Sign in to run your shop.</Text>
        <Text style={styles.description}>
          Your sales, stock, and credit are tied to your business account.
        </Text>
        <Pressable onPress={() => router.push('/(auth)/sign-in')} style={styles.cta}>
          <Text style={styles.ctaText}>Sign in</Text>
        </Pressable>
      </Screen>
    );
  }

  if (state === 'no-business') {
    return (
      <Screen>
        <Text style={styles.eyebrow}>BUSINESS</Text>
        <Text style={styles.title}>Set up your shop.</Text>
        <Text style={styles.description}>
          Add your business name and area to start selling and publishing stock.
        </Text>
        <Pressable onPress={() => router.push('/(merchant)/setup')} style={styles.cta}>
          <Text style={styles.ctaText}>Create my business</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.business}>{business!.name}</Text>
        </View>
        <SyncPill pending={pending} />
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY'S BUSINESS</Text>
        <Text style={styles.heroValue}>{formatCurrency(todayTotal)}</Text>
        <Text style={styles.heroDetail}>
          {todayCount} transactions · {itemCount} items sold
        </Text>
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Marketplace" value={String(listedCount)} detail="products listed" />
        <MetricCard label="Low stock" value={String(lowStock)} detail="See inventory" />
      </View>
      <SectionHeader title="Quick actions" />
      <View style={styles.actions}>
        <Link href="/(merchant)/sell" style={styles.sell}>
          Sell now
        </Link>
        {[
          ['Add stock', '/(merchant)/inventory'],
          ['Add product', '/(merchant)/add-product'],
          ['Inventory', '/(merchant)/inventory'],
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
      <SectionHeader title="Attention" />
      {pending > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            const { pending } = await syncPendingSales();
            setPending(pending);
          }}
          style={styles.insight}
        >
          <View>
            <Text style={styles.insightLabel}>SYNC</Text>
            <Text style={styles.insightTitle}>
              {pending} {pending === 1 ? 'sale' : 'sales'} saved safely on this device
            </Text>
            <Text style={styles.insightDetail}>Tap to sync now</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ) : null}
      {lowItems.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(merchant)/inventory')}
          style={styles.insight}
        >
          <View>
            <Text style={styles.insightLabel}>RESTOCK SOON</Text>
            <Text style={styles.insightTitle}>
              {lowItems[0]}
              {lowItems.length > 1 ? ` and ${lowItems.length - 1} more` : ''} running low
            </Text>
            <Text style={styles.insightDetail}>Review stock levels in inventory</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ) : null}
      {listedCount === 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(merchant)/inventory')}
          style={styles.insight}
        >
          <View>
            <Text style={styles.insightLabel}>MARKETPLACE</Text>
            <Text style={styles.insightTitle}>Nothing is visible to buyers yet</Text>
            <Text style={styles.insightDetail}>
              Turn on “List on Zviripo” for a product to appear in search
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ) : null}
      {pending === 0 && lowItems.length === 0 && listedCount > 0 ? (
        <View style={styles.insight}>
          <View>
            <Text style={styles.insightLabel}>ALL CLEAR</Text>
            <Text style={styles.insightTitle}>Your business is up to date</Text>
            <Text style={styles.insightDetail}>
              {listedCount} {listedCount === 1 ? 'product' : 'products'} live on Zviripo
            </Text>
          </View>
        </View>
      ) : null}
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
  eyebrow: { color: colors.brand[700], fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.display,
    fontWeight: '900',
  },
  description: { marginTop: spacing[3], color: colors.muted, fontSize: typography.size.body },
  greeting: { color: colors.muted, fontSize: typography.size.caption },
  business: { marginTop: 2, color: colors.ink, fontSize: 18, fontWeight: '900' },
  cta: {
    minHeight: 54,
    marginTop: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  ctaText: { color: colors.surface, fontWeight: '900' },
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
    backgroundColor: colors.accent[500],
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
