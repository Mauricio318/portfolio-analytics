import { NextResponse } from 'next/server';
import { dbQuery, dbExecute, dbTransaction } from '@/lib/query';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sanitizeObject } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

// GET: Retorna todas as seções, seus itens ordenados e configurações do perfil
export async function GET() {
  try {
    const sections = await dbQuery('SELECT * FROM academic_sections ORDER BY sort_order ASC, id ASC');
    const items = await dbQuery('SELECT * FROM academic_section_items ORDER BY sort_order ASC, id ASC');
    
    const sectionsWithItems = sections.map(sec => ({
      ...sec,
      items: items.filter(item => item.section_id === sec.id)
    }));

    const settingsRows = await dbQuery<{ key: string; value: string }>("SELECT key, value FROM settings WHERE key LIKE 'academic_%'");
    const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    
    return NextResponse.json({
      sections: sectionsWithItems,
      settings
    });
  } catch (error: any) {
    console.error('Erro no GET de academico:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados acadêmicos' }, { status: 500 });
  }
}

// POST: Realiza operações de mutação
export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const { action } = body;

    switch (action) {
      case 'create_section': {
        const { title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit } = body;
        const res = await dbExecute(`
          INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title_pt, title_en, type, position, sort_order || 0, content_pt || null, content_en || null, tags || null, show_limit === undefined ? 3 : Number(show_limit)]);
        return NextResponse.json({ id: res.lastInsertRowid, success: true });
      }

      case 'edit_section': {
        const { id, title_pt, title_en, position, sort_order, content_pt, content_en, tags, show_limit } = body;
        await dbExecute(`
          UPDATE academic_sections
          SET title_pt = ?, title_en = ?, position = ?, sort_order = ?, content_pt = ?, content_en = ?, tags = ?, show_limit = ?
          WHERE id = ?
        `, [title_pt, title_en, position, sort_order || 0, content_pt || null, content_en || null, tags || null, show_limit === undefined ? 3 : Number(show_limit), id]);
        return NextResponse.json({ success: true });
      }

      case 'delete_section': {
        const { id } = body;
        await dbExecute('DELETE FROM academic_sections WHERE id = ?', [id]);
        await dbExecute('DELETE FROM academic_section_items WHERE section_id = ?', [id]);
        return NextResponse.json({ success: true });
      }

      case 'create_item': {
        const { section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order } = body;
        const res = await dbExecute(`
          INSERT INTO academic_section_items (section_id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [section_id, title_pt, title_en, subtitle_pt || null, subtitle_en || null, description_pt || null, description_en || null, tags || null, link || null, period || null, sort_order || 0]);
        return NextResponse.json({ id: res.lastInsertRowid, success: true });
      }

      case 'edit_item': {
        const { id, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en, tags, link, period, sort_order } = body;
        await dbExecute(`
          UPDATE academic_section_items
          SET title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?, tags = ?, link = ?, period = ?, sort_order = ?
          WHERE id = ?
        `, [title_pt, title_en, subtitle_pt || null, subtitle_en || null, description_pt || null, description_en || null, tags || null, link || null, period || null, sort_order || 0, id]);
        return NextResponse.json({ success: true });
      }

      case 'delete_item': {
        const { id } = body;
        await dbExecute('DELETE FROM academic_section_items WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
      }

      case 'reorder_sections': {
        const { order } = body;
        const statements = order.map((item: any) => ({
          sql: 'UPDATE academic_sections SET sort_order = ? WHERE id = ?',
          params: [item.sort_order, item.id]
        }));
        await dbTransaction(statements);
        return NextResponse.json({ success: true });
      }

      case 'reorder_items': {
        const { order } = body;
        const statements = order.map((item: any) => ({
          sql: 'UPDATE academic_section_items SET sort_order = ? WHERE id = ?',
          params: [item.sort_order, item.id]
        }));
        await dbTransaction(statements);
        return NextResponse.json({ success: true });
      }

      case 'update_settings': {
        const { settings } = body;
        const statements = Object.entries(settings).map(([key, value]) => ({
          sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          params: [key, value]
        }));
        await dbTransaction(statements);
        return NextResponse.json({ success: true });
      }

      case 'toggle_section_visibility': {
        const { id, is_visible } = body;
        await dbExecute('UPDATE academic_sections SET is_visible = ? WHERE id = ?', [is_visible ? 1 : 0, id]);
        return NextResponse.json({ success: true });
      }

      case 'toggle_item_visibility': {
        const { id, is_visible } = body;
        await dbExecute('UPDATE academic_section_items SET is_visible = ? WHERE id = ?', [is_visible ? 1 : 0, id]);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erro ao salvar dados acadêmicos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
