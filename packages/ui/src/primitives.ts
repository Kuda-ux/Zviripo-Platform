import { colors, radii, spacing, touchTarget, typography } from './tokens';

export const buttonRecipes = {
  primary: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[5],
    borderRadius: radii.medium,
    backgroundColor: colors.brand[700],
    color: colors.surface,
  },
  secondary: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[5],
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.ink,
  },
  danger: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[5],
    borderRadius: radii.medium,
    backgroundColor: colors.danger,
    color: colors.surface,
  },
} as const;

export const inputRecipe = {
  minHeight: 56,
  paddingHorizontal: spacing[4],
  borderRadius: radii.medium,
  borderColor: colors.border,
  backgroundColor: colors.surface,
  color: colors.ink,
  fontSize: typography.size.body,
} as const;

export const cardRecipe = {
  padding: spacing[5],
  borderRadius: radii.large,
  borderColor: colors.border,
  backgroundColor: colors.surface,
} as const;

export const feedback = {
  offline: {
    label: 'Working offline',
    detail: 'Sales are safe on this device and will sync later.',
  },
  pending: { label: 'Waiting to sync', detail: 'You can keep working.' },
  synced: { label: 'Everything synced', detail: 'Your business data is up to date.' },
  conflict: { label: 'Action needed', detail: 'Review an item that could not sync safely.' },
  saleRecorded: { label: 'Sale recorded', detail: 'Stock has been updated.' },
} as const;
