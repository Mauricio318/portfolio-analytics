'use client';
import { useState, useEffect } from 'react';

interface VisitStats {
  total: number;
  byCountry: { country: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byBrowser: { browser: string; count: number }[];
  recent: { id: number; country: string; city: string; device: string; browser: string; referrer: string; visited_at: string }[];
}

export default function StatsAdmin() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const barRow = (label: string, count: number, total: number, color: string) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div key={label} style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
          <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
        </div>
        <div style={{ background: 'var(--bg-main)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '999px', transition: 'width 1s ease' }} />
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>⏳ Carregando estatísticas...</div>;
  if (!stats) return <div style={{ padding: '2rem', color: '#ef4444' }}>❌ Erro ao carregar estatísticas.</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>📊 Estatísticas de Visitas</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Dados coletados automaticamente de cada visitante do portfólio.
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total de Visitas', value: stats.total, emoji: '👁️', color: '#6366f1' },
          { label: 'Países Diferentes', value: stats.byCountry.length, emoji: '🌍', color: '#0ea5e9' },
          { label: 'Tipos de Dispositivo', value: stats.byDevice.length, emoji: '📱', color: '#10b981' },
          { label: 'Navegadores', value: stats.byBrowser.length, emoji: '🌐', color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem 1.5rem', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>{c.emoji}</div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: c.color }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>🌍 Visitas por País</h3>
          {stats.byCountry.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma visita registrada ainda.</p>
            : stats.byCountry.slice(0, 8).map(r => barRow(r.country, r.count, stats.total, '#0ea5e9'))
          }
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>📱 Dispositivos</h3>
          {stats.byDevice.map(r => barRow(r.device, r.count, stats.total, '#10b981'))}
          <h3 style={{ margin: '1.5rem 0 1rem', color: 'var(--text-main)', fontSize: '1rem' }}>🌐 Navegadores</h3>
          {stats.byBrowser.map(r => barRow(r.browser, r.count, stats.total, '#f59e0b'))}
        </div>
      </div>

      {/* Recent Visits Table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>🕐 Últimas 20 Visitas</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['#', 'País', 'Cidade', 'Dispositivo', 'Navegador', 'Origem', 'Data/Hora'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recent.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma visita registrada ainda.</td></tr>
              ) : stats.recent.map((v, i) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-main)' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{v.id}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 500 }}>{v.country}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{v.city}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 500 }}>{v.device}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 500 }}>{v.browser}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.referrer}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(v.visited_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
