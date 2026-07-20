'use client';
import { useState, useEffect } from 'react';

export default function SkillsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [percentage, setPercentage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Editable settings
  const [skillsSubtitle, setSkillsSubtitle] = useState('');
  const [limitSkills, setLimitSkills] = useState('8');
  const [savingSettings, setSavingSettings] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    const [skillsRes, settingsRes] = await Promise.all([
      fetch('/api/skills?admin=true'),
      fetch('/api/settings')
    ]);

    if (skillsRes.ok) setItems(await skillsRes.json());
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      setSkillsSubtitle(settings.skills_subtitle || 'Estes são meus níveis de habilidade com as tecnologias mais populares no mercado atualmente:');
      setLimitSkills(settings.limit_skills || '8');
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveTextSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'skills_subtitle', value: skillsSubtitle }) }),
        fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'limit_skills', value: limitSkills }) })
      ]);
      setMsg('Configurações salvas com sucesso!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert('Erro ao salvar textos.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?type=skills', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.filePath);
        alert('Logo carregado com sucesso!');
      } else {
        alert('Erro ao fazer upload do logo.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão para upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      id: editingId, 
      name, 
      level, 
      percentage: parseInt(percentage) || 0,
      image_url: imageUrl
    };

    const res = await fetch('/api/skills', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setName('');
      setLevel('');
      setPercentage('');
      setImageUrl('');
      setEditingId(null);
      loadData();
    }
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setName(item.name || '');
    setLevel(item.level || '');
    setPercentage(String(item.percentage || ''));
    setImageUrl(item.image_url || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLevel('');
    setPercentage('');
    setImageUrl('');
  };

  const handleToggleVisibility = async (item: any) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', id: item.id, is_visible: newVisible })
    });
    setItems(prev => prev.map(s => s.id === item.id ? { ...s, is_visible: newVisible } : s));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta habilidade?')) return;
    const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(reordered);

    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order: reordered })
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        Gerenciador de Habilidades & Perfil
      </h1>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', marginBottom: '1.5rem', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* EDITOR DE CONFIGURAÇÕES DE HABILIDADES */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>
          Configurações da Seção de Habilidades
        </h3>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Subtítulo da Seção Habilidades
            </label>
            <textarea 
              rows={2}
              value={skillsSubtitle}
              onChange={e => setSkillsSubtitle(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Quantidade de Habilidades Visíveis Inicialmente:
            </label>
            <select 
              value={limitSkills} 
              onChange={e => setLimitSkills(e.target.value)}
              style={{ width: '100%', maxWidth: '300px', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            >
              <option value="6">6 habilidades</option>
              <option value="8">8 habilidades (Padrão)</option>
              <option value="12">12 habilidades</option>
              <option value="16">16 habilidades</option>
              <option value="999">Exibir Todas (Sem botão ver mais)</option>
            </select>
          </div>
        </div>

        <button 
          type="button" 
          onClick={saveTextSettings}
          disabled={savingSettings}
          style={{ marginTop: '1rem', padding: '0.65rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {savingSettings ? 'Salvando...' : 'Salvar Configurações da Seção'}
        </button>
      </div>

      {/* FORMULÁRIO DE HABILIDADES */}
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          {editingId ? 'Editar Habilidade' : 'Adicionar Nova Habilidade'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Nome (ex: Python, SQL, Pentaho, dbt)" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            style={{ padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)' }}
          />
          <input 
            type="text" 
            placeholder="Nível (ex: Avançado / Especialista)" 
            value={level} 
            onChange={e => setLevel(e.target.value)} 
            required 
            style={{ padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)' }}
          />
          <input 
            type="number" 
            placeholder="Porcentagem (ex: 95)" 
            value={percentage} 
            onChange={e => setPercentage(e.target.value)} 
            required 
            style={{ padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)' }}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Logo / Ícone (Qualquer formato: SVG, PNG, WebP)
            </label>
            <input 
              type="file" 
              accept="image/*,.svg,.png,.jpg,.jpeg,.webp,.gif" 
              onChange={handleImageUpload} 
              disabled={uploading}
              style={{ fontSize: '0.8rem' }}
            />
            {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Carregando imagem...</span>}
            {imageUrl && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{imageUrl}</span>
                <button 
                  type="button" 
                  onClick={async () => {
                    if (imageUrl && imageUrl.startsWith('/uploads/')) {
                      await fetch(`/api/upload?filePath=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' });
                    }
                    setImageUrl('');
                  }} 
                  style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Habilidade'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* LISTA DE HABILIDADES */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Habilidades Cadastradas ({items.length})
      </h3>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '0.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)', flexWrap: 'wrap', gap: '0.75rem', opacity: item.is_visible === 0 ? 0.6 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              )}
              <div style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong> - {item.level} ({item.percentage}%)
                <span style={{ fontSize:'0.75rem', padding:'0.15rem 0.5rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius:'12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600, marginLeft: '0.5rem' }}>
                  {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                </span>
              </div>
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
                disabled={index === items.length - 1}
                onClick={() => handleReorder(index, 'down')}
                style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', opacity: index === items.length - 1 ? 0.5 : 1, color: 'var(--text-main)', fontSize: '0.8rem' }}
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
              <button onClick={() => handleEditClick(item)} style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
