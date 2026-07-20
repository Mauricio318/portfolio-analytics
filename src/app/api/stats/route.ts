import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import Redis from 'ioredis';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

// Singleton para o cliente Redis TCP
let redisClient: Redis | null = null;
function getRedis() {
  if (redisClient) return redisClient;
  const redisUrl = process.env.KV_REDIS_URL;
  if (!redisUrl) return null;
  try {
    const options: any = {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    };
    // Habilita suporte a TLS flexível para conexões em nuvem (Redis Labs / Upstash)
    if (redisUrl.startsWith('rediss://')) {
      options.tls = { rejectUnauthorized: false };
    }
    redisClient = new Redis(redisUrl, options);
    return redisClient;
  } catch (e) {
    console.error('Erro ao conectar no Redis:', e);
    return null;
  }
}

export async function GET(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const url = new URL(request.url);
    const targetPage = url.searchParams.get('page') || 'all'; // 'all', '/', '/academico'

    const isProd = process.env.VERCEL_URL || process.env.VERCEL || process.env.NODE_ENV === 'production';
    const redis = getRedis();

    // 1. Em Produção (Vercel): Carrega logs detalhados do Redis
    if (isProd && redis) {
      try {
        const countKey = targetPage === '/academico' ? 'visit_count_academic' : 'visit_count';
        const totalVal = await redis.get(countKey);
        const total = parseInt(totalVal || '0', 10);

        // Busca lista de últimas visitas salvos no Redis
        const list = await redis.lrange('recent_visits_list', 0, 99);
        const allRecent = list.map(item => JSON.parse(item));
        
        // Filtra por página alvo se necessário
        const recent = targetPage === 'all' 
          ? allRecent 
          : allRecent.filter((v: any) => v.page === targetPage || (targetPage === '/' && (!v.page || v.page === '/')));

        // Agrega estatísticas em tempo real no servidor
        const countryMap: Record<string, number> = {};
        const deviceMap: Record<string, number> = {};
        const browserMap: Record<string, number> = {};

        recent.forEach((v: any) => {
          const country = v.country || 'Desconhecido';
          const device = v.device || 'Desktop';
          const browser = v.browser || 'Outro';
          
          countryMap[country] = (countryMap[country] || 0) + 1;
          deviceMap[device] = (deviceMap[device] || 0) + 1;
          browserMap[browser] = (browserMap[browser] || 0) + 1;
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
        console.error('Erro ao ler estatísticas do Redis:', e);
      }
    }

    // 2. Localmente/Fallback: SQLite
    const db = getDb(true);
    let total = 0;
    
    // Se estiver na produção mas o Redis falhar, tenta ler o total da CounterAPI
    if (isProd) {
      try {
        const counterKeyDev = targetPage === '/academico' ? 'mauriciobimbu_academic' : 'mauriciobimbu';
        const res = await fetch(`https://api.counterapi.dev/v1/${counterKeyDev}/visits`, {
          next: { revalidate: 0 }
        });
        if (res.ok) {
          const data = await res.json();
          total = data.count || 0;
        }
      } catch {}
    }

    if (total === 0) {
      const countKey = targetPage === '/academico' ? 'visit_count_academic' : 'visit_count';
      const totalRow = db.prepare("SELECT value FROM settings WHERE key = ?").get(countKey) as { value: string } | undefined;
      total = parseInt(totalRow?.value || '0', 10);
    }

    // Filtros de SQL baseado na página alvo
    let sqlFilter = "";
    let sqlParams: any[] = [];
    if (targetPage !== 'all') {
      if (targetPage === '/') {
        sqlFilter = "WHERE page = '/' OR page IS NULL OR page = ''";
      } else {
        sqlFilter = "WHERE page = ?";
        sqlParams.push(targetPage);
      }
    }

    const byCountry = db.prepare(`
      SELECT country, COUNT(*) as count FROM visits
      ${sqlFilter}
      GROUP BY country ORDER BY count DESC LIMIT 10
    `).all(...sqlParams) as { country: string; count: number }[];

    const byDevice = db.prepare(`
      SELECT device, COUNT(*) as count FROM visits
      ${sqlFilter}
      GROUP BY device ORDER BY count DESC
    `).all(...sqlParams) as { device: string; count: number }[];

    const byBrowser = db.prepare(`
      SELECT browser, COUNT(*) as count FROM visits
      ${sqlFilter}
      GROUP BY browser ORDER BY count DESC
    `).all(...sqlParams) as { browser: string; count: number }[];

    const recent = db.prepare(`
      SELECT id, country, city, device, browser, referrer, page, visited_at
      FROM visits
      ${sqlFilter}
      ORDER BY id DESC LIMIT 20
    `).all(...sqlParams);

    return NextResponse.json({ total, byCountry, byDevice, byBrowser, recent });
  } catch (error) {
    console.error('Erro no endpoint de estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
