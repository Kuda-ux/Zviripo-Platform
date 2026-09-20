import { colors, copy, radii, spacing } from '@comodities/ui';
import { StyleSheet, View } from 'react-native';
import type { Connectivity } from '../lib/connectivity';
import { Icon } from '../ui/icon';
import { Press } from '../ui/pressable';
import { Text } from '../ui/text';

export type SyncPhase = 'idle' | 'syncing' | 'failed';

export interface SyncStatusProps {
  pending: number;
  connectivity: Connectivity;
  phase?: SyncPhase;
  onPress?: () => void;
  /** Compact pill for headers; full card for dashboards. */
  variant?: 'pill' | 'card';
}

function resolve(pending: number, connectivity: Connectivity, phase: SyncPhase) {
  if (phase === 'syncing')
    return { ...copy.sync.syncing, tone: 'info' as const, icon: 'sync' as const };
  if (connectivity === 'offline')
    return {
      label: pending > 0 ? copy.sync.pending(pending).label : copy.sync.offline.label,
      detail: copy.sync.offline.detail,
      tone: 'warning' as const,
      icon: 'offline' as const,
    };
  if (phase === 'failed')
    return { ...copy.sync.failed, tone: 'danger' as const, icon: 'warning' as const };
  if (pending > 0)
    return { ...copy.sync.pending(pending), tone: 'warning' as const, icon: 'sync' as const };
  return { ...copy.sync.online, tone: 'success' as const, icon: 'synced' as const };
}

const palette = {
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  info: { fg: colors.info, bg: colors.infoSoft },
};

export function SyncStatus({
  pending,
  connectivity,
  phase = 'idle',
  onPress,
  variant = 'pill',
}: SyncStatusProps) {
  const s = resolve(pending, connectivity, phase);
  const { fg, bg } = palette[s.tone];
  const actionable = !!onPress && (pending > 0 || phase === 'failed') && connectivity !== 'offline';

  if (variant === 'card') {
    return (
      <Press
        accessibilityLabel={`${s.label}. ${s.detail}${actionable ? '. Tap to sync now' : ''}`}
        accessibilityRole={actionable ? 'button' : 'summary'}
        disabled={!actionable}
        feedback={actionable}
        onPress={onPress}
        style={[styles.card, { backgroundColor: bg }]}
      >
        <Icon color={fg} name={s.icon} size={22} />
        <View style={styles.cardBody}>
          <Text role="headingSm" style={{ color: fg }}>
            {s.label}
          </Text>
          <Text role="bodySm" tone="muted">
            {s.detail}
          </Text>
          {actionable ? (
            <Text role="caption" style={{ color: fg, marginTop: spacing[1] }}>
              Tap to sync now
            </Text>
          ) : null}
        </View>
      </Press>
    );
  }

  return (
    <Press
      accessibilityLabel={`${s.label}${actionable ? '. Tap to sync now' : ''}`}
      accessibilityRole={actionable ? 'button' : 'text'}
      disabled={!actionable}
      feedback={actionable}
      onPress={onPress}
      style={[styles.pill, { backgroundColor: bg }]}
    >
      <Icon color={fg} name={s.icon} size={14} />
      <Text role="caption" style={{ color: fg, fontWeight: '800' }}>
        {s.label}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 36,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radii.pill,
  },
  card: {
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    borderRadius: radii.lg,
  },
  cardBody: { flex: 1, gap: 2 },
});
