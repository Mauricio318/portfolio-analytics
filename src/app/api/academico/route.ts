import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

import { sanitizeObject } from '@/lib/security';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

// GET: Retorna todas as seções, seus itens ordenados e configurações do perfil
export async function GET() {
  try {
    const db = getDb(true);
    
    // Busca seções ordenadas por sort_order
    const sections = db.prepare('SELECT * FROM academic_sections ORDER BY sort_order ASC, id ASC').all() as any[];
    
    // Busca todos os itens e agrupa por section_id
    const items = db.prepare('SELECT * FROM academic_section_items ORDER BY sort_order ASC, id ASC').all() as any[];
    
    // Aninha os itens dentro de cada seção correspondente
    const sectionsWithItems = sections.map(sec => {
      return {
        ...sec,
        items: items.filter(item => item.section_id === sec.id)
      };
    });

    // Busca configurações de cabeçalho acadêmico
    const settingsRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'academic_%'").all() as { key: string, value: string }[];
    const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    
    return NextResponse.json({
      sections: sectionsWithItems,
      settings
    });
  } catch (error) {
    console.error('Erro no GET de academico:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados acadêmicos' }, { status: 500 });
  }
}

// POST: Realiza operações de mutação (Criação, Edição, Deleção, Reordenação e Configurações)
export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const { action } = body;
    const db = getDb();

    switch (action) {
      // 1. Ações para Seções
      case 'create_section': {
        const { title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit } = body;
        const stmt = db.prepare(`
          INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(title_pt, title_en, type, position, sort_order || 0, content_pt || null, content_en || null, tags || null, show_limit === undefined ? 3 : Number(show_limit));
        return NextResponse.json({ id: info.lastInsertRowid, success: true });
      }

      case 'edit_section': {
        const { id, title_pt, title_en, position, sort_order, content_pt, content_en, tags, show_limit } = body;
        db.prepare(`
          UPDATE academic_sections
          SET title_pt = ?, title_en = ?, position = ?, sort_order = ?, content_pt = ?, content_en = ?, tags = ?, show_limit = ?
          WHERE id = ?
        `).run(title_pt, title_en, position, sort_order || 0, content_pt || null, content_en || null, tags || null, show_limit === undefined ? 3 : Number(show_limit), id);
        return NextResponse.json({ success: true });
      }

      case 'delete_section': {
        const { id } = body;
        // O banco de dados foi configurado com ON DELETE CASCADE, portanto os itens filhos serão deletados automaticamente
        db.prepare('DELETE FROM academic_sections WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
      }

      // 2. Ações para Itens de Seção
      case 'create_item': {
        const { section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order } = body;
        const stmt = db.prepare(`
          INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(section_id, title_pt, title_en, subtitle_pt || null, subtitle_en || null, description_pt || null, description_en || null, tags || null, link || null, period || null, sort_order || 0);
        return NextResponse.json({ id: info.lastInsertRowid, success: true });
      }

      case 'edit_item': {
        const { id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order } = body;
        db.prepare(`
          UPDATE academic_section_items
          SET title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?, tags = ?, link = ?, period = ?, sort_order = ?
          WHERE id = ?
        `).run(title_pt, title_en, subtitle_pt || null, subtitle_en || null, description_pt || null, description_en || null, tags || null, link || null, period || null, sort_order || 0, id);
        return NextResponse.json({ success: true });
      }

      case 'delete_item': {
        const { id } = body;
        db.prepare('DELETE FROM academic_section_items WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
      }

      // 3. Ações para Reordenação
      case 'reorder_sections': {
        const { order } = body; // Array de { id: number, sort_order: number }
        const stmt = db.prepare('UPDATE academic_sections SET sort_order = ? WHERE id = ?');
        
        db.transaction(() => {
          for (const item of order) {
            stmt.run(item.sort_order, item.id);
          }
        })();
        return NextResponse.json({ success: true });
      }

      case 'reorder_items': {
        const { order } = body; // Array de { id: number, sort_order: number }
        const stmt = db.prepare('UPDATE academic_section_items SET sort_order = ? WHERE id = ?');
        
        db.transaction(() => {
          for (const item of order) {
            stmt.run(item.sort_order, item.id);
          }
        })();
        return NextResponse.json({ success: true });
      }

      // 4. Ação para salvar configurações de cabeçalho
      case 'update_settings': {
        const { settings } = body; // Objeto de { key: string, value: string }
        const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
        
        db.transaction(() => {
          for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
          }
        })();
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao salvar dados acadêmicos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
