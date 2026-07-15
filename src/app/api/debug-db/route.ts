import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    return NextResponse.json({
      cwd,
      dirname,
      rootFiles,
      nextServerFiles,
      nextServerAppFiles,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
