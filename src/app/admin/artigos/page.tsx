'use client';

import React, { useState, useEffect } from 'react';

interface ArticleItem {
  id: number;
  title: string;
  description?: string;
  url: string;
  publisher?: string;
  category?: string;
  publish_date?: string;
  read_time?: string;
  tags?: string;
  image_url?: string;
  is_featured?: number;
  is_visible?: number;
  sort_order?: number;
  card_size?: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Controle de categorias pré-definidas ou personalizadas
  const [categoryOption, setCategoryOption] = useState<string>('Engenharia & Arquitetura de Dados');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  // Controle de grupos colapsáveis (minimizar categorias)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    publisher: 'Medium',
    category: 'Engenharia & Arquitetura de Dados',
    publish_date: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    read_time: '5 min de leitura',
    tags: 'Data Science, Python, Engenharia de Dados',
    image_url: '',
    is_featured: 0,
    is_visible: 1,
    card_size: 'normal'
  });

  const [articlesSubtitle, setArticlesSubtitle] = useState('');
  const [limitArticles, setLimitArticles] = useState('3');
  const [savingSettings, setSavingSettings] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [artRes, setRes] = await Promise.all([
        fetch('/api/articles?admin=true'),
        fetch('/api/settings')
      ]);

      if (artRes.ok) setArticles(await artRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        setArticlesSubtitle(s.articles_subtitle || 'Publicações técnicas, newsletters do LinkedIn, artigos no Medium e artigos de pesquisa acadêmica.');
        setLimitArticles(s.limit_articles || '3');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const collapseAllCategories = () => {
    const categories = Array.from(new Set(articles.map(a => a.category || 'Engenharia & Arquitetura de Dados')));
    const newState: Record<string, boolean> = {};
    categories.forEach(c => { newState[c] = true; });
    setCollapsedCategories(newState);
  };

  const expandAllCategories = () => {
    setCollapsedCategories({});
  };

  const saveHeaderSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'articles_subtitle', value: articlesSubtitle }) }),
        fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'limit_articles', value: limitArticles }) })
      ]);
      setMsg('Configurações salvas!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?type=articles', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image_url: data.filePath }));
        alert('Capa do artigo carregada com sucesso!');
      } else {
        alert('Erro ao fazer upload da imagem.');
      }
    } catch (err) {
      alert('Erro na requisição de upload.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = categoryOption === 'custom' 
        ? (customCategoryInput.trim() || 'Geral')
        : categoryOption;

      const payload = editingId 
        ? { id: editingId, ...form, category: finalCategory } 
        : { ...form, category: finalCategory };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingId(null);
        setCustomCategoryInput('');
        setCategoryOption('Engenharia & Arquitetura de Dados');
        setForm({
          title: '',
          description: '',
          url: '',
          publisher: 'Medium',
          category: 'Engenharia & Arquitetura de Dados',
          publish_date: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          read_time: '5 min de leitura',
          tags: 'Data Science, Python',
          image_url: '',
          is_featured: 0,
          is_visible: 1,
          card_size: 'normal'
        });
        loadData();
      } else {
        alert('Erro ao salvar artigo.');
      }
    } catch (err) {
      alert('Erro na requisição.');
    }
  };

  const handleEditClick = (item: ArticleItem) => {
    setEditingId(item.id);
    const presetCategories = [
      'Engenharia & Arquitetura de Dados',
      'Ciência de Dados & Estatística',
      'Machine Learning & IA',
      'Artigos Acadêmicos (USP/UFC)',
      'Carreira & Visão Estratégica'
    ];

    const currentCat = item.category || 'Engenharia & Arquitetura de Dados';
    if (presetCategories.includes(currentCat)) {
      setCategoryOption(currentCat);
      setCustomCategoryInput('');
    } else {
      setCategoryOption('custom');
      setCustomCategoryInput(currentCat);
    }

    setForm({
      title: item.title,
      description: item.description || '',
      url: item.url,
      publisher: item.publisher || 'Medium',
      category: currentCat,
      publish_date: item.publish_date || '',
      read_time: item.read_time || '5 min',
      tags: item.tags || '',
      image_url: item.image_url || '',
      is_featured: item.is_featured || 0,
      is_visible: item.is_visible !== undefined ? item.is_visible : 1,
      card_size: item.card_size || 'normal'
    });
  };

  const handleToggleVisibility = async (item: ArticleItem) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', id: item.id, is_visible: newVisible })
    });
    setArticles(prev => prev.map(a => a.id === item.id ? { ...a, is_visible: newVisible } : a));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este artigo?')) return;
    await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === articles.length - 1)) return;
    const newItems = [...articles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setArticles(reordered);

    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order: reordered })
    });
  };

  // Agrupamento por Categoria
  const groupedArticles = articles.reduce((acc, article) => {
    const cat = article.category || 'Engenharia & Arquitetura de Dados';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
    return acc;
  }, {} as Record<string, ArticleItem[]>);

  if (loading) return <div style={{ padding: '2rem' }}>Carregando artigos e publicações...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          📰 Gerenciador de Artigos, Publicações & Blog
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Crie categorias personalizadas, agrupe e minimize os blocos para organizar facilmente dezenas de publicações.
        </p>
      </header>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* 1. CONFIGURAÇÕES DE EXIBIÇÃO */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '10px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>
          ⚙️ Configurações Gerais da Seção de Artigos (/artigos)
        </h2>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Subtítulo do Banner do Blog (/artigos):
            </label>
            <textarea
              rows={2}
              value={articlesSubtitle}
              onChange={e => setArticlesSubtitle(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              🎯 Quantidade Inicial de Artigos Exibidos (Filtro de Paginação):
            </label>
            <select
              value={limitArticles}
              onChange={e => setLimitArticles(e.target.value)}
              style={{ width: '100%', maxWidth: '340px', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <option value="3">3 artigos por página</option>
              <option value="6">6 artigos por página</option>
              <option value="9">9 artigos por página</option>
              <option value="999">Exibir Todos os Artigos</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={saveHeaderSettings}
          disabled={savingSettings}
          style={{ marginTop: '1rem', padding: '0.65rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {savingSettings ? 'Salvando...' : 'Salvar Configurações Gerais'}
        </button>
      </div>

      {/* 2. FORMULÁRIO DE NOVO / EDITAR ARTIGO COM CATEGORIA CUSTOMIZADA */}
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {editingId ? '✏️ Editar Artigo / Publicação' : '➕ Publicar Novo Artigo'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Título do Artigo / Post:</label>
            <input
              type="text"
              placeholder="ex: Como Construir Data Lakes Escaláveis com Apache Iceberg"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>🏷️ Categoria / Grupo Temático:</label>
            <select
              value={categoryOption}
              onChange={e => setCategoryOption(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <option value="Engenharia & Arquitetura de Dados">🏗️ Engenharia & Arquitetura de Dados</option>
              <option value="Ciência de Dados & Estatística">📊 Ciência de Dados & Estatística</option>
              <option value="Machine Learning & IA">🤖 Machine Learning & IA</option>
              <option value="Artigos Acadêmicos (USP/UFC)">🎓 Artigos Acadêmicos (USP/UFC)</option>
              <option value="Carreira & Visão Estratégica">💡 Carreira & Visão Estratégica</option>
              <option value="custom">➕ Criar Nova Categoria Personalizada...</option>
            </select>

            {categoryOption === 'custom' && (
              <input
                type="text"
                placeholder="Digite o nome da nova categoria (ex: MLOps & Nuvem)"
                value={customCategoryInput}
                onChange={e => setCustomCategoryInput(e.target.value)}
                required
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem', border: '2px solid var(--accent)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Plataforma / Veículo:</label>
            <select
              value={form.publisher}
              onChange={e => setForm({ ...form, publisher: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <option value="Medium">Medium</option>
              <option value="LinkedIn Newsletter">LinkedIn Newsletter</option>
              <option value="USP / UFC Research">Paper Científico (USP/UFC)</option>
              <option value="Dev.to">Dev.to</option>
              <option value="Substack">Substack / Blog Pessoal</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Link / URL Externa do Artigo:</label>
            <input
              type="url"
              placeholder="https://medium.com/@seu-perfil/seu-artigo"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Resumo / Descrição da Publicação:</label>
          <textarea
            rows={3}
            placeholder="Resumo dos aprendizados, metodologias ou abordagens tratadas no artigo..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Data da Publicação:</label>
            <input
              type="text"
              placeholder="ex: Mai 2024"
              value={form.publish_date}
              onChange={e => setForm({ ...form, publish_date: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tempo de Leitura Estimado:</label>
            <input
              type="text"
              placeholder="ex: 6 min de leitura"
              value={form.read_time}
              onChange={e => setForm({ ...form, read_time: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tags (Separadas por vírgula):</label>
            <input
              type="text"
              placeholder="ex: Python, Spark, Architecture"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>📐 Tamanho do Cartão no Grid:</label>
            <select
              value={form.card_size}
              onChange={e => setForm({ ...form, card_size: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <option value="normal">📦 Tamanho Padrão (1 Coluna)</option>
              <option value="large">🌟 Tamanho Grande (2 Colunas / Destaque Amplo)</option>
              <option value="full">🚀 Largura Total / 3 Colunas (Ocupa a Aba Toda)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Estilo de Destaque:</label>
            <select
              value={form.is_featured}
              onChange={e => setForm({ ...form, is_featured: parseInt(e.target.value, 10) })}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600 }}
            >
              <option value={0}>📦 Borda Padrão</option>
              <option value={1}>⭐ Borda & Glow Neon de Destaque</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Upload de Imagem de Capa:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '0.8rem' }} />
            {form.image_url && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginTop: '0.2rem' }}>✓ Capa: {form.image_url}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            {editingId ? 'Salvar Alterações' : 'Publicar Artigo'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setCategoryOption('Engenharia & Arquitetura de Dados'); setCustomCategoryInput(''); }} style={{ padding: '0.75rem 1.5rem', background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* 3. LISTA DE ARTIGOS AGRUPADA POR CATEGORIA COM RECOLHIMENTO (ACCORDION) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
            Artigos Cadastrados no Banco ({articles.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={expandAllCategories}
              style={{ padding: '0.35rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              📂 Expandir Todas
            </button>
            <button
              onClick={collapseAllCategories}
              style={{ padding: '0.35rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              📁 Minimizar Todas
            </button>
          </div>
        </div>

        {Object.keys(groupedArticles).length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum artigo cadastrado no momento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(groupedArticles).map(([categoryName, categoryItems]) => {
              const isCollapsed = !!collapsedCategories[categoryName];

              return (
                <div 
                  key={categoryName}
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Cabeçalho da Categoria com Botão de Minimizar */}
                  <div 
                    onClick={() => toggleCategoryCollapse(categoryName)}
                    style={{ 
                      padding: '0.9rem 1.25rem', 
                      background: 'var(--bg-main)', 
                      borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {isCollapsed ? '▶' : '▼'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {categoryName}
                      </h3>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.55rem', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '12px', fontWeight: 700 }}>
                        {categoryItems.length} {categoryItems.length === 1 ? 'artigo' : 'artigos'}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {isCollapsed ? 'Clique para Expandir' : 'Clique para Minimizar'}
                    </span>
                  </div>

                  {/* Conteúdo do Grupo de Artigos */}
                  {!isCollapsed && (
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {categoryItems.map((item) => {
                        const globalIndex = articles.findIndex(a => a.id === item.id);
                        return (
                          <div
                            key={item.id}
                            style={{
                              padding: '1.1rem',
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '1rem',
                              opacity: item.is_visible === 0 ? 0.6 : 1
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {item.title}
                                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                                  {item.publisher || 'Medium'}
                                </span>
                                {item.card_size === 'large' && (
                                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', borderRadius: '12px', color: '#eab308', fontWeight: 600 }}>
                                    🌟 Cartão Grande
                                  </span>
                                )}
                                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius: '12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                  {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                                </span>
                              </h4>
                              {item.description && <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '0.35rem', lineHeight: 1.4 }}>{item.description}</p>}
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <span>🗓️ {item.publish_date}</span>
                                <span>⏱️ {item.read_time}</span>
                                <span>🏷️ {item.tags}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                disabled={globalIndex === 0}
                                onClick={() => handleReorder(globalIndex, 'up')}
                                style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: globalIndex === 0 ? 'not-allowed' : 'pointer', opacity: globalIndex === 0 ? 0.5 : 1, color: 'var(--text-main)', fontSize: '0.8rem' }}
                              >
                                ▲ Subir
                              </button>
                              <button
                                disabled={globalIndex === articles.length - 1}
                                onClick={() => handleReorder(globalIndex, 'down')}
                                style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: globalIndex === articles.length - 1 ? 'not-allowed' : 'pointer', opacity: globalIndex === articles.length - 1 ? 0.5 : 1, color: 'var(--text-main)', fontSize: '0.8rem' }}
                              >
                                ▼ Descer
                              </button>
                              <button
                                onClick={() => handleToggleVisibility(item)}
                                style={{ padding: '0.35rem 0.65rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), color: item.is_visible === 0 ? '#ef4444' : '#10b981', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                              >
                                {item.is_visible === 0 ? '👁️‍🗨️ Exibir' : '👁️ Ocultar'}
                              </button>
                              <button onClick={() => handleEditClick(item)} style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
