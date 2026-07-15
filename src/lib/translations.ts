export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Nav / Header
    navHome: 'Início',
    navPortfolio: 'Projetos',
    navExperience: 'Trajetória',
    navSkills: 'Habilidades',
    navContact: 'Contato',
    
    // Hero
    heroGreeting: 'Olá, eu sou',
    heroButtonProjects: 'Ver Projetos',
    heroButtonContact: 'Contato',
    
    // Sections
    sectionProjectsTitle: 'Meus Projetos',
    sectionTrajectoryTitle: 'Trajetória Profissional',
    sectionSkillsTitle: 'Visão Técnica',
    sectionContactTitle: 'Contato',
    
    // Experience / Courses subtitles
    subExperience: 'Experiências',
    subEducation: 'Formação & Cursos',
    
    // Contact
    contactDesc: 'Tem um desafio com dados ou projetos de engenharia em mente? Sinta-se à vontade para me contatar.',
    contactEmailBtn: 'Enviar E-mail',
    contactLinkedinBtn: 'Meu LinkedIn',
    
    // Footer
    footerSubtitle: 'Cientista e Engenheiro de Dados.',
    footerRights: 'Todos os direitos reservados.',
    
    // Experience details translations
    expShowDetails: 'Ver mais',
    expHideDetails: 'Ver menos',
    expToolsUsed: 'Ferramentas Utilizadas:',

    // ETL Simulator translation keys
    etlTitle: 'Simulador de Pipeline ETL (Engenharia de Dados)',
    etlSubtitle: 'Monitore um fluxo de processamento de dados local rodando em tempo real.',
    etlTooltip: 'Este simulador ilustra a orquestração que processa o currículo Lattes: lê o PDF brutamente, processa transformações com Python e dbt, normaliza no SQLite local e atualiza os dados na tela.',
    etlRunBtn: 'Executar Pipeline',
    etlRunningBtn: 'Processando...',
    etlSuccessBtn: 'Pipeline Concluído!',
    etlStatusIdle: 'Aguardando inicialização...',
    etlStatusExtracting: 'Extraindo dados brutos de fontes (PDFs/Lattes/DB)...',
    etlStatusTransforming: 'Transformando, limpando dados com Python/dbt...',
    etlStatusLoading: 'Carregando dados normalizados no Data Warehouse local...',
    etlStatusFinished: 'Sucesso! Pipeline concluído e dashboard atualizado.',
    etlLogStart: 'Iniciando pipeline de processamento às',
    etlMetricVolume: 'Volume de Dados Processados',
    etlMetricSpeed: 'Velocidade Média',
    etlMetricError: 'Taxa de Erro',
    etlUnlocking: 'Painel Analytics Desbloqueado!',
    etlExplainIdle: 'Aguardando inicialização. Escolha suas configurações acima e clique em "Executar Pipeline" para ver o fluxo em ação.',
    etlExplainExtracting: 'Fase de Extração (E): O pipeline está buscando os dados brutos nos arquivos locais e no currículo em PDF do Mauricio. Ele lê as informações desestruturadas para iniciar.',
    etlExplainTransforming: 'Fase de Transformação (T): Os dados brutos extraídos são limpos, datas são padronizadas e as principais palavras-chave de tecnologia (como Python ou SQL) são catalogadas automaticamente.',
    etlExplainLoading: 'Fase de Carga (L): Os dados limpos e estruturados são inseridos no nosso banco de dados SQLite local (portfolio.db) para que possam ser exibidos dinamicamente na tela.',
    etlExplainAnalyzing: 'Fase de Análise: O banco de dados é reindexado para pesquisas rápidas e as métricas do painel analítico (linhas processadas, velocidade e erros) são consolidadas em tempo real.',
    etlExplainFinished: 'Pipeline Concluído com Sucesso! Os dados foram processados de ponta a ponta e o painel analítico está ativo.',
    
    // Terminal translation keys
    terminalTitle: 'Terminal do Engenheiro de Dados (CLI)',
    terminalPlaceholder: 'Digite um comando (ex: help, skills, bio, clear)...',
    terminalHelpText: 'Comandos disponíveis: help | bio | skills | projects | contact | clear',
    terminalWelcome: 'Bem-vindo ao terminal interativo de Mauricio Bimbu. Digite "help" para ver os comandos.',
    terminalUnknown: 'Comando não reconhecido. Digite "help" para ver a lista de comandos.',
    
    // Dynamic content translations mapping
    dbTranslations: {
      // Roles
      'Engenheiro de Dados e Analista Especialista': 'Data Engineer & Specialist Analyst',
      'Mestrando em Ciência da Computação (USP) com ampla experiência em infraestrutura, pipelines de dados e visualização. Especialista certificado em Power BI (PL-300), Fabric (DP-600) e Cloud Data Management. Focado em extrair valor e resolver problemas reais das organizações de ponta a ponta.': 'Computer Science M.Sc. Student (USP) with extensive experience in infrastructure, data pipelines, and visualization. Certified specialist in Power BI (PL-300), Fabric (DP-600), and Cloud Data Management. Focused on extracting value and solving real organizational problems end-to-end.',
      
      // Job Titles & Institutions
      'Analista de Dados e Infraestrutura': 'Data & Infrastructure Analyst',
      'Banco do Nordeste do Brasil (Terceirizado)': 'Banco do Nordeste (Contractor)',
      'Professor de Aplicativos e IA': 'AI & Applications Instructor',
      'Senac São Paulo': 'Senac São Paulo',
      'Analista de Dados': 'Data Analyst',
      'SAFE CONSIG': 'SAFE CONSIG',
      'Analista de Dados (People Analytics)': 'Data Analyst (People Analytics)',
      'Instituto Atlântico': 'Instituto Atlântico',
      'Banco do Nordeste (Bolsista)': 'Banco do Nordeste (Scholarship Holder)',
      
      // Job/Course Descriptions
      'Desenvolvimento e manutenção de relatórios; Pipelines em Python para integração; Monitoramento de capacidade e performance de servidores.': 'Development and maintenance of reports; Python integration pipelines; Capacity and performance monitoring of servers.',
      'Professor de Power BI, Excel e Fundamentos de IA, com foco em mercado e resolução de problemas corporativos reais.': 'Instructor of Power BI, Excel, and AI Fundamentals, focusing on market needs and resolving real corporate problems.',
      'Manipulação via Python e Pentaho, relatórios gerenciais Power BI. Automação de pipelines ETL e gestão de margens de consignações.': 'Data manipulation via Python and Pentaho, Power BI management reports. ETL pipeline automation and consignment margin management.',
      'Coleta, análise e interpretação de dados de RH (rotatividade, satisfação) para predição de padrões e apoio à tomada de decisão.': 'HR data collection, analysis, and interpretation (turnover, satisfaction) to predict patterns and support decision-making.',
      'Desenvolvimento de Dashboards Power BI e SSRS, automação via Python/VBA e acompanhamento de campanhas crédito.': 'Development of Power BI and SSRS Dashboards, automation via Python/VBA, and tracking of credit campaigns.',
      
      // Education/Certifications
      'Mestrado em Ciência da Computação': 'M.Sc. in Computer Science',
      'Universidade de São Paulo (USP)': 'University of São Paulo (USP)',
      'Pesquisa aprofundada em sistemas e inteligência.': 'In-depth research in systems and computer intelligence.',
      'MBA em Data Science e Analytics': 'MBA in Data Science & Analytics',
      'Formação técnica avançada em Data Science aplicada aos negócios.': 'Advanced technical training in Data Science applied to business.',
      'Graduação em Ciência da Computação': 'B.Sc. in Computer Science',
      'Universidade Federal do Ceará (UFC)': 'Federal University of Ceará (UFC)',
      'Formação fundamental em Engenharia de Software, Algoritmos e Dados.': 'Fundamental education in Software Engineering, Algorithms, and Data.',
      'Microsoft Fabric Analytics Engineer Associate (DP-600)': 'Microsoft Fabric Analytics Engineer Associate (DP-600)',
      'Microsoft Power BI Data Analyst (PL-300)': 'Microsoft Power BI Data Analyst (PL-300)',
      'Oracle Cloud Data Management Foundations': 'Oracle Cloud Data Management Foundations',
      'Certificação oficial.': 'Official certification.',
      
      // Skills
      'Python & Computação': 'Python & Computing',
      'Power BI & SSRS': 'Power BI & SSRS',
      'ETL (Pentaho, dbt)': 'ETL (Pentaho, dbt)',
      'SQL & Banco de Dados': 'SQL & Databases',
      'Cloud (Azure, AWS, Oracle)': 'Cloud (Azure, AWS, Oracle)',
      'Machine Learning & Estatística': 'Machine Learning & Statistics',
      
      // Skills Levels
      'Avançado': 'Advanced',
      'Muito bom': 'Very Good',
      'Bom': 'Good',
      
      // Projects
      'Dashboards de Performance': 'Performance Dashboards',
      'Painel executivo no Power BI mapeando gargalos de infraestrutura de TI em tempo real.': 'Executive dashboard in Power BI mapping IT infrastructure bottlenecks in real time.',
      'Visualização': 'Visualization',
      'ETL Segurado e Ágil': 'Secure and Agile ETL',
      'Mapeamento massivo de arquivos CSV e XML governamentais unificados em um Data Warehouse dinâmico.': 'Massive mapping of government CSV and XML files unified into a dynamic Data Warehouse.',
      'Engenharia de Dados': 'Data Engineering',
      'Modelo Preditivo People Analytics': 'People Analytics Predictive Model',
      'Análise profunda da taxa de turnover, correlacionando satisfação, faixa salarial e tempo de casa.': 'Deep analysis of turnover rate, correlating employee satisfaction, salary range, and tenure.',
      'Ciência de Dados': 'Data Science'
    }
  },
  en: {
    // Nav / Header
    navHome: 'Home',
    navPortfolio: 'Projects',
    navExperience: 'Trajectory',
    navSkills: 'Skills',
    navContact: 'Contact',
    
    // Hero
    heroGreeting: "Hi, I am",
    heroButtonProjects: 'View Projects',
    heroButtonContact: 'Contact',
    
    // Sections
    sectionProjectsTitle: 'My Projects',
    sectionTrajectoryTitle: 'Professional Trajectory',
    sectionSkillsTitle: 'Technical Vision',
    sectionContactTitle: 'Contact',
    
    // Experience / Courses subtitles
    subExperience: 'Experiences',
    subEducation: 'Education & Certifications',
    
    // Contact
    contactDesc: 'Have a data challenge or engineering project in mind? Feel free to contact me.',
    contactEmailBtn: 'Send Email',
    contactLinkedinBtn: 'My LinkedIn',
    
    // Footer
    footerSubtitle: 'Data Scientist & Data Engineer.',
    footerRights: 'All rights reserved.',
    
    // Experience details translations
    expShowDetails: 'See more',
    expHideDetails: 'See less',
    expToolsUsed: 'Tools Used:',

    // ETL Simulator translation keys
    etlTitle: 'ETL Pipeline Simulator (Data Engineering)',
    etlSubtitle: 'Monitor a local data processing flow running in real time.',
    etlTooltip: 'This simulator illustrates the orchestration processing the Lattes resume: reading the raw PDF, processing transformations using Python and dbt, normalizing it in the local SQLite, and updating screen data.',
    etlRunBtn: 'Run Pipeline',
    etlRunningBtn: 'Processing...',
    etlSuccessBtn: 'Pipeline Completed!',
    etlStatusIdle: 'Waiting for initiation...',
    etlStatusExtracting: 'Extracting raw data from sources (PDFs/Lattes/DB)...',
    etlStatusTransforming: 'Transforming, cleaning data with Python/dbt...',
    etlStatusLoading: 'Loading normalized data into local Data Warehouse...',
    etlStatusFinished: 'Success! Pipeline completed and dashboard updated.',
    etlLogStart: 'Starting processing pipeline at',
    etlMetricVolume: 'Processed Data Volume',
    etlMetricSpeed: 'Average Speed',
    etlMetricError: 'Error Rate',
    etlUnlocking: 'Analytics Dashboard Unlocked!',
    etlExplainIdle: 'Waiting for initiation. Choose your settings above and click "Run Pipeline" to see the flow in action.',
    etlExplainExtracting: 'Extraction Phase (E): The pipeline is fetching raw data from local files and Mauricio\'s PDF resume. It reads unstructured information to begin.',
    etlExplainTransforming: 'Transformation Phase (T): Extracted raw data is cleaned, dates are standardized, and key tech terms (like Python or SQL) are automatically cataloged.',
    etlExplainLoading: 'Loading Phase (L): Clean and structured data is loaded into our local SQLite database (portfolio.db) to be dynamically displayed on the screen.',
    etlExplainAnalyzing: 'Analysis Phase: The database is reindexed for quick search, and analytics dashboard metrics (processed rows, speed, errors) are consolidated in real time.',
    etlExplainFinished: 'Pipeline Completed Successfully! The data was processed end-to-end and the analytics dashboard is active.',
    
    // Terminal translation keys
    terminalTitle: 'Data Engineer Terminal (CLI)',
    terminalPlaceholder: 'Type a command (e.g., help, skills, bio, clear)...',
    terminalHelpText: 'Available commands: help | bio | skills | projects | contact | clear',
    terminalWelcome: 'Welcome to Mauricio Bimbu\'s interactive terminal. Type "help" to see commands.',
    terminalUnknown: 'Command not recognized. Type "help" to view the command list.',
    
    // Dynamic content translations mapping
    dbTranslations: {
      // Roles
      'Engenheiro de Dados e Analista Especialista': 'Data Engineer & Specialist Analyst',
      'Mestrando em Ciência da Computação (USP) com ampla experiência em infraestrutura, pipelines de dados e visualização. Especialista certificado em Power BI (PL-300), Fabric (DP-600) e Cloud Data Management. Focado em extrair valor e resolver problemas reais das organizações de ponta a ponta.': 'Computer Science M.Sc. Student (USP) with extensive experience in infrastructure, data pipelines, and visualization. Certified specialist in Power BI (PL-300), Fabric (DP-600), and Cloud Data Management. Focused on extracting value and solving real organizational problems end-to-end.',
      
      // Job Titles & Institutions
      'Analista de Dados e Infraestrutura': 'Data & Infrastructure Analyst',
      'Banco do Nordeste do Brasil (Terceirizado)': 'Banco do Nordeste (Contractor)',
      'Professor de Aplicativos e IA': 'AI & Applications Instructor',
      'Senac São Paulo': 'Senac São Paulo',
      'Analista de Dados': 'Data Analyst',
      'SAFE CONSIG': 'SAFE CONSIG',
      'Analista de Dados (People Analytics)': 'Data Analyst (People Analytics)',
      'Instituto Atlântico': 'Instituto Atlântico',
      'Banco do Nordeste (Bolsista)': 'Banco do Nordeste (Scholarship Holder)',
      
      // Job/Course Descriptions
      'Desenvolvimento e manutenção de relatórios; Pipelines em Python para integração; Monitoramento de capacidade e performance de servidores.': 'Development and maintenance of reports; Python integration pipelines; Capacity and performance monitoring of servers.',
      'Professor de Power BI, Excel e Fundamentos de IA, com foco em mercado e resolução de problemas corporativos reais.': 'Instructor of Power BI, Excel, and AI Fundamentals, focusing on market needs and resolving real corporate problems.',
      'Manipulação via Python e Pentaho, relatórios gerenciais Power BI. Automação de pipelines ETL e gestão de margens de consignações.': 'Data manipulation via Python and Pentaho, Power BI management reports. ETL pipeline automation and consignment margin management.',
      'Coleta, análise e interpretação de dados de RH (rotatividade, satisfação) para predição de padrões e apoio à tomada de decisão.': 'HR data collection, analysis, and interpretation (turnover, satisfaction) to predict patterns and support decision-making.',
      'Desenvolvimento de Dashboards Power BI e SSRS, automação via Python/VBA e acompanhamento de campanhas crédito.': 'Development of Power BI and SSRS Dashboards, automation via Python/VBA, and tracking of credit campaigns.',
      
      // Education/Certifications
      'Mestrado em Ciência da Computação': 'M.Sc. in Computer Science',
      'Universidade de São Paulo (USP)': 'University of São Paulo (USP)',
      'Pesquisa aprofundada em sistemas e inteligência.': 'In-depth research in systems and computer intelligence.',
      'MBA em Data Science e Analytics': 'MBA in Data Science & Analytics',
      'Formação técnica avançada em Data Science aplicada aos negócios.': 'Advanced technical training in Data Science applied to business.',
      'Graduação em Ciência da Computação': 'B.Sc. in Computer Science',
      'Universidade Federal do Ceará (UFC)': 'Federal University of Ceará (UFC)',
      'Formação fundamental em Engenharia de Software, Algoritmos e Dados.': 'Fundamental education in Software Engineering, Algorithms, and Data.',
      'Microsoft Fabric Analytics Engineer Associate (DP-600)': 'Microsoft Fabric Analytics Engineer Associate (DP-600)',
      'Microsoft Power BI Data Analyst (PL-300)': 'Microsoft Power BI Data Analyst (PL-300)',
      'Oracle Cloud Data Management Foundations': 'Oracle Cloud Data Management Foundations',
      'Certificação oficial.': 'Official certification.',
      
      // Skills
      'Python & Computação': 'Python & Computing',
      'Power BI & SSRS': 'Power BI & SSRS',
      'ETL (Pentaho, dbt)': 'ETL (Pentaho, dbt)',
      'SQL & Banco de Dados': 'SQL & Databases',
      'Cloud (Azure, AWS, Oracle)': 'Cloud (Azure, AWS, Oracle)',
      'Machine Learning & Estatística': 'Machine Learning & Statistics',
      
      // Skills Levels
      'Avançado': 'Advanced',
      'Muito bom': 'Very Good',
      'Bom': 'Good',
      
      // Projects
      'Dashboards de Performance': 'Performance Dashboards',
      'Painel executivo no Power BI mapeando gargalos de infraestrutura de TI em tempo real.': 'Executive dashboard in Power BI mapping IT infrastructure bottlenecks in real time.',
      'Visualização': 'Visualization',
      'Dashboard de Monitoramento de Infraestrutura': 'Infrastructure Monitoring Dashboard',
      'Painel executivo em Power BI focado em monitoramento de capacidade de servidores, consumo de CPU, IOPS de banco de dados e tráfego de rede em tempo real.': 'Power BI executive dashboard focusing on real-time server capacity monitoring, CPU consumption, database IOPS, and network traffic.',
      'Power BI': 'Power BI',
      'ETL Segurado e Ágil': 'Secure and Agile ETL',
      'Mapeamento massivo de arquivos CSV e XML governamentais unificados em um Data Warehouse dinâmico.': 'Massive mapping of government CSV and XML files unified into a dynamic Data Warehouse.',
      'Engenharia de Dados': 'Data Engineering',
      'Modelo Preditivo People Analytics': 'People Analytics Predictive Model',
      'Análise profunda da taxa de turnover, correlacionando satisfação, faixa salarial e tempo de casa.': 'Deep analysis of turnover rate, correlating employee satisfaction, salary range, and tenure.',
      'Ciência de Dados': 'Data Science'
    }
  }
};

/**
 * Translates a given database string if an English translation exists and the current language is English.
 * Otherwise returns the string as is.
 */
export function translateDbString(text: string | null | undefined, lang: Language): string {
  if (!text) return '';
  if (lang === 'pt') return text;
  
  const translationsMap = translations.en.dbTranslations as Record<string, string>;
  return translationsMap[text] || text;
}
