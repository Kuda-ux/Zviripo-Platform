export const colors = {
  brand: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    900: '#064e3b',
  },
  ink: '#13231b',
  muted: '#5f6f66',
  canvas: '#f7f9f7',
  surface: '#ffffff',
  border: '#dfe7e2',
  success: '#087a4b',
  warning: '#a15c00',
  danger: '#b42318',
  info: '#175cd3',
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

export const radii = { small: 8, medium: 12, large: 18, pill: 999 } as const;

export const typography = {
  family: { sans: 'System', mono: 'monospace' },
  size: { caption: 12, body: 16, title: 22, display: 32 },
  lineHeight: { caption: 16, body: 24, title: 28, display: 40 },
} as const;

export const touchTarget = { minimum: 48 } as const;
