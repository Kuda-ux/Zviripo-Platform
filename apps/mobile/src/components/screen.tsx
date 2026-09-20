import { colors, spacing } from '@comodities/ui';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface ScreenProps {
  footer?: ReactNode;
  /** Pull-to-refresh handler; shows the native refresh control when provided. */
  onRefresh?: () => Promise<unknown> | void;
  refreshing?: boolean;
  tone?: 'paper' | 'night';
  /** Disable ScrollView when the child manages its own list (FlatList screens). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  footer,
  onRefresh,
  refreshing = false,
  tone = 'paper',
  scroll = true,
  contentStyle,
}: PropsWithChildren<ScreenProps>) {
  const bg = tone === 'night' ? colors.brand.night : colors.paper;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.fill}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  colors={[colors.brand.forestDeep]}
                  onRefresh={onRefresh}
                  refreshing={refreshing}
                  tintColor={colors.brand.forestDeep}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, contentStyle]}>{children}</View>
        )}
        {footer}
      </View>
    </SafeAreaView>
  );
}

export const screenPadding = { paddingHorizontal: spacing[5] } as const;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[16] },
});
