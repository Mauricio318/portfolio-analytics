import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const db = getDb(true);

    const totalRow = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
    const total = parseInt(totalRow?.value || '0', 10);

    const byCountry = db.prepare(`
      SELECT country, COUNT(*) as count FROM visits
      GROUP BY country ORDER BY count DESC LIMIT 10
    `).all() as { country: string; count: number }[];

    const byDevice = db.prepare(`
      SELECT device, COUNT(*) as count FROM visits
      GROUP BY device ORDER BY count DESC
    `).all() as { device: string; count: number }[];

    const byBrowser = db.prepare(`
      SELECT browser, COUNT(*) as count FROM visits
      GROUP BY browser ORDER BY count DESC
    `).all() as { browser: string; count: number }[];

    const recent = db.prepare(`
      SELECT id, country, city, device, browser, referrer, visited_at
      FROM visits ORDER BY id DESC LIMIT 20
    `).all();

    return NextResponse.json({ total, byCountry, byDevice, byBrowser, recent });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
