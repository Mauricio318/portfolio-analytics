const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

console.log('Iniciando migração de banco para o módulo Acadêmico...');

// 1. Atualizar tabela de visitas para rastrear páginas específicas
try {
  db.exec("ALTER TABLE visits ADD COLUMN page TEXT DEFAULT '/'");
  console.log('Coluna "page" adicionada à tabela de visitas.');
} catch (e) {
  // Ignora se a coluna já existir
  console.log('Coluna "page" já existe ou a tabela de visitas não precisa ser alterada.');
}

// 2. Criar tabelas para seções dinâmicas do Currículo Acadêmico
db.exec(`
  CREATE TABLE IF NOT EXISTS academic_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_pt TEXT NOT NULL,
    title_en TEXT NOT NULL,
    type TEXT NOT NULL,         -- 'text' ou 'list'
    position TEXT NOT NULL,     -- 'center' ou 'sidebar'
    sort_order INTEGER NOT NULL DEFAULT 0,
    content_pt TEXT,            -- Usado apenas se type for 'text'
    content_en TEXT,            -- Usado apenas se type for 'text'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS academic_section_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    title_pt TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_pt TEXT,
    subtitle_en TEXT,
    description_pt TEXT,
    description_en TEXT,
    tags TEXT,                  -- Tags separadas por vírgula
    link TEXT,
    period TEXT,                -- Ex: '2024 - Atual'
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(section_id) REFERENCES academic_sections(id) ON DELETE CASCADE
  );
`);

console.log('Tabelas academic_sections e academic_section_items criadas com sucesso.');

// 3. Inserir dados iniciais (Lattes do Mauricio)
db.transaction(() => {
  // Limpar dados anteriores se existirem
  db.exec('DELETE FROM academic_section_items');
  db.exec('DELETE FROM academic_sections');

  // --- SEÇÃO 1: SOBRE MIM (Centro - Tipo Texto) ---
  const secAboutId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order, content_pt, content_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Sobre Mim', 'About Me', 'text', 'center', 1,
    'Sou graduado em Ciência da Computação pela Universidade Federal do Ceará e membro do ARIDA - Advanced Research in Databases (Grupo de Pesquisa em Bancos de Dados) na UFC. Minha experiência está centrada na área de Ciência da Computação, com ênfase em Análise de Dados, Ciência de Dados e Banco de Dados. Atuo principalmente em tópicos relacionados à ciência de dados, análise de dados, segurança de dados e Inteligência Artificial (IA).',
    'I hold a B.Sc. in Computer Science from the Federal University of Ceará and am a member of ARIDA - Advanced Research in Databases research group at UFC. My experience is focused on Computer Science, with an emphasis on Data Analysis, Data Science, and Databases. I mainly work on topics related to data science, data analysis, data security, and Artificial Intelligence (AI).'
  ).lastInsertRowid;

  // --- SEÇÃO 2: FORMAÇÃO ACADÊMICA (Centro - Tipo Lista) ---
  const secEduId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Formação Acadêmica', 'Academic Education', 'list', 'center', 2).lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertItem.run(secEduId, 
    'Mestrado em Ciência da Computação', 'M.Sc. in Computer Science',
    'Universidade de São Paulo (USP)', 'University of São Paulo (USP)',
    'Pesquisa aprofundada em sistemas e inteligência.', 'In-depth research in systems and computer intelligence.',
    '2024 - Atual', 1
  );
  insertItem.run(secEduId, 
    'MBA em Data Science e Analytics', 'MBA in Data Science & Analytics',
    'Universidade de São Paulo (USP)', 'University of São Paulo (USP)',
    'Carga Horária: 425h. Foco técnico avançado em modelagem e engenharia.', 'Carga Horária: 425h. Technical focus on analytics modeling and engineering.',
    '2023 - Atual', 2
  );
  insertItem.run(secEduId, 
    'Especialização em Big Data (Ciência de Dados)', 'Specialization in Big Data (Data Science)',
    'Faculdade de Minas (FACUVALE)', 'Faculdade de Minas (FACUVALE)',
    'Carga Horária: 700h.', 'Carga Horária: 700h.',
    '2023 - 2024', 3
  );
  insertItem.run(secEduId, 
    'Graduação em Ciência da Computação', 'B.Sc. in Computer Science',
    'Universidade Federal do Ceará (UFC)', 'Federal University of Ceará (UFC)',
    'Membro do ARIDA (Advanced Research in Databases).', 'Member of ARIDA (Advanced Research in Databases).',
    '2018 - 2023', 4
  );

  // --- SEÇÃO 3: PROJETOS DE PESQUISA & EXTENSÃO (Centro - Tipo Lista) ---
  const secProjId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Projetos de Pesquisa & Extensão', 'Research & Extension Projects', 'list', 'center', 3).lastInsertRowid;

  const insertProjectItem = db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProjectItem.run(secProjId,
    'Farol Digital', 'Farol Digital',
    'José Maria da Silva Monteiro Filho', 'José Maria da Silva Monteiro Filho',
    'Projeto que visa combater a disseminação de desinformação em redes sociais, com foco especial em grupos públicos do WhatsApp. A ferramenta coleta dados para identificar e verificar automaticamente informações desinformadas.',
    'Project to combat misinformation on social networks, focusing on public WhatsApp groups. The tool automatically collects, validates and processes unstructured data.',
    'research, pesquisa, NLP', '2023 - Atual', 1
  );
  insertProjectItem.run(secProjId,
    'TI2EA - Adaptabilidade de Estudantes Africanos', 'TI2EA - African Students Adaptability',
    'José Maria da Silva Monteiro Filho', 'José Maria da Silva Monteiro Filho',
    'Utilização de recursos de TI para facilitar a adaptação e alavancar a capacitação de alunos africanos que estudam em instituições de ensino superior no Ceará, principalmente na UFC e na Unilab.',
    'Using IT tools to support adaptation and technical training of African exchange students in Ceará.',
    'extension, extensão, inclusion', '2018 - 2022', 2
  );
  insertProjectItem.run(secProjId,
    'Programa de Apoio ao Intercambista (PAI)', 'International Exchange Support Program',
    'Talita Felipe de Vasconcelos', 'Talita Felipe de Vasconcelos',
    'Apoio prático a estudantes estrangeiros em seus primeiros momentos em Fortaleza, promovendo intercâmbio cultural e acadêmico na UFC.',
    'Supporting international students upon arrival at UFC, promoting academic and cultural exchange.',
    'extension, extensão, culture', '2019 - 2021', 3
  );

  // --- SEÇÃO 4: PUBLICAÇÕES & PRODUÇÃO (Centro - Tipo Lista) ---
  const secPubId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Apresentações & Produção Científica', 'Presentations & Scientific Production', 'list', 'center', 4).lastInsertRowid;

  insertItem.run(secPubId,
    'Programa de apoio ao intercambista: Um relato de experiência', 'International Exchange Program: An Experience Report',
    'BIMBU, M. G.; Vasconcelos, T. F.', 'BIMBU, M. G.; Vasconcelos, T. F.',
    'Encontros Universitários da UFC', 'Encontros Universitários da UFC',
    '2021', 1
  );
  insertItem.run(secPubId,
    'Utilização da tecnologia da informação na adaptação e capacitação de estudantes africanos', 'Using IT for adaptation and training of African students',
    'BIMBU, M. G.; Alencar, C. S. S.; Cassul, M.; Monteiro Filho, J. M. S.', 'BIMBU, M. G.; Alencar, C. S. S.; Cassul, M.; Monteiro Filho, J. M. S.',
    'Encontros Universitários da UFC', 'Encontros Universitários da UFC',
    '2020', 2
  );

  // --- SEÇÃO 5: IDIOMAS (Lateral - Tipo Lista) ---
  const secLangId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Idiomas', 'Languages', 'list', 'sidebar', 1).lastInsertRowid;

  insertItem.run(secLangId, 'Português', 'Portuguese', 'Fluente / Nativo', 'Fluent / Native', '', '', '', 1);
  insertItem.run(secLangId, 'Lingála', 'Lingala', 'Fluente / Conversação', 'Fluent / Conversational', '', '', '', 2);
  insertItem.run(secLangId, 'Inglês', 'English', 'Intermediário', 'Intermediate', '', '', '', 3);
  insertItem.run(secLangId, 'Espanhol', 'Spanish', 'Básico', 'Basic', '', '', '', 4);

  // --- SEÇÃO 6: ORGANIZAÇÃO DE EVENTOS (Lateral - Tipo Lista) ---
  const secEvsId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Organização de Eventos', 'Event Organization', 'list', 'sidebar', 2).lastInsertRowid;

  insertItem.run(secEvsId, 
    'Continente Africano e Brasil: Conecta cultura, une povos', 'African Continent & Brazil: Connecting cultures, uniting peoples',
    'Organizador', 'Organizer', '', '', '2022', 1
  );
  insertItem.run(secEvsId, 
    'IV Semana Cultural Africana da UFC celebra a pluralidade da África por trás das câmeras', 'IV UFC African Cultural Week celebrating African diversity behind the cameras',
    'Organizador', 'Organizer', '', '', '2019', 2
  );

  // --- SEÇÃO 7: PARTICIPAÇÃO EM EVENTOS (Lateral - Tipo Lista) ---
  const secPartId = db.prepare(`
    INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run('Participações em Eventos', 'Event Participations', 'list', 'sidebar', 3).lastInsertRowid;

  insertItem.run(secPartId, 'Encontros universitários', 'Encontros universitários', 'Outra', 'Other', '', '', '2021', 1);
  insertItem.run(secPartId, 'Data Science Tech Summit', 'Data Science Tech Summit', 'Outra', 'Other', '', '', '2019', 2);
  insertItem.run(secPartId, 'XIV Semana Acadêmica da Computação', 'XIV Semana Acadêmica da Computação', 'Seminário', 'Seminar', '', '', '2019', 3);
  insertItem.run(secPartId, 'XXXIV Simpósio Brasileiro de Banco de Dados - SBBD', 'XXXIV Simpósio Brasileiro de Banco de Dados - SBBD', 'Simpósio', 'Symposium', '', '', '2019', 4);

})();

console.log('Migração e população do módulo Acadêmico concluídas!');
