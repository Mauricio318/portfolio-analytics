'use client';
import { useState, useEffect } from 'react';

export default function PortfolioAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', category: '', image_url: '', link: '', tags: '' });

  const loadItems = async () => {
    const res = await fetch('/api/portfolio');
    if (res.ok) setItems(await res.json());
  };

  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { loadItems(); }, []);

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
        body: JSON.stringify({ id: editingId, ...form })
      });
      setEditingId(null);
    } else {
      await fetch('/api/portfolio', { method: 'POST', body: JSON.stringify(form) });
    }
    setForm({ title: '', description: '', category: '', image_url: '', link: '', tags: '' });
    loadItems();
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      image_url: item.image_url || '',
      link: item.link || '',
      tags: item.tags || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', category: '', image_url: '', link: '', tags: '' });
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Certeza que deseja deletar este projeto?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    loadItems();
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111827' }}>Gerenciar Projetos (Portfólio)</h1>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{display:'flex', gap:'1rem'}}>
          <input placeholder="Título do Projeto" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{flex:2, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px'}} />
          <input placeholder="Categoria (Ex: Data Science)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={{flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px'}} />
        </div>
        <textarea placeholder="Descrição curta do projeto e os impactos." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required style={{padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px', minHeight: '80px'}} />
        <div style={{display:'flex', gap:'1rem', alignItems: 'center'}}>
          <input placeholder="Tags (Ex: Python, Power BI, SQL)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} style={{flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px'}} />
          <input placeholder="Link Externo / GitHub (Opcional)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px'}} />
          <div style={{flex:1, display:'flex', flexDirection:'column', gap:'0.25rem'}}>
            <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'#374151'}}>Upload de Imagem:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize:'0.8rem'}} />
            {form.image_url && (
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem'}}>
                <span style={{fontSize:'0.7rem', color:'#10b981', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px'}}>Enviado: {form.image_url}</span>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))} style={{fontSize:'0.7rem', padding:'0.1rem 0.3rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:'3px', cursor:'pointer'}}>Remover</button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer' }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Projeto'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: '#9ca3af', color: '#fff', border: 'none', borderRadius: '4px', cursor:'pointer' }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ padding: '1.5rem', background: '#fff', marginBottom: '1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>{item.title}  <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', background:'#e2e8f0', borderRadius:'12px', color:'#475569'}}>{item.category}</span></h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.description}</p>
                {item.image_url && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>🖼️ Imagem: <code style={{background:'#f1f5f9', padding:'0.1rem 0.3rem', borderRadius:'3px'}}>{item.image_url}</code></div>}
                <div style={{ color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.tags}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={() => handleEditClick(item)} style={{ color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Editar</button>
                <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold', padding:'0.5rem' }}>Excluir</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
