'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Evita erro de hidratação (SSR vs CSR no theme)
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{width: 36, height: 36}} />;

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      style={{
        background: 'transparent', // adaptável via globals.css
        border: '1px solid var(--border)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-main)',
        transition: 'all 0.2s ease'
      }}
      aria-label="Alternar Tema"
    >
      {currentTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
