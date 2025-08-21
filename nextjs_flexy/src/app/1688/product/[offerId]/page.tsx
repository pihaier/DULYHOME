'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Box, Container, Alert, CircularProgress, Typography, Snackbar, Modal, Fade, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

// 분리된 컴포넌트들
import ProductImageGallery from './components/ProductImageGallery';
import ProductInfo from './components/ProductInfo';
import PriceCalculator from './components/PriceCalculator';
import SkuSelector from './components/SkuSelector';
import ProductTabs from './components/ProductTabs';
import AddToCartDialog from './components/AddToCartDialog';
import SupplierInfo from './components/SupplierInfo';
import ShopProductsSection from './components/shop/ShopProductsSection';

// hooks
import { useProductDetail } from './hooks/useProductDetail';
import { useCart } from './hooks/useCart';

export default function ProductDetailPage() {
  const params = useParams();
  const offerId = params.offerId as string;
  
  // Ref for scrolling to shop products section
  const shopProductsRef = useRef<HTMLDivElement>(null);

  // Custom hooks 사용
  const { 
    productDetail, 
    loading, 
    error,
    translatedDescription,
    isTranslatingDescription,
    handleTranslateDescription 
  } = useProductDetail(offerId);

  const {
    handleAddToCart,
    addingToCart,
    cartOptionsDialog,
    setCartOptionsDialog,
    cartOptions,
    setCartOptions
  } = useCart();

  // 상태 관리
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // 다른 상품 보기 스크롤 함수
  const handleViewOtherProducts = () => {
    shopProductsRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedSkuQuantities, setSelectedSkuQuantities] = useState<{ [key: string]: number }>({});
  const [selectedSkus, setSelectedSkus] = useState<any[]>([]);

  // 번역 관련 상태
  const [translatingImage, setTranslatingImage] = useState<string | null>(null);
  const [translatedImages, setTranslatedImages] = useState<Record<string, string>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [snackbarMsg, setSnackbarMsg] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' as 'success' | 'error' | 'info' 
  });

  // 이미지 리스트 가져오기
  const getAllProductImages = () => {
    if (!productDetail) return [];
    
    // API 응답에 맞게 수정 - productImage.images 사용
    const productImages = productDetail.productImage?.images || [];
    
    // SKU 이미지 수집 - skuImageUrl 필드 사용
    const skuImages = productDetail.productSkuInfos?.flatMap((sku: any) => 
      sku.skuAttributes?.filter((attr: any) => attr.skuImageUrl).map((attr: any) => attr.skuImageUrl)
    ) || [];
    
    return [...new Set([...productImages, ...skuImages])];
  };

  const allImages = getAllProductImages();

  // 중앙화된 이미지 번역 핸들러
  const handleTranslateImage = async (imageUrl: string) => {
    // 이미 번역된 이미지가 있으면 모달로 표시
    if (translatedImages[imageUrl]) {
      setModalImageUrl(translatedImages[imageUrl]);
      setImageModalOpen(true);
      return;
    }

    setTranslatingImage(imageUrl);
    try {
      const { translateImage } = await import('@/lib/1688/api');
      const result = await translateImage(imageUrl);
      
      if (result.success && result.data?.translatedImageUrl) {
        setTranslatedImages(prev => ({
          ...prev,
          [imageUrl]: result.data.translatedImageUrl
        }));
        // 번역 성공하면 바로 모달 열기
        setModalImageUrl(result.data.translatedImageUrl);
        setImageModalOpen(true);
        setSnackbarMsg({
          open: true,
          message: '이미지가 성공적으로 번역되었습니다',
          severity: 'success'
        });
      } else {
        setSnackbarMsg({
          open: true,
          message: result.error || '이미지 번역 서비스가 준비 중입니다.',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('이미지 번역 오류:', error);
      setSnackbarMsg({
        open: true,
        message: '이미지 번역에 실패했습니다. 다시 시도해주세요.',
        severity: 'error'
      });
    } finally {
      setTranslatingImage(null);
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const minOrder = productDetail?.minOrderQuantity || 1;
    if (newQuantity >= minOrder) {
      setQuantity(newQuantity);
    }
  };

  // 유사 상품 찾기 핸들러
  const handleFindSimilar = () => {
    // 첫 번째 이미지 사용 (메인 이미지)
    if (allImages && allImages.length > 0) {
      const imageUrl = allImages[0]; // 첫 번째 이미지(메인 이미지) 사용
      // 새 탭에서 검색 페이지 열기
      window.open(`/1688/search-v2?imageAddress=${encodeURIComponent(imageUrl)}`, '_blank');
    } else {
      setSnackbarMsg({
        open: true,
        message: '상품 이미지를 찾을 수 없습니다.',
        severity: 'info'
      });
    }
  };

  // SKU 수량 변경 핸들러 - useCallback으로 메모이제이션
  const handleSizeQuantitiesChange = useCallback((quantities: { [key: string]: number }, totalAmt: number) => {
    const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (total > 0) {
      setQuantity(total);
      setSelectedSkuQuantities(quantities);
      
      // 선택된 SKU들 정보 수집
      const skus: any[] = [];
      Object.entries(quantities).forEach(([key, qty]) => {
        if (qty > 0 && productDetail?.productSkuInfos) {
          // 색상-사이즈 키 또는 sku-id 키 파싱
          if (key.startsWith('sku-')) {
            const skuId = key.replace('sku-', '');
            const sku = productDetail.productSkuInfos.find((s: any) => s.skuId === skuId);
            if (sku) {
              skus.push({ ...sku, quantity: qty });
            }
          } else {
            // 색상-사이즈 형식
            const [color, size] = key.split('-');
            const sku = productDetail.productSkuInfos.find((s: any) => 
              s.skuAttributes?.some((attr: any) => 
                (attr.valueTrans === color || attr.value === color)
              ) &&
              s.skuAttributes?.some((attr: any) => 
                (attr.valueTrans === size || attr.value === size)
              )
            );
            if (sku) {
              skus.push({ ...sku, quantity: qty });
            }
          }
        }
      });
      console.log('Setting selectedSkus:', skus);
      setSelectedSkus(skus);
    }
  }, [productDetail]);

  // 속성 선택 핸들러
  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));

    // SKU 매칭 로직
    if (productDetail && productDetail.productSkuInfos) {
      // 선택한 특정 속성값에 대해서만 이미지가 있는지 확인
      // 해당 속성의 값과 정확히 일치하는 SKU 속성만 찾기
      const skuWithMatchingImage = productDetail.productSkuInfos.find((sku: any) =>
        sku.skuAttributes?.some((attr: any) => {
          const attrName = attr.attributeNameTrans || attr.attributeName;
          const attrValue = attr.valueTrans || attr.value;
          // 속성 이름과 값이 모두 일치하고 이미지가 있는 경우만
          return attrName === attributeName && attrValue === value && attr.skuImageUrl;
        })
      );
      
      if (skuWithMatchingImage) {
        const imageAttr = skuWithMatchingImage.skuAttributes.find((attr: any) => {
          const attrName = attr.attributeNameTrans || attr.attributeName;
          const attrValue = attr.valueTrans || attr.value;
          return attrName === attributeName && attrValue === value && attr.skuImageUrl;
        });
        
        if (imageAttr?.skuImageUrl) {
          const imageIndex = allImages.indexOf(imageAttr.skuImageUrl);
          if (imageIndex >= 0) {
            setSelectedImage(imageIndex);
          }
        }
      }

      // 크기/사이즈 속성은 제외하고 속성 목록 생성
      const requiredAttributes = Array.from(
        new Set(
          productDetail.productSkuInfos.flatMap((sku: any) =>
            sku.skuAttributes?.map((attr: any) => {
              const attrName = attr.attributeNameTrans || attr.attributeName;
              // 크기/사이즈는 SKU 매칭에서 제외 (수량 선택 시 처리)
              if (attrName === '크기' || attrName === '尺码' || attrName === 'Size' || attrName === '사이즈') {
                return null;
              }
              return attrName;
            }).filter(Boolean) || []
          )
        )
      );

      const newAttributes = { ...selectedAttributes, [attributeName]: value };
      const allSelected = requiredAttributes.every((attr: any) => newAttributes[attr]);

      if (allSelected) {
        const matchingSku = productDetail.productSkuInfos.find((sku: any) =>
          sku.skuAttributes?.every((attr: any) => {
            const attrName = attr.attributeNameTrans || attr.attributeName;
            const attrValue = attr.valueTrans || attr.value;
            // 크기/사이즈는 매칭에서 제외
            if (attrName === '크기' || attrName === '尺码' || attrName === 'Size' || attrName === '사이즈') {
              return true;
            }
            return newAttributes[attrName] === attrValue;
          })
        );

        if (matchingSku) {
          console.log('Setting selectedSku:', matchingSku);
          setSelectedSku(matchingSku);
        } else {
          console.log('No matching SKU found for attributes:', newAttributes);
        }
      }
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <PageContainer title="상품 상세" description="1688 상품 상세 정보">
        <HpHeader />
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </PageContainer>
    );
  }

  // 에러 상태
  if (error || !productDetail) {
    return (
      <PageContainer title="상품 상세" description="1688 상품 상세 정보">
        <HpHeader />
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Alert severity="error">
              <Typography variant="h6" gutterBottom>
                상품 정보를 불러올 수 없습니다
              </Typography>
              <Typography variant="body2">
                {error || `상품 ID: ${offerId}를 찾을 수 없습니다.`}
              </Typography>
            </Alert>
          </Box>
        </Container>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={productDetail.subjectTrans} description={productDetail.subjectTrans}>
      <HpHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          {/* 브레드크럼 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <span style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>홈</span>
              {' > '}
              <span style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/dashboard/1688/products'}>1688 상품</span>
              {' > '}
              <span>{productDetail.subjectTrans}</span>
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* 이미지 갤러리 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ 
                position: { md: 'sticky' }, 
                top: { md: 80 }
              }}>
                <ProductImageGallery
                  productDetail={productDetail}
                  currentImage={allImages[selectedImage]}
                  onImageChange={(imageUrl) => {
                    const index = allImages.indexOf(imageUrl);
                    if (index >= 0) setSelectedImage(index);
                  }}
                />
              </Box>
            </Grid>

            {/* 오른쪽: 상품 정보 + SKU */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ProductInfo
                productDetail={productDetail}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                selectedSku={selectedSku}
                selectedAttributes={selectedAttributes}
                onAttributeSelect={handleAttributeSelect}
                onAddToCart={() => handleAddToCart(productDetail, selectedSku, quantity)}
                onOpenCalculator={() => setCalculatorOpen(true)}
                onFindSimilar={handleFindSimilar}
              />
              
              {/* SKU 선택기 */}
              {productDetail.productSkuInfos && productDetail.productSkuInfos.length > 0 && (
                <Box sx={{ mt: 3, display: { xs: 'none', md: 'block' } }}>
                  <SkuSelector
                    productSkuInfos={productDetail.productSkuInfos}
                    selectedAttributes={selectedAttributes}
                    onAttributeSelect={handleAttributeSelect}
                    selectedSku={selectedSku}
                    onSizeQuantitiesChange={handleSizeQuantitiesChange}
                  />
                </Box>
              )}
            </Grid>
          </Grid>

          {/* 공급업체 정보 */}
          <Box sx={{ mt: 3 }}>
            <SupplierInfo 
              productDetail={productDetail} 
              onViewOtherProducts={productDetail?.sellerOpenId ? handleViewOtherProducts : undefined}
            />
          </Box>

          {/* 상품 상세 탭 */}
          <Box sx={{ mt: 3 }}>
            <ProductTabs
              productDetail={productDetail}
              translatedDescription={translatedDescription}
              isTranslatingDescription={isTranslatingDescription}
              onTranslateDescription={handleTranslateDescription}
              translatingImage={translatingImage}
              translatedImages={translatedImages}
              onTranslateImage={handleTranslateImage}
            />
          </Box>

          {/* 판매자의 다른 상품들 */}
          {productDetail?.sellerOpenId && (
            <Box ref={shopProductsRef} sx={{ mt: 3 }}>
              <ShopProductsSection
                sellerOpenId={productDetail.sellerOpenId}
                currentProductId={offerId}
                sellerName={productDetail.sellerName || productDetail.sellerLoginId}
              />
            </Box>
          )}
      </Container>

      {/* 가격 계산기 모달 */}
      <PriceCalculator
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        productDetail={productDetail}
        selectedSku={selectedSku}
        selectedSkus={selectedSkus}
        quantity={quantity}
      />

      {/* 장바구니 추가 다이얼로그 */}
      <AddToCartDialog
        open={cartOptionsDialog}
        onClose={() => setCartOptionsDialog(false)}
        cartOptions={cartOptions}
        onCartOptionsChange={setCartOptions}
        onConfirm={() => {
          // 장바구니 추가 로직
          setCartOptionsDialog(false);
        }}
        loading={addingToCart}
      />

      {/* 공통 알림 스낵바 */}
      <Snackbar
        open={snackbarMsg.open}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg({ ...snackbarMsg, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarMsg({ ...snackbarMsg, open: false })}
          severity={snackbarMsg.severity}
          sx={{ width: '100%' }}
        >
          {snackbarMsg.message}
        </Alert>
      </Snackbar>

      {/* 이미지 번역 모달 */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: 'blur(3px)' }
        }}
      >
        <Fade in={imageModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
              maxWidth: '1200px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 0,
              overflow: 'auto'
            }}
          >
            {/* 닫기 버튼 */}
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                zIndex: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* 번역된 이미지 */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#000'
              }}
            >
              <img
                src={modalImageUrl}
                alt="번역된 이미지"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Footer />
    </PageContainer>
  );
}