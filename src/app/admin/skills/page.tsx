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

  const loadItems = async () => {
    const res = await fetch('/api/skills');
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { loadItems(); }, []);

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

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const payload = { name, level, percentage: Number(percentage), image_url: imageUrl };
    
    if (editingId) {
      await fetch('/api/skills', {
        method: 'PUT',
        body: JSON.stringify({ id: editingId, ...payload })
      });
      setEditingId(null);
    } else {
      await fetch('/api/skills', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setName('');
    setLevel('');
    setPercentage('');
    setImageUrl('');
    loadItems();
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setLevel(item.level);
    setPercentage(item.percentage ? String(item.percentage) : '');
    setImageUrl(item.image_url || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLevel('');
    setPercentage('');
    setImageUrl('');
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Certeza que deseja deletar?')) return;
    await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
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

    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order })
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Gerenciar Habilidades (Ferramentas Técnicas)</h1>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input placeholder="Nome (Ex: Python)" value={name} onChange={e => setName(e.target.value)} required style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          <input placeholder="Nível (Ex: Avançado)" value={level} onChange={e => setLevel(e.target.value)} required style={{flex:2, padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
          <input type="number" placeholder="%" value={percentage} onChange={e => setPercentage(e.target.value)} required style={{width:'80px', padding:'0.75rem', border:'1px solid var(--border)', borderRadius:'4px', color: 'var(--text-main)', background: 'var(--bg-main)'}} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Upload de Logo da Ferramenta (Opcional - Aceita SVG, PNG, JPG, WEBP):</label>
            <input type="file" accept="image/*,.svg,.png,.jpg,.jpeg,.webp,.gif" onChange={handleImageUpload} style={{ fontSize: '0.8rem', color: 'var(--text-main)' }} />
            {imageUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>Enviado: {imageUrl}</span>
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
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '0.5rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              )}
              <div style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong> - {item.level} ({item.percentage}%)
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
              <button onClick={() => handleEditClick(item)} style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
