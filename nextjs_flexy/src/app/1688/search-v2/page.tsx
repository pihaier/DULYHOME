'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Stack,
  Typography,
  Paper,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Badge,
  Chip,
  Divider,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FilterList as FilterIcon, Close as CloseIcon } from '@mui/icons-material';
import Button from '@mui/material/Button';

// 컴포넌트
import SearchBar from './components/SearchBar';
import SearchBarWithCategories from './components/SearchBarWithCategories';
import FilterPanel from './components/FilterPanel';
import SortSelector from './components/SortSelector';
import ProductGrid from './components/ProductGrid';
import ImageSearchModal from './components/ImageSearchModal';

// Hooks
import { useSearch1688 } from './hooks/useSearch1688';
import { useImageSearch } from './hooks/useImageSearch';
import { useKeywordCategories } from './hooks/useKeywordCategories';

// 타입
import type { SelectedFilters, SortOption, Product1688 } from './types';

// 레이아웃
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

// 인기 검색어 (예시)
const POPULAR_KEYWORDS = [
  '의류',
  '가방',
  '신발',
  '전자제품',
  '화장품',
  '악세서리',
  '완구',
  '생활용품',
];

export default function Search1688Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // URL에서 초기값 가져오기 - useMemo로 메모이제이션
  const initialKeyword = React.useMemo(() => searchParams.get('q') || '', [searchParams]);
  const initialPage = React.useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams]);
  const initialImageAddress = React.useMemo(() => searchParams.get('imageAddress') || '', [searchParams]);
  
  // 상태 관리
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [currentKeyword, setCurrentKeyword] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [filters, setFilters] = useState<SelectedFilters>({
    isJxhy: false,
    isOnePsale: false,
    priceMin: '',
    priceMax: '',
  });
  
  // 이미지 검색 관련 상태 (페이지네이션을 위해 저장)
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isImageUrlSearch, setIsImageUrlSearch] = useState(false);
  
  // 모달 상태
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // 키워드 카테고리 Hook (useSearch1688보다 먼저 호출)
  const {
    categories: keywordCategories,
    loading: categoriesLoading,
    error: categoriesError,
    selectedCategoryIds,  // 배열로 변경
    selectCategory,
  } = useKeywordCategories(currentKeyword);
  
  // Hooks 사용
  const { 
    products, 
    loading, 
    error, 
    totalPages, 
    totalRecords, 
    currentPage: resultPage 
  } = useSearch1688({
    keyword: currentKeyword,
    page: currentPage,
    sortBy,
    filters,
    snIds: selectedCategoryIds,  // 다중 카테고리 ID 전달
  });
  
  const { 
    uploadImage, 
    searchByImage, 
    products: imageSearchProducts,
    loading: imageSearchLoading,
    clearResults: clearImageSearchResults,
    totalPages: imageSearchTotalPages,
    totalRecords: imageSearchTotalRecords,
    currentPage: imageSearchCurrentPage,
  } = useImageSearch();
  
  // URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentKeyword) params.set('q', currentKeyword);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState({}, '', `/1688/search-v2${newUrl}`);
  }, [currentKeyword, currentPage]);
  
  // imageAddress가 있으면 자동으로 이미지 검색 실행
  useEffect(() => {
    if (initialImageAddress) {
      setCurrentImageUrl(initialImageAddress);
      setIsImageUrlSearch(true);
      searchByImage(initialImageAddress, 1, 'default', undefined, true); // isImageAddress = true
    }
  }, [initialImageAddress, searchByImage]);
  
  // 검색 핸들러
  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setCurrentKeyword(searchKeyword.trim());
      setCurrentPage(1);
      // 이미지 검색 결과 초기화
      imageSearchProducts.length > 0 && clearImageSearchResults();
    }
  };
  
  // 페이지 변경
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    
    // 이미지 검색 모드인 경우 이미지 검색 실행
    if (imageSearchProducts.length > 0) {
      if (currentImageUrl && isImageUrlSearch) {
        // 이미지 URL로 검색
        await searchByImage(currentImageUrl, page, sortBy, filters, true);
      } else if (currentImageId) {
        // 업로드된 이미지 ID로 검색
        await searchByImage(currentImageId, page, sortBy, filters, false);
      }
    }
  };
  
  // 정렬 변경
  const handleSortChange = async (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
    
    // 이미지 검색 모드인 경우 이미지 검색 재실행
    if (imageSearchProducts.length > 0) {
      if (currentImageUrl && isImageUrlSearch) {
        await searchByImage(currentImageUrl, 1, newSort, filters, true);
      } else if (currentImageId) {
        await searchByImage(currentImageId, 1, newSort, filters, false);
      }
    }
  };
  
  // 필터 변경
  const handleFilterChange = async (newFilters: SelectedFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // 이미지 검색 모드인 경우 이미지 검색 재실행
    if (imageSearchProducts.length > 0) {
      if (currentImageUrl && isImageUrlSearch) {
        await searchByImage(currentImageUrl, 1, sortBy, newFilters, true);
      } else if (currentImageId) {
        await searchByImage(currentImageId, 1, sortBy, newFilters, false);
      }
    }
  };
  
  // 카테고리 선택 핸들러 (키워드 카테고리용)
  const handleKeywordCategorySelect = async (categoryId: number | null, parentId?: number) => {
    // 카테고리 선택 상태 업데이트 (부모ID와 함께 전달)
    selectCategory(categoryId, parentId);
    setCurrentPage(1); // 페이지를 1로 리셋
    
    // 카테고리가 선택되면 해당 카테고리로 검색이 자동으로 실행됨 (useSearch1688의 useEffect에 의해)
  };
  
  // 필터 초기화
  const handleFilterReset = () => {
    setFilters({
      isJxhy: false,
      isOnePsale: false,
      priceMin: '',
      priceMax: '',
    });
    setCurrentPage(1);
  };
  
  // 활성 필터 여부 체크 (빈 문자열 제외)
  const activeFilterCount = [
    filters.isJxhy,
    filters.isOnePsale,
    filters.priceMin && filters.priceMin.trim(),
    filters.priceMax && filters.priceMax.trim(),
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0;
  

  
  // 이미지 검색
  const handleImageSearch = async (imageData: string, isImageUrl: boolean = false) => {
    if (isImageUrl) {
      // 1688 이미지 URL로 직접 검색
      setCurrentImageUrl(imageData);
      setIsImageUrlSearch(true);
      setCurrentImageId(null);
      await searchByImage(imageData, 1, 'default', undefined, true);
      setImageSearchOpen(false);
      // 키워드 초기화하여 키워드 검색 결과와 구분
      setCurrentKeyword('');
      setSearchKeyword('');
      setCurrentPage(1);
    } else {
      // 이미지 업로드 후 검색
      const imageId = await uploadImage(imageData);
      if (imageId) {
        setCurrentImageId(imageId);
        setCurrentImageUrl(null);
        setIsImageUrlSearch(false);
        await searchByImage(imageId, 1, 'default', undefined, false);
        setImageSearchOpen(false);
        // 키워드 초기화하여 키워드 검색 결과와 구분
        setCurrentKeyword('');
        setSearchKeyword('');
        setCurrentPage(1);
      }
    }
  };
  
  // 상품 클릭
  const handleProductClick = (offerId: number) => {
    router.push(`/1688/product/${offerId}`);
  };
  


  // 유사 상품 찾기
  const handleFindSimilar = async (imageUrl: string) => {
    // 같은 탭에서 유사 상품 검색 실행
    setCurrentImageUrl(imageUrl);
    setIsImageUrlSearch(true);
    setCurrentImageId(null);
    setCurrentKeyword('');
    setSearchKeyword('');
    setCurrentPage(1);
    await searchByImage(imageUrl, 1, sortBy, filters, true);
  };
  
  // 최종 표시할 상품 (일반 검색 또는 이미지 검색 결과)
  const displayProducts = imageSearchProducts.length > 0 ? imageSearchProducts : products;
  const isLoading = loading || imageSearchLoading;
  const displayTotalPages = imageSearchProducts.length > 0 ? imageSearchTotalPages : totalPages;
  const displayTotalRecords = imageSearchProducts.length > 0 ? imageSearchTotalRecords : totalRecords;
  const displayCurrentPage = imageSearchProducts.length > 0 ? imageSearchCurrentPage : (resultPage || currentPage);
  
  return (
    <PageContainer>
      <HpHeader />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* 데스크톱: 통합된 검색바와 카테고리 섹션 */}
        {!isMobile ? (
          <SearchBarWithCategories
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
            onImageSearchOpen={() => setImageSearchOpen(true)}
            popularKeywords={POPULAR_KEYWORDS}
            categories={keywordCategories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            selectedCategoryIds={selectedCategoryIds}
            onCategorySelect={handleKeywordCategorySelect}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        ) : (
          /* 모바일: 검색바만 표시 (카테고리는 필터 Drawer에) */
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <SearchBar
              value={searchKeyword}
              onChange={setSearchKeyword}
              onSearch={handleSearch}
              onImageSearchOpen={() => setImageSearchOpen(true)}
              popularKeywords={POPULAR_KEYWORDS}
            />
          </Paper>
        )}
        
        {/* 모바일: 필터 버튼 */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              fullWidth
              sx={{ 
                justifyContent: 'flex-start',
                color: 'text.secondary',
                borderColor: 'divider',
              }}
            >
              필터 {hasActiveFilters ? `(${activeFilterCount})` : ''}
            </Button>
          </Box>
        )}
        
        {/* 메인 콘텐츠 */}
        <Grid container>
          {/* 검색 결과 - 전체 너비 사용 */}
          <Grid size={12}>
            {/* 검색 결과 헤더 바 */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                {/* 첫 번째 줄: 검색 결과 수와 정렬 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {initialImageAddress ? '유사 상품 검색 결과' : currentKeyword ? `"${currentKeyword}" 검색 결과` : '상품 목록'}
                    {displayTotalRecords > 0 && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({displayTotalRecords.toLocaleString()}개)
                      </Typography>
                    )}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      정렬:
                    </Typography>
                    <SortSelector
                      value={sortBy}
                      onChange={handleSortChange}
                      disabled={isLoading}
                    />
                  </Box>
                </Box>

                {/* 두 번째 줄: 가격 범위와 업체 유형 필터 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {/* 가격 범위 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      가격:
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="최소 (¥)"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange({ ...filters, priceMin: e.target.value })}
                      type="number"
                      sx={{ width: 100 }}
                      InputProps={{ sx: { height: 32 } }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ~
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="최대 (¥)"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange({ ...filters, priceMax: e.target.value })}
                      type="number"
                      sx={{ width: 100 }}
                      InputProps={{ sx: { height: 32 } }}
                    />
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* 업체 유형 필터 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      업체 유형:
                    </Typography>
                    <Chip
                      label="제조사"
                      size="small"
                      onClick={() => {/* TODO: 제조사 필터 */}}
                      variant="outlined"
                    />
                    <Chip
                      label="무역회사"
                      size="small"
                      onClick={() => {/* TODO: 무역회사 필터 */}}
                      variant="outlined"
                    />
                    <Chip
                      label="실사인증"
                      size="small"
                      color={filters.isJxhy ? 'primary' : 'default'}
                      onClick={() => handleFilterChange({ ...filters, isJxhy: !filters.isJxhy })}
                      variant={filters.isJxhy ? 'filled' : 'outlined'}
                    />
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* 기타 필터 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label="1개 구매 가능"
                      size="small"
                      color={filters.isOnePsale ? 'primary' : 'default'}
                      onClick={() => handleFilterChange({ ...filters, isOnePsale: !filters.isOnePsale })}
                      variant={filters.isOnePsale ? 'filled' : 'outlined'}
                    />
                  </Box>

                  {/* 필터 초기화 */}
                  {(filters.priceMin || filters.priceMax || filters.isJxhy || filters.isOnePsale) && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Button
                        size="small"
                        variant="text"
                        onClick={handleFilterReset}
                        sx={{ minWidth: 'auto' }}
                      >
                        필터 초기화
                      </Button>
                    </>
                  )}
                </Box>
              </Stack>
            </Paper>
            
            {/* 상품 그리드 */}
            <ProductGrid
              products={displayProducts}
              loading={isLoading}
              error={error}
              totalPages={displayTotalPages}
              currentPage={displayCurrentPage}
              totalRecords={displayTotalRecords}
              onPageChange={handlePageChange}
              onProductClick={handleProductClick}
              onFindSimilar={handleFindSimilar}
            />
          </Grid>
        </Grid>
      </Container>
      
      {/* 모바일 필터 Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ p: 2, pb: 3 }}>
          {/* Drawer 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">필터</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* 키워드 카테고리 (모바일에서만 Drawer에 표시) */}
          {currentKeyword && keywordCategories.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
                관련 카테고리
              </Typography>
              <Stack spacing={2}>
                {/* 각 카테고리 그룹별로 표시 */}
                {keywordCategories.map((category) => (
                  <Box key={category.categoryID}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      {category.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {category.childCategorys && category.childCategorys.map((subCategory) => {
                        // snId 형식 생성: "부모ID:자식ID"
                        const snId = `${category.categoryID}:${subCategory.id}`;
                        return (
                          <Chip
                            key={subCategory.id}
                            label={subCategory.name}
                            onClick={() => {
                              selectCategory(subCategory.id, category.categoryID);
                              // 모바일에서는 선택 후 바로 닫지 않음 (여러 개 선택 가능)
                            }}
                            color={selectedCategoryIds.includes(snId) ? 'primary' : 'default'}
                            variant={selectedCategoryIds.includes(snId) ? 'filled' : 'outlined'}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* 필터 패널 */}
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
          
          {/* 적용 버튼 */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setFilterDrawerOpen(false)}
            sx={{ mt: 2 }}
          >
            필터 적용
          </Button>
        </Box>
      </Drawer>
      
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