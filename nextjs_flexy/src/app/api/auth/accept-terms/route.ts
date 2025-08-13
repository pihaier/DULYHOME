import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { terms_accepted, privacy_accepted, marketing_accepted, returnUrl } = await request.json();

  // 필수 약관 체크
  if (!terms_accepted || !privacy_accepted) {
    return NextResponse.json({ error: '필수 약관에 동의해주세요.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 현재 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 약관 동의 정보 업데이트
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      terms_accepted_at: new Date().toISOString(),
      privacy_accepted_at: new Date().toISOString(),
      marketing_accepted_at: marketing_accepted ? new Date().toISOString() : null,
    },
  });

  if (updateError) {
    return NextResponse.json({ error: '약관 동의 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }

  // 성공
  return NextResponse.json({
    success: true,
    redirectUrl: returnUrl || '/',
  });
}
