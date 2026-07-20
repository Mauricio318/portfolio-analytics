'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileJson, 
  Cpu, 
  Database, 
  Award, 
  Play, 
  CheckCircle, 
  RefreshCw,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import styles from './EtlSimulator.module.css';
import { Language, translations } from '@/lib/translations';

interface EtlSimulatorProps {
  lang: Language;
}

type Step = 'idle' | 'bronze' | 'silver' | 'gold' | 'finished';
type TabLayer = 'gold' | 'silver' | 'bronze';

interface LogMessage {
  text: string;
  type: 'info' | 'bronze' | 'silver' | 'gold' | 'success';
  timestamp: string;
}

export default function EtlSimulator({ lang }: EtlSimulatorProps) {
  const [step, setStep] = useState<Step>('idle');
  const [activeTab, setActiveTab] = useState<TabLayer>('gold');
  const [showInspector, setShowInspector] = useState<boolean>(false);
  
  // Dynamic metrics state (starts at 0, moves during pipeline execution)
  const [processedRows, setProcessedRows] = useState<number>(0);
  const [dqScore, setDqScore] = useState<number>(0);
  const [throughput, setThroughput] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);

  const [logs, setLogs] = useState<LogMessage[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Real-time counter effect for Processed Rows (increments in multiples of 10)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step !== 'idle' && step !== 'finished') {
      timer = setInterval(() => {
        setProcessedRows(prev => {
          const increment = 240; // Step size divisible by 10 (24 * 10)
          const next = prev + increment;
          if (next >= 94280) {
            clearInterval(timer);
            return 94280;
          }
          return Math.floor(next / 10) * 10;
        });
      }, 15);
    }
    return () => clearInterval(timer);
  }, [step]);

  const addLog = (text: string, type: LogMessage['type']) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { text, type, timestamp: timeStr }]);
  };

  const runPipeline = () => {
    setStep('bronze');
    setLogs([]);
    setProcessedRows(0);
    setDqScore(0);
    setThroughput(0);
    setLatency(0);

    const timeline = [
      // BRONZE STAGE (EXTRAIR)
      { 
        delay: 100, 
        text: `${t.etlLogStart} ${new Date().toLocaleTimeString()}...`, 
        type: 'info', 
        stage: 'bronze', 
        rows: 15400, 
        dq: 95.10, 
        speed: 4.2, 
        ms: 4 
      },
      { 
        delay: 800, 
        text: '[BRONZE] Ingesting raw JSON streaming payload from API Gateway...', 
        type: 'bronze', 
        stage: 'bronze', 
        rows: 32000, 
        dq: 97.40, 
        speed: 6.8, 
        ms: 7 
      },
      { 
        delay: 1600, 
        text: '[BRONZE] Ingested 94,280 raw JSON objects into Data Lake (gs://lakehouse/bronze/)', 
        type: 'bronze', 
        stage: 'bronze', 
        rows: 64000, 
        dq: 98.60, 
        speed: 9.4, 
        ms: 10 
      },

      // SILVER STAGE (TRANSFORMAR)
      { 
        delay: 2500, 
        text: '[SILVER] Running dbt & PySpark: filtering nulls, schema validation & PII SHA-256 masking...', 
        type: 'silver', 
        stage: 'silver', 
        rows: 88000, 
        dq: 99.50, 
        speed: 11.2, 
        ms: 12 
      },
      { 
        delay: 3400, 
        text: '[SILVER] Conformed Parquet tables created at gs://lakehouse/silver/fact_events/', 
        type: 'silver', 
        stage: 'silver', 
        rows: 94280, 
        dq: 99.85, 
        speed: 12.0, 
        ms: 13 
      },

      // GOLD STAGE (CARREGAR)
      { 
        delay: 4300, 
        text: '[GOLD] Loading BigQuery DW Star Schema (dim_customers, fact_events_hourly)...', 
        type: 'gold', 
        stage: 'gold', 
        rows: 94280, 
        dq: 99.98, 
        speed: 12.5, 
        ms: 14 
      },
      { 
        delay: 5100, 
        text: '[GOLD] Materialized DW Tables: 94,280 clean rows transformed | Latency = 14ms.', 
        type: 'gold', 
        stage: 'gold', 
        rows: 94280, 
        dq: 99.98, 
        speed: 12.5, 
        ms: 14 
      },

      // SUCCESS (VISUALIZAR)
      { 
        delay: 6000, 
        text: '✅ [SUCCESS] Pipeline execution completed! 94,280 clean records loaded into DW.', 
        type: 'success', 
        stage: 'finished', 
        rows: 94280, 
        dq: 99.98, 
        speed: 12.5, 
        ms: 14 
      }
    ];

    timeline.forEach(item => {
      setTimeout(() => {
        addLog(item.text, item.type as any);
        if (item.stage) {
          setStep(item.stage as Step);
        }
        if (item.rows !== undefined) setProcessedRows(item.rows);
        if (item.dq !== undefined) setDqScore(item.dq);
        if (item.speed !== undefined) setThroughput(item.speed);
        if (item.ms !== undefined) setLatency(item.ms);
      }, item.delay);
    });
  };

  const getStatusText = () => {
    switch (step) {
      case 'idle': return t.etlStatusIdle;
      case 'bronze': return t.etlStatusExtracting;
      case 'silver': return t.etlStatusTransforming;
      case 'gold': return t.etlStatusLoading;
      case 'finished': return t.etlStatusFinished;
    }
  };

  const bronzeJsonSample = `{
  "event_id": "evt_98410294812",
  "timestamp": "2026-07-19T22:00:15Z",
  "customer_email": "m.bimbu.eng@domain.com",
  "payload_bytes": 4500,
  "status": "PROCESSED"
}`;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h3 className={styles.title}>{t.etlTitle}</h3>
        <p className={styles.subtitle}>{t.etlSubtitle}</p>
      </div>

      {/* Visual Medallion Architecture DAG */}
      <div className={styles.dagContainer}>
        {/* Node 1: JSON */}
        <div className={styles.node}>
          <div 
            className={styles.nodeIcon}
            style={{
              color: step === 'bronze' ? '#d97706' : (step !== 'idle' ? '#d97706' : 'var(--text-muted)'),
              borderColor: step === 'bronze' ? '#d97706' : (step !== 'idle' ? '#d97706' : 'var(--border)'),
              boxShadow: step === 'bronze' ? '0 0 18px rgba(217, 119, 6, 0.6)' : (step !== 'idle' ? '0 0 10px rgba(217, 119, 6, 0.3)' : 'none'),
              background: step !== 'idle' ? 'rgba(217, 119, 6, 0.15)' : 'var(--bg-secondary)',
              transform: step === 'bronze' ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <FileJson size={22} />
          </div>
          <span style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: step !== 'idle' ? '#d97706' : 'var(--text-main)' }}>
            JSON
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.15rem' }}>
            Extrair
          </span>
        </div>

        {/* Connector 1 */}
        <div 
          className={styles.connector}
          style={{
            background: step !== 'idle' ? 'linear-gradient(90deg, #d97706, #475569)' : 'var(--border)',
            height: '3px'
          }} 
        />

        {/* Node 2: dbt / Spark */}
        <div className={styles.node}>
          <div 
            className={styles.nodeIcon}
            style={{
              color: step === 'silver' ? '#334155' : (['silver', 'gold', 'finished'].includes(step) ? '#475569' : 'var(--text-muted)'),
              borderColor: step === 'silver' ? '#334155' : (['silver', 'gold', 'finished'].includes(step) ? '#475569' : 'var(--border)'),
              boxShadow: step === 'silver' ? '0 0 18px rgba(71, 85, 105, 0.7)' : (['silver', 'gold', 'finished'].includes(step) ? '0 0 10px rgba(71, 85, 105, 0.3)' : 'none'),
              background: ['silver', 'gold', 'finished'].includes(step) ? 'rgba(71, 85, 105, 0.15)' : 'var(--bg-secondary)',
              transform: step === 'silver' ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <Cpu size={22} />
          </div>
          <span style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: ['silver', 'gold', 'finished'].includes(step) ? '#334155' : 'var(--text-main)' }}>
            dbt / Spark
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.15rem' }}>
            Transformar
          </span>
        </div>

        {/* Connector 2 */}
        <div 
          className={styles.connector}
          style={{
            background: ['silver', 'gold', 'finished'].includes(step) ? 'linear-gradient(90deg, #475569, #ca8a04)' : 'var(--border)',
            height: '3px'
          }} 
        />

        {/* Node 3: Data Lake */}
        <div className={styles.node}>
          <div 
            className={styles.nodeIcon}
            style={{
              color: step === 'gold' ? '#ca8a04' : (['gold', 'finished'].includes(step) ? '#ca8a04' : 'var(--text-muted)'),
              borderColor: step === 'gold' ? '#ca8a04' : (['gold', 'finished'].includes(step) ? '#ca8a04' : 'var(--border)'),
              boxShadow: step === 'gold' ? '0 0 18px rgba(202, 138, 4, 0.7)' : (['gold', 'finished'].includes(step) ? '0 0 10px rgba(202, 138, 4, 0.3)' : 'none'),
              background: ['gold', 'finished'].includes(step) ? 'rgba(202, 138, 4, 0.15)' : 'var(--bg-secondary)',
              transform: step === 'gold' ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <Database size={22} />
          </div>
          <span style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: ['gold', 'finished'].includes(step) ? '#ca8a04' : 'var(--text-main)' }}>
            Data Lake
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.15rem' }}>
            Carregar
          </span>
        </div>

        {/* Connector 3 */}
        <div 
          className={styles.connector}
          style={{
            background: step === 'finished' ? 'linear-gradient(90deg, #ca8a04, #059669)' : 'var(--border)',
            height: '3px'
          }} 
        />

        {/* Node 4: DW */}
        <div className={styles.node}>
          <div 
            className={styles.nodeIcon}
            style={{
              color: step === 'finished' ? '#059669' : 'var(--text-muted)',
              borderColor: step === 'finished' ? '#059669' : 'var(--border)',
              boxShadow: step === 'finished' ? '0 0 18px rgba(5, 150, 105, 0.7)' : 'none',
              background: step === 'finished' ? 'rgba(5, 150, 105, 0.15)' : 'var(--bg-secondary)',
              transform: step === 'finished' ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <Award size={22} />
          </div>
          <span style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: step === 'finished' ? '#059669' : 'var(--text-main)' }}>
            DW
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.15rem' }}>
            Visualizar
          </span>
        </div>
      </div>

      {/* Controls Area */}
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

        <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}>
          Status: <span style={{ color: step === 'finished' ? '#059669' : 'var(--accent)' }}>{getStatusText()}</span>
        </div>
      </div>

      {/* Dynamic Animated Data Engineering Metrics Cards */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #d97706', borderRadius: '10px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Activity size={15} color="#d97706" /> {t.etlMetricRows}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', marginTop: '0.3rem' }}>
            {processedRows > 0 ? `${processedRows.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')} ${t.etlUnitRows}` : `0 ${t.etlUnitRows}`}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #059669', borderRadius: '10px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <ShieldCheck size={15} color="#059669" /> {t.etlMetricQuality}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '0.3rem' }}>
            {dqScore > 0 ? `${dqScore.toFixed(2)}% ${t.etlUnitNoNulls}` : `0.00%`}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #0284c7', borderRadius: '10px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Zap size={15} color="#0284c7" /> {t.etlMetricThroughput}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: '0.3rem' }}>
            {throughput > 0 ? `${throughput.toFixed(1)} MB/s (~45k/s)` : '0.0 MB/s'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #7e22ce', borderRadius: '10px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Zap size={15} color="#7e22ce" /> {t.etlMetricLatency}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7e22ce', marginTop: '0.3rem' }}>
            {latency > 0 ? `${latency} ms` : '0 ms'}
          </div>
        </div>
      </div>

      {/* Optional Compact Data Inspector Toggle */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowInspector(!showInspector)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          {showInspector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showInspector ? 'Ocultar Inspetor de Payloads (Bronze / Silver)' : 'Ver Amostra de Payloads (Bronze / Silver)'}
        </button>
      </div>

      {showInspector && (
        <div style={{ marginTop: '1rem', background: '#090d16', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('bronze')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid ' + (activeTab === 'bronze' ? '#f59e0b' : '#334155'),
                background: activeTab === 'bronze' ? 'rgba(245, 158, 11, 0.2)' : '#0f172a',
                color: activeTab === 'bronze' ? '#f59e0b' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🥉 Bronze JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('silver')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid ' + (activeTab === 'silver' ? '#38bdf8' : '#334155'),
                background: activeTab === 'silver' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                color: activeTab === 'silver' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🥈 Silver Table
            </button>
          </div>

          {activeTab === 'bronze' ? (
            <pre style={{ margin: 0, color: '#f59e0b', fontSize: '0.8rem', fontFamily: 'monospace', maxHeight: '140px', overflowY: 'auto', lineHeight: 1.6 }}>
              {bronzeJsonSample}
            </pre>
          ) : (
            <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', lineHeight: 1.7, color: '#f8fafc' }}>
              <div style={{ color: '#38bdf8', fontWeight: 800, marginBottom: '0.25rem' }}>[Schema Delta/Parquet]</div>
              <div><span style={{ color: '#10b981', fontWeight: 700 }}>• event_id:</span> STRING <span style={{ color: '#64748b' }}>|</span> <span style={{ color: '#10b981', fontWeight: 700 }}>status:</span> PROCESSED</div>
              <div><span style={{ color: '#10b981', fontWeight: 700 }}>• customer_hash:</span> <span style={{ color: '#c084fc' }}>sha256("m.bimbu***")</span> 🔒</div>
              <div><span style={{ color: '#10b981', fontWeight: 700 }}>• timestamp_utc:</span> <span style={{ color: '#fbbf24' }}>2026-07-19T22:00:15Z</span></div>
            </div>
          )}
        </div>
      )}

      {/* Live Log Console */}
      {(logs.length > 0 || step !== 'idle') && (
        <div className={styles.console} ref={consoleRef} style={{ marginTop: '1.5rem', height: '140px' }}>
          {logs.map((log, index) => {
            let typeClass = styles.logInfo;
            if (log.type === 'bronze') typeClass = styles.logExtract;
            if (log.type === 'silver') typeClass = styles.logTransform;
            if (log.type === 'gold') typeClass = styles.logLoad;
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
    </div>
  );
}
