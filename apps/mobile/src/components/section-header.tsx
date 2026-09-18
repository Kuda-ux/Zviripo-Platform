import { colors, spacing, typography } from '@comodities/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" disabled={!onAction} onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: spacing[8],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    fontSize: typography.size.title,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  action: { color: colors.brand[700], fontWeight: '800' },
});
