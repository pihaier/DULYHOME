import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 환경별 보호 설정
  const environment = process.env.VERCEL_ENV || 'development';
  
  // 프리뷰 환경 보호
  if (environment === 'preview') {
    // 검색 엔진 크롤링 차단
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    response.headers.set('X-Environment', 'preview');
    
    // API 경로는 인증 제외
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      const basicAuth = request.headers.get('authorization');
      const username = process.env.PREVIEW_AUTH_USERNAME || 'duly';
      const password = process.env.PREVIEW_AUTH_PASSWORD || 'preview2025';
      const expectedAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      
      if (!basicAuth || basicAuth !== expectedAuth) {
        return new Response('🔒 Preview Environment - Team Access Only', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Preview Environment"',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }
    }
  }
  
  // 프로덕션 환경 보안 헤더
  if (environment === 'production') {
    response.headers.set('X-Environment', 'production');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 경로들
  const protectedPaths = ['/dashboard', '/chat', '/profile', '/internal', '/staff'];

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath));

  // 인증 페이지는 리다이렉트에서 제외
  const isAuthPage = path.startsWith('/auth/');

  // 보호된 경로에 로그인하지 않은 사용자가 접근하려는 경우
  // 단, 이미 인증 페이지인 경우는 제외
  if (isProtectedPath && !user && !isAuthPage) {
    // 원래 요청했던 URL을 저장
    const redirectUrl = new URL('/auth/customer/login', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // 로그인한 사용자가 로그인 페이지에 접근하려는 경우
  if (path.startsWith('/auth/') && path.includes('/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // /staff 경로는 admin, korean_team, chinese_staff만 접근 가능
  if (path.startsWith('/staff') && user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'korean_team', 'chinese_staff'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
