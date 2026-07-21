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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Operações de atualização/criação/exclusão (requer autenticação)
export async function POST(request: Request) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const { action } = body;

    switch (action) {
      case 'update_settings': {
        const { settings } = body;
        if (!settings || typeof settings !== 'object') {
          return NextResponse.json({ error: 'Configurações inválidas' }, { status: 400 });
        }

        const statements = Object.entries(settings).map(([key, value]) => ({
          sql: `
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
          `,
          params: [key, String(value ?? '')]
        }));

        await dbTransaction(statements);
        return NextResponse.json({ success: true });
      }

      case 'create_section': {
        const { title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit } = body;
        const res = await dbExecute(`
          INSERT INTO academic_sections (title_pt, title_en, type, position, sort_order, content_pt, content_en, tags, show_limit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title_pt, title_en, type || 'list', position || 'center', sort_order || 0, content_pt || null, content_en || null, tags || null, show_limit === undefined ? 3 : Number(show_limit)]);
        return NextResponse.json({ id: res.lastInsertRowid, success: true });
      }

      case 'update_section':
      case 'edit_section': {
        const { id, title_pt, title_en, position, sort_order, content_pt, content_en, tags, show_limit, type } = body;
        
        // Busca a seção atual para não sobrescrever o tipo caso venha nulo
        const existingSections = await dbQuery('SELECT type, position, sort_order, show_limit FROM academic_sections WHERE id = ?', [id]);
        const existing = existingSections[0] || {};

        await dbExecute(`
          UPDATE academic_sections
          SET title_pt = ?, title_en = ?, type = ?, position = ?, sort_order = ?, content_pt = ?, content_en = ?, tags = ?, show_limit = ?
          WHERE id = ?
        `, [
          title_pt,
          title_en,
          type || existing.type || 'list',
          position || existing.position || 'center',
          sort_order !== undefined ? Number(sort_order) : (existing.sort_order || 0),
          content_pt || null,
          content_en || null,
          tags || null,
          show_limit === undefined ? (existing.show_limit || 3) : Number(show_limit),
          id
        ]);
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

      case 'update_item':
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

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
