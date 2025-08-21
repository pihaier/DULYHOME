import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  try {

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // 1688 이미지 URL 검증
    const url = new URL(imageUrl);
    if (!url.hostname.includes('alicdn.com') && !url.hostname.includes('aliimg.com')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // 이미지 가져오기 - 더 많은 헤더 추가
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.1688.com/',
        'Origin': 'https://www.1688.com',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    // 이미지 반환 with 적절한 캐싱 (7일)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800', // 7일 캐싱
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    // 에러 발생 시 대체 이미지 또는 더 자세한 에러 정보 반환
    return NextResponse.json(
      { 
        error: 'Failed to proxy image',
        details: error instanceof Error ? error.message : 'Unknown error',
        url: imageUrl || 'No URL provided'
      },
      { status: 500 }
    );
  }
}