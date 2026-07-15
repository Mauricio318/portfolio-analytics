import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}


// Helper para fazer requisições ao Vercel KV via REST API
async function queryKV(command: string[]) {
  let url = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
  let token = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;

  // Fallback: extrai credenciais HTTP a partir da conexão TCP da Vercel (KV_REDIS_URL)
  if (!url || !token) {
    const redisUrl = process.env.KV_REDIS_URL;
    if (redisUrl) {
      try {
        const u = new URL(redisUrl);
        token = u.password; // senha = token
        url = `https://${u.hostname}`; // host = rest url
      } catch (e) {
        console.error('Erro ao processar KV_REDIS_URL:', e);
      }
    }
  }

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result;
    }
  } catch (e) {
    console.error('Erro ao acessar Vercel KV:', e);
  }
  return null;
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const hasKV = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || process.env.KV_REDIS_URL;

  // --- MODO PRODUÇÃO: Ler estatísticas do Vercel KV ---
  if (hasKV) {
    try {
      const totalVal = await queryKV(['GET', 'visit_count']);
      const total = parseInt(totalVal || '0', 10);

      // Busca a lista de últimas visitas (recent_visits_list)
      const list = await queryKV(['LRANGE', 'recent_visits_list', '0', '99']) as string[] | null;
      const recent = (list || []).map(item => JSON.parse(item));

      // Agrega dados em tempo real no servidor para o dashboard
      const countryMap: Record<string, number> = {};
      const deviceMap: Record<string, number> = {};
      const browserMap: Record<string, number> = {};

      recent.forEach((v: any) => {
        countryMap[v.country] = (countryMap[v.country] || 0) + 1;
        deviceMap[v.device] = (deviceMap[v.device] || 0) + 1;
        browserMap[v.browser] = (browserMap[v.browser] || 0) + 1;
      });

      const byCountry = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      const byDevice = Object.entries(deviceMap)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      const byBrowser = Object.entries(browserMap)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({ total, byCountry, byDevice, byBrowser, recent: recent.slice(0, 20) });
    } catch (e) {
      console.error('Erro ao agregar estatísticas do KV:', e);
    }
  }

  // --- MODO LOCAL: SQLite ---
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
