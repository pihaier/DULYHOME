'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getEdgeFunctionsClient } from '@/lib/supabase/edge-functions-client';
import type {
  Product1688,
  ApiResponse,
  SearchData,
  KeywordSearchParams,
  SortOption,
  SelectedFilters,
} from '../types';

interface UseSearch1688Props {
  keyword: string;
  page: number;
  sortBy: SortOption;
  filters: SelectedFilters;
  categoryId?: number | null;  // 단일 카테고리 ID (categoryId 파라미터용)
  snIds?: string[];  // snId 형식 배열 (예: ["3216:28320", "3216:28335"])
}

interface UseSearch1688Return {
  products: Product1688[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalRecords: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export function useSearch1688({
  keyword,
  page,
  sortBy,
  filters,
  categoryId,
  snIds,
}: UseSearch1688Props): UseSearch1688Return {
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Edge Functions 전용 클라이언트 사용 (hang 문제 해결) - useMemo로 최적화
  const functionsClient = useMemo(() => getEdgeFunctionsClient(), []);

  const buildFilterString = useCallback(() => {
    const filterParts: string[] = [];
    
    if (filters.isJxhy) {
      filterParts.push('isJxhy');
    }
    
    if (filters.isOnePsale) {
      filterParts.push('isOnePsale');
    }
    
    return filterParts.length > 0 ? filterParts.join(',') : undefined;
  }, [filters]);

  const searchProducts = async () => {
    // 키워드, 카테고리ID, snIds 모두 없으면 리턴
    if ((!keyword || keyword.trim() === '') && !categoryId && (!snIds || snIds.length === 0)) {
      setProducts([]);
      setTotalPages(0);
      setTotalRecords(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Edge Function 호출 파라미터 준비
      
      const params: KeywordSearchParams = {
        keyword: keyword?.trim() || '',  // 키워드가 없으면 빈 문자열
        beginPage: page,
        pageSize: 20,
        country: 'ko',
        filter: buildFilterString(),
        sort: sortBy !== 'default' ? sortBy : undefined,
        priceStart: filters.priceMin || undefined,
        priceEnd: filters.priceMax || undefined,
        categoryId: categoryId || undefined,  // 단일 카테고리 ID
        snId: snIds && snIds.length > 0 ? snIds.join(',') : undefined,  // 다중 카테고리 ID를 쉼표로 구분 (예: "70921490,70921491")
      };

      // null/undefined 값 제거
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Supabase Edge Function 호출 - SDK 사용
      const { data, error: functionError } = await functionsClient.invoke('search-1688-products', {
        body: cleanParams
      });

      if (functionError) {
        throw new Error(functionError.message || '검색 중 오류가 발생했습니다.');
      }

      if (!data) {
        setProducts([]);
        setTotalPages(0);
        setTotalRecords(0);
        return;
      }

      // Edge Function 응답 처리
      if (data && data.success) {
        // 성공 응답
        const searchData = data.data as SearchData;
        setProducts(searchData.data || []);
        setTotalPages(searchData.totalPage || 0);
        setTotalRecords(searchData.totalRecords || 0);
        setCurrentPage(searchData.currentPage || page);
      } else if (data && !data.success) {
        // 실패 응답
        throw new Error(data.error || '검색 실패');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setProducts([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // 검색 파라미터 변경 시 자동 검색
  useEffect(() => {
    // 키워드가 있을 때만 검색 실행
    if (keyword && keyword.trim()) {
      searchProducts();
    }
  }, [keyword, page, snIds, sortBy, filters]);

  // 수동 재검색 함수
  const refetch = async () => {
    await searchProducts();
  };

  return {
    products,
    loading,
    error,
    totalPages,
    totalRecords,
    currentPage,
    refetch,
  };
}