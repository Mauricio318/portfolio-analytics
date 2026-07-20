const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'portfolio.db');
const db = new Database(dbPath);

console.log('Iniciando atualização de apresentações e eventos...');

try {
  // ==========================================
  // 1. APRESENTAÇÕES DE TRABALHO (Section ID: 4)
  // ==========================================
  const sec4Id = 4;
  db.prepare('DELETE FROM academic_section_items WHERE section_id = ?').run(sec4Id);

  const presentations = [
    {
      title_pt: 'Programa de apoio ao intercambista: Um relato de experiência',
      title_en: 'International Exchange Program: An Experience Report',
      subtitle_pt: 'BIMBU, M. G.; Vasconcelos, T. F.',
      subtitle_en: 'BIMBU, M. G.; Vasconcelos, T. F.',
      description_pt: 'Apresentação de Trabalho / Comunicação Científica (Outra)',
      description_en: 'Oral Presentation / Scientific Communication (Other)',
      period: '2021',
      sort_order: 1
    },
    {
      title_pt: 'Utilização da tecnologia da informação na adaptação e capacitação de estudantes africanos',
      title_en: 'Using information technology for adaptation and training of African students',
      subtitle_pt: 'BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Monteiro Filho, J. M. S.',
      subtitle_en: 'BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Monteiro Filho, J. M. S.',
      description_pt: 'Apresentação de Trabalho / Comunicação Científica (Outra)',
      description_en: 'Oral Presentation / Scientific Communication (Other)',
      period: '2020',
      sort_order: 2
    },
    {
      title_pt: 'TI2EA - Dando voz aos estudantes africanos',
      title_en: 'TI2EA - Giving voice to African students',
      subtitle_pt: 'BIMBU, M. G.; SPENCER, E.',
      subtitle_en: 'BIMBU, M. G.; SPENCER, E.',
      description_pt: 'Apresentação de Trabalho / Comunicação Científica (Outra)',
      description_en: 'Oral Presentation / Scientific Communication (Other)',
      period: '2019',
      sort_order: 3
    },
    {
      title_pt: 'Utilização da tecnologia da informação na adaptação e capacitação de estudantes africanos',
      title_en: 'Using information technology for adaptation and training of African students',
      subtitle_pt: 'BIMBU, M. G.; Miranda, M. C.; Monteiro Filho, J. M. S.; LIMA, R. J.; Madeiro, J. P. V.; ALENCAR, C. S. S.',
      subtitle_en: 'BIMBU, M. G.; Miranda, M. C.; Monteiro Filho, J. M. S.; LIMA, R. J.; Madeiro, J. P. V.; ALENCAR, C. S. S.',
      description_pt: 'Apresentação de Trabalho / Comunicação Científica (Outra)',
      description_en: 'Oral Presentation / Scientific Communication (Other)',
      period: '2018',
      sort_order: 4
    }
  ];

  const stmtPres = db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const pres of presentations) {
    stmtPres.run(sec4Id, pres.title_pt, pres.title_en, pres.subtitle_pt, pres.subtitle_en, pres.description_pt, pres.description_en, pres.period, pres.sort_order);
  }
  console.log('✓ Apresentações de Trabalho atualizadas.');

  // ==========================================
  // 2. PARTICIPAÇÃO EM EVENTOS (Section ID: 7)
  // ==========================================
  const sec7Id = 7;
  db.prepare('DELETE FROM academic_section_items WHERE section_id = ?').run(sec7Id);

  const eventsParticipation = [
    {
      title_pt: 'Encontros Universitários da UFC',
      title_en: 'UFC Academic Meetings',
      subtitle_pt: 'Participação / Outra',
      subtitle_en: 'Participation / Other',
      description_pt: 'Apresentação de trabalho e painéis científicos.',
      description_en: 'Presentation of research works and scientific panels.',
      period: '2021',
      sort_order: 1
    },
    {
      title_pt: 'Data Science Tech Summit',
      title_en: 'Data Science Tech Summit',
      subtitle_pt: 'Participação / Outra',
      subtitle_en: 'Participation / Other',
      description_pt: 'Summit técnico focado em Data Science, inteligência artificial e big data.',
      description_en: 'Technical summit focused on Data Science, artificial intelligence, and big data.',
      period: '2019',
      sort_order: 2
    },
    {
      title_pt: 'XIV Semana Acadêmica da Computação',
      title_en: 'XIV Computer Science Academic Week',
      subtitle_pt: 'Seminário',
      subtitle_en: 'Seminar',
      description_pt: 'Ciclo de palestras e minicursos em Computação e Engenharia.',
      description_en: 'Lecture series and short courses in Computer Science and Engineering.',
      period: '2019',
      sort_order: 3
    },
    {
      title_pt: 'XXXIV Simpósio Brasileiro de Banco de Dados - SBBD',
      title_en: 'XXXIV Brazilian Symposium on Databases - SBBD',
      subtitle_pt: 'Simpósio',
      subtitle_en: 'Symposium',
      description_pt: 'O maior simpósio científico da América Latina na área de bancos de dados.',
      description_en: 'The largest Latin American scientific symposium on databases.',
      period: '2019',
      sort_order: 4
    },
    {
      title_pt: 'Desenvolvimento e implantação de soluções de negócios baseados em T.I e Análise de dados.',
      title_en: 'Development and implementation of business solutions based on IT and Data Analysis.',
      subtitle_pt: 'Oficina',
      subtitle_en: 'Workshop',
      description_pt: 'Capacitação prática em inteligência de negócios e BI.',
      description_en: 'Practical training in business intelligence and BI.',
      period: '2018',
      sort_order: 5
    },
    {
      title_pt: 'SBPC - Sociedade Brasileira para o Progresso da Ciência',
      title_en: 'SBPC - Brazilian Society for the Progress of Science',
      subtitle_pt: 'Congresso',
      subtitle_en: 'Congress',
      description_pt: 'Reunião anual científica nacional abrangente.',
      description_en: 'Comprehensive annual national scientific meeting.',
      period: '2018',
      sort_order: 6
    },
    {
      title_pt: 'Semana Cultural Africana da UFC',
      title_en: 'UFC African Cultural Week',
      subtitle_pt: 'Seminário',
      subtitle_en: 'Seminar',
      description_pt: 'Ciclo de debates culturais, história e literatura africana.',
      description_en: 'Debates on cultural history and African literature.',
      period: '2018',
      sort_order: 7
    },
    {
      title_pt: 'Tecnologias africanas na constituição da sociedade brasileira',
      title_en: 'African technologies in the constitution of Brazilian society',
      subtitle_pt: 'Participação / Outra',
      subtitle_en: 'Participation / Other',
      description_pt: 'Palestra técnica e debates.',
      description_en: 'Technical lecture and debates.',
      period: '2018',
      sort_order: 8
    },
    {
      title_pt: 'XIII Semana Acadêmica da Computação',
      title_en: 'XIII Computer Science Academic Week',
      subtitle_pt: 'Seminário',
      subtitle_en: 'Seminar',
      description_pt: 'Eventos acadêmicos em tecnologia da informação e sistemas.',
      description_en: 'Academic events in information technology and systems.',
      period: '2018',
      sort_order: 9
    },
    {
      title_pt: 'XXVII Encontro de Extensão: Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos',
      title_en: 'XXVII Extension Meeting: Using IT for Adaptation and Training of African Students',
      subtitle_pt: 'Encontro',
      subtitle_en: 'Meeting',
      description_pt: 'Relatos de extensão e projetos de inclusão digital.',
      description_en: 'Extension reports and digital inclusion projects.',
      period: '2018',
      sort_order: 10
    }
  ];

  const stmtEventPart = db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ev of eventsParticipation) {
    stmtEventPart.run(sec7Id, ev.title_pt, ev.title_en, ev.subtitle_pt, ev.subtitle_en, ev.description_pt, ev.description_en, ev.period, ev.sort_order);
  }
  console.log('✓ Participações em Eventos atualizadas.');

  // ==========================================
  // 3. ORGANIZAÇÃO DE EVENTOS (Section ID: 6)
  // ==========================================
  const sec6Id = 6;
  db.prepare('DELETE FROM academic_section_items WHERE section_id = ?').run(sec6Id);

  const eventsOrg = [
    {
      title_pt: 'Continente Africano e Brasil: Conecta cultura, une povos',
      title_en: 'African Continent and Brazil: Connecting cultures, uniting peoples',
      subtitle_pt: 'BIMBU, M. G. (Organizador)',
      subtitle_en: 'BIMBU, M. G. (Organizer)',
      description_pt: 'Organização geral do evento de intercâmbio cultural.',
      description_en: 'General organization of the cultural exchange event.',
      period: '2022',
      sort_order: 1
    },
    {
      title_pt: 'IV Semana Cultural Africana da UFC celebra a pluralidade da África por trás das câmeras',
      title_en: 'IV UFC African Cultural Week celebrating African diversity behind the cameras',
      subtitle_pt: 'BIMBU, M. G.; Miranda, M. C.; ALENCAR, C. S. S.; Monteiro Filho, J. M. S.; Madeiro, J. P. V.; SPENCER, E. (Organizadores)',
      subtitle_en: 'BIMBU, M. G.; Miranda, M. C.; ALENCAR, C. S. S.; Monteiro Filho, J. M. S.; Madeiro, J. P. V.; SPENCER, E. (Organizers)',
      description_pt: 'Comissão organizadora da Semana Cultural Africana da UFC.',
      description_en: 'Organizing committee of the UFC African Cultural Week.',
      period: '2019',
      sort_order: 2
    },
    {
      title_pt: 'Ifá: um sistema filosófico africano com representação em álgebra binária de 2000 anos atrás',
      title_en: 'Ifá: an African philosophical system represented in binary algebra 2000 years ago',
      subtitle_pt: 'CUNHA JUNIOR, H.; BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Madeiro, J. P. V.; Monteiro Filho, J. M. S. (Organizadores)',
      subtitle_en: 'CUNHA JUNIOR, H.; BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Madeiro, J. P. V.; Monteiro Filho, J. M. S. (Organizers)',
      description_pt: 'Oficina técnica de representação matemática e histórica.',
      description_en: 'Technical workshop on mathematical and historical representation.',
      period: '2018',
      sort_order: 3
    },
    {
      title_pt: 'Curso de Cultura e Língua "Crioula"',
      title_en: 'Creole Language and Culture Course',
      subtitle_pt: 'QUADE, W. J.; BIMBU, M. G.; ALENCAR, C. S. S.; LIMA, R. J.; Miranda, M. C. (Organizadores)',
      subtitle_en: 'QUADE, W. J.; BIMBU, M. G.; ALENCAR, C. S. S.; LIMA, R. J.; Miranda, M. C. (Organizers)',
      description_pt: 'Organização de curso de extensão de idioma e cultura guineense.',
      description_en: 'Organization of extension course in Guinean language and culture.',
      period: '2018',
      sort_order: 4
    }
  ];

  const stmtEventOrg = db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ev of eventsOrg) {
    stmtEventOrg.run(sec6Id, ev.title_pt, ev.title_en, ev.subtitle_pt, ev.subtitle_en, ev.description_pt, ev.description_en, ev.period, ev.sort_order);
  }
  console.log('✓ Organização de Eventos atualizada.');

  console.log('Todas as atualizações concluídas com sucesso!');
} catch (error) {
  console.error('Erro ao atualizar banco de dados:', error);
}
