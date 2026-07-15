import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const db = getDb(true);
    const row = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
    const count = parseInt(row?.value || '0', 10);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: registra uma nova visita — mesmo IP só conta 1x por dia
export async function POST() {
  try {
    const db = getDb();
    const headersList = headers();

    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || headersList.get('x-client-ip')
      || 'unknown';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || 'direto';

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Busca contagem atual
    const currentRow = db.prepare("SELECT value FROM settings WHERE key = 'visit_count'").get() as { value: string } | undefined;
    const currentCount = parseInt(currentRow?.value || '0', 10);

    // Mesmo IP já visitou hoje? Retorna a contagem sem incrementar
    const existing = db.prepare(
      "SELECT id FROM visits WHERE ip = ? AND date(visited_at) = ? LIMIT 1"
    ).get(ip, today);

    if (existing) {
      return NextResponse.json({ count: currentCount });
    }

    // Detecta dispositivo
    let device = 'Desktop';
    if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
      device = /ipad|tablet/i.test(userAgent) ? 'Tablet' : 'Mobile';
    }

    // Detecta navegador
    let browser = 'Outro';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/edg/i.test(userAgent)) browser = 'Edge';

    // Geolocalização por IP
    let country = 'Desconhecido';
    let city = 'Desconhecida';
    try {
      if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('::')) {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
          signal: AbortSignal.timeout(2000)
        });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.status === 'success') {
            country = geo.country || 'Desconhecido';
            city = geo.city || 'Desconhecida';
          }
        }
      }
    } catch {
      // silencioso
    }

    // Registra a visita
    db.prepare(
      "INSERT INTO visits (ip, country, city, device, browser, referrer) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(ip, country, city, device, browser, referrer);

    // Incrementa o contador
    const newCount = currentCount + 1;
    db.prepare("INSERT INTO settings (key, value) VALUES ('visit_count', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(String(newCount));

    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Erro ao registrar visita:', error);
    return NextResponse.json({ count: 0 });
  }
}
