import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DAJI_APP_KEY = Deno.env.get('DAJI_APP_KEY')!;
const DAJI_APP_SECRET = Deno.env.get('DAJI_APP_SECRET')!;
const API_BASE_URL = 'https://openapi.dajisaas.com';

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 환경변수 체크
    if (!DAJI_APP_KEY || !DAJI_APP_SECRET) {
      console.error('Missing environment variables:', {
        hasAppKey: !!DAJI_APP_KEY,
        hasAppSecret: !!DAJI_APP_SECRET
      });
      throw new Error('API credentials not configured');
    }

    const body = await req.json();
    const { categoryID = '0' } = body; // 0은 최상위 카테고리

    // API 파라미터 (appSecret는 sign 생성에만 사용)
    const params: Record<string, any> = {
      appKey: DAJI_APP_KEY,
      categoryID: categoryID.toString(), // API 가이드에 따라 categoryID 사용
    };

    // Sign 생성
    params.sign = await generateSign(params, DAJI_APP_SECRET);
    console.log('Generated sign:', params.sign);
    console.log('Request params:', params);

    // API 호출
    const queryString = new URLSearchParams(params).toString();
    const apiUrl = `${API_BASE_URL}/alibaba/category/get?${queryString}`;

    console.log('📂 Getting categories:', { categoryID });
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));

    if (result.code !== 200) {
      console.error('API returned error code:', result.code, 'message:', result.message);
      throw new Error(result.message || '카테고리 조회 실패');
    }

    // 데이터 변환 - 프론트엔드 Category 인터페이스와 일치
    const transformedData = result.data.map((category: any) => ({
      categoryID: category.categoryID,  // 대문자 ID 유지
      name: category.name,
      level: category.level,
      isLeaf: category.isLeaf,
      parentIDs: category.parentIDs,  // 대문자 복수형 유지
      childCategorys: category.childCategorys?.map((child: any) => ({
        id: child.id,
        name: child.name,
        categoryType: child.categoryType,
        isLeaf: child.isLeaf,
      })) || [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Category fetch error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '카테고리 조회 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});