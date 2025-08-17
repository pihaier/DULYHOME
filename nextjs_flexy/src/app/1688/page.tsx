'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  IconButton,
  Skeleton,
  Alert,
  Divider,
  Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ConstructionIcon from '@mui/icons-material/Construction';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

// 더미 데이터 타입 정의 (나중에 API 응답과 일치시킬 것)
interface Product1688 {
  id: string;
  title: string;
  titleCn?: string;
  image: string;
  images?: string[];
  price: number;          // 중국 위안화
  priceRange?: string;    // "10.5-25.8"
  moq: number;           // 최소주문수량
  sold30Days?: number;   // 30일 판매량
  supplier: {
    name: string;
    location: string;
    verified: boolean;
    yearsInBusiness?: number;
    rating?: number;
    responseRate?: string;
  };
  shipping?: {
    fee: number;
    days: string;
  };
  tags?: string[];
}

// 더미 데이터
const DUMMY_PRODUCTS: Product1688[] = [
  {
    id: '1',
    title: '고품질 노트북 가방 비즈니스 백팩',
    titleCn: '高品质笔记本包商务背包',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01Qe5YvZ1XGvLKqQv5H_!!2206686532860-0-cib.jpg',
    price: 45.8,
    priceRange: '45.8-68.5',
    moq: 100,
    sold30Days: 2584,
    supplier: {
      name: 'Guangzhou Tech Co., Ltd.',
      location: '广州',
      verified: true,
      yearsInBusiness: 8,
      rating: 4.8,
      responseRate: '98%'
    },
    shipping: {
      fee: 8.5,
      days: '7-15일'
    },
    tags: ['인기상품', '품질보증']
  },
  {
    id: '2',
    title: '무선 블루투스 이어폰 TWS 5.3',
    titleCn: '无线蓝牙耳机TWS 5.3',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01YT3zXh1kXvQKLnQvH_!!2214351593231-0-cib.jpg',
    price: 25.5,
    priceRange: '25.5-35.0',
    moq: 50,
    sold30Days: 5821,
    supplier: {
      name: 'Shenzhen Audio Technology Ltd.',
      location: '深圳',
      verified: true,
      yearsInBusiness: 5,
      rating: 4.9,
      responseRate: '99%'
    },
    shipping: {
      fee: 5.0,
      days: '5-10일'
    },
    tags: ['베스트셀러', '빠른배송']
  },
  {
    id: '3',
    title: '여성 캐주얼 원피스 2024 신상',
    titleCn: '女装休闲连衣裙2024新款',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01mYhKqX1FzQ9VKQV5H_!!2215439215680-0-cib.jpg',
    price: 38.0,
    priceRange: '38.0-58.0',
    moq: 200,
    sold30Days: 3256,
    supplier: {
      name: 'Hangzhou Fashion Co., Ltd.',
      location: '杭州',
      verified: true,
      yearsInBusiness: 10,
      rating: 4.7,
      responseRate: '95%'
    },
    shipping: {
      fee: 6.0,
      days: '7-12일'
    },
    tags: ['신상품', 'OEM가능']
  },
  {
    id: '4',
    title: '스마트워치 피트니스 트래커',
    titleCn: '智能手表健身追踪器',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01XQa5YZ1XGvLKqQv5H_!!2206686532860-0-cib.jpg',
    price: 68.0,
    priceRange: '68.0-120.0',
    moq: 30,
    sold30Days: 1852,
    supplier: {
      name: 'Dongguan Smart Tech Ltd.',
      location: '东莞',
      verified: true,
      yearsInBusiness: 6,
      rating: 4.6,
      responseRate: '92%'
    },
    shipping: {
      fee: 7.5,
      days: '10-15일'
    },
    tags: ['프리미엄', '인증완료']
  },
  {
    id: '5',
    title: 'LED 무드등 인테리어 조명',
    titleCn: 'LED氛围灯装饰照明',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01Qe5YvZ1XGvLKqQv5H_!!2206686532860-0-cib.jpg',
    price: 15.5,
    priceRange: '15.5-28.0',
    moq: 500,
    sold30Days: 8956,
    supplier: {
      name: 'Zhongshan Lighting Co., Ltd.',
      location: '中山',
      verified: true,
      yearsInBusiness: 12,
      rating: 4.8,
      responseRate: '97%'
    },
    shipping: {
      fee: 4.5,
      days: '7-10일'
    },
    tags: ['대량할인', '맞춤제작']
  },
  {
    id: '6',
    title: '휴대용 미니 가습기 USB 충전식',
    titleCn: '便携式迷你加湿器USB充电',
    image: 'https://cbu01.alicdn.com/img/ibank/O1CN01YT3zXh1kXvQKLnQvH_!!2214351593231-0-cib.jpg',
    price: 12.8,
    priceRange: '12.8-18.5',
    moq: 100,
    sold30Days: 6523,
    supplier: {
      name: 'Ningbo Home Appliances Ltd.',
      location: '宁波',
      verified: false,
      yearsInBusiness: 3,
      rating: 4.5,
      responseRate: '90%'
    },
    shipping: {
      fee: 3.5,
      days: '5-8일'
    },
    tags: ['인기상품', '소량주문가능']
  },
];

export default function Search1688Page() {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 더미 검색 함수 (나중에 API 호출로 교체) - 현재 비활성화
  const handleSearch = async () => {
    // 서비스 준비중
    return;
  };

  // 환율 적용 가격 계산 (나중에 실제 환율 API 사용)
  const calculateKRW = (cnyPrice: number) => {
    const exchangeRate = 200; // 임시 환율
    const margin = 1.5;        // 50% 마진
    return Math.round(cnyPrice * exchangeRate * margin);
  };

  const popularKeywords = [
    '노트북', '가방', '신발', '의류', '화장품',
    '전자제품', '악세서리', '가구', '주방용품', '완구'
  ];

  const categories = [
    '전자제품', '의류/패션', '가정용품', '뷰티/화장품',
    '스포츠/레저', '완구/취미', '사무용품', '자동차용품'
  ];

  return (
    <PageContainer title="1688 상품 검색 - 두리무역" description="중국 도매 상품 실시간 검색">
      <HpHeader />
      
      {/* 준비중 알림 */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" icon={<ConstructionIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            1688 서비스 준비중
          </Typography>
          <Typography variant="body2">
            현재 1688.com API 연동 및 서비스 준비 중입니다. 빠른 시일 내에 정식 서비스를 제공할 예정입니다.
          </Typography>
        </Alert>
      </Container>

      {/* 검색 섹션 (비활성화) */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        py: 8,
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2}>
            <ConstructionIcon sx={{ fontSize: 60, color: 'white' }} />
            <Typography variant="h3" color="white" align="center" fontWeight="bold">
              1688.com 상품 검색 (준비중)
            </Typography>
            <Typography variant="h6" color="white" align="center" sx={{ opacity: 0.9 }}>
              중국 최대 B2B 도매 플랫폼 • 실시간 가격 조회 • L6 등급 5% 할인
            </Typography>
          </Stack>
          
          {/* 검색바 */}
          <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto', mt: 4 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                placeholder="찾으시는 상품을 검색해보세요 (예: 노트북 가방, 블루투스 이어폰)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { fontSize: '1.1rem' }
                }}
                size="medium"
              />
              
              <IconButton 
                color="primary" 
                title="이미지로 검색"
                disabled
                sx={{ 
                  border: '2px solid',
                  borderColor: 'action.disabled',
                  borderRadius: 1,
                  px: 2
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
              
              <Button 
                variant="contained" 
                size="large"
                disabled
                sx={{ 
                  minWidth: 140,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                준비중
              </Button>
            </Stack>
            
            {/* 카테고리 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                카테고리:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {categories.map((cat) => (
                  <Chip 
                    key={cat}
                    label={cat} 
                    onClick={() => {
                      setKeyword(cat);
                      handleSearch();
                    }}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
            
            {/* 인기 검색어 */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                인기 검색어:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {popularKeywords.map((kw) => (
                  <Chip 
                    key={kw}
                    label={kw} 
                    onClick={() => {
                      setKeyword(kw);
                      handleSearch();
                    }}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 검색 결과 */}
      <Container sx={{ py: 4 }}>
        {loading ? (
          // 로딩 스켈레톤
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
                <Card>
                  <Skeleton variant="rectangular" height={250} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : products.length > 0 ? (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>테스트 모드:</strong> 현재 표시되는 데이터는 더미 데이터입니다. 
                실제 1688 API 연동은 준비 중입니다.
              </Typography>
            </Alert>
            
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              검색 결과: <strong>{products.length}</strong>개 상품
            </Typography>
            
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="250"
                        image={product.image}
                        alt={product.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      {product.tags && product.tags.length > 0 && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8,
                          display: 'flex',
                          gap: 0.5
                        }}>
                          {product.tags.slice(0, 2).map((tag) => (
                            <Chip 
                              key={tag}
                              label={tag} 
                              size="small" 
                              color="error"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 24
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <CardContent>
                      <Typography 
                        variant="body1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 48
                        }}
                      >
                        {product.title}
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        color="primary" 
                        gutterBottom
                        fontWeight="bold"
                      >
                        ₩{calculateKRW(product.price).toLocaleString()}
                      </Typography>
                      
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>도매가:</strong> ¥{product.price} 
                          {product.priceRange && ` (¥${product.priceRange})`}
                        </Typography>
                        
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={`MOQ: ${product.moq}개`} 
                            size="small" 
                            variant="outlined"
                          />
                          {product.sold30Days && (
                            <Chip 
                              label={`월 ${product.sold30Days.toLocaleString()}개 판매`} 
                              size="small" 
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Stack>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <StorefrontIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {product.supplier.name}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {product.supplier.verified && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="caption" color="success.main">
                                인증업체
                              </Typography>
                            </Stack>
                          )}
                          
                          {product.supplier.rating && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Rating 
                                value={product.supplier.rating} 
                                readOnly 
                                size="small" 
                                precision={0.1}
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({product.supplier.rating})
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                        
                        {product.shipping && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <LocalShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              배송비 ¥{product.shipping.fee} • {product.shipping.days}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" size="large">
                더 보기
              </Button>
            </Box>
          </>
        ) : searched ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body1" color="text.secondary">
              다른 검색어로 시도해보세요
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              1688.com 상품을 검색해보세요
            </Typography>
            <Typography variant="body1" color="text.secondary">
              중국 최대 도매 사이트의 수백만 개 상품을 실시간으로 검색할 수 있습니다
            </Typography>
          </Box>
        )}
      </Container>
      
      <Footer />
    </PageContainer>
  );
}