import { NextResponse } from 'next/server';
import { dbQuery, dbQueryOne, dbExecute, dbTransaction } from '@/lib/query';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const admin = searchParams.get('admin') === 'true';

    let query = admin 
      ? 'SELECT * FROM resume_items'
      : 'SELECT * FROM resume_items WHERE is_visible = 1';

    const params: any[] = [];
    if (type) {
      query += admin ? ' WHERE type = ?' : ' AND type = ?';
      params.push(type);
    }
    query += ' ORDER BY sort_order ASC, id DESC';

    const items = await dbQuery(query, params);
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
        sql: 'UPDATE resume_items SET sort_order = ? WHERE id = ?',
        params: [item.sort_order, item.id]
      }));
      await dbTransaction(statements);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      await dbExecute('UPDATE resume_items SET is_visible = ? WHERE id = ?', [body.is_visible ? 1 : 0, body.id]);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await dbExecute(`
        UPDATE resume_items 
        SET type = ?, title = ?, company = ?, period = ?, description = ?, highlights = ?, technologies = ?, certificate_url = ?, is_visible = ?
        WHERE id = ?
      `, [
        body.type,
        body.title,
        body.company || '',
        body.period || '',
        body.description || '',
        body.highlights || '',
        body.technologies || '',
        body.certificate_url || '',
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        body.id
      ]);

      return NextResponse.json({ success: true, id: body.id });
    } else {
      const maxOrderResult: any = await dbQueryOne('SELECT MAX(sort_order) as maxOrder FROM resume_items WHERE type = ?', [body.type]);
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = await dbExecute(`
        INSERT INTO resume_items (type, title, company, period, description, highlights, technologies, certificate_url, is_visible, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        body.type,
        body.title,
        body.company || '',
        body.period || '',
        body.description || '',
        body.highlights || '',
        body.technologies || '',
        body.certificate_url || '',
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

    await dbExecute('DELETE FROM resume_items WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
