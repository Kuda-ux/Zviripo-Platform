export const colors = {
  brand: {
    50: '#eef6f1',
    100: '#d9ecdf',
    500: '#178d5f',
    600: '#0f7a51',
    700: '#0d5f40',
    900: '#0a3527',
    night: '#000a14',
    forest: '#0a3527',
    forestDeep: '#0d5f40',
    emerald: '#178d5f',
    soft: '#d9ecdf',
    tint: '#eef6f1',
  },
  accent: {
    100: '#fbeed3',
    500: '#e8a020',
    700: '#b77708',
  },
  gold: {
    100: '#fbeed3',
    500: '#e8a020',
    700: '#b77708',
  },
  ink: '#101d16',
  muted: '#54675c',
  canvas: '#f5f4ef',
  paper: '#f5f4ef',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  border: '#e2e5dc',
  onDark: '#ffffff',
  onDarkMuted: '#b8d0c5',
  success: '#0f7a51',
  successSoft: '#e3f3ea',
  warning: '#b77708',
  warningSoft: '#fbeed3',
  danger: '#c03b2b',
  dangerSoft: '#fbe4e0',
  info: '#2f5fa3',
  infoSoft: '#e4ecf8',
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
  20: 80,
  24: 96,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
  small: 8,
  medium: 12,
  large: 16,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#101d16',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

export interface TextRole {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing?: number;
  textTransform?: 'uppercase';
  fontVariant?: readonly ['tabular-nums'];
}

export const text = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: '900', letterSpacing: -1.2 },
  headingXl: { fontSize: 30, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 },
  headingLg: { fontSize: 24, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 },
  headingMd: { fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: -0.2 },
  headingSm: { fontSize: 17, lineHeight: 22, fontWeight: '800' },
  bodyLg: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodySm: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  numericLg: { fontSize: 34, lineHeight: 38, fontWeight: '900', fontVariant: ['tabular-nums'] },
  numeric: { fontSize: 20, lineHeight: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  numericSm: { fontSize: 15, lineHeight: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextRole>;

export type TextRoleName = keyof typeof text;

export const typography = {
  family: { sans: 'System', mono: 'monospace' },
  size: { caption: 12, body: 15, title: 20, display: 36 },
  lineHeight: { caption: 16, body: 22, title: 24, display: 40 },
} as const;

export const motion = {
  micro: 120,
  transition: 200,
  sheet: 260,
  success: 320,
  pressScale: 0.97,
} as const;

export const touchTarget = { minimum: 48 } as const;
