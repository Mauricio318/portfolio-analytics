import { NextResponse } from 'next/server';
import { dbQuery, dbQueryOne, dbExecute, dbTransaction } from '@/lib/query';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';

    const query = admin 
      ? 'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM services WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC';

    const services = await dbQuery(query);
    return NextResponse.json(services);
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
        sql: 'UPDATE services SET sort_order = ? WHERE id = ?',
        params: [item.sort_order, item.id]
      }));
      await dbTransaction(statements);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      await dbExecute('UPDATE services SET is_visible = ? WHERE id = ?', [body.is_visible ? 1 : 0, body.id]);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await dbExecute(`
        UPDATE services 
        SET title = ?, description = ?, icon = ?, metric_value = ?, metric_label = ?, features = ?, is_visible = ?
        WHERE id = ?
      `, [
        body.title,
        body.description || '',
        body.icon || 'Database',
        body.metric_value || '',
        body.metric_label || '',
        body.features || '',
        body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1,
        body.id
      ]);

      return NextResponse.json({ success: true, id: body.id });
    } else {
      const maxOrderResult: any = await dbQueryOne('SELECT MAX(sort_order) as maxOrder FROM services');
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      const result = await dbExecute(`
        INSERT INTO services (title, description, icon, metric_value, metric_label, features, is_visible, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        body.title,
        body.description || '',
        body.icon || 'Database',
        body.metric_value || '',
        body.metric_label || '',
        body.features || '',
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

    await dbExecute('DELETE FROM services WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
