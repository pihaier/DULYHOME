'use client';

import React, { useState, Suspense } from 'react';
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
  CircularProgress,
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
  onFindSimilar 
}: ProductInfoProps) {
  const [chatDialog, setChatDialog] = useState(false);
  
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

  const currentPrice = getCurrentPrice();
  const [isFavorite, setIsFavorite] = React.useState(false);

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

      {/* 카테고리 */}
      {(productDetail.categoryId || productDetail.categoryName || productDetail.topCategoryId) && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              카테고리:
            </Typography>
            {productDetail.topCategoryId && productDetail.secondCategoryId && productDetail.thirdCategoryId ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Chip label={`1차: ${productDetail.topCategoryId}`} size="small" variant="outlined" />
                <Typography variant="caption">›</Typography>
                <Chip label={`2차: ${productDetail.secondCategoryId}`} size="small" variant="outlined" />
                <Typography variant="caption">›</Typography>
                <Chip label={`3차: ${productDetail.thirdCategoryId}`} size="small" variant="outlined" />
              </Stack>
            ) : (
              <Chip 
                label={productDetail.categoryName || `카테고리 ID: ${productDetail.categoryId}`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>
      )}

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
        {/* 추가 태그 표시 */}
        {productDetail.tagInfoList?.filter((t: any) => 
          !['isOnePsale', 'isSupportMix', 'isOnePsaleFreePostage', '1688_yx', 'isQqyx', 'select'].includes(t.key)
        ).map((tag: any, index: number) => (
          <Chip 
            key={index} 
            label={tag.name || tag.key} 
            size="small" 
            variant="outlined"
            title={tag.value?.toString()}
          />
        ))}
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

      {/* 액션 버튼 */}
      <Stack spacing={2}>
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
          onClick={() => setChatDialog(true)}
        >
          제품 문의하기
        </Button>
      </Stack>

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
    </Box>
  );
}