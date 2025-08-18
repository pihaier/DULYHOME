import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 환경변수
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
    const { offerId, country = 'ko', outMemberId } = body;

    if (!offerId) {
      return new Response(
        JSON.stringify({ error: '상품 ID(offerId)는 필수입니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // API 파라미터
    const params: Record<string, any> = {
      appKey: DAJI_APP_KEY,
      offerId: offerId.toString(),
      country: country,
    };

    // 선택 파라미터 추가
    if (outMemberId) {
      params.outMemberId = outMemberId;
    }

    // Sign 생성
    params.sign = await generateSign(params, DAJI_APP_SECRET);

    // API 호출
    const queryString = new URLSearchParams(params).toString();
    const apiUrl = `${API_BASE_URL}/alibaba/product/queryProductDetail?${queryString}`;

    console.log('🔍 Getting product detail:', { offerId, country });

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
      throw new Error(result.message || 'API 오류가 발생했습니다.');
    }

    // 데이터 변환 (API 응답 구조 그대로 유지)
    const product = result.data;
    const transformedData = {
      // 기본 정보
      offerId: product.offerId,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      topCategoryId: product.topCategoryId,
      secondCategoryId: product.secondCategoryId,
      thirdCategoryId: product.thirdCategoryId,
      
      // 제목
      subject: product.subject,
      subjectTrans: product.subjectTrans,
      
      // 상세 설명
      description: product.description,
      
      // 미디어
      mainVideo: product.mainVideo,
      detailVideo: product.detailVideo,
      productImage: product.productImage, // images 배열 포함
      
      // 상품 속성
      productAttribute: product.productAttribute,
      
      // SKU 정보
      productSkuInfos: product.productSkuInfos,
      
      // 판매 정보
      productSaleInfo: product.productSaleInfo,
      
      // 배송 정보
      productShippingInfo: product.productShippingInfo,
      
      // 판매자 정보
      sellerOpenId: product.sellerOpenId,
      sellerDataInfo: product.sellerDataInfo,
      sellerMixSetting: product.sellerMixSetting,
      
      // 상품 상태
      status: product.status,
      soldOut: product.soldOut,
      
      // 태그 정보
      tagInfoList: product.tagInfoList,
      
      // 플래그
      isJxhy: product.isJxhy,
      minOrderQuantity: product.minOrderQuantity,
      batchNumber: product.batchNumber,
      
      // 추가 정보
      productCargoNumber: product.productCargoNumber,
      channelPrice: product.channelPrice,
      promotionModel: product.promotionModel,
      tradeScore: product.tradeScore,
      sellingPoint: product.sellingPoint,
      offerIdentities: product.offerIdentities,
      createDate: product.createDate,
      traceInfo: product.traceInfo,
    };

    // Supabase에 조회 기록 저장 (선택사항)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('product_view_history')
      .insert({
        offer_id: offerId,
        product_data: transformedData,
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
    console.error('Product detail error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '상품 정보를 가져오는 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});