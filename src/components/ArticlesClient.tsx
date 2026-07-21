'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  Settings, 
  Newspaper
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Language, translateDbString } from '@/lib/translations';

interface ArticleItem {
  id: number;
  title: string;
  description?: string;
  url: string;
  publisher?: string;
  category?: string;
  publish_date?: string;
  read_time?: string;
  tags?: string;
  image_url?: string;
  is_featured?: number;
  card_size?: string;
}

interface ArticlesClientProps {
  initialSettings: Record<string, string>;
  initialArticles: ArticleItem[];
}

export default function ArticlesClient({ initialSettings, initialArticles }: ArticlesClientProps) {
  const [lang, setLang] = useState<Language>('pt');
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    const systemLang = navigator.language || (navigator as any).userLanguage || 'pt';
    const parsedLang: Language = systemLang.toLowerCase().startsWith('en') ? 'en' : 'pt';
    setLang(parsedLang);

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: '/artigos' })
    }).catch(() => {});
  }, []);

  const defaultArticles: ArticleItem[] = [
    {
      id: 1,
      title: 'Arquitetura Medallion: Como Estruturar Data Lakes de Alta Performance',
      publisher: 'Medium',
      category: 'Engenharia & Arquitetura de Dados',
      description: 'Guia prático sobre como organizar camadas Bronze, Silver e Gold utilizando Apache Spark, Delta Lake e boas práticas de governança de dados.',
      url: initialSettings.medium_url || 'https://medium.com/@mauriciobimbu',
      publish_date: 'Mai 2024',
      read_time: '6 min de leitura',
      tags: 'Engenharia de Dados, Spark, Data Lake',
      is_featured: 1,
      card_size: 'large'
    },
    {
      id: 2,
      title: 'Construindo Pipelines Resilientes de Ingestão Streaming com PySpark & Kafka',
      publisher: 'LinkedIn Newsletter',
      category: 'Engenharia & Arquitetura de Dados',
      description: 'Estratégias de tratamento de esquema em evolução, checkpointing e monitoramento em tempo real para dados de alto volume.',
      url: initialSettings.linkedin_url || initialSettings.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/',
      publish_date: 'Fev 2024',
      read_time: '8 min de leitura',
      tags: 'PySpark, Streaming, Kafka',
      is_featured: 0,
      card_size: 'normal'
    },
    {
      id: 3,
      title: 'Análise de Sentimentos e Mineração de Dados em Redes Sociais com Python',
      publisher: 'USP / UFC Research',
      category: 'Ciência de Dados & Estatística',
      description: 'Paper de pesquisa aplicando NLP (Natural Language Processing) e modelos estatísticos para extração de tendências e opiniões.',
      url: initialSettings.lattes_url || 'http://lattes.cnpq.br/9506694715562032',
      publish_date: 'Out 2023',
      read_time: '12 min de leitura',
      tags: 'Data Science, NLP, Machine Learning',
      is_featured: 1,
      card_size: 'normal'
    }
  ];

  const articlesList = initialArticles && initialArticles.length > 0 ? initialArticles : defaultArticles;

  const categories = Array.from(new Set([
    'Engenharia & Arquitetura de Dados',
    'Ciência de Dados & Estatística',
    'Machine Learning & IA',
    'Artigos Acadêmicos (USP/UFC)',
    ...articlesList.map(a => a.category).filter(Boolean) as string[]
  ]));

  const publishers = Array.from(new Set(articlesList.map(a => a.publisher || 'Medium'))).filter(Boolean);

  const filteredArticles = articlesList.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPub = selectedPublisher === 'all' || item.publisher === selectedPublisher;
    const matchesSearch = searchTerm.trim() === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesPub && matchesSearch;
  });

  const t = {
    pt: {
      backBtn: 'Voltar ao Portfólio',
      pageTitle: 'Artigos, Publicações & Blog',
      pageSubtitle: initialSettings.articles_subtitle || 'Confira meus artigos técnicos, newsletters no LinkedIn, publicações no Medium e artigos de pesquisa científica.',
      searchPlaceholder: 'Buscar por título, palavra-chave ou tecnologia...',
      allCat: 'Todas as Áreas',
      allPub: 'Todos os Veículos',
      readBtn: 'Ler Artigo Completo',
      noResults: 'Nenhum artigo encontrado para os filtros selecionados.',
      featuredBadge: 'Destaque',
    },
    en: {
      backBtn: 'Back to Portfolio',
      pageTitle: 'Articles, Publications & Blog',
      pageSubtitle: initialSettings.articles_subtitle || 'Explore my technical articles, LinkedIn newsletters, Medium posts, and scientific research papers.',
      searchPlaceholder: 'Search by title, keyword, or technology...',
      allCat: 'All Categories',
      allPub: 'All Publishers',
      readBtn: 'Read Full Article',
      noResults: 'No articles found matching the selected filters.',
      featuredBadge: 'Featured',
    }
  }[lang];

  if (!mounted) return null;

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '100vh', transition: 'background 0.3s ease, color 0.3s ease' }}>
      
      {/* Top Header Bar */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'blur(10px)', 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
      }}>
        <a href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--text-main)', 
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'color 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-main)'}>
          <ArrowLeft size={16} />
          {t.backBtn}
        </a>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />

          <button 
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} 
            style={{ 
              background: 'var(--bg-main)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '0.35rem 0.7rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {lang === 'pt' ? '🇬🇧 EN' : '🇧🇷 PT'}
          </button>

          <a 
            href="/admin/artigos" 
            style={{ 
              background: 'var(--bg-main)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '0.35rem 0.7rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: '0.3rem',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={12} />
            <span>{lang === 'pt' ? 'Admim' : 'Admin'}</span>
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1150px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Banner Hero */}
        <section style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: '16px', 
          padding: '2.5rem 2rem', 
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: 'var(--accent-glow)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Newspaper size={20} />
            <span>PUBLICAÇÕES & BLOG</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            {t.pageTitle}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '750px', lineHeight: '1.6' }}>
            {t.pageSubtitle}
          </p>

          {/* Search & Category Filter Controls */}
          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative', maxWidth: '600px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Categorias (Engenharia, Ciência de Dados, ML, etc.) */}
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                {lang === 'pt' ? 'Filtrar por Categoria:' : 'Filter by Category:'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid ' + (selectedCategory === 'all' ? 'var(--accent)' : 'var(--border)'),
                    background: selectedCategory === 'all' ? 'var(--accent)' : 'var(--bg-main)',
                    color: selectedCategory === 'all' ? '#fff' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.allCat} ({articlesList.length})
                </button>

                {categories.map(cat => {
                  const count = articlesList.filter(a => a.category === cat).length;
                  if (count === 0 && selectedCategory !== cat) return null;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '20px',
                        border: '1px solid ' + (isSelected ? 'var(--accent)' : 'var(--border)'),
                        background: isSelected ? 'var(--accent)' : 'var(--bg-main)',
                        color: isSelected ? '#fff' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtro por Veículo */}
            {publishers.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {lang === 'pt' ? 'Veículo:' : 'Publisher:'}
                </span>
                <button
                  onClick={() => setSelectedPublisher('all')}
                  style={{ padding: '0.25rem 0.7rem', borderRadius: '14px', border: '1px solid var(--border)', background: selectedPublisher === 'all' ? 'var(--accent-glow)' : 'transparent', color: selectedPublisher === 'all' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t.allPub}
                </button>
                {publishers.map(pub => (
                  <button
                    key={pub}
                    onClick={() => setSelectedPublisher(pub)}
                    style={{ padding: '0.25rem 0.7rem', borderRadius: '14px', border: '1px solid var(--border)', background: selectedPublisher === pub ? 'var(--accent-glow)' : 'transparent', color: selectedPublisher === pub ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {pub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>
            {t.noResults}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {filteredArticles.map(article => {
              const isFull = article.card_size === 'full';
              const isLarge = article.card_size === 'large';
              return (
                <article
                  key={article.id}
                  style={{
                    gridColumn: isFull ? '1 / -1' : (isLarge ? 'span 2' : 'span 1'),
                    background: 'var(--bg-secondary)',
                    border: article.is_featured ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'transform 0.2s, boxShadow 0.2s'
                  }}
                  className="article-card-item"
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={translateDbString(article.title, lang)} 
                        style={{ width: '100%', height: isLarge ? '240px' : '180px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ height: '8px', background: article.is_featured ? 'var(--accent)' : 'var(--border)' }} />
                    )}

                    <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)' }}>
                            {article.publisher || 'Medium'}
                          </span>
                          {article.category && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '4px' }}>
                              {article.category}
                            </span>
                          )}
                        </div>
                        
                        {article.is_featured === 1 && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '4px' }}>
                            ⭐ {t.featuredBadge}
                          </span>
                        )}
                      </div>

                      <h2 style={{ fontSize: isLarge ? '1.4rem' : '1.2rem', fontWeight: 700, margin: '0 0 0.6rem 0', lineHeight: '1.35', color: 'var(--text-main)' }}>
                        {translateDbString(article.title, lang)}
                      </h2>

                      {article.description && (
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: isLarge ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {translateDbString(article.description, lang)}
                        </p>
                      )}

                      {article.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {article.tags.split(',').map((tag, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'var(--border)', color: 'var(--text-main)', borderRadius: '4px', fontWeight: 600 }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.5rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {article.publish_date && <span>🗓️ {article.publish_date}</span>}
                      {article.read_time && <span>⏱️ {article.read_time}</span>}
                    </div>

                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        background: 'var(--accent)', 
                        color: '#fff', 
                        padding: '0.45rem 0.9rem', 
                        borderRadius: '6px', 
                        fontSize: '0.82rem', 
                        fontWeight: 700, 
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px var(--accent-glow)'
                      }}
                    >
                      <span>{t.readBtn}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>MB.</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            © {new Date().getFullYear()} {initialSettings.name || 'Mauricio Garcia Bimbu'}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @media (max-width: 768px) {
          .article-card-item {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
