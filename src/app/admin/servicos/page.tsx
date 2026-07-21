'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  BarChart2, 
  Cpu, 
  Target, 
  TrendingUp, 
  Layout, 
  MessageSquare, 
  Workflow
} from 'lucide-react';

interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  is_visible?: number;
  sort_order: number;
}

export default function AdminServicosPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Section intro settings
  const [servicesSubtitle, setServicesSubtitle] = useState('');
  const [servicesDescription, setServicesDescription] = useState('');
  const [limitServices, setLimitServices] = useState('6');

  // 6 Counter stats numbers & labels
  const [stats, setStats] = useState({
    completedNum: '50',
    completedLabel: 'Projetos Entregues',
    ongoingNum: '10',
    ongoingLabel: 'Em Andamento',
    researchNum: '20',
    researchLabel: 'Estudos & Pesquisas',
    ideasNum: '475',
    ideasLabel: 'Protótipos & Ideias',
    coffeeNum: '7.500',
    coffeeLabel: 'Cafés Consumidos',
    hoursNum: '9.000',
    hoursLabel: 'Horas de Engenharia',
  });

  // Service Form Modal / Edit state
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, settingsRes] = await Promise.all([
        fetch('/api/services?admin=true'),
        fetch('/api/settings')
      ]);

      const servicesData = await servicesRes.json();
      const settingsData = await settingsRes.json();

      setServices(Array.isArray(servicesData) ? servicesData : []);

      if (settingsData) {
        setServicesSubtitle(settingsData.services_subtitle || 'O que posso fazer pelo seu negócio?');
        setServicesDescription(settingsData.services_description || 'Soluções sob medida em Engenharia de Dados, Analytics e Inteligência Artificial.');
        setLimitServices(settingsData.limit_services || '6');

        setStats({
          completedNum: settingsData.stat_projects_completed || '50',
          completedLabel: settingsData.stat_label_completed || 'Projetos Entregues',
          ongoingNum: settingsData.stat_projects_ongoing || '10',
          ongoingLabel: settingsData.stat_label_ongoing || 'Em Andamento',
          researchNum: settingsData.stat_research_ongoing || '20',
          researchLabel: settingsData.stat_label_research || 'Estudos & Pesquisas',
          ideasNum: settingsData.stat_ideas_count || '475',
          ideasLabel: settingsData.stat_label_ideas || 'Protótipos & Ideias',
          coffeeNum: settingsData.stat_coffee_count || '7.500',
          coffeeLabel: settingsData.stat_label_coffee || 'Cafés Consumidos',
          hoursNum: settingsData.stat_hours_count || '9.000',
          hoursLabel: settingsData.stat_label_hours || 'Horas de Engenharia',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const headers = { 'Content-Type': 'application/json' };
      const promises = [
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'services_subtitle', value: servicesSubtitle }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'services_description', value: servicesDescription }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'limit_services', value: limitServices }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_projects_completed', value: stats.completedNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_completed', value: stats.completedLabel }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_projects_ongoing', value: stats.ongoingNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_ongoing', value: stats.ongoingLabel }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_research_ongoing', value: stats.researchNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_research', value: stats.researchLabel }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_ideas_count', value: stats.ideasNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_ideas', value: stats.ideasLabel }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_coffee_count', value: stats.coffeeNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_coffee', value: stats.coffeeLabel }) }),

        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_hours_count', value: stats.hoursNum }) }),
        fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'stat_label_hours', value: stats.hoursLabel }) }),
      ];

      await Promise.all(promises);
      showMsg('Configurações de textos e métricas salvas com sucesso!');
    } catch (err) {
      showMsg('Erro ao salvar configurações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.description) {
      showMsg('Preencha o título e a descrição.', 'error');
      return;
    }

    try {
      setSaving(true);
      const isEdit = !!editingService.id;
      const url = '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });

      if (res.ok) {
        showMsg(isEdit ? 'Serviço atualizado com sucesso!' : 'Novo serviço adicionado!');
        setIsFormOpen(false);
        setEditingService(null);
        fetchData();
      } else {
        showMsg('Erro ao salvar serviço.', 'error');
      }
    } catch (err) {
      showMsg('Erro na requisição.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceVisibility = async (item: ServiceItem) => {
    const newVisible = item.is_visible === 0 ? 1 : 0;
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_visibility', id: item.id, is_visible: newVisible })
      });
      setServices(prev => prev.map(s => s.id === item.id ? { ...s, is_visible: newVisible } : s));
      showMsg(newVisible ? 'Serviço agora está visível no site!' : 'Serviço temporariamente ocultado do site.');
    } catch (err) {
      showMsg('Erro ao alterar visibilidade.', 'error');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Deseja realmente remover este serviço?')) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMsg('Serviço removido!');
        fetchData();
      } else {
        showMsg('Erro ao remover.', 'error');
      }
    } catch (err) {
      showMsg('Erro ao deletar.', 'error');
    }
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return;
    const newServices = [...services];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newServices[index];
    newServices[index] = newServices[targetIdx];
    newServices[targetIdx] = temp;

    const reordered = newServices.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setServices(reordered);

    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', order: reordered })
      });
    } catch (err) {
      fetchData();
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'workflow': return <Workflow size={20} />;
      case 'barchart': return <BarChart2 size={20} />;
      case 'cpu': return <Cpu size={20} />;
      case 'target': return <Target size={20} />;
      case 'trending': return <TrendingUp size={20} />;
      case 'layout': return <Layout size={20} />;
      case 'message': return <MessageSquare size={20} />;
      default: return <BarChart2 size={20} />;
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  };

  const buttonPrimary: React.CSSProperties = {
    padding: '0.65rem 1.25rem',
    borderRadius: '6px',
    background: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  };

  const buttonSecondary: React.CSSProperties = {
    padding: '0.65rem 1.25rem',
    borderRadius: '6px',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer'
  };

  const buttonIconStyle: React.CSSProperties = {
    padding: '0.45rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (loading) return <div style={{ padding: '2rem' }}><p>Carregando gerenciador de serviços...</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Gerenciador de Serviços & Métricas</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Edite com controle total os títulos, textos da seção, os 6 números de métricas e os serviços oferecidos.
        </p>
      </header>

      {message && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. SEÇÃO DE TEXTOS INTRODUTÓRIOS DA SEÇÃO */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>
          1. Cabeçalho & Limite de Exibição dos Serviços
        </h2>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Subtítulo do Cabeçalho (ex: O que posso fazer pelo seu negócio?)
            </label>
            <input 
              type="text" 
              value={servicesSubtitle} 
              onChange={e => setServicesSubtitle(e.target.value)} 
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Descrição Resumida da Seção
            </label>
            <textarea 
              rows={2}
              value={servicesDescription} 
              onChange={e => setServicesDescription(e.target.value)} 
              style={inputStyle}
            />
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)' }}>
              🎯 Quantidade de Serviços Visíveis Inicialmente (Antes do botão "Ver Mais"):
            </label>
            <select 
              value={limitServices} 
              onChange={e => setLimitServices(e.target.value)}
              style={{ ...inputStyle, maxWidth: '320px', fontWeight: 600 }}
            >
              <option value="3">3 serviços iniciais</option>
              <option value="6">6 serviços iniciais (Padrão)</option>
              <option value="9">9 serviços iniciais</option>
              <option value="999">Exibir Todos (Sem botão ver mais)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={saveSettings} 
            disabled={saving} 
            style={buttonPrimary}
          >
            <Save size={18} />
            <span>{saving ? 'Salvando...' : 'Salvar Configurações de Serviços'}</span>
          </button>
        </div>
      </div>

      {/* 2. SEÇÃO DE MÉTRICAS & NÚMEROS (CONTROLE TOTAL) */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#ec4899' }}>
          2. Métricas de Impacto (Números & Rótulos)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Altere com liberdade os valores numéricos e os nomes dos 6 cartões exibidos na barra de impacto:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Metric 1 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 1 (Projetos Entregues)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 50)" value={stats.completedNum} onChange={e => setStats({ ...stats, completedNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.completedLabel} onChange={e => setStats({ ...stats, completedLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 2 (Em Andamento)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 10)" value={stats.ongoingNum} onChange={e => setStats({ ...stats, ongoingNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.ongoingLabel} onChange={e => setStats({ ...stats, ongoingLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Metric 3 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 3 (Estudos & Pesquisas)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 20)" value={stats.researchNum} onChange={e => setStats({ ...stats, researchNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.researchLabel} onChange={e => setStats({ ...stats, researchLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Metric 4 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 4 (Protótipos & Ideias)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 475)" value={stats.ideasNum} onChange={e => setStats({ ...stats, ideasNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.ideasLabel} onChange={e => setStats({ ...stats, ideasLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Metric 5 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 5 (Cafés)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 7.500)" value={stats.coffeeNum} onChange={e => setStats({ ...stats, coffeeNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.coffeeLabel} onChange={e => setStats({ ...stats, coffeeLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Metric 6 */}
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métrica 6 (Horas de Trabalho)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Número (ex: 9.000)" value={stats.hoursNum} onChange={e => setStats({ ...stats, hoursNum: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
              <input type="text" placeholder="Rótulo" value={stats.hoursLabel} onChange={e => setStats({ ...stats, hoursLabel: e.target.value })} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={saveSettings} 
            disabled={saving} 
            style={{ ...buttonPrimary, background: '#ec4899' }}
          >
            <Save size={18} />
            <span>{saving ? 'Salvando...' : 'Salvar Textos & Métricas'}</span>
          </button>
        </div>
      </div>

      {/* 3. GERENCIADOR DE SERVIÇOS */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>3. Lista de Serviços ({services.length})</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cadastre, ordene ou edite os serviços de engenharia e inteligência oferecidos.</p>
          </div>
          <button 
            onClick={() => {
              setEditingService({ icon: 'barchart' });
              setIsFormOpen(true);
            }} 
            style={buttonPrimary}
          >
            <Plus size={18} />
            <span>Adicionar Serviço</span>
          </button>
        </div>

        {/* Form Box */}
        {isFormOpen && (
          <form onSubmit={handleSaveService} style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--accent)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Título do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Engenharia de Dados & Pipelines ETL" 
                  value={editingService?.title || ''} 
                  onChange={e => setEditingService({ ...editingService, title: e.target.value })} 
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Descrição do Serviço</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Descreva a solução de forma personalizada..." 
                  value={editingService?.description || ''} 
                  onChange={e => setEditingService({ ...editingService, description: e.target.value })} 
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Ícone de Exibição</label>
                <select 
                  value={editingService?.icon || 'barchart'} 
                  onChange={e => setEditingService({ ...editingService, icon: e.target.value })} 
                  style={inputStyle}
                >
                  <option value="workflow">Workflow / Ingestão ETL (Engenharia de Dados)</option>
                  <option value="barchart">Bar Chart (Análise Descritiva & Diagnóstica)</option>
                  <option value="cpu">CPU / Brain (Machine Learning & IA)</option>
                  <option value="target">Target / Alvo (Análise Prescritiva & Estratégia)</option>
                  <option value="trending">Trending Up (Econometria & Estatística)</option>
                  <option value="layout">Layout / Dashboard (Data Viz & Power BI)</option>
                  <option value="message">Message / Balão (Consultoria & Arquitetura)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button 
                type="button" 
                onClick={() => { setIsFormOpen(false); setEditingService(null); }} 
                style={buttonSecondary}
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} style={buttonPrimary}>
                {saving ? 'Salvando...' : 'Salvar Serviço'}
              </button>
            </div>
          </form>
        )}

        {/* Services List Table / Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {services.map((item, idx) => (
            <div 
              key={item.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {renderIcon(item.icon)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.title}
                    <span style={{ fontSize:'0.75rem', padding:'0.15rem 0.5rem', background: item.is_visible === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid ' + (item.is_visible === 0 ? '#ef4444' : '#10b981'), borderRadius:'12px', color: item.is_visible === 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {item.is_visible === 0 ? '👁️‍🗨️ Oculto' : '👁️ Visível'}
                    </span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>{item.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                <button 
                  onClick={() => toggleServiceVisibility(item)} 
                  style={{ ...buttonIconStyle, color: item.is_visible === 0 ? '#ef4444' : '#10b981', borderColor: item.is_visible === 0 ? '#ef4444' : '#10b981', padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 600 }} 
                  title="Alternar Visibilidade no Site"
                >
                  {item.is_visible === 0 ? '👁️‍🗨️ Exibir' : '👁️ Ocultar'}
                </button>
                <button 
                  onClick={() => moveService(idx, 'up')} 
                  disabled={idx === 0}
                  style={buttonIconStyle} 
                  title="Mover para cima"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => moveService(idx, 'down')} 
                  disabled={idx === services.length - 1}
                  style={buttonIconStyle} 
                  title="Mover para baixo"
                >
                  <ArrowDown size={16} />
                </button>
                <button 
                  onClick={() => { setEditingService(item); setIsFormOpen(true); }} 
                  style={buttonIconStyle} 
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteService(item.id)} 
                  style={{ ...buttonIconStyle, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} 
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum serviço cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
