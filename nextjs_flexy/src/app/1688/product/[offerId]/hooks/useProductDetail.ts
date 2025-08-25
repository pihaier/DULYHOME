import { useState, useEffect, useRef } from 'react';
import type { ProductDetail } from '../types';

// 전역 캐시 객체 (메모리 캐시)
const productCache = new Map<string, ProductDetail>();
const fetchingPromises = new Map<string, Promise<any>>();

export function useProductDetail(offerId: string) {
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslatingDescription, setIsTranslatingDescription] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const fetchProductDetail = async () => {
      if (!offerId) return;

      // 캐시에서 먼저 확인
      if (productCache.has(offerId)) {
        setProductDetail(productCache.get(offerId)!);
        setLoading(false);
        return;
      }

      // 이미 진행 중인 요청이 있는지 확인
      if (fetchingPromises.has(offerId)) {
        try {
          const data = await fetchingPromises.get(offerId);
          if (mountedRef.current) {
            setProductDetail(data);
            setLoading(false);
          }
        } catch (err) {
          if (mountedRef.current) {
            setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
            setLoading(false);
          }
        }
        return;
      }

      setLoading(true);
      setError(null);

      // 새로운 fetch Promise 생성 및 저장
      const fetchPromise = (async () => {
        const { getProductDetail } = await import('@/lib/1688/api');
        
        const result = await getProductDetail({
          offerId: offerId,
          country: 'ko'
        });

        // API 응답 구조 확인 - result가 직접 data인 경우도 처리
        const productData = result.data || result;
        return productData;
      })();

      fetchingPromises.set(offerId, fetchPromise);

      try {
        const productData = await fetchPromise;
        
        if (productData && productData.offerId) {
          // description 내의 이미지 URL을 프록시 URL로 변환
          if (productData.description) {
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
                  return `<img${beforeSrc}src="${proxyUrl}"${afterSrc}>`;
                }
                // https:// 또는 http://로 시작하는 외부 이미지도 프록시 처리
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  const proxyUrl = `/api/1688/image-proxy?url=${encodeURIComponent(url)}`;
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
                  return `<img${beforeDataSrc}data-src="${proxyUrl}" src="${proxyUrl}"${afterDataSrc}>`;
                }
                return match;
              }
            );
          }
          
          // 캐시에 저장
          productCache.set(offerId, productData);
          
          if (mountedRef.current) {
            setProductDetail(productData);
          }
        } else {
          if (mountedRef.current) {
            setError('상품 정보를 불러올 수 없습니다.');
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
        }
        // 실패한 Promise는 제거
        fetchingPromises.delete(offerId);
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        // Promise 제거 (성공 시)
        fetchingPromises.delete(offerId);
      }
    };

    fetchProductDetail();
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [offerId]);

  const handleTranslateDescription = async () => {
    if (!productDetail?.description) return;

    setIsTranslatingDescription(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: productDetail.description,
          sourceLang: 'zh',
          targetLang: 'ko',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedDescription(data.translatedText);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      setError('번역 중 오류가 발생했습니다.');
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
    handleTranslateDescription,
  };
}