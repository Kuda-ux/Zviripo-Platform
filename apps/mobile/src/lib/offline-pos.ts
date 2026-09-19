import * as SQLite from 'expo-sqlite';
import { recordSale, type SaleInput } from '@comodities/database';
import { isSupabaseConfigured, supabase } from './supabase';

const DATABASE_NAME = 'comodities.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pending_sales (
          operation_id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          error TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          synced_at TEXT
        );
      `);
      return db;
    });
  }
  return databasePromise;
}

export async function queueSale(input: SaleInput) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO pending_sales (operation_id, payload, status, error, synced_at)
     VALUES (?, ?, 'pending', NULL, NULL)`,
    [input.operationId, JSON.stringify(input)],
  );
}

export async function pendingSaleCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM pending_sales WHERE status = 'pending'`,
  );
  return row?.count ?? 0;
}

export interface SyncResult {
  synced: number;
  failed: number;
  pending: number;
}

export async function syncPendingSales(): Promise<SyncResult> {
  if (!isSupabaseConfigured) {
    return { synced: 0, failed: 0, pending: await pendingSaleCount() };
  }

  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    operation_id: string;
    payload: string;
  }>(
    `SELECT operation_id, payload FROM pending_sales WHERE status = 'pending' ORDER BY created_at`,
  );

  let synced = 0;
  let failed = 0;

  for (const row of rows) {
    const input = JSON.parse(row.payload) as SaleInput;
    const { error } = await recordSale(supabase, input);
    if (error) {
      failed += 1;
      await db.runAsync(`UPDATE pending_sales SET error = ? WHERE operation_id = ?`, [
        error.message ?? 'Sync failed',
        row.operation_id,
      ]);
    } else {
      synced += 1;
      await db.runAsync(
        `UPDATE pending_sales SET status = 'synced', synced_at = datetime('now'), error = NULL WHERE operation_id = ?`,
        [row.operation_id],
      );
    }
  }

  return { synced, failed, pending: await pendingSaleCount() };
}
