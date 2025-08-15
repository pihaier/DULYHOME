import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();

    // 현재 사용자 정보 가져오기 (로그 기록용)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그아웃 - 세션이 없어도 성공으로 처리
    const { error } = await supabase.auth.signOut();

    if (error && error.message !== 'Auth session missing!') {
      throw error;
    }

    // 로그아웃 기록 저장 (선택사항)
    if (user) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'logout',
        entity_type: 'auth',
        metadata: {
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '로그아웃 중 오류가 발생했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
