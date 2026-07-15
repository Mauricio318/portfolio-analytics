import Database from 'better-sqlite3';
import path from 'path';

// Helper to get the correct path in all environments
const dbPath = path.resolve(process.cwd(), 'portfolio.db');

export const getDb = () => {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
};
