import { colors, copy, radii, spacing } from '@comodities/ui';
import {
  listBusinessProducts,
  toggleListed,
  updateStock,
  type BusinessProduct,
  type Inventory,
  type Product,
} from '@comodities/database';
import { formatMinor, humanizeError } from '@comodities/utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { useOnReconnect } from '../../src/lib/connectivity';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Input } from '../../src/ui/input';
import { Card, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState, ErrorState, SkeletonRow } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

interface RowData {
  businessProduct: BusinessProduct;
  product: Product | undefined;
  inventory: Inventory | undefined;
}

export default function InventoryScreen() {
  const { businesses } = useAuth();
  const business = businesses[0]?.business ?? null;

  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(1);

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
      setRows(
        data.map((row) => ({
          businessProduct: row,
          product: row.product,
          inventory: row.inventory,
        })),
      );
    setLoading(false);
  }, [business]);

  useEffect(() => {
    load();
  }, [load]);

  useOnReconnect(load);

  const visible = rows.filter((row) =>
    (row.product?.name ?? row.businessProduct.sku ?? '')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const lowCount = rows.filter(
    (row) => (row.inventory?.quantity ?? 0) <= (row.inventory?.low_stock_threshold ?? 3),
  ).length;

  async function toggle(row: RowData) {
    if (!business) return;
    setBusyId(row.businessProduct.id);
    const { error: toggleError } = await toggleListed(
      supabase,
      row.businessProduct.id,
      !row.businessProduct.is_listed,
    );
    setBusyId(null);
    if (toggleError) {
      const human = humanizeError(toggleError, 'save');
      Alert.alert(human.title, human.detail);
      return;
    }
    await load();
  }

  async function confirmRestock(row: RowData) {
    if (!business || restockQty <= 0) return;
    setBusyId(row.businessProduct.id);
    const { error: stockError } = await updateStock(supabase, {
      businessId: business.id,
      businessProductId: row.businessProduct.id,
      delta: restockQty,
      reason: 'purchase',
    });
    setBusyId(null);
    if (stockError) {
      const human = humanizeError(stockError, 'save');
      Alert.alert(human.title, human.detail);
      return;
    }
    setRestockId(null);
    setRestockQty(1);
    await load();
  }

  if (!business) {
    return (
      <Screen>
        <EmptyState
          action={{ label: 'Create my business', onPress: () => router.push('/(merchant)/setup') }}
          detail="Your stock is tied to a business. Set it up first."
          icon="business"
          title="Set up your business first"
        />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={load}>
      <Row justify="space-between" style={styles.header}>
        <View>
          <Text role="label" tone="brand">
            PRODUCTS & STOCK
          </Text>
          <Text role="headingXl">Inventory</Text>
        </View>
        <Button
          icon="add"
          label="Add"
          onPress={() => router.push('/(merchant)/add-product')}
          variant="secondary"
        />
      </Row>

      <View style={styles.search}>
        <Input icon="search" onChangeText={setQuery} placeholder="Search inventory" value={query} />
      </View>

      <Row justify="space-between" style={styles.summary}>
        <Text role="caption" tone="muted">
          {rows.length} {rows.length === 1 ? 'product' : 'products'}
        </Text>
        {lowCount > 0 ? (
          <Text role="caption" tone="warning">
            {lowCount} low stock
          </Text>
        ) : null}
      </Row>

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
          {visible.map((row) => {
            const id = row.businessProduct.id;
            const stock = row.inventory?.quantity ?? 0;
            const low = stock <= (row.inventory?.low_stock_threshold ?? 3);
            const restocking = restockId === id;
            return (
              <Card key={id} style={styles.item}>
                <Row align="flex-start">
                  <View style={styles.initial}>
                    <Text role="headingMd" tone="brand">
                      {(row.product?.name ?? row.businessProduct.sku ?? '?')[0]}
                    </Text>
                  </View>
                  <View style={styles.itemBody}>
                    <Text numberOfLines={1} role="headingSm">
                      {row.product?.name ?? row.businessProduct.sku ?? 'Unnamed'}
                    </Text>
                    <Text role="caption" tone="muted" style={{ marginTop: spacing[1] }}>
                      {formatMinor(
                        row.businessProduct.price_minor,
                        row.businessProduct.currency_code,
                      )}
                      {' · '}
                      {row.businessProduct.is_listed ? 'Listed on Zviripo' : 'Not listed'}
                    </Text>
                    <Row gap={spacing[2]} style={styles.rowActions}>
                      <Button
                        disabled={busyId === id}
                        label={row.businessProduct.is_listed ? 'Unlist' : 'List on Zviripo'}
                        loading={busyId === id && !restocking}
                        onPress={() => toggle(row)}
                        size="sm"
                        variant="secondary"
                      />
                      <Button
                        label={restocking ? 'Close' : 'Add stock'}
                        onPress={() => {
                          setRestockId(restocking ? null : id);
                          setRestockQty(1);
                        }}
                        size="sm"
                        variant={restocking ? 'ghost' : 'secondary'}
                      />
                    </Row>
                  </View>
                  <View style={styles.stockBlock}>
                    <Text role="headingMd" tone={low ? 'warning' : 'ink'}>
                      {stock}
                    </Text>
                    <Text role="caption" tone="muted">
                      in stock
                    </Text>
                  </View>
                </Row>
                {restocking ? (
                  <View style={styles.restock}>
                    <Row justify="space-between">
                      <Text role="caption" tone="muted">
                        Quantity received
                      </Text>
                      <Row gap={spacing[2]}>
                        <Press
                          accessibilityLabel="Reduce quantity"
                          accessibilityRole="button"
                          onPress={() => setRestockQty((q) => Math.max(1, q - 1))}
                          style={styles.stepper}
                        >
                          <Icon color={colors.ink} name="remove" size={16} />
                        </Press>
                        <Text role="headingMd" style={styles.qty}>
                          {restockQty}
                        </Text>
                        <Press
                          accessibilityLabel="Increase quantity"
                          accessibilityRole="button"
                          onPress={() => setRestockQty((q) => Math.min(9999, q + 1))}
                          style={styles.stepper}
                        >
                          <Icon color={colors.ink} name="add" size={16} />
                        </Press>
                      </Row>
                    </Row>
                    <Button
                      disabled={busyId === id}
                      fullWidth
                      label={`Add ${restockQty} to stock`}
                      loading={busyId === id}
                      onPress={() => confirmRestock(row)}
                      style={{ marginTop: spacing[3] }}
                    />
                  </View>
                ) : null}
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
  summary: { marginVertical: spacing[4] },
  list: { gap: spacing[3] },
  item: { padding: spacing[3] },
  initial: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.brand.tint,
  },
  itemBody: { flex: 1, marginLeft: spacing[3] },
  rowActions: { marginTop: spacing[3] },
  stockBlock: { alignItems: 'flex-end' },
  restock: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  qty: { minWidth: 32, textAlign: 'center' },
});
