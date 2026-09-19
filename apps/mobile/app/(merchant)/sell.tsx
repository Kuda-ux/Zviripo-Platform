import { colors, radii, spacing, typography } from '@comodities/ui';
import {
  listBusinessProducts,
  type BusinessProduct,
  type Inventory,
  type Product,
  type SaleInput,
} from '@comodities/database';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { pendingSaleCount, queueSale, syncPendingSales } from '../../src/lib/offline-pos';
import { supabase } from '../../src/lib/supabase';

interface SaleItem {
  businessProduct: BusinessProduct;
  product: Product | undefined;
  inventory: Inventory | undefined;
}

function formatCurrency(minor: number, currency: 'USD' | 'ZWG') {
  const amount = minor / 100;
  return currency === 'USD' ? `$${amount.toFixed(2)}` : `Z$ ${amount.toFixed(2)}`;
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function SellScreen() {
  const { businesses, deviceId } = useAuth();
  const business = businesses[0]?.business ?? null;

  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(0);

  async function refreshPending() {
    setPending(await pendingSaleCount());
  }

  async function load() {
    if (!business) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await listBusinessProducts(supabase, business.id);
    if (error) {
      setError(error.message);
    } else {
      setItems(
        data.map((row) => ({
          businessProduct: row,
          product: row.product,
          inventory: row.inventory,
        })),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    refreshPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

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

  const add = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));

  async function record() {
    if (!business || !deviceId || entryCount === 0) return;
    setBusy(true);

    const selected = items.filter((item) => cart[item.businessProduct.id]);
    const input: SaleInput = {
      businessId: business.id,
      deviceId,
      operationId: newId(),
      receiptNumber: `R-${Date.now()}`,
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
      payment: { method: 'cash', amountMinor: totalMinor },
    };

    try {
      await queueSale(input);
      const result = await syncPendingSales();

      setBusy(false);
      setCart({});
      await load();
      await refreshPending();

      if (result.failed === 0 && result.synced > 0) {
        Alert.alert('Sale recorded', 'Stock has been updated and the sale is synced.');
      } else {
        Alert.alert(
          'Sale saved on this device',
          'It is safe and will sync automatically when connectivity returns.',
        );
      }
    } catch (queueError) {
      setBusy(false);
      Alert.alert('Sale failed', String(queueError));
    }
  }

  const reviewSale = () => {
    Alert.alert(
      'Record this sale?',
      `${entryCount} items · ${formatCurrency(totalMinor, currency)} · Cash`,
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Record sale', onPress: record },
      ],
    );
  };

  if (!business) {
    return (
      <Screen>
        <Text style={styles.title}>Set up your business first</Text>
        <Pressable onPress={() => router.push('/(merchant)/setup')} style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Create business</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.checkout}>
          <View>
            <Text style={styles.checkoutLabel}>{entryCount} items</Text>
            <Text style={styles.checkoutTotal}>{formatCurrency(totalMinor, currency)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!entryCount || busy}
            onPress={reviewSale}
            style={[styles.checkoutButton, (!entryCount || busy) && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.checkoutText}>Review sale</Text>
            )}
          </Pressable>
        </View>
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NEW SALE</Text>
          <Text style={styles.title}>Sell</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await syncPendingSales();
            await refreshPending();
            await load();
          }}
        >
          <Text style={[styles.offline, pending > 0 && styles.pendingPill]}>
            {pending > 0 ? `${pending} to sync` : 'All synced'}
          </Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Find a product"
        placeholder="Search product or SKU"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      {loading ? (
        <Text style={styles.empty}>Loading inventory…</Text>
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : visible.length === 0 ? (
        <View>
          <Text style={styles.empty}>
            No products yet. Add your first product to start selling.
          </Text>
          <Pressable onPress={() => router.push('/(merchant)/add-product')} style={styles.addCta}>
            <Text style={styles.addCtaText}>Add a product</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.products}>
          {visible.map((item) => {
            const id = item.businessProduct.id;
            const stock = item.inventory?.quantity ?? 0;
            return (
              <Pressable
                accessibilityRole="button"
                key={id}
                onPress={() => add(id)}
                style={styles.product}
              >
                <View style={styles.productImage}>
                  <Text style={styles.productInitial}>
                    {(item.product?.name ?? item.businessProduct.sku ?? '?')[0]}
                  </Text>
                </View>
                <View style={styles.productBody}>
                  <Text style={styles.productName}>
                    {item.product?.name ?? item.businessProduct.sku ?? 'Unnamed'}
                  </Text>
                  <Text style={styles.stock}>{stock} in stock</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>
                    {formatCurrency(
                      item.businessProduct.price_minor,
                      item.businessProduct.currency_code,
                    )}
                  </Text>
                  {cart[id] ? (
                    <View style={styles.quantity}>
                      <Text style={styles.quantityText}>{cart[id]}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
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
  title: { color: colors.ink, fontSize: typography.size.display, fontWeight: '900' },
  offline: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.success,
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
    fontSize: 11,
    fontWeight: '800',
  },
  pendingPill: { color: colors.warning, backgroundColor: '#fff0d8' },
  search: {
    minHeight: 56,
    marginTop: spacing[5],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: typography.size.body,
  },
  empty: { marginTop: spacing[8], color: colors.muted, textAlign: 'center' },
  addCta: {
    minHeight: 50,
    marginTop: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  addCtaText: { color: colors.surface, fontWeight: '900' },
  products: { marginTop: spacing[5], gap: spacing[3] },
  product: {
    minHeight: 78,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  productImage: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.small,
    backgroundColor: colors.brand[100],
  },
  productInitial: { color: colors.brand[700], fontSize: 20, fontWeight: '900' },
  productBody: { flex: 1, marginLeft: spacing[3] },
  productName: { color: colors.ink, fontWeight: '800' },
  stock: { marginTop: spacing[1], color: colors.muted, fontSize: 11 },
  priceBlock: { alignItems: 'flex-end', gap: spacing[1] },
  price: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  quantity: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[500],
  },
  quantityText: { color: colors.brand[900], fontSize: 11, fontWeight: '900' },
  checkout: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkoutLabel: { color: colors.muted, fontSize: 11 },
  checkoutTotal: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  checkoutButton: {
    minWidth: 170,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  disabled: { opacity: 0.35 },
  checkoutText: { color: colors.surface, fontWeight: '900' },
});
