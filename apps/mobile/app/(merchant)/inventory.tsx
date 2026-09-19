import { colors, radii, spacing, typography } from '@comodities/ui';
import {
  listBusinessProducts,
  toggleListed,
  updateStock,
  type BusinessProduct,
  type Inventory,
  type Product,
} from '@comodities/database';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { supabase } from '../../src/lib/supabase';

interface Row {
  businessProduct: BusinessProduct;
  product: Product | undefined;
  inventory: Inventory | undefined;
}

function formatCurrency(minor: number, currency: 'USD' | 'ZWG') {
  const amount = minor / 100;
  return currency === 'USD' ? `$${amount.toFixed(2)}` : `Z$ ${amount.toFixed(2)}`;
}

export default function InventoryScreen() {
  const { businesses } = useAuth();
  const business = businesses[0]?.business ?? null;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

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
      setRows(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  const visible = rows.filter((row) =>
    (row.product?.name ?? row.businessProduct.sku ?? '')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const lowCount = rows.filter(
    (row) => (row.inventory?.quantity ?? 0) <= (row.inventory?.low_stock_threshold ?? 3),
  ).length;

  async function toggle(row: Row) {
    if (!business) return;
    setBusyId(row.businessProduct.id);
    const { error } = await toggleListed(
      supabase,
      row.businessProduct.id,
      !row.businessProduct.is_listed,
    );
    setBusyId(null);
    if (error) {
      Alert.alert('Could not update listing', error.message);
      return;
    }
    await load();
  }

  async function restock(row: Row) {
    if (!business) return;
    Alert.prompt?.('Add stock', 'Enter quantity received', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: async (value?: string) => {
          const quantity = Number(value);
          if (!Number.isFinite(quantity) || quantity <= 0) return;
          const { error } = await updateStock(supabase, {
            businessId: business.id,
            businessProductId: row.businessProduct.id,
            delta: quantity,
            reason: 'purchase',
          });
          if (error) {
            Alert.alert('Could not update stock', error.message);
            return;
          }
          await load();
        },
      },
    ]) ?? Alert.alert('Add stock', 'Open the product and use updateStock from the repository.');
  }

  if (!business) {
    return (
      <Screen>
        <Text style={styles.title}>Set up your business first</Text>
        <Pressable onPress={() => router.push('/(merchant)/setup')} style={styles.add}>
          <Text style={styles.addText}>Create business</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PRODUCTS & STOCK</Text>
          <Text style={styles.title}>Inventory</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(merchant)/add-product')}
          style={styles.add}
        >
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search inventory"
        placeholder="Search inventory"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{rows.length} products</Text>
        {lowCount > 0 ? <Text style={styles.warning}>{lowCount} low stock</Text> : null}
      </View>
      {loading ? (
        <Text style={styles.empty}>Loading inventory…</Text>
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : visible.length === 0 ? (
        <Text style={styles.empty}>No products yet. Tap “+ Add” to create your first product.</Text>
      ) : (
        <View style={styles.list}>
          {visible.map((row) => {
            const stock = row.inventory?.quantity ?? 0;
            const low = stock <= (row.inventory?.low_stock_threshold ?? 3);
            return (
              <View key={row.businessProduct.id} style={styles.item}>
                <View style={styles.initial}>
                  <Text style={styles.initialText}>
                    {(row.product?.name ?? row.businessProduct.sku ?? '?')[0]}
                  </Text>
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.name}>
                    {row.product?.name ?? row.businessProduct.sku ?? 'Unnamed'}
                  </Text>
                  <Text style={styles.price}>
                    {formatCurrency(
                      row.businessProduct.price_minor,
                      row.businessProduct.currency_code,
                    )}{' '}
                    · {row.businessProduct.is_listed ? 'Listed on Zviripo' : 'Not listed'}
                  </Text>
                  <View style={styles.rowActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => toggle(row)}
                      style={styles.smallAction}
                    >
                      {busyId === row.businessProduct.id ? (
                        <ActivityIndicator size="small" color={colors.brand[700]} />
                      ) : (
                        <Text style={styles.smallActionText}>
                          {row.businessProduct.is_listed ? 'Unlist' : 'List on Zviripo'}
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => restock(row)}
                      style={styles.smallAction}
                    >
                      <Text style={styles.smallActionText}>Add stock</Text>
                    </Pressable>
                  </View>
                </View>
                <View>
                  <Text style={[styles.stock, low && styles.low]}>{stock}</Text>
                  <Text style={styles.units}>in stock</Text>
                </View>
              </View>
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
  add: {
    minHeight: 44,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  addText: { color: colors.surface, fontWeight: '900' },
  search: {
    minHeight: 54,
    marginTop: spacing[5],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  summary: { marginVertical: spacing[4], flexDirection: 'row', justifyContent: 'space-between' },
  summaryText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  warning: { color: colors.warning, fontSize: 12, fontWeight: '800' },
  empty: { marginTop: spacing[8], color: colors.muted, textAlign: 'center' },
  list: { gap: spacing[2] },
  item: {
    minHeight: 76,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  initial: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.small,
    backgroundColor: colors.brand[100],
  },
  initialText: { color: colors.brand[700], fontWeight: '900' },
  itemBody: { flex: 1, marginLeft: spacing[3] },
  name: { color: colors.ink, fontWeight: '800' },
  price: { marginTop: spacing[1], color: colors.muted, fontSize: 11 },
  rowActions: { marginTop: spacing[2], flexDirection: 'row', gap: spacing[2] },
  smallAction: {
    minHeight: 30,
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand[700],
    borderRadius: radii.pill,
  },
  smallActionText: { color: colors.brand[700], fontSize: 11, fontWeight: '800' },
  stock: { color: colors.ink, textAlign: 'right', fontSize: 18, fontWeight: '900' },
  low: { color: colors.warning },
  units: { color: colors.muted, fontSize: 10 },
});
