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

// 더미 데이터 모두 제거 - API에서 실시간으로 가져옴

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [sortBy, setSortBy] = useState(''); // 빈 문자열이 기본(추천순)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState(query);
  const [categories, setCategories] = useState<Category[]>([]); // API에서 카테고리 가져옴

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

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getCategories } = await import('@/lib/1688/api');
        // 루트 카테고리 조회 (categoryID: 0)
        const result = await getCategories('0');
        console.log('카테고리 API 응답:', result);
        
        if (result?.success && result.data) {
          console.log('카테고리 데이터 설정:', result.data);
          setCategories(result.data);
        } else {
          console.error('카테고리 응답 형식 오류:', result);
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
        // 실패 시 더미 데이터 유지
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setApiResponse(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1688 API 유틸리티 함수 사용
        const { searchProducts } = await import('@/lib/1688/api');
        
        // 필터 생성
        const filters = [];
        if (selectedFilters.isJxhy) filters.push('isJxhy');
        if (selectedFilters.isOnePsale) filters.push('isOnePsale');
        if (selectedFilters.manufacturer) filters.push('manufacturer');
        if (selectedFilters.verifiedSupplier) filters.push('verifiedSupplier');
        if (selectedFilters.goldSupplier) filters.push('goldSupplier');
        
        const result = await searchProducts({
          keyword: query,
          page: currentPage,
          pageSize: 20,
          country: 'ko',
          sort: sortBy || undefined,
          filter: filters.length > 0 ? filters.join(',') : undefined,
          categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        });

        if (result?.success) {
          // API 응답을 기존 형식에 맞게 변환
          setApiResponse({
            code: 200,
            message: 'success',
            data: result.data,
            timestamp: Date.now(),
            traceId: 'search-' + Date.now()
          });
        } else {
          console.error('Search failed:', result);
          setApiResponse(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setApiResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, currentPage, sortBy, selectedFilters, selectedCategory, selectedSubCategory]);

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
    try {
      // 1. 이미지 업로드하여 imageId 획득
      const { uploadImage, searchByImage } = await import('@/lib/1688/api');
      
      // base64 이미지 데이터 추출 (data:image/jpeg;base64, 부분 제거)
      const base64Data = uploadedImage.split(',')[1];
      
      const uploadResult = await uploadImage(base64Data);
      
      if (uploadResult?.success && uploadResult.data?.imageId) {
        // 2. imageId로 상품 검색
        const searchResult = await searchByImage({
          imageId: uploadResult.data.imageId,
          beginPage: 1,
          pageSize: 20,
          country: 'ko'
        });
        
        if (searchResult?.success) {
          // 검색 결과를 상태에 저장
          setApiResponse({
            code: 200,
            message: '성공',
            data: {
              totalRecords: searchResult.data.totalRecords,
              totalPage: searchResult.data.totalPage,
              pageSize: searchResult.data.pageSize,
              currentPage: searchResult.data.currentPage,
              data: searchResult.data.data
            },
            timestamp: Date.now(),
            traceId: 'image-search'
          });
          // setTotalPages 는 이미지 검색에서는 사용하지 않음 (별도 페이징 필요시 추가)
        }
      }
    } catch (error) {
      console.error('이미지 검색 실패:', error);
      alert('이미지 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setImageSearchLoading(false);
      setImageSearchOpen(false);
    }
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
                    const mainCategory = categories.find(
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
                        const mainCategory = categories.find(
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
              {/* API에서 받아온 실제 카테고리 표시 */}
              {categories.length > 0 ? (
                categories.slice(0, 15).map((cat) => (
                  <Chip
                    key={cat.categoryID}
                    label={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.categoryID.toString());
                      setSelectedSubCategory('');
                      // 카테고리 선택 시 검색 실행
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
                ))
              ) : (
                // 카테고리 로딩 중이거나 없을 때 기본 표시
                <Typography variant="body2" color="text.secondary">
                  카테고리를 불러오는 중...
                </Typography>
              )}
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
            {categories.map((category) => (
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
              {categories
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
