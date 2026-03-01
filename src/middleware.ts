import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = 'optc-auth';

export function middleware(request: NextRequest) {
  // If no password is configured, allow access (dev mode)
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Allow access to the login API route
  if (request.nextUrl.pathname === '/api/login') {
    return NextResponse.next();
  }

  // Allow access to the login page itself
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Check if user has the auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);

  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Redirect to login page
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Protect all routes except static files and Next.js internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|api/login).*)',
  ],
};
