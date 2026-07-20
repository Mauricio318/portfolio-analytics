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

  // Always ensure migrations have run by opening a write handle if needed
  try {
    const writeDb = new Database(dbPath, { readonly: false });
    if (!process.env.VERCEL) {
      writeDb.pragma('journal_mode = delete');
    }
    runMigrations(writeDb);
    writeDb.close();
  } catch (e) {
    // Ignore if already open or locked
  }

  const db = new Database(dbPath, { readonly });
  return db;
};

function runMigrations(db: Database.Database) {
  try {
    // 1. Create articles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        publisher TEXT,
        publish_date TEXT,
        read_time TEXT,
        tags TEXT,
        image_url TEXT,
        is_featured INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const addColumnIfMissing = (table: string, column: string, type: string) => {
      try {
        const cols = db.pragma(`table_info(${table})`) as any[];
        if (cols && !cols.some(c => c.name === column)) {
          db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
        }
      } catch (e) {
        // Table might not exist yet
      }
    };

    ['portfolio_items', 'resume_items', 'services', 'skills', 'academic_sections', 'academic_section_items'].forEach(table => {
      addColumnIfMissing(table, 'is_visible', 'INTEGER DEFAULT 1');
    });

    addColumnIfMissing('portfolio_items', 'code_snippet', 'TEXT');
    addColumnIfMissing('portfolio_items', 'code_language', 'TEXT');

    addColumnIfMissing('articles', 'category', 'TEXT DEFAULT "Engenharia & Arquitetura de Dados"');
    addColumnIfMissing('articles', 'card_size', 'TEXT DEFAULT "normal"');

    // Auto-seed articles table if empty so Admin displays them immediately
    try {
      const countRes = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
      if (countRes && countRes.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO articles (title, description, url, publisher, category, publish_date, read_time, tags, is_featured, is_visible, sort_order, card_size)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `);
        stmt.run(
          'Arquitetura Medallion: Como Estruturar Data Lakes de Alta Performance',
          'Guia prático sobre como organizar camadas Bronze, Silver e Gold utilizando Apache Spark, Delta Lake e boas práticas de governança de dados.',
          'https://medium.com/@mauriciobimbu',
          'Medium',
          'Engenharia & Arquitetura de Dados',
          'Mai 2024',
          '6 min de leitura',
          'Engenharia de Dados, Spark, Data Lake',
          1,
          1,
          'large'
        );
        stmt.run(
          'Construindo Pipelines Resilientes de Ingestão Streaming com PySpark & Kafka',
          'Estratégias de tratamento de esquema em evolução, checkpointing e monitoramento em tempo real para dados de alto volume.',
          'https://www.linkedin.com/in/mauriciobimbu/',
          'LinkedIn Newsletter',
          'Engenharia & Arquitetura de Dados',
          'Fev 2024',
          '8 min de leitura',
          'PySpark, Streaming, Kafka',
          0,
          2,
          'normal'
        );
        stmt.run(
          'Análise de Sentimentos e Mineração de Dados em Redes Sociais com Python',
          'Paper de pesquisa aplicando NLP (Natural Language Processing) e modelos estatísticos para extração de tendências e opiniões.',
          'http://lattes.cnpq.br/9506694715562032',
          'USP / UFC Research',
          'Ciência de Dados & Estatística',
          'Out 2023',
          '12 min de leitura',
          'Data Science, NLP, Machine Learning',
          1,
          3,
          'normal'
        );
      }
    } catch (e) {
      console.error('Erro ao popular artigos padrão:', e);
    }
  } catch (err) {
    console.error('Erro ao executar migrations:', err);
  }
}

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
