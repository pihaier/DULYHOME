'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Stack,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  Pagination,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import { useRouter } from 'next/navigation';
import {
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Popover,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CategoryIcon from '@mui/icons-material/Category';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// DajiSaaS API 응답 구조
interface Product1688 {
  imageUrl: string;
  subject: string;
  subjectTrans: string;
  offerId: number;
  isJxhy: boolean;
  priceInfo: {
    price: string;
    jxhyPrice: string | null;
    pfJxhyPrice: string | null;
    consignPrice: string;
  };
  repurchaseRate: string;
  monthSold: number;
  traceInfo: string;
  isOnePsale: boolean;
  sellerIdentities: string[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    totalRecords: number;
    totalPage: number;
    pageSize: number;
    currentPage: number;
    data: Product1688[];
  };
  timestamp: number;
  traceId: string;
}

// 카테고리 인터페이스
interface Category {
  categoryID: number;
  name: string;
  level?: number | null;
  isLeaf: boolean;
  parentIDs?: number[] | null;
  childCategorys?: {
    id: number;
    name: string;
    categoryType: string;
    isLeaf: boolean;
  }[];
}

// 이미지 검색 결과 인터페이스 (추후 API 연동 시 사용)
// interface ImageSearchResult {
//   imageId: string;
//   products?: Product1688[];
// }

// 더미 카테고리 데이터 (API 문서 기반)
const dummyCategories: Category[] = [
  {
    categoryID: 15,
    name: '居家日用品',
    level: 1,
    isLeaf: false,
    parentIDs: [0],
    childCategorys: [
      { id: 1556, name: '居家日用', categoryType: '1', isLeaf: false },
      { id: 1045268, name: '酒店用品', categoryType: '1', isLeaf: false },
      { id: 124284003, name: '秤', categoryType: '1', isLeaf: false },
      { id: 124272009, name: '打火机及烟具', categoryType: '1', isLeaf: false },
      { id: 124016003, name: '挡风、遮阳、防雨工具', categoryType: '1', isLeaf: false },
      { id: 201664803, name: '保暖贴/怀炉/保暖用品', categoryType: '1', isLeaf: false },
      { id: 1045059, name: 'USB新奇特', categoryType: '1', isLeaf: false },
    ],
  },
  {
    categoryID: 7,
    name: '纺织、皮革、羽绒原料',
    level: 1,
    isLeaf: false,
    parentIDs: [0],
    childCategorys: [
      { id: 2829, name: '纺织原料', categoryType: '1', isLeaf: false },
      { id: 411, name: '皮革', categoryType: '1', isLeaf: false },
      { id: 2805, name: '羽绒原料', categoryType: '1', isLeaf: false },
      { id: 10166, name: '化纤坯布', categoryType: '1', isLeaf: false },
    ],
  },
  {
    categoryID: 311,
    name: '服装',
    level: 1,
    isLeaf: false,
    parentIDs: [0],
    childCategorys: [
      { id: 100000773, name: '女装', categoryType: '1', isLeaf: false },
      { id: 100000777, name: '男装', categoryType: '1', isLeaf: false },
      { id: 100003197, name: '童装', categoryType: '1', isLeaf: false },
      { id: 127450003, name: '中老年服装', categoryType: '1', isLeaf: false },
    ],
  },
  {
    categoryID: 1813,
    name: '内衣',
    level: 1,
    isLeaf: false,
    parentIDs: [0],
    childCategorys: [
      { id: 100003222, name: '文胸', categoryType: '1', isLeaf: false },
      { id: 100003224, name: '内裤', categoryType: '1', isLeaf: false },
      { id: 100003226, name: '塑身内衣', categoryType: '1', isLeaf: false },
      { id: 100003233, name: '睡衣/家居服', categoryType: '1', isLeaf: false },
    ],
  },
  {
    categoryID: 509,
    name: '电子元器件',
    level: 1,
    isLeaf: false,
    parentIDs: [0],
    childCategorys: [
      { id: 503, name: '连接器', categoryType: '1', isLeaf: false },
      { id: 501, name: '集成电路', categoryType: '1', isLeaf: false },
      { id: 502, name: '二三极管', categoryType: '1', isLeaf: false },
      { id: 504, name: '电容器', categoryType: '1', isLeaf: false },
    ],
  },
];

// 더미 데이터
const dummyApiResponse: ApiResponse = {
  code: 200,
  message: 'success',
  data: {
    totalRecords: 256,
    totalPage: 26,
    pageSize: 20,
    currentPage: 1,
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        subject: '高品质商务双肩包',
        subjectTrans: '고품질 비즈니스 백팩',
        offerId: 678901234567,
        isJxhy: true,
        priceInfo: {
          price: '45.00-85.00',
          jxhyPrice: '42.00',
          pfJxhyPrice: null,
          consignPrice: '48.00',
        },
        repurchaseRate: '45.2%',
        monthSold: 15842,
        traceInfo: 'GZ-BAG-2024',
        isOnePsale: true,
        sellerIdentities: ['manufacturer', 'verified_supplier'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
        subject: 'TWS无线蓝牙耳机',
        subjectTrans: 'TWS 무선 블루투스 이어폰',
        offerId: 678901234568,
        isJxhy: false,
        priceInfo: {
          price: '28.50',
          jxhyPrice: null,
          pfJxhyPrice: null,
          consignPrice: '30.00',
        },
        repurchaseRate: '38.5%',
        monthSold: 8623,
        traceInfo: 'SZ-AUDIO-2024',
        isOnePsale: true,
        sellerIdentities: ['gold_supplier'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
        subject: '运动鞋休闲鞋',
        subjectTrans: '스포츠 캐주얼 운동화',
        offerId: 678901234569,
        isJxhy: true,
        priceInfo: {
          price: '65.00-120.00',
          jxhyPrice: '58.00',
          pfJxhyPrice: null,
          consignPrice: '70.00',
        },
        repurchaseRate: '52.8%',
        monthSold: 23456,
        traceInfo: 'FJ-SHOES-2024',
        isOnePsale: false,
        sellerIdentities: ['manufacturer', 'trade_assurance'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        subject: '智能手表',
        subjectTrans: '스마트워치',
        offerId: 678901234570,
        isJxhy: false,
        priceInfo: {
          price: '95.00',
          jxhyPrice: null,
          pfJxhyPrice: null,
          consignPrice: '98.00',
        },
        repurchaseRate: '41.2%',
        monthSold: 5432,
        traceInfo: 'SZ-WATCH-2024',
        isOnePsale: true,
        sellerIdentities: ['verified_supplier'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1585565804112-f201f68212d1?w=400',
        subject: '化妆品套装',
        subjectTrans: '화장품 세트',
        offerId: 678901234571,
        isJxhy: true,
        priceInfo: {
          price: '35.00-68.00',
          jxhyPrice: '32.00',
          pfJxhyPrice: null,
          consignPrice: '38.00',
        },
        repurchaseRate: '62.3%',
        monthSold: 18976,
        traceInfo: 'GZ-BEAUTY-2024',
        isOnePsale: false,
        sellerIdentities: ['manufacturer', 'gold_supplier'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
        subject: '儿童玩具积木',
        subjectTrans: '어린이 장난감 블록',
        offerId: 678901234572,
        isJxhy: false,
        priceInfo: {
          price: '15.50-45.00',
          jxhyPrice: null,
          pfJxhyPrice: null,
          consignPrice: '20.00',
        },
        repurchaseRate: '35.6%',
        monthSold: 12543,
        traceInfo: 'DG-TOY-2024',
        isOnePsale: true,
        sellerIdentities: ['trade_assurance'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
        subject: '办公文具套装',
        subjectTrans: '사무용품 세트',
        offerId: 678901234573,
        isJxhy: true,
        priceInfo: {
          price: '12.00-25.00',
          jxhyPrice: '10.50',
          pfJxhyPrice: null,
          consignPrice: '14.00',
        },
        repurchaseRate: '48.9%',
        monthSold: 34567,
        traceInfo: 'SH-OFFICE-2024',
        isOnePsale: true,
        sellerIdentities: ['manufacturer', 'verified_supplier'],
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        subject: '运动服装',
        subjectTrans: '스포츠웨어',
        offerId: 678901234574,
        isJxhy: false,
        priceInfo: {
          price: '28.00-55.00',
          jxhyPrice: null,
          pfJxhyPrice: null,
          consignPrice: '32.00',
        },
        repurchaseRate: '42.1%',
        monthSold: 9876,
        traceInfo: 'FJ-SPORT-2024',
        isOnePsale: false,
        sellerIdentities: ['gold_supplier'],
      },
    ],
  },
  timestamp: Date.now(),
  traceId: 'trace-' + Date.now(),
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [sortBy, setSortBy] = useState(''); // 빈 문자열이 기본(추천순)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState(query);

  // 필터 상태
  const [selectedFilters, setSelectedFilters] = useState({
    isJxhy: false,
    isOnePsale: false,
    manufacturer: false,
    verifiedSupplier: false,
    goldSupplier: false,
    tradeAssurance: false,
    highRepurchase: false,
  });

  // 카테고리 필터
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // 이미지 검색 모달 상태
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // const exchangeRate = 180; // 추후 환율 계산 시 사용

  // query 변경 시 searchKeyword 업데이트
  useEffect(() => {
    setSearchKeyword(query);
  }, [query]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      // 실제 API 호출 시 사용할 코드
      // const response = await fetch('/api/1688/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     keyword: query,
      //     beginPage: currentPage,
      //     pageSize: 20,
      //     sort: sortBy
      //   })
      // });
      // const data = await response.json();
      // setApiResponse(data);

      // 더미 데이터로 검색 시뮬레이션
      setTimeout(() => {
        // 검색어에 따라 다른 결과 표시 (시뮬레이션)
        let filteredData = { ...dummyApiResponse };

        if (query) {
          // 검색어가 있으면 필터링 (실제로는 API가 처리)
          filteredData.data.data = dummyApiResponse.data.data.filter(
            (product) => product.subjectTrans.includes(query) || product.subject.includes(query)
          );
          filteredData.data.totalRecords = filteredData.data.data.length;
          filteredData.data.totalPage = Math.ceil(filteredData.data.data.length / 20);
        } else {
          // 검색어가 없으면 전체 더미 데이터 표시
          filteredData = { ...dummyApiResponse };
        }

        setApiResponse(filteredData);
        setLoading(false);
      }, 800);
    };

    fetchProducts();
  }, [query, currentPage, sortBy]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      router.push(`/1688/search?q=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterName: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev],
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지로 검색 실행
  const handleImageSearch = async () => {
    if (!uploadedImage) return;

    setImageSearchLoading(true);
    // TODO: 실제 API 호출
    setTimeout(() => {
      setImageSearchLoading(false);
      setImageSearchOpen(false);
      // 검색 결과 표시
      router.push('/1688/search?q=이미지검색결과');
    }, 2000);
  };

  // 카테고리 토글 함수 제거 (사용하지 않음)

  const ProductCard = ({ product }: { product: Product1688 }) => {
    const displayPrice = product.priceInfo.jxhyPrice || product.priceInfo.price.split('-')[0];

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          bgcolor: 'white',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 0 8px rgba(0,0,0,0.15)',
            '& .product-image': {
              transform: 'scale(1.05)',
            },
          },
        }}
      >
        {/* 상품 이미지 - 실제 1688처럼 정사각형 */}
        <Box
          sx={{
            position: 'relative',
            paddingTop: '100%',
            overflow: 'hidden',
            bgcolor: '#fff',
            border: '1px solid #e7e7e7',
          }}
        >
          <Box
            component="img"
            className="product-image"
            src={product.imageUrl}
            alt={product.subjectTrans}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s ease',
            }}
          />

          {/* 1688 스타일 배지 - 왼쪽 상단 */}
          <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
            {product.isJxhy && (
              <Box
                sx={{
                  bgcolor: '#ff4400',
                  color: 'white',
                  px: 0.8,
                  py: 0.3,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                精选
              </Box>
            )}
          </Box>

          {/* 일대일 대발 배지 - 오른쪽 하단 */}
          {product.isOnePsale && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'rgba(255,102,0,0.9)',
                color: 'white',
                px: 0.8,
                py: 0.3,
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              一件代发
            </Box>
          )}
        </Box>

        {/* 상품 정보 - 1688 스타일 */}
        <Box sx={{ p: 1.5 }}>
          {/* 가격 정보 - 가장 먼저 크게 */}
          <Box sx={{ mb: 1 }}>
            <Typography
              sx={{
                color: '#ff4400',
                fontWeight: 700,
                fontSize: '22px',
                lineHeight: 1,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              <span style={{ fontSize: '14px' }}>¥</span>
              {displayPrice}
            </Typography>
            {product.priceInfo.price.includes('-') && (
              <Typography
                sx={{
                  color: '#999',
                  fontSize: '12px',
                  mt: 0.3,
                }}
              >
                ¥{product.priceInfo.price}
              </Typography>
            )}
          </Box>

          {/* 제목 - 간단하게 */}
          <Typography
            sx={{
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              color: '#333',
              minHeight: '36px',
              mb: 1,
            }}
          >
            {product.subjectTrans}
          </Typography>

          {/* 모든 가격 정보 표시 - API에서 주는 대로 */}
          {product.priceInfo.jxhyPrice && (
            <Typography sx={{ fontSize: '11px', color: '#ff6600' }}>
              精选价: ¥{product.priceInfo.jxhyPrice}
            </Typography>
          )}
          {product.priceInfo.pfJxhyPrice && (
            <Typography sx={{ fontSize: '11px', color: '#9c27b0' }}>
              批发精选: ¥{product.priceInfo.pfJxhyPrice}
            </Typography>
          )}
          {product.priceInfo.consignPrice && (
            <Typography sx={{ fontSize: '11px', color: '#666' }}>
              代发价: ¥{product.priceInfo.consignPrice}
            </Typography>
          )}

          {/* 재구매율 - API 값 그대로 */}
          <Typography sx={{ fontSize: '11px', color: '#ff6600', mt: 0.5 }}>
            复购率: {product.repurchaseRate}
          </Typography>

          {/* 월판매량 - API 값 그대로 */}
          <Typography sx={{ fontSize: '11px', color: '#666' }}>
            30天销量: {product.monthSold}件
          </Typography>

          {/* 판매자 배지 - 모든 sellerIdentities 표시 */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 'auto' }}>
            {product.sellerIdentities.includes('manufacturer') && (
              <Chip
                size="small"
                label="제조사"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              />
            )}
            {product.sellerIdentities.includes('verified_supplier') && (
              <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
            )}
            {product.sellerIdentities.includes('gold_supplier') && (
              <Chip
                size="small"
                label="Gold"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText',
                }}
              />
            )}
            {product.sellerIdentities.includes('trade_assurance') && (
              <Chip
                size="small"
                label="무역보증"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                }}
              />
            )}
            {product.sellerIdentities.includes('tp_member') && (
              <Chip
                size="small"
                label="TP"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                }}
              />
            )}
            {product.sellerIdentities.includes('powerful_merchants') && (
              <Chip
                size="small"
                label="파워셀러"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                }}
              />
            )}
          </Stack>
        </Box>

        {/* 액션 버튼 */}
        <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #f0f0f0' }}>
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              sx={{
                fontSize: '13px',
                py: 1,
                borderColor: '#e8e8e8',
                color: '#666',
                '&:hover': {
                  borderColor: '#ff6900',
                  bgcolor: '#fff5f0',
                  color: '#ff6900',
                },
              }}
            >
              문의하기
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="medium"
              onClick={() => router.push(`/1688/product/${product.offerId}`)}
              sx={{
                fontSize: '13px',
                py: 1,
                bgcolor: '#ff6900',
                '&:hover': {
                  bgcolor: '#ff5500',
                },
              }}
            >
              상세보기
            </Button>
          </Stack>
        </Box>
      </Card>
    );
  };

  return (
    <PageContainer title="1688 상품 검색" description="1688.com 상품 검색 결과">
      <HpHeader />

      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* 검색바 섹션 */}
        <Box sx={{ bgcolor: '#ff6900', py: 3 }}>
          <Container maxWidth="xl">
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" color="white" fontWeight={700}>
                  1688
                </Typography>
                <Box sx={{ flexGrow: 1, maxWidth: 800 }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="상품명, 키워드를 입력하세요"
                      variant="outlined"
                      size="medium"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                          height: 44,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      sx={{
                        px: 4,
                        bgcolor: '#ff3300',
                        minWidth: 100,
                        height: 44,
                        fontSize: '16px',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#e62e00',
                        },
                      }}
                    >
                      검색
                    </Button>
                    <IconButton
                      onClick={() => setImageSearchOpen(true)}
                      sx={{
                        bgcolor: 'white',
                        width: 44,
                        height: 44,
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
              {/* 인기 검색어 */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography color="white" variant="body2">
                  인기:
                </Typography>
                {['가방', '신발', '의류', '전자제품', '화장품'].map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    size="small"
                    onClick={() => {
                      setSearchKeyword(keyword);
                      handleSearch();
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* 필터 섹션 - 검색바 아래에 배치 */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e8e8e8' }}>
          <Container maxWidth="xl">
            <Box sx={{ py: 2 }}>
              {/* 카테고리 및 필터 라인 */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {/* 카테고리 선택 */}
                <Button
                  onClick={(e) => setCategoryMenuAnchor(e.currentTarget)}
                  startIcon={<CategoryIcon />}
                  endIcon={<ChevronRightIcon />}
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 180,
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    borderColor: '#e8e8e8',
                    color: selectedCategory ? '#333' : '#666',
                    '&:hover': {
                      borderColor: '#ff6900',
                      bgcolor: 'rgba(255, 105, 0, 0.04)',
                    },
                  }}
                >
                  {(() => {
                    if (!selectedCategory) return '전체 카테고리';

                    // 선택된 카테고리 찾기
                    const mainCategory = dummyCategories.find(
                      (c) => c.categoryID.toString() === selectedCategory
                    );
                    if (mainCategory) {
                      // 서브 카테고리도 선택되었다면
                      if (selectedSubCategory) {
                        const subCat = mainCategory.childCategorys?.find(
                          (sc) => sc.id.toString() === selectedSubCategory
                        );
                        return subCat ? `${mainCategory.name} > ${subCat.name}` : mainCategory.name;
                      }
                      return mainCategory.name;
                    }

                    return '전체 카테고리';
                  })()}
                </Button>

                <Divider orientation="vertical" flexItem />

                {/* 가격 범위 */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    가격:
                  </Typography>
                  <TextField size="small" placeholder="최소" type="number" sx={{ width: 80 }} />
                  <Typography>-</Typography>
                  <TextField size="small" placeholder="최대" type="number" sx={{ width: 80 }} />
                  <Typography variant="body2" color="text.secondary">
                    ¥
                  </Typography>
                </Stack>

                <Divider orientation="vertical" flexItem />

                {/* 빠른 필터 체크박스 */}
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="精选"
                  checked={selectedFilters.isJxhy}
                  onChange={() => handleFilterChange('isJxhy')}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="一件代发"
                  checked={selectedFilters.isOnePsale}
                  onChange={() => handleFilterChange('isOnePsale')}
                />
                <FormControlLabel control={<Checkbox size="small" />} label="48小时发货" />
                <FormControlLabel control={<Checkbox size="small" />} label="7天包换" />

                <Box sx={{ flexGrow: 1 }} />

                {/* 필터 초기화 */}
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedFilters({
                      isJxhy: false,
                      isOnePsale: false,
                      manufacturer: false,
                      verifiedSupplier: false,
                      goldSupplier: false,
                      tradeAssurance: false,
                      highRepurchase: false,
                    });
                    setSelectedCategory('');
                    setSelectedSubCategory('');
                  }}
                >
                  필터 초기화
                </Button>
              </Stack>

              {/* 선택된 필터 표시 */}
              {(selectedCategory ||
                selectedSubCategory ||
                Object.values(selectedFilters).some((v) => v)) && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    선택된 필터:
                  </Typography>
                  {selectedCategory && (
                    <Chip
                      label={(() => {
                        const mainCategory = dummyCategories.find(
                          (c) => c.categoryID.toString() === selectedCategory
                        );
                        if (mainCategory && selectedSubCategory) {
                          const subCat = mainCategory.childCategorys?.find(
                            (sc) => sc.id.toString() === selectedSubCategory
                          );
                          return subCat
                            ? `${mainCategory.name} > ${subCat.name}`
                            : mainCategory.name;
                        }
                        return mainCategory?.name || '';
                      })()}
                      size="small"
                      onDelete={() => {
                        setSelectedCategory('');
                        setSelectedSubCategory('');
                      }}
                      sx={{
                        bgcolor: '#fff5f0',
                        color: '#ff6900',
                        '& .MuiChip-deleteIcon': {
                          color: '#ff6900',
                          '&:hover': {
                            color: '#ff5500',
                          },
                        },
                      }}
                    />
                  )}
                  {selectedFilters.isJxhy && (
                    <Chip label="精选" size="small" onDelete={() => handleFilterChange('isJxhy')} />
                  )}
                  {selectedFilters.isOnePsale && (
                    <Chip
                      label="一件代发"
                      size="small"
                      onDelete={() => handleFilterChange('isOnePsale')}
                    />
                  )}
                </Stack>
              )}

              {/* 판매자 인증 필터 */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  판매자:
                </Typography>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="실력상가"
                  checked={selectedFilters.manufacturer}
                  onChange={() => handleFilterChange('manufacturer')}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="인증공급상"
                  checked={selectedFilters.verifiedSupplier}
                  onChange={() => handleFilterChange('verifiedSupplier')}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="골드공급상"
                  checked={selectedFilters.goldSupplier}
                  onChange={() => handleFilterChange('goldSupplier')}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="무역보증"
                  checked={selectedFilters.tradeAssurance}
                  onChange={() => handleFilterChange('tradeAssurance')}
                />
              </Stack>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* 검색 결과 관련 카테고리 - 항상 표시 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {query ? '相关分类 (관련 카테고리)' : '热门分类 (인기 카테고리)'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {/* 검색어에 따른 동적 카테고리 - 실제로는 API에서 받아옴 */}
              {(() => {
                // 검색어에 따라 관련 카테고리 표시 (더미 로직)
                const relatedCategories = [];
                if (!query) {
                  // 검색어가 없을 때 인기 카테고리 표시
                  relatedCategories.push(
                    { id: '0001', name: '女装' },
                    { id: '0002', name: '男装' },
                    { id: '0003', name: '鞋包配饰' },
                    { id: '0004', name: '手机数码' },
                    { id: '0005', name: '家居生活' },
                    { id: '0006', name: '美妆个护' },
                    { id: '0007', name: '食品饮料' },
                    { id: '0008', name: '母婴玩具' },
                    { id: '0009', name: '运动户外' },
                    { id: '0010', name: '汽车用品' }
                  );
                } else if (query.includes('가방') || query.includes('bag')) {
                  relatedCategories.push(
                    { id: '1001', name: '女包' },
                    { id: '1002', name: '男包' },
                    { id: '1003', name: '旅行包' },
                    { id: '1004', name: '背包' },
                    { id: '1005', name: '手提包' },
                    { id: '1006', name: '钱包' }
                  );
                } else if (query.includes('신발') || query.includes('shoe')) {
                  relatedCategories.push(
                    { id: '2001', name: '运动鞋' },
                    { id: '2002', name: '休闲鞋' },
                    { id: '2003', name: '皮鞋' },
                    { id: '2004', name: '女鞋' },
                    { id: '2005', name: '男鞋' },
                    { id: '2006', name: '童鞋' }
                  );
                } else {
                  // 기본 관련 카테고리
                  relatedCategories.push(
                    { id: '3001', name: '热销商品' },
                    { id: '3002', name: '新品上市' },
                    { id: '3003', name: '优质供应商' },
                    { id: '3004', name: '实力商家' },
                    { id: '3005', name: '品牌直销' }
                  );
                }

                return relatedCategories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSubCategory(cat.id);
                      // 실제로는 카테고리 필터링 로직 추가
                    }}
                    variant="outlined"
                    sx={{
                      borderColor: '#e8e8e8',
                      '&:hover': {
                        borderColor: '#ff6900',
                        bgcolor: 'rgba(255, 105, 0, 0.04)',
                      },
                    }}
                  />
                ));
              })()}
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            {/* 상품 리스트 - 전체 너비 사용 */}
            <Grid size={12}>
              {/* 헤더 정보 */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {query ? `"${query}"` : '전체 상품'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {apiResponse?.data.totalRecords.toLocaleString()}개 상품
                    </Typography>
                  </Box>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{
                        bgcolor: 'white',
                        '& .MuiSelect-select': {
                          py: 1,
                          fontSize: '0.875rem',
                        },
                      }}
                    >
                      <MenuItem value="relevance">추천순</MenuItem>
                      <MenuItem value='{"price":"asc"}'>낮은가격순</MenuItem>
                      <MenuItem value='{"price":"desc"}'>높은가격순</MenuItem>
                      <MenuItem value='{"soldQuantity":"desc"}'>판매량순</MenuItem>
                      <MenuItem value='{"repurchaseRate":"desc"}'>재구매율순</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>

              {/* 상품 그리드 */}
              {loading ? (
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 0 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {apiResponse?.data.data.map((product) => (
                      <Grid key={product.offerId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>

                  {/* 페이지네이션 */}
                  {apiResponse && apiResponse.data.totalPage > 1 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        count={apiResponse.data.totalPage}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* API 메타데이터 정보 (개발용) */}
                  {apiResponse && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.65rem', color: 'text.secondary' }}
                      >
                        API 응답: 코드 {apiResponse.code} | {apiResponse.message} | 페이지{' '}
                        {apiResponse.data.currentPage}/{apiResponse.data.totalPage} | 페이지당{' '}
                        {apiResponse.data.pageSize}개 | 전체 {apiResponse.data.totalRecords}개 |
                        Timestamp: {new Date(apiResponse.timestamp).toLocaleString()} | TraceID:{' '}
                        {apiResponse.traceId}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 카테고리 선택 메뉴 */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => {
          setCategoryMenuAnchor(null);
          setHoveredCategory(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 500,
            mt: 0.5,
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* 1급 카테고리 목록 */}
          <List sx={{ width: 200, borderRight: '1px solid #e8e8e8', py: 0 }}>
            <ListItemButton
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubCategory('');
                setCategoryMenuAnchor(null);
              }}
              sx={{
                py: 1,
                '&:hover': { bgcolor: '#fff5f0' },
              }}
            >
              <ListItemText primary="전체 카테고리" />
            </ListItemButton>
            <Divider />
            {dummyCategories.map((category) => (
              <ListItemButton
                key={category.categoryID}
                onMouseEnter={() => setHoveredCategory(category.categoryID)}
                onClick={() => {
                  if (!category.childCategorys || category.childCategorys.length === 0) {
                    setSelectedCategory(category.categoryID.toString());
                    setSelectedSubCategory('');
                    setCategoryMenuAnchor(null);
                  }
                }}
                sx={{
                  py: 1,
                  bgcolor: hoveredCategory === category.categoryID ? '#fff5f0' : 'transparent',
                  '&:hover': { bgcolor: '#fff5f0' },
                }}
              >
                <ListItemText primary={category.name} />
                {category.childCategorys && category.childCategorys.length > 0 && (
                  <ChevronRightIcon sx={{ fontSize: 18, color: 'action.active' }} />
                )}
              </ListItemButton>
            ))}
          </List>

          {/* 2급 카테고리 목록 */}
          {hoveredCategory && (
            <List sx={{ width: 300, py: 0 }}>
              {dummyCategories
                .find((c) => c.categoryID === hoveredCategory)
                ?.childCategorys?.map((subCategory) => (
                  <ListItemButton
                    key={subCategory.id}
                    onClick={() => {
                      setSelectedCategory(hoveredCategory.toString());
                      setSelectedSubCategory(subCategory.id.toString());
                      setCategoryMenuAnchor(null);
                      setHoveredCategory(null);
                    }}
                    sx={{
                      py: 1,
                      '&:hover': { bgcolor: '#fff5f0' },
                    }}
                  >
                    <ListItemText
                      primary={subCategory.name}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ))}
            </List>
          )}
        </Box>
      </Menu>

      {/* 이미지 검색 모달 */}
      <Dialog
        open={imageSearchOpen}
        onClose={() => setImageSearchOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">이미지로 검색</Typography>
            <IconButton onClick={() => setImageSearchOpen(false)} size="small">
              ×
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: dragActive ? '2px dashed #ff6900' : '2px dashed #e0e0e0',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: dragActive ? 'rgba(255, 105, 0, 0.05)' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uploadedImage ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={uploadedImage}
                  alt="Uploaded"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 1,
                  }}
                />
                <IconButton
                  onClick={() => setUploadedImage(null)}
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    bgcolor: 'white',
                    boxShadow: 2,
                  }}
                  size="small"
                >
                  ×
                </IconButton>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  이미지를 드래그하거나 클릭하여 업로드
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JPG, PNG, WEBP 형식 지원 (최대 3MB)
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ bgcolor: '#ff6900' }}
                >
                  이미지 선택
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                  />
                </Button>
              </>
            )}
          </Box>

          {/* 예시 이미지 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              이미지 검색 예시:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {['가방', '신발', '시계', '의류'].map((item) => (
                <Paper
                  key={item}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption">{item}</Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageSearchOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleImageSearch}
            disabled={!uploadedImage || imageSearchLoading}
            sx={{ bgcolor: '#ff6900' }}
          >
            {imageSearchLoading ? <CircularProgress size={24} /> : '검색'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </PageContainer>
  );
}
