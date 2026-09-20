import { colors, copy, radii, spacing, type IconName } from '@comodities/ui';
import {
  listBusinessProducts,
  type BusinessProduct,
  type Inventory,
  type Payment,
  type Product,
  type SaleInput,
} from '@comodities/database';
import { formatMinor, newOperationId, receiptNumber } from '@comodities/utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { SyncStatus, type SyncPhase } from '../../src/components/sync-status';
import { useAuth } from '../../src/lib/auth-context';
import { useConnectivity, useOnReconnect } from '../../src/lib/connectivity';
import { pendingSaleCount, queueSale, syncPendingSales } from '../../src/lib/offline-pos';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Input } from '../../src/ui/input';
import { Card, Chip, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState, ErrorState, SkeletonRow } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

type PaymentMethod = Payment['method'];

const methods: Array<{ id: PaymentMethod; label: string; icon: IconName }> = [
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'mobile_money', label: 'Mobile money', icon: 'mobileMoney' },
  { id: 'card', label: 'Card', icon: 'card' },
  { id: 'bank_transfer', label: 'Bank transfer', icon: 'receipt' },
];

interface SaleItem {
  businessProduct: BusinessProduct;
  product: Product | undefined;
  inventory: Inventory | undefined;
}

export default function SellScreen() {
  const { businesses, deviceId } = useAuth();
  const business = businesses[0]?.business ?? null;
  const connectivity = useConnectivity();

  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(0);
  const [phase, setPhase] = useState<SyncPhase>('idle');

  const refreshPending = useCallback(async () => setPending(await pendingSaleCount()), []);

  const load = useCallback(async () => {
    if (!business) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await listBusinessProducts(supabase, business.id);
    if (loadError) setError(loadError);
    else
      setItems(
        data.map((row) => ({
          businessProduct: row,
          product: row.product,
          inventory: row.inventory,
        })),
      );
    setLoading(false);
  }, [business]);

  const sync = useCallback(async () => {
    if (connectivity === 'offline') return;
    setPhase('syncing');
    const result = await syncPendingSales();
    setPhase(result.failed > 0 ? 'failed' : 'idle');
    setPending(result.pending);
  }, [connectivity]);

  useEffect(() => {
    load();
    refreshPending();
    sync();
  }, [load, refreshPending, sync]);

  useOnReconnect(() => {
    sync();
    load();
  });

  const visible = items.filter((item) =>
    (item.product?.name ?? item.businessProduct.sku ?? '')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const entryCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const currency = items[0]?.businessProduct.currency_code ?? 'USD';
  const totalMinor = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.businessProduct.price_minor * (cart[item.businessProduct.id] ?? 0),
        0,
      ),
    [cart, items],
  );

  function setQty(id: string, next: number, stock: number) {
    setCart((current) => {
      const clamped = Math.max(0, Math.min(next, stock));
      const updated = { ...current };
      if (clamped === 0) delete updated[id];
      else updated[id] = clamped;
      return updated;
    });
  }

  async function record() {
    if (!business || !deviceId || entryCount === 0) return;
    setBusy(true);

    const selected = items.filter((item) => cart[item.businessProduct.id]);
    const input: SaleInput = {
      businessId: business.id,
      deviceId,
      operationId: newOperationId(),
      receiptNumber: receiptNumber(),
      currencyCode: currency,
      subtotalMinor: totalMinor,
      totalMinor,
      occurredAt: new Date().toISOString(),
      items: selected.map((item) => ({
        businessProductId: item.businessProduct.id,
        productName: item.product?.name ?? item.businessProduct.sku ?? 'Item',
        quantity: cart[item.businessProduct.id],
        unitPriceMinor: item.businessProduct.price_minor,
        lineTotalMinor: item.businessProduct.price_minor * cart[item.businessProduct.id],
      })),
      payment: { method, amountMinor: totalMinor },
    };

    try {
      await queueSale(input);
      const result =
        connectivity === 'offline'
          ? { synced: 0, failed: 1, pending: 1 }
          : await syncPendingSales();

      setBusy(false);
      setCart({});
      await load();
      await refreshPending();

      if (result.synced > 0 && result.failed === 0) {
        Alert.alert(copy.sale.recordedSynced.title, copy.sale.recordedSynced.detail);
      } else {
        Alert.alert(copy.sale.recordedLocal.title, copy.sale.recordedLocal.detail);
      }
    } catch (queueError) {
      setBusy(false);
      Alert.alert(copy.error.save.title, String(queueError));
    }
  }

  const methodLabel = methods.find((m) => m.id === method)?.label ?? method;
  const reviewSale = () => {
    Alert.alert(
      'Record this sale?',
      `${entryCount} ${entryCount === 1 ? 'item' : 'items'} · ${formatMinor(totalMinor, currency)} · ${methodLabel}`,
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Record sale', onPress: record },
      ],
    );
  };

  if (!business) {
    return (
      <Screen>
        <EmptyState
          action={{ label: 'Create my business', onPress: () => router.push('/(merchant)/setup') }}
          detail="Your sales are tied to a business. Set it up to start selling."
          icon="business"
          title="Set up your business first"
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.checkout}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
            <Row gap={spacing[2]}>
              {methods.map((m) => (
                <Chip
                  active={method === m.id}
                  icon={m.icon}
                  key={m.id}
                  label={m.label}
                  onPress={() => setMethod(m.id)}
                />
              ))}
            </Row>
          </ScrollView>
          <Row justify="space-between" style={styles.checkoutRow}>
            <View>
              <Text role="caption" tone="muted">
                {entryCount} {entryCount === 1 ? 'item' : 'items'} · {methodLabel}
              </Text>
              <Text role="headingLg">{formatMinor(totalMinor, currency)}</Text>
            </View>
            <Button
              disabled={!entryCount}
              label="Record sale"
              loading={busy}
              onPress={reviewSale}
              size="lg"
              variant="gold"
            />
          </Row>
        </View>
      }
      onRefresh={async () => {
        await sync();
        await load();
      }}
    >
      <Row justify="space-between" style={styles.header}>
        <View>
          <Text role="label" tone="brand">
            NEW SALE
          </Text>
          <Text role="headingXl">Sell</Text>
        </View>
        <SyncStatus connectivity={connectivity} onPress={sync} pending={pending} phase={phase} />
      </Row>

      <View style={styles.search}>
        <Input
          icon="search"
          onChangeText={setQuery}
          placeholder="Search product or SKU"
          value={query}
        />
      </View>

      {loading ? (
        <View style={styles.list}>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <EmptyState
          action={
            query
              ? undefined
              : {
                  label: copy.empty.inventory.action,
                  onPress: () => router.push('/(merchant)/add-product'),
                }
          }
          detail={query ? 'Try a different name or SKU.' : copy.empty.inventory.detail}
          icon="inventory"
          title={query ? `Nothing matches “${query}”` : copy.empty.inventory.title}
        />
      ) : (
        <View style={styles.list}>
          {visible.map((item) => {
            const id = item.businessProduct.id;
            const stock = item.inventory?.quantity ?? 0;
            const qty = cart[id] ?? 0;
            const soldOut = stock <= 0;
            return (
              <Card key={id} style={styles.product}>
                <Row>
                  <View style={styles.productImage}>
                    <Text role="headingMd" tone="brand">
                      {(item.product?.name ?? item.businessProduct.sku ?? '?')[0]}
                    </Text>
                  </View>
                  <View style={styles.productBody}>
                    <Text numberOfLines={1} role="headingSm">
                      {item.product?.name ?? item.businessProduct.sku ?? 'Unnamed'}
                    </Text>
                    <Text
                      role="caption"
                      tone={soldOut ? 'danger' : stock <= 3 ? 'warning' : 'muted'}
                    >
                      {soldOut ? 'Out of stock' : `${stock} in stock`}
                    </Text>
                  </View>
                  <View style={styles.priceBlock}>
                    <Text role="headingSm">
                      {formatMinor(
                        item.businessProduct.price_minor,
                        item.businessProduct.currency_code,
                      )}
                    </Text>
                    {qty > 0 ? (
                      <Row gap={spacing[2]}>
                        <Press
                          accessibilityLabel={`Remove one ${item.product?.name ?? 'item'}`}
                          accessibilityRole="button"
                          onPress={() => setQty(id, qty - 1, stock)}
                          style={styles.stepper}
                        >
                          <Icon color={colors.ink} name="remove" size={16} />
                        </Press>
                        <Text role="headingSm" style={styles.qty}>
                          {qty}
                        </Text>
                        <Press
                          accessibilityLabel={`Add one ${item.product?.name ?? 'item'}`}
                          accessibilityRole="button"
                          disabled={qty >= stock}
                          onPress={() => setQty(id, qty + 1, stock)}
                          style={[styles.stepper, qty >= stock && styles.stepperDisabled]}
                        >
                          <Icon color={colors.ink} name="add" size={16} />
                        </Press>
                      </Row>
                    ) : (
                      <Press
                        accessibilityLabel={`Add ${item.product?.name ?? 'item'} to sale`}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: soldOut }}
                        disabled={soldOut}
                        onPress={() => setQty(id, 1, stock)}
                        style={[styles.addButton, soldOut && styles.stepperDisabled]}
                      >
                        <Text role="caption" tone="brand" style={{ fontWeight: '800' }}>
                          {soldOut ? 'Sold out' : 'Add'}
                        </Text>
                      </Press>
                    )}
                  </View>
                </Row>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing[2] },
  search: { marginTop: spacing[5] },
  list: { marginTop: spacing[5], gap: spacing[3] },
  product: { padding: spacing[3] },
  productImage: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.brand.tint,
  },
  productBody: { flex: 1, marginLeft: spacing[3] },
  priceBlock: { alignItems: 'flex-end', gap: spacing[2] },
  addButton: {
    minHeight: 36,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand.tint,
  },
  stepper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepperDisabled: { opacity: 0.4 },
  qty: { minWidth: 20, textAlign: 'center' },
  checkout: {
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodScroll: { flexGrow: 0, paddingHorizontal: spacing[5] },
  checkoutRow: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[5],
  },
});
