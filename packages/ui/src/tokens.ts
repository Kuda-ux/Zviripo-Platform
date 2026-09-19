export const colors = {
  brand: {
    50: '#eef6f1',
    100: '#d9ecdf',
    500: '#178d5f',
    600: '#0f7a51',
    700: '#0d5f40',
    900: '#0a3527',
  },
  accent: {
    100: '#fbeed3',
    500: '#e8a020',
    700: '#b77708',
  },
  ink: '#101d16',
  muted: '#54675c',
  canvas: '#f5f4ef',
  surface: '#ffffff',
  border: '#e2e5dc',
  success: '#0f7a51',
  warning: '#b77708',
  danger: '#c03b2b',
  info: '#2f5fa3',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = { small: 8, medium: 14, large: 22, pill: 999 } as const;

export const typography = {
  family: { sans: 'System', mono: 'monospace' },
  size: { caption: 12, body: 16, title: 22, display: 34 },
  lineHeight: { caption: 16, body: 24, title: 28, display: 42 },
} as const;

export const touchTarget = { minimum: 48 } as const;
