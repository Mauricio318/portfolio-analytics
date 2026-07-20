'use client';
import { useState, useEffect } from 'react';

export default function ResumeAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [form, setForm] = useState({ type: 'job', title: '', institution: '', start_date: '', end_date: '', description: '', technologies: '', image_url: '', link: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // CV PDF Settings states
  const [cvUrl, setCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [profile, setProfile] = useState({ name: '', roles: '', bio: '', email: '', linkedin: '' });

  const loadItems = async () => {
    const res = await fetch('/api/resume');
    if (res.ok) setItems(await res.json());
  };

  const loadCvSetting = async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      setCvUrl(data.cv_url || '');
      setProfile({
        name: data.name || '',
        roles: data.roles || '',
        bio: data.bio || '',
        email: data.email || data.contact_email || 'mauriciozinibu@gmail.com',
        linkedin: data.linkedin || 'https://www.linkedin.com/in/mauriciobimbu/'
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
            style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', minHeight: '100px', lineHeight: '1.5', color: 'var(--text-main)', background: 'var(--bg-main)' }} 
          />
        </div>
        <div>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Perfil
          </button>
        </div>
      </form>

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
            <li key={item.id} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '1rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                    {item.title} <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: colors.bg, color: colors.text, borderRadius:'12px', marginLeft: '0.5rem'}}>{getTypeName(item.type)}</span>
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
