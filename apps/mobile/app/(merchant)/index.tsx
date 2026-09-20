import { colors, copy, spacing, type IconName } from '@comodities/ui';
import { getSales, listBusinessProducts } from '@comodities/database';
import { formatMinor } from '@comodities/utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { SyncStatus, type SyncPhase } from '../../src/components/sync-status';
import { useAuth } from '../../src/lib/auth-context';
import { useConnectivity, useOnReconnect } from '../../src/lib/connectivity';
import { pendingSaleCount, syncPendingSales } from '../../src/lib/offline-pos';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, Row, SectionHeader } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState, Skeleton } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

export default function MerchantDashboard() {
  const { session, loading: authLoading, businesses } = useAuth();
  const business = businesses[0]?.business ?? null;
  const connectivity = useConnectivity();

  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [pending, setPending] = useState(0);
  const [phase, setPhase] = useState<SyncPhase>('idle');
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState(0);
  const [listedCount, setListedCount] = useState(0);
  const [lowItems, setLowItems] = useState<string[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'ZWG'>('USD');

  const sync = useCallback(async () => {
    if (connectivity === 'offline') return;
    setPhase('syncing');
    const result = await syncPendingSales();
    setPhase(result.failed > 0 ? 'failed' : 'idle');
    setPending(result.pending);
  }, [connectivity]);

  const load = useCallback(async () => {
    setPending(await pendingSaleCount());
    if (!business) {
      setLoading(false);
      return;
    }
    const [{ data: sales }, { data: products }] = await Promise.all([
      getSales(supabase, business.id, 100),
      listBusinessProducts(supabase, business.id),
    ]);
    const today = new Date();
    const sameDay = sales.filter((sale) => {
      const occurred = new Date(sale.occurred_at);
      return (
        occurred.getFullYear() === today.getFullYear() &&
        occurred.getMonth() === today.getMonth() &&
        occurred.getDate() === today.getDate()
      );
    });
    setTodayTotal(sameDay.reduce((sum, sale) => sum + sale.total_minor, 0));
    setTodayCount(sameDay.length);
    setCurrency((sales[0]?.currency_code as 'USD' | 'ZWG' | undefined) ?? 'USD');
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
    const low = products.filter(
      (row) => (row.inventory?.quantity ?? 0) <= (row.inventory?.low_stock_threshold ?? 3),
    );
    setLowStock(low.length);
    setLowItems(low.map((row) => row.product?.name ?? row.sku ?? 'Unnamed product').slice(0, 3));
    setListedCount(products.filter((row) => row.is_listed).length);
    setLoading(false);
  }, [business]);

  useEffect(() => {
    load();
    sync();
  }, [load, sync]);

  useOnReconnect(() => {
    sync();
    load();
  });

  const state = useMemo(() => {
    if (authLoading) return 'loading';
    if (!session) return 'signed-out';
    if (!business) return 'no-business';
    return 'ready';
  }, [authLoading, session, business]);

  if (state === 'loading') {
    return (
      <Screen>
        <Skeleton height={20} width="40%" />
        <Skeleton height={120} radius={16} style={styles.gap} />
        <Skeleton height={90} radius={16} style={styles.gap} />
      </Screen>
    );
  }

  if (state === 'signed-out') {
    return (
      <Screen>
        <EmptyState
          action={{ label: 'Sign in', onPress: () => router.push('/(auth)/sign-in') }}
          detail="Your sales, stock, and credit are tied to your business account."
          icon="business"
          title="Sign in to run your shop"
        />
      </Screen>
    );
  }

  if (state === 'no-business') {
    return (
      <Screen>
        <EmptyState
          action={{ label: 'Create my business', onPress: () => router.push('/(merchant)/setup') }}
          detail="Add your business name and area to start selling and publishing stock."
          icon="business"
          title="Set up your shop"
        />
      </Screen>
    );
  }

  return (
    <Screen
      onRefresh={async () => {
        await sync();
        await load();
      }}
    >
      <Row justify="space-between" style={styles.header}>
        <View>
          <Text role="caption" tone="muted">
            {copy.tagline}
          </Text>
          <Text role="headingMd">{business!.name}</Text>
        </View>
        <SyncStatus connectivity={connectivity} onPress={sync} pending={pending} phase={phase} />
      </Row>

      <Card style={styles.hero} tone="forest">
        <Text role="label" style={{ color: colors.gold[500] }}>
          TODAY'S BUSINESS
        </Text>
        {loading ? (
          <Skeleton height={42} style={{ marginTop: spacing[4] }} width="55%" />
        ) : (
          <Text role="display" tone="onDark" style={styles.heroValue}>
            {formatMinor(todayTotal, currency)}
          </Text>
        )}
        <Text role="bodySm" tone="onDarkMuted" style={{ marginTop: spacing[2] }}>
          {todayCount} {todayCount === 1 ? 'transaction' : 'transactions'} · {itemCount} items sold
        </Text>
      </Card>

      <Row gap={spacing[3]} style={styles.metrics}>
        <MetricTile
          detail={`${listedCount === 1 ? 'product' : 'products'} live for buyers`}
          label="Marketplace"
          value={String(listedCount)}
        />
        <MetricTile
          accent={lowStock > 0}
          detail={lowStock > 0 ? 'See inventory' : 'Stock looks healthy'}
          label="Low stock"
          value={String(lowStock)}
        />
      </Row>

      <Button
        fullWidth
        icon="sell"
        label="Sell now"
        onPress={() => router.push('/(merchant)/sell')}
        size="lg"
        style={styles.sell}
        variant="gold"
      />
      <Row gap={spacing[3]}>
        <QuickAction
          icon="inventory"
          label="Add stock"
          onPress={() => router.push('/(merchant)/inventory')}
        />
        <QuickAction
          icon="add"
          label="Add product"
          onPress={() => router.push('/(merchant)/add-product')}
        />
        <QuickAction
          icon="trendUp"
          label="Activity"
          onPress={() => router.push('/(merchant)/activity')}
        />
      </Row>

      <SectionHeader eyebrow="ATTENTION" title="Needs you" />
      {pending > 0 ? (
        <AttentionCard
          body={copy.sync.pending(pending).detail}
          icon="sync"
          label="SYNC"
          onPress={connectivity === 'offline' ? undefined : sync}
          title={copy.sync.pending(pending).label}
        />
      ) : null}
      {lowItems.length > 0 ? (
        <AttentionCard
          body="Review stock levels in inventory"
          icon="lowStock"
          label="RESTOCK SOON"
          onPress={() => router.push('/(merchant)/inventory')}
          title={`${lowItems[0]}${lowItems.length > 1 ? ` and ${lowItems.length - 1} more` : ''} running low`}
        />
      ) : null}
      {listedCount === 0 && !loading ? (
        <AttentionCard
          body="Turn on “List on Zviripo” for a product to appear in search"
          icon="sell"
          label="MARKETPLACE"
          onPress={() => router.push('/(merchant)/inventory')}
          title="Nothing is visible to buyers yet"
        />
      ) : null}
      {pending === 0 && lowItems.length === 0 && listedCount > 0 ? (
        <Card style={styles.attention}>
          <Text role="label" tone="success">
            ALL CLEAR
          </Text>
          <Text role="headingSm" style={styles.attentionTitle}>
            Your business is up to date
          </Text>
          <Text role="bodySm" tone="muted">
            {listedCount} {listedCount === 1 ? 'product' : 'products'} live on Zviripo
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function MetricTile({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <Card style={styles.metric}>
      <Text role="caption" tone="muted">
        {label}
      </Text>
      <Text role="headingLg" style={{ marginTop: spacing[2] }}>
        {value}
      </Text>
      <Text role="caption" tone={accent ? 'warning' : 'success'} style={{ marginTop: spacing[1] }}>
        {detail}
      </Text>
    </Card>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Press
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.quick}
    >
      <Icon color={colors.brand.forestDeep} name={icon} size={20} />
      <Text role="caption" style={{ fontWeight: '800' }}>
        {label}
      </Text>
    </Press>
  );
}

function AttentionCard({
  label,
  title,
  body,
  icon,
  onPress,
}: {
  label: string;
  title: string;
  body: string;
  icon: IconName;
  onPress?: () => void;
}) {
  return (
    <Press
      accessibilityLabel={`${title}. ${body}`}
      accessibilityRole={onPress ? 'button' : 'summary'}
      disabled={!onPress}
      feedback={!!onPress}
      onPress={onPress}
    >
      <Card style={styles.attention}>
        <Row justify="space-between">
          <View style={{ flex: 1 }}>
            <Text role="label" tone="brand">
              {label}
            </Text>
            <Text role="headingSm" style={styles.attentionTitle}>
              {title}
            </Text>
            <Text role="bodySm" tone="muted">
              {body}
            </Text>
          </View>
          <Icon color={colors.muted} name={onPress ? 'forward' : icon} size={onPress ? 20 : 22} />
        </Row>
      </Card>
    </Press>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing[2] },
  gap: { marginTop: spacing[4] },
  hero: { marginTop: spacing[5], padding: spacing[6] },
  heroValue: { marginTop: spacing[3] },
  metrics: { marginTop: spacing[3], alignItems: 'stretch' },
  metric: { flex: 1, minHeight: 110 },
  sell: { marginTop: spacing[5], marginBottom: spacing[3] },
  quick: {
    minHeight: 76,
    flex: 1,
    padding: spacing[3],
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  attention: { marginBottom: spacing[3] },
  attentionTitle: { marginTop: spacing[1], marginBottom: spacing[1] },
});
