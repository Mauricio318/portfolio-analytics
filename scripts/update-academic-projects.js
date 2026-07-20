const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'portfolio.db');
const db = new Database(dbPath);

console.log('Iniciando atualização de projetos acadêmicos...');

try {
  // 1. Atualizar itens existentes na Seção 3 (🔬 Projetos de Pesquisa & Extensão)
  
  // Farol Digital (id: 5)
  const farolDescPt = `Faço parte do projeto "Farol Digital", administrado pelo laboratório ARiDa (Advanced Research in Database). O objetivo principal deste projeto inovador é combater a disseminação de desinformação em redes sociais, com foco especial em grupos públicos do WhatsApp. A ferramenta coleta dados para identificar e verificar automaticamente informações desinformadas amplamente compartilhadas. Esses dados podem apoiar iniciativas do setor público na formulação de políticas eficazes de combate à desinformação.

• Situação: Em andamento | Natureza: Pesquisa
• Alunos envolvidos: Graduação: (6) / Doutorado: (2)
• Integrantes: Mauricio Garcia Bimbu - Integrante / José Maria da Silva monteiro Filho - Coordenador.`;

  const farolDescEn = `Part of the "Farol Digital" project, managed by the ARiDa (Advanced Research in Databases) laboratory. The main goal of this innovative project is to combat the spread of misinformation on social networks, with a special focus on public WhatsApp groups. The tool collects data to automatically identify and verify widely shared misinformation. This data can support public sector initiatives in formulating effective policies to combat misinformation.

• Status: In progress | Nature: Research
• Students involved: Undergraduate: (6) / PhD: (2)
• Members: Mauricio Garcia Bimbu - Member / José Maria da Silva monteiro Filho - Coordinator.`;

  db.prepare(`
    UPDATE academic_section_items
    SET title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?, tags = ?, period = ?
    WHERE id = 5
  `).run(
    'Farol Digital',
    'Farol Digital',
    'José Maria da Silva monteiro Filho (Coordenador)',
    'José Maria da Silva monteiro Filho (Coordinator)',
    farolDescPt,
    farolDescEn,
    'research, pesquisa, NLP, WhatsApp, ARiDa',
    '2023 - Atual'
  );
  console.log('✓ Projeto "Farol Digital" atualizado com sucesso.');

  // TI2EA (id: 6)
  const ti2eaDescPt = `O Projeto TI2EA, Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos, tem por objetivo principal utilizar os diferentes recursos proporcionados pela Tecnologia da Informação com a finalidade de facilitar a adaptação e alavancar a capacitação de alunos africanos que estudam em instituições de ensino superior no estado do Ceará, principalmente na UFC e na Unilab.

• Situação: Concluído | Natureza: Extensão
• Alunos envolvidos: Graduação: (4) / Mestrado acadêmico: (3) / Doutorado: (2)
• Integrantes: Mauricio Garcia Bimbu - Integrante / José Maria da Silva monteiro Filho - Coordenador / João Paulo do Vale Madeiro - Integrante / RICARDO JOÃO LIMA - Integrante / CARMOSINA SIBÉLIA SILVA ALENCAR - Integrante / Erica Spencer - Integrante.`;

  const ti2eaDescEn = `The main objective of the TI2EA Project (Information Technology for Adaptation and Training of African Students) is to use the different resources provided by Information Technology in order to facilitate the adaptation and leverage the training of African students studying in higher education institutions in the state of Ceará, mainly at UFC and Unilab.

• Status: Completed | Nature: Extension
• Students involved: Undergraduate: (4) / Academic Master: (3) / PhD: (2)
• Members: Mauricio Garcia Bimbu - Member / José Maria da Silva monteiro Filho - Coordinator / João Paulo do Vale Madeiro - Member / RICARDO JOÃO LIMA - Member / CARMOSINA SIBÉLIA SILVA ALENCAR - Member / Erica Spencer - Member.`;

  db.prepare(`
    UPDATE academic_section_items
    SET title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?, tags = ?, period = ?
    WHERE id = 6
  `).run(
    'Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos - TI2EA',
    'Information Technology for Adaptation and Training of African Students - TI2EA',
    'José Maria da Silva monteiro Filho (Coordenador)',
    'José Maria da Silva monteiro Filho (Coordinator)',
    ti2eaDescPt,
    ti2eaDescEn,
    'extension, extensão, inclusion, IT, capacitação',
    '2018 - 2022'
  );
  console.log('✓ Projeto "TI2EA" atualizado com sucesso.');

  // Programa de Apoio ao Intercambista (id: 7)
  const paiDescPt = `Incentivar a experiência de estudantes de mobilidade acadêmica internacional na UFC em seus primeiros momentos em Fortaleza, fornecendo suporte necessário, e promover intensas trocas de experiências entre os acadêmicos estrangeiros e os da UFC.

• Situação: Concluído | Natureza: Extensão
• Alunos envolvidos: Graduação: (8) / Mestrado acadêmico: (3) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Talita Felipe de Vasconcelos - Coordenador.`;

  const paiDescEn = `Encouraging the experience of international academic mobility students at UFC in their first moments in Fortaleza, providing the necessary support, and promoting intense exchanges of experiences between foreign academics and those from UFC.

• Status: Completed | Nature: Extension
• Students involved: Undergraduate: (8) / Academic Master: (3) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Talita Felipe de Vasconcelos - Coordinator.`;

  db.prepare(`
    UPDATE academic_section_items
    SET title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?, tags = ?, period = ?
    WHERE id = 7
  `).run(
    'Programa de Apoio ao Intercambista',
    'International Exchange Support Program',
    'Talita Felipe de Vasconcelos (Coordenador)',
    'Talita Felipe de Vasconcelos (Coordinator)',
    paiDescPt,
    paiDescEn,
    'extension, extensão, culture, international, intercâmbio',
    '2019 - 2021'
  );
  console.log('✓ Projeto "Programa de Apoio ao Intercambista" atualizado com sucesso.');


  // 2. Criar ou Atualizar Seção: 🏫 Projetos de Ensino
  let teachingSection = db.prepare("SELECT id FROM academic_sections WHERE title_pt LIKE '%Projetos de Ensino%'").get();
  let teachingSectionId;

  if (!teachingSection) {
    const res = db.prepare(`
      INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run('🏫 Projetos de Ensino', '🏫 Teaching Projects', 'list', 'center', 5);
    teachingSectionId = res.lastInsertRowid;
    console.log('✓ Seção "Projetos de Ensino" criada.');
  } else {
    teachingSectionId = teachingSection.id;
    console.log('✓ Seção "Projetos de Ensino" já existe.');
  }

  // Limpa itens antigos de Ensino para evitar duplicados caso rodado de novo
  db.prepare('DELETE FROM academic_section_items WHERE section_id = ?').run(teachingSectionId);

  // Inserir Hora do Código nas Escolas
  const horaCodigoDescPt = `A Hora do Código nas Escolas é um projeto de extensão que introduz conhecimentos de Computação de maneira criativa e lúdica para crianças da rede pública de ensino em Fortaleza, especialmente em áreas com baixo Índice de Desenvolvimento Humano (IDH). O projeto visa preencher uma lacuna na educação primária, estimulando o interesse das crianças pela tecnologia e criando uma ponte para futuros desenvolvimentos nessa área. Além disso, auxilia os alunos na exploração de novos métodos de aprendizado e na utilização de fontes inovadoras para adquirir conhecimento.

• Situação: Concluído | Natureza: Ensino
• Alunos envolvidos: Graduação: (8) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Milton Cassul Miranda - Integrante / Lincoln Souza Rocha - Coordenador / ANDREZA FERNANDES DE OLIVEIRA - Integrante.`;

  const horaCodigoDescEn = `The Hour of Code in Schools is an extension project that introduces Computer Science knowledge in a creative and playful way to children in the public school system in Fortaleza, especially in areas with low Human Development Index (HDI). The project aims to fill a gap in primary education, stimulating children's interest in technology and creating a bridge for future developments in this area. In addition, it helps students explore new methods of learning and use innovative sources to acquire knowledge.

• Status: Completed | Nature: Teaching
• Students involved: Undergraduate: (8) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Milton Cassul Miranda - Member / Lincoln Souza Rocha - Coordinator / ANDREZA FERNANDES DE OLIVEIRA - Member.`;

  db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    teachingSectionId,
    'Hora do Código nas Escolas',
    'Hour of Code in Schools',
    'Lincoln Souza Rocha (Coordenador)',
    'Lincoln Souza Rocha (Coordinator)',
    horaCodigoDescPt,
    horaCodigoDescEn,
    'teaching, ensino, coding, children, PET',
    '2018 - 2018',
    1
  );
  console.log('✓ Item "Hora do Código nas Escolas" inserido.');


  // 3. Criar ou Atualizar Seção: 📁 Outros Projetos
  let otherSection = db.prepare("SELECT id FROM academic_sections WHERE title_pt LIKE '%Outros Projetos%'").get();
  let otherSectionId;

  if (!otherSection) {
    const res = db.prepare(`
      INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run('📁 Outros Projetos', '📁 Other Projects', 'list', 'center', 6);
    otherSectionId = res.lastInsertRowid;
    console.log('✓ Seção "Outros Projetos" criada.');
  } else {
    otherSectionId = otherSection.id;
    console.log('✓ Seção "Outros Projetos" já existe.');
  }

  // Limpa itens antigos de Outros Projetos para evitar duplicados caso rodado de novo
  db.prepare('DELETE FROM academic_section_items WHERE section_id = ?').run(otherSectionId);

  // Inserir Grupo de Estudo em Linux e Software Livre
  const gelsolDescPt = `O GELSoL trata-se de um grupo do PET Computação UFC, surgido ainda em meados dos anos 2000, cuja missão consiste em difundir, incentivar e discutir os princípios do movimento de Software Livre dentro da Universidade Federal do Ceará, e em toda a comunidade de programadores. Unido a tal propósito, o Grupo realiza estudos sobre um dos maiores (na verdade, o maior) exemplares de um Software Livre bem-sucedido: o kernel GNU/Linux.

• Situação: Concluído | Natureza: Outra
• Alunos envolvidos: Graduação: (8) / Mestrado acadêmico: (2) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Milton Cassul Miranda - Integrante / Lincoln Souza Rocha - Coordenador / ANDREZA FERNANDES DE OLIVEIRA - Integrante.`;

  const gelsolDescEn = `GELSoL is a study group from PET Computação UFC, created in the mid-2000s, whose mission consists of spreading, encouraging, and discussing the principles of the Free Software movement within the Federal University of Ceará, and across the entire programming community. Aligned with this purpose, the Group carries out studies on one of the greatest (in fact, the greatest) examples of a successful Free Software: the GNU/Linux kernel.

• Status: Completed | Nature: Other
• Students involved: Undergraduate: (8) / Academic Master: (2) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Milton Cassul Miranda - Member / Lincoln Souza Rocha - Coordinator / ANDREZA FERNANDES DE OLIVEIRA - Member.`;

  db.prepare(`
    INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, period, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    otherSectionId,
    'Grupo de Estudo em Linux e Software Livre',
    'Study Group on Linux and Free Software',
    'Lincoln Souza Rocha (Coordenador)',
    'Lincoln Souza Rocha (Coordinator)',
    gelsolDescPt,
    gelsolDescEn,
    'linux, open-source, software-livre, study-group, PET',
    '2018 - 2018',
    1
  );
  console.log('✓ Item "Grupo de Estudo em Linux e Software Livre" inserido.');

  console.log('Atualização concluída com sucesso!');
} catch (error) {
  console.error('Erro ao atualizar banco de dados:', error);
}
