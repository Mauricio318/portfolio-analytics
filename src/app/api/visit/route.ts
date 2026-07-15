import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

// GET: retorna o total de visitas
export async function GET() {
  const isProd = process.env.VERCEL_URL || process.env.VERCEL || process.env.NODE_ENV === 'production';
  // 1. Em Produção (Vercel): Busca do CounterAPI
  if (isProd) {
    try {
      const res = await fetch('https://api.counterapi.dev/v1/mauriciobimbu/visits', {
        next: { revalidate: 0 }
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ count: data.count || 0 });
      }
    } catch (e) {
      console.error('Erro ao ler CounterAPI:', e);
    }
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
export async function POST() {
  try {
    const isProd = process.env.VERCEL_URL || process.env.VERCEL || process.env.NODE_ENV === 'production';
    // 1. Em Produção (Vercel): Incrementa usando a CounterAPI
    if (isProd) {
      try {
        const res = await fetch('https://api.counterapi.dev/v1/mauriciobimbu/visits/up', {
          method: 'GET',
          next: { revalidate: 0 }
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ count: data.count || 1 });
        }
      } catch (e) {
        console.error('Erro ao incrementar CounterAPI:', e);
      }
      return NextResponse.json({ count: 1 });
    }

    // 2. Localmente: Incrementa no SQLite
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || 'direto';
    const today = new Date().toISOString().slice(0, 10);

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
