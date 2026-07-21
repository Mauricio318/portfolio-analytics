'use client';
import { useState, useEffect } from 'react';

export default function ResumeAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [form, setForm] = useState({ type: 'job', title: '', institution: '', start_date: '', end_date: '', description: '', technologies: '', image_url: '', link: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // CV PDF & Visibility Settings states
  const [cvUrl, setCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [profile, setProfile] = useState({ name: '', roles: '', bio: '', conceptText: '', email: '', linkedin: '' });
  const [visibleJobsCount, setVisibleJobsCount] = useState('auto');
  const [visibleAcademicCount, setVisibleAcademicCount] = useState('auto');
  const [limitCertifications, setLimitCertifications] = useState('3');
  const [limitCourses, setLimitCourses] = useState('3');
  const [experienceSubtitle, setExperienceSubtitle] = useState('');

  const [socials, setSocials] = useState({
    github: 'https://github.com/mauriciobimbu',
    linkedin: 'https://www.linkedin.com/in/mauriciobimbu/',
    kaggle: 'https://www.kaggle.com/mauriciobimbu',
    medium: '',
    orcid: 'https://orcid.org/0009-0004-9721-6577',
    lattes: 'http://lattes.cnpq.br/3472099307775988',
    whatsapp: '',
    email: 'mauriciozinibu@gmail.com'
  });
  const [savingSocials, setSavingSocials] = useState(false);

  const loadItems = async () => {
    const res = await fetch('/api/resume?admin=true', { cache: 'no-store' });
    if (res.ok) setItems(await res.json());
  };

  const loadCvSetting = async () => {
    const res = await fetch('/api/settings', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setCvUrl(data.cv_url || '');
      setVisibleJobsCount(data.visible_jobs_count || 'auto');
      setVisibleAcademicCount(data.visible_academic_count || 'auto');
      setLimitCertifications(data.limit_certifications || '3');
      setLimitCourses(data.limit_courses || '3');
      setExperienceSubtitle(data.experience_subtitle || 'Estes são os principais pontos de ganho de experiência e títulos que obtive durante minha jornada até hoje...');
      setProfile({
        name: data.name || '',
        roles: data.roles || '',
        bio: data.bio || '',
        conceptText: data.profile_concept_text || 'Sigo o conceito T-Shaped, pois acredito que a capacidade de produzir soluções eficazes e eficientes dependem fundamentalmente dos conhecimentos previamente adquiridos.',
        email: data.email || data.contact_email || 'mauriciozinibu@gmail.com',
        linkedin: data.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/'
      });
      setSocials({
        github: data.github_url || 'https://github.com/mauriciobimbu',
        linkedin: data.linkedin_url || data.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/',
        kaggle: data.kaggle_url || 'https://www.kaggle.com/mauriciobimbu',
        medium: data.medium_url || '',
        orcid: data.orcid_url || 'https://orcid.org/0009-0004-9721-6577',
        lattes: data.lattes_url || 'http://lattes.cnpq.br/3472099307775988',
        whatsapp: data.whatsapp_url || '',
        email: data.email || data.contact_email || 'mauriciozinibu@gmail.com'
      });
    }
  };

  useEffect(() => {
    loadItems();
    loadCvSetting();
  }, []);

  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'name', value: profile.name })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'roles', value: profile.roles })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'bio', value: profile.bio })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'profile_concept_text', value: profile.conceptText })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'email', value: profile.email })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'contact_email', value: profile.email })
      });
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'linkedin', value: profile.linkedin })
      });
      alert('Perfil e contatos atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações de perfil.');
    }
  };

  const handleCvUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCv(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?type=cv', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const path = data.filePath;
        
        const saveRes = await fetch('/api/settings', {
          method: 'POST',
          body: JSON.stringify({ key: 'cv_url', value: path })
        });
        
        if (saveRes.ok) {
          setCvUrl(path);
          alert('Currículo em PDF carregado com sucesso!');
        } else {
          alert('Erro ao salvar configuração do currículo.');
        }
      } else {
        alert('Erro ao fazer upload do currículo.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão para upload.');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleCvRemove = async () => {
    if (!confirm('Deseja realmente remover o currículo em PDF?')) return;
    try {
      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'cv_url', value: '' })
      });
      if (saveRes.ok) {
        setCvUrl('');
        alert('Currículo em PDF removido com sucesso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao remover currículo.');
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const folderType = form.type === 'certification' ? 'certifications' : 'courses';

    try {
      const res = await fetch(`/api/upload?type=${folderType}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image_url: data.filePath }));
        alert('Imagem carregada com sucesso!');
      } else {
        alert('Erro ao fazer upload da imagem.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão para upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/resume', {
        method: 'PUT',
        body: JSON.stringify({ id: editingId, ...form })
      });
      setEditingId(null);
    } else {
      await fetch('/api/resume', { method: 'POST', body: JSON.stringify(form) });
    }
    
    setForm(prev => ({ 
      type: prev.type, 
      title: '', 
      institution: '', 
      start_date: '', 
      end_date: '', 
      description: '', 
      technologies: '', 
      image_url: '',
      link: ''
    }));
    loadItems();
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      institution: item.institution,
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      description: item.description || '',
      technologies: item.technologies || '',
      image_url: item.image_url || '',
      link: item.link || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(prev => ({
      type: prev.type,
      title: '',
      institution: '',
      start_date: '',
      end_date: '',
      description: '',
      technologies: '',
      image_url: '',
      link: ''
    }));
  };

  const handleToggleVisibility = async (item: any) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', id: item.id, is_visible: newVisible })
    });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_visible: newVisible } : i));
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Certeza que deseja deletar este item?')) return;
    await fetch(`/api/resume?id=${id}`, { method: 'DELETE' });
    loadItems();
  };

  const filteredItems = filterType === 'all' 
    ? items 
    : items.filter(item => item.type === filterType);

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const activeList = filteredItems;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeList.length) return;

    const itemA = activeList[index];
    const itemB = activeList[targetIndex];

    const mainIndexA = items.findIndex(i => i.id === itemA.id);
    const mainIndexB = items.findIndex(i => i.id === itemB.id);

    if (mainIndexA === -1 || mainIndexB === -1) return;

    const newItems = [...items];
    const temp = newItems[mainIndexA];
    newItems[mainIndexA] = newItems[mainIndexB];
    newItems[mainIndexB] = temp;

    const order = newItems.map((item, i) => ({ id: item.id, sort_order: i + 1 }));
    setItems(newItems);

    await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order })
    });
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'job': return 'Experiência Profissional';
      case 'academic': return 'Formação Acadêmica';
      case 'certification': return 'Certificação';
      case 'course': return 'Curso Complementar';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'academic': return { bg: '#fef3c7', text: '#d97706' };
      case 'certification': return { bg: '#dcfce3', text: '#166534' };
      case 'course': return { bg: '#f3e8ff', text: '#6b21a8' };
      default: return { bg: '#e2e8f0', text: '#475569' };
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Gerenciar Currículo (Trajetória Profissional)</h1>
      
      {/* CV PDF Upload Section */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📄 Currículo em PDF (Download para Recrutadores)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Faça o upload do seu arquivo de currículo em formato PDF. Este arquivo ficará disponível para download dos recrutadores através do botão "Baixar CV" no site público.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="file" accept=".pdf" onChange={handleCvUpload} style={{ fontSize: '0.9rem', color: 'var(--text-main)' }} />
          {uploadingCv && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carregando PDF...</span>}
          {cvUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                ✓ Currículo ativo: <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--accent)' }}>{cvUrl.split('/').pop()}</a>
              </span>
              <button type="button" onClick={handleCvRemove} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Remover PDF
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>
              Nenhum PDF carregado atualmente.
            </span>
          )}
        </div>
      </div>

      {/* Visibility Controls Section */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚙️ Controle de Exibição Inicial (Experiência & Formação)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Defina quantos itens de Experiência Profissional e Formação Acadêmica serão exibidos antes do botão "Ver mais".
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Experiências Profissionais Visíveis Inicialmente:
            </label>
            <select 
              value={visibleJobsCount} 
              onChange={e => setVisibleJobsCount(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="auto">Automático (Igualar à altura da Formação Acadêmica)</option>
              <option value="1">1 item inicial</option>
              <option value="2">2 itens iniciais</option>
              <option value="3">3 itens iniciais</option>
              <option value="4">4 itens iniciais</option>
              <option value="5">5 itens iniciais</option>
              <option value="999">Exibir Todos (Sem botão ver mais)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Formações Acadêmicas Visíveis Inicialmente:
            </label>
            <select 
              value={visibleAcademicCount} 
              onChange={e => setVisibleAcademicCount(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="auto">Exibir Todas (Padrão)</option>
              <option value="1">1 item inicial</option>
              <option value="2">2 itens iniciais</option>
              <option value="3">3 itens iniciais</option>
              <option value="4">4 itens iniciais</option>
              <option value="5">5 itens iniciais</option>
              <option value="999">Exibir Todas</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Certificações Oficiais Visíveis Inicialmente:
            </label>
            <select 
              value={limitCertifications} 
              onChange={e => setLimitCertifications(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="3">3 certificações (Padrão)</option>
              <option value="6">6 certificações</option>
              <option value="9">9 certificações</option>
              <option value="999">Exibir Todas (Sem botão ver mais)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Cursos Complementares Visíveis Inicialmente:
            </label>
            <select 
              value={limitCourses} 
              onChange={e => setLimitCourses(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="3">3 cursos (Padrão)</option>
              <option value="6">6 cursos</option>
              <option value="9">9 cursos</option>
              <option value="999">Exibir Todos (Sem botão ver mais)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--accent)' }}>
            📝 Texto Introdutório da Seção de Trajetória / Experiência:
          </label>
          <textarea 
            rows={2}
            value={experienceSubtitle} 
            onChange={e => setExperienceSubtitle(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          />
        </div>

        <button 
          type="button" 
          onClick={async () => {
            await Promise.all([
              fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'visible_jobs_count', value: visibleJobsCount }) }),
              fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'visible_academic_count', value: visibleAcademicCount }) }),
              fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'limit_certifications', value: limitCertifications }) }),
              fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'limit_courses', value: limitCourses }) }),
              fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'experience_subtitle', value: experienceSubtitle }) })
            ]);
            alert('Configurações de exibição e textos salvas com sucesso!');
          }}
          style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Salvar Configurações da Seção
        </button>
      </div>

      {/* Profile Settings Section */}
      <form onSubmit={handleProfileSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 Informações do Perfil (Nome, Cargo, Biografia)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Edite o seu nome, cargos listados e o texto da sua biografia exibidos na página inicial do portfólio.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Nome Completo:</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={e => setProfile({ ...profile, name: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Cargos (Separados por vírgula):</label>
            <input 
              type="text" 
              value={profile.roles} 
              onChange={e => setProfile({ ...profile, roles: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>E-mail de Contato:</label>
            <input 
              type="email" 
              value={profile.email} 
              onChange={e => setProfile({ ...profile, email: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Link do Perfil LinkedIn:</label>
            <input 
              type="url" 
              value={profile.linkedin} 
              onChange={e => setProfile({ ...profile, linkedin: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Biografia:</label>
          <textarea 
            value={profile.bio} 
            onChange={e => setProfile({ ...profile, bio: e.target.value })} 
            required 
            style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', minHeight: '90px', lineHeight: '1.5', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            💡 Citação de Destaque no Perfil:
          </label>
          <textarea 
            rows={2}
            value={profile.conceptText} 
            onChange={e => setProfile({ ...profile, conceptText: e.target.value })} 
            required 
            style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', lineHeight: '1.5', color: 'var(--text-main)', background: 'var(--bg-secondary)', fontStyle: 'italic' }} 
          />
        </div>

        <div>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Perfil
          </button>
        </div>
      </form>

      {/* Social Networks & Links Manager */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔗 Gerenciador Central de Redes Sociais & Links Úteis
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Gerencie os links exibidos nos botões do cabeçalho, hero, seção de contato e rodapé do seu portfólio.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>GitHub URL:</label>
            <input type="url" value={socials.github} onChange={e => setSocials({ ...socials, github: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>LinkedIn URL:</label>
            <input type="url" value={socials.linkedin} onChange={e => setSocials({ ...socials, linkedin: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kaggle URL:</label>
            <input type="url" value={socials.kaggle} onChange={e => setSocials({ ...socials, kaggle: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Medium / Blog URL:</label>
            <input type="url" value={socials.medium} onChange={e => setSocials({ ...socials, medium: e.target.value })} placeholder="https://medium.com/@seu-perfil" style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>ORCID URL:</label>
            <input type="url" value={socials.orcid} onChange={e => setSocials({ ...socials, orcid: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Currículo Lattes URL:</label>
            <input type="url" value={socials.lattes} onChange={e => setSocials({ ...socials, lattes: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>WhatsApp Direct Link ou Número:</label>
            <input type="text" value={socials.whatsapp} onChange={e => setSocials({ ...socials, whatsapp: e.target.value })} placeholder="ex: https://wa.me/5585999999999" style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>E-mail de Contato:</label>
            <input type="email" value={socials.email} onChange={e => setSocials({ ...socials, email: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }} />
          </div>
        </div>

        <button 
          type="button" 
          disabled={savingSocials}
          onClick={async () => {
            setSavingSocials(true);
            try {
              await Promise.all([
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'github_url', value: socials.github }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'linkedin_url', value: socials.linkedin }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'linkedin', value: socials.linkedin }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'kaggle_url', value: socials.kaggle }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'medium_url', value: socials.medium }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'orcid_url', value: socials.orcid }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'lattes_url', value: socials.lattes }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'whatsapp_url', value: socials.whatsapp }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'email', value: socials.email }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'contact_email', value: socials.email }) })
              ]);
              alert('Links de Redes Sociais salvos com sucesso!');
            } catch (err) {
              alert('Erro ao salvar redes sociais.');
            } finally {
              setSavingSocials(false);
            }
          }}
          style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {savingSocials ? 'Salvando Links...' : 'Salvar Redes Sociais'}
        </button>
      </div>

      {/* Trajectory Items Admin Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏫 Adicionar ou Editar Etapa da Trajetória
        </h2>
        <div style={{display:'flex', gap:'1rem', flexWrap: 'wrap'}}>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value, image_url: ''})} style={{padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', background: 'var(--bg-main)', color: 'var(--text-main)'}}>
            <option value="job" style={{color: 'var(--text-main)', background: 'var(--bg-secondary)'}}>Experiência Profissional</option>
            <option value="academic" style={{color: 'var(--text-main)', background: 'var(--bg-secondary)'}}>Formação Acadêmica</option>
            <option value="certification" style={{color: 'var(--text-main)', background: 'var(--bg-secondary)'}}>Certificação Oficial</option>
            <option value="course" style={{color: 'var(--text-main)', background: 'var(--bg-secondary)'}}>Curso Complementar</option>
          </select>
          <input placeholder="Cargo / Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          <input placeholder="Empresa / Instituição" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} required style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
        </div>
        <div style={{display:'flex', gap:'1rem'}}>
          <input placeholder="Data Início (ex: 02/2018)" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required style={{flex:1, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          <input placeholder="Data Fim (ex: Atual)" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={{flex:1, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
        </div>
        <textarea placeholder="Descrição das responsabilidades ou conquistas." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required style={{padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', minHeight: '80px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
        <div style={{display:'flex', gap:'1rem', alignItems: 'center', flexWrap: 'wrap'}}>
          <input placeholder="Ferramentas (Ex: Python, Airflow) - Separadas por vírgula" value={form.technologies} onChange={e => setForm({...form, technologies: e.target.value})} style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          <input placeholder="Link / Credencial (URL de verificação)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          
          {['certification', 'course'].includes(form.type) && (
            <div style={{flex:2, display:'flex', gap:'1rem', flexWrap:'wrap', width:'100%'}}>
              <div style={{flex:2, display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--text-muted)'}}>URL da Imagem / Selo:</label>
                <input 
                  placeholder="Cole uma URL da web (Microsoft, Credly) ou use o upload ao lado" 
                  value={form.image_url} 
                  onChange={e => setForm({...form, image_url: e.target.value})} 
                  style={{padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', fontSize:'0.85rem', color: 'var(--text-main)', background: 'var(--bg-main)'}} 
                />
              </div>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--text-muted)'}}>Ou Upload de Arquivo:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize:'0.8rem', padding:'0.5rem 0', color: 'var(--text-main)'}} />
                {form.image_url && form.image_url.startsWith('/') && (
                  <span style={{fontSize:'0.7rem', color:'#10b981'}}>✓ Arquivo local enviado</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer', fontWeight: 600 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Item'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer', fontWeight: 600 }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
          🔍 Filtrar Categoria:
        </span>
        {[
          { key: 'all', label: 'Todos os Itens', count: items.length },
          { key: 'job', label: '💼 Experiência Profissional', count: items.filter(i => i.type === 'job').length },
          { key: 'academic', label: '🎓 Formação Acadêmica', count: items.filter(i => i.type === 'academic').length },
          { key: 'certification', label: '📜 Certificações', count: items.filter(i => i.type === 'certification').length },
          { key: 'course', label: '📚 Cursos Complementares', count: items.filter(i => i.type === 'course').length },
        ].map(cat => {
          const isActive = filterType === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterType(cat.key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
                background: isActive ? 'var(--accent)' : 'var(--bg-main)',
                color: isActive ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label} ({cat.count})
            </button>
          );
        })}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredItems.map((item, index) => {
          const colors = getTypeColor(item.type);
          return (
            <li key={item.id} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '1rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)', opacity: item.is_visible === 0 ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.title} 
                    <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: colors.bg, color: colors.text, borderRadius:'12px' }}>{getTypeName(item.type)}</span>
                    <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius:'12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                    </span>
                  </h3>
                  <h4 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontWeight: 'normal' }}>{item.institution} ({item.start_date} - {item.end_date || 'Atual'})</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0', whiteSpace: 'pre-line' }}>{item.description}</p>
                  {item.technologies && <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>🛠️ Ferramentas: {item.technologies}</div>}
                  {item.link && <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.25rem' }}>🔗 Link: <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{item.link}</a></div>}
                  {item.image_url && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>🖼️ Imagem: <code>{item.image_url}</code></div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    disabled={index === 0}
                    onClick={() => handleReorder(index, 'up')}
                    style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1, color: 'var(--text-main)', fontSize: '0.8rem' }}
                  >
                    ▲ Subir
                  </button>
                  <button 
                    disabled={index === filteredItems.length - 1}
                    onClick={() => handleReorder(index, 'down')}
                    style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === filteredItems.length - 1 ? 'not-allowed' : 'pointer', opacity: index === filteredItems.length - 1 ? 0.5 : 1, color: 'var(--text-main)', fontSize: '0.8rem' }}
                  >
                    ▼ Descer
                  </button>
                  <button 
                    onClick={() => handleToggleVisibility(item)} 
                    style={{ padding: '0.35rem 0.65rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), color: item.is_visible === 0 ? '#ef4444' : '#10b981', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    title="Alternar Visibilidade no Site"
                  >
                    {item.is_visible === 0 ? '👁️‍🗨️ Exibir' : '👁️ Ocultar'}
                  </button>
                  <button onClick={() => handleEditClick(item)} style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Excluir</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
