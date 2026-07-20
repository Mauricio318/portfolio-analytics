import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const db = getDb();
  
  const skillsCount = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number };
  const jobsCount = db.prepare('SELECT COUNT(*) as count FROM resume_items WHERE type = ?').get('job') as { count: number };
  const coursesCount = db.prepare('SELECT COUNT(*) as count FROM resume_items WHERE type = ?').get('course') as { count: number };
  const academicCount = db.prepare('SELECT COUNT(*) as count FROM academic_sections').get() as { count: number };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Visão Geral</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Habilidades Cadastradas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{skillsCount?.count || 0}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Experiências (Jobs)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{jobsCount?.count || 0}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Cursos/Certificados</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{coursesCount?.count || 0}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Seções Acadêmicas (Lattes)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{academicCount?.count || 0}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Gerenciar Conteúdo</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>O banco SQLite local já está populado com as informações do seu portfólio e currículo Lattes acadêmico.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/portfolio" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Gerenciar Projetos</a>
          <a href="/admin/resume" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Gerenciar Trajetória</a>
          <a href="/admin/academico" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', backgroundColor: '#f59e0b', color: '#fff', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Gerenciar Lattes Acadêmico</a>
        </div>
      </div>
    </div>
  );
}
