import { colors, radii, spacing, typography } from '@comodities/ui';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { inventory } from '../../src/data/demo';

export default function SellScreen() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Popular');
  const visibleInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const itemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const total = useMemo(
    () =>
      inventory.reduce((sum, item) => sum + Number(item.price.slice(1)) * (cart[item.id] ?? 0), 0),
    [cart],
  );
  const add = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  const reviewSale = () =>
    Alert.alert('Record this sale?', `${itemCount} items · $${total.toFixed(2)} · Cash`, [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Record sale',
        onPress: () => {
          setCart({});
          Alert.alert('Sale recorded', 'Stock has been updated. This sale is safe on this device.');
        },
      },
    ]);
  return (
    <Screen
      footer={
        <View style={styles.checkout}>
          <View>
            <Text style={styles.checkoutLabel}>{itemCount} items</Text>
            <Text style={styles.checkoutTotal}>${total.toFixed(2)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!itemCount}
            onPress={reviewSale}
            style={[styles.checkoutButton, !itemCount && styles.disabled]}
          >
            <Text style={styles.checkoutText}>Review sale</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NEW SALE</Text>
          <Text style={styles.title}>Sell</Text>
        </View>
        <Text style={styles.offline}>Works offline</Text>
      </View>
      <TextInput
        accessibilityLabel="Find a product"
        autoFocus
        placeholder="Search product or SKU"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <View style={styles.chips}>
        {['Popular', 'Drinks', 'Food', 'Household'].map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.chip, category === item && styles.activeChip]}
          >
            <Text style={[styles.chipText, category === item && styles.activeChipText]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.products}>
        {visibleInventory.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => add(item.id)}
            style={styles.product}
          >
            <View style={styles.productImage}>
              <Text style={styles.productInitial}>{item.name[0]}</Text>
            </View>
            <View style={styles.productBody}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.stock}>{item.stock} in stock</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{item.price}</Text>
              {cart[item.id] ? (
                <View style={styles.quantity}>
                  <Text style={styles.quantityText}>{cart[item.id]}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
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
  chips: { marginTop: spacing[3], flexDirection: 'row', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  activeChip: { borderColor: colors.brand[900], backgroundColor: colors.brand[900] },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  activeChipText: { color: colors.surface },
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
