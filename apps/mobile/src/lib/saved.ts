import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

const DATABASE_NAME = 'comodities.db';
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (d) => {
      await d.execAsync(`
        CREATE TABLE IF NOT EXISTS saved_listings (
          listing_id TEXT PRIMARY KEY NOT NULL,
          product_name TEXT NOT NULL,
          business_name TEXT NOT NULL,
          saved_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      return d;
    });
  }
  return dbPromise;
}

export interface SavedListing {
  listing_id: string;
  product_name: string;
  business_name: string;
  saved_at: string;
}

export async function isSaved(listingId: string) {
  const d = await db();
  const row = await d.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM saved_listings WHERE listing_id = ?`,
    [listingId],
  );
  return (row?.n ?? 0) > 0;
}

export async function toggleSaved(listing: {
  listing_id: string;
  product_name: string;
  business_name: string;
}) {
  const d = await db();
  if (await isSaved(listing.listing_id)) {
    await d.runAsync(`DELETE FROM saved_listings WHERE listing_id = ?`, [listing.listing_id]);
    return false;
  }
  await d.runAsync(
    `INSERT INTO saved_listings (listing_id, product_name, business_name) VALUES (?, ?, ?)`,
    [listing.listing_id, listing.product_name, listing.business_name],
  );
  return true;
}

export async function listSaved(): Promise<SavedListing[]> {
  const d = await db();
  return d.getAllAsync<SavedListing>(`SELECT * FROM saved_listings ORDER BY saved_at DESC`);
}

/** Saved state for one listing, persisted on this device. */
export function useSaved(
  listing: { listing_id: string; product_name: string; business_name: string } | null,
) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (listing) isSaved(listing.listing_id).then(setSaved);
  }, [listing?.listing_id]);
  const toggle = useCallback(async () => {
    if (!listing) return;
    setSaved(await toggleSaved(listing));
  }, [listing]);
  return { saved, toggle };
}
