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
      : 'SELECT * FROM resume_items WHERE is_visible = 1 OR is_visible IS NULL';

    const params: any[] = [];
    if (type) {
      query += admin ? ' WHERE type = ?' : ' AND type = ?';
      params.push(type);
    }
    query += ' ORDER BY sort_order ASC, id DESC';

    const items = await dbQuery(query, params);
    
    // Sincroniza e garante que start_date e end_date venham preenchidos
    const mapped = items.map((item: any) => ({
      ...item,
      institution: item.institution || item.company || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      image_url: item.image_url || item.certificate_url || ''
    }));

    return NextResponse.json(mapped);
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

    const title = body.title || '';
    const institution = body.institution || body.company || '';
    const startDate = body.start_date || '';
    const endDate = body.end_date || '';
    const description = body.description || '';
    const technologies = body.technologies || '';
    const imageUrl = body.image_url || body.certificate_url || '';
    const link = body.link || '';
    const type = body.type || 'job';
    const isVisible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1;

    if (body.id) {
      await dbExecute(`
        UPDATE resume_items 
        SET type = ?, title = ?, institution = ?, start_date = ?, end_date = ?, description = ?, technologies = ?, image_url = ?, link = ?, is_visible = ?
        WHERE id = ?
      `, [
        type,
        title,
        institution,
        startDate,
        endDate,
        description,
        technologies,
        imageUrl,
        link,
        isVisible,
        body.id
      ]);

      return NextResponse.json({ success: true, id: body.id });
    } else {
      const maxOrderResult: any = await dbQueryOne('SELECT MAX(sort_order) as maxOrder FROM resume_items WHERE type = ?', [type]);
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = await dbExecute(`
        INSERT INTO resume_items (type, title, institution, start_date, end_date, description, technologies, image_url, link, is_visible, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        type,
        title,
        institution,
        startDate,
        endDate,
        description,
        technologies,
        imageUrl,
        link,
        isVisible,
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
