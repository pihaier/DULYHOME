'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// 레이아웃
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

// search-v2에서 컴포넌트 및 hooks 임포트
import SearchBarWithCategories from './search-v2/components/SearchBarWithCategories';
import ImageSearchModal from './search-v2/components/ImageSearchModal';
import ProductCard from './search-v2/components/ProductCard';
import { useKeywordCategories } from './search-v2/hooks/useKeywordCategories';
import type { SelectedFilters, Product1688 } from './search-v2/types';

export default function Search1688Page() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [filters, setFilters] = useState<SelectedFilters>({
    isJxhy: false,
    isOnePsale: false,
    priceMin: '',
    priceMax: '',
    shipInToday: false,
    ksCiphertext: false,
  });

  // 키워드 카테고리 Hook 사용
  const {
    categories: keywordCategories,
    loading: categoriesLoading,
    error: categoriesError,
    selectedCategoryIds,
    selectCategory,
  } = useKeywordCategories(currentKeyword);

  // 인기 상품 로드 (초기 로드)
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        const { searchProducts } = await import('@/lib/1688/api');
        
        // 인기 상품 검색
        const result = await searchProducts({
          keyword: '热销',
          page: 1,
          pageSize: 8,
          country: 'ko'
        });

        if (result?.success && result.data?.data) {
          // API 데이터를 Product1688 형식으로 변환
          const transformedProducts = result.data.data.map((item: any, index: number) => ({
            offerId: item.offerId || `product-${index}`,
            subject: item.subject,
            subjectTrans: item.subjectTrans || item.subject,
            imageUrl: item.imageUrl,
            priceInfo: item.priceInfo || { price: '0' },
            monthSold: item.monthSold || 0,
            sellerIdentities: item.sellerIdentities || [],
            isJxhy: item.isJxhy || false,
            isOnePsale: item.isOnePsale || false,
            repurchaseRate: item.repurchaseRate || '',
            traceInfo: item.traceInfo || '',
          }));

          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('인기 상품 로드 실패:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadPopularProducts();
  }, []);

  // 검색 핸들러 - search-v2로 라우팅
  const handleSearch = () => {
    if (keyword.trim()) {
      router.push(`/1688/search-v2?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryId: number | null, parentId?: number) => {
    selectCategory(categoryId, parentId);
    // 카테고리 선택 시 search-v2로 이동
    if (categoryId) {
      router.push(`/1688/search-v2?category=${categoryId}`);
    }
  };

  // 이미지 검색 핸들러
  const handleImageSearch = async (imageData: string, isImageUrl: boolean = false) => {
    if (isImageUrl) {
      // 이미지 URL로 search-v2 페이지로 이동
      router.push(`/1688/search-v2?imageAddress=${encodeURIComponent(imageData)}`);
    } else {
      // 이미지 업로드는 search-v2에서 처리
      setImageSearchOpen(false);
      router.push('/1688/search-v2');
    }
  };



  return (
    <PageContainer>
      <HpHeader />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 히어로 섹션 */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 2, 
              background: 'linear-gradient(135deg, #ff6900 0%, #ff9500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            1688.com
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            중국 최대 B2B 도매 플랫폼
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            공장 직거래로 최저가 소싱 · 실시간 번역 지원 · 안전한 거래 보장
          </Typography>
        </Box>

        {/* 검색 바 (search-v2의 컴포넌트 재사용) */}
        <Box sx={{ mb: 4 }}>
          <SearchBarWithCategories
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
            onImageSearchOpen={() => setImageSearchOpen(true)}
            popularKeywords={['의류', '가방', '신발', '전자제품', '화장품', '악세서리']}
            categories={keywordCategories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            selectedCategoryIds={selectedCategoryIds}
            onCategorySelect={handleCategorySelect}
            filters={filters}
            onFilterChange={setFilters}
          />
        </Box>

        {/* 추천 상품 */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <TrendingUp sx={{ fontSize: 32, color: '#ff6900' }} />
            <Typography variant="h4" fontWeight="bold">
              인기 상품
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {loadingProducts ? (
              // 로딩 스켈레톤
              [...Array(8)].map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ height: 400 }}>
                    <Skeleton variant="rectangular" height={240} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <Grid key={product.offerId} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard 
                    product={product}
                    index={index}
                    onDetailClick={(offerId) => router.push(`/1688/product/${offerId}`)}
                    onFindSimilar={(imageUrl) => {
                      // 유사 상품 검색
                      router.push(`/1688/search-v2?imageAddress=${encodeURIComponent(imageUrl)}`);
                    }}
                  />
                </Grid>
              ))
            ) : (
              <Grid size={12}>
                <Alert severity="info">
                  상품을 불러오는 중입니다...
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>


      </Container>

      {/* 이미지 검색 모달 */}
      <ImageSearchModal
        open={imageSearchOpen}
        onClose={() => setImageSearchOpen(false)}
        onSearch={handleImageSearch}
      />

      <Footer />
    </PageContainer>
  );
}