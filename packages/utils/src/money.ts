import type { CurrencyCode, Money } from '@comodities/types';

function assertSafeMinorAmount(amountMinor: number): void {
  if (!Number.isSafeInteger(amountMinor))
    throw new RangeError('Money must use safe integer minor units');
}

export function money(amountMinor: number, currency: CurrencyCode): Money {
  assertSafeMinorAmount(amountMinor);
  return { amountMinor, currency };
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) throw new TypeError('Cannot combine different currencies');
  const amountMinor = left.amountMinor + right.amountMinor;
  assertSafeMinorAmount(amountMinor);
  return money(amountMinor, left.currency);
}

export function multiplyMoney(value: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity) || quantity < 0)
    throw new RangeError('Quantity must be a non-negative safe integer');
  const amountMinor = value.amountMinor * quantity;
  assertSafeMinorAmount(amountMinor);
  return money(amountMinor, value.currency);
}
