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

      if (result.success && result.translatedText) {
        setTranslatedDescription(result.translatedText);
      } else {
        console.error('Translation failed:', result.error);
        throw new Error(result.error || 'Translation failed');
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