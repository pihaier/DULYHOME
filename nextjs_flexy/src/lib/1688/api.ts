import { createClient } from '@/lib/supabase/client';

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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/get-categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ categoryID }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/search-1688-products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        keyword,
        page,
        pageSize,
        country,
        sort,
        filter,
        priceStart,
        priceEnd,
        categoryId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// 3. 이미지 업로드
export async function uploadImage(imageBase64: string) {
  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/upload-image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/search-by-image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search by image: ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/get-product-detail`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        offerId,
        country,
        outMemberId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Product detail API error:', data);
      throw new Error(data.error || `Failed to fetch product detail: ${response.status}`);
    }

    return data;
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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/calculate-shipping`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        offerId,
        toProvinceCode,
        toCityCode,
        toCountryCode,
        totalNum,
        logisticsSkuNumModels,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate shipping: ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/translate-image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        imageUrl,
        sourceLanguage: 'zh',
        targetLanguage: 'ko',
        field: 'e-commerce'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to translate image: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error translating image:', error);
    throw error;
  }
}