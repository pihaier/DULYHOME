import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, language, region, currency } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '키워드는 필수입니다' },
        { status: 400 }
      );
    }

    // Supabase Edge Function 호출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-keyword-categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          keyword,
          language,
          region,
          currency,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', data);
      return NextResponse.json(
        { success: false, error: data.error || '카테고리 로드 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}