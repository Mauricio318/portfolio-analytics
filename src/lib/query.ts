import { getTursoClient } from './turso';
import { getDb } from './db';

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({ sql, args: params });
    return res.rows as unknown as T[];
  }

  const db = getDb(true);
  const rows = db.prepare(sql).all(...params) as T[];
  return rows;
}

export async function dbQueryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({ sql, args: params });
    return (res.rows[0] as unknown as T) || null;
  }

  const db = getDb(true);
  const row = db.prepare(sql).get(...params) as T;
  return row || null;
}

export async function dbExecute(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; rowsAffected?: number }> {
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({ sql, args: params });
    return {
      lastInsertRowid: res.lastInsertRowid,
      rowsAffected: res.rowsAffected
    };
  }

  const db = getDb(false);
  const info = db.prepare(sql).run(...params);
  return {
    lastInsertRowid: info.lastInsertRowid,
    rowsAffected: info.changes
  };
}

export async function dbTransaction(statements: { sql: string; params?: any[] }[]): Promise<void> {
  const turso = getTursoClient();
  if (turso) {
    await turso.batch(statements.map(s => ({ sql: s.sql, args: s.params || [] })));
    return;
  }

  const db = getDb(false);
  db.transaction(() => {
    for (const stmt of statements) {
      db.prepare(stmt.sql).run(...(stmt.params || []));
    }
  })();
}
