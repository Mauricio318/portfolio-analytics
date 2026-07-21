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
      ? 'SELECT * FROM articles ORDER BY sort_order ASC, id DESC'
      : 'SELECT * FROM articles WHERE is_visible = 1 ORDER BY sort_order ASC, id DESC';

    const articles = await dbQuery(query);
    return NextResponse.json(articles);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleSave(request);
}

export async function PUT(request: Request) {
  return handleSave(request);
}

async function handleSave(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reorder') {
      const statements = body.order.map((item: { id: number; sort_order: number }) => ({
        sql: 'UPDATE articles SET sort_order = ? WHERE id = ?',
        params: [item.sort_order, item.id]
      }));
      await dbTransaction(statements);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      await dbExecute('UPDATE articles SET is_visible = ? WHERE id = ?', [body.is_visible ? 1 : 0, body.id]);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      // Update
      const oldItem: any = await dbQueryOne('SELECT image_url FROM articles WHERE id = ?', [body.id]);
      if (oldItem && oldItem.image_url && oldItem.image_url !== body.image_url) {
        await deleteUploadedFile(oldItem.image_url);
      }

      await dbExecute(`
        UPDATE articles 
        SET title = ?, description = ?, url = ?, publisher = ?, category = ?, publish_date = ?, read_time = ?, tags = ?, image_url = ?, is_featured = ?, is_visible = ?, card_size = ?
        WHERE id = ?
      `, [
        body.title,
        body.description || '',
        body.url,
        body.publisher || 'Medium',
        body.category || 'Engenharia & Arquitetura de Dados',
        body.publish_date || '',
        body.read_time || '5 min',
        body.tags || '',
        body.image_url || '',
        body.is_featured ? 1 : 0,
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        body.card_size || 'normal',
        body.id
      ]);

      return NextResponse.json({ success: true, id: body.id });
    } else {
      // Insert
      const maxOrderResult: any = await dbQueryOne('SELECT MAX(sort_order) as maxOrder FROM articles');
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = await dbExecute(`
        INSERT INTO articles (title, description, url, publisher, category, publish_date, read_time, tags, image_url, is_featured, is_visible, sort_order, card_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        body.title,
        body.description || '',
        body.url,
        body.publisher || 'Medium',
        body.category || 'Engenharia & Arquitetura de Dados',
        body.publish_date || '',
        body.read_time || '5 min',
        body.tags || '',
        body.image_url || '',
        body.is_featured ? 1 : 0,
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        nextOrder,
        body.card_size || 'normal'
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

    const item: any = await dbQueryOne('SELECT image_url FROM articles WHERE id = ?', [id]);
    if (item && item.image_url) {
      await deleteUploadedFile(item.image_url);
    }

    await dbExecute('DELETE FROM articles WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
