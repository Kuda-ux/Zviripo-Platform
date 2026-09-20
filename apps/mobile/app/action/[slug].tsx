import { colors, copy, spacing, type IconName } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import { useAuth } from '../../src/lib/auth-context';
import { Button } from '../../src/ui/button';
import { Icon } from '../../src/ui/icon';
import { Card, IconButton, Row } from '../../src/ui/layout';
import { Input } from '../../src/ui/input';
import { Text } from '../../src/ui/text';

interface Flow {
  title: string;
  description: string;
  icon: IconName;
  fields: string[];
  /** A real destination that exists today, if any. */
  live?: { label: string; href: string; detail: string };
}

const flows: Record<string, Flow> = {
  sell: {
    title: 'Sell on Zviripo',
    description:
      'Selling happens through your business: add products, set prices, list them for buyers.',
    icon: 'sell',
    fields: [],
    live: {
      label: 'Open my business',
      href: '/(merchant)',
      detail: 'Add a product and toggle “List on Zviripo”.',
    },
  },
  request: {
    title: 'Post a request',
    description:
      'Tell nearby businesses and providers exactly what you need, your area and budget.',
    icon: 'request',
    fields: ['What do you need?', 'Your area', 'Budget (optional)', 'When do you need it?'],
  },
  services: {
    title: 'Find a service',
    description: 'Describe the job and connect with relevant local providers.',
    icon: 'services',
    fields: ['Service needed', 'Your area', 'Describe the work'],
  },
  'offer-service': {
    title: 'Offer a service',
    description: 'Make your skills discoverable to customers near you.',
    icon: 'services',
    fields: ['Service category', 'Areas you cover', 'Describe your service'],
  },
  'add-stock': {
    title: 'Add stock',
    description: 'Stock adjustments live in Inventory, with a full movement record.',
    icon: 'inventory',
    fields: [],
    live: {
      label: 'Open inventory',
      href: '/(merchant)/inventory',
      detail: 'Use + on any product.',
    },
  },
  customers: {
    title: 'Customers',
    description: 'Customer records and store credit (“On Book”) are on the roadmap.',
    icon: 'profile',
    fields: ['Customer name', 'Phone'],
  },
  credit: {
    title: 'Credit / On Book',
    description: 'Record credit and repayments without exposing customer information.',
    icon: 'receipt',
    fields: ['Customer', 'Amount', 'Reason'],
  },
  insights: {
    title: 'Business insights',
    description:
      'Signals from your own shop activity — best sellers, quiet hours, demand near you.',
    icon: 'trendUp',
    fields: [],
    live: {
      label: 'View dashboard',
      href: '/(merchant)',
      detail: 'Today’s revenue, low stock and sync status are live now.',
    },
  },
};

export default function ActionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { session } = useAuth();
  const flow = flows[slug] ?? {
    title: slug.replaceAll('-', ' '),
    description: 'This part of Zviripo is not live yet.',
    icon: 'info' as IconName,
    fields: [],
  };

  return (
    <Screen>
      <IconButton accessibilityLabel="Back" icon="back" onPress={() => router.back()} />
      <Row gap={spacing[3]} style={styles.heading}>
        <View style={styles.iconWrap}>
          <Icon color={colors.brand.forestDeep} name={flow.icon} size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text role="headingXl">{flow.title}</Text>
        </View>
      </Row>
      <Text role="body" tone="muted" style={styles.description}>
        {flow.description}
      </Text>

      {flow.live ? (
        <Card style={styles.block} tone="tint">
          <Text role="label" tone="brand">
            LIVE NOW
          </Text>
          <Text role="bodySm" style={{ marginTop: spacing[1] }}>
            {flow.live.detail}
          </Text>
          <Button
            label={flow.live.label}
            onPress={() =>
              router.push(
                (session || !flow.live?.href.startsWith('/(merchant)')
                  ? flow.live!.href
                  : '/(auth)/sign-in') as never,
              )
            }
            style={{ marginTop: spacing[3] }}
          />
        </Card>
      ) : null}

      {flow.fields.length > 0 ? (
        <>
          <Card style={[styles.block, styles.notice]}>
            <Row gap={spacing[2]}>
              <Icon color={colors.warning} name="info" size={18} />
              <View style={{ flex: 1 }}>
                <Text role="headingSm" tone="warning">
                  {copy.comingSoon.label}
                </Text>
                <Text role="bodySm" tone="muted">
                  {copy.comingSoon.detail} This is a preview of the flow.
                </Text>
              </View>
            </Row>
          </Card>
          <View style={styles.form}>
            {flow.fields.map((field, index) => (
              <Input
                editable={false}
                key={field}
                label={field}
                multiline={index === flow.fields.length - 1}
                placeholder="Preview only"
              />
            ))}
            <Button disabled fullWidth label="Not available yet" size="lg" />
          </View>
        </>
      ) : null}

      {!flow.live && flow.fields.length === 0 ? (
        <Card style={[styles.block, styles.notice]}>
          <Text role="headingSm" tone="warning">
            {copy.comingSoon.label}
          </Text>
          <Text role="bodySm" tone="muted">
            {copy.comingSoon.detail}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing[5] },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.brand.tint,
  },
  description: { marginTop: spacing[3] },
  block: { marginTop: spacing[5] },
  notice: { borderColor: colors.gold[100], backgroundColor: colors.warningSoft },
  form: { marginTop: spacing[4], gap: spacing[4] },
});
