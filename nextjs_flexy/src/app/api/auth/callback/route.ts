import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnUrl = requestUrl.searchParams.get('returnUrl') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // 약관 동의 여부 확인
      const hasAcceptedTerms = data.user.user_metadata?.terms_accepted_at;
      
      if (!hasAcceptedTerms) {
        // 처음 OAuth 로 가입하는 사용자 - 약관 동의 페이지로 리다이렉트
        return NextResponse.redirect(
          new URL(`/auth/complete-profile?returnUrl=${encodeURIComponent(returnUrl)}`, requestUrl.origin)
        );
      }
      
      // 기존 사용자 - 원래 가려던 페이지로
      return NextResponse.redirect(new URL(returnUrl, requestUrl.origin))
    }
  }

  // 에러가 있으면 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/auth/customer/login?error=oauth_failed', requestUrl.origin))
}