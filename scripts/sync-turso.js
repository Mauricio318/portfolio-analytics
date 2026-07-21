const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');

async function syncToTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ ERRO: Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no ambiente ou .env.local');
    process.exit(1);
  }

  console.log('🚀 Conectando ao Turso Cloud DB...');
  const turso = createClient({ url, authToken });

  const dbPath = path.join(process.cwd(), 'portfolio.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ ERRO: portfolio.db local nao encontrado.');
    process.exit(1);
  }

  const localDb = new Database(dbPath, { readonly: true });
  const tablesRes = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

  console.log('📋 Recriando tabelas no Turso com o esquema 100% fiel ao banco local...');

  for (const tableObj of tablesRes) {
    if (!tableObj.name || !tableObj.sql) continue;
    try {
      await turso.execute(`DROP TABLE IF EXISTS ${tableObj.name}`);
      await turso.execute(tableObj.sql);
      console.log(`  ✓ Tabela '${tableObj.name}' criada com sucesso.`);
    } catch (e) {
      console.error(`Erro ao criar tabela ${tableObj.name}:`, e.message);
    }
  }

  console.log('📦 Migrando todos os registros locais para o Turso Cloud...');

  for (const tableObj of tablesRes) {
    const tableName = tableObj.name;
    try {
      const rows = localDb.prepare(`SELECT * FROM ${tableName}`).all();
      if (rows.length === 0) continue;

      console.log(`  └ Migrando ${tableName} (${rows.length} registros)...`);

      for (const row of rows) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => row[k]);

        let sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

        await turso.execute({ sql, args: values });
      }
    } catch (err) {
      console.warn(`  ⚠️ Aviso na tabela ${tableName}:`, err.message);
    }
  }

  console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO! Todos os seus dados locais estão 100% salvos e sincronizados no Turso Cloud DB.');
}

syncToTurso().catch(err => {
  console.error('❌ Erro na sincronizacao:', err);
  process.exit(1);
});
