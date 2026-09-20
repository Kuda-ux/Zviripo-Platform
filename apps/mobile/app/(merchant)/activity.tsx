import { colors, copy, radii, spacing } from '@comodities/ui';
import { getSales, type Payment } from '@comodities/database';
import { formatMinor } from '@comodities/utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { SyncStatus, type SyncPhase } from '../../src/components/sync-status';
import { useAuth } from '../../src/lib/auth-context';
import { useConnectivity, useOnReconnect } from '../../src/lib/connectivity';
import { pendingSaleCount, syncPendingSales } from '../../src/lib/offline-pos';
import { supabase } from '../../src/lib/supabase';
import { Icon } from '../../src/ui/icon';
import { Card, Row } from '../../src/ui/layout';
import { EmptyState, ErrorState, SkeletonRow } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

type SaleRow = Awaited<ReturnType<typeof getSales>>['data'][number];

const methodLabels: Record<Payment['method'], string> = {
  cash: 'Cash',
  mobile_money: 'Mobile money',
  card: 'Card',
  bank_transfer: 'Bank transfer',
  credit: 'On Book',
  other: 'Other',
};

function isToday(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function timeOf(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function MerchantActivity() {
  const { businesses } = useAuth();
  const business = businesses[0]?.business ?? null;
  const connectivity = useConnectivity();

  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(0);
  const [phase, setPhase] = useState<SyncPhase>('idle');

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
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await getSales(supabase, business.id, 100);
    if (loadError) setError(loadError);
    else setSales(data);
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

  if (!business) {
    return (
      <Screen>
        <EmptyState
          action={{ label: 'Create my business', onPress: () => router.push('/(merchant)/setup') }}
          detail="Your sales history is tied to a business. Set it up first."
          icon="business"
          title="Set up your business first"
        />
      </Screen>
    );
  }

  const today = sales.filter((s) => isToday(s.occurred_at));
  const earlier = sales.filter((s) => !isToday(s.occurred_at));

  const renderRow = (sale: SaleRow) => {
    const items = (sale.sale_items as { quantity: number }[] | undefined) ?? [];
    const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const payments = (sale.payments as Payment[] | undefined) ?? [];
    const method = payments[0]?.method ? methodLabels[payments[0].method] : 'Sale';
    return (
      <View key={sale.id} style={styles.row}>
        <View style={styles.icon}>
          <Icon color={colors.success} name="check" size={18} />
        </View>
        <View style={styles.body}>
          <Text role="headingSm">{sale.receipt_number ?? 'Sale'}</Text>
          <Text role="caption" tone="muted" style={{ marginTop: spacing[1] }}>
            {formatMinor(sale.total_minor, sale.currency_code)} · {method} · {count}{' '}
            {count === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Text role="caption" tone="muted">
          {timeOf(sale.occurred_at)}
        </Text>
      </View>
    );
  };

  return (
    <Screen
      onRefresh={async () => {
        await sync();
        await load();
      }}
    >
      <Row justify="space-between" style={styles.header}>
        <View>
          <Text role="label" tone="brand">
            HISTORY
          </Text>
          <Text role="headingXl">Activity</Text>
        </View>
        <SyncStatus connectivity={connectivity} onPress={sync} pending={pending} phase={phase} />
      </Row>

      {loading ? (
        <View style={styles.list}>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : sales.length === 0 ? (
        <EmptyState
          action={{
            label: copy.empty.sales.action,
            onPress: () => router.push('/(merchant)/sell'),
          }}
          detail={copy.empty.sales.detail}
          icon="receipt"
          title={copy.empty.sales.title}
        />
      ) : (
        <>
          <Text role="label" tone="muted" style={styles.date}>
            TODAY
          </Text>
          <Card style={styles.group}>
            {today.length > 0 ? (
              today.map(renderRow)
            ) : (
              <Text role="bodySm" tone="muted" style={styles.groupEmpty}>
                {copy.empty.sales.detail}
              </Text>
            )}
          </Card>
          {earlier.length > 0 ? (
            <>
              <Text role="label" tone="muted" style={styles.date}>
                EARLIER
              </Text>
              <Card style={styles.group}>{earlier.map(renderRow)}</Card>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing[2] },
  list: { marginTop: spacing[5], gap: spacing[3] },
  date: { marginTop: spacing[6], marginBottom: spacing[3] },
  group: { padding: 0, overflow: 'hidden' },
  groupEmpty: { padding: spacing[4] },
  row: {
    minHeight: 72,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
  },
  body: { flex: 1, marginLeft: spacing[3] },
});
