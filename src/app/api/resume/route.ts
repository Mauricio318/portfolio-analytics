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
    const db = getDb();
    const items = db.prepare('SELECT * FROM resume_items ORDER BY end_date DESC, id DESC').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { type, title, institution, start_date, end_date, description, technologies, image_url } = await request.json();
    const db = getDb();
    const stmt = db.prepare('INSERT INTO resume_items (type, title, institution, start_date, end_date, description, technologies, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(type, title, institution, start_date, end_date, description, technologies, image_url);
    
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
    db.prepare('DELETE FROM resume_items WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { id, type, title, institution, start_date, end_date, description, technologies, image_url } = await request.json();
    const db = getDb();
    const stmt = db.prepare('UPDATE resume_items SET type = ?, title = ?, institution = ?, start_date = ?, end_date = ?, description = ?, technologies = ?, image_url = ? WHERE id = ?');
    stmt.run(type, title, institution, start_date, end_date, description, technologies, image_url, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
