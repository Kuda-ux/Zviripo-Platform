/**
 * Single icon language for Zviripo. Names are Ionicons glyph names
 * (rendered via @expo/vector-icons on mobile). Web maps the same keys
 * to inline SVG in apps/web/components/icon.tsx.
 */
export const icons = {
  search: 'search-outline',
  location: 'location-outline',
  cart: 'cart-outline',
  sell: 'pricetag-outline',
  inventory: 'cube-outline',
  business: 'storefront-outline',
  request: 'hand-right-outline',
  services: 'construct-outline',
  opportunities: 'briefcase-outline',
  notifications: 'notifications-outline',
  receipt: 'receipt-outline',
  settings: 'settings-outline',
  verified: 'shield-checkmark-outline',
  sync: 'sync-outline',
  synced: 'cloud-done-outline',
  offline: 'cloud-offline-outline',
  back: 'chevron-back',
  forward: 'chevron-forward',
  save: 'heart-outline',
  saved: 'heart',
  add: 'add',
  remove: 'remove',
  close: 'close',
  check: 'checkmark',
  warning: 'alert-circle-outline',
  info: 'information-circle-outline',
  home: 'home-outline',
  discover: 'compass-outline',
  activity: 'pulse-outline',
  profile: 'person-circle-outline',
  more: 'ellipsis-horizontal',
  dashboard: 'grid-outline',
  cash: 'cash-outline',
  mobileMoney: 'phone-portrait-outline',
  card: 'card-outline',
  trendUp: 'trending-up-outline',
  lowStock: 'alert-outline',
  signOut: 'log-out-outline',
  mail: 'mail-outline',
  lock: 'lock-closed-outline',
} as const;

export type IconName = keyof typeof icons;
