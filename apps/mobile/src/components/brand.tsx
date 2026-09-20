import { colors, copy } from '@comodities/ui';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../ui/text';

/**
 * The exact supplied Zviripo logo (resized derivative, never redrawn).
 * Its backdrop is opaque `brand.night`, so this component must only be
 * placed on `brand.night` surfaces. See ZVIRIPO_DESIGN.md → Logo.
 */
export function Logo({
  variant = 'lockup',
  width = 240,
  style,
}: {
  variant?: 'lockup' | 'mark' | 'wordmark';
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const source =
    variant === 'mark'
      ? require('../../assets/brand/zviripo-mark-night-192.png')
      : variant === 'wordmark'
        ? require('../../assets/brand/zviripo-wordmark-night-512.png')
        : require('../../assets/brand/zviripo-lockup-night-640.png');
  const ratio = variant === 'mark' ? 1 : variant === 'wordmark' ? 1080 / 310 : 1136 / 860;
  return (
    <View style={style}>
      <Image
        accessibilityLabel={variant === 'mark' ? 'Zviripo' : `Zviripo. ${copy.tagline}`}
        accessibilityRole="image"
        resizeMode="contain"
        source={source}
        style={{ width, height: width / ratio }}
      />
    </View>
  );
}

/** Typographic wordmark for light surfaces (no transparent logo master exists yet). */
export function Wordmark({ size = 22, tone = 'ink' }: { size?: number; tone?: 'ink' | 'onDark' }) {
  return (
    <Text
      accessibilityRole="header"
      role="headingMd"
      style={[
        styles.wordmark,
        { fontSize: size, color: tone === 'ink' ? colors.brand.forest : colors.onDark },
      ]}
    >
      Zviripo
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontWeight: '900', letterSpacing: -0.8 },
});
