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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';
    const db = getDb(true);

    const query = admin
      ? 'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM services WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id ASC';

    const services = db.prepare(query).all();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    if (body.action === 'reorder') {
      const { order } = body;
      const db = getDb();
      const stmt = db.prepare('UPDATE services SET sort_order = ? WHERE id = ?');
      db.transaction(() => {
        for (const item of order) {
          stmt.run(item.sort_order, item.id);
        }
      })();
      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_visibility') {
      const db = getDb();
      db.prepare('UPDATE services SET is_visible = ? WHERE id = ?').run(body.is_visible ? 1 : 0, body.id);
      return NextResponse.json({ success: true });
    }

    const { title, description, icon, is_visible } = body;
    const db = getDb();
    const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM services').get() as { max: number };
    const sort_order = (maxSort?.max || 0) + 1;

    const stmt = db.prepare('INSERT INTO services (title, description, icon, is_visible, sort_order) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, description, icon || 'barchart', is_visible !== undefined ? (is_visible ? 1 : 0) : 1, sort_order);

    return NextResponse.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const { id, title, description, icon, is_visible } = sanitizeObject(rawBody);

    const db = getDb();
    const stmt = db.prepare('UPDATE services SET title = ?, description = ?, icon = ?, is_visible = ? WHERE id = ?');
    stmt.run(title, description, icon || 'barchart', is_visible !== undefined ? (is_visible ? 1 : 0) : 1, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM services WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar serviço' }, { status: 500 });
  }
}
