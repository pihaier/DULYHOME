'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, Rating, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShieldIcon from '@mui/icons-material/Shield';

interface SupplierInfoProps {
  productDetail: any;
  onViewOtherProducts?: () => void;
}

export default function SupplierInfo({ productDetail, onViewOtherProducts }: SupplierInfoProps) {
  // API 실제 필드명에 맞게 수정
  const sellerData = productDetail?.sellerDataInfo || {};
  const sellerMixSetting = productDetail?.sellerMixSetting || {};
  const soldOut = productDetail?.soldOut || 0;
  const tagInfo = productDetail?.tagInfoList || [];
  
  // 태그 정보를 이해하기 쉽게 매핑
  const tagMap: { [key: string]: string } = {
    isOnePsale: '일반 판매',
    isSupportMix: '혼합 주문 지원',
    isOnePsaleFreePostage: '무료 배송',
    noReason7DReturn: '7일 무조건 반품',
    '1688_yx': '1688 우수 상품',
    isQqyx: 'QQ 우수 상품',
    select: '엄선 상품'
  };
  
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          공급업체 정보
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 태그 정보 */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {tagInfo.map((tag: any, index: number) => {
              if (tag.value) {
                return (
                  <Chip
                    key={index}
                    icon={tag.key === 'isSupportMix' ? <ShieldIcon /> : 
                          tag.key === 'isOnePsaleFreePostage' ? <LocalShippingIcon /> :
                          tag.key === '1688_yx' ? <VerifiedIcon /> : 
                          tag.key === 'select' ? <WorkspacePremiumIcon /> : undefined}
                    label={tagMap[tag.key] || tag.key}
                    size="small"
                    color={tag.key === '1688_yx' || tag.key === 'select' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                );
              }
              return null;
            })}
          </Box>
        </Grid>

        {/* 판매자 점수 정보 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              판매자 서비스 점수
            </Typography>

            {/* 서비스 점수 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={parseFloat(sellerData.compositeServiceScore || '0')}
                readOnly
                precision={0.1}
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                종합 점수: {sellerData.compositeServiceScore || '0'}
              </Typography>
            </Box>

            {/* 재구매율 */}
            {sellerData.repeatPurchasePercent && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                재구매율: {(parseFloat(sellerData.repeatPurchasePercent) * 100).toFixed(1)}%
              </Typography>
            )}

            {/* 48시간 내 수금율 */}
            {sellerData.collect30DayWithin48HPercent && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                48시간 내 결제율: {(parseFloat(sellerData.collect30DayWithin48HPercent) * 100).toFixed(0)}%
              </Typography>
            )}
          </Box>
        </Grid>

        {/* 평가 정보 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="subtitle2" gutterBottom>
              거래 메달 레벨: {sellerData.tradeMedalLevel || '0'}
            </Typography>
            
            {/* 총 판매량 */}
            <Typography variant="h6" color="primary.main" gutterBottom>
              총 판매: {soldOut}개
            </Typography>

            {/* 혼합 주문 정보 */}
            {sellerMixSetting.generalHunpi && (
              <Typography variant="body2" color="text.secondary">
                최소 혼합: {sellerMixSetting.mixNumber}개 / ¥{sellerMixSetting.mixAmount}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* 업체 통계 */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {sellerData.logisticsExperienceScore || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              물류 서비스
            </Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {sellerData.afterSalesExperienceScore || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              애프터 서비스
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {sellerData.offerExperienceScore || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              상품 품질
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {sellerData.consultingExperienceScore || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              상담 서비스
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {sellerData.disputeComplaintScore || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              분쟁 처리
            </Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {(parseFloat(sellerData.qualityRefundWithin30Day || '0') * 100).toFixed(2)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              30일 내 품질 환불률
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="error.main">
              레벨 {sellerData.tradeMedalLevel || '0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              거래 메달
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {(parseFloat(sellerData.collect30DayWithin48HPercent || '0') * 100).toFixed(0)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              48시간 내 결제율
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {onViewOtherProducts && (
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={onViewOtherProducts}
            fullWidth
            sx={{ 
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            판매자의 다른 상품 보기
          </Button>
        </Box>
      )}
    </Paper>
  );
}