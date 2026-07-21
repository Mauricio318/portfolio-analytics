'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  User,
  Tags,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink
} from 'lucide-react';

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

export default function AdminAcademicClient() {
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Estado para seções recolhidas/fechadas
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  const toggleSectionCollapse = (sectionId: number) => {
    setCollapsedSections(prev => {
      const isCurrentlyClosed = prev[sectionId] !== false;
      return {
        ...prev,
        [sectionId]: isCurrentlyClosed ? false : true
      };
    });
  };

  const collapseAllSections = () => {
    setCollapsedSections({});
  };

  const expandAllSections = () => {
    const next: Record<number, boolean> = {};
    sections.forEach(s => { next[s.id] = false; });
    setCollapsedSections(next);
  };

  // Estados para Configurações de Perfil Acadêmico
  const [profileSettings, setProfileSettings] = useState({
    academic_name: '',
    academic_role_pt: '',
    academic_role_en: '',
    academic_location: '',
    academic_institution: '',
    academic_lattes_id: '',
    academic_lattes_url: '',
    academic_doi_id: '',
    academic_doi_url: '',
    academic_lattes_pdf: '',
    academic_citations: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Estados para formulários de Seção
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title_pt: '',
    title_en: '',
    type: 'list' as 'text' | 'list',
    position: 'center' as 'center' | 'sidebar',
    content_pt: '',
    content_en: '',
    tags: '',
    show_limit: 3
  });

  // Estados para formulários de Itens
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemFormSectionId, setItemFormSectionId] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    title_pt: '',
    title_en: '',
    subtitle_pt: '',
    subtitle_en: '',
    description_pt: '',
    description_en: '',
    tags: '',
    link: '',
    period: ''
  });

  // Carrega seções, configurações e estatísticas do servidor
  const loadData = async () => {
    try {
      const res = await fetch('/api/academico', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
        
        const s = data.settings || {};
        setProfileSettings({
          academic_name: s.academic_name || '',
          academic_role_pt: s.academic_role_pt || '',
          academic_role_en: s.academic_role_en || '',
          academic_location: s.academic_location || '',
          academic_institution: s.academic_institution || '',
          academic_lattes_id: s.academic_lattes_id || '',
          academic_lattes_url: s.academic_lattes_url || '',
          academic_doi_id: s.academic_doi_id || '',
          academic_doi_url: s.academic_doi_url || '',
          academic_lattes_pdf: s.academic_lattes_pdf || '',
          academic_citations: s.academic_citations || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats?page=/academico');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  // Salvar configurações de perfil
  const handleProfileSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: profileSettings
        })
      });
      if (res.ok) {
        alert('Configurações de perfil científico salvas com sucesso!');
      } else if (res.status === 401) {
        alert('Sua sessão de administrador expirou. Por favor, faça login novamente no painel admin.');
        window.location.href = '/admin/login';
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Erro ao salvar configurações.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao se conectar ao servidor.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?type=lattes', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfileSettings(prev => ({ ...prev, academic_lattes_pdf: data.filePath }));
        alert('Arquivo PDF do Lattes enviado com sucesso!');
      } else {
        alert('Erro ao fazer upload do PDF.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão de upload.');
    }
  };

  // Criar ou atualizar Seção
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSectionId) {
        await fetch('/api/academico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_section',
            id: editingSectionId,
            ...sectionForm
          })
        });
      } else {
        await fetch('/api/academico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_section',
            ...sectionForm
          })
        });
      }

      setEditingSectionId(null);
      setSectionForm({
        title_pt: '',
        title_en: '',
        type: 'list',
        position: 'center',
        content_pt: '',
        content_en: '',
        tags: '',
        show_limit: 3
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSectionStart = (sec: AcademicSection) => {
    setEditingSectionId(sec.id);
    setSectionForm({
      title_pt: sec.title_pt,
      title_en: sec.title_en,
      type: sec.type,
      position: sec.position,
      content_pt: sec.content_pt || '',
      content_en: sec.content_en || '',
      tags: sec.tags || '',
      show_limit: sec.show_limit !== undefined && sec.show_limit !== null ? sec.show_limit : 3
    });
    setCollapsedSections(prev => ({ ...prev, [sec.id]: false }));
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta seção inteira e todos os seus itens?')) return;
    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_section',
          id
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSectionVisibility = async (sec: AcademicSection) => {
    const newVisible = sec.is_visible === 0 ? 1 : 0;
    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_section_visibility', id: sec.id, is_visible: newVisible })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleItemVisibility = async (item: AcademicSectionItem) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_item_visibility', id: item.id, is_visible: newVisible })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderSections = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((s, idx) => { s.sort_order = idx + 1; });

    setSections(newSections);

    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder_sections',
          order: newSections.map(s => ({ id: s.id, sort_order: s.sort_order }))
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Criar ou atualizar Item de Seção
  const handleItemSubmit = async (e: React.FormEvent, sectionId: number) => {
    e.preventDefault();
    try {
      if (editingItemId) {
        await fetch('/api/academico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_item',
            id: editingItemId,
            ...itemForm
          })
        });
      } else {
        await fetch('/api/academico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_item',
            section_id: sectionId,
            ...itemForm
          })
        });
      }

      setEditingItemId(null);
      setItemFormSectionId(null);
      setItemForm({
        title_pt: '',
        title_en: '',
        subtitle_pt: '',
        subtitle_en: '',
        description_pt: '',
        description_en: '',
        tags: '',
        link: '',
        period: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditItemStart = (item: AcademicSectionItem) => {
    setEditingItemId(item.id);
    setItemFormSectionId(item.section_id);
    setItemForm({
      title_pt: item.title_pt,
      title_en: item.title_en,
      subtitle_pt: item.subtitle_pt || '',
      subtitle_en: item.subtitle_en || '',
      description_pt: item.description_pt || '',
      description_en: item.description_en || '',
      tags: item.tags || '',
      link: item.link || '',
      period: item.period || ''
    });
    setCollapsedSections(prev => ({ ...prev, [item.section_id]: false }));
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Deseja realmente excluir este item?')) return;
    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_item',
          id
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderItems = async (secIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const sec = sections[secIndex];
    const newItems = [...sec.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[itemIndex];
    newItems[itemIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    newItems.forEach((it, idx) => { it.sort_order = idx + 1; });

    const newSections = [...sections];
    newSections[secIndex].items = newItems;
    setSections(newSections);

    try {
      await fetch('/api/academico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder_items',
          order: newItems.map(i => ({ id: i.id, sort_order: i.sort_order }))
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const barRow = (label: string, count: number, total: number, color: string) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div key={label} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
          <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
        </div>
        <div style={{ background: 'color-mix(in srgb, var(--border) 60%, transparent)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    );
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--card-shadow)',
    marginBottom: '2rem'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
    display: 'block'
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.65rem 0.9rem',
    border: '1px solid color-mix(in srgb, var(--text-main) 18%, var(--border))',
    borderRadius: '8px',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out'
  };

  return (
    <div style={{ color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            👨‍🏫 Gerenciar Currículo Acadêmico (Lattes)
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Controle de acessos do Lattes, dados do perfil científico e criação/ordenação de seções dinâmicas.
          </p>
        </div>
        <a 
          href="/academico" 
          target="_blank" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--accent)', 
            color: '#fff', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '8px', 
            fontWeight: 700, 
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 10px var(--accent-glow)'
          }}
        >
          <span>Visualizar Página</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* 1. VISITOR ANALYTICS SECTION */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 Visitas à Rota Acadêmica (/academico)
        </h2>

        {loadingStats ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando estatísticas...</div>
        ) : !stats ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sem estatísticas registradas.</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Acessos Acadêmicos</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>{stats.total}</div>
              </div>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidades Distintas</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                  {stats.recent.reduce((acc: string[], curr: any) => acc.includes(curr.city) ? acc : [...acc, curr.city], []).length}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>Dispositivos</h4>
                {stats.byDevice.map((r: any) => barRow(r.device, r.count, stats.total, '#10b981'))}
              </div>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>Navegadores</h4>
                {stats.byBrowser.map((r: any) => barRow(r.browser, r.count, stats.total, '#f59e0b'))}
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: 700 }}>Últimas Visitas à Página</h4>
            <div style={{ overflowX: 'auto', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: 'var(--bg-secondary)' }}>
                    {['País', 'Cidade', 'Dispositivo', 'Navegador', 'Data/Hora'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum log recente.</td></tr>
                  ) : stats.recent.slice(0, 5).map((v: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{v.country}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{v.city}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{v.device}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{v.browser}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(v.visited_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC PROFILE HEADER FORM */}
      <form onSubmit={handleProfileSettingsSubmit} style={cardStyle}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} />
          Dados do Perfil Acadêmico
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nome Completo:</label>
            <input 
              type="text"
              value={profileSettings.academic_name}
              onChange={e => setProfileSettings({ ...profileSettings, academic_name: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Localização (Cidade/Estado):</label>
            <input 
              type="text"
              value={profileSettings.academic_location}
              onChange={e => setProfileSettings({ ...profileSettings, academic_location: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Instituição Principal / Grupo de Pesquisa:</label>
            <input 
              type="text"
              value={profileSettings.academic_institution}
              onChange={e => setProfileSettings({ ...profileSettings, academic_institution: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Cargo Acadêmico (Português):</label>
            <input 
              type="text"
              value={profileSettings.academic_role_pt}
              onChange={e => setProfileSettings({ ...profileSettings, academic_role_pt: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cargo Acadêmico (Inglês - Opcional):</label>
            <input 
              type="text"
              value={profileSettings.academic_role_en}
              onChange={e => setProfileSettings({ ...profileSettings, academic_role_en: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>ID Lattes CNPq:</label>
            <input 
              type="text"
              value={profileSettings.academic_lattes_id}
              onChange={e => setProfileSettings({ ...profileSettings, academic_lattes_id: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Link do Lattes CNPq:</label>
            <input 
              type="url"
              value={profileSettings.academic_lattes_url}
              onChange={e => setProfileSettings({ ...profileSettings, academic_lattes_url: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Nome em Citações Bibliográficas (Opcional):</label>
            <input 
              type="text"
              placeholder="Ex: BIMBU, M. G."
              value={profileSettings.academic_citations}
              onChange={e => setProfileSettings({ ...profileSettings, academic_citations: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>ID DOI / ORCID (Opcional):</label>
            <input 
              type="text"
              placeholder="Ex: 0000-0002-9506-6947"
              value={profileSettings.academic_doi_id}
              onChange={e => setProfileSettings({ ...profileSettings, academic_doi_id: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Link do DOI / ORCID (Opcional):</label>
            <input 
              type="url"
              placeholder="Ex: https://orcid.org/0000-0002-..."
              value={profileSettings.academic_doi_url}
              onChange={e => setProfileSettings({ ...profileSettings, academic_doi_url: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Currículo Lattes em PDF (Link ou faça Upload ao lado):</label>
            <input 
              type="text"
              placeholder="Ex: /uploads/lattes/meu_cv.pdf"
              value={profileSettings.academic_lattes_pdf}
              onChange={e => setProfileSettings({ ...profileSettings, academic_lattes_pdf: e.target.value })}
              style={inputStyle}
            />
            {profileSettings.academic_lattes_pdf && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ PDF Carregado</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente remover o PDF atual?')) {
                      setProfileSettings(prev => ({ ...prev, academic_lattes_pdf: '' }));
                    }
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Remover / Excluir
                </button>
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Enviar arquivo PDF do Lattes:</label>
            <input 
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              style={{
                ...inputStyle,
                padding: '0.45rem',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        <button type="submit" disabled={savingSettings} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px var(--accent-glow)', fontSize: '0.9rem' }}>
          <Save size={18} />
          {savingSettings ? 'Salvando...' : 'Salvar Dados do Cabeçalho'}
        </button>
      </form>

      {/* 3. CREATE/EDIT SECTION FORM */}
      <form onSubmit={handleSectionSubmit} style={cardStyle}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editingSectionId ? <Edit2 size={20} /> : <Plus size={20} />}
          {editingSectionId ? 'Editar Seção Acadêmica' : 'Adicionar Nova Seção'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Título (Português):</label>
            <input 
              type="text"
              value={sectionForm.title_pt}
              onChange={e => setSectionForm({ ...sectionForm, title_pt: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Título (Inglês):</label>
            <input 
              type="text"
              value={sectionForm.title_en}
              onChange={e => setSectionForm({ ...sectionForm, title_en: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Posicionamento da Seção:</label>
            <select
              value={sectionForm.position}
              onChange={e => setSectionForm({ ...sectionForm, position: e.target.value as 'center' | 'sidebar' })}
              style={inputStyle}
            >
              <option value="center">Centro (Coluna Larga)</option>
              <option value="sidebar">Lateral (Coluna Estreita)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo de Conteúdo:</label>
            <select
              value={sectionForm.type}
              onChange={e => setSectionForm({ ...sectionForm, type: e.target.value as 'text' | 'list' })}
              disabled={!!editingSectionId}
              style={inputStyle}
            >
              <option value="list">Lista de Itens Estruturados (Educação, Projetos, etc)</option>
              <option value="text">Bloco de Texto Simples (Sobre Mim, Resumo)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: sectionForm.type === 'list' ? '2fr 1fr' : '1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>
              Tags Globais da Seção (opcional, separadas por vírgula):
            </label>
            <input 
              type="text"
              placeholder="Ex: pesquisa, mestrado, cnpq"
              value={sectionForm.tags}
              onChange={e => setSectionForm({ ...sectionForm, tags: e.target.value })}
              style={inputStyle}
            />
          </div>
          {sectionForm.type === 'list' && (
            <div>
              <label style={labelStyle}>
                Limite de Exibição Inicial (Ver Mais):
              </label>
              <input 
                type="number"
                min="1"
                max="20"
                value={sectionForm.show_limit}
                onChange={e => setSectionForm({ ...sectionForm, show_limit: parseInt(e.target.value) || 3 })}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        {sectionForm.type === 'text' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Texto do Resumo / Sobre Mim (Português):</label>
              <textarea 
                value={sectionForm.content_pt}
                onChange={e => setSectionForm({ ...sectionForm, content_pt: e.target.value })}
                required
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Texto do Resumo / Sobre Mim (Inglês - Opcional):</label>
              <textarea 
                value={sectionForm.content_en}
                onChange={e => setSectionForm({ ...sectionForm, content_en: e.target.value })}
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            {editingSectionId ? 'Salvar Alterações' : 'Adicionar Seção'}
          </button>
          {editingSectionId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingSectionId(null);
                setSectionForm({ title_pt: '', title_en: '', type: 'list', position: 'center', content_pt: '', content_en: '', tags: '', show_limit: 3 });
              }} 
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--border)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* 4. SECTIONS AND ITEMS MANAGEMENT */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Carregando dados acadêmicos...</div>
      ) : (
        <div>
          {/* Controls to Expand / Collapse All Sections */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0.85rem 1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📚 Seções Acadêmicas ({sections.length})
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={expandAllSections}
                style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ChevronDown size={14} /> Expandir Todas
              </button>
              <button
                type="button"
                onClick={collapseAllSections}
                style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ChevronUp size={14} /> Recolher Todas
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sections.map((sec, secIndex) => {
              const isCollapsed = collapsedSections[sec.id] !== false && itemFormSectionId !== sec.id;
              
              return (
                <div key={sec.id} style={{ ...cardStyle, marginBottom: 0 }}>
                  
                  {/* Section Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isCollapsed ? 'none' : '2px solid var(--border)', paddingBottom: isCollapsed ? '0' : '1rem', marginBottom: isCollapsed ? '0' : '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div 
                      onClick={() => toggleSectionCollapse(sec.id)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                    >
                      <button
                        type="button"
                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem', display: 'inline-flex', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                          {sec.title_pt} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>({sec.title_en})</span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', background: 'var(--accent-glow)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {sec.type === 'list' ? `Lista (${sec.items?.length || 0} itens)` : 'Texto Livre'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {sec.position === 'center' ? 'Centro' : 'Lateral'}
                          </span>
                          {sec.type === 'list' && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              Limite: {sec.show_limit !== undefined && sec.show_limit !== null ? sec.show_limit : 3} itens
                            </span>
                          )}
                          {sec.tags && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Tags size={10} /> Tags: {sec.tags}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleSectionVisibility(sec); }} 
                        style={{ padding: '0.4rem 0.75rem', background: sec.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (sec.is_visible === 0 ? '#ef4444' : '#10b981'), color: sec.is_visible === 0 ? '#ef4444' : '#10b981', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                        title="Alternar Visibilidade da Seção no Lattes"
                      >
                        {sec.is_visible === 0 ? '👁️‍🗨️ Seção Oculta' : '👁️ Seção Visível'}
                      </button>
                      <button 
                        disabled={secIndex === 0} 
                        onClick={() => handleReorderSections(secIndex, 'up')} 
                        style={{ padding: '0.45rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        disabled={secIndex === sections.length - 1} 
                        onClick={() => handleReorderSections(secIndex, 'down')} 
                        style={{ padding: '0.45rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditSectionStart(sec)} 
                        style={{ padding: '0.45rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(sec.id)} 
                        style={{ padding: '0.45rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignSelf: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content - Hidden if Collapsed */}
                  {!isCollapsed && (
                    <div style={{ marginTop: '1rem' }}>
                      
                      {/* Section Content: If type is 'text' */}
                      {sec.type === 'text' && (
                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '8px', fontSize: '0.95rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                          {sec.content_pt}
                        </div>
                      )}

                      {/* Section Content: If type is 'list' */}
                      {sec.type === 'list' && (
                        <div>
                          
                          {/* Items List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                            {sec.items.length === 0 ? (
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Nenhum item cadastrado nesta seção.</p>
                            ) : sec.items.map((item, itemIdx) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.85rem 1.25rem', borderRadius: '8px', opacity: item.is_visible === 0 ? 0.6 : 1 }}>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {item.title_pt} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({item.title_en})</span>
                                    <span style={{ fontSize:'0.7rem', padding:'0.1rem 0.4rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius:'12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                      {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem', fontSize: '0.78rem' }}>
                                    {item.period && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{item.period}</span>}
                                    {item.subtitle_pt && <span style={{ color: 'var(--text-muted)' }}>• {item.subtitle_pt}</span>}
                                    {item.link && (
                                      <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Link</a>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                  <button 
                                    onClick={() => handleToggleItemVisibility(item)} 
                                    style={{ padding: '0.3rem 0.55rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), color: item.is_visible === 0 ? '#ef4444' : '#10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                                    title="Alternar Visibilidade do Item"
                                  >
                                    {item.is_visible === 0 ? '👁️‍🗨️ Exibir' : '👁️ Ocultar'}
                                  </button>
                                  <button 
                                    disabled={itemIdx === 0} 
                                    onClick={() => handleReorderItems(secIndex, itemIdx, 'up')}
                                    style={{ padding: '0.35rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex' }}
                                  >
                                    <ArrowUp size={14} />
                                  </button>
                                  <button 
                                    disabled={itemIdx === sec.items.length - 1} 
                                    onClick={() => handleReorderItems(secIndex, itemIdx, 'down')}
                                    style={{ padding: '0.35rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex' }}
                                  >
                                    <ArrowDown size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleEditItemStart(item)}
                                    style={{ padding: '0.35rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex' }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    style={{ padding: '0.35rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: '#ef4444', cursor: 'pointer', display: 'inline-flex' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Item Add/Edit Form */}
                          <form onSubmit={e => handleItemSubmit(e, sec.id)} style={{ background: 'var(--bg-main)', border: '1px dashed var(--border)', padding: '1.25rem', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {itemFormSectionId === sec.id && editingItemId ? <Edit2 size={16} /> : <Plus size={16} />}
                              {itemFormSectionId === sec.id && editingItemId ? 'Editar Item da Seção' : 'Adicionar Novo Item nesta Seção'}
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                              <div>
                                <label style={labelStyle}>Título (Português):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: Mestrado em Ciência da Computação"
                                  value={itemFormSectionId === sec.id ? itemForm.title_pt : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, title_pt: e.target.value });
                                  }}
                                  required
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Título (Inglês):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: M.Sc. in Computer Science"
                                  value={itemFormSectionId === sec.id ? itemForm.title_en : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, title_en: e.target.value });
                                  }}
                                  required
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                              <div>
                                <label style={labelStyle}>Subtítulo/Instituição (Português):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: Universidade de São Paulo (USP)"
                                  value={itemFormSectionId === sec.id ? itemForm.subtitle_pt : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, subtitle_pt: e.target.value });
                                  }}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Subtítulo/Instituição (Inglês):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: University of São Paulo (USP)"
                                  value={itemFormSectionId === sec.id ? itemForm.subtitle_en : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, subtitle_en: e.target.value });
                                  }}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                              <div>
                                <label style={labelStyle}>Período/Ano (Ex: '2024 - Atual'):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: 2024 - Atual"
                                  value={itemFormSectionId === sec.id ? itemForm.period : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, period: e.target.value });
                                  }}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Tags/Assuntos (Separados por vírgula):</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: Python, Pesquisa, Banco de Dados"
                                  value={itemFormSectionId === sec.id ? itemForm.tags : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, tags: e.target.value });
                                  }}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                              <label style={labelStyle}>Link Externo (URL Opcional):</label>
                              <input 
                                type="url"
                                placeholder="Ex: https://lattes.cnpq.br/..."
                                value={itemFormSectionId === sec.id ? itemForm.link : ''}
                                onChange={e => {
                                  setItemFormSectionId(sec.id);
                                  setItemForm({ ...itemForm, link: e.target.value });
                                }}
                                style={inputStyle}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                              <div>
                                <label style={labelStyle}>Descrição/Detalhes (Português):</label>
                                <textarea 
                                  placeholder="Detalhes..."
                                  value={itemFormSectionId === sec.id ? itemForm.description_pt : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, description_pt: e.target.value });
                                  }}
                                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Descrição/Detalhes (Inglês):</label>
                                <textarea 
                                  placeholder="Details..."
                                  value={itemFormSectionId === sec.id ? itemForm.description_en : ''}
                                  onChange={e => {
                                    setItemFormSectionId(sec.id);
                                    setItemForm({ ...itemForm, description_en: e.target.value });
                                  }}
                                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                />
                              </div>
                            </div>

                            {itemFormSectionId === sec.id && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={{ padding: '0.55rem 1.25rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                                  {editingItemId ? 'Salvar Item' : 'Confirmar Novo Item'}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setItemFormSectionId(null);
                                    setItemForm({ title_pt: '', title_en: '', subtitle_pt: '', subtitle_en: '', description_pt: '', description_en: '', tags: '', link: '', period: '' });
                                  }} 
                                  style={{ padding: '0.55rem 1.25rem', backgroundColor: 'var(--border)', color: 'var(--text-main)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </form>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
