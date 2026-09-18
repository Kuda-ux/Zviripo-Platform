import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.mark}>
          <Text style={styles.markText}>C</Text>
        </View>
        <Text style={styles.eyebrow}>COMMERCE THAT KEEPS MOVING</Text>
        <Text style={styles.title}>Made for how Zimbabwe does business.</Text>
        <Text style={styles.body}>
          Find what you need nearby, or run your shop even when the internet disappears.
        </Text>
        <View style={styles.actions}>
          <Link href="/(consumer)" style={styles.primary}>
            Explore Comodities
          </Link>
          <Link href="/(merchant)" style={styles.secondary}>
            Open my business
          </Link>
        </View>
        <Text style={styles.note}>No account needed to explore</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand[900] },
  page: { flex: 1, padding: spacing[6], justifyContent: 'center' },
  mark: {
    width: 58,
    height: 58,
    marginBottom: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.large,
    backgroundColor: colors.brand[500],
  },
  markText: { color: colors.brand[900], fontSize: 28, fontWeight: '900' },
  eyebrow: {
    color: colors.brand[100],
    fontSize: typography.size.caption,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    maxWidth: 520,
    marginTop: spacing[4],
    color: colors.surface,
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    letterSpacing: -1.8,
  },
  body: {
    maxWidth: 460,
    marginTop: spacing[5],
    color: '#c7ddd3',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  actions: { marginTop: spacing[10], gap: spacing[3] },
  primary: {
    minHeight: 54,
    paddingVertical: 17,
    color: colors.brand[900],
    overflow: 'hidden',
    textAlign: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[500],
    fontWeight: '900',
  },
  secondary: {
    minHeight: 54,
    paddingVertical: 16,
    color: colors.surface,
    overflow: 'hidden',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#517365',
    borderRadius: radii.medium,
    fontWeight: '800',
  },
  note: {
    marginTop: spacing[5],
    color: '#9db9ac',
    textAlign: 'center',
    fontSize: typography.size.caption,
  },
});
