import { colors, radii, shadow, spacing, type IconName } from '@comodities/ui';
import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './icon';
import { Press } from './pressable';
import { Text } from './text';

export function Card({
  children,
  style,
  elevated,
  tone = 'surface',
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  tone?: 'surface' | 'forest' | 'tint';
}>) {
  return (
    <View
      style={[
        styles.card,
        tone === 'forest' && styles.forest,
        tone === 'tint' && styles.tint,
        elevated && shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Press
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {icon ? <Icon color={active ? colors.onDark : colors.muted} name={icon} size={15} /> : null}
      <Text
        role="caption"
        style={{ color: active ? colors.onDark : colors.ink, fontWeight: '700' }}
      >
        {label}
      </Text>
    </Press>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  eyebrow,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  eyebrow?: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionText}>
        {eyebrow ? (
          <Text role="label" tone="brand">
            {eyebrow}
          </Text>
        ) : null}
        <Text role="headingMd">{title}</Text>
      </View>
      {action && onAction ? (
        <Press accessibilityRole="button" onPress={onAction} style={styles.sectionAction}>
          <Text role="caption" tone="brand" style={{ fontWeight: '800' }}>
            {action}
          </Text>
          <Icon color={colors.brand.forestDeep} name="forward" size={14} />
        </Press>
      ) : null}
    </View>
  );
}

export function Row({
  children,
  style,
  gap = spacing[3],
  align = 'center',
  justify = 'flex-start',
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
}>) {
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap }, style]}
    >
      {children}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'surface',
  badge,
}: {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  tone?: 'surface' | 'onDark' | 'tint';
  badge?: ReactNode;
}) {
  return (
    <Press
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.iconButton,
        tone === 'onDark' && styles.iconButtonDark,
        tone === 'tint' && styles.iconButtonTint,
      ]}
    >
      <Icon color={tone === 'onDark' ? colors.onDark : colors.ink} name={icon} size={21} />
      {badge}
    </Press>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  forest: {
    borderColor: colors.brand.forest,
    backgroundColor: colors.brand.forest,
    borderRadius: radii.xl,
  },
  tint: { borderColor: colors.brand.soft, backgroundColor: colors.brand.tint },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.brand.forest, backgroundColor: colors.brand.forest },
  section: {
    marginTop: spacing[8],
    marginBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionText: { gap: spacing[1] },
  sectionAction: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconButtonDark: {
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  iconButtonTint: { borderColor: colors.brand.soft, backgroundColor: colors.brand.tint },
});
