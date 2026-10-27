import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const role = request.cookies.get('cbh_role')?.value;
    if (role === 'customer') {
      // Customer is logged in -> redirect away from admin to customer portal
      return NextResponse.redirect(new URL('/customer', request.url));
    }
    if (role !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /customer routes
  if (pathname.startsWith('/customer')) {
    const role = request.cookies.get('cbh_role')?.value;
    if (role === 'admin') {
      // Admin is logged in -> redirect away from customer to admin operations terminal
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (role !== 'customer') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
