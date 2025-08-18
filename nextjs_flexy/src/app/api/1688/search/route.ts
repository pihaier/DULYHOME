import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인 (선택사항)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 요청 본문 파싱
    const body = await request.json();
    
    // Edge Function 호출
    const { data, error } = await supabase.functions.invoke('search-1688-products', {
      body: {
        keyword: body.keyword,
        page: body.page || 1,
        pageSize: body.pageSize || 20,
        filter: body.filter,
        sort: body.sort,
        priceStart: body.priceStart,
        priceEnd: body.priceEnd,
        categoryId: body.categoryId,
        language: body.language || 'ko',
      },
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '검색 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// GET 메서드도 지원 (선택사항)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json(
      { success: false, error: '검색어를 입력해주세요.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase.functions.invoke('search-1688-products', {
    body: {
      keyword,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      filter: searchParams.get('filter'),
      sort: searchParams.get('sort'),
      priceStart: searchParams.get('priceStart'),
      priceEnd: searchParams.get('priceEnd'),
      categoryId: searchParams.get('categoryId'),
      language: searchParams.get('language') || 'ko',
    },
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}