'use client';
import { useState, useEffect } from 'react';

export default function ResumeAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ type: 'job', title: '', institution: '', start_date: '', end_date: '', description: '', technologies: '', image_url: '', link: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // CV PDF Settings states
  const [cvUrl, setCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [profile, setProfile] = useState({ name: '', roles: '', bio: '' });

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
        bio: data.bio || ''
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
      alert('Perfil atualizado com sucesso!');
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
      // Save under subfolder 'cv'
      const res = await fetch('/api/upload?type=cv', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const path = data.filePath;
        
        // Save path in settings DB table
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

    // Save into subfolder based on the selected type
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
    
    // Reset inputs but preserve the type to avoid resetting select menu
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
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#111827' }}>Gerenciar Currículo (Trajetória Profissional)</h1>
      
      {/* CV PDF Upload Section */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📄 Currículo em PDF (Download para Recrutadores)
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '1rem' }}>
          Faça o upload do seu arquivo de currículo em formato PDF. Este arquivo ficará disponível para download dos recrutadores através do botão "Baixar CV" no site público.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="file" accept=".pdf" onChange={handleCvUpload} style={{ fontSize: '0.9rem' }} />
          {uploadingCv && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Carregando PDF...</span>}
          {cvUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                ✓ Currículo ativo: <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#0ea5e9' }}>{cvUrl.split('/').pop()}</a>
              </span>
              <button type="button" onClick={handleCvRemove} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
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
      <form onSubmit={handleProfileSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 Informações do Perfil (Nome, Cargo, Biografia)
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.5rem' }}>
          Edite o seu nome, cargos listados e o texto da sua biografia exibidos na página inicial do portfólio.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Nome Completo:</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={e => setProfile({ ...profile, name: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} 
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Cargos (Separados por vírgula):</label>
            <input 
              type="text" 
              value={profile.roles} 
              onChange={e => setProfile({ ...profile, roles: e.target.value })} 
              required 
              style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Biografia:</label>
          <textarea 
            value={profile.bio} 
            onChange={e => setProfile({ ...profile, bio: e.target.value })} 
            required 
            style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', lineHeight: '1.5' }} 
          />
        </div>
        <div>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Perfil
          </button>
        </div>
      </form>

      {/* Trajectory Items Admin Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏫 Adicionar ou Editar Etapa da Trajetória
        </h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value, image_url: ''})} style={{padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', background: '#ffffff', color: '#0f172a'}}>
            <option value="job" style={{color: '#0f172a', background: '#ffffff'}}>Experiência Profissional</option>
            <option value="academic" style={{color: '#0f172a', background: '#ffffff'}}>Formação Acadêmica</option>
            <option value="certification" style={{color: '#0f172a', background: '#ffffff'}}>Certificação Oficial</option>
            <option value="course" style={{color: '#0f172a', background: '#ffffff'}}>Curso Complementar</option>
          </select>
          <input placeholder="Cargo / Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{flex:2, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
          <input placeholder="Empresa / Instituição" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} required style={{flex:2, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
        </div>
        <div style={{display:'flex', gap:'1rem'}}>
          <input placeholder="Data Início (ex: 02/2018)" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required style={{flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
          <input placeholder="Data Fim (ex: Atual)" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={{flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
        </div>
        <textarea placeholder="Descrição das responsabilidades ou conquistas." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required style={{padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', minHeight: '80px', color: '#0f172a', background: '#ffffff'}} />
        <div style={{display:'flex', gap:'1rem', alignItems: 'center'}}>
          <input placeholder="Ferramentas (Ex: Python, Airflow) - Separadas por vírgula" value={form.technologies} onChange={e => setForm({...form, technologies: e.target.value})} style={{flex:2, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
          <input placeholder="Link / Credencial (URL de verificação)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{flex:2, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', color: '#0f172a', background: '#ffffff'}} />
          
          {/* Only certifications and informal courses can have images */}
          {['certification', 'course'].includes(form.type) && (
            <div style={{flex:2, display:'flex', gap:'1rem', flexWrap:'wrap', width:'100%'}}>
              <div style={{flex:2, display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'#374151'}}>URL da Imagem / Selo:</label>
                <input 
                  placeholder="Cole uma URL da web (Microsoft, Credly) ou use o upload ao lado" 
                  value={form.image_url} 
                  onChange={e => setForm({...form, image_url: e.target.value})} 
                  style={{padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', fontSize:'0.85rem', color: '#0f172a', background: '#ffffff'}} 
                />
              </div>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'#374151'}}>Ou Upload de Arquivo:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize:'0.8rem', padding:'0.5rem 0'}} />
                {form.image_url && form.image_url.startsWith('/') && (
                  <span style={{fontSize:'0.7rem', color:'#10b981'}}>✓ Arquivo local enviado</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer' }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Item'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: '#9ca3af', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer' }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => {
          const colors = getTypeColor(item.type);
          return (
            <li key={item.id} style={{ padding: '1.5rem', background: '#fff', marginBottom: '1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    {item.title} <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: colors.bg, color: colors.text, borderRadius:'12px', marginLeft: '0.5rem'}}>{getTypeName(item.type)}</span>
                  </h3>
                  <h4 style={{ color: '#334155', margin: '0 0 0.5rem 0', fontWeight: 'normal' }}>{item.institution} ({item.start_date} - {item.end_date || 'Atual'})</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0' }}>{item.description}</p>
                  {item.technologies && <div style={{ color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>🛠️ Ferramentas: {item.technologies}</div>}
                  {item.link && <div style={{ color: '#0ea5e9', fontSize: '0.8rem', marginTop: '0.25rem' }}>🔗 Link: <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{item.link}</a></div>}
                  {item.image_url && <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem' }}>🖼️ Imagem: <code>{item.image_url}</code></div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(item)} style={{ color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Editar</button>
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
