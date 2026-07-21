'use client';
import { useState, useEffect } from 'react';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  link?: string;
  tags?: string;
  is_featured?: number;
  is_visible?: number;
  code_snippet?: string;
  code_language?: string;
  sort_order?: number;
}

export default function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    image_url: '', 
    link: '', 
    tags: '', 
    is_featured: 0,
    is_visible: 1,
    code_snippet: '',
    code_language: 'python'
  });
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingSubtitle, setSavingSubtitle] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadItems = async () => {
    const res = await fetch('/api/portfolio?admin=true');
    if (res.ok) setItems(await res.json());
  };

  const [limitPortfolio, setLimitPortfolio] = useState('3');

  const loadSettings = async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const settings = await res.json();
      setSectionSubtitle(settings.projects_subtitle || 'Nesta seção, apresento uma seleção de projetos que desenvolvi em Engenharia de Dados, Analytics e Inteligência de Negócios. Explore as soluções abaixo e clique para ver os detalhes completos, repositórios ou notebooks.');
      setLimitPortfolio(settings.limit_portfolio || '3');
    }
  };

  useEffect(() => { 
    loadItems();
    loadSettings();
  }, []);

  const handleSaveSubtitle = async () => {
    setSavingSubtitle(true);
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'projects_subtitle', value: sectionSubtitle })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'limit_portfolio', value: limitPortfolio })
        })
      ]);
      alert('Configurações de Projetos salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro na conexão ao salvar.');
    } finally {
      setSavingSubtitle(false);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?type=projects', {
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
      await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form })
      });
      setEditingId(null);
    } else {
      await fetch('/api/portfolio', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      });
    }
    setForm({ 
      title: '', 
      description: '', 
      category: '', 
      image_url: '', 
      link: '', 
      tags: '', 
      is_featured: 0,
      is_visible: 1,
      code_snippet: '',
      code_language: 'python'
    });
    loadItems();
  };

  const handleEditClick = (item: PortfolioItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      image_url: item.image_url || '',
      link: item.link || '',
      tags: item.tags || '',
      is_featured: item.is_featured || 0,
      is_visible: item.is_visible !== undefined ? item.is_visible : 1,
      code_snippet: item.code_snippet || '',
      code_language: item.code_language || 'python'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ 
      title: '', 
      description: '', 
      category: '', 
      image_url: '', 
      link: '', 
      tags: '', 
      is_featured: 0,
      is_visible: 1,
      code_snippet: '',
      code_language: 'python'
    });
  };

  const handleToggleVisibility = async (item: PortfolioItem) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', id: item.id, is_visible: newVisible })
    });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_visible: newVisible } : i));
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Certeza que deseja deletar este projeto?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    loadItems();
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const order = newItems.map((item, i) => ({ id: item.id, sort_order: i + 1 }));
    setItems(newItems);

    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order })
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        Gerenciar Projetos (Portfólio)
      </h1>

      {/* BOX 1: EDITAR TEXTO INTRODUTÓRIO DA SEÇÃO */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '2rem', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          📝 Texto Introdutório da Seção de Projetos
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Este texto é exibido logo abaixo do título "Casos e Projetos" na página principal.
        </p>
        <textarea 
          value={sectionSubtitle} 
          onChange={e => setSectionSubtitle(e.target.value)} 
          rows={3} 
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)', marginBottom: '0.75rem', fontFamily: 'inherit' }} 
        />
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            Quantidade de Projetos Visíveis Inicialmente:
          </label>
          <select 
            value={limitPortfolio} 
            onChange={e => setLimitPortfolio(e.target.value)}
            style={{ width: '100%', maxWidth: '300px', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
          >
            <option value="1">1 projeto</option>
            <option value="2">2 projetos</option>
            <option value="3">3 projetos (Padrão)</option>
            <option value="4">4 projetos</option>
            <option value="5">5 projetos</option>
            <option value="6">6 projetos</option>
            <option value="7">7 projetos</option>
            <option value="8">8 projetos</option>
            <option value="9">9 projetos</option>
            <option value="10">10 projetos</option>
            <option value="12">12 projetos</option>
            <option value="15">15 projetos</option>
            <option value="999">Exibir Todos (Sem botão ver mais)</option>
          </select>
        </div>

        <button 
          type="button" 
          onClick={handleSaveSubtitle} 
          disabled={savingSubtitle}
          style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
        >
          {savingSubtitle ? 'Salvando...' : 'Salvar Configurações da Seção'}
        </button>
      </div>

      {/* BOX 2: ADICIONAR / EDITAR PROJETO */}
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
          {editingId ? '✏️ Editar Projeto' : '➕ Novo Projeto'}
        </h2>

        <div style={{display:'flex', gap:'1rem', flexWrap: 'wrap'}}>
          <input 
            placeholder="Título do Projeto" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
            style={{flex:2, minWidth: '220px', padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} 
          />
          <input 
            placeholder="Categoria (Ex: Data Science)" 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})} 
            required 
            style={{flex:1, minWidth: '160px', padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} 
          />
        </div>

        <textarea 
          placeholder="Descrição completa do projeto (apresentação dos impactos, KPIs e detalhes técnicos)." 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          required 
          rows={4}
          style={{padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)', fontFamily: 'inherit'}} 
        />

        <div style={{display:'flex', gap:'1rem', alignItems: 'center', flexWrap: 'wrap'}}>
          <input 
            placeholder="Tags (Ex: Python, Power BI, SQL)" 
            value={form.tags} 
            onChange={e => setForm({...form, tags: e.target.value})} 
            style={{flex:1.2, minWidth: '180px', padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} 
          />
          <input 
            placeholder="Link / GitHub / Notebook (Opcional)" 
            value={form.link} 
            onChange={e => setForm({...form, link: e.target.value})} 
            style={{flex:1.2, minWidth: '180px', padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} 
          />

          {/* SELETOR DE ESTILO DA GRADE */}
          <div style={{flex:1, minWidth: '180px', display:'flex', flexDirection:'column', gap:'0.25rem'}}>
            <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--text-muted)'}}>Estilo da Grade / Exibição:</label>
            <select 
              value={form.is_featured} 
              onChange={e => setForm({...form, is_featured: parseInt(e.target.value, 10)})}
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-main)', fontWeight: 600 }}
            >
              <option value={0}>📦 Grade Padrão (Cartão 1x1)</option>
              <option value={1}>⭐ Grade Destaque / Expandida (2 Colunas)</option>
            </select>
          </div>

          <div style={{flex:1, minWidth: '180px', display:'flex', flexDirection:'column', gap:'0.25rem'}}>
            <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--text-muted)'}}>Upload de Imagem:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize:'0.8rem', color: 'var(--text-main)'}} />
            {form.image_url && (
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem'}}>
                <span style={{fontSize:'0.7rem', color:'#10b981', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'140px'}}>Enviado: {form.image_url}</span>
                <button 
                  type="button" 
                  onClick={async () => {
                    if (form.image_url && form.image_url.startsWith('/uploads/')) {
                      await fetch(`/api/upload?filePath=${encodeURIComponent(form.image_url)}`, { method: 'DELETE' });
                    }
                    setForm(prev => ({ ...prev, image_url: '' }));
                  }} 
                  style={{fontSize:'0.7rem', padding:'0.1rem 0.3rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:'3px', cursor:'pointer'}}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trecho de Código / Script (Pré-Visualizador) */}
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              💻 Trecho de Código / Script de Demonstração (Opcional):
            </label>
            <select 
              value={form.code_language} 
              onChange={e => setForm({ ...form, code_language: e.target.value })}
              style={{ padding: '0.35rem 0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="pyspark">PySpark / Spark</option>
              <option value="r">R</option>
              <option value="json">JSON</option>
              <option value="bash">Bash / Shell</option>
            </select>
          </div>
          <textarea 
            placeholder="Cole aqui o trecho de código Python, SQL ou PySpark para pré-visualização interativa..." 
            value={form.code_snippet} 
            onChange={e => setForm({ ...form, code_snippet: e.target.value })} 
            rows={4}
            style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', background: 'var(--bg-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer', fontWeight: 600 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Projeto'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer', fontWeight: 600 }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* LISTA DE PROJETOS CADASTRADOS */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Projetos Cadastrados</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li key={item.id} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '1rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)', opacity: item.is_visible === 0 ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.title}  
                  <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background:'var(--bg-main)', border: '1px solid var(--border)', borderRadius:'12px', color:'var(--text-muted)'}}>{item.category}</span>
                  <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: item.is_featured ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-main)', border: '1px solid ' + (item.is_featured ? '#f59e0b' : 'var(--border)'), borderRadius:'12px', color: item.is_featured ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>
                    {item.is_featured ? '⭐ Destaque (2 Colunas)' : '📦 Cartão Padrão'}
                  </span>
                  <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius:'12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                {item.image_url && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🖼️ Imagem: <code style={{background:'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', padding:'0.1rem 0.3rem', borderRadius:'3px'}}>{item.image_url}</code></div>}
                <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.tags}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  disabled={index === 0}
                  onClick={() => handleReorder(index, 'up')}
                  style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1, color: 'var(--text-main)' }}
                >
                  ▲ Subir
                </button>
                <button 
                  disabled={index === items.length - 1}
                  onClick={() => handleReorder(index, 'down')}
                  style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', opacity: index === items.length - 1 ? 0.5 : 1, color: 'var(--text-main)' }}
                >
                  ▼ Descer
                </button>
                <button 
                  onClick={() => handleToggleVisibility(item)} 
                  style={{ padding: '0.45rem 0.75rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), color: item.is_visible === 0 ? '#ef4444' : '#10b981', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                  title="Alternar Visibilidade no Site"
                >
                  {item.is_visible === 0 ? '👁️‍🗨️ Exibir' : '👁️ Ocultar'}
                </button>
                <button onClick={() => handleEditClick(item)} style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Editar</button>
                <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Excluir</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
