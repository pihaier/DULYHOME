import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      // logisticsSkuNumModels는 배열이므로 JSON.stringify 사용
      if (key === 'logisticsSkuNumModels' && Array.isArray(signParams[key])) {
        paramPairs.push(`${key}=${JSON.stringify(signParams[key])}`);
      } else {
        paramPairs.push(`${key}=${signParams[key]}`);
      }
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

interface ShippingRequest {
  offerId: number;
  toProvinceCode: string;
  toCityCode: string;
  toCountryCode: string;
  totalNum: number;
  logisticsSkuNumModels?: Array<{
    skuId: string;
    number: number;
  }>;
}

interface ProductFreightSkuInfo {
  skuId: string;
  singleSkuWeight: number;
  singleSkuWidth: number;
  singleSkuHeight: number;
  singleSkuLength: number;
}

interface ShippingResponse {
  offerId: number;
  freight: string;
  templateId: number;
  singleProductWeight: number;
  singleProductWidth: number;
  singleProductHeight: number;
  singleProductLength: number;
  templateType: number;
  templateName: string;
  subTemplateType: number;
  subTemplateName: string;
  firstFee: string;
  firstUnit: string;
  nextFee: string;
  nextUnit: string;
  discount: string;
  chargeType: string;
  freePostage: boolean;
  productFreightSkuInfoModels: ProductFreightSkuInfo[];
  sizeValueType: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      offerId, 
      toProvinceCode, 
      toCityCode, 
      toCountryCode, 
      totalNum,
      logisticsSkuNumModels = []
    }: ShippingRequest = await req.json();

    // Validate required fields
    if (!offerId || !toProvinceCode || !toCityCode || !toCountryCode || !totalNum) {
      throw new Error('Missing required fields');
    }

    const appKey = Deno.env.get('DAJI_APP_KEY');
    const appSecret = Deno.env.get('DAJI_APP_SECRET');

    if (!appKey || !appSecret) {
      throw new Error('API credentials not configured');
    }

    // API 파라미터 준비
    const params: Record<string, any> = {
      appKey,
      offerId,
      toProvinceCode,
      toCityCode,
      toCountryCode,
      totalNum,
      logisticsSkuNumModels
    };

    // Sign 생성
    params.sign = await generateSign(params, appSecret);

    // Call DajiSaaS API for shipping calculation
    const apiUrl = 'https://openapi.dajisaas.com/alibaba/product/freightEstimate';
    
    const requestBody = params;

    console.log('Requesting shipping calculation:', {
      offerId,
      destination: `${toProvinceCode}-${toCityCode}-${toCountryCode}`,
      totalNum,
      skuCount: logisticsSkuNumModels.length
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`Shipping API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      console.error('API returned error:', result);
      throw new Error(result.message || 'Failed to calculate shipping');
    }

    // Transform API response
    const shippingData: ShippingResponse = result.data;

    // Calculate additional information
    const totalWeight = shippingData.singleProductWeight * totalNum;
    const estimatedDeliveryDays = getEstimatedDeliveryDays(toProvinceCode);
    
    // Format response with additional useful information
    const formattedResponse = {
      success: true,
      data: {
        ...shippingData,
        // Add calculated fields
        totalWeight: totalWeight.toFixed(2),
        estimatedDeliveryDays,
        shippingMethod: getShippingMethodName(shippingData.subTemplateType),
        // Add formatted display values
        displayFreight: formatCurrency(shippingData.freight),
        displayFirstFee: formatCurrency(shippingData.firstFee),
        displayNextFee: formatCurrency(shippingData.nextFee),
        // Add Korean translations
        templateNameKr: translateTemplateName(shippingData.templateName),
        shippingMethodKr: translateShippingMethod(shippingData.subTemplateType),
      },
      metadata: {
        requestedAt: new Date().toISOString(),
        destination: {
          province: toProvinceCode,
          city: toCityCode,
          country: toCountryCode,
        },
        quantity: totalNum,
      }
    };

    return new Response(
      JSON.stringify(formattedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in calculate-shipping function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to calculate shipping',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper functions
function getEstimatedDeliveryDays(provinceCode: string): string {
  // Major cities have faster delivery
  const fastDeliveryProvinces = ['110000', '310000', '440000', '330000']; // Beijing, Shanghai, Guangdong, Zhejiang
  
  if (fastDeliveryProvinces.includes(provinceCode)) {
    return '2-3';
  }
  return '3-5';
}

function getShippingMethodName(subTemplateType: number): string {
  const methods: { [key: number]: string } = {
    0: 'express',
    1: 'freight',
    2: 'cod',
    3: 'official'
  };
  return methods[subTemplateType] || 'standard';
}

function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `¥${numAmount.toFixed(2)}`;
}

function translateTemplateName(templateName: string): string {
  const translations: { [key: string]: string } = {
    '中通': '중통택배',
    '圆通': '위안통택배',
    '申通': '선통택배',
    '韵达': '윈다택배',
    '顺丰': '순펑택배',
    '邮政': '우정택배',
    'EMS': 'EMS',
    '德邦': '더방물류',
    '京东': '징동물류',
  };
  return translations[templateName] || templateName;
}

function translateShippingMethod(subTemplateType: number): string {
  const translations: { [key: number]: string } = {
    0: '택배',
    1: '화물',
    2: '착불',
    3: '공식배송'
  };
  return translations[subTemplateType] || '표준배송';
}

// Province code reference (for documentation)
const PROVINCE_CODES = {
  '110000': '北京市',
  '120000': '天津市',
  '130000': '河北省',
  '140000': '山西省',
  '150000': '内蒙古自治区',
  '210000': '辽宁省',
  '220000': '吉林省',
  '230000': '黑龙江省',
  '310000': '上海市',
  '320000': '江苏省',
  '330000': '浙江省',
  '340000': '安徽省',
  '350000': '福建省',
  '360000': '江西省',
  '370000': '山东省',
  '410000': '河南省',
  '420000': '湖北省',
  '430000': '湖南省',
  '440000': '广东省',
  '450000': '广西壮族自治区',
  '460000': '海南省',
  '500000': '重庆市',
  '510000': '四川省',
  '520000': '贵州省',
  '530000': '云南省',
  '540000': '西藏自治区',
  '610000': '陕西省',
  '620000': '甘肃省',
  '630000': '青海省',
  '640000': '宁夏回族自治区',
  '650000': '新疆维吾尔自治区',
};