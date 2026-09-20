import type { CurrencyCode, Money } from '@comodities/types';

export * from './money';
export * from './errors';

const symbols: Record<CurrencyCode, string> = { USD: '$', ZWG: 'ZiG ' };

/**
 * Formats integer minor units without floating-point arithmetic.
 * `formatMinor(850, 'USD')` → `$8.50`, `formatMinor(-1234, 'ZWG')` → `-ZiG 12.34`.
 * Works identically on Hermes, Node and browsers (no Intl dependency).
 */
export function formatMinor(amountMinor: number, currency: CurrencyCode): string {
  if (!Number.isSafeInteger(amountMinor)) throw new RangeError('Money must be integer minor units');
  const sign = amountMinor < 0 ? '-' : '';
  const abs = Math.abs(amountMinor);
  const major = Math.trunc(abs / 100);
  const minor = abs % 100;
  const grouped = major.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${symbols[currency]}${grouped}.${minor.toString().padStart(2, '0')}`;
}

export function formatMoney(money: Money): string {
  return formatMinor(money.amountMinor, money.currency);
}

/** RFC 4122 v4 id for operations, devices and receipts. Works without `crypto.randomUUID`. */
export function newOperationId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function receiptNumber(now = new Date()): string {
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const t = now.getTime().toString(36).slice(-5).toUpperCase();
  return `R${y}${m}${d}-${t}`;
}
