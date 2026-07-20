'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './TerminalConsole.module.css';
import { Language, translations } from '@/lib/translations';

interface TerminalConsoleProps {
  lang: Language;
  settings?: Record<string, string>;
  skills?: any[];
  jobs?: any[];
  academic?: any[];
  portfolio?: any[];
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export default function TerminalConsole({ 
  lang, 
  settings, 
  skills, 
  jobs, 
  academic, 
  portfolio 
}: TerminalConsoleProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    // Mensagem inicial do terminal
    setHistory([
      {
        command: 'system-init',
        output: (
          <div>
            <p style={{ color: '#10b981', fontWeight: 'bold' }}>MB OS v1.0.0 (Data Engine Kernel)</p>
            <p style={{ color: '#f8fafc', margin: '0.25rem 0' }}>{t.terminalWelcome}</p>
            <p style={{ color: '#38bdf8', opacity: 0.9, fontSize: '0.82rem' }}>
              💡 {lang === 'pt' ? 'Comandos rápidos:' : 'Quick commands:'} <strong style={{ color: '#fbbf24' }}>help</strong> | <strong style={{ color: '#fbbf24' }}>bio</strong> | <strong style={{ color: '#fbbf24' }}>servicos</strong> | <strong style={{ color: '#fbbf24' }}>skills</strong> | <strong style={{ color: '#fbbf24' }}>projects</strong> | <strong style={{ color: '#fbbf24' }}>contact</strong> | <strong style={{ color: '#fbbf24' }}>clear</strong>
            </p>
          </div>
        )
      }
    ]);
  }, [lang, t.terminalWelcome]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const renderProgressBar = (pct: number) => {
    const filled = Math.round(pct / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let output: React.ReactNode = null;

    switch (cmd) {
      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'help':
        output = (
          <div>
            <p style={{ color: '#38bdf8', fontWeight: 700 }}>{t.terminalHelpText}</p>
            <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
              {lang === 'pt' 
                ? 'Digite qualquer um dos comandos acima para explorar o perfil profissional.'
                : 'Type any of the commands above to explore the professional profile.'}
            </p>
          </div>
        );
        break;

      case 'bio': {
        const nameText = settings?.name || 'Mauricio Garcia Bimbu';
        const rolesText = settings?.roles || (lang === 'pt' ? 'Engenheiro de Dados | Analista Especialista' : 'Data Engineer | Specialist Analyst');
        const bioText = settings?.bio || (lang === 'pt'
          ? 'Mestrando em Ciência da Computação pela USP. Especialista em infraestrutura, pipelines de dados e analytics.'
          : 'Computer Science M.Sc. Student at USP. Specialist in data infrastructure, pipelines and analytics.');

        output = (
          <div>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>{nameText}</p>
            <p style={{ color: '#fb7185', fontWeight: 600 }}>{rolesText}</p>
            <p style={{ marginTop: '0.5rem', lineHeight: 1.6, color: '#f8fafc' }}>{bioText}</p>
          </div>
        );
        break;
      }

      case 'skills': {
        const skillsList = skills && skills.length > 0 ? skills : [
          { name: 'Python & ML', level: 'Avançado', percentage: 95 },
          { name: 'Power BI / SSRS', level: 'Avançado', percentage: 95 },
          { name: 'ETL / dbt', level: 'Avançado', percentage: 90 },
          { name: 'SQL & Database', level: 'Avançado', percentage: 95 },
          { name: 'Cloud (Azure/AWS)', level: 'Muito bom', percentage: 85 }
        ];

        output = (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Technology</th>
                  <th>Level</th>
                  <th>Proficiency</th>
                </tr>
              </thead>
              <tbody>
                {skillsList.slice(0, 8).map((s: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ color: '#f8fafc', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: '#94a3b8' }}>{s.level}</td>
                    <td style={{ color: '#10b981', fontFamily: 'monospace' }}>{renderProgressBar(s.percentage || 80)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      }

      case 'projects': {
        const projectsList = portfolio && portfolio.length > 0 ? portfolio : [
          { title: 'Dashboards de Performance', description: 'Monitoramento em tempo real de infra de servidores de banco de dados.' },
          { title: 'ETL Segurado e Ágil', description: 'Ingestão e unificação em lote de arquivos complexos em Data Warehouse.' },
          { title: 'Modelo Preditivo People Analytics', description: 'Modelo preditivo de rotatividade (turnover).' }
        ];

        output = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>
              {lang === 'pt' ? 'Projetos de Destaque:' : 'Featured Projects:'}
            </p>
            {projectsList.slice(0, 6).map((p: any, i: number) => (
              <div key={i}>
                <p style={{ color: '#f59e0b', fontWeight: 600 }}>{i + 1}. {p.title}</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{p.description}</p>
              </div>
            ))}
          </div>
        );
        break;
      }

      case 'lattes':
      case 'cv': {
        const acadList = academic && academic.length > 0 ? academic : [
          { title: 'Mestrado em Ciência da Computação', institution: 'Universidade de São Paulo (USP)', start_date: '2024', end_date: 'Atual' },
          { title: 'MBA em Data Science e Analytics', institution: 'Universidade de São Paulo (USP)', start_date: '2023', end_date: 'Atual' },
          { title: 'Especialização em Big Data (Ciência de Dados)', institution: 'Faculdade Iguaçu', start_date: '2023', end_date: '2023' },
          { title: 'Graduação em Ciência da Computação', institution: 'Universidade Federal do Ceará (UFC)', start_date: '2018', end_date: '2023' }
        ];

        output = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <p style={{ color: '#c084fc', fontWeight: 'bold' }}>
              {lang === 'pt' ? 'Formação & Qualificações:' : 'Academic & Qualifications:'}
            </p>
            {acadList.map((item: any, idx: number) => (
              <p key={idx} style={{ color: '#f8fafc' }}>
                • <strong style={{ color: '#38bdf8' }}>{item.title || item.title_pt}</strong> - {item.institution || item.subtitle_pt} ({item.start_date || item.period || ''}{item.end_date ? ` - ${item.end_date}` : ''})
              </p>
            ))}
          </div>
        );
        break;
      }

      case 'contact': {
        const email = settings?.contact_email || settings?.email || 'mauriciozinibu@gmail.com';
        const linkedin = settings?.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/';

        output = (
          <div style={{ color: '#f8fafc' }}>
            <p>• Email: <a href={`mailto:${email}`} style={{ color: '#38bdf8', textDecoration: 'underline' }}>{email}</a></p>
            <p>• LinkedIn: <a href={linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>{linkedin}</a></p>
          </div>
        );
        break;
      }

      case 'servicos':
      case 'services':
        output = (
          <div style={{ color: '#f8fafc' }}>
            <p style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🛠️ {lang === 'pt' ? 'Serviços de Dados & Analytics oferecidos:' : 'Data & Analytics Services Offered:'}
            </p>
            <p>• <strong style={{ color: '#38bdf8' }}>Descriptive Analysis:</strong> {lang === 'pt' ? 'Técnicas estatísticas para descrever, organizar e sumarizar dados.' : 'Statistical techniques to describe, organize and summarize datasets.'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Diagnostic Analysis:</strong> {lang === 'pt' ? 'Análise avançada, data mining e correlações para responder "Por que aconteceu?".' : 'Advanced analysis, data mining and correlations to answer "Why did it happen?".'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Machine Learning (Predictive):</strong> {lang === 'pt' ? 'Modelos preditivos para antecipar tendências e fatos futuros.' : 'Predictive ML models analyzing historical facts to forecast future events.'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Prescriptive Analysis:</strong> {lang === 'pt' ? 'Definição da melhor estratégia de ações com base nos dados.' : 'Define optimal action strategies based on available data.'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Econometric Analysis:</strong> {lang === 'pt' ? 'Ferramentas estatísticas em variáveis econômicas.' : 'Statistical tools and Data Science applied to economic variables.'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Data Visualization & Dashboards:</strong> {lang === 'pt' ? 'Gráficos e dashboards responsivos e interativos (Big Picture).' : 'Responsive, interactive dashboards providing the Big Picture.'}</p>
            <p>• <strong style={{ color: '#38bdf8' }}>Consultancy:</strong> {lang === 'pt' ? 'Apoio especializado para definição e resolução de problemas de dados.' : 'Specialized support for data problem definition and architectural resolution.'}</p>
          </div>
        );
        break;

      case 'sudo hack':
      case 'sudo':
        output = (
          <div style={{ color: '#f43f5e' }}>
            <p>[sudo] password for bimbus: **********</p>
            <p style={{ color: '#10b981', marginTop: '0.25rem' }}>✓ Access granted. Initializing system scan...</p>
            <p style={{ color: '#eab308' }}>WARNING: Extreme capacity metrics detected in server capacity report.</p>
            <p style={{ color: '#10b981' }}>Optimizing query pipelines. Mauricio is officially a data architect! 🚀</p>
          </div>
        );
        break;

      default:
        output = <p style={{ color: '#ef4444' }}>{t.terminalUnknown}</p>;
    }

    setHistory(prev => [...prev, { command: input, output }]);
    setInput('');
  };

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </div>
        <span className={styles.title}>{t.terminalTitle}</span>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {history.map((item, idx) => (
          <div key={idx} className={styles.historyItem}>
            {item.command !== 'system-init' && (
              <div className={styles.promptLine}>
                <span className={styles.promptUser}>bimbus@mauricio-pc</span>
                <span className={styles.promptSymbol}>:~$</span>
                <span className={styles.commandText}>{item.command}</span>
              </div>
            )}
            <div className={styles.outputContent}>{item.output}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className={styles.inputForm}>
        <span className={styles.promptUser}>bimbus@mauricio-pc</span>
        <span className={styles.promptSymbol}>:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t.terminalPlaceholder}
          className={styles.input}
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
