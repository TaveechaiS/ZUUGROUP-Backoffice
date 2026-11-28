import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { isSessionExpired } from '@/lib/auth/session-expiry';

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-zuu-pathname', request.nextUrl.pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  if (
    request.method === 'GET' &&
    [
      '/api/public',
      '/api/dashboard',
      '/api/reports',
      '/api/customers',
      '/api/customer-groups',
      '/api/sales-territories',
      '/api/customer-documents',
      '/api/customer-follow-ups',
      '/api/expenses',
      '/api/purchases',
      '/api/quotes',
      '/api/orders',
      '/api/billing',
      '/api/promotions',
      '/api/stock-counts',
      '/api/settings',
    ].some(
      (prefix) =>
        request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(prefix + '/'),
    )
  ) {
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set('cookie', request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(responseHeaders).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (
    !isAuthRetryableFetchError(error) &&
    !((error?.status ?? 0) >= 500) &&
    path !== '/login' &&
    path !== '/api' &&
    !path.startsWith('/api/')
  ) {
    const expired =
      user && isSessionExpired((await supabase.auth.getSession()).data.session?.access_token);
    if (!user || expired) {
      if (expired) await supabase.auth.signOut({ scope: 'local' });
      const redirect = NextResponse.redirect(
        new URL(expired ? '/login?error=expired' : '/login', request.url),
      );
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      redirect.headers.set('Cache-Control', 'private, no-store');
      return redirect;
    }
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
