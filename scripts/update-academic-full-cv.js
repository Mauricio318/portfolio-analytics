const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'portfolio.db');
const db = new Database(dbPath);

console.log('Iniciando carga completa do currículo Lattes no banco de dados...');

try {
  db.transaction(() => {
    // ==========================================
    // 1. LIMPAR DADOS ACADÊMICOS ANTIGOS
    // ==========================================
    db.prepare('DELETE FROM academic_section_items').run();
    db.prepare('DELETE FROM academic_sections').run();

    // ==========================================
    // 2. CRIAR SEÇÕES DO CURRÍCULO
    // ==========================================
    
    // Seções Centrais
    const insertSection = db.prepare(`
      INSERT INTO academic_sections (id, title_pt, title_en, type, position, sort_order, content_pt, content_en, show_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sobreMimPt = `Sou graduado em Ciência da Computação pela Universidade Federal do Ceará e membro do ARIDA - Advanced Research in Databases (Grupo de Pesquisa em Bancos de Dados) na UFC. Minha experiência está centrada na área de Ciência da Computação, com ênfase em Análise de Dados, Ciência de Dados e Banco de Dados. Atuo principalmente em tópicos relacionados à ciência de dados, análise de dados, segurança de dados e Inteligência Artificial (IA).`;

    const sobreMimEn = `I hold a B.Sc. in Computer Science from the Federal University of Ceará and am a member of ARIDA - Advanced Research in Databases research group at UFC. My experience is focused on Computer Science, with an emphasis on Data Analysis, Data Science, and Databases. I mainly work on topics related to data science, data analysis, data security, and Artificial Intelligence (AI).`;

    insertSection.run(1, '✨ Sobre Mim', '✨ About Me', 'text', 'center', 1, sobreMimPt, sobreMimEn, 3);
    insertSection.run(2, '🎓 Formação Acadêmica', '🎓 Academic Background', 'list', 'center', 2, null, null, 3);
    insertSection.run(3, '💼 Atuação Profissional', '💼 Professional Experience', 'list', 'center', 3, null, null, 3);
    insertSection.run(4, '🔬 Projetos de Pesquisa & Extensão', '🔬 Research & Extension Projects', 'list', 'center', 4, null, null, 3);
    insertSection.run(5, '🏫 Projetos de Ensino', '🏫 Teaching Projects', 'list', 'center', 5, null, null, 3);
    insertSection.run(6, '📚 Apresentações & Produção Científica', '📚 Presentations & Scientific Production', 'list', 'center', 6, null, null, 3);
    insertSection.run(7, '📅 Organização de Eventos', '📅 Event Organization', 'list', 'center', 7, null, null, 3);
    insertSection.run(8, '🎫 Participações em Eventos', '🎫 Event Participations', 'list', 'center', 8, null, null, 3);
    insertSection.run(9, '📁 Outros Projetos', '📁 Other Projects', 'list', 'center', 9, null, null, 3);

    // Seções Laterais
    insertSection.run(10, '🌍 Idiomas', '🌍 Languages', 'list', 'sidebar', 1, null, null, 3);
    insertSection.run(11, '📜 Cursos & Formação Complementar', '📜 Complementary Courses', 'list', 'sidebar', 2, null, null, 3);

    console.log('✓ Seções acadêmicas recriadas.');

    // Prepare insert statement for items
    const insertItem = db.prepare(`
      INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, period, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // ==========================================
    // 3. ITENS: Formação Acadêmica (Section 2)
    insertItem.run(2,
      'Mestrado em Ciência da Computação',
      'M.Sc. in Computer Science',
      'Universidade de São Paulo (USP - IME)',
      'University of São Paulo (USP - IME)',
      'Mestrado acadêmico em andamento na USP (IME).',
      'Academic Master\'s Degree in progress at USP (IME).',
      'mestrado, computer-science, usp, ime', '2024 - Atual', 1
    );

    insertItem.run(2, 
      'MBA em Data Science e Analytics', 
      'MBA in Data Science and Analytics', 
      'Universidade de São Paulo (USP)', 
      'University of São Paulo (USP)', 
      'Carga Horária: 425h. Especialização Lato Sensu em andamento.', 
      'Carga Horária: 425h. Ongoing Specialization.', 
      'ds, analytics, USP', '2023 - Atual', 2
    );

    insertItem.run(2, 
      'Especialização em Big Data (Ciência de Dados)', 
      'Specialization in Big Data (Data Science)', 
      'Faculdade Iguaçu', 
      'Faculdade Iguaçu', 
      'Carga Horária: 720h. Especialização concluída.', 
      'Carga Horária: 720h. Completed Specialization.', 
      'bigdata, science, iguaçu', '2023 - 2023', 3
    );

    insertItem.run(2, 
      'Graduação em Ciência da Computação', 
      'B.Sc. in Computer Science', 
      'Universidade Federal do Ceará (UFC)', 
      'Federal University of Ceará (UFC)', 
      'Bacharelado em Ciência da Computação.', 
      'Bachelor Degree in Computer Science.', 
      'graduação, computer-science, ufc', '2018 - 2023', 4
    );

    // ==========================================
    // 4. ITENS: Atuação Profissional (Section 3)
    // ==========================================
    insertItem.run(3, 
      'Professor Especializado - Aplicativos e Inteligência Artificial', 
      'Specialized Teacher - Applications and Artificial Intelligence', 
      'Senac Lapa Tito', 
      'Senac Lapa Tito', 
      'Atuo como professor especializado na área de Aplicativos e Inteligência Artificial, lecionando em cursos livres de Excel do nível básico ao avançado e também em treinamentos voltados para Power BI e conceitos fundamentais de Inteligência Artificial.', 
      'Teach Excel (basic to advanced), Power BI, and foundational concepts of Artificial Intelligence.', 
      'professor, excel, powerbi, ai, senac', '2025 - Atual', 1
    );

    insertItem.run(3, 
      'Analista de Dados Pleno / Engenheiro de Dados', 
      'Data Analyst / Data Engineer', 
      'Safe Consig', 
      'Safe Consig', 
      'Responsável pelo processamento de arquivos via ETL, com ênfase na automação utilizando Python e Pentaho e na visualização de dados com o Power BI. Criação de novos bancos de dados para novos convênios e acompanhamento do processo até a geração da DNS. Manipulação e inserção de dados em Banco de Dados MySQL, incluindo validação, consultas SQL e manutenção, assegurando o fluxo mensal de processamentos conforme calendário estabelecido.', 
      'Responsible for ETL file processing, automation with Python and Pentaho, and data visualization using Power BI. Managed MySQL database maintenance and SQL querying.', 
      'etl, pentaho, python, mysql, powerbi', '2023 - 2025', 2
    );

    insertItem.run(3, 
      'Analista de Dados (People Analytics)', 
      'Data Analyst (People Analytics)', 
      'Instituto Atlântico', 
      'Atlântico Institute', 
      'Responsável por coletar, analisar e interpretar dados dos colaboradores da empresa, visando identificar padrões, tendências e correlações. Utilizando técnicas estatísticas e ferramentas de análise de dados para obter insights relevantes sobre desempenho, rotatividade, satisfação no trabalho, entre outros aspectos relacionados à gestão de pessoas. Apoia a tomada de decisões estratégicas por meio da comunicação clara e visualização de dados.', 
      'Collected and analyzed employee data using statistical techniques for People Analytics dashboards.', 
      'people-analytics, statistics, metrics', '2022 - 2023', 3
    );

    insertItem.run(3, 
      'Analista de Dados', 
      'Data Analyst', 
      'Banco do Nordeste do Brasil (BNB)', 
      'Northeast Bank of Brazil (BNB)', 
      'Atuei na central de cartões, empréstimos e fundos de investimento: Desenvolvimento de dashboards utilizando Power BI e Reporting Services (SSRS). Automação de rotinas em VBA e Python. Elaboração de consultas SQL complexas. Controle de operações e alimentação de dados em sistemas. Monitoramento de campanhas de recuperação de crédito.', 
      'Developed dashboards using Power BI and Reporting Services (SSRS). Automated routines with VBA and Python. Maintained SQL queries for cards and credit recovery campaigns.', 
      'finance, banking, powerbi, vba, python, sql', '2021 - 2022', 4
    );

    insertItem.run(3, 
      'Pesquisador e Desenvolvedor Acadêmico', 
      'Academic Researcher & Developer', 
      'Universidade Federal do Ceará (UFC)', 
      'Federal University of Ceará (UFC)', 
      'Membro ativo de projetos de extensão tecnológica e de inclusão digital como o TI2EA e o Programa de Apoio ao Intercambista.', 
      'Active member in technical extension and inclusion projects such as TI2EA and the International Exchange Program.', 
      'researcher, extension, ufc', '2019 - 2021', 5
    );

    // ==========================================
    // 5. ITENS: Projetos de Pesquisa & Extensão (Section 4)
    // ==========================================
    const sentimentDescPt = `O projeto busca criar um ambiente de compreensão de linguagem natural (CNL), baseado em Microsoft Azure, para extrair sentimentos de usuários, construindo assim uma interface amigável que busca solucionar problemas simples cotidianos desses usuários, em uma interface pergunta-resposta.

• Situação: Concluído | Natureza: Pesquisa
• Alunos envolvidos: Graduação: (3) / Mestrado acadêmico: (2) / Doutorado: (2)
• Integrantes: Mauricio Garcia Bimbu (Coordenador) / Sergio Ricardo Master Penedo (Integrante).`;

    const sentimentDescEn = `The project aims to create a natural language understanding (NLU) environment based on Microsoft Azure to extract user sentiments, building a user-friendly Q&A interface for solving everyday problems.

• Status: Completed | Nature: Research
• Students involved: Undergraduate: (3) / Academic Master: (2) / PhD: (2)
• Members: Mauricio Garcia Bimbu (Coordinator) / Sergio Ricardo Master Penedo (Member).`;

    insertItem.run(4, 
      'Construção de Plataformas de IA Assistida para Extração de Sentimentos',
      'Building Assisted AI Platforms for Sentiment Extraction',
      'Universidade Federal do Ceará (UFC)',
      'Federal University of Ceará (UFC)',
      sentimentDescPt, sentimentDescEn,
      'ai, azure, nlp, sentiment-analysis', '2023 - 2023', 1
    );

    const farolDescPt = `Faço parte do projeto "Farol Digital", administrado pelo laboratório ARiDa (Advanced Research in Database). O objetivo principal deste projeto inovador é combater a disseminação de desinformação em redes sociais, com foco especial em grupos públicos do WhatsApp. A ferramenta coleta dados para identificar e verificar automaticamente informações desinformadas amplamente compartilhadas. Esses dados podem apoiar iniciativas do setor público na formulação de políticas eficazes de combate à desinformação.

• Situação: Em andamento | Natureza: Pesquisa
• Alunos envolvidos: Graduação: (6) / Doutorado: (2)
• Integrantes: Mauricio Garcia Bimbu - Integrante / José Maria da Silva monteiro Filho - Coordenador.`;

    const farolDescEn = `Part of the "Farol Digital" project, managed by the ARiDa laboratory. The main goal of this project is to combat the spread of misinformation on social networks, focusing on public WhatsApp groups. The tool automatically collects, validates, and processes unstructured data.

• Status: In progress | Nature: Research
• Students involved: Undergraduate: (6) / PhD: (2)
• Members: Mauricio Garcia Bimbu - Member / José Maria da Silva monteiro Filho - Coordinator.`;

    insertItem.run(4,
      'Farol Digital',
      'Farol Digital',
      'ARiDa Lab (UFC)',
      'ARiDa Lab (UFC)',
      farolDescPt, farolDescEn,
      'research, NLP, data-science, WhatsApp', '2023 - Atual', 2
    );

    const paiDescPt = `Incentivar a experiência de estudantes de mobilidade acadêmica internacional na UFC em seus primeiros momentos em Fortaleza, fornecendo suporte necessário, e promover intensas trocas de experiências entre os acadêmicos estrangeiros e os da UFC.

• Situação: Concluído | Natureza: Extensão
• Alunos envolvidos: Graduação: (8) / Mestrado acadêmico: (3) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Talita Felipe de Vasconcelos - Coordenador.`;

    const paiDescEn = `Supporting international students upon arrival at UFC, promoting academic and cultural exchange.

• Status: Completed | Nature: Extension
• Students involved: Undergraduate: (8) / Academic Master: (3) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Talita Felipe de Vasconcelos - Coordinator.`;

    insertItem.run(4,
      'Programa de apoio ao intercambista',
      'International Exchange Support Program',
      'UFC Coordenadoria de Relações Internacionais',
      'UFC International Relations Office',
      paiDescPt, paiDescEn,
      'extension, culture, inclusion', '2019 - 2021', 3
    );

    const ti2eaDescPt = `O Projeto TI2EA, Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos, tem por objetivo principal utilizar os diferentes recursos proporcionados pela Tecnologia da Informação com a finalidade de facilitar a adaptação e alavancar a capacitação de alunos africanos que estudam em instituições de ensino superior no estado do Ceará, principalmente na UFC e na Unilab.

• Situação: Concluído | Natureza: Extensão
• Alunos envolvidos: Graduação: (4) / Mestrado acadêmico: (3) / Doutorado: (2)
• Integrantes: Mauricio Garcia Bimbu - Integrante / José Maria da Silva monteiro Filho - Coordenador / João Paulo do Vale Madeiro - Integrante / RICARDO JOÃO LIMA - Integrante / CARMOSINA SIBÉLIA SILVA ALENCAR - Integrante / Erica Spencer - Integrante.`;

    const ti2eaDescEn = `Using IT tools to support adaptation and technical training of African exchange students in Ceará.

• Status: Completed | Nature: Extension
• Students involved: Undergraduate: (4) / Academic Master: (3) / PhD: (2)
• Members: Mauricio Garcia Bimbu - Member / José Maria da Silva monteiro Filho - Coordinator / João Paulo do Vale Madeiro - Member / RICARDO JOÃO LIMA - Member / CARMOSINA SIBÉLIA SILVA ALENCAR - Member / Erica Spencer - Member.`;

    insertItem.run(4,
      'Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos - TI2EA',
      'Information Technology for Adaptation and Training of African Students - TI2EA',
      'UFC / Unilab',
      'UFC / Unilab',
      ti2eaDescPt, ti2eaDescEn,
      'extension, inclusion, capacity-building', '2018 - 2022', 4
    );

    // ==========================================
    // 6. ITENS: Projetos de Ensino (Section 5)
    // ==========================================
    const horaCodigoDescPt = `A Hora do Código nas Escolas é um projeto de extensão administrado pelo PET Computação da Universidade Federal do Ceará que introduz conhecimentos de Computação de maneira criativa e lúdica para crianças da rede pública de ensino em Fortaleza, especialmente em áreas com baixo Índice de Desenvolvimento Humano (IDH). O projeto visa preencher uma lacuna na educação primária, estimulando o interesse das crianças pela tecnologia e criando uma ponte para futuros desenvolvimentos nessa área. Além disso, auxilia os alunos na exploração de novos métodos de aprendizado e na utilização de fontes inovadoras para adquirir conhecimento.

• Situação: Concluído | Natureza: Ensino
• Alunos envolvidos: Graduação: (8) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Milton Cassul Miranda - Integrante / Lincoln Souza Rocha - Coordenador / ANDREZA FERNANDES DE OLIVEIRA - Integrante.`;

    const horaCodigoDescEn = `The Hour of Code in Schools is an extension project that introduces Computer Science knowledge in a creative and playful way to children in the public school system in Fortaleza, especially in areas with low Human Development Index (HDI).

• Status: Completed | Nature: Teaching
• Students involved: Undergraduate: (8) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Milton Cassul Miranda - Member / Lincoln Souza Rocha - Coordinator / ANDREZA FERNANDES DE OLIVEIRA - Member.`;

    insertItem.run(5,
      'Hora do Código nas Escolas',
      'Hour of Code in Schools',
      'PET Computação UFC',
      'PET Computação UFC',
      horaCodigoDescPt, horaCodigoDescEn,
      'teaching, coding, children', '2018 - 2018', 1
    );

    // ==========================================
    // 7. ITENS: Apresentações & Produção Científica (Section 6)
    // ==========================================
    insertItem.run(6,
      'Programa de apoio ao intercambista: Um relato de experiência',
      'International Exchange Program: An Experience Report',
      'BIMBU, M. G.; Vasconcelos, T. F.',
      'BIMBU, M. G.; Vasconcelos, T. F.',
      'Apresentação de Trabalho / Comunicação Científica (Outra)',
      'Oral Presentation / Scientific Communication (Other)',
      'presentation, culture', '2021', 1
    );

    insertItem.run(6,
      'Utilização da tecnologia da informação na adaptação e capacitação de estudantes africanos',
      'Using information technology for adaptation and training of African students',
      'BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Monteiro Filho, J. M. S.',
      'BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Monteiro Filho, J. M. S.',
      'Apresentação de Trabalho / Comunicação Científica (Outra)',
      'Oral Presentation / Scientific Communication (Other)',
      'presentation, inclusion', '2020', 2
    );

    insertItem.run(6,
      'TI2EA - Dando voz aos estudantes africanos',
      'TI2EA - Giving voice to African students',
      'BIMBU, M. G.; SPENCER, E.',
      'BIMBU, M. G.; SPENCER, E.',
      'Apresentação de Trabalho / Comunicação Científica (Outra)',
      'Oral Presentation / Scientific Communication (Other)',
      'presentation, exchange', '2019', 3
    );

    insertItem.run(6,
      'Utilização da tecnologia da informação na adaptação e capacitação de estudantes africanos',
      'Using information technology for adaptation and training of African students',
      'BIMBU, M. G.; Miranda, M. C.; Monteiro Filho, J. M. S.; LIMA, R. J.; Madeiro, J. P. V.; ALENCAR, C. S. S.',
      'BIMBU, M. G.; Miranda, M. C.; Monteiro Filho, J. M. S.; LIMA, R. J.; Madeiro, J. P. V.; ALENCAR, C. S. S.',
      'Apresentação de Trabalho / Comunicação Científica (Outra)',
      'Oral Presentation / Scientific Communication (Other)',
      'presentation, tech', '2018', 4
    );

    // ==========================================
    // 8. ITENS: Organização de Eventos (Section 7)
    // ==========================================
    insertItem.run(7,
      'Continente Africano e Brasil: Conecta cultura, une povos',
      'African Continent and Brazil: Connecting cultures, uniting peoples',
      'BIMBU, M. G. (Organizador)',
      'BIMBU, M. G. (Organizer)',
      'Organização geral do evento de intercâmbio cultural.',
      'General organization of the cultural exchange event.',
      'event, culture', '2022', 1
    );

    insertItem.run(7,
      'IV Semana Cultural Africana da UFC celebra a pluralidade da África por trás das câmeras',
      'IV UFC African Cultural Week celebrating African diversity behind the cameras',
      'BIMBU, M. G.; Miranda, M. C.; ALENCAR, C. S. S.; Monteiro Filho, J. M. S.; Madeiro, J. P. V.; SPENCER, E. (Organizadores)',
      'BIMBU, M. G.; Miranda, M. C.; ALENCAR, C. S. S.; Monteiro Filho, J. M. S.; Madeiro, J. P. V.; SPENCER, E. (Organizers)',
      'Comissão organizadora da Semana Cultural Africana da UFC.',
      'Organizing committee of the UFC African Cultural Week.',
      'event, ufc, africa', '2019', 2
    );

    insertItem.run(7,
      'Ifá: um sistema filosófico africano com representação em álgebra binária de 2000 anos atrás',
      'Ifá: an African philosophical system represented in binary algebra 2000 years ago',
      'CUNHA JUNIOR, H.; BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Madeiro, J. P. V.; Monteiro Filho, J. M. S. (Organizadores)',
      'CUNHA JUNIOR, H.; BIMBU, M. G.; ALENCAR, C. S. S.; Miranda, M. C.; Madeiro, J. P. V.; Monteiro Filho, J. M. S. (Organizers)',
      'Oficina técnica de representação matemática e histórica.',
      'Technical workshop on mathematical and historical representation.',
      'event, history, math', '2018', 3
    );

    insertItem.run(7,
      'Curso de Cultura e Língua "Crioula"',
      'Creole Language and Culture Course',
      'QUADE, W. J.; BIMBU, M. G.; ALENCAR, C. S. S.; LIMA, R. J.; Miranda, M. C. (Organizadores)',
      'QUADE, W. J.; BIMBU, M. G.; ALENCAR, C. S. S.; LIMA, R. J.; Miranda, M. C. (Organizers)',
      'Organização de curso de extensão de idioma e cultura guineense.',
      'Organization of extension course in Guinean language and culture.',
      'event, language', '2018', 4
    );

    // ==========================================
    // 9. ITENS: Participações em Eventos (Section 8)
    // ==========================================
    insertItem.run(8,
      'Encontros Universitários da UFC',
      'UFC Academic Meetings',
      'Participação / Outra',
      'Participation / Other',
      'Apresentação de trabalho e painéis científicos.',
      'Presentation of research works and scientific panels.',
      'event, ufc', '2021', 1
    );

    insertItem.run(8,
      'Data Science Tech Summit',
      'Data Science Tech Summit',
      'Participação / Outra',
      'Participation / Other',
      'Summit técnico focado em Data Science, inteligência artificial e big data.',
      'Technical summit focused on Data Science, artificial intelligence, and big data.',
      'event, datascience', '2019', 2
    );

    insertItem.run(8,
      'XIV Semana Acadêmica da Computação',
      'XIV Computer Science Academic Week',
      'Seminário',
      'Seminar',
      'Ciclo de palestras e minicursos em Computação e Engenharia.',
      'Lecture series and short courses in Computer Science and Engineering.',
      'event, computer-science', '2019', 3
    );

    insertItem.run(8,
      'XXXIV Simpósio Brasileiro de Banco de Dados - SBBD',
      'XXXIV Brazilian Symposium on Databases - SBBD',
      'Simpósio',
      'Symposium',
      'O maior simpósio científico da América Latina na área de bancos de dados.',
      'The largest Latin American scientific symposium on databases.',
      'event, database, sbbd', '2019', 4
    );

    insertItem.run(8,
      'Desenvolvimento e implantação de soluções de negócios baseados em T.I e Análise de dados.',
      'Development and implementation of business solutions based on IT and Data Analysis.',
      'Oficina',
      'Workshop',
      'Capacitação prática em inteligência de negócios e BI.',
      'Practical training in business intelligence and BI.',
      'event, bi', '2018', 5
    );

    insertItem.run(8,
      'SBPC - Sociedade Brasileira para o Progresso da Ciência',
      'SBPC - Brazilian Society for the Progress of Science',
      'Congresso',
      'Congress',
      'Reunião anual científica nacional abrangente.',
      'Comprehensive annual national scientific meeting.',
      'event, sbpc', '2018', 6
    );

    insertItem.run(8,
      'Semana Cultural Africana da UFC',
      'UFC African Cultural Week',
      'Seminário',
      'Seminar',
      'Ciclo de debates culturais, história e literatura africana.',
      'Debates on cultural history and African literature.',
      'event, culture', '2018', 7
    );

    insertItem.run(8,
      'Tecnologias africanas na constituição da sociedade brasileira',
      'African technologies in the constitution of Brazilian society',
      'Participação / Outra',
      'Participation / Other',
      'Palestra técnica e debates.',
      'Technical lecture and debates.',
      'event, history', '2018', 8
    );

    insertItem.run(8,
      'XIII Semana Acadêmica da Computação',
      'XIII Computer Science Academic Week',
      'Seminário',
      'Seminar',
      'Eventos acadêmicos em tecnologia da informação e sistemas.',
      'Academic events in information technology and systems.',
      'event, computer-science', '2018', 9
    );

    insertItem.run(8,
      'XXVII Encontro de Extensão: Utilização da Tecnologia da Informação na Adaptação e Capacitação de Estudantes Africanos',
      'XXVII Extension Meeting: Using IT for Adaptation and Training of African Students',
      'Encontro',
      'Meeting',
      'Relatos de extensão e projetos de inclusão digital.',
      'Extension reports and digital inclusion projects.',
      'event, extension', '2018', 10
    );

    // ==========================================
    // 10. ITENS: Outros Projetos (Section 9)
    // ==========================================
    const gelsolDescPt = `O GELSoL trata-se de um grupo do PET Computação UFC, surgido ainda em meados dos anos 2000, cuja missão consiste em difundir, incentivar e discutir os princípios do movimento de Software Livre dentro da Universidade Federal do Ceará, e em toda a comunidade de programadores. Unido a tal propósito, o Grupo realiza estudos sobre um dos maiores (na verdade, o maior) exemplares de um Software Livre bem-sucedido: o kernel GNU/Linux.

• Situação: Concluído | Natureza: Outra
• Alunos envolvidos: Graduação: (8) / Mestrado acadêmico: (2) / Doutorado: (1)
• Integrantes: Mauricio Garcia Bimbu - Integrante / Milton Cassul Miranda - Integrante / Lincoln Souza Rocha - Coordenador / ANDREZA FERNANDES DE OLIVEIRA - Integrante.`;

    const gelsolDescEn = `GELSoL is a study group from PET Computação UFC, created in the mid-2000s, whose mission consists of spreading, encouraging, and discussing the principles of the Free Software movement within the Federal University of Ceará, and across the entire programming community.

• Status: Completed | Nature: Other
• Students involved: Undergraduate: (8) / Academic Master: (2) / PhD: (1)
• Members: Mauricio Garcia Bimbu - Member / Milton Cassul Miranda - Member / Lincoln Souza Rocha - Coordinator / ANDREZA FERNANDES DE OLIVEIRA - Member.`;

    insertItem.run(9,
      'Grupo de Estudo em Linux e Software Livre',
      'Study Group on Linux and Free Software',
      'PET Computação UFC',
      'PET Computação UFC',
      gelsolDescPt, gelsolDescEn,
      'linux, open-source, software-livre, PET', '2018 - 2018', 1
    );

    // ==========================================
    // 11. ITENS: Idiomas (Section 10 - Sidebar)
    // ==========================================
    insertItem.run(10, 'Português', 'Portuguese', 'Fluente / Nativo', 'Fluent / Native', '', '', null, '', 1);
    insertItem.run(10, 'Lingála', 'Lingala', 'Fluente / Conversação', 'Fluent / Conversational', '', '', null, '', 2);
    insertItem.run(10, 'Inglês', 'English', 'Intermediário', 'Intermediate', '', '', null, '', 3);
    insertItem.run(10, 'Espanhol', 'Spanish', 'Básico', 'Basic', '', '', null, '', 4);

    // ==========================================
    // 12. ITENS: Cursos & Formação Complementar (Section 11 - Sidebar)
    // ==========================================
    insertItem.run(11, 'Língua Francesa', 'French Language Course', 'Universidade Federal do Ceará (UFC)', 'Federal University of Ceará (UFC)', 'Carga Horária: 64h.', 'Duration: 64h.', 'french, language', '2023', 1);
    insertItem.run(11, 'Ciência de Dados', 'Data Science Academy Program', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 450h.', 'Duration: 450h.', 'datascience, dsa', '2022', 2);
    insertItem.run(11, 'Fundamentos de Engenharia de Dados', 'Data Engineering Fundamentals', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 60h.', 'Duration: 60h.', 'data-engineering', '2023', 3);
    insertItem.run(11, 'Python Fundamentos para Análise de Dados', 'Python Fundamentals for Data Analysis', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 80h.', 'Duration: 80h.', 'python, analytics', '2022', 4);
    insertItem.run(11, 'Microsoft Power BI Para Data Science', 'Microsoft Power BI for Data Science', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 70h.', 'Duration: 70h.', 'powerbi, dsa', '2022', 5);
    insertItem.run(11, 'Azure Fundamentals', 'Azure Fundamentals Certification', 'Udemy', 'Udemy', 'Carga Horária: 40h.', 'Duration: 40h.', 'azure, cloud', '2021', 6);
    insertItem.run(11, 'Inteligência Artificial Fundamentos', 'Artificial Intelligence Fundamentals', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 40h.', 'Duration: 40h.', 'ai, dsa', '2021', 7);
    insertItem.run(11, 'Big Data Fundamentos', 'Big Data Fundamentals', 'Data Science Academy', 'Data Science Academy', 'Carga Horária: 30h.', 'Duration: 30h.', 'bigdata, dsa', '2021', 8);
    insertItem.run(11, 'Dev Full Stack', 'Full Stack Developer Program', 'Alura', 'Alura', 'Carga Horária: 450h.', 'Duration: 450h.', 'fullstack, code', '2021', 9);
    insertItem.run(11, 'Língua Inglesa', 'English Language Course', 'Universidade Federal do Ceará (UFC)', 'Federal University of Ceará (UFC)', 'Carga Horária: 192h.', 'Duration: 192h.', 'english, language', '2019 - 2020', 10);

    // ==========================================
    // 13. AJUSTAR CONFIGURAÇÕES GERAIS (Lattes Citations)
    // ==========================================
    const stmtSettings = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    stmtSettings.run('academic_citations', 'BIMBU, M. G.');
    stmtSettings.run('academic_lattes_id', '9506694715562032');
    stmtSettings.run('academic_lattes_url', 'http://lattes.cnpq.br/9506694715562032');
    stmtSettings.run('academic_name', 'Mauricio Garcia Bimbu');
    stmtSettings.run('academic_location', 'Fortaleza, CE - Brasil');
  })();

  console.log('Todas as atualizações do Lattes completo foram concluídas com sucesso!');
} catch (error) {
  console.error('Erro geral ao atualizar banco de dados:', error);
}
