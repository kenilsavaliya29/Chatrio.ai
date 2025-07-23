import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/pngs/') ||
    path.startsWith('/svgs/') ||
    path.includes('.') // This catches all file extensions
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing path: ${path}`);

  // For now, let's disable the auth checks to see if this is the issue
  // Just handle the basic redirects without token verification
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  console.log(`[Middleware] Token exists: ${!!token}`);
  
  // If no token and trying to access protected routes, redirect to login
  if (!token && path.startsWith('/dashboard')) {
    console.log(`[Middleware] No token, redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If has token and trying to access login/signup, redirect to dashboard
  if (token && (path === '/login' || path === '/signup')) {
    console.log(`[Middleware] Has token, redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log(`[Middleware] Allowing access to ${path}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 