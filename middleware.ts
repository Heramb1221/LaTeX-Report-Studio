import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/editor', '/settings'];

// Routes that authenticated users should not access
const AUTH_ONLY_PREFIXES = ['/login', '/register'];

async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('lrs-auth-token')?.value;
  const authenticated = token ? await isTokenValid(token) : false;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access a protected page → login
  if (!authenticated && isProtected) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register → dashboard
  if (authenticated && isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all paths EXCEPT:
   * - /api/* (handled separately by API routes)
   * - /_next/* (Next.js internals)
   * - /favicon.ico and static files with extensions
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..+).*)'],
};
