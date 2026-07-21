import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Senha definida por variavel de ambiente ou fallback padrao solicitado bimbu2026
    const adminPassword = process.env.ADMIN_PASSWORD || 'bimbu2026';
    
    if (password === adminPassword) {
      const sessionData = { role: 'admin' };
      const encryptedSessionData = await encrypt(sessionData);
      
      cookies().set('session', encryptedSessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
