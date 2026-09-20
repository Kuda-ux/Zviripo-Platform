import { colors, radii, spacing, type IconName } from '@comodities/ui';
import { humanizeError } from '@comodities/utils';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from './button';
import { Icon } from './icon';
import { useReduceMotion } from './pressable';
import { Text } from './text';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  detail?: string;
  action?: { label: string; onPress: () => void; variant?: 'primary' | 'gold' | 'secondary' };
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'search',
  title,
  detail,
  action,
  compact,
  style,
}: EmptyStateProps) {
  return (
    <View accessibilityRole="summary" style={[styles.card, compact && styles.compact, style]}>
      <View style={styles.iconWrap}>
        <Icon color={colors.brand.forestDeep} name={icon} size={22} />
      </View>
      <Text role="headingSm" style={styles.title}>
        {title}
      </Text>
      {detail ? (
        <Text role="bodySm" tone="muted" style={styles.detail}>
          {detail}
        </Text>
      ) : null}
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          style={styles.action}
          variant={action.variant ?? 'primary'}
        />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  error: unknown;
  context?: 'load' | 'save';
  onRetry?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({ error, context = 'load', onRetry, compact, style }: ErrorStateProps) {
  const human = humanizeError(error, context);
  return (
    <View
      accessibilityRole="alert"
      style={[styles.card, styles.errorCard, compact && styles.compact, style]}
    >
      <View style={[styles.iconWrap, human.offline ? styles.offlineIcon : styles.dangerIcon]}>
        <Icon
          color={human.offline ? colors.warning : colors.danger}
          name={human.offline ? 'offline' : 'warning'}
          size={22}
        />
      </View>
      <Text role="headingSm" style={styles.title}>
        {human.title}
      </Text>
      <Text role="bodySm" tone="muted" style={styles.detail}>
        {human.detail}
      </Text>
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} style={styles.action} variant="secondary" />
      ) : null}
    </View>
  );
}

export function Skeleton({
  width,
  height = 16,
  radius = radii.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduce]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius: radius,
          backgroundColor: colors.brand.soft,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ lines = 2 }: { lines?: number }) {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton height={48} radius={radii.sm} width={48} />
      <View style={styles.skeletonLines}>
        <Skeleton height={14} width="70%" />
        {lines > 1 ? <Skeleton height={12} width="45%" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  compact: { padding: spacing[4] },
  errorCard: {},
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.brand.tint,
  },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  offlineIcon: { backgroundColor: colors.warningSoft },
  title: { marginTop: spacing[3] },
  detail: { marginTop: spacing[1] },
  action: { marginTop: spacing[4] },
  skeletonRow: {
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  skeletonLines: { flex: 1, gap: spacing[2] },
});
