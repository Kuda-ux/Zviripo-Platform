import { colors, radii, spacing, typography } from '@comodities/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';

const choices = [
  ['Sell something', 'Create a clear local listing in a few steps.', '/action/sell'],
  ['Request something', 'Tell nearby businesses and providers what you need.', '/action/request'],
  ['Offer a service', 'Show customers what you do and where you work.', '/action/offer-service'],
] as const;

export default function CreateScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>CREATE</Text>
      <Text style={styles.title}>What would you like to do?</Text>
      <Text style={styles.body}>Start simple. You can add more detail before publishing.</Text>
      <View style={styles.list}>
        {choices.map(([title, detail, href], index) => (
          <Pressable
            accessibilityRole="button"
            key={title}
            onPress={() => router.push(href)}
            style={[styles.choice, index === 1 && styles.featured]}
          >
            <Text style={[styles.choiceTitle, index === 1 && styles.featuredText]}>{title}</Text>
            <Text style={[styles.choiceDetail, index === 1 && styles.featuredDetail]}>
              {detail}
            </Text>
            <Text style={[styles.arrow, index === 1 && styles.featuredText]}>→</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    marginTop: spacing[4],
    color: colors.brand[700],
    fontSize: typography.size.caption,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    maxWidth: 340,
    marginTop: spacing[3],
    color: colors.ink,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: '900',
  },
  body: {
    marginTop: spacing[3],
    color: colors.muted,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  list: { marginTop: spacing[8], gap: spacing[3] },
  choice: {
    minHeight: 150,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  featured: { borderColor: colors.brand[900], backgroundColor: colors.brand[900] },
  choiceTitle: { color: colors.ink, fontSize: typography.size.title, fontWeight: '900' },
  choiceDetail: { maxWidth: 280, marginTop: spacing[2], color: colors.muted, lineHeight: 21 },
  featuredText: { color: colors.surface },
  featuredDetail: { color: '#b8d0c5' },
  arrow: {
    position: 'absolute',
    right: spacing[5],
    bottom: spacing[4],
    color: colors.brand[700],
    fontSize: 28,
    fontWeight: '900',
  },
});
