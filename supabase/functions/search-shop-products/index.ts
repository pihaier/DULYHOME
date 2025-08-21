import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 환경변수에서 API 키 가져오기
const DAJI_APP_KEY = Deno.env.get('DAJI_APP_KEY')!;
const DAJI_APP_SECRET = Deno.env.get('DAJI_APP_SECRET')!;
const API_BASE_URL = 'https://openapi.dajisaas.com';

// Supabase 클라이언트
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Sign 생성 함수 (API 문서의 규칙에 따라)
async function generateSign(params: Record<string, any>, appSecret: string): Promise<string> {
  // sign 파라미터 제거
  const signParams = { ...params };
  delete signParams.sign;
  
  // 파라미터를 알파벳 순으로 정렬
  const sortedKeys = Object.keys(signParams).sort();
  const paramPairs: string[] = [];
  
  for (const key of sortedKeys) {
    if (signParams[key] !== undefined && signParams[key] !== null) {
      // 배열인 경우 각 요소를 개별 파라미터로 추가
      if (Array.isArray(signParams[key])) {
        signParams[key].forEach((v: any) => {
          paramPairs.push(`${key}=${v}`);
        });
      } else {
        paramPairs.push(`${key}=${signParams[key]}`);
      }
    }
  }
  
  // secret 추가
  paramPairs.push(`secret=${appSecret}`);
  
  // & 로 연결
  const signStr = paramPairs.join('&');
  console.log('Sign string before MD5:', signStr);
  
  // MD5 해시 생성 (Web Crypto API 사용)
  const encoder = new TextEncoder();
  const data = encoder.encode(signStr);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 대문자로 변환
  return hashHex.toUpperCase();
}

// 검색 결과 캐싱 (선택사항)
async function getCachedResults(sellerOpenId: string, keyword: string | null, page: number, supabase: any) {
  const cacheKey = `${sellerOpenId}_${keyword || 'all'}_${page}`;
  const { data } = await supabase
    .from('shop_search_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .single();
  
  // 24시간 이내 캐시만 사용
  if (data && new Date(data.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    return data.results;
  }
  
  return null;
}

// 검색 결과 캐싱 저장
async function saveCachedResults(sellerOpenId: string, keyword: string | null, page: number, results: any, supabase: any) {
  const cacheKey = `${sellerOpenId}_${keyword || 'all'}_${page}`;
  await supabase
    .from('shop_search_cache')
    .upsert({
      cache_key: cacheKey,
      seller_open_id: sellerOpenId,
      keyword,
      page,
      results,
      created_at: new Date().toISOString(),
    });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      sellerOpenId,  // 필수: 상점 ID (상품 상세에서 얻은 값)
      keyword,        // 선택: 상점 내 검색 키워드
      beginPage = 1,
      pageSize = 20,
      filter,
      sort,
      priceStart,
      priceEnd,
      categoryId,
      country = 'ko',
      outMemberId,
      regionOpp,
      productCollectionId,
      snId,
    } = body;

    // 필수 파라미터 체크
    if (!sellerOpenId) {
      return new Response(
        JSON.stringify({ error: 'sellerOpenId는 필수입니다. 상품 상세 API에서 얻을 수 있습니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // pageSize 제한
    if (pageSize > 50) {
      return new Response(
        JSON.stringify({ error: 'pageSize는 최대 50입니다. 권장값은 20입니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 캐시 확인 (선택사항 - 테이블이 없어도 동작)
    try {
      const cached = await getCachedResults(sellerOpenId, keyword, beginPage, supabase);
      if (cached) {
        console.log('🎯 Returning cached results for shop:', sellerOpenId);
        return new Response(
          JSON.stringify({
            success: true,
            data: cached,
            cached: true,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (cacheError) {
      console.log('Cache check failed (table may not exist):', cacheError.message);
      // 캐시 실패는 무시하고 계속 진행
    }

    // API 파라미터 구성 (필수 파라미터)
    const params: Record<string, any> = {
      appKey: DAJI_APP_KEY,
      sellerOpenId: sellerOpenId,  // 필수: 상점 ID
      beginPage: beginPage,
      pageSize: pageSize,
      country: country,  // 필수: 언어 코드
    };
    
    // 선택 파라미터 추가
    if (keyword) params.keyword = keyword;  // 상점 내 검색 키워드
    if (filter) params.filter = filter;
    if (sort) params.sort = sort;
    if (priceStart) params.priceStart = priceStart;
    if (priceEnd) params.priceEnd = priceEnd;
    if (categoryId) params.categoryId = categoryId;
    
    // outMemberId는 배열 타입
    if (outMemberId) {
      if (Array.isArray(outMemberId)) {
        params.outMemberId = outMemberId;
      } else {
        params.outMemberId = [outMemberId];
      }
    }
    
    if (regionOpp) params.regionOpp = regionOpp;
    if (productCollectionId) params.productCollectionId = productCollectionId;
    if (snId) params.snId = snId;

    // Sign 생성
    params.sign = await generateSign(params, DAJI_APP_SECRET);
    console.log('Generated sign:', params.sign);
    console.log('Request params:', params);

    // API 호출 - URLSearchParams는 배열을 제대로 처리하지 못하므로 수동으로 처리
    const queryParts = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        // 배열인 경우 각 요소를 개별 파라미터로 추가
        value.forEach(v => {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        });
      } else if (value !== undefined && value !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    const queryString = queryParts.join('&');
    const apiUrl = `${API_BASE_URL}/alibaba/product/shopQuery?${queryString}`;

    console.log('🏪 Searching shop products:', { sellerOpenId, keyword, beginPage, pageSize });
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

    // API 응답 확인
    if (result.code !== 200) {
      throw new Error(result.message || 'API 오류가 발생했습니다.');
    }

    // API 응답 구조 분석 (店铺搜索.md 참고)
    // 실제 반환되는 필드들:
    // - imageUrl: 상품 이미지
    // - subject: 중문 제목
    // - subjectTrans: 번역된 제목
    // - offerId: 상품 ID
    // - isJxhy: 정선화원 여부
    // - priceInfo: { price, jxhyPrice, pfJxhyPrice, consignPrice }
    // - repurchaseRate: 재구매율
    // - monthSold: 30일 판매량
    // - traceInfo: 추적 정보
    // - isOnePsale: 일건대발 여부
    // - sellerIdentities: 판매자 신분 배열

    // 데이터 변환 (한국어 친화적으로)
    const transformedData = {
      sellerOpenId: result.data?.sellerOpenId || sellerOpenId,  // API 응답에서 먼저 가져오고, 없으면 요청 파라미터 사용
      totalRecords: result.data?.totalRecords || 0,
      totalPage: result.data?.totalPage || 0,
      pageSize: result.data?.pageSize || 20,
      currentPage: result.data?.currentPage || beginPage,
      data: result.data?.data ? result.data.data.map((product: any) => ({
        // 모든 필드를 포함하여 프론트엔드에서 필요한 것만 사용
        imageUrl: product.imageUrl,
        subject: product.subject,                    // 중문 제목
        subjectTrans: product.subjectTrans,         // 번역된 제목 (ko 파라미터로 한국어)
        offerId: product.offerId,                   // 상품 ID (문자열 또는 숫자)
        isJxhy: product.isJxhy || false,           // 정선화원 여부
        priceInfo: {
          price: product.priceInfo?.price || '0',                     // 기본 가격
          jxhyPrice: product.priceInfo?.jxhyPrice || null,           // 대발 정선화원 가격
          pfJxhyPrice: product.priceInfo?.pfJxhyPrice || null,       // 도매 정선화원 가격
          consignPrice: product.priceInfo?.consignPrice || '0',      // 일건대발 가격
        },
        repurchaseRate: product.repurchaseRate || '0%',   // 재구매율
        monthSold: product.monthSold || 0,                // 30일 판매량
        traceInfo: product.traceInfo || '',               // 추적 정보 (1688 내부용)
        isOnePsale: product.isOnePsale || false,         // 일건대발 지원 여부
        sellerIdentities: product.sellerIdentities || [], // 판매자 신분 (tp_member, powerful_merchants 등)
      })) : [],
    };

    // 캐시 저장 (선택사항 - 실패해도 무시)
    try {
      await saveCachedResults(sellerOpenId, keyword, beginPage, transformedData, supabase);
    } catch (error) {
      console.log('Failed to save cache:', error.message);
    }

    // 검색 기록 저장 (선택사항 - 실패해도 무시)
    try {
      await supabase
        .from('shop_search_history')
        .insert({
          seller_open_id: sellerOpenId,
          keyword,
          page: beginPage,
          results_count: transformedData.data.length,
          user_ip: req.headers.get('x-forwarded-for') || 'unknown',
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.log('Failed to save search history:', error.message);
    }

    console.log(`✅ Shop search successful: ${transformedData.data.length} products found`);

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
    console.error('Shop search error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '상점 검색 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});