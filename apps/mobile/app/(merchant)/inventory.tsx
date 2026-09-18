import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { inventory } from '../../src/data/demo';

export default function InventoryScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PRODUCTS & STOCK</Text>
          <Text style={styles.title}>Inventory</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/action/add-stock')}
          style={styles.add}
        >
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search inventory"
        placeholder="Search inventory"
        placeholderTextColor={colors.muted}
        style={styles.search}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>31 products</Text>
        <Text style={styles.warning}>4 low stock</Text>
      </View>
      <View style={styles.list}>
        {inventory.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => router.push('/action/add-stock')}
            style={styles.item}
          >
            <View style={styles.initial}>
              <Text style={styles.initialText}>{item.name[0]}</Text>
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price} · Listed on Comodities</Text>
            </View>
            <View>
              <Text style={[styles.stock, item.stock <= 4 && styles.low]}>{item.stock}</Text>
              <Text style={styles.units}>in stock</Text>
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
  stock: { color: colors.ink, textAlign: 'right', fontSize: 18, fontWeight: '900' },
  low: { color: colors.warning },
  units: { color: colors.muted, fontSize: 10 },
});
