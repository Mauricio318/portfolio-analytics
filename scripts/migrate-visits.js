const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('Migrando banco para adicionar tabela de visitas...');

// Cria a tabela de visitas se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    country TEXT,
    city TEXT,
    device TEXT,
    browser TEXT,
    referrer TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Adiciona a chave de contagem de visitas nas settings se não existir
const existingCount = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get();
if (!existingCount) {
  db.prepare("INSERT INTO settings (key, value) VALUES ('visit_count', '0')").run();
  console.log('Chave visit_count criada nas settings.');
} else {
  console.log(`Chave visit_count já existe com valor: ${existingCount.value}`);
}

console.log('Migração de visitas concluída com sucesso!');
db.close();
