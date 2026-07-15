import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function GET() {
  const redisUrl = process.env.KV_REDIS_URL;
  if (!redisUrl) {
    return NextResponse.json({ error: 'KV_REDIS_URL não está definida nas variáveis de ambiente!' });
  }

  const logs: string[] = [];
  logs.push('KV_REDIS_URL encontrada.');

  try {
    const options: any = {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    };
    if (redisUrl.startsWith('rediss://')) {
      options.tls = { rejectUnauthorized: false };
      logs.push('TLS habilitado com rejectUnauthorized: false');
    }

    logs.push('Tentando instanciar ioredis...');
    const redis = new Redis(redisUrl, options);

    logs.push('Enviando PING...');
    const pingRes = await redis.ping();
    logs.push(`Resposta PING: ${pingRes}`);

    logs.push('Tentando SET test_key...');
    const setRes = await redis.set('test_key', 'funcionando', 'EX', 60);
    logs.push(`Resposta SET: ${setRes}`);

    logs.push('Tentando GET test_key...');
    const getRes = await redis.get('test_key');
    logs.push(`Resposta GET: ${getRes}`);

    await redis.quit();
    return NextResponse.json({ status: 'Sucesso', logs });
  } catch (error: any) {
    return NextResponse.json({
      status: 'Erro',
      errorMessage: error.message,
      errorStack: error.stack,
      logs
    });
  }
}
