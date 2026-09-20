import { colors, radii, spacing } from '@comodities/ui';
import { createProduct } from '@comodities/database';
import { humanizeError } from '@comodities/utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Input } from '../../src/ui/input';
import { Chip, IconButton, Row } from '../../src/ui/layout';
import { Press } from '../../src/ui/pressable';
import { EmptyState } from '../../src/ui/states';
import { Text } from '../../src/ui/text';

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
      <Screen>
        <EmptyState
          action={{
            label: 'Create my business',
            onPress: () => router.replace('/(merchant)/setup'),
          }}
          detail="Products belong to a business. Set it up first."
          icon="business"
          title="Set up your business first"
        />
      </Screen>
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
    if (!Number.isSafeInteger(Math.round(priceNumber * 100))) {
      setError('That price is too large.');
      return;
    }
    if (stock.trim() && (!Number.isSafeInteger(stockNumber) || stockNumber < 0)) {
      setError('Enter a valid whole-number stock quantity.');
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
      setError(
        humanizeError(createError ?? new Error('Could not create the product.'), 'save').detail,
      );
      return;
    }

    router.back();
  }

  return (
    <Screen>
      <IconButton accessibilityLabel="Back" icon="back" onPress={() => router.back()} />
      <Text role="label" tone="brand" style={styles.eyebrow}>
        INVENTORY
      </Text>
      <Text role="headingXl" style={styles.title}>
        Add a product
      </Text>
      <Text role="body" tone="muted" style={styles.description}>
        Price it, set the starting stock, and choose whether buyers can see it.
      </Text>

      <View style={styles.form}>
        <Input
          label="Product name"
          onChangeText={setName}
          placeholder="e.g. Roller meal 10kg"
          value={name}
        />
        <Input
          label="Description"
          multiline
          onChangeText={setDescription}
          placeholder="Optional details buyers should know"
          style={styles.multiline}
          value={description}
        />
        <Input
          label="Brand (optional)"
          onChangeText={setBrand}
          placeholder="e.g. National Foods"
          value={brand}
        />
        <Input
          autoCapitalize="characters"
          label="SKU (optional)"
          onChangeText={setSku}
          placeholder="e.g. RM10KG"
          value={sku}
        />
        <View>
          <Text role="caption" style={styles.label}>
            Price
          </Text>
          <Row align="flex-start" gap={spacing[3]}>
            <View style={{ flex: 1 }}>
              <Input
                keyboardType="decimal-pad"
                onChangeText={setPrice}
                placeholder="8.50"
                value={price}
              />
            </View>
            <Row gap={spacing[2]}>
              {(['USD', 'ZWG'] as const).map((code) => (
                <Chip
                  active={currency === code}
                  key={code}
                  label={code}
                  onPress={() => setCurrency(code)}
                />
              ))}
            </Row>
          </Row>
        </View>
        <Input
          keyboardType="number-pad"
          label="Starting stock"
          onChangeText={setStock}
          placeholder="0"
          value={stock}
        />
        <Press
          accessibilityLabel="List on Zviripo marketplace"
          accessibilityRole="switch"
          accessibilityState={{ checked: listed }}
          onPress={() => setListed((value) => !value)}
          style={styles.toggleRow}
        >
          <View style={[styles.toggle, listed && styles.toggleActive]}>
            {listed ? <Icon color={colors.onDark} name="check" size={16} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text role="body" style={{ fontWeight: '700' }}>
              List on Zviripo marketplace
            </Text>
            <Text role="caption" tone="muted">
              Buyers nearby can find and contact you about this product.
            </Text>
          </View>
        </Press>

        {error ? (
          <Text role="bodySm" tone="danger">
            {error}
          </Text>
        ) : null}

        <Button fullWidth label="Save product" loading={busy} onPress={submit} size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: spacing[5] },
  title: { marginTop: spacing[1] },
  description: { marginTop: spacing[2] },
  form: { marginTop: spacing[6], gap: spacing[4] },
  label: { marginBottom: spacing[2], fontWeight: '700' },
  multiline: { minHeight: 100, paddingTop: spacing[3], textAlignVertical: 'top' },
  toggleRow: {
    minHeight: 56,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  toggle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brand.forestDeep,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  toggleActive: { backgroundColor: colors.brand.forestDeep },
});
