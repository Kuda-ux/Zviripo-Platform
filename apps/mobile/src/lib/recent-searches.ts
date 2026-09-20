import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'comodities.db';
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (d) => {
      await d.execAsync(`
        CREATE TABLE IF NOT EXISTS recent_searches (
          query TEXT PRIMARY KEY NOT NULL,
          searched_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      return d;
    });
  }
  return dbPromise;
}

export async function rememberSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  const d = await db();
  await d.runAsync(
    `INSERT INTO recent_searches (query, searched_at) VALUES (?, datetime('now'))
     ON CONFLICT(query) DO UPDATE SET searched_at = datetime('now')`,
    [q],
  );
  await d.runAsync(
    `DELETE FROM recent_searches WHERE query NOT IN
       (SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT 8)`,
  );
}

export async function recentSearches(): Promise<string[]> {
  const d = await db();
  const rows = await d.getAllAsync<{ query: string }>(
    `SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT 8`,
  );
  return rows.map((r) => r.query);
}

export async function clearRecentSearches() {
  const d = await db();
  await d.runAsync(`DELETE FROM recent_searches`);
}
