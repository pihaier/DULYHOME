'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Skeleton,
  Alert,
  Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  PhotoCamera,
  TrendingUp,
  LocalShipping,
  Verified,
  Store,
  Category,
  Inventory,
  CameraAlt,
  QrCodeScanner,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';

// 상품 타입 정의
interface Product1688 {
  id: string;
  title: string;
  titleCn: string;
  image: string;
  price: number;
  priceRange: string;
  moq: number;
  sold30Days: number;
  supplier: {
    name: string;
    location: string;
    verified: boolean;
    yearsInBusiness: number;
    rating: number;
    responseRate: string;
  };
  shipping: {
    fee: number;
    days: string;
  };
  tags: string[];
}

export default function Search1688Page() {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const router = useRouter();

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getCategories } = await import('@/lib/1688/api');
        const result = await getCategories('0');
        
        if (result?.success && result.data) {
          setCategories(result.data.slice(0, 8)); // 상위 8개 카테고리만 표시
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // 인기 상품 로드 (초기 로드)
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        const { searchProducts } = await import('@/lib/1688/api');
        
        // 인기 상품 검색
        const result = await searchProducts({
          keyword: 'popular',
          page: 1,
          pageSize: 6,
          country: 'ko'
        });

        if (result?.success && result.data?.data) {
          // API 데이터를 Product1688 형식으로 변환
          const transformedProducts = result.data.data.map((item: any, index: number) => ({
            id: item.offerId || `product-${index}`,
            title: item.subjectTrans || item.subject,
            titleCn: item.subject,
            image: item.imageUrl,
            price: parseFloat(item.priceInfo?.price?.split('-')[0] || '0'),
            priceRange: item.priceInfo?.price || '0',
            moq: 100, // API에서 제공하지 않으면 기본값
            sold30Days: item.monthSold || 0,
            supplier: {
              name: '1688 Supplier',
              location: 'China',
              verified: item.isJxhy || false,
              yearsInBusiness: 5,
              rating: 4.5,
              responseRate: '95%',
            },
            shipping: {
              fee: 10.0,
              days: '7-15일',
            },
            tags: item.sellerIdentities || [],
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

  // 인기 검색어 로드
  useEffect(() => {
    // API에서 인기 검색어 가져오기 (나중에 구현)
    const defaultKeywords: string[] = [];
    setPopularKeywords(defaultKeywords);
  }, []);

  // 실제 검색 함수
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    // 검색 페이지로 이동 (search-v2 사용)
    router.push(`/1688/search-v2?q=${encodeURIComponent(keyword)}`);
  };

  // 환율 적용 가격 계산
  const calculateKRW = (cnyPrice: number) => {
    const exchangeRate = 200; // 임시 환율 (실제로는 API에서 가져와야 함)
    const margin = 1.5; // 50% 마진
    return Math.round(cnyPrice * exchangeRate * margin);
  };

  return (
    <PageContainer title="1688 상품 검색" description="중국 도매 플랫폼 1688.com 상품 검색">
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* 헤더 */}
        <Box sx={{ mb: 4, pt: 2 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: '#ff6900' }}>
            1688.com
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            중국 최대 B2B 도매 플랫폼 - 공장 직거래로 최저가 소싱
          </Typography>
        </Box>

        {/* 검색 바 */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="상품명, 카테고리, 키워드를 입력하세요..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="primary" sx={{ mr: 1 }}>
                      <CameraAlt />
                    </IconButton>
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      sx={{
                        bgcolor: '#ff6900',
                        '&:hover': { bgcolor: '#e55a00' },
                      }}
                    >
                      검색
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            {/* 인기 검색어 */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
              <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                인기 검색어:
              </Typography>
              {popularKeywords.map((kw, index) => (
                <Chip
                  key={index}
                  label={kw}
                  size="small"
                  onClick={() => {
                    setKeyword(kw);
                    handleSearch();
                  }}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                    mb: 1,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* 카테고리 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
            카테고리별 쇼핑
          </Typography>
          <Grid container spacing={2}>
            {loadingCategories ? (
              // 로딩 스켈레톤
              [...Array(8)].map((_, index) => (
                <Grid key={index} size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <Skeleton variant="rectangular" height={80} />
                </Grid>
              ))
            ) : (
              categories.map((category) => (
                <Grid key={category.categoryID} size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => router.push(`/1688/search-v2?category=${category.categoryID}`)}
                  >
                    <Typography variant="body2" noWrap>
                      {category.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* 추천 상품 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
            인기 상품
          </Typography>

          <Grid container spacing={3}>
            {loadingProducts ? (
              // 로딩 스켈레톤
              [...Array(6)].map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => router.push(`/1688/product/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image}
                      alt={product.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="subtitle2" noWrap gutterBottom>
                        {product.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {product.titleCn}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="error" fontWeight="bold">
                          ¥{product.priceRange}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ≈ ₩{calculateKRW(product.price).toLocaleString()}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={`MOQ: ${product.moq}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`30일 판매: ${product.sold30Days}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Store fontSize="small" color="action" />
                        <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                          {product.supplier.name}
                        </Typography>
                        {product.supplier.verified && (
                          <Verified fontSize="small" color="primary" />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
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

        {/* 서비스 특징 */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4, bgcolor: '#f5f5f5' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box textAlign="center">
                <LocalShipping sx={{ fontSize: 40, color: '#ff6900', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  직배송 지원
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  중국 공장에서 한국까지 안전하고 빠른 배송
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box textAlign="center">
                <Verified sx={{ fontSize: 40, color: '#ff6900', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  검증된 공급자
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  실사 인증을 받은 신뢰할 수 있는 제조사
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box textAlign="center">
                <Inventory sx={{ fontSize: 40, color: '#ff6900', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  소량 주문 가능
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MOQ 협상 가능, 샘플 주문 지원
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box textAlign="center">
                <QrCodeScanner sx={{ fontSize: 40, color: '#ff6900', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  품질 검수
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  출고 전 품질 검사 서비스 제공
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </PageContainer>
  );
}