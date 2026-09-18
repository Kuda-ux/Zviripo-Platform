export type CurrencyCode = 'USD' | 'ZWG';

export type Money = Readonly<{
  amountMinor: number;
  currency: CurrencyCode;
}>;

export type SyncStatus = 'pending' | 'uploading' | 'retry' | 'conflict' | 'synced';

export type SyncOperation = Readonly<{
  operationId: string;
  deviceId: string;
  entityType: string;
  operationType: string;
  payloadVersion: number;
  createdAt: string;
  attemptCount: number;
  status: SyncStatus;
  lastError?: string;
}>;
