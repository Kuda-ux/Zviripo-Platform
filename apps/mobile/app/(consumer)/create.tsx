import { colors, copy, radii, spacing, type IconName } from '@comodities/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { Icon } from '../../src/ui/icon';
import { Press } from '../../src/ui/pressable';
import { Text } from '../../src/ui/text';

const choices: Array<{
  title: string;
  detail: string;
  icon: IconName;
  href: string;
  status: 'live' | 'soon';
}> = [
  {
    title: 'Sell from my business',
    detail: 'Add products, set prices and list them for buyers nearby.',
    icon: 'business',
    href: '/(merchant)',
    status: 'live',
  },
  {
    title: 'Request something',
    detail: 'Tell nearby shops and providers what you need.',
    icon: 'request',
    href: '/action/request',
    status: 'soon',
  },
  {
    title: 'Offer a service',
    detail: 'Make your skills discoverable to local customers.',
    icon: 'services',
    href: '/action/offer-service',
    status: 'soon',
  },
];

export default function CreateScreen() {
  const { session } = useAuth();
  return (
    <Screen>
      <Text role="label" tone="brand">
        SELL
      </Text>
      <Text role="headingXl" style={styles.title}>
        What would you like to do?
      </Text>
      <Text role="body" tone="muted" style={styles.lede}>
        Start simple. Selling runs through your business so stock and the marketplace stay in sync.
      </Text>
      <View style={styles.list}>
        {choices.map((choice) => {
          const live = choice.status === 'live';
          return (
            <Press
              accessibilityLabel={`${choice.title}. ${choice.detail}${live ? '' : '. Coming soon'}`}
              accessibilityRole="button"
              key={choice.title}
              onPress={() =>
                router.push((live && !session ? '/(auth)/sign-in' : choice.href) as never)
              }
              style={[styles.choice, live && styles.live]}
            >
              <View style={[styles.iconWrap, live && styles.iconWrapLive]}>
                <Icon
                  color={live ? colors.brand.night : colors.brand.forestDeep}
                  name={choice.icon}
                  size={22}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text role="headingSm" tone={live ? 'onDark' : 'ink'}>
                  {choice.title}
                </Text>
                <Text role="bodySm" tone={live ? 'onDarkMuted' : 'muted'} style={{ marginTop: 2 }}>
                  {choice.detail}
                </Text>
              </View>
              {live ? (
                <Icon color={colors.onDark} name="forward" size={20} />
              ) : (
                <Text role="label" tone="muted">
                  {copy.comingSoon.label}
                </Text>
              )}
            </Press>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing[2] },
  lede: { marginTop: spacing[3], maxWidth: 360 },
  list: { marginTop: spacing[6], gap: spacing[3] },
  choice: {
    minHeight: 88,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  live: { borderColor: colors.brand.forest, backgroundColor: colors.brand.forest },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.brand.tint,
  },
  iconWrapLive: { backgroundColor: colors.gold[500] },
});
