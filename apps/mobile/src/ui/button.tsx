import { colors, radii, spacing, touchTarget, type IconName } from '@comodities/ui';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './icon';
import { Press } from './pressable';
import { Text } from './text';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger' | 'onDark';
type Size = 'md' | 'lg' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const bg: Record<Variant, string> = {
  primary: colors.brand.forestDeep,
  gold: colors.gold[500],
  secondary: colors.surface,
  ghost: 'transparent',
  danger: colors.danger,
  onDark: 'rgba(255,255,255,0.10)',
};
const fg: Record<Variant, string> = {
  primary: colors.surface,
  gold: colors.brand.night,
  secondary: colors.ink,
  ghost: colors.brand.forestDeep,
  danger: colors.surface,
  onDark: colors.onDark,
};
const heights: Record<Size, number> = { sm: 40, md: touchTarget.minimum, lg: 56 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Press
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.base,
        { minHeight: heights[size], backgroundColor: bg[variant] },
        variant === 'secondary' && styles.outlined,
        variant === 'onDark' && styles.onDarkBorder,
        fullWidth && styles.full,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <>
          {icon ? <Icon color={fg[variant]} name={icon} size={size === 'sm' ? 16 : 19} /> : null}
          <Text
            role={size === 'sm' ? 'caption' : 'headingSm'}
            style={[{ color: fg[variant] }, size === 'sm' && styles.smText]}
          >
            {label}
          </Text>
        </>
      )}
    </Press>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  full: { alignSelf: 'stretch' },
  outlined: { borderWidth: 1, borderColor: colors.border },
  onDarkBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  disabled: { opacity: 0.45 },
  smText: { fontWeight: '800' },
});
