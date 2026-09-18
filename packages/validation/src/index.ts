import { z } from 'zod';

export const currencyCodeSchema = z.enum(['USD', 'ZWG']);

export const moneySchema = z.object({
  amountMinor: z.number().int().safe().nonnegative(),
  currency: currencyCodeSchema,
});

export const syncOperationSchema = z.object({
  operationId: z.string().uuid(),
  deviceId: z.string().uuid(),
  entityType: z.string().min(1),
  operationType: z.string().min(1),
  payloadVersion: z.number().int().positive(),
  createdAt: z.string().datetime(),
});
