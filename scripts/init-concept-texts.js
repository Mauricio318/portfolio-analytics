const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('--- Inserindo textos de Perfil T-Shaped e Subtítulo de Habilidades ---');

const settingsStmt = db.prepare(`
  INSERT INTO settings (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

const newTexts = [
  [
    'profile_concept_text', 
    'Sigo o conceito T-Shaped, pois acredito que a capacidade de produzir soluções eficazes e eficientes dependem fundamentalmente dos conhecimentos previamente adquiridos.'
  ],
  [
    'skills_subtitle', 
    'Estes são meus níveis de habilidade com as tecnologias mais populares no mercado atualmente:'
  ]
];

db.transaction(() => {
  for (const [key, val] of newTexts) {
    settingsStmt.run(key, val);
  }
})();

console.log('✓ Textos inseridos com sucesso nas configurações do banco!');
db.close();
