import { NextResponse } from 'next/server';
import { getDb, deleteUploadedFile } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';
    const db = getDb(true);

    const query = admin 
      ? 'SELECT * FROM articles ORDER BY sort_order ASC, id DESC'
      : 'SELECT * FROM articles WHERE is_visible = 1 ORDER BY sort_order ASC, id DESC';

    const articles = db.prepare(query).all();
    return NextResponse.json(articles);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();

    if (body.action === 'reorder') {
      const stmt = db.prepare('UPDATE articles SET sort_order = ? WHERE id = ?');
      const transaction = db.transaction((items: { id: number; sort_order: number }[]) => {
        for (const item of items) {
          stmt.run(item.sort_order, item.id);
        }
      });
      transaction(body.order);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      db.prepare('UPDATE articles SET is_visible = ? WHERE id = ?').run(body.is_visible ? 1 : 0, body.id);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      // Update
      const oldItem: any = db.prepare('SELECT image_url FROM articles WHERE id = ?').get(body.id);
      if (oldItem && oldItem.image_url && oldItem.image_url !== body.image_url) {
        await deleteUploadedFile(oldItem.image_url);
      }

      db.prepare(`
        UPDATE articles 
        SET title = ?, description = ?, url = ?, publisher = ?, category = ?, publish_date = ?, read_time = ?, tags = ?, image_url = ?, is_featured = ?, is_visible = ?, card_size = ?
        WHERE id = ?
      `).run(
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
      );

      return NextResponse.json({ success: true, id: body.id });
    } else {
      // Insert
      const maxOrderResult: any = db.prepare('SELECT MAX(sort_order) as maxOrder FROM articles').get();
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = db.prepare(`
        INSERT INTO articles (title, description, url, publisher, category, publish_date, read_time, tags, image_url, is_featured, is_visible, sort_order, card_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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
      );

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

    const db = getDb();
    const item: any = db.prepare('SELECT image_url FROM articles WHERE id = ?').get(id);
    if (item && item.image_url) {
      await deleteUploadedFile(item.image_url);
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
