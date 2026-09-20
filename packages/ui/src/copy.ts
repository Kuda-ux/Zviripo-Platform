/** Shared Zviripo voice: direct, warm, confident, concise. */
export const copy = {
  tagline: 'Find it. Need it. Build with it.',
  sync: {
    online: { label: 'Everything synced', detail: 'Your business data is up to date.' },
    offline: {
      label: "You're offline",
      detail: 'Your business is still working. Sales are saved on this device.',
    },
    pending: (count: number) => ({
      label: `${count} ${count === 1 ? 'sale' : 'sales'} waiting to sync`,
      detail: 'Saved safely on this device. They will sync when you are back online.',
    }),
    syncing: { label: 'Syncing…', detail: 'Sending saved sales to Zviripo.' },
    synced: (count: number) => ({
      label: `${count} ${count === 1 ? 'sale' : 'sales'} synced`,
      detail: 'Stock and reports are up to date.',
    }),
    failed: {
      label: "We couldn't sync yet",
      detail: 'Your sales are still safe on this device. Try again in a moment.',
    },
  },
  sale: {
    recordedSynced: { title: 'Sale recorded', detail: 'Stock updated and synced.' },
    recordedLocal: {
      title: 'Sale saved on this device',
      detail: "It's safe. It will sync automatically when you're back online.",
    },
  },
  empty: {
    marketplace: {
      title: 'Nothing nearby yet',
      detail: 'Be the first to ask — shops near you will see your request.',
      action: 'Post a request',
    },
    search: (query: string) => ({
      title: `We couldn't find “${query}” yet`,
      detail: 'Need it? Post a request and let relevant businesses know what you are looking for.',
      action: 'Post a request',
    }),
    inventory: {
      title: 'No products yet',
      detail: 'Add your first product to start selling on Zviripo.',
      action: 'Add product',
    },
    sales: {
      title: 'No sales today yet',
      detail: 'Your first sale of the day will appear here.',
      action: 'Sell now',
    },
  },
  error: {
    generic: {
      title: "Something didn't work",
      detail: 'Your information is still here. Try again.',
    },
    network: {
      title: "You're offline",
      detail: 'We will load this when you are back online.',
    },
    load: {
      title: "We couldn't load this",
      detail: 'Check your connection and try again.',
    },
    save: {
      title: "We couldn't save that",
      detail: 'Your information is still here. Try again.',
    },
  },
  comingSoon: {
    label: 'Coming soon',
    detail: 'This part of Zviripo is not live yet. Nothing here is saved.',
  },
} as const;
