import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { headers } from 'next/headers';
import Redis from 'ioredis';

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

// GET: retorna o total de visitas
export async function GET() {
  // 1. Em Produção (Vercel): Busca do Redis
  const redis = getRedis();
  if (redis) {
    try {
      const val = await redis.get('visit_count');
      if (val !== null) {
        return NextResponse.json({ count: parseInt(val, 10) || 0 });
      }
    } catch (e) {
      console.error('Erro ao buscar do Redis GET:', e);
    }
  }

  // Fallback para CounterAPI se o Redis estiver fora ou sem valor
  const isProd = process.env.VERCEL_URL || process.env.VERCEL || process.env.NODE_ENV === 'production';
  if (isProd) {
    try {
      const res = await fetch('https://api.counterapi.dev/v1/mauriciobimbu/visits', {
        next: { revalidate: 0 }
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ count: data.count || 0 });
      }
    } catch {}
    return NextResponse.json({ count: 0 });
  }

  // 2. Localmente: Busca do SQLite
  try {
    const db = getDb(true);
    const row = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
    const count = parseInt(row?.value || '0', 10);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: registra uma nova visita e incrementa o contador
export async function POST(request: Request) {
  try {
    let requestBody: any = {};
    try {
      requestBody = await request.json();
    } catch {}
    const page = requestBody.page || '/';

    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || 'direto';
    const today = new Date().toISOString().slice(0, 10);

    const isProd = process.env.VERCEL_URL || process.env.VERCEL || process.env.NODE_ENV === 'production';
    const redis = getRedis();

    const countKey = page === '/academico' ? 'visit_count_academic' : 'visit_count';
    const ipDayKey = page === '/academico' ? `visit_ip_academic:${ip}:${today}` : `visit_ip:${ip}:${today}`;

    // 1. Em Produção (Vercel): Usamos o Redis TCP para guardar o histórico detalhado
    if (isProd && redis) {
      try {
        // Verifica se o IP já visitou hoje
        const alreadyVisited = await redis.get(ipDayKey);
        const currentVal = await redis.get(countKey);
        let currentCount = parseInt(currentVal || '0', 10);

        if (alreadyVisited) {
          return NextResponse.json({ count: currentCount });
        }

        // Incrementa o contador
        const newVal = await redis.incr(countKey);
        currentCount = parseInt(String(newVal), 10);

        // Marca IP como visitado hoje (expira em 24h)
        await redis.set(ipDayKey, '1', 'EX', 86400);

        // IP Geo Lookup (Localização real)
        let country = 'Desconhecido';
        let city = 'Desconhecida';
        try {
          if (ip !== '127.0.0.1' && !ip.startsWith('::')) {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
              signal: AbortSignal.timeout(1500)
            });
            if (geoRes.ok) {
              const geo = await geoRes.json();
              if (geo.status === 'success') {
                country = geo.country || 'Desconhecido';
                city = geo.city || 'Desconhecida';
              }
            }
          }
        } catch {}

        let device = 'Desktop';
        if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
          device = /ipad|tablet/i.test(userAgent) ? 'Tablet' : 'Mobile';
        }
        let browser = 'Outro';
        if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
        else if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';

        const visitLog = {
          id: currentCount,
          ip,
          country,
          city,
          device,
          browser,
          referrer,
          page,
          visited_at: new Date().toISOString()
        };

        // Adiciona à lista de visitas recentes no Redis
        await redis.lpush('recent_visits_list', JSON.stringify(visitLog));
        await redis.ltrim('recent_visits_list', 0, 99);

        // Incrementa a CounterAPI em paralelo como redundância
        const counterKeyDev = page === '/academico' ? 'mauriciobimbu_academic' : 'mauriciobimbu';
        fetch(`https://api.counterapi.dev/v1/${counterKeyDev}/visits/up`).catch(() => {});

        return NextResponse.json({ count: currentCount });
      } catch (e) {
        console.error('Erro no Redis POST:', e);
      }
    }

    // Fallback caso o Redis falhe na Produção
    if (isProd) {
      try {
        const counterKeyDev = page === '/academico' ? 'mauriciobimbu_academic' : 'mauriciobimbu';
        const res = await fetch(`https://api.counterapi.dev/v1/${counterKeyDev}/visits/up`, {
          method: 'GET',
          next: { revalidate: 0 }
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ count: data.count || 1 });
        }
      } catch {}
      return NextResponse.json({ count: 1 });
    }

    // 2. Localmente: Incrementa no SQLite
    const db = getDb();
    const existing = db.prepare(
      "SELECT id FROM visits WHERE ip = ? AND date(visited_at) = ? AND page = ? LIMIT 1"
    ).get(ip, today, page);

    const currentRow = db.prepare("SELECT value FROM settings WHERE key = ?").get(countKey) as { value: string } | undefined;
    const currentCount = parseInt(currentRow?.value || '0', 10);

    if (existing) {
      return NextResponse.json({ count: currentCount });
    }

    let device = 'Desktop';
    if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
      device = /ipad|tablet/i.test(userAgent) ? 'Tablet' : 'Mobile';
    }
    let browser = 'Outro';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';

    db.prepare(
      "INSERT INTO visits (ip, country, city, device, browser, referrer, page) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(ip, 'Desconhecido', 'Desconhecida', device, browser, referrer, page);

    const newCount = currentCount + 1;
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(countKey, String(newCount));

    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Erro ao registrar visita:', error);
    return NextResponse.json({ count: 0 });
  }
}
