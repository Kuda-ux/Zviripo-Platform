import { colors, radii, spacing, typography } from '@comodities/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const labels: Record<
  string,
  { title: string; description: string; fields: string[]; submit: string }
> = {
  sell: {
    title: 'Sell something',
    description: 'Create a local listing buyers can understand quickly.',
    fields: ['What are you selling?', 'Price', 'Area', 'Description'],
    submit: 'Review listing',
  },
  request: {
    title: 'Post a request',
    description: 'Tell nearby businesses or providers exactly what you need.',
    fields: ['What do you need?', 'Optional budget', 'Area', 'When do you need it?'],
    submit: 'Review request',
  },
  services: {
    title: 'Find a service',
    description: 'Describe the job and connect with relevant local providers.',
    fields: ['Service needed', 'Area', 'Preferred date', 'Describe the work'],
    submit: 'Find providers',
  },
  'offer-service': {
    title: 'Offer a service',
    description: 'Make your skills discoverable to local customers.',
    fields: [
      'Service category',
      'Business or display name',
      'Areas covered',
      'Describe your service',
    ],
    submit: 'Review service',
  },
  'add-stock': {
    title: 'Add stock',
    description: 'Update quantity while keeping a clear inventory record.',
    fields: ['Product', 'Quantity received', 'Unit cost (optional)', 'Supplier note (optional)'],
    submit: 'Add stock',
  },
  customers: {
    title: 'Customers',
    description: 'Find a customer or add a simple customer record.',
    fields: ['Search by name or phone'],
    submit: 'Add customer',
  },
  credit: {
    title: 'Credit / On Book',
    description: 'Record credit and repayments without exposing customer information.',
    fields: ['Customer', 'Amount', 'Reason or sale reference'],
    submit: 'Review entry',
  },
  insights: {
    title: 'Business insights',
    description: 'Useful signals based on your own shop activity.',
    fields: [],
    submit: 'Done',
  },
};

export default function ActionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const config = labels[slug] ?? {
    title: slug.replaceAll('-', ' '),
    description: 'This flow is ready for backend connection.',
    fields: ['Details'],
    submit: 'Continue',
  };
  const [submitted, setSubmitted] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>COMODITIES</Text>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>
        {submitted ? (
          <View style={styles.success}>
            <Text style={styles.successMark}>✓</Text>
            <Text style={styles.successTitle}>Saved on this device</Text>
            <Text style={styles.successDetail}>
              This demonstration flow is complete and ready to sync when the backend is connected.
            </Text>
            <Pressable onPress={() => router.back()} style={styles.primary}>
              <Text style={styles.primaryText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            {config.fields.map((field, index) => (
              <View key={field}>
                <Text style={styles.label}>{field}</Text>
                <TextInput
                  accessibilityLabel={field}
                  multiline={index === config.fields.length - 1 && config.fields.length > 1}
                  placeholder={`Enter ${field.toLowerCase()}`}
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.input,
                    index === config.fields.length - 1 &&
                      config.fields.length > 1 &&
                      styles.multiline,
                  ]}
                />
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSubmitted(true)}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>{config.submit}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  page: { padding: spacing[5], paddingBottom: spacing[12] },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { color: colors.brand[700], fontWeight: '900' },
  eyebrow: {
    marginTop: spacing[5],
    color: colors.brand[700],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing[2],
    color: colors.ink,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  description: {
    marginTop: spacing[3],
    color: colors.muted,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  form: { marginTop: spacing[8], gap: spacing[4] },
  label: { marginBottom: spacing[2], color: colors.ink, fontSize: 12, fontWeight: '800' },
  input: {
    minHeight: 54,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  multiline: { minHeight: 110, paddingTop: spacing[4], textAlignVertical: 'top' },
  primary: {
    minHeight: 54,
    marginTop: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
  },
  primaryText: { color: colors.surface, fontWeight: '900' },
  success: {
    marginTop: spacing[8],
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.large,
    backgroundColor: colors.surface,
  },
  successMark: {
    width: 52,
    height: 52,
    paddingTop: 10,
    color: colors.success,
    textAlign: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.brand[100],
    fontSize: 22,
    fontWeight: '900',
  },
  successTitle: {
    marginTop: spacing[5],
    color: colors.ink,
    fontSize: typography.size.title,
    fontWeight: '900',
  },
  successDetail: {
    marginTop: spacing[2],
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
