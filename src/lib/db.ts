import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export const getDb = (readonly = false) => {
  const candidates = [
    path.join(process.cwd(), 'portfolio.db'),
    path.join(process.cwd(), '.next', 'server', 'app', 'portfolio.db'),
    path.join(process.cwd(), '.next', 'server', 'portfolio.db'),
    typeof __dirname !== 'undefined' ? path.join(__dirname, 'portfolio.db') : null,
    typeof __dirname !== 'undefined' ? path.join(__dirname, '..', '..', '..', 'portfolio.db') : null,
  ].filter(Boolean) as string[];

  let dbPath = candidates[0];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dbPath = candidate;
      break;
    }
  }

  const db = new Database(dbPath, { readonly });
  if (!readonly && !process.env.VERCEL) {
    db.pragma('journal_mode = delete');
  }
  return db;
};

export async function deleteUploadedFile(filePath?: string | null) {
  if (!filePath || typeof filePath !== 'string' || !filePath.startsWith('/uploads/')) return;
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✓ Arquivo fisicamente removido do disco: ${fullPath}`);
    }
  } catch (err) {
    console.error(`Erro ao deletar arquivo do disco (${filePath}):`, err);
  }
}
