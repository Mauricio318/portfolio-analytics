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
  GraduationCap 
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
    // Automatic language detection
    const systemLang = navigator.language || (navigator as any).userLanguage || 'pt';
    const parsedLang: Language = systemLang.toLowerCase().startsWith('en') ? 'en' : 'pt';
    setLang(parsedLang);

    // Register visit — write marker BEFORE fetch to block StrictMode double-call
    const saved = localStorage.getItem('mb_visit_number');
    const savedNumber = saved ? parseInt(saved, 10) : NaN;

    if (!isNaN(savedNumber)) {
      // Valid number already stored — show it without hitting the API
      setVisitCount(savedNumber);
      setTimeout(() => setVisitAnimated(true), 300);
    } else {
      // New visitor (or stuck 'pending') — clear and register
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
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
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
            <a href="#inicio">{t.navHome}</a>
            <a href="#portfolio">{t.navPortfolio}</a>
            <a href="#etl">{lang === 'pt' ? 'Simulador' : 'Simulator'}</a>
            <a href="#experiencia">{t.navExperience}</a>
            <a href="#certifications">{lang === 'pt' ? 'Certificações' : 'Certifications'}</a>
            <a href="#cursos">{lang === 'pt' ? 'Cursos' : 'Courses'}</a>
            <a href="#skills">{t.navSkills}</a>
            <a href="#terminal">Terminal</a>
            <a href="#contato">{t.navContact}</a>
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
          <div className={styles.heroBtns}>
            <a href="#portfolio" className={styles.primaryBtn}>
              {t.heroButtonProjects} <ChevronRight size={18} />
            </a>
            <a href="#contato" className={styles.secondaryBtn}>
              {t.heroButtonContact}
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
        <div className={styles.portfolioGrid}>
          {initialPortfolio.map((item) => {
            const hasImage = !!item.image_url;
            return (
              <div key={item.id} className={`${styles.projectCard} ${hasImage ? styles.projectCardFeatured : ''}`}>
                {hasImage ? (
                  <div className={styles.featuredLayout}>
                    <div className={styles.featuredImageWrapper}>
                      <img 
                        src={item.image_url} 
                        alt={translateDbString(item.title, lang)} 
                        className={styles.featuredImage} 
                      />
                    </div>
                    <div className={styles.featuredContent}>
                      <div className={styles.projectCategory}>{translateDbString(item.category, lang)}</div>
                      <h3 className={styles.projectTitle}>{translateDbString(item.title, lang)}</h3>
                      <p className={styles.projectDesc}>{translateDbString(item.description, lang)}</p>
                      <div className={styles.projectTags}>
                        {item.tags?.split(',').map((tag: string, i: number) => (
                          <span key={i} className={styles.tag}>{tag.trim()}</span>
                        ))}
                      </div>
                      <a href={item.link || '#'} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                        {lang === 'pt' ? 'Acessar Repositório' : 'Access Repository'} <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.projectCategory}>{translateDbString(item.category, lang)}</div>
                    <h3 className={styles.projectTitle}>{translateDbString(item.title, lang)}</h3>
                    <p className={styles.projectDesc}>{translateDbString(item.description, lang)}</p>
                    <div className={styles.projectTags}>
                      {item.tags?.split(',').map((tag: string, i: number) => (
                        <span key={i} className={styles.tag}>{tag.trim()}</span>
                      ))}
                    </div>
                    <a href={item.link || '#'} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                      {lang === 'pt' ? 'Acessar Repositório' : 'Access Repository'} <ExternalLink size={16} />
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

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
                    <p className={styles.timelineDesc}>
                      {main}{!isExpanded && hasMore ? '...' : ''}
                    </p>

                    {/* Continuation text and tools rendered on click expand */}
                    {isExpanded && (
                      <div className={styles.jobDetails}>
                        {rest && (
                          <p className={styles.timelineDesc} style={{ marginTop: '0.25rem' }}>
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
              <div className={styles.certBadge}>
                {cert.image_url ? (
                  <img src={cert.image_url} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                ) : (
                  <Award size={28} />
                )}
              </div>
              <div className={styles.certInfo}>
                <h4 className={styles.certTitle}>{translateDbString(cert.title, lang)}</h4>
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
                <div className={styles.certBadge}>
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                  ) : (
                    <BookOpen size={28} />
                  )}
                </div>
                <div className={styles.certInfo}>
                  <h4 className={styles.certTitle}>{translateDbString(course.title, lang)}</h4>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {skill.image_url && (
                  <img src={skill.image_url} alt={skill.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div className={styles.skillHeader} style={{ marginBottom: 0 }}>
                    <span>{translateDbString(skill.name, lang)}</span>
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
        <TerminalConsole lang={lang} />
      </section>

      {/* CONTACT SECTION */}
      <section id="contato" className={`container ${styles.section}`} style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title">{t.sectionContactTitle}</h2>
        <div className={styles.contactContainer}>
          <p className={styles.contactDesc}>{t.contactDesc}</p>
          <div className={styles.contactBtns}>
            <a href="mailto:mauriciozinibu@gmail.com" className={styles.primaryBtn}>
              {t.contactEmailBtn}
            </a>
            <a href="https://www.linkedin.com/in/mauriciobimbu/" target="_blank" rel="noopener noreferrer" className={styles.linkedinBtn}>
              {t.contactLinkedinBtn}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerLogo}>MB.</div>
          <p>© {new Date().getFullYear()} Mauricio Garcia Bimbu. {t.footerRights} | v1</p>
          <p style={{ marginTop: '0.5rem' }}>{t.footerSubtitle}</p>
        </div>
      </footer>
    </>
  );
}
