import { colors, radii, spacing, typography } from '@comodities/ui';
import { createProduct } from '@comodities/database';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../src/lib/auth-context';
import { supabase } from '../../src/lib/supabase';

export default function AddProductScreen() {
  const { businesses } = useAuth();
  const business = businesses[0]?.business ?? null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ZWG'>('USD');
  const [stock, setStock] = useState('');
  const [listed, setListed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!business) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.page}>
          <Text style={styles.title}>Set up your business first</Text>
          <Pressable onPress={() => router.replace('/(merchant)/setup')} style={styles.primary}>
            <Text style={styles.primaryText}>Create business</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function submit() {
    const priceNumber = Number(price);
    const stockNumber = stock.trim() ? Number(stock) : 0;

    if (!name.trim()) {
      setError('Enter a product name.');
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError('Enter a valid price, e.g. 8.50');
      return;
    }
    if (stock.trim() && (!Number.isFinite(stockNumber) || stockNumber < 0)) {
      setError('Enter a valid stock quantity.');
      return;
    }

    setBusy(true);
    setError(null);

    const { data, error: createError } = await createProduct(supabase, {
      product: {
        name: name.trim(),
        description: description.trim() || null,
        brand: brand.trim() || null,
      },
      businessProduct: {
        business_id: business!.id,
        sku: sku.trim() || null,
        price_minor: Math.round(priceNumber * 100),
        currency_code: currency,
        is_listed: listed,
      },
      initialStock: stockNumber,
    });

    setBusy(false);

    if (createError || !data) {
      setError(createError?.message ?? 'Could not create the product.');
      return;
    }

    router.back();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>INVENTORY</Text>
        <Text style={styles.title}>Add a product.</Text>
        <Text style={styles.description}>
          Price it, set the starting stock, and choose whether buyers can see it.
        </Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Product name</Text>
            <TextInput
              accessibilityLabel="Product name"
              onChangeText={setName}
              placeholder="e.g. Roller meal 10kg"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={name}
            />
          </View>
          <View>
            <Text style={styles.label}>Description</Text>
            <TextInput
              accessibilityLabel="Description"
              multiline
              onChangeText={setDescription}
              placeholder="Optional details buyers should know"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline]}
              value={description}
            />
          </View>
          <View>
            <Text style={styles.label}>Brand (optional)</Text>
            <TextInput
              accessibilityLabel="Brand"
              onChangeText={setBrand}
              placeholder="e.g. National Foods"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={brand}
            />
          </View>
          <View>
            <Text style={styles.label}>SKU (optional)</Text>
            <TextInput
              accessibilityLabel="SKU"
              autoCapitalize="characters"
              onChangeText={setSku}
              placeholder="e.g. RM10KG"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={sku}
            />
          </View>
          <View>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceRow}>
              <TextInput
                accessibilityLabel="Price"
                keyboardType="decimal-pad"
                onChangeText={setPrice}
                placeholder="8.50"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.priceInput]}
                value={price}
              />
              <View style={styles.currencyRow}>
                {(['USD', 'ZWG'] as const).map((code) => (
                  <Pressable
                    accessibilityRole="button"
                    key={code}
                    onPress={() => setCurrency(code)}
                    style={[styles.currency, currency === code && styles.currencyActive]}
                  >
                    <Text
                      style={[styles.currencyText, currency === code && styles.currencyTextActive]}
                    >
                      {code}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.label}>Starting stock</Text>
            <TextInput
              accessibilityLabel="Starting stock"
              keyboardType="decimal-pad"
              onChangeText={setStock}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={stock}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setListed((value) => !value)}
            style={styles.toggleRow}
          >
            <View style={[styles.toggle, listed && styles.toggleActive]}>
              <Text style={styles.toggleMark}>{listed ? '✓' : ''}</Text>
            </View>
            <Text style={styles.toggleText}>List on Comodities marketplace</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={submit}
            style={[styles.primary, busy && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryText}>Save product</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  page: { padding: spacing[5], paddingBottom: spacing[12] },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { color: colors.brand[700], fontWeight: '900' },
  eyebrow: {
    marginTop: spacing[5],
    color: colors.brand[700],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: '900',
  },
  description: {
    marginTop: spacing[3],
    color: colors.muted,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  form: { marginTop: spacing[8], gap: spacing[4] },
  label: { marginBottom: spacing[2], color: colors.ink, fontSize: 12, fontWeight: '800' },
  input: {
    minHeight: 54,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  multiline: { minHeight: 110, paddingTop: spacing[4], textAlignVertical: 'top' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  priceInput: { flex: 1 },
  currencyRow: { flexDirection: 'row', gap: spacing[2] },
  currency: {
    minHeight: 54,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  currencyActive: { borderColor: colors.brand[900], backgroundColor: colors.brand[900] },
  currencyText: { color: colors.muted, fontWeight: '800' },
  currencyTextActive: { color: colors.surface },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  toggle: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brand[700],
    borderRadius: radii.small,
    backgroundColor: colors.surface,
  },
  toggleActive: { backgroundColor: colors.brand[700] },
  toggleMark: { color: colors.surface, fontWeight: '900' },
  toggleText: { color: colors.ink, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  primary: {
    minHeight: 54,
    marginTop: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.surface, fontWeight: '900' },
});
