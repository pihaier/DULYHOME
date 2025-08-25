'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Rating,
  Alert,
  TextField,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Drawer,
  Snackbar,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FactoryIcon from '@mui/icons-material/Factory';
import ChatIcon from '@mui/icons-material/Chat';
import BrushIcon from '@mui/icons-material/Brush';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import CloseIcon from '@mui/icons-material/Close';

interface ProductInfoProps {
  productDetail: any;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  selectedSku?: any;
  selectedAttributes?: { [key: string]: string };
  onAttributeSelect?: (attributeName: string, value: string) => void;
  onAddToCart?: () => void;
  onOpenCalculator: () => void;
  onFindSimilar?: () => void;
  user?: any;
}

// ChatPanel 동적 import
const ChatPanel = React.lazy(() => import('@/app/dashboard/orders/_components/ChatPanel'));

export default function ProductInfo({ 
  productDetail, 
  quantity,
  onQuantityChange,
  selectedSku,
  selectedAttributes,
  onAttributeSelect,
  onAddToCart,
  onOpenCalculator,
  onFindSimilar,
  user
}: ProductInfoProps) {
  const router = useRouter();
  const [chatDialog, setChatDialog] = useState(false);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [tempSelectedSku, setTempSelectedSku] = useState(selectedSku);
  const [tempQuantity, setTempQuantity] = useState(quantity);
  const [tempSelectedAttributes, setTempSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loginAlert, setLoginAlert] = useState(false);
  
  // 모달이 열릴 때 현재 선택된 SKU와 수량을 임시 상태에 동기화
  useEffect(() => {
    if (skuModalOpen) {
      setTempSelectedSku(selectedSku);
      setTempQuantity(quantity);
      // 선택된 SKU의 속성을 tempSelectedAttributes에 설정
      if (selectedSku) {
        const attrs = {};
        selectedSku.skuAttributes?.forEach((attr: any) => {
          attrs[attr.attributeNameTrans || attr.attributeName] = attr.value;
        });
        setTempSelectedAttributes(attrs);
      }
    }
  }, [skuModalOpen, selectedSku, quantity]);
  
  // 선택된 속성들로 SKU 찾기
  useEffect(() => {
    if (Object.keys(tempSelectedAttributes).length > 0) {
      const matchingSku = productDetail?.productSkuInfos?.find((sku: any) => {
        // SKU의 모든 속성이 선택된 속성과 일치하는지 확인
        return sku.skuAttributes?.every((attr: any) => {
          const attrName = attr.attributeNameTrans || attr.attributeName;
          return tempSelectedAttributes[attrName] === attr.value;
        });
      });
      
      if (matchingSku) {
        setTempSelectedSku(matchingSku);
      }
    }
  }, [tempSelectedAttributes, productDetail]);
  
  if (!productDetail) return null;

  // 현재 가격 계산
  const getCurrentPrice = () => {
    if (!productDetail.productSaleInfo) return { price: '0', promotionPrice: null };
    
    const priceRanges = productDetail.productSaleInfo.priceRangeList;
    if (!priceRanges || priceRanges.length === 0) return { price: '0', promotionPrice: null };
    
    // SKU가 선택된 경우 SKU 가격 사용
    if (selectedSku && selectedSku.price) {
      return { 
        price: selectedSku.price, 
        promotionPrice: selectedSku.promotionPrice 
      };
    }
    
    // 수량에 따른 구간 가격
    for (let i = priceRanges.length - 1; i >= 0; i--) {
      if (quantity >= priceRanges[i].startQuantity) {
        return {
          price: priceRanges[i].price,
          promotionPrice: priceRanges[i].promotionPrice,
        };
      }
    }
    
    return {
      price: priceRanges[0].price,
      promotionPrice: priceRanges[0].promotionPrice,
    };
  };

  const [isFavorite, setIsFavorite] = React.useState(false);
  const currentPrice = getCurrentPrice();

  return (
    <Box>
      {/* 제목 */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {productDetail.subjectTrans}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {productDetail.subject}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() =>
                window.open(
                  `https://detail.1688.com/offer/${productDetail.offerId}.html`,
                  '_blank'
                )
              }
              fullWidth
              color="primary"
            >
              1688에서 보기
            </Button>
          </Stack>
        </Stack>
      </Box>


      {/* 태그 */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {productDetail.isJxhy && (
          <Chip label="프리미엄 상품" size="small" color="error" />
        )}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'isOnePsale')?.value && (
          <Chip label="드롭시핑" size="small" color="primary" />
        )}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'isSupportMix')?.value && (
          <Chip label="혼합 구매 가능" size="small" color="info" />
        )}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'isOnePsaleFreePostage')
          ?.value && <Chip label="드롭시핑 무료배송" size="small" color="success" />}
        {productDetail.tagInfoList?.find((t: any) => t.key === '1688_yx')?.value && (
          <Chip label="1688 우수상품" size="small" color="warning" icon={<VerifiedIcon />} />
        )}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'isQqyx')?.value && (
          <Chip label="QQ 우수상품" size="small" color="info" />
        )}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'select')?.value && (
          <Chip label="추천 상품" size="small" color="success" />
        )}
        {productDetail.supplierModel?.isTp && (
          <Chip label="타오바오 회원" size="small" color="primary" />
        )}
        {productDetail.offerIdentities?.includes('super_factory') && (
          <Chip label="슈퍼 팩토리" size="small" color="warning" icon={<FactoryIcon />} />
        )}
        {productDetail.offerIdentities?.includes('tp_member') && (
          <Chip label="TP 회원" size="small" color="success" icon={<VerifiedIcon />} />
        )}
        {/* 7일 무조건 반품 */}
        {productDetail.tagInfoList?.find((t: any) => t.key === 'noReason7DReturn')?.value && (
          <Chip label="7일 이내 이유 없이 반품 가능" size="small" color="secondary" />
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* 가격 정보 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          가격 정보
        </Typography>
        
        {/* 현재 가격 */}
        <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 2 }}>
          {currentPrice.promotionPrice ? (
            <>
              <Typography variant="h4" color="error" fontWeight="bold">
                ¥{currentPrice.promotionPrice}
              </Typography>
              <Typography variant="h6" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                ¥{currentPrice.price}
              </Typography>
            </>
          ) : (
            <Typography variant="h4" color="primary" fontWeight="bold">
              ¥{currentPrice.price}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            (₩{Math.floor(parseFloat(currentPrice.promotionPrice || currentPrice.price) * 203).toLocaleString()})
          </Typography>
        </Stack>

        {/* 구간별 가격 */}
        {productDetail.productSaleInfo?.priceRangeList && productDetail.productSaleInfo.priceRangeList.length > 1 && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              구간별 가격:
            </Typography>
            <Stack spacing={1}>
              {productDetail.productSaleInfo.priceRangeList.map((range: any, index: number) => (
                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    {range.startQuantity}개 이상
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color={quantity >= range.startQuantity ? 'primary' : 'text.secondary'}>
                    ¥{range.price}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* 기본 정보 */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
            최소 주문:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {productDetail.minOrderQuantity || 1}조각
          </Typography>
        </Stack>
        {productDetail.createDate && (
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              등록일:
            </Typography>
            <Typography variant="body2">
              {new Date(productDetail.createDate).toLocaleDateString('ko-KR')}
            </Typography>
          </Stack>
        )}
        {productDetail.tradeScore && (
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              거래 점수:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={parseFloat(productDetail.tradeScore)} readOnly size="small" precision={0.1} />
              <Typography variant="body2">({productDetail.tradeScore})</Typography>
            </Stack>
          </Stack>
        )}
        {productDetail.productCargoNumber && (
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              화물번호:
            </Typography>
            <Typography variant="body2">
              {productDetail.productCargoNumber}
            </Typography>
          </Stack>
        )}
        {productDetail.productShippingInfo?.freightInfo?.deliveryFeeTemplateId && (
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              화물번호:
            </Typography>
            <Typography variant="body2">
              {productDetail.productShippingInfo.freightInfo.deliveryFeeTemplateId}
            </Typography>
          </Stack>
        )}
        {productDetail.productShippingInfo?.sendGoodsAddressText && (
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <LocalShippingIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                배송지:
              </Typography>
              <Typography variant="body2">
                {productDetail.productShippingInfo.sendGoodsAddressText}
              </Typography>
            </Box>
          </Stack>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* 수량 선택 - SKU가 없는 경우에만 표시 */}
      {(!productDetail.productSkuInfos || productDetail.productSkuInfos.length === 0) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            수량 선택
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <ButtonGroup size="small">
              <Button 
                onClick={() => onQuantityChange(-1)}
                disabled={quantity <= (productDetail.minOrderQuantity || 1)}
              >
                <RemoveIcon />
              </Button>
              <Button disabled sx={{ minWidth: 80 }}>
                {quantity}
              </Button>
              <Button onClick={() => onQuantityChange(1)}>
                <AddIcon />
              </Button>
            </ButtonGroup>
            <Typography variant="body2" color="text.secondary">
              재고: {productDetail.productSaleInfo?.amountOnSale || '충분'}
            </Typography>
          </Stack>
        </Box>
      )}

      {/* 액션 버튼 - 데스크톱에서만 표시 */}
      <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<CalculateIcon />}
            onClick={onOpenCalculator}
          >
            원가 계산기
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={onAddToCart}
            disabled={!selectedSku && productDetail.productSkuInfos?.length > 0}
          >
            장바구니 담기
          </Button>
          <IconButton 
            size="large" 
            onClick={() => setIsFavorite(!isFavorite)}
            color={isFavorite ? 'error' : 'default'}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>
        
        {/* 장바구니 보기 버튼 */}
        <Button
          variant="outlined"
          size="large"
          fullWidth
          color="secondary"
          startIcon={<ListAltIcon />}
          onClick={() => window.location.href = '/dashboard/1688/cart'}
        >
          장바구니 보기
        </Button>
        
        {/* 유사 상품 찾기 버튼 */}
        <Button
          variant="outlined"
          size="large"
          fullWidth
          color="info"
          startIcon={<ImageSearchIcon />}
          onClick={onFindSimilar}
        >
          유사 상품 찾기
        </Button>
        
        {/* 맞춤 제작 문의 버튼 */}
        <Button
          variant="outlined"
          size="large"
          fullWidth
          color="primary"
          startIcon={<BrushIcon />}
          onClick={() => {
            const params = new URLSearchParams({
              offerId: productDetail.offerId?.toString() || '',
              productName: productDetail.subjectTrans || productDetail.subject || '',
              productUrl: `https://detail.1688.com/offer/${productDetail.offerId}.html`,
              productImage: productDetail.productImage?.images?.[0] || '',
            });
            
            // 선택된 SKU 정보 추가
            if (selectedSku) {
              // SKU 속성 정보를 문자열로 변환
              const skuInfo = selectedSku.skuAttributes?.map((attr: any) => 
                `${attr.attributeNameTrans || attr.attributeName}: ${attr.valueTrans || attr.value}`
              ).join(', ');
              
              if (skuInfo) {
                params.append('selectedSku', skuInfo);
              }
              
              // SKU 가격 정보 추가
              if (selectedSku.price) {
                params.append('skuPrice', selectedSku.price);
              }
            }
            
            // 선택된 속성 정보 추가 (SKU가 없는 경우)
            if (!selectedSku && selectedAttributes && Object.keys(selectedAttributes).length > 0) {
              const attrInfo = Object.entries(selectedAttributes)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              params.append('selectedOptions', attrInfo);
            }
            
            // 수량 정보 추가
            if (quantity && quantity > 1) {
              params.append('quantity', quantity.toString());
            }
            
            window.location.href = `/application/market-research?${params.toString()}`;
          }}
        >
          맞춤 제작 문의 (로고/포장/샘플)
        </Button>
        
        {/* 제품 문의하기 채팅 버튼 */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          color="info"
          startIcon={<ChatIcon />}
          onClick={() => {
            if (!user) {
              setLoginAlert(true);
              // 2초 후 로그인 페이지로 리다이렉트
              setTimeout(() => {
                router.push('/auth/customer/login?redirect=' + encodeURIComponent(window.location.pathname));
              }, 2000);
            } else {
              setChatDialog(true);
            }
          }}
        >
          제품 문의하기
        </Button>
      </Stack>

      {/* 모바일 하단 고정 버튼 - 타오바오 스타일 - 모달이 열려있으면 숨김 */}
      {!skuModalOpen && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            padding: '8px 12px',
            zIndex: 1300,
            gap: 1,
            alignItems: 'center',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }}
        >
        {/* 왼쪽 아이콘 버튼들 */}
        <Stack direction="row" spacing={0.5} sx={{ flex: '0 0 auto' }}>
          <IconButton 
            onClick={onOpenCalculator}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              padding: '6px',
              bgcolor: 'white',
            }}
          >
            <CalculateIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton 
            onClick={() => setChatDialog(true)}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              padding: '6px',
              bgcolor: 'white',
            }}
          >
            <ChatIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        {/* 오른쪽 액션 버튼들 */}
        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/dashboard/1688/cart'}
            sx={{
              flex: 1,
              height: '36px',
              fontSize: '13px',
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            장바구니
          </Button>
          <Button
            variant="contained"
            onClick={() => setSkuModalOpen(true)} // 모달 열기로 변경
            sx={{
              flex: 1.5,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              height: '36px',
              fontSize: '13px',
            }}
          >
            담기
          </Button>
        </Stack>
        </Box>
      )}

      {/* 채팅 다이얼로그 */}
      <Dialog
        open={chatDialog}
        onClose={() => setChatDialog(false)}
        fullWidth
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            maxHeight: '600px'
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatIcon color="info" />
            <Box>
              <Typography variant="h6">제품 문의</Typography>
              <Typography variant="caption" color="text.secondary">
                {productDetail?.subjectTrans}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          }>
            {chatDialog && productDetail && (
              <ChatPanel
                reservationNumber={`PROD-${productDetail.offerId}`}
                currentUserId={undefined}
                currentUserRole={undefined}
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>


      {/* 판매자 정보 - sellerDataInfo 사용 */}
      {productDetail.sellerDataInfo && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <StorefrontIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2">판매자 정보</Typography>
            </Stack>
            <Stack spacing={1}>
              {productDetail.sellerDataInfo.tradeMedalLevel && (
                <Typography variant="caption" color="text.secondary">
                  거래 메달 레벨 {productDetail.sellerDataInfo.tradeMedalLevel}
                </Typography>
              )}
              {productDetail.sellerDataInfo.compositeServiceScore && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating 
                    value={parseFloat(productDetail.sellerDataInfo.compositeServiceScore)} 
                    readOnly 
                    size="small" 
                    precision={0.1}
                  />
                  <Typography variant="caption">
                    종합 점수 ({productDetail.sellerDataInfo.compositeServiceScore})
                  </Typography>
                </Stack>
              )}
              {productDetail.sellerDataInfo.repeatPurchasePercent && (
                <Typography variant="caption" color="text.secondary">
                  재구매율: {(parseFloat(productDetail.sellerDataInfo.repeatPurchasePercent) * 100).toFixed(1)}%
                </Typography>
              )}
            </Stack>
          </Box>
        </>
      )}

      {/* SKU 선택 모달 - 타오바오 스타일 */}
      <Drawer
        anchor="bottom"
        open={skuModalOpen}
        onClose={() => setSkuModalOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* 헤더 */}
          <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
            <Box
              component="img"
              src={(() => {
                // 현재 선택된 속성에서 이미지가 있는 속성 찾기
                for (const [key, value] of Object.entries(tempSelectedAttributes)) {
                  // 모든 SKU를 순회하면서 해당 값을 가진 속성의 이미지 찾기
                  for (const sku of productDetail.productSkuInfos || []) {
                    const attr = sku.skuAttributes?.find((a: any) => 
                      a.value === value && a.skuImageUrl
                    );
                    if (attr?.skuImageUrl) {
                      return `/api/1688/image-proxy?url=${encodeURIComponent(attr.skuImageUrl)}`;
                    }
                  }
                }
                // 기본 이미지
                return productDetail.productImage?.images?.[0] ? 
                  `/api/1688/image-proxy?url=${encodeURIComponent(productDetail.productImage.images[0])}` : 
                  '/images/products/s1.jpg';
              })()}
              onClick={(e) => {
                const currentSrc = (e.target as HTMLImageElement).src;
                setSelectedImage(currentSrc);
                setImageModalOpen(true);
              }}
              sx={{
                width: 150,
                height: 150,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                }
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="error">
                ¥{tempSelectedSku?.price || tempSelectedSku?.consignPrice || productDetail.productSaleInfo?.priceRangeList?.[0]?.price || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                재고: {tempSelectedSku?.amountOnSale || productDetail.productSaleInfo?.amountOnSale || '충분'}
              </Typography>
              {Object.keys(tempSelectedAttributes).length > 0 && (
                <Typography variant="caption" color="primary">
                  선택: {Object.entries(tempSelectedAttributes).map(([key, value]) => {
                    // 값에 대한 번역 찾기
                    const allAttrs = new Set();
                    productDetail.productSkuInfos?.forEach((sku: any) => {
                      sku.skuAttributes?.forEach((attr: any) => {
                        if (attr.value === value) {
                          allAttrs.add(attr.valueTrans || attr.value);
                        }
                      });
                    });
                    return Array.from(allAttrs)[0] || value;
                  }).join(' / ')}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setSkuModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* SKU 옵션들 */}
          {productDetail.productSkuInfos && productDetail.productSkuInfos.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {/* SKU 속성별로 그룹화하여 표시 */}
              {(() => {
                const attributeGroups: { [key: string]: Set<any> } = {};
                
                productDetail.productSkuInfos.forEach((sku: any) => {
                  sku.skuAttributes?.forEach((attr: any) => {
                    const key = attr.attributeNameTrans || attr.attributeName;
                    if (!attributeGroups[key]) {
                      attributeGroups[key] = new Set();
                    }
                    attributeGroups[key].add(JSON.stringify({
                      value: attr.value,
                      valueTrans: attr.valueTrans,
                      skuImageUrl: attr.skuImageUrl
                    }));
                  });
                });

                return Object.entries(attributeGroups).map(([attrName, values]) => (
                  <Box key={attrName} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {attrName}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {Array.from(values).map((valueStr) => {
                        const attr = JSON.parse(valueStr);
                        const isSelected = tempSelectedAttributes[attrName] === attr.value;
                        
                        return (
                          <Chip
                            key={attr.value}
                            label={attr.valueTrans || attr.value}
                            onClick={() => {
                              // 해당 속성 업데이트
                              setTempSelectedAttributes(prev => ({
                                ...prev,
                                [attrName]: attr.value
                              }));
                            }}
                            variant={isSelected ? 'filled' : 'outlined'}
                            color={isSelected ? 'primary' : 'default'}
                            sx={{
                              borderRadius: 1,
                              height: attr.skuImageUrl ? 60 : 32,
                              ...(attr.skuImageUrl && {
                                '& .MuiChip-label': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                },
                              }),
                            }}
                            icon={attr.skuImageUrl ? (
                              <Box
                                component="img"
                                src={`/api/1688/image-proxy?url=${encodeURIComponent(attr.skuImageUrl)}`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 0.5,
                                }}
                              />
                            ) : undefined}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                ));
              })()}
            </Box>
          )}

          {/* 수량 선택 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              수량
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <ButtonGroup size="small">
                <Button onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}>
                  <RemoveIcon />
                </Button>
                <TextField
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(parseInt(e.target.value) || 1)}
                  size="small"
                  sx={{ width: 80 }}
                  inputProps={{ style: { textAlign: 'center' } }}
                />
                <Button onClick={() => setTempQuantity(tempQuantity + 1)}>
                  <AddIcon />
                </Button>
              </ButtonGroup>
            </Stack>
          </Box>

          {/* 하단 확인 버튼 */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              // 선택된 속성들로 최종 SKU 찾기
              let finalSku = tempSelectedSku;
              
              if (Object.keys(tempSelectedAttributes).length > 0) {
                const matchingSku = productDetail.productSkuInfos?.find((sku: any) => {
                  return sku.skuAttributes?.every((attr: any) => {
                    const attrName = attr.attributeNameTrans || attr.attributeName;
                    return tempSelectedAttributes[attrName] === attr.value;
                  });
                });
                if (matchingSku) {
                  finalSku = matchingSku;
                }
              }
              
              // 선택한 SKU와 수량을 적용
              if (finalSku) {
                onAttributeSelect?.('selectedSku', finalSku);
              }
              onQuantityChange(tempQuantity - quantity);
              onAddToCart?.();
              setSkuModalOpen(false);
            }}
            disabled={productDetail.productSkuInfos?.length > 0 && Object.keys(tempSelectedAttributes).length === 0}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              height: '48px',
            }}
          >
            확인
          </Button>
        </Box>
      </Drawer>

      {/* 이미지 확대 모달 */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            m: 1,
          },
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              backgroundColor: 'black',
            }}
          >
            <Box
              component="img"
              src={selectedImage}
              alt="Product Large"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* 로그인 필요 알림 */}
      <Snackbar
        open={loginAlert}
        autoHideDuration={2000}
        onClose={() => setLoginAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setLoginAlert(false)}>
          문의하기 기능은 로그인이 필요합니다. 로그인 페이지로 이동합니다...
        </Alert>
      </Snackbar>
    </Box>
  );
}