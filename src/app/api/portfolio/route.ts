import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

export async function GET() {
  try {
    const db = getDb(true);
    const items = db.prepare('SELECT * FROM portfolio_items ORDER BY id DESC').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { title, description, category, image_url, link, tags } = await request.json();
    const db = getDb();
    const stmt = db.prepare('INSERT INTO portfolio_items (title, description, category, image_url, link, tags) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(title, description, category, image_url, link, tags);
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
    db.prepare('DELETE FROM portfolio_items WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { id, title, description, category, image_url, link, tags } = await request.json();
    const db = getDb();
    const stmt = db.prepare('UPDATE portfolio_items SET title = ?, description = ?, category = ?, image_url = ?, link = ?, tags = ? WHERE id = ?');
    stmt.run(title, description, category, image_url, link, tags, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
