import { describe, expect, it } from 'vitest';
import { addMoney, money, multiplyMoney } from './money';

describe('money operations', () => {
  it('adds matching currencies in minor units', () => {
    expect(addMoney(money(125, 'USD'), money(375, 'USD'))).toEqual({
      amountMinor: 500,
      currency: 'USD',
    });
  });

  it('rejects mixed currencies', () => {
    expect(() => addMoney(money(100, 'USD'), money(100, 'ZWG'))).toThrow(TypeError);
  });

  it('multiplies without floating-point currency arithmetic', () => {
    expect(multiplyMoney(money(199, 'USD'), 3)).toEqual({ amountMinor: 597, currency: 'USD' });
  });

  it('rejects unsafe values', () => {
    expect(() => money(1.5, 'USD')).toThrow(RangeError);
    expect(() => multiplyMoney(money(100, 'USD'), -1)).toThrow(RangeError);
  });
});
