import { colors, text as roles, type TextRoleName } from '@comodities/ui';
import type { ReactNode } from 'react';
import {
  Text as RNText,
  StyleSheet,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

type Tone =
  | 'ink'
  | 'muted'
  | 'onDark'
  | 'onDarkMuted'
  | 'brand'
  | 'gold'
  | 'success'
  | 'warning'
  | 'danger';

const tones: Record<Tone, string> = {
  ink: colors.ink,
  muted: colors.muted,
  onDark: colors.onDark,
  onDarkMuted: colors.onDarkMuted,
  brand: colors.brand.forestDeep,
  gold: colors.gold[700],
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export interface UITextProps extends Omit<TextProps, 'role'> {
  role?: TextRoleName;
  tone?: Tone;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export function Text({ role = 'body', tone = 'ink', align, style, ...rest }: UITextProps) {
  return (
    <RNText
      {...rest}
      style={[
        roles[role] as TextStyle,
        { color: tones[tone] },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

export function Label(props: UITextProps) {
  return <Text role="label" tone="brand" {...props} />;
}

export const textStyles = StyleSheet.create(
  Object.fromEntries(Object.entries(roles).map(([k, v]) => [k, v as TextStyle])) as Record<
    TextRoleName,
    TextStyle
  >,
);
