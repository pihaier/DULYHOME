'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import Grid from '@mui/material/Grid';  // MUI v7 방식
import ShopProductCard from './ShopProductCard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ShopProductsSectionProps {
  sellerOpenId: string;
  currentProductId: string;  // 현재 보고 있는 상품 제외
}

interface ShopProduct {
  imageUrl: string;
  subject: string;
  subjectTrans: string;
  offerId: string;
  priceInfo: {
    price: string;
    jxhyPrice: string | null;
    pfJxhyPrice: string | null;
    consignPrice: string;
  };
  monthSold: number;
  repurchaseRate: string;
  isJxhy: boolean;
  isOnePsale: boolean;
  sellerIdentities: string[];
}

export default function ShopProductsSection({
  sellerOpenId,
  currentProductId,
}: ShopProductsSectionProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTab, setActiveTab] = useState(0);  // 0: 인기순, 1: 최신순, 2: 가격순

  // 정렬 옵션 맵핑
  const sortOptions = [
    { label: '인기순', value: '{"monthSold":"desc"}' },
    { label: '최신순', value: null },  // 기본값
    { label: '낮은가격순', value: '{"price":"asc"}' },
    { label: '높은가격순', value: '{"price":"desc"}' },
  ];

  // 상점 상품 로드 함수
  const loadShopProducts = async (pageNum: number = 1, sortIndex: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import로 초기 로딩 최적화
      const { searchShopProducts } = await import('@/lib/1688/api');
      
      const result = await searchShopProducts({
        sellerOpenId,
        page: pageNum,
        pageSize: 12,  // 그리드에 맞게 12개 (3x4 또는 4x3)
        sort: sortOptions[sortIndex].value || undefined,
      });
      
      if (result.success) {
        // 현재 상품 제외
        const filteredProducts = result.data.data.filter(
          (product: ShopProduct) => String(product.offerId) !== String(currentProductId)
        );
        
        if (pageNum === 1) {
          setProducts(filteredProducts);
        } else {
          // 더보기 버튼 클릭 시 기존 상품에 추가
          setProducts(prev => [...prev, ...filteredProducts]);
        }
        
        setTotalPages(result.data.totalPage);
        setTotalRecords(result.data.totalRecords);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load shop products:', err);
      setError('상점 상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 재로드
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    loadShopProducts(1, newValue);
  };

  // 컴포넌트 마운트 시 로드 (0.5초 지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadShopProducts(1, 0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [sellerOpenId]);

  // 로딩 상태 (첫 로딩)
  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error && products.length === 0) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => loadShopProducts(1, activeTab)}
          >
            다시 시도
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // 상품이 없는 경우
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          판매자의 다른 상품
          {totalRecords > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (총 {totalRecords}개)
            </Typography>
          )}
        </Typography>
      </Box>

      {/* 정렬 탭 */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="인기순" />
        <Tab label="최신순" />
        <Tab label="낮은가격순" />
        <Tab label="높은가격순" />
      </Tabs>

      {/* 상품 그리드 - MUI v7 Grid 사용 */}
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid 
            key={product.offerId} 
            size={{ xs: 6, sm: 4, md: 3, lg: 3 }}  // MUI v7 size prop
          >
            <ShopProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* 더보기 버튼 */}
      {page < totalPages && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={() => loadShopProducts(page + 1, activeTab)}
            disabled={loading}
          >
            {loading ? '로딩 중...' : `더 많은 상품 보기 (${page}/${totalPages})`}
          </Button>
        </Box>
      )}

      {/* 로딩 오버레이 (추가 로딩 시) */}
      {loading && products.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
}