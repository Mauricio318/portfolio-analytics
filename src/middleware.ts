import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const adminPattern = /^\/admin(?!\/login)/;
  
  if (adminPattern.test(request.nextUrl.pathname)) {
    const sessionCookie = request.cookies.get('session');
    const session = sessionCookie?.value;
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verify payload
    const parsed = await decrypt(session);
    if (!parsed) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
