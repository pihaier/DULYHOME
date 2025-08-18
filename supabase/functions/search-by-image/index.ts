import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DAJI_APP_KEY = Deno.env.get('DAJI_APP_KEY')!;
const DAJI_APP_SECRET = Deno.env.get('DAJI_APP_SECRET')!;
const API_BASE_URL = 'https://openapi.dajisaas.com';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const body = await req.json();
    const {
      imageId,
      imageAddress,  // 1688 이미지 링크로 검색
      page = 1,
      pageSize = 20,
      country = 'ko',  // 필수 파라미터
      region,        // 주체 선택
      filter,        // 필터 옵션
      sort,          // 정렬 옵션
      outMemberId,   // 외부 사용자 ID
      priceStart,    // 가격 범위 시작
      priceEnd,      // 가격 범위 끝
      categoryId,    // 카테고리 ID
      keyword,       // 결과 내 검색
      auxiliaryText, // 멀티모달 이미지 검색 텍스트
    } = body;

    // imageId 또는 imageAddress 중 하나는 필수
    if (!imageId && !imageAddress) {
      return new Response(
        JSON.stringify({ error: '이미지 ID(imageId) 또는 이미지 주소(imageAddress)가 필요합니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // pageSize 제한 (최대 50)
    if (pageSize > 50) {
      return new Response(
        JSON.stringify({ error: 'pageSize는 최대 50까지 가능합니다. (권장: 20)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // API 파라미터 (필수)
    const params: Record<string, any> = {
      appKey: DAJI_APP_KEY,
      beginPage: page,
      pageSize: pageSize,
      country: country,  // 필수 파라미터
    };

    // imageId 또는 imageAddress 추가
    if (imageId) params.imageId = imageId;
    if (imageAddress) params.imageAddress = imageAddress;

    // 선택 파라미터 추가
    if (region) params.region = region;
    if (filter) params.filter = filter;
    if (sort) params.sort = sort;
    if (outMemberId) params.outMemberId = outMemberId;
    if (priceStart) params.priceStart = priceStart;
    if (priceEnd) params.priceEnd = priceEnd;
    if (categoryId) params.categoryId = categoryId;
    if (keyword) params.keyword = keyword;
    if (auxiliaryText) params.auxiliaryText = auxiliaryText;

    // Sign 생성
    params.sign = await generateSign(params, DAJI_APP_SECRET);

    // API 호출
    const queryString = new URLSearchParams(params).toString();
    const apiUrl = `${API_BASE_URL}/alibaba/product/imageQuery?${queryString}`;

    console.log('🔍 Searching by image:', { imageId, page, pageSize });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(result.message || '이미지 검색 실패');
    }

    // 데이터 변환 (키워드 검색과 동일한 형식)
    const transformedData = {
      totalRecords: result.data.totalRecords,
      totalPage: result.data.totalPage,
      pageSize: result.data.pageSize,
      currentPage: result.data.currentPage,
      products: result.data.data.map((product: any) => ({
        // 기본 정보
        id: product.offerId,
        title: product.subject,
        titleTranslated: product.subjectTrans,
        imageUrl: product.imageUrl,
        
        // 가격 정보
        price: {
          wholesale: product.priceInfo.price,
          consignment: product.priceInfo.consignPrice,
          jxhyPrice: product.priceInfo.jxhyPrice,
          pfJxhyPrice: product.priceInfo.pfJxhyPrice,
        },
        
        // 판매 정보
        monthSold: product.monthSold,
        repurchaseRate: product.repurchaseRate,
        
        // 상품 속성
        isJxhy: product.isJxhy,
        isOnePsale: product.isOnePsale,
        sellerIdentities: product.sellerIdentities,
        
        // 추적 정보
        traceInfo: product.traceInfo,
      })),
      // 이미지 주체 정보 (이미지 검색 특화)
      picRegionInfo: result.data.picRegionInfo ? {
        currentRegion: result.data.picRegionInfo.currentRegion,  // 현재 주체 좌표
        yoloCropRegion: result.data.picRegionInfo.yoloCropRegion, // 모든 주체 좌표
      } : null,
    };

    // 검색 기록 저장
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('image_search_history')
      .insert({
        image_id: imageId,
        page,
        results_count: transformedData.products.length,
        created_at: new Date().toISOString(),
      });

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
    console.error('Image search error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '이미지 검색 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});