export type Language = 'pt' | 'en';

export interface TranslationStructure {
  // Nav / Header
  navHome: string;
  navPortfolio: string;
  navServices: string;
  navExperience: string;
  navSkills: string;
  navContact: string;
  
  // Hero
  heroGreeting: string;
  heroButtonProjects: string;
  heroButtonContact: string;
  
  // Sections
  sectionServicesTitle: string;
  sectionServicesDesc: string;
  sectionProjectsTitle: string;
  sectionProjectsDesc: string;
  sectionTrajectoryTitle: string;
  sectionSkillsTitle: string;
  sectionContactTitle: string;
  
  // Experience / Courses subtitles
  subExperience: string;
  subEducation: string;
  
  // Contact
  contactDesc: string;
  contactEmailBtn: string;
  contactLinkedinBtn: string;
  
  // Footer
  footerSubtitle: string;
  footerRights: string;
  
  // Experience details translations
  expShowDetails: string;
  expHideDetails: string;
  expToolsUsed: string;

  // ETL Simulator translation keys
  etlTitle: string;
  etlSubtitle: string;
  etlTooltip: string;
  etlRunBtn: string;
  etlRunningBtn: string;
  etlSuccessBtn: string;
  etlStatusIdle: string;
  etlStatusExtracting: string;
  etlStatusTransforming: string;
  etlStatusLoading: string;
  etlStatusFinished: string;
  etlLogStart: string;
  etlMetricVolume: string;
  etlMetricSpeed: string;
  etlMetricError: string;
  etlMetricRows: string;
  etlMetricQuality: string;
  etlMetricThroughput: string;
  etlMetricLatency: string;
  etlUnitRows: string;
  etlUnitNoNulls: string;
  etlUnlocking: string;
  etlExplainIdle: string;
  etlExplainExtracting: string;
  etlExplainTransforming: string;
  etlExplainLoading: string;
  etlExplainAnalyzing: string;
  etlExplainFinished: string;

  // Terminal translation keys
  terminalTitle: string;
  terminalPlaceholder: string;
  terminalHelpText: string;
  terminalWelcome: string;
  terminalUnknown: string;

  // Optional DB translations dictionary
  dbTranslations?: Record<string, string>;
}

export const translations: Record<Language, TranslationStructure> = {
  pt: {
    // Nav / Header
    navHome: 'Início',
    navPortfolio: 'Projetos',
    navServices: 'Serviços',
    navExperience: 'Experiência',
    navSkills: 'Habilidades',
    navContact: 'Contato',
    
    // Hero
    heroGreeting: 'Olá, me chamo',
    heroButtonProjects: 'Ver Projetos',
    heroButtonContact: 'Entre em Contato',
    
    // Sections
    sectionServicesTitle: 'O que eu posso fazer por você?',
    sectionServicesDesc: 'Estes são alguns trabalhos em que posso utilizar minhas habilidades para gerar soluções eficientes e eficazes em problemas que você possa enfrentar.',
    sectionProjectsTitle: 'Casos e Projetos',
    sectionProjectsDesc: 'Nesta seção, apresento uma seleção de projetos que desenvolvi em Engenharia de Dados, Analytics e Inteligência de Negócios. Explore as soluções abaixo e clique para ver os detalhes completos, repositórios ou notebooks.',
    sectionTrajectoryTitle: 'Experiência Profissional',
    sectionSkillsTitle: 'Habilidades Técnicas',
    sectionContactTitle: 'Contato',
    
    // Experience / Courses subtitles
    subExperience: 'Experiências',
    subEducation: 'Formação & Certificações',
    
    // Contact
    contactDesc: 'Tem um desafio de dados ou projeto de engenharia em mente? Sinta-se à vontade para entrar em contato.',
    contactEmailBtn: 'Enviar E-mail',
    contactLinkedinBtn: 'Meu LinkedIn',
    
    // Footer
    footerSubtitle: 'Cientista de Dados & Engenheiro de Dados.',
    footerRights: 'Todos os direitos reservados.',
    
    // Experience details translations
    expShowDetails: 'Ver mais detalhes',
    expHideDetails: 'Ocultar detalhes',
    expToolsUsed: 'Ferramentas Utilizadas:',

    // ETL Simulator translation keys
    etlTitle: 'Simulador de Pipeline ETL',
    etlSubtitle: 'Processamento Streaming & Batch com ingestão de JSON bruto, transformação dbt/Spark e carga em Data Warehouse.',
    etlTooltip: 'Simula um pipeline moderno de Engenharia de Dados: Ingestão de dados brutos em JSON, validação e limpeza com dbt/Spark e carga final no Data Warehouse (DW).',
    etlRunBtn: 'Executar Pipeline ETL',
    etlRunningBtn: 'Processando Pipeline...',
    etlSuccessBtn: 'Pipeline ETL Concluído!',
    etlStatusIdle: 'Aguardando inicialização...',
    etlStatusExtracting: '🥉 Ingerindo fluxo de eventos em JSON bruto na Camada Bronze...',
    etlStatusTransforming: '🥈 Executando tratamento, qualidade (DQ) e mascaramento na Camada Prata...',
    etlStatusLoading: '🥇 Modelando Star Schema e agregando métricas no Data Warehouse (DW)...',
    etlStatusFinished: 'Sucesso! Pipeline concluído e Data Warehouse (DW) atualizado com 100% de integridade.',
    etlLogStart: 'Iniciando orquestração Medallion Lakehouse às',
    etlMetricVolume: 'Eventos Processados',
    etlMetricSpeed: 'Vazão (Throughput)',
    etlMetricError: 'Taxa de Erro DQ',
    etlMetricRows: 'Linhas Processadas',
    etlMetricQuality: 'Qualidade dos Dados (DQ)',
    etlMetricThroughput: 'Vazão (Throughput)',
    etlMetricLatency: 'Latência Pipeline',
    etlUnitRows: 'linhas',
    etlUnitNoNulls: 'sem nulos',
    etlUnlocking: 'Data Warehouse (DW) Disponível!',
    etlExplainIdle: 'Aguardando inicialização. Clique em "Executar Pipeline Medallion" para visualizar a ingestão e transformação dos dados em JSON.',
    etlExplainExtracting: 'Camada Bronze (Bronze Layer): Ingestão bruta do payload JSON diretamente no Cloud Storage com particionamento temporal e auditoria de schema.',
    etlExplainTransforming: 'Camada Prata (Silver Layer): Limpeza de nulos, deduplicação, mascaramento de PII (privacidade), conversão de timestamps UTC e salvamento em formato Delta/Parquet.',
    etlExplainLoading: 'Camada Ouro (Gold Layer): Modelagem dimensional (Star Schema), cálculo de KPIs em tempo real e atualização no Data Warehouse (DW - BigQuery).',
    etlExplainAnalyzing: 'Fase de Análise: Cálculo das métricas consolidadas (Volume Total, Score de Qualidade DQ e vazão por segundo).',
    etlExplainFinished: 'Pipeline Medallion executado com 100% de sucesso! Camadas Bronze, Prata, Ouro e DW sincronizadas.',
    
    // Terminal translation keys
    terminalTitle: 'Terminal do Engenheiro de Dados (CLI)',
    terminalPlaceholder: 'Digite um comando...',
    terminalHelpText: 'Comandos disponíveis: help | bio | skills | projects | contact | clear',
    terminalWelcome: 'Bem-vindo ao terminal interativo de Mauricio Bimbu. Digite "help" para ver os comandos.',
    terminalUnknown: 'Comando não reconhecido. Digite "help" para ver a lista de comandos.'
  },
  en: {
    // Nav / Header
    navHome: 'Home',
    navPortfolio: 'Projects',
    navServices: 'Services',
    navExperience: 'Experience',
    navSkills: 'Skills',
    navContact: 'Contact',
    
    // Hero
    heroGreeting: "Hi, I am",
    heroButtonProjects: 'View Projects',
    heroButtonContact: 'Contact',
    
    // Sections
    sectionServicesTitle: 'What can I do for you?',
    sectionServicesDesc: 'These are key services where I apply data engineering, analytics, and AI skills to build effective and scalable solutions for your business challenges.',
    sectionProjectsTitle: 'Cases & Projects',
    sectionProjectsDesc: 'In this section, I present a selection of key data engineering, analytics, and business intelligence projects I built. Explore the solutions below and click to view full details, code, or notebooks.',
    sectionTrajectoryTitle: 'Professional Experience',
    sectionSkillsTitle: 'Technical Skills',
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
    etlTitle: 'ETL Pipeline Simulator',
    etlSubtitle: 'Streaming & Batch processing with raw JSON ingestion, dbt/Spark transformation, and Data Warehouse load.',
    etlTooltip: 'Simulates a modern data engineering pipeline: Raw JSON ingestion, validation and cleaning with dbt/Spark, and Data Warehouse load.',
    etlRunBtn: 'Run ETL Pipeline',
    etlRunningBtn: 'Processing Pipeline...',
    etlSuccessBtn: 'ETL Pipeline Completed!',
    etlStatusIdle: 'Waiting for initiation...',
    etlStatusExtracting: '🥉 Ingesting raw JSON event stream into Bronze Layer...',
    etlStatusTransforming: '🥈 Running transformations, data quality (DQ) checks & PII masking in Silver Layer...',
    etlStatusLoading: '🥇 Modeling Star Schema & business metrics in Gold Layer...',
    etlStatusFinished: 'Success! Pipeline completed and Gold Data Mart updated with 100% integrity.',
    etlLogStart: 'Initiating Medallion Lakehouse orchestration at',
    etlMetricVolume: 'Events Processed',
    etlMetricSpeed: 'Throughput',
    etlMetricError: 'DQ Error Rate',
    etlMetricRows: 'Processed Rows',
    etlMetricQuality: 'Data Quality (DQ)',
    etlMetricThroughput: 'Throughput',
    etlMetricLatency: 'Pipeline Latency',
    etlUnitRows: 'rows',
    etlUnitNoNulls: 'no nulls',
    etlUnlocking: 'Gold Data Mart Available!',
    etlExplainIdle: 'Waiting for initiation. Click "Run Medallion Pipeline" to view JSON ingestion and transformation.',
    etlExplainExtracting: 'Bronze Layer: Raw JSON payload ingestion into Cloud Object Storage with temporal partitioning & schema audit.',
    etlExplainTransforming: 'Silver Layer: Deduplication, null filtering, PII masking, UTC timestamp standardization, and writing to Parquet/Delta format.',
    etlExplainLoading: 'Gold Layer: Dimensional modeling (Star Schema), computing real-time KPIs and materializing business data marts in BigQuery.',
    etlExplainAnalyzing: 'Analysis Phase: Consolidated performance metric computation (Total Volume, DQ Quality Score & MB/s Throughput).',
    etlExplainFinished: 'Medallion Pipeline executed with 100% success! Bronze, Silver, and Gold layers synchronized.',
    
    // Terminal translation keys
    terminalTitle: 'Data Engineer Terminal (CLI)',
    terminalPlaceholder: 'Type a command...',
    terminalHelpText: 'Available commands: help | bio | skills | projects | contact | clear',
    terminalWelcome: 'Welcome to Mauricio Bimbu\'s interactive terminal. Type "help" to see commands.',
    terminalUnknown: 'Command not recognized. Type "help" to view the command list.',
    
    // Dynamic content translations mapping (MUST BE IN EN ONLY)
    dbTranslations: {
      // Roles & Bio
      'Analista de dados e Engenheiro de Dados.': 'Data Analyst & Data Engineer.',
      'Analista de dados e Engenheiro de Dados': 'Data Analyst & Data Engineer',
      'Analista de Dados e Engenheiro de Dados.': 'Data Analyst & Data Engineer.',
      'Analista de Dados e Engenheiro de Dados': 'Data Analyst & Data Engineer',
      'Analista de dados, Engenheiro de Dados.': 'Data Analyst, Data Engineer.',
      'Analista de dados, Engenheiro de Dados': 'Data Analyst, Data Engineer',
      'Cientista e Engenheiro de Dados.': 'Data Scientist & Data Engineer.',
      'Cientista e Engenheiro de Dados': 'Data Scientist & Data Engineer',
      'Engenheiro de Dados e Analista Especialista': 'Data Engineer & Specialist Analyst',
      'Analista de dados': 'Data Analyst',
      'Analista de Dados': 'Data Analyst',
      'Engenheiro de Dados': 'Data Engineer',
      'Cientista de Dados': 'Data Scientist',
      
      'Mestrando em Ciência da Computação (USP) com ampla experiência em Analise de dados, pipelines de dados, visualização engenharia de dados. Especialista certificado em Power BI (PL-300), Fabric (DP-600) e Cloud Data Management. Focado em extrair valor e resolver problemas reais das organizações de ponta a ponta.': 'Computer Science M.Sc. Student (USP) with extensive experience in data analysis, data pipelines, visualization, and data engineering. Certified specialist in Power BI (PL-300), Fabric (DP-600), and Cloud Data Management. Focused on extracting value and solving real organizational problems end-to-end.',
      'Mestrando em Ciência da Computação (USP) com ampla experiência em infraestrutura, pipelines de dados e visualização. Especialista certificado em Power BI (PL-300), Fabric (DP-600) e Cloud Data Management. Focado em extrair valor e resolver problemas reais das organizações de ponta a ponta.': 'Computer Science M.Sc. Student (USP) with extensive experience in infrastructure, data pipelines, and visualization. Certified specialist in Power BI (PL-300), Fabric (DP-600), and Cloud Data Management. Focused on extracting value and solving real organizational problems end-to-end.',
      
      // Job Titles & Institutions
      'Analista de Dados e Infraestrutura': 'Data & Infrastructure Analyst',
      'Analista de Dados e infraestrutura (Gestão de Capacidade e Disponibilidade)': 'Data & Infrastructure Analyst (Capacity and Availability Management)',
      'Banco do Nordeste do Brasil (Terceirizado)': 'Banco do Nordeste (Contractor)',
      'Professor de Aplicativos e IA': 'AI & Applications Instructor',
      'Professor de Aplicativos e IA - (Temporário)': 'AI & Applications Instructor (Temporary)',
      'Senac São Paulo': 'Senac São Paulo',
      'SAFE CONSIG': 'SAFE CONSIG',
      'Analista de Dados (People Analytics)': 'Data Analyst (People Analytics)',
      'Analista de dados, People Analytics': 'Data Analyst, People Analytics',
      'Instituto Atlântico': 'Instituto Atlântico',
      'Banco do Nordeste (Bolsista)': 'Banco do Nordeste (Scholarship Holder)',
      'Banco do Nordeste': 'Banco do Nordeste',
      'Analista de dados - (Temporário)': 'Data Analyst (Temporary)',
      'Grupo MOP': 'Grupo MOP',
      'Voluntário - Hora do Código nas Escolas': 'Volunteer - Hour of Code in Schools',
      'Fortaleza': 'Fortaleza',
      
      // Job/Course Descriptions
      'Desenvolvimento e manutenção de relatórios; Pipelines em Python para integração; Monitoramento de capacidade e performance de servidores.': 'Development and maintenance of reports; Python integration pipelines; Capacity and performance monitoring of servers.',
      'Professor de Power BI, Excel e Fundamentos de IA, com foco em mercado e resolução de problemas corporativos reais.': 'Instructor of Power BI, Excel, and AI Fundamentals, focusing on market needs and resolving real corporate problems.',
      'Manipulação via Python e Pentaho, relatórios gerenciais Power BI. Automação de pipelines ETL e gestão de margens de consignações.': 'Data manipulation via Python and Pentaho, Power BI management reports. ETL pipeline automation and consignment margin management.',
      'Coleta, análise e interpretação de dados de RH (rotatividade, satisfação) para predição de padrões e apoio à tomada de decisão.': 'HR data collection, analysis, and interpretation (turnover, satisfaction) to predict patterns and support decision-making.',
      'Desenvolvimento de Dashboards Power BI e SSRS, automação via Python/VBA e acompanhamento de campanhas crédito.': 'Development of Power BI and SSRS Dashboards, automation via Python/VBA, and tracking of credit campaigns.',
      
      '• Desenvolvimento e manutenção de relatórios utilizando Power BI, SSRS (SQL Server Reporting Services) e Grafana.\n• Desenvolvimento de interfaces interativas em Streamlit para visualização e exploração de dados de capacidade e disponibilidade.\n• Implementação de pipelines de dados e automações em Python para integração de diferentes fontes com foco em coleta, tratamento e monitoramento contínuo.\n• Análise de capacidade e disponibilidade de sistemas, avaliando dados coletados por ferramentas de monitoramento.\n• Elaboração de dashboards de performance e uso de recursos (memória, CPU e disco) de servidores e monitoramento contínuo.\n• Análise de eventos e proposição de melhorias em parâmetros e componentes da infraestrutura de TI.\n• Definição de estratégias para otimização de recursos e redução de tempos de resposta.': '• Development and maintenance of reports using Power BI, SSRS (SQL Server Reporting Services), and Grafana.\n• Development of interactive Streamlit interfaces for visualization and exploration of capacity and availability data.\n• Implementation of data pipelines and Python automations for multi-source integration focused on continuous collection, processing, and monitoring.\n• System capacity and availability analysis, evaluating data collected by monitoring tools.\n• Creation of performance and server resource usage dashboards (memory, CPU, and disk) with continuous monitoring.\n• Event analysis and proposal of parameter and IT infrastructure improvements.\n• Strategy definition for resource optimization and response time reduction.',

      '• Ministrei aulas nos cursos de Excel (básico ao avançado), Power BI e Fundamentos de Inteligência Artificial.\n• Planejamento e execução de aulas práticas e dinâmicas, com foco em aplicações corporativas e resolução de problemas reais.\n• Apoio no desenvolvimento de competências analíticas e digitais voltadas ao mercado de trabalho.\n• Participação em iniciativas educacionais voltadas à formação tecnológica e uso ético da IA.': '• Taught courses in Excel (basic to advanced), Power BI, and Artificial Intelligence Fundamentals.\n• Planning and execution of practical and dynamic classes focused on corporate applications and real-world problem solving.\n• Support in developing analytical and digital skills tailored for the job market.\n• Participation in educational initiatives focused on technological training and ethical AI use.',

      'Manipulação de arquivos por meio de Python e Pentaho, desenvolvimento e manutenção de dashboards com o Power BI. Processamento de arquivos para gestão de margem para empréstimos consignáveis. Criação de novos bancos de dados para convênios recém- adquiridos. Manipulações, validações e inserção de informações em Banco de Dados, movimentação de dados, consultas SQL e procedimentos de manutenção. Execução fluída dos processamentos mensais, em conformidade com o calendário estabelecido.': 'Data manipulation via Python and Pentaho, development and maintenance of Power BI dashboards. File processing for payroll-deductible loan margin management. Database creation for newly acquired partnerships. Data manipulation, validation, and insertion into databases, SQL queries, and maintenance procedures. Smooth execution of monthly processing cycles in compliance with scheduled calendars.',

      'Coletar, analisar e interpretar dados dos colaboradores da empresa, visando identificar padrões, tendências e correlações. Utilizando técnicas estatísticas e ferramentas de análise de dados para obter insights relevantes sobre desempenho, rotatividade, satisfação no trabalho, entre outros aspectos relacionados à gestão de pessoas. Apoia a tomada de decisões estratégicas por meio da comunicação clara e visualização de dados.': 'Collect, analyze, and interpret employee data to identify patterns, trends, and correlations. Using statistical techniques and data analysis tools to derive key insights regarding performance, turnover, and job satisfaction. Supports strategic decision-making through clear communication and data visualization.',

      'Atuei na central de cartões, empréstimos e fundos de investimento, desempenhando as seguintes responsabilidades:\n• Desenvolvimento de dashboards utilizando Power BI e Reporting Services para análise e visualização de dados.\n• Automação de rotinas por meio de programação em VBA e Python, visando aumentar a eficiência e produtividade.\n\n• Elaboração de consultas SQL para obtenção de informações em banco de dados.\n• Auxílio na elaboração de relatórios de acompanhamento para gestão, fornecendo insights e informações relevantes.\n• Elaboração de relatórios em planilhas Excel e apresentação dos resultados.\n• Monitoramento de campanha de recuperação de crédito em parceria com empresas terceirizadas.': 'Worked at the cards, loans, and investment funds center, performing the following duties:\n• Development of dashboards using Power BI and Reporting Services for data analysis and visualization.\n• Routine automation via VBA and Python programming to enhance efficiency and productivity.\n\n• Writing SQL queries to retrieve database information.\n• Assisting in management tracking reports, providing insights and key metrics.\n• Preparing Excel spreadsheet reports and presenting results.\n• Monitoring credit recovery campaigns in partnership with third-party vendors.',

      'Fui responsável pela extração e padronização de bases de dados relacionadas à cobrança e recuperação de crédito. Utilizei o Power BI para construir relatórios e apresentações visando a análise desses dados. Desenvolvi consultas SQL, Além disso, monitorei indicadores de negócio nesses setores e reportei os resultados à área responsável. Propus melhorias e criei dashboards personalizados para otimizar as operações, coordenando a implementação de processos baseados em dados para aprimorar a eficácia das áreas de negócio envolvidas.': 'Responsible for data extraction and standardization of credit collection and recovery databases. Used Power BI to build analytical reports and presentations. Developed SQL queries, monitored business KPIs in these sectors, and reported results to management. Proposed process improvements and created custom dashboards to optimize operations and drive data-driven efficiency.',

      'Promoção de espaços de conhecimento para ensinar lógica de programação utilizando a plataforma Code.org, com uma abordagem interativa e acessível que incentiva o pensamento crítico e a resolução de problemas. Além disso, promove habilidades essenciais, como colaboração, criatividade e persistência. Realizado em escolas públicas da rede municipal de Fortaleza.': 'Promoting educational workshops to teach programming logic using the Code.org platform, with an interactive and accessible approach encouraging critical thinking and problem-solving. Promotes essential skills such as collaboration, creativity, and perseverance in public schools in Fortaleza.',
      
      // Education/Certifications
      'Mestrado em Ciência da Computação': 'M.Sc. in Computer Science',
      'Universidade de São Paulo (USP)': 'University of São Paulo (USP)',
      'Pesquisa aprofundada em sistemas e inteligência.': 'In-depth research in systems and computer intelligence.',
      'MBA em Data Science e Analytics': 'MBA in Data Science & Analytics',
      'Formação técnica avançada em Data Science aplicada aos negócios.': 'Advanced technical training in Data Science applied to business.',
      'Graduação em Ciência da Computação': 'B.Sc. in Computer Science',
      'Universidade Federal do Ceará (UFC)': 'Federal University of Ceará (UFC)',
      'Formação fundamental em Engenharia de Software, Algoritmos e Dados.': 'Fundamental education in Software Engineering, Algorithms, and Data.',
      'Especialização em Big Data (Ciência de Dados)': 'Specialization in Big Data (Data Science)',
      'Faculdade Iguaçu': 'Faculdade Iguaçu',
      'Especialidade focada em big data, infraestrutura de analytics e ciência de dados.': 'Specialization focused on big data, analytics infrastructure, and data science.',
      'Microsoft Fabric Analytics Engineer Associate (DP-600)': 'Microsoft Fabric Analytics Engineer Associate (DP-600)',
      'Microsoft Power BI Data Analyst (PL-300)': 'Microsoft Power BI Data Analyst (PL-300)',
      'Oracle Cloud Data Management Foundations': 'Oracle Cloud Data Management Foundations',
      'Oracle Cloud Data Management 2023 Certified Foundations Associate': 'Oracle Cloud Data Management 2023 Certified Foundations Associate',
      'Oracle Cloud Infrastructure AI Certified Foundations Associate': 'Oracle Cloud Infrastructure AI Certified Foundations Associate',
      'Certificação oficial.': 'Official certification.',
      'Curso complementar relevante.': 'Relevant complementary course.',
      
      // Skills & Levels
      'Gestão de Projetos de Dados': 'Data Project Management',
      'Ética e Segurança de Dados': 'Data Ethics & Security',
      'Python & Computação': 'Python & Computing',
      'Power BI & SSRS': 'Power BI & SSRS',
      'ETL (Pentaho, dbt)': 'ETL (Pentaho, dbt)',
      'SQL & Banco de Dados': 'SQL & Databases',
      'Cloud (Azure, AWS, Oracle)': 'Cloud (Azure, AWS, Oracle)',
      'Machine Learning & Estatística': 'Machine Learning & Statistics',
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
      'Ciência de Dados': 'Data Science',
      'Dashboard de Análise Financeira': 'Financial Analysis Dashboard',
      'Análise de desempenho empresarial. O projeto apresenta KPIs de Receita, Custos, Despesas e Lucro, além de análises temporais, ranking de clientes, composição de custos, distribuição de despesas e detalhamento mensal por meio de gráfico Waterfall e tabela gerencial.': 'Corporate performance analysis. The project features KPIs for Revenue, Costs, Expenses, and Profit, along with time series analysis, customer ranking, cost composition, expense breakdown, and monthly details via Waterfall chart and management table.',

      // Custom Dynamic Settings & Intro Texts
      'Estes são os principais pontos de ganho de experiência e títulos que obtive durante minha jornada até hoje...': 'These are the key milestones of experience and credentials I have gained throughout my journey to date...',
      'Sigo o conceito T-Shaped, pois acredito que a capacidade de produzir soluções eficazes e eficientes dependem fundamentalmente dos conhecimentos previamente adquiridos.': 'I follow the T-Shaped concept, believing that the ability to produce effective and efficient solutions fundamentally depends on previously acquired knowledge.',
      'Estes são meus níveis de habilidade com as tecnologias mais populares no mercado atualmente:': 'These are my skill levels with the most popular technologies in the market today:',
      'Nesta seção, apresento uma seleção de projetos que desenvolvi em Engenharia de Dados, Analytics e Inteligência de Negócios. Explore as soluções abaixo e clique para ver os detalhes completos, repositórios ou notebooks.': 'In this section, I present a selection of projects developed in Data Engineering, Analytics, and Business Intelligence. Explore the solutions below and click to view full details, repositories, or notebooks.',
      'O que posso fazer pelo seu negócio?': 'What can I do for your business?',
      'Soluções sob medida em Engenharia de Dados, Analytics e Inteligência Artificial.': 'Tailored solutions in Data Engineering, Analytics, and Artificial Intelligence.',
      
      // Services Items
      'Engenharia de Dados & Pipelines ETL/ELT': 'Data Engineering & ETL/ELT Pipelines',
      'Construção de pipelines Medallion escaláveis (Bronze, Silver, Gold), ingestão streaming/batch e orquestração robusta com Apache Spark, dbt e Airflow.': 'Building scalable Medallion pipelines (Bronze, Silver, Gold), streaming/batch ingestion, and robust orchestration with Apache Spark, dbt, and Airflow.',
      'Engenharia de Dados (ETL/ELT)': 'Data Engineering (ETL/ELT)',
      'Construção de Data Warehouses, Data Lakes e pipelines robustos (Batch & Streaming) no Azure, AWS e GCP.': 'Building robust Data Warehouses, Data Lakes, and pipelines (Batch & Streaming) on Azure, AWS, and GCP.',
      'Análise Descritiva & Diagnóstica': 'Descriptive & Diagnostic Analytics',
      'Exploração estatística minuciosa de grandes volumes de dados, modelagem dimensional e mineração para identificar causas raiz e comportamentos.': 'Thorough statistical exploration of large data volumes, dimensional modeling, and mining to identify root causes and behaviors.',
      'Data Viz & Dashboards Executivos': 'Data Viz & Executive Dashboards',
      'Modelagem dimensional e criação de relatórios interativos avançados no Power BI e SSRS.': 'Dimensional modeling and creation of advanced interactive reports in Power BI and SSRS.',
      'Design de painéis interativos de alta performance (Power BI, Looker, Streamlit) focados na visualização clara da Big Picture estratégica.': 'High-performance interactive dashboard design (Power BI, Looker, Streamlit) focused on clear strategic Big Picture visualization.',
      'Machine Learning & Analytics Preditivo': 'Machine Learning & Predictive Analytics',
      'Desenvolvimento e implantação de modelos preditivos (Classificação, Regressão, Clusterização) aplicados à antecipação de tendências e decisão rápida.': 'Development and deployment of predictive models (Classification, Regression, Clustering) applied to trend anticipation and rapid decision making.',
      'Ciência de Dados & Machine Learning': 'Data Science & Machine Learning',
      'Desenvolvimento de modelos preditivos, People Analytics e análises avançadas em Python e R.': 'Predictive model development, People Analytics, and advanced analytics in Python and R.',
      'Análise Prescritiva & Otimização': 'Prescriptive Analytics & Optimization',
      'Formulação de estratégias orientadas a dados e simulação de cenários de decisão para otimizar eficiência operacional e reduzir custos.': 'Data-driven strategy formulation and decision scenario simulation to optimize operational efficiency and reduce costs.',
      'Inteligência Artificial & Agentes LLM': 'Artificial Intelligence & LLM Agents',
      'Integração de LLMs, busca vetorial (RAG) e automações inteligentes para otimização de processos.': 'LLM integration, vector search (RAG), and intelligent automation for process optimization.',
      'Modelagem Econométrica & Quantitativa': 'Econometric & Quantitative Modeling',
      'Aplicação de econometria avançada, séries temporais e estatística em variáveis complexas para extração de insights acionáveis.': 'Application of advanced econometrics, time series, and statistics on complex variables to extract actionable insights.',
      'Análise Financeira & Econometria': 'Financial Analysis & Econometrics',
      'Modelagem estatística, projeções de receita e análises profundas de DRE e fluxo de caixa.': 'Statistical modeling, revenue projections, and in-depth P&L and cash flow analysis.',
      'Consultoria em Arquitetura de Dados & Cloud': 'Data Architecture & Cloud Consulting',
      'Assessoria especializada em modernização de Data Warehouses, migração para nuvem (GCP, Azure, AWS) e governança de dados.': 'Specialized consulting on Data Warehouse modernization, cloud migration (GCP, Azure, AWS), and data governance.',
      'Consultoria & Arquitetura de Dados': 'Data Architecture & Consulting',
      'Planejamento de infraestrutura escalável, governança de dados e migração para a nuvem.': 'Scalable infrastructure planning, data governance, and cloud migration.',
      'Desenvolvimento de APIs & Automação': 'API Development & Automation',
      'Criação de microsserviços para integração de sistemas e rotinas automatizadas de dados.': 'Creation of microservices for system integration and automated data routines.',

      // Metric Labels
      'Projetos Entregues': 'Completed Projects',
      'Em Andamento': 'Ongoing Projects',
      'Estudos & Pesquisas': 'Research & Studies',
      'Protótipos & Ideias': 'Prototypes & Ideas',
      'Cafés Consumidos': 'Cups of Coffee',
      'Horas de Engenharia': 'Engineering Hours'
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
  
  const map = translations.en.dbTranslations as Record<string, string>;
  if (!map) return text;

  const raw = text.trim();
  const normalized = raw.replace(/\s+/g, ' ');
  const cleanDot = normalized.replace(/\.+$/, '');

  // 1. Direct exact match
  if (map[raw]) return map[raw];
  if (map[normalized]) return map[normalized];
  if (map[cleanDot]) return map[cleanDot];
  if (map[text]) return map[text];

  // 2. Short role lists ONLY (e.g. "Analista de dados, Engenheiro de Dados")
  if (text.length < 85 && (text.includes(',') || text.includes(' e '))) {
    const delimiter = text.includes(',') ? ',' : ' e ';
    const joiner = delimiter === ',' ? ', ' : ' & ';
    const parts = text.split(delimiter).map(part => {
      const p = part.trim().replace(/\s+/g, ' ');
      const pClean = p.replace(/\.+$/, '');
      return map[p] || map[pClean] || p;
    });
    return parts.join(joiner) + (text.endsWith('.') ? '.' : '');
  }

  // 3. Fallback: replace phrase keys sorted by LENGTH DESCENDING (longest phrases first)
  let result = normalized;
  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key.length > 3 && result.includes(key)) {
      result = result.replaceAll(key, map[key]);
    }
  }

  return result;
}
