'use client';

import React from 'react';
import {
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ProductCard from '../ProductCard';
import type { Product1688 } from '../../types';

interface ProductGridProps {
  products: Product1688[];
  loading: boolean;
  error?: string | null;
  totalPages: number;
  currentPage: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  onProductClick?: (offerId: number) => void;
  onInquiryClick?: (product: Product1688) => void;
  onFindSimilar?: (imageUrl: string) => void;
}

export default function ProductGrid({
  products,
  loading,
  error,
  totalPages,
  currentPage,
  totalRecords,
  onPageChange,
  onProductClick,
  onInquiryClick,
  onFindSimilar,
}: ProductGridProps) {
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 검색 결과 없음
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          검색 결과가 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary">
          다른 검색어나 필터를 시도해보세요
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* 검색 결과 정보 */}
      {totalRecords !== undefined && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            총 {totalRecords.toLocaleString()}개 상품
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentPage} / {totalPages} 페이지
          </Typography>
        </Box>
      )}

      {/* 상품 그리드 */}
      <Grid container spacing={2}>
        {products.map((product, index) => (
          <Grid 
            key={product.offerId || `product-${index}`} 
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          >
            <ProductCard
              product={product}
              onDetailClick={onProductClick}
              onInquiryClick={onInquiryClick}
              onFindSimilar={onFindSimilar}
            />
          </Grid>
        ))}
      </Grid>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Stack>
  );
}