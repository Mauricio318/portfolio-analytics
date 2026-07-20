'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #0f172a)', color: 'var(--text-main, #f8fafc)', padding: '1.5rem' }}>
      <div style={{ padding: '2.25rem', background: 'var(--bg-secondary, #1e293b)', borderRadius: '14px', border: '1px solid var(--border, rgba(255,255,255,0.1))', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px', position: 'relative' }}>
        
        {/* Header com Ícone e Título */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow, rgba(37, 99, 235, 0.15))', color: 'var(--accent, #3b82f6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>Painel Administrativo</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.35rem' }}>Digite sua senha para acessar o painel de controle</p>
        </div>

        {error && (
          <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.25rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #f8fafc)' }}>Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border, rgba(255,255,255,0.2))', background: 'var(--bg-main, #0f172a)', color: 'var(--text-main, #fff)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              placeholder="••••••••"
              autoComplete="off"
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '0.8rem', 
              background: 'var(--accent, #2563eb)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Entrar no Painel
          </button>
        </form>

        {/* Divisor Visual */}
        <div style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.1))', margin: '1.5rem 0 1.25rem 0' }} />

        {/* Botão de Voltar ao Portfólio */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, rgba(255,255,255,0.15))',
            background: 'var(--bg-main, rgba(255,255,255,0.03))',
            color: 'var(--text-main, #f8fafc)',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent, #3b82f6)';
            e.currentTarget.style.color = 'var(--accent, #3b82f6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.15))';
            e.currentTarget.style.color = 'var(--text-main, #f8fafc)';
          }}
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Portfólio Principal</span>
        </a>

      </div>
    </div>
  );
}
