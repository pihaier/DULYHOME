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
    const { image_base64 } = body;

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: '이미지 데이터(image_base64)는 필수입니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Base64 크기 체크 (3MB 제한)
    const sizeInBytes = (image_base64.length * 3) / 4;
    if (sizeInBytes > 3 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: '이미지 크기는 3MB를 초과할 수 없습니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('appKey', DAJI_APP_KEY);
    formData.append('image_base64', image_base64);
    
    // Sign 생성
    const params = {
      appKey: DAJI_APP_KEY,
      image_base64: image_base64,
    };
    const sign = await generateSign(params, DAJI_APP_SECRET);
    formData.append('sign', sign);

    console.log('📷 Uploading image to get imageId...');

    // API 호출
    const response = await fetch(`${API_BASE_URL}/alibaba/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(result.message || '이미지 업로드 실패');
    }

    console.log('✅ Image uploaded, imageId:', result.data.imageId);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageId: result.data.imageId,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '이미지 업로드 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});