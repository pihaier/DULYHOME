'use client';

import { useState, useCallback, useMemo } from 'react';
import { getEdgeFunctionsClient } from '@/lib/supabase/edge-functions-client';
import type {
  Product1688,
  ApiResponse,
  SearchData,
  ImageUploadData,
  ImageSearchParams,
  SortOption,
  SelectedFilters,
} from '../types';

interface UseImageSearchReturn {
  uploadImage: (base64Image: string) => Promise<string | null>;
  searchByImage: (imageId: string, page?: number) => Promise<Product1688[]>;
  products: Product1688[];
  loading: boolean;
  uploadProgress: boolean;
  error: string | null;
  totalPages: number;
  totalRecords: number;
  currentPage: number;
  clearResults: () => void;
}

export function useImageSearch(): UseImageSearchReturn {
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Edge Functions 전용 클라이언트 사용 - useMemo로 최적화
  const functionsClient = useMemo(() => getEdgeFunctionsClient(), []);

  // 이미지 업로드 함수
  const uploadImage = useCallback(async (base64Image: string): Promise<string | null> => {
    setUploadProgress(true);
    setError(null);

    try {
      // Base64 데이터 URI 형식 확인 및 추출
      let imageData = base64Image;
      if (base64Image.includes(',')) {
        imageData = base64Image.split(',')[1];
      }

      // Edge Function 호출 - 이미지 업로드
      const { data, error: uploadError } = await functionsClient.invoke('upload-image', {
        body: {
          image_base64: imageData,
        },
      });

      if (uploadError) {
        throw new Error(uploadError.message || '이미지 업로드 중 오류가 발생했습니다.');
      }

      // Edge Function 응답 처리
      if (!data.success) {
        throw new Error(data.error || '이미지 업로드 실패');
      }

      const imageId = data.data?.imageId;

      if (!imageId) {
        throw new Error('이미지 ID를 받지 못했습니다');
      }

      console.log('이미지 업로드 성공:', imageId);
      return imageId;

    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.');
      return null;
    } finally {
      setUploadProgress(false);
    }
  }, [functionsClient]);

  // 이미지로 검색 함수 (imageId 또는 imageAddress 지원)
  const searchByImage = useCallback(async (
    imageIdOrAddress: string,
    page: number = 1,
    sortBy: SortOption = 'default',
    filters?: SelectedFilters,
    isImageAddress: boolean = false
  ): Promise<Product1688[]> => {
    setLoading(true);
    setError(null);

    try {
      // 필터 문자열 생성
      const filterParts: string[] = [];
      if (filters?.isJxhy) filterParts.push('isJxhy');
      if (filters?.isOnePsale) filterParts.push('isOnePsale');
      const filterString = filterParts.length > 0 ? filterParts.join(',') : undefined;

      // Edge Function 호출 파라미터 - imageId 또는 imageAddress
      const params: ImageSearchParams = isImageAddress 
        ? {
            imageAddress: imageIdOrAddress,  // 1688 이미지 URL 직접 사용
            page: page,
            pageSize: 20,
            country: 'ko',
            filter: filterString,
            sort: sortBy !== 'default' ? sortBy : undefined,
            priceStart: filters?.priceMin || undefined,
            priceEnd: filters?.priceMax || undefined,
          }
        : {
            imageId: imageIdOrAddress,  // 업로드된 이미지 ID 사용
            page: page,
            pageSize: 20,
            country: 'ko',
            filter: filterString,
            sort: sortBy !== 'default' ? sortBy : undefined,
            priceStart: filters?.priceMin || undefined,
            priceEnd: filters?.priceMax || undefined,
          };

      // null/undefined 값 제거
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('이미지 검색 파라미터:', {
        ...cleanParams,
        isImageAddress,
        hasImageAddress: 'imageAddress' in cleanParams,
        hasImageId: 'imageId' in cleanParams
      });

      // Edge Function 호출 - 이미지 검색
      const { data, error: searchError } = await functionsClient.invoke('search-by-image', {
        body: cleanParams,
      });

      if (searchError) {
        throw new Error(searchError.message || '이미지 검색 중 오류가 발생했습니다.');
      }

      // Edge Function 응답 처리
      if (!data.success) {
        throw new Error(data.error || '이미지 검색 실패');
      }

      // 상태 업데이트 - 응답 구조가 다름
      // data.data.products에 상품 목록이 있음
      const searchData = data.data;
      const searchResults = searchData.products || [];  // products 필드 사용
      console.log('🎯 이미지 검색 결과 설정:', searchResults.length, '개 상품');
      
      setProducts(searchResults);
      setTotalPages(searchData.totalPage || 0);
      setTotalRecords(searchData.totalRecords || 0);
      setCurrentPage(searchData.currentPage || page);

      return searchResults;

    } catch (err) {
      console.error('이미지 검색 오류:', err);
      setError(err instanceof Error ? err.message : '이미지 검색 중 오류가 발생했습니다.');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [functionsClient]);

  // 검색 결과 초기화
  const clearResults = useCallback(() => {
    setProducts([]);
    setTotalPages(0);
    setTotalRecords(0);
    setCurrentPage(1);
    setError(null);
  }, []);

  return {
    uploadImage,
    searchByImage,
    products,
    loading,
    uploadProgress,
    error,
    totalPages,
    totalRecords,
    currentPage,
    clearResults,
  };
}