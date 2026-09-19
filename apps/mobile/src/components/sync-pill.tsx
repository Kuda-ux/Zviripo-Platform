import { colors, radii, spacing } from '@comodities/ui';
import { StyleSheet, Text, View } from 'react-native';

export function SyncPill({ pending = 0 }: { pending?: number }) {
  const offline = pending > 0;
  return (
    <View style={[styles.pill, offline && styles.offline]}>
      <View style={[styles.dot, offline && styles.offlineDot]} />
      <Text style={[styles.text, offline && styles.offlineText]}>
        {offline ? `${pending} to sync` : 'Everything synced'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 34,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
  },
  offline: { backgroundColor: '#fff0d8' },
  dot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.success },
  offlineDot: { backgroundColor: colors.warning },
  text: { color: colors.success, fontSize: 11, fontWeight: '800' },
  offlineText: { color: colors.warning },
});
