import type { Money } from '@comodities/types';

export * from './money';

export function formatMoney(money: Money, locale = 'en-ZW'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
  }).format(money.amountMinor / 100);
}
