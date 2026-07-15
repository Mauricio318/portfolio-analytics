import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  cookies().set('session', '', { expires: new Date(0) });
  return NextResponse.redirect(new URL('/admin/login', request.url), 302);
}
