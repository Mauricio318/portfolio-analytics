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
    const items = db.prepare('SELECT * FROM skills ORDER BY percentage DESC, id ASC').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { name, level, percentage, image_url } = await request.json();
    const db = getDb();
    const stmt = db.prepare('INSERT INTO skills (name, level, percentage, image_url) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, level, percentage, image_url || null);
    return NextResponse.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { id, name, level, percentage, image_url } = await request.json();
    const db = getDb();
    const stmt = db.prepare('UPDATE skills SET name = ?, level = ?, percentage = ?, image_url = ? WHERE id = ?');
    stmt.run(name, level, percentage, image_url || null, id);
    return NextResponse.json({ success: true });
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
    db.prepare('DELETE FROM skills WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
