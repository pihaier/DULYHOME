import { createClient } from '@/lib/supabase/client';
import { getEdgeFunctionsClient } from '@/lib/supabase/edge-functions-client';

// Supabase Edge Functions URL
const EDGE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

// 공통 헤더
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
});

// 1. 카테고리 조회
export async function getCategories(categoryID: string = '0') {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('get-categories', {
      body: { categoryID }
    });

    if (error) {
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// 2. 키워드 검색
export async function searchProducts({
  keyword,
  page = 1,
  pageSize = 20,
  country = 'ko',
  sort,
  filter,
  priceStart,
  priceEnd,
  categoryId,
}: {
  keyword: string;
  page?: number;
  pageSize?: number;
  country?: string;
  sort?: string;
  filter?: string;
  priceStart?: string;
  priceEnd?: string;
  categoryId?: number;
}) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('search-1688-products', {
      body: {
        keyword,
        beginPage: page, // page를 beginPage로 변경
        pageSize,
        country,
        sort,
        filter,
        priceStart,
        priceEnd,
        categoryId,
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to search products');
    }

    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// 3. 이미지 업로드
export async function uploadImage(imageBase64: string) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('upload-image', {
      body: { imageBase64 }
    });

    if (error) {
      throw new Error(error.message || 'Failed to upload image');
    }

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// 4. 이미지로 검색
export async function searchByImage({
  imageId,
  imageAddress,
  beginPage = 1,
  pageSize = 20,
  country = 'ko',
  region,
  filter,
  sort,
  priceStart,
  priceEnd,
  categoryId,
  keyword,
}: {
  imageId?: string;
  imageAddress?: string;
  beginPage?: number;
  pageSize?: number;
  country?: string;
  region?: string;
  filter?: string;
  sort?: string;
  priceStart?: string;
  priceEnd?: string;
  categoryId?: number;
  keyword?: string;
}) {
  if (!imageId && !imageAddress) {
    throw new Error('imageId 또는 imageAddress 중 하나는 필수입니다.');
  }

  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('search-by-image', {
      body: {
        imageId,
        imageAddress,
        beginPage,
        pageSize,
        country,
        region,
        filter,
        sort,
        priceStart,
        priceEnd,
        categoryId,
        keyword,
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to search by image');
    }

    return data;
  } catch (error) {
    console.error('Error searching by image:', error);
    throw error;
  }
}

// 5. 상품 상세 조회
export async function getProductDetail({
  offerId,
  country = 'ko',
  outMemberId,
}: {
  offerId: string | number;
  country?: string;
  outMemberId?: string;
}) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('get-product-detail', {
      body: {
        offerId,
        country,
        outMemberId,
      }
    });

    if (error) {
      console.error('Product detail API error:', error);
      throw new Error(error.message || 'Failed to fetch product detail');
    }

    // success 플래그가 없어도 data가 있으면 정상 응답으로 처리
    if (data && (data.success || data.offerId)) {
      return data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching product detail:', error);
    throw error;
  }
}

// 6. 배송비 계산
export async function calculateShipping({
  offerId,
  toProvinceCode,
  toCityCode,
  toCountryCode,
  totalNum,
  logisticsSkuNumModels = [],
}: {
  offerId: number;
  toProvinceCode: string;
  toCityCode: string;
  toCountryCode: string;
  totalNum: number;
  logisticsSkuNumModels?: Array<{
    skuId: string;
    number: number;
  }>;
}) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('calculate-shipping', {
      body: {
        offerId,
        toProvinceCode,
        toCityCode,
        toCountryCode,
        totalNum,
        logisticsSkuNumModels,
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to calculate shipping');
    }

    return data;
  } catch (error) {
    console.error('Error calculating shipping:', error);
    throw error;
  }
}

// 유틸리티 함수: 이미지 파일을 Base64로 변환
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // data:image/png;base64, 부분 제거
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 유틸리티 함수: 가격 포맷팅
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'CNY',
  }).format(numPrice);
}

// 유틸리티 함수: 한국 원화로 변환 (예시 환율)
export function convertToKRW(cnyPrice: string | number, exchangeRate: number = 180): string {
  const numPrice = typeof cnyPrice === 'string' ? parseFloat(cnyPrice) : cnyPrice;
  const krwPrice = numPrice * exchangeRate;
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(krwPrice);
}

// 7. 이미지 번역
export async function translateImage(imageUrl: string) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('translate-image', {
      body: {
        imageUrl,
        sourceLanguage: 'zh',
        targetLanguage: 'ko',
        field: 'e-commerce'
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to translate image');
    }

    return data;
  } catch (error) {
    console.error('Error translating image:', error);
    throw error;
  }
}

// 8. 상품 설명 번역
export async function translateProductDescription({
  description,
  productName,
}: {
  description: string;
  productName?: string;
}) {
  try {
    const functionsClient = getEdgeFunctionsClient();
    const { data, error } = await functionsClient.invoke('translate-product-description', {
      body: {
        description,
        productName,
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to translate description');
    }

    return data;
  } catch (error) {
    console.error('Error translating description:', error);
    throw error;
  }
}