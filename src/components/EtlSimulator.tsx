'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Cpu, 
  Database as DbIcon, 
  BarChart2, 
  Play, 
  CheckCircle, 
  RefreshCw 
} from 'lucide-react';
import styles from './EtlSimulator.module.css';
import { Language, translations } from '@/lib/translations';

interface EtlSimulatorProps {
  lang: Language;
}

type Step = 'idle' | 'extracting' | 'transforming' | 'loading' | 'analyzing' | 'finished';

interface LogMessage {
  text: string;
  type: 'info' | 'extract' | 'transform' | 'load' | 'success';
  timestamp: string;
}

export default function EtlSimulator({ lang }: EtlSimulatorProps) {
  const [step, setStep] = useState<Step>('idle');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: LogMessage['type']) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { text, type, timestamp: timeStr }]);
  };

  const runPipeline = () => {
    setStep('extracting');
    setLogs([]);
    
    // Sequence of steps with logs
    const timeline = [
      // EXTRACT STAGE
      { delay: 100, text: `${t.etlLogStart} ${new Date().toLocaleTimeString()}...`, type: 'info', stage: 'extracting' },
      { delay: 800, text: 'EXTRACT: Reading local directory "old_version/pdf/cv/"...', type: 'extract', stage: 'extracting' },
      { delay: 1500, text: 'EXTRACT: Found files: "Curriculo_Lattes.pdf", "Mauricio_Garcia_Bimbu.pdf"', type: 'extract', stage: 'extracting' },
      { delay: 2200, text: 'EXTRACT: Invoking pdf2json parser for extraction...', type: 'extract', stage: 'extracting' },
      { delay: 2800, text: 'EXTRACT: Extracted 24,800 characters of raw curriculum text.', type: 'extract', stage: 'extracting' },
      
      // TRANSFORM STAGE
      { delay: 3500, text: 'TRANSFORM: Starting data preparation with Python...', type: 'transform', stage: 'transforming' },
      { delay: 4200, text: 'TRANSFORM: Cleaning special characters and fixing unicode formats.', type: 'transform', stage: 'transforming' },
      { delay: 4800, text: 'TRANSFORM: Mapping experiences to JSON structure: 5 jobs, 3 degrees, 6 certificates.', type: 'transform', stage: 'transforming' },
      { delay: 5500, text: 'TRANSFORM: Executing local dbt models to structure data relationships...', type: 'transform', stage: 'transforming' },
      
      // LOAD STAGE
      { delay: 6200, text: 'LOAD: Connecting to SQLite relational database (portfolio.db)...', type: 'load', stage: 'loading' },
      { delay: 6800, text: 'LOAD: Executing transactional script "inject-cv-data.js"...', type: 'load', stage: 'loading' },
      { delay: 7500, text: 'LOAD: Loaded 6 skills, 5 jobs, 6 courses into respective tables. Done.', type: 'load', stage: 'loading' },
      
      // ANALYZE STAGE
      { delay: 8200, text: 'ANALYZE: Reindexing SQLite FTS5 search index...', type: 'info', stage: 'analyzing' },
      { delay: 8800, text: 'ANALYZE: Generating capability monitoring aggregates for portfolio dashboard...', type: 'info', stage: 'analyzing' },
      { delay: 9400, text: 'SUCCESS: Pipeline executed successfully! Status: 200 OK.', type: 'success', stage: 'finished' }
    ];

    timeline.forEach(item => {
      setTimeout(() => {
        addLog(item.text, item.type as any);
        if (item.stage) {
          setStep(item.stage as Step);
        }
      }, item.delay);
    });
  };

  const getStatusText = () => {
    switch (step) {
      case 'idle': return t.etlStatusIdle;
      case 'extracting': return t.etlStatusExtracting;
      case 'transforming': return t.etlStatusTransforming;
      case 'loading': return t.etlStatusLoading;
      case 'analyzing': return 'Reindexando banco e gerando agregados...';
      case 'finished': return t.etlStatusFinished;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h3 className={styles.title}>{t.etlTitle}</h3>
        <p className={styles.subtitle}>{t.etlSubtitle}</p>
      </div>

      {/* Visual DAG Graph */}
      <div className={styles.dagContainer}>
        {/* Node 1: Extract */}
        <div className={`${styles.node} ${step === 'extracting' ? styles.nodeActive : ''} ${(step !== 'idle' && step !== 'extracting') ? styles.nodeSuccess : ''}`}>
          <div className={styles.nodeIcon}>
            <FileText size={24} />
          </div>
          <span className={styles.nodeLabel}>
            {lang === 'pt' ? 'Extrair (Lattes)' : 'Extract (Lattes)'}
          </span>
        </div>

        {/* Connector 1 */}
        <div className={`${styles.connector} ${step !== 'idle' ? styles.connectorActive : ''}`} />

        {/* Node 2: Transform */}
        <div className={`${styles.node} ${step === 'transforming' ? styles.nodeActive : ''} ${(['loading', 'analyzing', 'finished'].includes(step)) ? styles.nodeSuccess : ''}`}>
          <div className={styles.nodeIcon}>
            <Cpu size={24} />
          </div>
          <span className={styles.nodeLabel}>
            {lang === 'pt' ? 'Transformar (dbt)' : 'Transform (dbt)'}
          </span>
        </div>

        {/* Connector 2 */}
        <div className={`${styles.connector} ${['transforming', 'loading', 'analyzing', 'finished'].includes(step) ? styles.connectorActive : ''}`} />

        {/* Node 3: Load */}
        <div className={`${styles.node} ${step === 'loading' ? styles.nodeActive : ''} ${(['analyzing', 'finished'].includes(step)) ? styles.nodeSuccess : ''}`}>
          <div className={styles.nodeIcon}>
            <DbIcon size={24} />
          </div>
          <span className={styles.nodeLabel}>
            {lang === 'pt' ? 'Carregar (SQLite)' : 'Load (SQLite)'}
          </span>
        </div>

        {/* Connector 3 */}
        <div className={`${styles.connector} ${['loading', 'analyzing', 'finished'].includes(step) ? styles.connectorActive : ''}`} />

        {/* Node 4: Analyze */}
        <div className={`${styles.node} ${step === 'analyzing' ? styles.nodeActive : ''} ${step === 'finished' ? styles.nodeSuccess : ''}`}>
          <div className={styles.nodeIcon}>
            <BarChart2 size={24} />
          </div>
          <span className={styles.nodeLabel}>
            {lang === 'pt' ? 'Visualizar (Metrics)' : 'Visualize (Metrics)'}
          </span>
        </div>
      </div>

      {/* Button controls */}
      <div className={styles.controlArea}>
        <button 
          onClick={runPipeline} 
          disabled={step !== 'idle' && step !== 'finished'} 
          className={styles.runBtn}
        >
          {step === 'idle' && (
            <>
              <Play size={18} fill="currentColor" /> {t.etlRunBtn}
            </>
          )}
          {step !== 'idle' && step !== 'finished' && (
            <>
              <RefreshCw size={18} className="animate-spin" /> {t.etlRunningBtn}
            </>
          )}
          {step === 'finished' && (
            <>
              <CheckCircle size={18} /> {t.etlSuccessBtn}
            </>
          )}
        </button>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          Status: <span style={{ color: step === 'finished' ? '#10b981' : 'var(--accent)' }}>{getStatusText()}</span>
        </div>
      </div>

      {/* Live Log Console */}
      {(logs.length > 0 || step !== 'idle') && (
        <div className={styles.console} ref={consoleRef}>
          {logs.map((log, index) => {
            let typeClass = styles.logInfo;
            if (log.type === 'extract') typeClass = styles.logExtract;
            if (log.type === 'transform') typeClass = styles.logTransform;
            if (log.type === 'load') typeClass = styles.logLoad;
            if (log.type === 'success') typeClass = styles.logSuccess;

            return (
              <div key={index} className={styles.logLine}>
                <span style={{ color: '#64748b', marginRight: '0.5rem' }}>[{log.timestamp}]</span>
                <span className={typeClass}>{log.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulation dashboard widgets unlocked on success */}
      {step === 'finished' && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{t.etlMetricVolume}</div>
            <div className={styles.metricValue}>24.8 KB</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{t.etlMetricSpeed}</div>
            <div className={styles.metricValue}>496 KB/s</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{t.etlMetricError}</div>
            <div className={styles.metricValue} style={{ color: '#10b981' }}>0.00%</div>
          </div>
        </div>
      )}
    </div>
  );
}
