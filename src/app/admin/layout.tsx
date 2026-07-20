'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const getLinkStyle = (path: string): React.CSSProperties => {
    const isActive = pathname === path;
    return {
      color: isActive ? '#fff' : 'var(--text-muted)',
      textDecoration: 'none',
      padding: '0.6rem 0.9rem',
      backgroundColor: isActive ? 'var(--accent)' : 'transparent',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      display: 'block',
      whiteSpace: 'nowrap',
      fontSize: '0.9rem',
      fontWeight: isActive ? 600 : 500,
    };
  };

  if (isLoginPage) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <aside style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-main)' }}>Painel Admin</h2>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <a href="/admin" style={getLinkStyle('/admin')}>Dashboard</a>
          <a href="/admin/portfolio" style={getLinkStyle('/admin/portfolio')}>Projetos</a>
          <a href="/admin/servicos" style={getLinkStyle('/admin/servicos')}>Serviços & Métricas</a>
          <a href="/admin/resume" style={getLinkStyle('/admin/resume')}>Currículo</a>
          <a href="/admin/academico" style={getLinkStyle('/admin/academico')}>Lattes Acadêmico</a>
          <a href="/admin/artigos" style={getLinkStyle('/admin/artigos')}>📰 Artigos & Blog</a>
          <a href="/admin/skills" style={getLinkStyle('/admin/skills')}>Habilidades</a>
          <a href="/admin/stats" style={getLinkStyle('/admin/stats')}>📊 Estatísticas</a>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '0.6rem 0.9rem', borderLeft: '1px solid var(--border)', marginLeft: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.9rem' }} target="_blank">Ver Site ↗</a>
          <form method="POST" action="/api/auth/logout" style={{ display: 'inline' }}>
            <button type="submit" style={{ padding: '0.6rem 1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
              Sair
            </button>
          </form>
          <div style={{ display: 'inline-flex', paddingLeft: '0.5rem' }}>
            <ThemeToggle />
          </div>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
