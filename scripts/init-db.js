const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('Inicializando banco de dados...');

// Drop existing tables to ensure schema update
db.exec(`
  DROP TABLE IF EXISTS portfolio_items;
  DROP TABLE IF EXISTS resume_items;
  DROP TABLE IF EXISTS skills;
  DROP TABLE IF EXISTS settings;
`);

db.exec(`
  CREATE TABLE portfolio_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    link TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE resume_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    technologies TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    percentage INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

const insertSkill = db.prepare('INSERT INTO skills (name, level, percentage, image_url) VALUES (?, ?, ?, ?)');
const insertJob = db.prepare('INSERT INTO resume_items (type, title, institution, start_date, end_date, description, technologies, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  // Mauricio's Settings
  db.exec("INSERT INTO settings (key, value) VALUES ('name', 'Mauricio Garcia Bimbu')");
  db.exec("INSERT INTO settings (key, value) VALUES ('roles', 'Analista de Dados, Cientista de Dados, Arquiteto de Dados')");
  db.exec("INSERT INTO settings (key, value) VALUES ('bio', 'Sou um amante da computação que busca explorar a capacidade de processamento das máquinas na extração de informações úteis de grandes massas de dados. Busco aplicar conceitos estatísticos, econométricos e de programação bem como técnicas de Big data analytics, Business analytics, Engenharia de Dados, I.A. e Machine Learning para gerar as melhores soluções.')");

  // Skills
  insertSkill.run('Apache Airflow', 'Avançado', 95, null);
  insertSkill.run('Metabase', 'Avançado', 95, null);
  insertSkill.run('Streamlit', 'Avançado', 95, null);
  insertSkill.run('Linguagem R', 'Avançado', 95, null);
  insertSkill.run('Python', 'Avançado', 95, null);
  insertSkill.run('ETL', 'Avançado', 95, null);
  insertSkill.run('AWS', 'Muito bom', 90, null);
  insertSkill.run('Apache Spark', 'Muito bom', 90, null);
  insertSkill.run('Hadoop', 'Muito bom', 90, null);
  insertSkill.run('SQL', 'Bom', 80, null);
  insertSkill.run('Microsoft Power BI', 'Bom', 85, null);
  
  // Jobs
  insertJob.run('job', 'Data Group Lead', 'Clicksign', 'Outubro, 2021', 'Atual', 'Lidero os times de engenharia de dados, arquitetura de dados e data quality assurance para fornecer dados úteis na geração de valor para a empresa.', 'Apache Airflow, Spark, AWS, Python, dbt, SQL', null);
  insertJob.run('job', 'Data Architect', 'Clicksign', 'Junho, 2021', 'Atual', 'Atuo orquestrando a concepção de diferentes estratégias para extrair, transformar, armazenar e gerar valor por meio de dados.', 'Apache Spark, AWS, Python, Hadoop, Airflow', null);
  insertJob.run('job', 'Data Scientist', 'Clicksign', 'Outubro, 2020', 'Atual', 'Faço parte do time de BI buscando, através de automações e integrações, transformar dados em insights.', 'Python, R, Power BI, Metabase, Machine Learning', null);

  // Courses
  insertJob.run('course', 'Visualização de Dados e Design de Dashboards', 'Data Science Academy', 'Outubro, 2021', null, 'Criação de modelos e dashboards para suportar as tomadas de decisões.', 'Power BI, Excel, Design Principles', null);
  insertJob.run('course', 'Machine Learning', 'Data Science Academy', 'Agosto, 2021', null, 'Implementação usando R e Python, predição, classificação, etc.', 'Python, R, Scikit-learn, Statistics', null);
  insertJob.run('course', 'Engenharia de Dados com Hadoop e Spark', 'Data Science Academy', 'Dezembro, 2020', null, 'Criar cluster Hadoop, configurar e preparar dados com ETL usando R e Python.', 'Hadoop, Apache Spark, Python, Linux', null);

})();

console.log('Banco populado com sucesso com os dados de Mauricio Garcia Bimbu!');
