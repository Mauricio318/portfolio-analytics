import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    const dirname = typeof __dirname !== 'undefined' ? __dirname : 'not-defined';
    
    // Lista arquivos na raiz
    const rootFiles = fs.existsSync(cwd) ? fs.readdirSync(cwd) : [];
    
    // Lista arquivos em caminhos prováveis
    const nextServerApp = path.join(cwd, '.next', 'server', 'app');
    const nextServerAppFiles = fs.existsSync(nextServerApp) ? fs.readdirSync(nextServerApp) : [];

    const nextServer = path.join(cwd, '.next', 'server');
    const nextServerFiles = fs.existsSync(nextServer) ? fs.readdirSync(nextServer) : [];

    // Filtra apenas as chaves (nomes) das variáveis de ambiente relacionadas para diagnóstico
    const foundEnvKeys = Object.keys(process.env).filter(key => 
      key.includes('KV') || 
      key.includes('STORAGE') || 
      key.includes('REDIS') || 
      key.includes('URL') || 
      key.includes('TOKEN')
    );

    let parsedHost = 'Nenhum';
    const redisUrl = process.env.KV_REDIS_URL;
    if (redisUrl) {
      const match = redisUrl.match(/rediss:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
      if (match) {
        parsedHost = match[3];
      }
    }

    const envVarsChecked = {
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      STORAGE_REST_API_URL: !!process.env.STORAGE_REST_API_URL,
      STORAGE_REST_API_TOKEN: !!process.env.STORAGE_REST_API_TOKEN,
      STORAGE_URL: !!process.env.STORAGE_URL,
      STORAGE_TOKEN: !!process.env.STORAGE_TOKEN,
      KV_URL: !!process.env.KV_URL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      foundEnvKeys,
      parsedHost
    };

    return NextResponse.json({
      cwd,
      dirname,
      rootFiles,
      nextServerFiles,
      nextServerAppFiles,
      envVarsChecked,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
