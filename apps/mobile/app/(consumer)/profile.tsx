import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Your Comodities</Text>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TM</Text>
        </View>
        <View>
          <Text style={styles.name}>Tariro M.</Text>
          <Text style={styles.detail}>Mbare, Harare · Phone verified</Text>
        </View>
      </View>
      <View style={styles.menu}>
        {[
          'Saved items',
          'My listings',
          'My requests',
          'Receipts',
          'Trust & verification',
          'Safety and support',
        ].map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            onPress={() =>
              router.push(
                `/action/${item.toLowerCase().replaceAll(' ', '-').replace('/', '')}` as never,
              )
            }
            style={styles.row}
          >
            <Text style={styles.rowText}>{item}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <Link href="/(merchant)" style={styles.business}>
        Switch to business
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing[4],
    color: colors.ink,
    fontSize: typography.size.display,
    fontWeight: '900',
  },
  profile: {
    marginTop: spacing[6],
    padding: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    borderRadius: radii.large,
    backgroundColor: colors.brand[900],
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[500],
  },
  avatarText: { color: colors.brand[900], fontSize: 18, fontWeight: '900' },
  name: { color: colors.surface, fontSize: 18, fontWeight: '900' },
  detail: { marginTop: spacing[1], color: '#b8d0c5', fontSize: typography.size.caption },
  menu: {
    marginTop: spacing[5],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  row: {
    minHeight: 58,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { color: colors.ink, fontWeight: '700' },
  arrow: { color: colors.muted, fontSize: 24 },
  business: {
    minHeight: 52,
    marginTop: spacing[5],
    paddingVertical: 16,
    overflow: 'hidden',
    color: colors.brand[700],
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.brand[700],
    borderRadius: radii.medium,
    fontWeight: '900',
  },
});
