import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// 환경변수
const DAJI_APP_KEY = Deno.env.get('DAJI_APP_KEY')!;
const DAJI_APP_SECRET = Deno.env.get('DAJI_APP_SECRET')!;
const API_BASE_URL = 'https://openapi.dajisaas.com';

interface KeywordCategoryRequest {
  keyword: string;
  language?: string;
  region?: string;
  currency?: string;
}

interface KeywordCategoryResponse {
  categoryID: number;
  name: string;
  level: number | null;
  isLeaf: boolean;
  parentIDs: number[];
  childCategorys?: Array<{
    id: number;
    name: string;
    categoryType: string;
    isLeaf: boolean;
  }>;
}



// MD5 Sign 생성 (API 문서의 규칙에 따라)
async function generateSign(params: Record<string, any>, appSecret: string): Promise<string> {
  // sign 파라미터 제거
  const signParams = { ...params };
  delete signParams.sign;
  
  // 파라미터를 알파벳 순으로 정렬
  const sortedKeys = Object.keys(signParams).sort();
  const paramPairs: string[] = [];
  
  for (const key of sortedKeys) {
    if (signParams[key] !== undefined && signParams[key] !== null) {
      paramPairs.push(`${key}=${signParams[key]}`);
    }
  }
  
  // secret 추가
  paramPairs.push(`secret=${appSecret}`);
  
  // & 로 연결
  const signStr = paramPairs.join('&');
  
  console.log('Sign string before MD5:', signStr);
  
  // MD5 해시 생성
  const encoder = new TextEncoder();
  const data = encoder.encode(signStr);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 대문자로 변환
  return hashHex.toUpperCase();
}

Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 본문 파싱 - 중국어로 변경 (API가 한국어를 지원하지 않는 것 같음)
    const { keyword, language = 'zh_CN', region = 'CN', currency = 'CNY' }: KeywordCategoryRequest = await req.json()

    if (!keyword) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '키워드는 필수입니다' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }



    // API 파라미터 준비
    const apiParams: Record<string, any> = {
      appKey: DAJI_APP_KEY,
      keyword: keyword,
    }
    
    // 선택적 파라미터 추가 (값이 있을 때만)
    if (language) apiParams.language = language;
    if (region) apiParams.region = region;
    if (currency) apiParams.currency = currency;
    
    console.log('API Parameters before sign:', apiParams)
    
    // 서명 생성
    apiParams.sign = await generateSign(apiParams, DAJI_APP_SECRET);
    
    console.log('API Parameters with sign:', apiParams)
    
    // API 호출
    const queryString = new URLSearchParams(apiParams).toString();
    const apiUrl = `${API_BASE_URL}/alibaba/product/keywordSNQuery?${queryString}`;

    console.log('Fetching keyword categories for:', keyword)
    console.log('Full API URL:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText)
      throw new Error(`API 요청 실패: ${response.status}`)
    }

    const data = await response.json()
    console.log('API Response:', JSON.stringify(data, null, 2))
    console.log('API Response data field:', data.data)
    console.log('API Response data length:', data.data?.length)

    // API 응답 처리
    if (data.code !== 200) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.message || 'API 오류' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // 카테고리 데이터 추출 및 변환 (실제 API 응답에 맞게 수정)
    let categories: KeywordCategoryResponse[] = []
    
    if (data.data && Array.isArray(data.data)) {
      categories = data.data.map((item: any) => ({
        categoryID: parseInt(item.id) || item.categoryID, // id를 categoryID로 매핑
        name: item.translateName || item.name || '', // 한글 번역이 있으면 사용, 없으면 중국어
        level: item.level || null,
        isLeaf: item.isLeaf || false,
        parentIDs: item.parentIDs || [0],
        childCategorys: item.children ? item.children.map((child: any) => ({
          id: parseInt(child.id?.split(':')[1] || child.id), // "7869:21959" 형식에서 뒷부분만 추출
          name: child.translateName || child.name || '', // 한글 번역 우선
          categoryType: child.categoryType || '1',
          isLeaf: child.isLeaf !== false,
        })) : item.childCategorys || [],
      }))
    }
    
    console.log('Transformed categories:', categories);
    
    // 디버깅: 첫 번째 카테고리 이름 확인
    if (categories.length > 0) {
      console.log('Category name:', categories[0].name)
      console.log('Is Korean?:', /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(categories[0].name))
    }

    // 중복 제거 (categoryID 기준)
    const uniqueCategories = categories.reduce((acc: KeywordCategoryResponse[], curr) => {
      if (!acc.find(c => c.categoryID === curr.categoryID)) {
        acc.push(curr)
      }
      return acc
    }, [])

    // 최대 10개까지만 반환 (성능 최적화)
    const limitedCategories = uniqueCategories.slice(0, 10)

    return new Response(
      JSON.stringify({ 
        success: true, 
        categories: limitedCategories,
        totalCount: uniqueCategories.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-keyword-categories:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        categories: [] // 에러 시에도 빈 배열 반환
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
});