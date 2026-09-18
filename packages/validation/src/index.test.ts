import { describe, expect, it } from 'vitest';
import { moneySchema, syncOperationSchema } from './index';

const validOperation = {
  operationId: '3ac9915f-5c6d-4c0d-adb4-1d1942bd2791',
  deviceId: '6c4135c7-daef-44fb-82bf-7147df33505b',
  entityType: 'sale',
  operationType: 'create',
  payloadVersion: 1,
  createdAt: '2026-09-17T12:00:00.000Z',
};

describe('money validation', () => {
  it('accepts safe integer minor units', () => {
    expect(moneySchema.parse({ amountMinor: 1500, currency: 'ZWG' })).toEqual({
      amountMinor: 1500,
      currency: 'ZWG',
    });
  });

  it('rejects fractional and unsupported currency values', () => {
    expect(moneySchema.safeParse({ amountMinor: 10.5, currency: 'USD' }).success).toBe(false);
    expect(moneySchema.safeParse({ amountMinor: 100, currency: 'EUR' }).success).toBe(false);
  });
});

describe('sync operation validation', () => {
  it('accepts stable operation metadata', () => {
    expect(syncOperationSchema.parse(validOperation)).toEqual(validOperation);
  });

  it('rejects invalid identifiers and payload versions', () => {
    expect(
      syncOperationSchema.safeParse({ ...validOperation, operationId: 'sale-1' }).success,
    ).toBe(false);
    expect(syncOperationSchema.safeParse({ ...validOperation, payloadVersion: 0 }).success).toBe(
      false,
    );
  });
});
