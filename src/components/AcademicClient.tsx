'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  Globe, 
  FileText, 
  ExternalLink,
  MapPin,
  Settings,
  Download
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Language } from '@/lib/translations';

interface AcademicSectionItem {
  id: number;
  section_id: number;
  title_pt: string;
  title_en: string;
  subtitle_pt: string;
  subtitle_en: string;
  description_pt: string;
  description_en: string;
  tags: string;
  link: string;
  period: string;
  is_visible?: number;
  sort_order: number;
}

interface AcademicSection {
  id: number;
  title_pt: string;
  title_en: string;
  type: 'text' | 'list';
  position: 'center' | 'sidebar';
  sort_order: number;
  content_pt: string;
  content_en: string;
  tags: string;
  show_limit: number;
  is_visible?: number;
  items: AcademicSectionItem[];
}

export default function AcademicClient() {
  const [lang, setLang] = useState<Language>('pt');
  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [profileSettings, setProfileSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSectionExpand = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Carrega dados da API e registra a visita
  useEffect(() => {
    setMounted(true);
    
    // Detecta idioma do navegador
    const systemLang = navigator.language || (navigator as any).userLanguage || 'pt';
    const parsedLang: Language = systemLang.toLowerCase().startsWith('en') ? 'en' : 'pt';
    setLang(parsedLang);

    // Carrega dados
    const loadData = async () => {
      try {
        const res = await fetch('/api/academico');
        if (res.ok) {
          const data = await res.json();
          const visibleSections = (data.sections || [])
            .filter((s: AcademicSection) => s.is_visible === undefined || s.is_visible === null || s.is_visible === 1)
            .map((s: AcademicSection) => ({
              ...s,
              items: (s.items || []).filter(i => i.is_visible === undefined || i.is_visible === null || i.is_visible === 1)
            }));
          setSections(visibleSections);
          setProfileSettings(data.settings || {});
        }
      } catch (err) {
        console.error('Erro ao carregar dados acadêmicos:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Registra a visita na rota acadêmica
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: '/academico' })
    }).catch(() => {});
  }, []);

  const t = {
    pt: {
      backBtn: 'Voltar ao Portfólio',
      subtitle: 'Currículo Acadêmico e Científico',
      lattesBtn: 'Acessar Lattes CNPq',
      loadingText: 'Carregando currículo acadêmico...',
      noData: 'Nenhuma seção cadastrada.',
      citationsLabel: 'Nome em citações bibliográficas:',
      visitStats: 'Estatísticas',
    },
    en: {
      backBtn: 'Back to Portfolio',
      subtitle: 'Academic & Scientific CV',
      loadingText: 'Loading academic CV...',
      lattesBtn: 'Access CNPq Lattes',
      noData: 'No sections registered.',
      citationsLabel: 'Name in bibliographic citations:',
      visitStats: 'Statistics',
    }
  }[lang];

  if (!mounted) return null;

  // 1. Encontra a seção de "Sobre Mim" (Centro) e a de "Idiomas" (Lateral)
  const aboutSection = sections.find(s => s.position === 'center' && (s.title_pt.includes('Sobre') || s.id === 1));
  const langSection = sections.find(s => s.position === 'sidebar' || s.title_pt.includes('Idioma'));

  // 2. Filtra as outras seções do Lattes para renderizar abaixo (largura 100%)
  const otherSections = sections.filter(s => s.id !== aboutSection?.id && s.id !== langSection?.id);

  // Valores padrão para o cabeçalho caso venham nulos do banco
  const pName = profileSettings.academic_name || 'Mauricio Garcia Bimbu';
  const pRole = lang === 'pt' 
    ? (profileSettings.academic_role_pt || 'Mestrando em Ciência da Computação (USP) & Cientista de Dados')
    : (profileSettings.academic_role_en || 'M.Sc. Candidate in Computer Science (USP) & Data Scientist');
  const pLoc = profileSettings.academic_location || 'São Paulo, SP - Brasil';
  const pInst = profileSettings.academic_institution || 'ARIDA - Advanced Research in Databases (UFC)';
  const pLattesId = profileSettings.academic_lattes_id || '9506694715562032';
  const pLattesUrl = profileSettings.academic_lattes_url || 'http://lattes.cnpq.br/9506694715562032';
  const pDoiId = profileSettings.academic_doi_id || '';
  const pDoiUrl = profileSettings.academic_doi_url || '';
  const pLattesPdf = profileSettings.academic_lattes_pdf || '';
  const pCitations = profileSettings.academic_citations || 'BIMBU, M. G.';

  // Helpers para identificar e tratar emojis armazenados no banco de dados
  const hasEmoji = (text: string) => {
    try {
      return new RegExp('^\\p{Extended_Pictographic}', 'u').test(text.trim());
    } catch (e) {
      const code = text.trim().codePointAt(0);
      return code ? code > 0x2000 : false;
    }
  };

  const getEmojiFromText = (text: string): string => {
    try {
      const match = text.trim().match(new RegExp('^\\p{Extended_Pictographic}', 'u'));
      return match ? match[0] : '';
    } catch (e) {
      const code = text.trim().codePointAt(0);
      if (code && code > 0x2000) {
        return String.fromCodePoint(code);
      }
    }
    return '';
  };

  const displayTitle = (title: string) => {
    if (hasEmoji(title)) return title;
    return `📄 ${title}`;
  };

  const displayItemTitle = (itemTitle: string, sectionTitle: string) => {
    if (hasEmoji(itemTitle)) return itemTitle;
    
    const secEmoji = getEmojiFromText(sectionTitle);
    if (secEmoji === '🎓') return `🏫 ${itemTitle}`;
    if (secEmoji === '🌍') return `🗣️ ${itemTitle}`;
    if (secEmoji === '🔬') return `💻 ${itemTitle}`;
    if (secEmoji === '📅') return `👥 ${itemTitle}`;
    if (secEmoji === '🎫') return `🎟️ ${itemTitle}`;
    if (secEmoji === '📚') return `📝 ${itemTitle}`;
    
    if (secEmoji) return `${secEmoji} ${itemTitle}`;
    return `🔹 ${itemTitle}`;
  };

  // Helper para renderizar o conteúdo interno de uma seção
  const renderSectionContent = (sec: AcademicSection) => {
    if (sec.type === 'text') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.7', fontSize: '0.98rem', color: 'var(--text-muted)', textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {lang === 'pt' ? sec.content_pt : sec.content_en}
          </p>
          {sec.id === 1 && ( 
            <div style={{ marginTop: '0.25rem', padding: '0.6rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', width: 'fit-content' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{t.citationsLabel}</span>{' '}
              <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{pCitations}</span>
            </div>
          )}
        </div>
      );
    }

    const limit = sec.show_limit !== undefined && sec.show_limit !== null ? sec.show_limit : 3;
    const hasManyItems = sec.items.length > limit;
    const isExpanded = !!expandedSections[sec.id];
    const visibleItems = hasManyItems && !isExpanded ? sec.items.slice(0, limit) : sec.items;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {visibleItems.map((item, i) => (
            <div 
              key={item.id} 
              style={{ 
                borderBottom: i < visibleItems.length - 1 ? '1px solid var(--border)' : 'none', 
                paddingBottom: i < visibleItems.length - 1 ? '1.5rem' : 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{displayItemTitle(lang === 'pt' ? item.title_pt : item.title_en, lang === 'pt' ? sec.title_pt : sec.title_en)}</span>
                  </h3>
                  {(item.subtitle_pt || item.subtitle_en) && (
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.15rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                      {lang === 'pt' ? item.subtitle_pt : item.subtitle_en}
                    </h4>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {item.period && (
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {item.period}
                    </span>
                  )}
                </div>
              </div>

              {(item.description_pt || item.description_en) && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0', paddingLeft: '1.5rem', lineHeight: '1.6', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                  {lang === 'pt' ? item.description_pt : item.description_en}
                </p>
              )}

              {item.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.15rem', paddingLeft: '1.5rem' }}>
                  {item.tags.split(',').map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '4px', fontWeight: 600 }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    color: 'var(--accent)', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    marginTop: '0.25rem',
                    paddingLeft: '1.5rem',
                    textDecoration: 'underline' 
                  }}
                >
                  <span>{lang === 'pt' ? 'Verificar Link' : 'Verify Link'}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>

        {hasManyItems && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              onClick={() => toggleSectionExpand(sec.id)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.background = 'var(--accent-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>
                {isExpanded 
                  ? (lang === 'pt' ? 'Ver Menos ▴' : 'Show Less ▴') 
                  : (lang === 'pt' ? `Ver Mais (${sec.items.length - limit}) ▾` : `Show More (${sec.items.length - limit}) ▾`)
                }
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '100vh', transition: 'background 0.3s ease, color 0.3s ease' }}>
      
      {/* Header Bar */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'blur(10px)', 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
          >
            {lang === 'pt' ? '🇬🇧 EN' : '🇧🇷 PT'}
          </button>

          {/* Atalho direto para o Painel Admin do Lattes */}
          <a 
            href="/admin/academico" 
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
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
          >
            <Settings size={12} />
            <span>{lang === 'pt' ? 'Admim' : 'Admin'}</span>
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Profile Card */}
        <section style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: '16px', 
          padding: '2rem 2rem', 
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--accent-glow)', filter: 'blur(70px)', borderRadius: '50%', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                {pName}
              </h1>
              <p style={{ color: 'var(--accent)', fontSize: '1.15rem', fontWeight: 600, marginTop: '0.35rem', marginBottom: '1.25rem' }}>
                {pRole}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: 'var(--accent)' }} />
                  <span>{pLoc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GraduationCap size={16} style={{ color: 'var(--accent)' }} />
                  <span>{pInst}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} style={{ color: 'var(--accent)' }} />
                  <span>ID Lattes: {pLattesId}</span>
                </div>
                {pDoiId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={16} style={{ color: 'var(--accent)' }} />
                    <span>
                      DOI/ORCID:{' '}
                      {pDoiUrl ? (
                        <a href={pDoiUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
                          {pDoiId}
                        </a>
                      ) : (
                        pDoiId
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a 
                href={pLattesUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  background: 'var(--accent)', 
                  color: '#fff', 
                  textDecoration: 'none', 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px var(--accent-glow)',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px var(--accent-glow)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px var(--accent-glow)';
                }}
              >
                <Globe size={16} />
                {t.lattesBtn}
              </a>
              {pLattesPdf && (
                <a 
                  href={pLattesPdf} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    background: 'transparent', 
                    color: 'var(--text-main)', 
                    border: '2px solid var(--accent)',
                    textDecoration: 'none', 
                    padding: '0.6rem 1.25rem', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: '0 2px 5px var(--accent-glow)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = 'var(--accent-glow)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Download size={16} style={{ color: 'var(--accent)' }} />
                  <span>{lang === 'pt' ? 'BAIXAR CV LATTES' : 'DOWNLOAD CV LATTES'}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>
            {t.loadingText}
          </div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>
            {t.noData}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Top Grid Area: Sobre Mim (Left) and Idiomas (Right) side-by-side with locked heights */}
            {(aboutSection || langSection) && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.1fr', gap: '2rem', alignItems: 'stretch' }} className="layout-grid">
                
                {/* Left: Sobre Mim */}
                {aboutSection && (
                  <section 
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '14px', 
                      padding: '1.75rem', 
                      boxShadow: 'var(--card-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box'
                    }}
                  >
                    <h2 style={{ 
                      fontSize: '1.35rem', 
                      fontWeight: 700, 
                      marginBottom: '1.25rem', 
                      borderBottom: '1px solid var(--border)', 
                      paddingBottom: '0.5rem', 
                      color: 'var(--text-main)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      <span>{displayTitle(lang === 'pt' ? aboutSection.title_pt : aboutSection.title_en)}</span>
                    </h2>

                    {aboutSection.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                        {aboutSection.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'var(--border)', color: 'var(--text-main)', borderRadius: '4px', fontWeight: 600 }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      {renderSectionContent(aboutSection)}
                    </div>
                  </section>
                )}

                {langSection && (
                  <section 
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '14px', 
                      padding: '1.5rem', 
                      boxShadow: 'var(--card-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box'
                    }}
                  >
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      marginBottom: '0.9rem', 
                      borderBottom: '1px solid var(--border)', 
                      paddingBottom: '0.5rem', 
                      color: 'var(--text-main)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      <span>{displayTitle(lang === 'pt' ? langSection.title_pt : langSection.title_en)}</span>
                    </h2>

                    {langSection.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                        {langSection.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', background: 'var(--border)', color: 'var(--text-main)', borderRadius: '4px', fontWeight: 600 }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Scroll Interno que impede o estouro de altura */}
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '230px', paddingRight: '0.25rem' }} className="scroll-container">
                      {langSection.type === 'text' ? (
                        <p style={{ lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                          {lang === 'pt' ? langSection.content_pt : langSection.content_en}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {langSection.items.map((item, i) => (
                            <div 
                              key={item.id} 
                              style={{ 
                                borderBottom: i < langSection.items.length - 1 ? '1px dashed var(--border)' : 'none', 
                                paddingBottom: i < langSection.items.length - 1 ? '0.35rem' : 0 
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '0.08rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{displayItemTitle(lang === 'pt' ? item.title_pt : item.title_en, lang === 'pt' ? langSection.title_pt : langSection.title_en)}</span>
                                {item.period && <span>{item.period}</span>}
                              </div>
                              <h4 style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)', margin: 0, paddingLeft: '1.2rem' }}>
                                {lang === 'pt' ? item.subtitle_pt : item.subtitle_en}
                              </h4>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
 
            {/* Bottom Area: All remaining sections mapped sequentially at 100% width */}
            {otherSections.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
                {otherSections.map(sec => (
                  <section 
                    key={sec.id} 
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '14px', 
                      padding: '1.75rem', 
                      boxShadow: 'var(--card-shadow)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <h2 style={{ 
                      fontSize: '1.35rem', 
                      fontWeight: 700, 
                      marginBottom: '1.25rem', 
                      borderBottom: '1px solid var(--border)', 
                      paddingBottom: '0.5rem', 
                      color: 'var(--text-main)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      <span>{displayTitle(lang === 'pt' ? sec.title_pt : sec.title_en)}</span>
                    </h2>

                    {sec.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                        {sec.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'var(--border)', color: 'var(--text-main)', borderRadius: '4px', fontWeight: 600 }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {renderSectionContent(sec)}
                  </section>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Estilos adicionais Webkit Scrollbar e Responsivo */}
      <style jsx global>{`
        .scroll-container::-webkit-scrollbar {
          width: 5px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 99px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
        @media (max-width: 900px) {
          .layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
