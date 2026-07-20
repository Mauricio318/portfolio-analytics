import { NextResponse } from 'next/server';
import { getDb, deleteUploadedFile } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sanitizeObject } from '@/lib/security';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

function parseDateValue(dateStr: string | null | undefined, isEnd = false): number {
  if (!dateStr) return isEnd ? 999999 : 0;
  const str = dateStr.trim().toLowerCase();
  if (str === 'atual' || str === 'present' || str === 'current' || str === 'em andamento') return 999999;
  
  const parts = str.split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(month)) {
      return year * 100 + month;
    }
  } 
  
  const year = parseInt(str, 10);
  if (!isNaN(year)) {
    return year * 100 + (isEnd ? 12 : 1);
  }

  return 0;
}

export async function GET() {
  try {
    const db = getDb(true);
    const items = db.prepare('SELECT * FROM resume_items ORDER BY sort_order ASC, id DESC').all() as any[];
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    if (body.action === 'reorder') {
      const { order } = body;
      const db = getDb();
      const stmt = db.prepare('UPDATE resume_items SET sort_order = ? WHERE id = ?');
      db.transaction(() => {
        for (const item of order) {
          stmt.run(item.sort_order, item.id);
        }
      })();
      return NextResponse.json({ success: true });
    }

    const { type, title, institution, start_date, end_date, description, technologies, image_url, link } = body;
    const db = getDb();
    const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM resume_items').get() as { max: number };
    const sort_order = (maxSort?.max || 0) + 1;

    const stmt = db.prepare('INSERT INTO resume_items (type, title, institution, start_date, end_date, description, technologies, image_url, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(type, title, institution, start_date, end_date, description, technologies, image_url, link, sort_order);
    
    return NextResponse.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const db = getDb();
    const item = db.prepare('SELECT image_url FROM resume_items WHERE id = ?').get(id) as any;
    if (item?.image_url) {
      await deleteUploadedFile(item.image_url);
    }
    db.prepare('DELETE FROM resume_items WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const rawBody = await request.json();
    const { id, type, title, institution, start_date, end_date, description, technologies, image_url, link } = sanitizeObject(rawBody);
    const db = getDb();
    const oldItem = db.prepare('SELECT image_url FROM resume_items WHERE id = ?').get(id) as any;
    if (oldItem?.image_url && oldItem.image_url !== image_url) {
      await deleteUploadedFile(oldItem.image_url);
    }
    const stmt = db.prepare('UPDATE resume_items SET type = ?, title = ?, institution = ?, start_date = ?, end_date = ?, description = ?, technologies = ?, image_url = ?, link = ? WHERE id = ?');
    stmt.run(type, title, institution, start_date, end_date, description, technologies, image_url, link, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
