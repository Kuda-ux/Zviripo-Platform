import { colors, radii, spacing, typography } from '@comodities/ui';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';

export default function ActivityScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Activity</Text>
      <View style={styles.empty}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>↗</Text>
        </View>
        <Text style={styles.emptyTitle}>Your activity starts here</Text>
        <Text style={styles.body}>
          Seller responses, request matches, receipts and useful updates will appear here.
        </Text>
      </View>
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
  empty: {
    marginTop: spacing[12],
    padding: spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
  },
  iconText: { color: colors.brand[700], fontSize: 25, fontWeight: '900' },
  emptyTitle: {
    marginTop: spacing[5],
    color: colors.ink,
    fontSize: typography.size.title,
    fontWeight: '900',
  },
  body: {
    marginTop: spacing[2],
    color: colors.muted,
    textAlign: 'center',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
});
