import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';

export default function MerchantMore() {
  return (
    <Screen>
      <Text style={styles.title}>Business tools</Text>
      <View style={styles.business}>
        <Text style={styles.businessName}>Mbare Value Store</Text>
        <Text style={styles.detail}>Profile 72% complete · Verification ready</Text>
      </View>
      <View style={styles.menu}>
        {[
          'Customers',
          'Credit / On Book',
          'Receipts',
          'Marketplace listings',
          'Business insights',
          'Verification',
          'Team & devices',
          'Settings & support',
        ].map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() =>
              router.push(
                `/action/${item.toLowerCase().replaceAll(' ', '-').replaceAll('/', '')}` as never,
              )
            }
            style={styles.row}
          >
            <Text style={styles.rowText}>{item}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <Link href="/(consumer)" style={styles.switch}>
        Switch to consumer
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing[4],
    color: colors.ink,
    fontSize: typography.size.display,
    fontWeight: '900',
  },
  business: {
    marginTop: spacing[6],
    padding: spacing[5],
    borderRadius: radii.large,
    backgroundColor: colors.brand[900],
  },
  businessName: { color: colors.surface, fontSize: typography.size.title, fontWeight: '900' },
  detail: { marginTop: spacing[2], color: '#b8d0c5', fontSize: 12 },
  menu: {
    marginTop: spacing[5],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  row: {
    minHeight: 58,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { color: colors.ink, fontWeight: '700' },
  arrow: { color: colors.muted, fontSize: 24 },
  switch: {
    minHeight: 52,
    marginTop: spacing[5],
    paddingVertical: 16,
    overflow: 'hidden',
    color: colors.brand[700],
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.brand[700],
    borderRadius: radii.medium,
    fontWeight: '900',
  },
});
