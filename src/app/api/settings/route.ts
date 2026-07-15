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
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[];
    const settings = rows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const { key, value } = await request.json();
    const db = getDb();
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    stmt.run(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
