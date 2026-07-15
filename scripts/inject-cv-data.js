const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('Iniciando injeção de dados reais do Lattes de Mauricio Garcia Bimbu...');

const insertJob = db.prepare('INSERT INTO resume_items (type, title, institution, start_date, end_date, description, technologies, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const insertSkill = db.prepare('INSERT INTO skills (name, level, percentage, image_url) VALUES (?, ?, ?, ?)');
const insertPortfolio = db.prepare('INSERT INTO portfolio_items (title, description, category, image_url, link, tags) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  // Limpar tabelas para nao duplicar
  db.exec('DELETE FROM resume_items');
  db.exec('DELETE FROM skills');
  db.exec('DELETE FROM portfolio_items');
  db.exec("UPDATE settings SET value = 'Engenheiro de Dados e Analista Especialista' WHERE key = 'roles'");
  db.exec("UPDATE settings SET value = 'Mestrando em Ciência da Computação (USP) com ampla experiência em infraestrutura, pipelines de dados e visualização. Especialista certificado em Power BI (PL-300), Fabric (DP-600) e Cloud Data Management. Focado em extrair valor e resolver problemas reais das organizações de ponta a ponta.' WHERE key = 'bio'");

  // Experiencia 1
  insertJob.run('job', 'Analista de Dados e Infraestrutura', 'Banco do Nordeste do Brasil (Terceirizado)', '12/2023', 'Atual', 
    'Desenvolvimento e manutenção de relatórios; Pipelines em Python para integração; Monitoramento de capacidade e performance de servidores.', 
    'Python, Power BI, SQL Server, Bash, SSRS, Linux', null);
    
  // Experiencia 2
  insertJob.run('job', 'Professor de Aplicativos e IA', 'Senac São Paulo', '05/2025', '10/2025', 
    'Professor de Power BI, Excel e Fundamentos de IA, com foco em mercado e resolução de problemas corporativos reais.', 
    'Power BI, Excel, ChatGPT, Prompt Engineering, Generative AI', null);
    
  // Experiencia 3
  insertJob.run('job', 'Analista de Dados', 'SAFE CONSIG', '07/2023', '08/2025', 
    'Manipulação via Python e Pentaho, relatórios gerenciais Power BI. Automação de pipelines ETL e gestão de margens de consignações.', 
    'Python, Pentaho, Power BI, SQL, ETL, Margem Consignável', null);
    
  // Experiencia 4
  insertJob.run('job', 'Analista de Dados (People Analytics)', 'Instituto Atlântico', '11/2022', '07/2023', 
    'Coleta, análise e interpretação de dados de RH (rotatividade, satisfação) para predição de padrões e apoio à tomada de decisão.', 
    'Python, R, Excel, Statsmodels, Pandas, Machine Learning, HR Analytics', null);
    
  // Experiencia 5
  insertJob.run('job', 'Analista de Dados', 'Banco do Nordeste (Bolsista)', '09/2021', '09/2022', 
    'Desenvolvimento de Dashboards Power BI e SSRS, automação via Python/VBA e acompanhamento de campanhas crédito.', 
    'Power BI, SSRS, Python, VBA, SQL, Credit Campaigns', null);

  // Formação Acadêmica
  insertJob.run('academic', 'Mestrado em Ciência da Computação', 'Universidade de São Paulo (USP)', '07/2024', 'Atual', 
    'Pesquisa aprofundada em sistemas e inteligência.', 
    'USP, Computer Science, Algorithms, Advanced Systems', null);
  insertJob.run('academic', 'MBA em Data Science e Analytics', 'Universidade de São Paulo (USP)', '10/2023', 'Atual', 
    'Formação técnica avançada em Data Science aplicada aos negócios.', 
    'USP, Data Science, Analytics, Machine Learning, Business Intelligence', null);
  insertJob.run('academic', 'Graduação em Ciência da Computação', 'Universidade Federal do Ceará (UFC)', '02/2018', '08/2023', 
    'Formação fundamental em Engenharia de Software, Algoritmos e Dados.', 
    'UFC, Software Engineering, Databases, Data Structures, Git', null);

  // Certificações (Com suporte a upload de imagem)
  insertJob.run('certification', 'Microsoft Fabric Analytics Engineer Associate (DP-600)', 'Microsoft', '2024', null, 
    'Certificação oficial.', 
    'Microsoft Fabric, Data Analytics, DP-600, Lakehouses, Power BI', null);
  insertJob.run('certification', 'Microsoft Power BI Data Analyst (PL-300)', 'Microsoft', '2023', null, 
    'Certificação oficial.', 
    'Power BI, Data Analyst, PL-300, DAX, Power Query', null);
  insertJob.run('certification', 'Oracle Cloud Data Management Foundations', 'Oracle', '2023', null, 
    'Certificação oficial.', 
    'Oracle Cloud, Cloud Data Management, Cloud Databases', null);

  // Cursos Complementares (Com suporte a upload de logo)
  insertJob.run('course', 'Visualização de Dados e Design de Dashboards', 'Data Science Academy', '10/2021', null, 
    'Criação de modelos e dashboards para suportar as tomadas de decisões.', 
    'Power BI, Excel, Design Principles', null);
  insertJob.run('course', 'Machine Learning', 'Data Science Academy', '08/2021', null, 
    'Implementação usando R e Python, predição, classificação, etc.', 
    'Python, R, Scikit-learn, Statistics', null);

  // Skills Reais Extraidas (Com suporte a logo da ferramenta)
  insertSkill.run('Python & Computação', 'Avançado', 95, null);
  insertSkill.run('Power BI & SSRS', 'Avançado', 95, null);
  insertSkill.run('ETL (Pentaho, dbt)', 'Avançado', 90, null);
  insertSkill.run('SQL & Banco de Dados', 'Avançado', 95, null);
  insertSkill.run('Cloud (Azure, AWS, Oracle)', 'Muito bom', 85, null);
  insertSkill.run('Machine Learning & Estatística', 'Muito bom', 80, null);

  // Portfolio Falso (como exemplo de vitrine ate o usuario trocar pelo admin)
  insertPortfolio.run('Dashboard de Monitoramento de Infraestrutura', 'Painel executivo em Power BI focado em monitoramento de capacidade de servidores, consumo de CPU, IOPS de banco de dados e tráfego de rede em tempo real.', 'Power BI', '/images/powerbi_dashboard.png', '#', 'Power BI, SQL Server, Data Viz');
  insertPortfolio.run('ETL Segurado e Ágil', 'Mapeamento massivo de arquivos CSV e XML governamentais unificados em um Data Warehouse dinâmico.', 'Engenharia de Dados', null, '#', 'Pentaho, Python, dbt, Cloud');
  insertPortfolio.run('Modelo Preditivo People Analytics', 'Análise profunda da taxa de turnover, correlacionando satisfação, faixa salarial e tempo de casa.', 'Ciência de Dados', null, '#', 'Python, Scikit-learn, R');

})();

console.log('Dados injetados com maestria no banco SQLite.');
