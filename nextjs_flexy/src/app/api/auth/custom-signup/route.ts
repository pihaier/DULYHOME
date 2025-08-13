import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userData } = await request.json();

    // Service role client 사용
    const supabase = createServiceClient();

    // 1. Admin API로 사용자 생성 (email_confirm: false 명시)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // 이메일 확인 필요
      user_metadata: userData || {},
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. 인증 링크 생성 (generateLink 제거 - createUser로 이미 사용자 생성됨)
    // 이메일 확인 링크는 Supabase가 자동으로 전송
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    // 3. 이메일 전송 (Supabase의 이메일 템플릿 사용)
    // 여기서는 링크만 반환하고, 실제 이메일은 Supabase가 자동으로 전송

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
      },
    });
  } catch (error) {
    console.error('Custom signup error:', error);
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
