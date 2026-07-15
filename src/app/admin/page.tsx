import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const db = getDb();
  
  const skillsCount = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number };
  const jobsCount = db.prepare('SELECT COUNT(*) as count FROM resume_items WHERE type = ?').get('job') as { count: number };
  const coursesCount = db.prepare('SELECT COUNT(*) as count FROM resume_items WHERE type = ?').get('course') as { count: number };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#111827' }}>Visão Geral</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Habilidades Cadastradas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{skillsCount?.count || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Experiências (Jobs)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{jobsCount?.count || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Cursos/Certificados</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{coursesCount?.count || 0}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>Gerenciar Conteúdo</h2>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>O banco SQLite local já foi inicializado com os dados de Mauricio Garcia Bimbu. Aqui você poderá editar os dados no futuro.</p>
        <p style={{ color: '#4b5563' }}>Nota: Para esta versão inicial, a interface foca no painel base, na autenticação e na vitrine do portfólio para os visitantes.</p>
      </div>
    </div>
  );
}
