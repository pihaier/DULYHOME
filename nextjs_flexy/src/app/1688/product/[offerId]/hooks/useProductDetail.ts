import { useState, useEffect } from 'react';
import type { ProductDetail } from '../types';

export function useProductDetail(offerId: string) {
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslatingDescription, setIsTranslatingDescription] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!offerId) return;

      setLoading(true);
      setError(null);

      try {
        const { getProductDetail } = await import('@/lib/1688/api');
        console.log('Fetching product detail for offerId:', offerId);
        
        const result = await getProductDetail({
          offerId: offerId,
          country: 'ko'
        });
        
        console.log('API Response:', result);

        // API 응답 구조 확인 - result가 직접 data인 경우도 처리
        const productData = result.data || result;
        
        if (productData && productData.offerId) {
          console.log('Product detail data:', productData);
          
          // 데이터 구조 디버깅
          console.log('Product Images:', productData.productImage);
          console.log('SKU Info:', productData.productSkuInfos);
          console.log('Sale Info:', productData.productSaleInfo);
          console.log('Evaluation Info:', productData.evaluationInfo);
          console.log('Supplier Info:', productData.supplierInfo);
          console.log('Shipping Info:', productData.productShippingInfo);
          console.log('Attributes:', productData.productAttributes);
          console.log('Features:', productData.productFeatureList);
          
          // description 내의 이미지 URL을 프록시 URL로 변환
          if (productData.description) {
            console.log('Processing description for image proxy...');
            
            // 더 강력한 정규식 - src 속성 전체를 캡처
            productData.description = productData.description.replace(
              /<img([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
              (match, beforeSrc, url, afterSrc) => {
                // 이미 프록시 URL이거나 로컬 이미지인 경우 그대로 유지
                if (url.includes('/api/1688/image-proxy') || url.startsWith('/images/')) {
                  return match;
                }
                // alicdn.com, aliimg.com, 또는 1688.com 이미지인 경우 프록시 적용
                if (url.includes('alicdn.com') || url.includes('aliimg.com') || url.includes('1688.com')) {
                  const proxyUrl = `/api/1688/image-proxy?url=${encodeURIComponent(url)}`;
                  console.log('Replacing image URL:', url, '->', proxyUrl);
                  return `<img${beforeSrc}src="${proxyUrl}"${afterSrc}>`;
                }
                // https:// 또는 http://로 시작하는 외부 이미지도 프록시 처리
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  const proxyUrl = `/api/1688/image-proxy?url=${encodeURIComponent(url)}`;
                  console.log('Proxying external image:', url);
                  return `<img${beforeSrc}src="${proxyUrl}"${afterSrc}>`;
                }
                return match;
              }
            );
            
            // data-src 속성도 처리 (lazy loading 이미지)
            productData.description = productData.description.replace(
              /<img([^>]*?)data-src\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
              (match, beforeDataSrc, url, afterDataSrc) => {
                if (url.includes('/api/1688/image-proxy') || url.startsWith('/images/')) {
                  return match;
                }
                if (url.includes('alicdn.com') || url.includes('aliimg.com') || url.includes('1688.com') || url.startsWith('http')) {
                  const proxyUrl = `/api/1688/image-proxy?url=${encodeURIComponent(url)}`;
                  console.log('Replacing data-src:', url, '->', proxyUrl);
                  return `<img${beforeDataSrc}data-src="${proxyUrl}" src="${proxyUrl}"${afterDataSrc}>`;
                }
                return match;
              }
            );
          }
          
          setProductDetail(productData);
        } else {
          console.error('API Error:', result.error || 'No data');
          setError(result.error || '상품 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch product detail:', err);
        setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [offerId]);

  const handleTranslateDescription = async () => {
    if (!productDetail?.description) return;

    setIsTranslatingDescription(true);
    try {
      const { translateProductDescription } = await import('@/lib/1688/api');
      const result = await translateProductDescription({
        description: productDetail.description,
        productName: productDetail.subjectTrans
      });

      console.log('Translation result:', result);

      // Edge Function에서 직접 번역된 텍스트를 반환하는 경우
      if (result) {
        if (typeof result === 'string') {
          // 직접 문자열로 반환하는 경우
          setTranslatedDescription(result);
        } else if (result.translatedText) {
          // translatedText 필드가 있는 경우
          setTranslatedDescription(result.translatedText);
        } else if (result.success && result.translatedText) {
          // success 플래그와 함께 반환하는 경우
          setTranslatedDescription(result.translatedText);
        } else {
          console.error('Unexpected translation result format:', result);
          throw new Error('Translation result format error');
        }
      } else {
        throw new Error('No translation result received');
      }
    } catch (error) {
      console.error('Failed to translate description:', error);
      // Set a fallback message for users
      setTranslatedDescription('번역 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsTranslatingDescription(false);
    }
  };

  return {
    productDetail,
    loading,
    error,
    translatedDescription,
    isTranslatingDescription,
    handleTranslateDescription
  };
}