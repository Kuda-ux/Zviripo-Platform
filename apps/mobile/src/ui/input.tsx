import { colors, radii, spacing, type IconName } from '@comodities/ui';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Icon } from './icon';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: IconName;
  /** Larger, search-style field. */
  prominent?: boolean;
}

export function Input({ label, hint, error, icon, prominent, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      {label ? (
        <Text role="caption" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          prominent && styles.prominent,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
      >
        {icon ? (
          <Icon color={focused ? colors.brand.forestDeep : colors.muted} name={icon} size={20} />
        ) : null}
        <TextInput
          accessibilityLabel={rest.accessibilityLabel ?? label ?? rest.placeholder}
          placeholderTextColor={colors.muted}
          {...rest}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          style={[styles.input, style]}
        />
      </View>
      {error ? (
        <Text role="bodySm" tone="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text role="bodySm" tone="muted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: spacing[2], fontWeight: '700' },
  field: {
    minHeight: 52,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  prominent: { minHeight: 58 },
  focused: { borderColor: colors.brand.forestDeep, borderWidth: 2 },
  errored: { borderColor: colors.danger },
  input: { flex: 1, minHeight: 48, color: colors.ink, fontSize: 15 },
  helper: { marginTop: spacing[2] },
});
