import { colors, radii, spacing, typography } from '@comodities/ui';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const displayName =
    (session?.user?.user_metadata?.display_name as string | undefined) ??
    session?.user?.email ??
    'Guest';
  const initial = displayName[0]?.toUpperCase() ?? 'Z';

  return (
    <Screen>
      <Text style={styles.title}>Your Zviripo</Text>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.detail}>
            {session ? 'Signed in' : 'Not signed in — sign in to save and sell'}
          </Text>
        </View>
      </View>
      {session ? (
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
          style={styles.signOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.signOut}
        >
          <Text style={styles.signOutText}>Sign in</Text>
        </Pressable>
      )}
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
  detail: { marginTop: spacing[1], color: '#b5cfc3', fontSize: typography.size.caption },
  signOut: {
    minHeight: 48,
    marginTop: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  signOutText: { color: colors.danger, fontWeight: '800' },
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
