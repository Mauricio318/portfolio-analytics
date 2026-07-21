import { NextResponse } from 'next/server';
import { dbQuery, dbQueryOne, dbExecute, dbTransaction } from '@/lib/query';
import { deleteUploadedFile } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';

    const query = admin 
      ? 'SELECT * FROM portfolio_items ORDER BY sort_order ASC, id DESC'
      : 'SELECT * FROM portfolio_items WHERE is_visible = 1 ORDER BY sort_order ASC, id DESC';

    const items = await dbQuery(query);
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reorder') {
      const statements = body.order.map((item: { id: number; sort_order: number }) => ({
        sql: 'UPDATE portfolio_items SET sort_order = ? WHERE id = ?',
        params: [item.sort_order, item.id]
      }));
      await dbTransaction(statements);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      await dbExecute('UPDATE portfolio_items SET is_visible = ? WHERE id = ?', [body.is_visible ? 1 : 0, body.id]);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      const oldItem: any = await dbQueryOne('SELECT image_url FROM portfolio_items WHERE id = ?', [body.id]);
      if (oldItem && oldItem.image_url && oldItem.image_url !== body.image_url) {
        await deleteUploadedFile(oldItem.image_url);
      }

      await dbExecute(`
        UPDATE portfolio_items 
        SET title = ?, category = ?, description = ?, long_description = ?, image_url = ?, link = ?, code_snippet = ?, code_language = ?, tags = ?, is_featured = ?, is_visible = ?
        WHERE id = ?
      `, [
        body.title,
        body.category || 'Engenharia de Dados',
        body.description || '',
        body.long_description || '',
        body.image_url || '',
        body.link || '',
        body.code_snippet || '',
        body.code_language || 'python',
        body.tags || '',
        body.is_featured ? 1 : 0,
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        body.id
      ]);

      return NextResponse.json({ success: true, id: body.id });
    } else {
      const maxOrderResult: any = await dbQueryOne('SELECT MAX(sort_order) as maxOrder FROM portfolio_items');
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = await dbExecute(`
        INSERT INTO portfolio_items (title, category, description, long_description, image_url, link, code_snippet, code_language, tags, is_featured, is_visible, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        body.title,
        body.category || 'Engenharia de Dados',
        body.description || '',
        body.long_description || '',
        body.image_url || '',
        body.link || '',
        body.code_snippet || '',
        body.code_language || 'python',
        body.tags || '',
        body.is_featured ? 1 : 0,
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        nextOrder
      ]);

      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const item: any = await dbQueryOne('SELECT image_url FROM portfolio_items WHERE id = ?', [id]);
    if (item && item.image_url) {
      await deleteUploadedFile(item.image_url);
    }

    await dbExecute('DELETE FROM portfolio_items WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
