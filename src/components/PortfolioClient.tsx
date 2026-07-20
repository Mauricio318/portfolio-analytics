'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Database as DbIcon, 
  ChevronRight, 
  Award, 
  Globe, 
  Terminal as TermIcon, 
  Workflow, 
  BookOpen, 
  GraduationCap,
  Eye,
  X
} from 'lucide-react';
import styles from '../app/page.module.css';
import { ThemeToggle } from './ThemeToggle';
import EtlSimulator from './EtlSimulator';
import TerminalConsole from './TerminalConsole';
import { Language, translations, translateDbString } from '@/lib/translations';

interface PortfolioClientProps {
  initialSettings: Record<string, string>;
  initialSkills: any[];
  initialJobs: any[];
  initialAcademic: any[];
  initialCertifications: any[];
  initialCourses: any[];
  initialPortfolio: any[];
}

export default function PortfolioClient({
  initialSettings,
  initialSkills,
  initialJobs,
  initialAcademic,
  initialCertifications,
  initialCourses,
  initialPortfolio
}: PortfolioClientProps) {
  const [lang, setLang] = useState<Language>('pt');
  const [mounted, setMounted] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [visitAnimated, setVisitAnimated] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const t = translations[lang];

  const toggleJob = (id: number) => {
    setExpandedJobs(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  const getJobDescriptionParts = (desc: string) => {
    if (!desc) return { main: '', rest: '' };
    
    const semiIdx = desc.indexOf(';');
    if (semiIdx !== -1 && semiIdx > 15) {
      return {
        main: desc.substring(0, semiIdx).trim(),
        rest: desc.substring(semiIdx).trim()
      };
    }
    
    const dotIdx = desc.indexOf('.');
    if (dotIdx !== -1 && dotIdx > 15 && dotIdx < desc.length - 2) {
      return {
        main: desc.substring(0, dotIdx + 1).trim(),
        rest: desc.substring(dotIdx + 1).trim()
      };
    }
    
    return { main: desc, rest: '' };
  };

  useEffect(() => {
    setMounted(true);

    // 1. Language restoration
    const savedLang = localStorage.getItem('mb_portfolio_lang') as Language;
    if (savedLang === 'en' || savedLang === 'pt') {
      setLang(savedLang);
    } else {
      const systemLang = navigator.language || (navigator as any).userLanguage || 'pt';
      const parsedLang: Language = systemLang.toLowerCase().startsWith('en') ? 'en' : 'pt';
      setLang(parsedLang);
    }

    // 2. Section hash restoration on refresh (F5 / Cmd+R)
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setActiveSection(initialHash);
      setTimeout(() => {
        const targetElement = document.getElementById(initialHash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }

    // 3. Register visit counter
    const saved = localStorage.getItem('mb_visit_number');
    const savedNumber = saved ? parseInt(saved, 10) : NaN;

    if (!isNaN(savedNumber) && savedNumber > 0) {
      setVisitCount(savedNumber);
      setTimeout(() => setVisitAnimated(true), 300);
    } else {
      localStorage.setItem('mb_visit_number', 'pending');
      fetch('/api/visit', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          localStorage.setItem('mb_visit_number', String(data.count));
          setVisitCount(data.count);
          setTimeout(() => setVisitAnimated(true), 300);
        })
        .catch(() => {
          localStorage.removeItem('mb_visit_number');
        });
    }

    // 4. Real-time scroll detection via IntersectionObserver
    const sectionIds = ['inicio', 'portfolio', 'etl', 'experiencia', 'certifications', 'cursos', 'skills', 'terminal', 'contato'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveSection(id);
          const newHash = id === 'inicio' ? '#' : `#${id}`;
          if (window.location.hash !== `#${id}` && (id !== 'inicio' || window.location.hash !== '')) {
            window.history.replaceState(null, '', newHash);
          }
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const getOrdinal = (n: number, lang: Language): string => {
    if (lang === 'en') {
      const s = ['th','st','nd','rd'];
      const v = n % 100;
      return n + (s[(v-20)%10] || s[v] || s[0]);
    }
    return `${n}º`;
  };

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'pt' ? 'en' : 'pt';
      localStorage.setItem('mb_portfolio_lang', next);
      return next;
    });
  };

  if (!mounted) {
    return null;
  }

  const certifications = initialCertifications;
  const academicList = initialAcademic;
  const coursesList = initialCourses;

  return (
    <>
      {/* Dynamic Translated Navigation Header */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <a href="#inicio" className={styles.logo}>MB. <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>v1</span></a>
          <div className={styles.navLinks}>
            <a href="#inicio" className={activeSection === 'inicio' ? styles.activeNavLink : ''}>{t.navHome}</a>
            <a href="#portfolio" className={activeSection === 'portfolio' ? styles.activeNavLink : ''}>{t.navPortfolio}</a>
            <a href="#etl" className={activeSection === 'etl' ? styles.activeNavLink : ''}>{lang === 'pt' ? 'Simulador' : 'Simulator'}</a>
            <a href="#experiencia" className={activeSection === 'experiencia' ? styles.activeNavLink : ''}>{t.navExperience}</a>
            <a href="#certifications" className={activeSection === 'certifications' ? styles.activeNavLink : ''}>{lang === 'pt' ? 'Certificações' : 'Certifications'}</a>
            <a href="#cursos" className={activeSection === 'cursos' ? styles.activeNavLink : ''}>{lang === 'pt' ? 'Cursos' : 'Courses'}</a>
            <a href="#skills" className={activeSection === 'skills' ? styles.activeNavLink : ''}>{t.navSkills}</a>
            <a href="#terminal" className={activeSection === 'terminal' ? styles.activeNavLink : ''}>Terminal</a>
            <a href="#contato" className={activeSection === 'contato' ? styles.activeNavLink : ''}>{t.navContact}</a>
          </div>
          <div className={styles.navControls}>
            {/* Language toggle */}
            <button 
              onClick={toggleLanguage}
              className={styles.langBtn}
              aria-label="Toggle language"
            >
              <Globe size={16} />
              <span>{lang.toUpperCase()}</span>
            </button>
            <ThemeToggle />
            <a href="/admin" className={styles.adminLink}>Admin</a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.title}>
            {t.heroGreeting} <br />
            <span className={styles.highlight}>{initialSettings.name}</span>.
          </h1>
          <h2 className={styles.role}>{translateDbString(initialSettings.roles, lang)}</h2>
          <p className={styles.bio}>{translateDbString(initialSettings.bio, lang)}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="#portfolio" className={styles.primaryBtn}>
              {t.heroButtonProjects} <ChevronRight size={18} />
            </a>
            {initialSettings.cv_url && (
              <a 
                href={initialSettings.cv_url} 
                download 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.secondaryBtn}
                style={{ 
                  borderColor: 'var(--accent)', 
                  color: 'var(--accent)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                <span>{lang === 'pt' ? 'Baixar CV' : 'Download CV'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            )}
            <a 
              href="/academico" 
              className={styles.secondaryBtn}
              style={{ 
                borderColor: 'var(--accent)', 
                background: 'color-mix(in srgb, var(--accent) 22%, transparent)',
                color: 'var(--accent)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 25%, transparent)'
              }}
            >
              <span>{lang === 'pt' ? 'Currículo Acadêmico' : 'Academic CV'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </a>
          </div>

          {/* Visitor Counter Badge */}
          {visitCount !== null && (
            <div
              style={{
                marginTop: '2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(var(--accent-rgb, 99, 102, 241), 0.08)',
                border: '1px solid rgba(var(--accent-rgb, 99, 102, 241), 0.25)',
                borderRadius: '999px',
                padding: '0.45rem 1.1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                opacity: visitAnimated ? 1 : 0,
                transform: visitAnimated ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <span style={{ fontSize: '1rem' }}>👁️</span>
              <span>
                {lang === 'pt'
                  ? <>Você é o{' '}<strong style={{ color: 'var(--accent)' }}>{getOrdinal(visitCount, 'pt')}</strong>{' '}visitante deste portfólio</>  
                  : <>You are the{' '}<strong style={{ color: 'var(--accent)' }}>{getOrdinal(visitCount, 'en')}</strong>{' '}visitor of this portfolio</>  
                }
              </span>
            </div>
          )}
        </div>
      </section>

      {/* PORTFOLIO SECTION (Vitrine de Projetos) */}
      <section id="portfolio" className={`container ${styles.section}`}>
        <h2 className="section-title">{t.sectionProjectsTitle}</h2>
        <p className={styles.sectionSubtitle}>
          {translateDbString(initialSettings.projects_subtitle || t.sectionProjectsDesc, lang)}
        </p>
        <div className={styles.portfolioGrid}>
          {initialPortfolio.map((item) => {
            const hasImage = !!item.image_url;
            return (
              <div 
                key={item.id} 
                className={`${styles.projectCard} ${item.is_featured ? styles.projectCardFeatured : ''}`}
              >
                {hasImage && (
                  <img 
                    src={item.image_url} 
                    alt={translateDbString(item.title, lang)} 
                    className={styles.projectImage} 
                    onClick={() => setSelectedProject(item)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                <div className={styles.projectCategory}>{translateDbString(item.category, lang)}</div>
                <h3 className={styles.projectTitle}>{translateDbString(item.title, lang)}</h3>
                <p className={styles.projectDesc}>{translateDbString(item.description, lang)}</p>
                
                {item.tags && (
                  <div className={styles.projectTags}>
                    {item.tags.split(',').map((tag: string, i: number) => (
                      <span key={i} className={styles.tag}>{tag.trim()}</span>
                    ))}
                  </div>
                )}

                <div className={styles.projectCardActions}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedProject(item)} 
                    className={styles.viewDetailsBtn}
                  >
                    <Eye size={14} />
                    {lang === 'pt' ? 'Ver Detalhes' : 'View Details'}
                  </button>

                  {item.link && (
                    <a 
                      href={item.link} 
                      className={styles.projectLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {item.link.includes('github') || item.link.includes('ipynb') 
                        ? (lang === 'pt' ? 'Repositório' : 'Repository')
                        : (lang === 'pt' ? 'Acessar Link' : 'Open Link')
                      } <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FULL PROJECT DETAILS MODAL POPUP */}
      <div 
        className={`${styles.projectModalOverlay} ${selectedProject ? styles.projectModalOverlayActive : ''}`}
        onClick={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <div className={styles.projectModalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.projectModalClose} 
              onClick={() => setSelectedProject(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div>
              <div className={styles.projectCategory}>{translateDbString(selectedProject.category, lang)}</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0 0.5rem 0' }}>
                {translateDbString(selectedProject.title, lang)}
              </h2>
            </div>

            {selectedProject.image_url && (
              <img 
                src={selectedProject.image_url} 
                alt={translateDbString(selectedProject.title, lang)} 
                className={styles.projectModalImage} 
              />
            )}

            <div className={styles.projectModalFullDesc}>
              {translateDbString(selectedProject.description, lang)}
            </div>

            {selectedProject.tags && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {selectedProject.tags.split(',').map((tag: string, i: number) => (
                  <span key={i} className={styles.tag} style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {selectedProject.link && (
                <a 
                  href={selectedProject.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.primaryBtn}
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
                >
                  <ExternalLink size={16} />
                  {selectedProject.link.includes('github') || selectedProject.link.includes('ipynb')
                    ? (lang === 'pt' ? 'Ver Código / Notebook no GitHub' : 'View Code / Notebook on GitHub')
                    : (lang === 'pt' ? 'Acessar Projeto Completo' : 'Access Full Project')
                  }
                </a>
              )}

              <button 
                type="button" 
                onClick={() => setSelectedProject(null)}
                className={styles.secondaryBtn}
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
              >
                {lang === 'pt' ? 'Fechar' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ETL SIMULATOR SECTION */}
      <section id="etl" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Workflow color="var(--accent)" size={32} />
          {lang === 'pt' ? 'Demonstração de Pipeline' : 'Pipeline Demonstration'}
        </h2>
        <EtlSimulator lang={lang} />
      </section>

      {/* TIMELINE SECTION (Experiencias e Formacao) */}
      <section id="experiencia" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title">{t.sectionTrajectoryTitle}</h2>
        <div className={styles.trajectoryGrid}>
          
          {/* Work Experience */}
          <div>
            <h3 className={styles.subTitle}>
              <DbIcon size={24} color="var(--accent)" /> {t.subExperience}
            </h3>
            <div className={styles.timeline}>
              {initialJobs.map((job) => {
                const isExpanded = expandedJobs.includes(job.id);
                const descStr = translateDbString(job.description, lang);
                const { main, rest } = getJobDescriptionParts(descStr);
                const hasMore = !!rest || !!job.technologies;

                return (
                  <div key={job.id} className={`${styles.timelineItem} ${isExpanded ? styles.timelineItemExpanded : ''}`}>
                    <div className={styles.timelineDate}>{job.start_date} - {job.end_date || (lang === 'pt' ? 'Atual' : 'Present')}</div>
                    <h4 className={styles.timelineTitle}>{translateDbString(job.title, lang)}</h4>
                    <div className={styles.timelineCompany}>{translateDbString(job.institution, lang)}</div>
                    
                    {/* Main description always visible */}
                    <p className={styles.timelineDesc} style={{ whiteSpace: 'pre-line' }}>
                      {main}{!isExpanded && hasMore ? '...' : ''}
                    </p>

                    {/* Continuation text and tools rendered on click expand */}
                    {isExpanded && (
                      <div className={styles.jobDetails}>
                        {rest && (
                          <p className={styles.timelineDesc} style={{ marginTop: '0.25rem', whiteSpace: 'pre-line' }}>
                            {rest}
                          </p>
                        )}
                        {job.technologies && (
                          <div className={styles.jobTools}>
                            <span className={styles.toolsTitle}>{t.expToolsUsed}</span>
                            <div className={styles.toolsList}>
                              {job.technologies.split(',').map((tech: string, i: number) => (
                                <span key={i} className={styles.techTag}>{tech.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {hasMore && (
                      <button 
                        onClick={() => toggleJob(job.id)} 
                        className={styles.toggleJobBtn}
                        aria-expanded={isExpanded}
                        style={{ marginTop: '0.75rem' }}
                      >
                        {isExpanded ? t.expHideDetails : t.expShowDetails}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Path */}
          <div>
            <h3 className={styles.subTitle}>
              <GraduationCap size={24} color="var(--accent)" /> {lang === 'pt' ? 'Formação Acadêmica' : 'Academic Path'}
            </h3>
            <div className={styles.timeline}>
              {academicList.map((course) => (
                <div key={course.id} className={styles.timelineItem}>
                  <div className={styles.timelineDate}>{course.start_date ? `${course.start_date} - ${course.end_date || (lang === 'pt' ? 'Atual' : 'Present')}` : ''}</div>
                  <h4 className={styles.timelineTitle}>{translateDbString(course.title, lang)}</h4>
                  <div className={styles.timelineCompany}>{translateDbString(course.institution, lang)}</div>
                  <p className={styles.timelineDesc}>{translateDbString(course.description, lang)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CERTIFICATIONS SHOWCASE */}
      <section id="certifications" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award color="var(--accent)" size={32} />
          {lang === 'pt' ? 'Certificações Oficiais' : 'Official Certifications'}
        </h2>
        <div className={styles.certsGrid}>
          {certifications.map((cert) => (
            <div key={cert.id} className={styles.certCard}>
              <div 
                className={styles.certBadge} 
                onClick={() => cert.image_url && setPreviewImage(cert.image_url)}
                title={cert.image_url ? (lang === 'pt' ? 'Clique para ampliar' : 'Click to enlarge') : undefined}
              >
                {cert.image_url ? (
                  <img src={cert.image_url} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                ) : (
                  <Award size={28} />
                )}
              </div>
              <div className={styles.certInfo}>
                <h4 className={styles.certTitle}>
                  {cert.link ? (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer">
                      {translateDbString(cert.title, lang)}
                      <ExternalLink size={14} style={{ marginLeft: '0.25rem', opacity: 0.8 }} />
                    </a>
                  ) : (
                    translateDbString(cert.title, lang)
                  )}
                </h4>
                <div className={styles.certIssuer}>{translateDbString(cert.institution, lang)}</div>
                <p className={styles.certDesc}>{translateDbString(cert.description, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES SHOWCASE */}
      {coursesList.length > 0 && (
        <section id="cursos" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen color="var(--accent)" size={32} />
            {lang === 'pt' ? 'Cursos Livres / Complementares' : 'Free & Complementary Courses'}
          </h2>
          <div className={styles.certsGrid}>
            {coursesList.map((course) => (
              <div key={course.id} className={styles.certCard}>
                <div 
                  className={styles.certBadge} 
                  onClick={() => course.image_url && setPreviewImage(course.image_url)}
                  title={course.image_url ? (lang === 'pt' ? 'Clique para ampliar' : 'Click to enlarge') : undefined}
                >
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                  ) : (
                    <BookOpen size={28} />
                  )}
                </div>
                <div className={styles.certInfo}>
                  <h4 className={styles.certTitle}>
                    {course.link ? (
                      <a href={course.link} target="_blank" rel="noopener noreferrer">
                        {translateDbString(course.title, lang)}
                        <ExternalLink size={14} style={{ marginLeft: '0.25rem', opacity: 0.8 }} />
                      </a>
                    ) : (
                      translateDbString(course.title, lang)
                    )}
                  </h4>
                  <div className={styles.certIssuer}>{translateDbString(course.institution, lang)}</div>
                  {course.start_date && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {course.start_date} {course.end_date ? `- ${course.end_date}` : ''}
                    </div>
                  )}
                  <p className={styles.certDesc}>{translateDbString(course.description, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS SECTION */}
      <section id="skills" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title">{t.sectionSkillsTitle}</h2>
        <div className={styles.skillsGrid}>
          {initialSkills.map((skill) => (
            <div key={skill.id} className={styles.skillItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                {skill.image_url && (
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', padding: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <img src={skill.image_url} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div className={styles.skillHeader} style={{ marginBottom: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{translateDbString(skill.name, lang)}</span>
                    <span className={styles.skillLevel}>{translateDbString(skill.level, lang)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.skillBar}>
                <div className={styles.skillProgress} style={{ width: `${skill.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TERMINAL DRAWER SECTION */}
      <section id="terminal" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TermIcon color="var(--accent)" size={32} />
          {lang === 'pt' ? 'Console do Engenheiro' : 'Engineer Console'}
        </h2>
        <TerminalConsole 
          lang={lang} 
          settings={initialSettings} 
          skills={initialSkills} 
          jobs={initialJobs} 
          academic={academicList} 
          portfolio={initialPortfolio} 
        />
      </section>

      {/* CONTACT SECTION */}
      <section id="contato" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title">{t.sectionContactTitle}</h2>
        <div className={styles.contactContainer}>
          <p className={styles.contactDesc}>{t.contactDesc}</p>
          <div className={styles.contactBtns}>
            <a href={`mailto:${initialSettings.email || initialSettings.contact_email || 'mauriciozinibu@gmail.com'}`} className={styles.primaryBtn}>
              {t.contactEmailBtn}
            </a>
            <a href={initialSettings.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/'} target="_blank" rel="noopener noreferrer" className={styles.linkedinBtn}>
              {t.contactLinkedinBtn}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerLogo}>MB.</div>
          <p>© {new Date().getFullYear()} {initialSettings.name || 'Mauricio Garcia Bimbu'}. {t.footerRights}</p>
          <p style={{ marginTop: '0.5rem' }}>{translateDbString(initialSettings.roles, lang)}</p>
        </div>
      </footer>

      {/* Lightbox Image Preview Modal */}
      <div 
        className={`${styles.modalOverlay} ${previewImage ? styles.modalOverlayActive : ''}`}
        onClick={() => setPreviewImage(null)}
      >
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {previewImage && (
            <>
              <img src={previewImage} alt="Visualização da Certificação" className={styles.modalImage} />
              <button className={styles.modalClose} onClick={() => setPreviewImage(null)} aria-label="Fechar">
                &times;
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
