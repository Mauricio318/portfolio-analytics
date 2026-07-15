'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './TerminalConsole.module.css';
import { Language, translations } from '@/lib/translations';

interface TerminalConsoleProps {
  lang: Language;
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export default function TerminalConsole({ lang }: TerminalConsoleProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    // Welcome message
    setHistory([
      {
        command: 'system-init',
        output: (
          <div>
            <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>MB OS v1.0.0</p>
            <p>{t.terminalWelcome}</p>
            <p style={{ opacity: 0.7 }}>{t.terminalHelpText}</p>
          </div>
        )
      }
    ]);
  }, [lang]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

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
            <p style={{ color: '#38bdf8', fontWeight: 600 }}>{t.terminalHelpText}</p>
            <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>
              {lang === 'pt' 
                ? 'Digite qualquer um dos comandos acima para interagir com o meu portfólio.'
                : 'Type any of the commands above to interact with my portfolio.'}
            </p>
          </div>
        );
        break;
      case 'bio':
        output = (
          <div>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>Mauricio Garcia Bimbu</p>
            <p style={{ color: '#fb7185', fontWeight: 600 }}>
              {lang === 'pt' ? 'Líder de Dados | Arquiteto de Dados | Cientista de Dados' : 'Data Group Lead | Data Architect | Data Scientist'}
            </p>
            <p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
              {lang === 'pt'
                ? 'Mestrando em Ciência da Computação pela USP. Mais de 5 anos desenhando arquiteturas robustas de dados, criando pipelines ágeis e transformando bytes em inteligência real na Clicksign e Banco do Nordeste.'
                : 'Computer Science M.Sc. Student at USP. Over 5 years designing robust data architectures, building agile pipelines, and converting bytes into actual intelligence at Clicksign and Banco do Nordeste.'}
            </p>
          </div>
        );
        break;
      case 'skills':
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
                <tr>
                  <td>Python & ML</td>
                  <td>Advanced</td>
                  <td>[██████████] 95%</td>
                </tr>
                <tr>
                  <td>Power BI / SSRS</td>
                  <td>Advanced</td>
                  <td>[██████████] 95%</td>
                </tr>
                <tr>
                  <td>ETL / dbt / Airflow</td>
                  <td>Advanced</td>
                  <td>[█████████░] 90%</td>
                </tr>
                <tr>
                  <td>SQL & Databases</td>
                  <td>Advanced</td>
                  <td>[██████████] 95%</td>
                </tr>
                <tr>
                  <td>Cloud (Azure/AWS)</td>
                  <td>Very Good</td>
                  <td>[████████░░] 85%</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
        break;
      case 'projects':
        output = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>
              {lang === 'pt' ? 'Projetos de Destaque:' : 'Featured Projects:'}
            </p>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: 600 }}>1. Dashboards de Performance (IT Infrastructure)</p>
              <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>
                {lang === 'pt' ? 'Monitoramento em tempo real de infra de servidores de banco de dados.' : 'Real-time database server infrastructure monitoring dashboard.'}
              </p>
            </div>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: 600 }}>2. ETL Segurado e Ágil (Pentaho + dbt)</p>
              <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>
                {lang === 'pt' ? 'Ingestão e unificação em lote de arquivos complexos em Data Warehouse.' : 'Batch ingestion and unification of complex files into a Data Warehouse.'}
              </p>
            </div>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: 600 }}>3. Modelo Preditivo People Analytics</p>
              <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>
                {lang === 'pt' ? 'Modelo preditivo de rotatividade (turnover) utilizando regressão logística e XGBoost.' : 'Turnover predictive model using logistic regression and XGBoost.'}
              </p>
            </div>
          </div>
        );
        break;
      case 'lattes':
      case 'cv':
        output = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ color: '#a855f7', fontWeight: 'bold' }}>USP - Universidade de São Paulo</p>
            <p>• {lang === 'pt' ? 'Mestrado em Ciência da Computação (USP)' : 'M.Sc. in Computer Science (USP)'} (2024 - {lang === 'pt' ? 'Atual' : 'Present'})</p>
            <p>• MBA in Data Science & Analytics (USP) (2023 - {lang === 'pt' ? 'Atual' : 'Present'})</p>
            <p style={{ color: '#a855f7', fontWeight: 'bold', marginTop: '0.5rem' }}>UFC - Universidade Federal do Ceará</p>
            <p>• {lang === 'pt' ? 'Graduação em Ciência da Computação' : 'B.Sc. in Computer Science'} (2018 - 2023)</p>
          </div>
        );
        break;
      case 'contact':
        output = (
          <div>
            <p>• Email: <a href="mailto:mauriciozinibu@gmail.com" style={{ color: '#0284c7', textDecoration: 'underline' }}>mauriciozinibu@gmail.com</a></p>
            <p>• LinkedIn: <a href="https://www.linkedin.com/in/mauriciobimbu/" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>linkedin.com/in/mauriciobimbu/</a></p>
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
            <p style={{ color: '#10b981' }}>Optimizing query pipelines. Mauricio is officially a "pika" data architect! 🚀</p>
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
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.buttons}>
          <span className={`${styles.button} ${styles.close}`}></span>
          <span className={`${styles.button} ${styles.minimize}`}></span>
          <span className={`${styles.button} ${styles.maximize}`}></span>
        </div>
        <span className={styles.title}>{t.terminalTitle}</span>
      </div>
      <div className={styles.body} ref={bodyRef}>
        {history.map((item, index) => (
          <div key={index} style={{ marginBottom: '0.5rem' }}>
            {item.command !== 'system-init' && (
              <div className={styles.promptRow}>
                <span className={styles.promptSymbol}>$</span>
                <span className={styles.cmdText}>{item.command}</span>
              </div>
            )}
            <div className={styles.output}>{item.output}</div>
          </div>
        ))}
        
        <form onSubmit={handleCommand} className={styles.promptRow}>
          <span className={styles.promptSymbol}>$</span>
          <input 
            type="text" 
            className={styles.input} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.terminalPlaceholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
