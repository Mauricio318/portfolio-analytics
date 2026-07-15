import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

// Helper para fazer requisições ao Vercel KV via REST API
async function queryKV(command: string[]) {
  const url = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;
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

// GET: retorna o total de visitas
export async function GET() {
  const hasKV = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
  // 1. Tenta buscar do Vercel KV (Produção)
  if (hasKV) {
    const kvCount = await queryKV(['GET', 'visit_count']);
    if (kvCount !== null) {
      return NextResponse.json({ count: parseInt(kvCount, 10) || 0 });
    }
  }

  // 2. Fallback para SQLite (Local)
  try {
    const db = getDb(true);
    const row = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
    const count = parseInt(row?.value || '0', 10);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: registra uma nova visita (1x por IP por dia)
export async function POST() {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || headersList.get('x-client-ip')
      || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || 'direto';
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // --- MODO PRODUÇÃO: Vercel KV ---
    const hasKV = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
    if (hasKV) {
      const ipDayKey = `visit_ip:${ip}:${today}`;
      
      // Verifica se o IP já visitou hoje (chave expira em 24h)
      const alreadyVisited = await queryKV(['GET', ipDayKey]);
      const currentVal = await queryKV(['GET', 'visit_count']);
      let currentCount = parseInt(currentVal || '0', 10);

      if (alreadyVisited) {
        return NextResponse.json({ count: currentCount });
      }

      // Incrementa atomicamente o contador
      const newVal = await queryKV(['INCR', 'visit_count']);
      currentCount = parseInt(newVal || '0', 10);

      // Marca o IP como visitado hoje (expira em 86400 segundos = 24h)
      await queryKV(['SET', ipDayKey, '1', 'EX', '86400']);

      // Salva log simplificado em uma lista Redis (últimas 100 visitas)
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

      // Detecta dispositivo/navegador
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
        visited_at: new Date().toISOString()
      };

      // Adiciona o log na lista no Redis e limita a 100 itens
      await queryKV(['LPUSH', 'recent_visits_list', JSON.stringify(visitLog)]);
      await queryKV(['LTRIM', 'recent_visits_list', '0', '99']);

      return NextResponse.json({ count: currentCount });
    }

    // --- MODO LOCAL: SQLite ---
    const db = getDb();
    const existing = db.prepare(
      "SELECT id FROM visits WHERE ip = ? AND date(visited_at) = ? LIMIT 1"
    ).get(ip, today);

    const currentRow = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
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
      "INSERT INTO visits (ip, country, city, device, browser, referrer) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(ip, 'Desconhecido', 'Desconhecida', device, browser, referrer);

    const newCount = currentCount + 1;
    db.prepare("INSERT INTO settings (key, value) VALUES ('visit_count', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(String(newCount));

    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Erro ao registrar visita:', error);
    return NextResponse.json({ count: 0 });
  }
}
