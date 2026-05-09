import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Handle Root Path
  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/dashboard' : '/login', request.url));
  }

  // 2. If on login page and already have token, go to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. If on dashboard and no token, go to login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
