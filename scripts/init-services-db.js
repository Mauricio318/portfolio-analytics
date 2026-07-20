const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('--- Inicializando Tabela de Serviços e Configurações de Métricas ---');

// Create services table
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'barchart',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default services if empty
const count = db.prepare('SELECT COUNT(*) as count FROM services').get();

if (count.count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO services (title, description, icon, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  const initialServices = [
    {
      title: 'Engenharia de Dados & Pipelines ETL/ELT',
      description: 'Construção de pipelines Medallion escaláveis (Bronze, Silver, Gold), ingestão streaming/batch e orquestração robusta com Apache Spark, dbt e Airflow.',
      icon: 'workflow',
      sort_order: 1
    },
    {
      title: 'Análise Descritiva & Diagnóstica',
      description: 'Exploração estatística minuciosa de grandes volumes de dados, modelagem dimensional e mineração para identificar causas raiz e comportamentos.',
      icon: 'barchart',
      sort_order: 2
    },
    {
      title: 'Machine Learning & Analytics Preditivo',
      description: 'Desenvolvimento e implantação de modelos preditivos (Classificação, Regressão, Clusterização) aplicados à antecipação de tendências e decisão rápida.',
      icon: 'cpu',
      sort_order: 3
    },
    {
      title: 'Análise Prescritiva & Otimização',
      description: 'Formulação de estratégias orientadas a dados e simulação de cenários de decisão para otimizar eficiência operacional e reduzir custos.',
      icon: 'target',
      sort_order: 4
    },
    {
      title: 'Modelagem Econométrica & Quantitativa',
      description: 'Aplicação de econometria avançada, séries temporais e estatística em variáveis complexas para extração de insights acionáveis.',
      icon: 'trending',
      sort_order: 5
    },
    {
      title: 'Data Visualization & Dashboards Executivos',
      description: 'Design de painéis interativos de alta performance (Power BI, Looker, Streamlit) focados na visualização clara da Big Picture estratégica.',
      icon: 'layout',
      sort_order: 6
    },
    {
      title: 'Consultoria em Arquitetura de Dados & Cloud',
      description: 'Assessoria especializada em modernização de Data Warehouses, migração para nuvem (GCP, Azure, AWS) e governança de dados.',
      icon: 'message',
      sort_order: 7
    }
  ];

  db.transaction(() => {
    for (const service of initialServices) {
      insertStmt.run(service.title, service.description, service.icon, service.sort_order);
    }
  })();

  console.log('✓ 7 Serviços de Engenharia de Dados & Analytics criados com sucesso!');
}

// Seed default settings for Services & Stats
const settingsStmt = db.prepare(`
  INSERT INTO settings (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

const defaultSettings = [
  ['services_subtitle', 'O que posso fazer pelo seu negócio?'],
  ['services_description', 'Soluções sob medida em Engenharia de Dados, Analytics Avançado, Machine Learning e Arquitetura Cloud.'],
  ['stat_projects_completed', '50'],
  ['stat_label_completed', 'Projetos Entregues'],
  ['stat_projects_ongoing', '10'],
  ['stat_label_ongoing', 'Em Andamento'],
  ['stat_research_ongoing', '20'],
  ['stat_label_research', 'Estudos & Pesquisas'],
  ['stat_ideas_count', '475'],
  ['stat_label_ideas', 'Protótipos & Ideias'],
  ['stat_coffee_count', '7.500'],
  ['stat_label_coffee', 'Cafés Consumidos'],
  ['stat_hours_count', '9.000'],
  ['stat_label_hours', 'Horas de Engenharia']
];

db.transaction(() => {
  for (const [key, val] of defaultSettings) {
    // Check if key already exists, only insert if absent
    const exists = db.prepare('SELECT 1 FROM settings WHERE key = ?').get(key);
    if (!exists) {
      settingsStmt.run(key, val);
    }
  }
})();

console.log('✓ Configurações de texto e métricas salvas no banco!');
db.close();
