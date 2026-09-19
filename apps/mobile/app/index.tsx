import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.mark}>
          <Text style={styles.markText}>Z</Text>
        </View>
        <Text style={styles.eyebrow}>ZVIRIPO · EXPERIENCE 2.0</Text>
        <Text style={styles.title}>Zimbabwe’s connected everyday economy.</Text>
        <Text style={styles.body}>
          Find what you need nearby, sell what you have, and keep your business moving — even when
          the internet doesn’t.
        </Text>
        <View style={styles.actions}>
          <Link href="/(consumer)" style={styles.primary}>
            Explore Zviripo
          </Link>
          <Link href="/(merchant)" style={styles.secondary}>
            Open my business
          </Link>
          <Link href="/(auth)/sign-in" style={styles.tertiary}>
            Sign in
          </Link>
        </View>
        <Text style={styles.note}>Find it. Sell it. Need it. Build with it.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand[900] },
  page: { flex: 1, padding: spacing[6], justifyContent: 'center' },
  mark: {
    width: 62,
    height: 62,
    marginBottom: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.large,
    backgroundColor: colors.accent[500],
  },
  markText: { color: colors.brand[900], fontSize: 30, fontWeight: '900' },
  eyebrow: {
    color: colors.accent[500],
    fontSize: typography.size.caption,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: {
    maxWidth: 520,
    marginTop: spacing[4],
    color: colors.surface,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '900',
    letterSpacing: -1.8,
  },
  body: {
    maxWidth: 460,
    marginTop: spacing[5],
    color: '#c9ddd2',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  actions: { marginTop: spacing[10], gap: spacing[3] },
  primary: {
    minHeight: 56,
    paddingVertical: 18,
    color: colors.brand[900],
    overflow: 'hidden',
    textAlign: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.accent[500],
    fontWeight: '900',
    fontSize: 17,
  },
  secondary: {
    minHeight: 56,
    paddingVertical: 17,
    color: colors.surface,
    overflow: 'hidden',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#3f6353',
    borderRadius: radii.medium,
    fontWeight: '800',
  },
  tertiary: {
    minHeight: 56,
    paddingVertical: 16,
    color: '#a8c9ba',
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: '800',
  },
  note: {
    marginTop: spacing[6],
    color: '#8fb3a2',
    textAlign: 'center',
    fontSize: typography.size.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
