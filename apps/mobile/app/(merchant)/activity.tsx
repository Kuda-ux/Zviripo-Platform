import { colors, radii, spacing, typography } from '@comodities/ui';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { SyncPill } from '../../src/components/sync-pill';

const activity = [
  ['Sale #1048', '$12.40 · Cash · 4 items', '10:42'],
  ['Credit repayment', '$5.00 · Rudo M.', '09:18'],
  ['Sale #1047', '$7.20 · Mobile money', '08:55'],
];

export default function MerchantActivity() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <SyncPill />
      </View>
      <Text style={styles.date}>TODAY</Text>
      <View style={styles.list}>
        {activity.map(([title, detail, time]) => (
          <View key={title} style={styles.row}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.rowTitle}>{title}</Text>
              <Text style={styles.detail}>{detail}</Text>
            </View>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: colors.ink, fontSize: typography.size.display, fontWeight: '900' },
  date: {
    marginTop: spacing[8],
    marginBottom: spacing[3],
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  list: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  row: {
    minHeight: 78,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
  },
  iconText: { color: colors.success, fontWeight: '900' },
  body: { flex: 1, marginLeft: spacing[3] },
  rowTitle: { color: colors.ink, fontWeight: '900' },
  detail: { marginTop: spacing[1], color: colors.muted, fontSize: 11 },
  time: { color: colors.muted, fontSize: 11 },
});
