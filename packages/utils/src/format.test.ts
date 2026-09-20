import { describe, expect, it } from 'vitest';
import { formatMinor, humanizeError, newOperationId, receiptNumber } from './index';

describe('formatMinor', () => {
  it('formats USD and ZWG from integer minor units', () => {
    expect(formatMinor(850, 'USD')).toBe('$8.50');
    expect(formatMinor(5, 'USD')).toBe('$0.05');
    expect(formatMinor(123456789, 'ZWG')).toBe('ZiG 1,234,567.89');
    expect(formatMinor(-1234, 'USD')).toBe('-$12.34');
  });

  it('rejects non-integer input', () => {
    expect(() => formatMinor(1.5, 'USD')).toThrow(RangeError);
  });
});

describe('ids', () => {
  it('produces v4 uuids', () => {
    expect(newOperationId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('produces dated receipt numbers', () => {
    expect(receiptNumber(new Date(2026, 8, 20, 10, 0, 0))).toMatch(/^R260920-[0-9A-Z]{5}$/);
  });
});

describe('humanizeError', () => {
  it('maps network failures to an offline message', () => {
    const result = humanizeError(new TypeError('Failed to fetch'), 'save');
    expect(result.offline).toBe(true);
    expect(result.dataSafe).toBe(true);
    expect(result.title).toBe("You're offline");
  });

  it('maps RLS and PostgREST codes without leaking them', () => {
    const rls = humanizeError({ code: '42501', message: 'new row violates row-level security' });
    expect(rls.title).toBe("You don't have access to that");
    expect(rls.detail).not.toMatch(/42501|row-level/);

    const missing = humanizeError({ code: 'PGRST116', message: 'JSON object requested' });
    expect(missing.title).toBe("We couldn't find that");
  });

  it('maps auth failures by context', () => {
    expect(humanizeError({ message: 'Invalid login credentials' }, 'auth').title).toBe(
      "We couldn't sign you in",
    );
    expect(humanizeError({ message: 'JWT expired' }).title).toBe('Please sign in again');
  });

  it('falls back to a generic safe message', () => {
    expect(humanizeError(new Error('weird')).dataSafe).toBe(true);
    expect(humanizeError(undefined, 'save').title).toBe("We couldn't save that");
  });
});
