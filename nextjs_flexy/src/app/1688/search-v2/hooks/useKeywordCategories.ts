import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getEdgeFunctionsClient } from '@/lib/supabase/edge-functions-client';
import type { KeywordCategory } from '../types';

const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

interface CacheEntry {
  data: KeywordCategory[];
  timestamp: number;
}

// 메모리 캐시
const categoryCache = new Map<string, CacheEntry>();

export function useKeywordCategories(keyword: string) {
  const [categories, setCategories] = useState<KeywordCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);  // snId 형식으로 저장 (예: "3216:28320")
  const abortControllerRef = useRef<AbortController | null>(null);
  // Edge Functions 전용 클라이언트 사용 - useMemo로 최적화
  const functionsClient = useMemo(() => getEdgeFunctionsClient(), []);

  // 카테고리 데이터 가져오기
  const fetchCategories = useCallback(async (searchKeyword: string) => {
    // 빈 키워드인 경우 초기화
    if (!searchKeyword.trim()) {
      setCategories([]);
      setError(null);
      return;
    }

    // 캐시 확인
    const cacheKey = searchKeyword.toLowerCase();
    const cached = categoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCategories(cached.data);
      setError(null);
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새 요청 시작
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Supabase Edge Function 호출 - SDK 사용
      const { data, error } = await functionsClient.invoke('get-keyword-categories', {
        body: {
          keyword: searchKeyword,
          language: 'ko_KR', // 한국어로 설정
          region: 'KR', 
          currency: 'KRW',
        }
      });

      if (error) {
        throw new Error(error.message || '카테고리 로드 실패');
      }
      
      if (data.success && data.categories) {
        // 캐시 저장
        categoryCache.set(cacheKey, {
          data: data.categories,
          timestamp: Date.now(),
        });
        
        setCategories(data.categories);
        setError(null);
      } else {
        setCategories([]);
        setError(null); // 카테고리가 없어도 에러로 처리하지 않음
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // 요청 취소는 에러로 처리하지 않음
        return;
      }
      
      console.error('카테고리 로드 에러:', err);
      setError('관련 카테고리를 불러올 수 없습니다');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 카테고리 선택 (토글 방식 - 클릭하면 추가/제거)
  // parentId와 childId를 받아서 "parentId:childId" 형식으로 저장
  const selectCategory = useCallback((childId: number | null, parentId?: number) => {
    if (childId === null) {
      // null이면 전체 초기화
      setSelectedCategoryIds([]);
    } else {
      // snId 형식 생성: parentId가 있으면 "parentId:childId", 없으면 단순 "childId"
      const snId = parentId ? `${parentId}:${childId}` : `${childId}`;
      
      setSelectedCategoryIds(prev => {
        // 이미 선택되어 있으면 제거, 없으면 추가
        if (prev.includes(snId)) {
          return prev.filter(id => id !== snId);
        } else {
          return [...prev, snId];
        }
      });
    }
  }, []);

  // 캐시 클리어 (필요시 사용)
  const clearCache = useCallback(() => {
    categoryCache.clear();
  }, []);

  // 키워드 변경 시 카테고리 로드 (디바운스 적용)
  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    
    // 디바운스 타이머
    const timer = setTimeout(() => {
      if (trimmedKeyword) {
        fetchCategories(trimmedKeyword);
      } else {
        setCategories([]);
        setSelectedCategoryIds([]);  // 배열로 초기화
      }
    }, 500); // 500ms 디바운스

    return () => {
      clearTimeout(timer);
    };
  }, [keyword, fetchCategories]);

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    categories,
    loading,
    error,
    selectedCategoryIds,  // 배열로 변경
    selectCategory,
    clearCache,
  };
}