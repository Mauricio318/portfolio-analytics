import Database from 'better-sqlite3';
import path from 'path';

// Helper to get the correct path in all environments
const dbPath = path.join(process.cwd(), 'portfolio.db');

export const getDb = (readonly = false) => {
  const db = new Database(dbPath, { readonly });
  if (!readonly) {
    db.pragma('journal_mode = WAL');
  }
  return db;
};
