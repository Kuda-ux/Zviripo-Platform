import { colors, radii, spacing, typography } from '@comodities/ui';
import { StyleSheet, Text, View } from 'react-native';

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 126,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  label: { color: colors.muted, fontSize: typography.size.caption, fontWeight: '700' },
  value: { marginTop: spacing[3], color: colors.ink, fontSize: 26, fontWeight: '900' },
  detail: { marginTop: spacing[2], color: colors.success, fontSize: 11, fontWeight: '700' },
});
