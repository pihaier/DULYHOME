'use client';

import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import Image from 'next/image';
import type { Product1688 } from '../../types';

interface ProductCardProps {
  product: Product1688;
  onDetailClick?: (offerId: number) => void;
  onInquiryClick?: (product: Product1688) => void;
  onFindSimilar?: (imageUrl: string) => void;
}

function ProductCard({ product, onDetailClick, onInquiryClick, onFindSimilar }: ProductCardProps) {
  const router = useRouter();

  const handleDetailClick = () => {
    if (onDetailClick) {
      onDetailClick(product.offerId);
    } else {
      // 기본 동작: 상품 상세 페이지로 이동
      router.push(`/1688/product/${product.offerId}`);
    }
  };

  const handleInquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInquiryClick) {
      onInquiryClick(product);
    }
  };

  const handleFindSimilar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFindSimilar) {
      onFindSimilar(product.imageUrl);
    } else {
      // 기본 동작: 새 탭에서 검색 페이지 열기
      window.open(`/1688/search-v2?imageAddress=${encodeURIComponent(product.imageUrl)}`, '_blank');
    }
  };

  // 가격 표시 (1개 구매가격 우선 표시)
  const price = product.priceInfo?.price ? parseFloat(product.priceInfo.price) : null;
  const consignPrice = product.priceInfo?.consignPrice ? parseFloat(product.priceInfo.consignPrice) : null;
  
  // 1개 구매 가능하고 consignPrice가 있으면 두 가격 모두 표시
  const displayPrice = product.isOnePsale && consignPrice
    ? `¥${consignPrice.toFixed(2)} (도매: ¥${price?.toFixed(2)})`
    : price 
    ? `¥${price.toFixed(2)}`
    : '가격 문의';

  // 재구매율 표시 (이미 "12%" 형태로 옴)
  const repurchaseRate = product.repurchaseRate;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        }
      }}
      onClick={handleDetailClick}
    >
      <Box sx={{ position: 'relative', height: 200 }}>
        <Image
          src={product.imageUrl}
          alt={product.subjectTrans || product.subject}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Tooltip title="유사 상품 찾기">
          <IconButton
            onClick={handleFindSimilar}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
              },
              boxShadow: 1,
            }}
            size="small"
          >
            <ImageSearchIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* 제품명 */}
        <Typography 
          variant="body2" 
          gutterBottom
          sx={{
            minHeight: '40px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1,
          }}
        >
          {product.subjectTrans || product.subject}
        </Typography>

        {/* 가격 정보 */}
        <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
          {displayPrice}
        </Typography>

        {/* 판매 정보 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {product.monthSold > 0 && (
            <Typography variant="caption" color="text.secondary">
              월판매: {product.monthSold.toLocaleString()}개
            </Typography>
          )}
          {repurchaseRate && (
            <Typography variant="caption" color="text.secondary">
              재구매율: {repurchaseRate}
            </Typography>
          )}
        </Box>

        {/* 태그 */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          {product.isJxhy && (
            <Chip label="우수공급업체" size="small" color="primary" />
          )}
          {product.isOnePsale && (
            <Chip label="1개 구매가능" size="small" color="success" />
          )}
          {product.sellerIdentities?.includes('manufacturer') && (
            <Chip label="공장인증" size="small" color="info" />
          )}
          {product.sellerIdentities?.includes('powerful_merchants') && (
            <Chip label="파워셀러" size="small" color="warning" />
          )}
          {product.sellerIdentities?.includes('tp_member') && (
            <Chip label="신뢰업체" size="small" variant="outlined" />
          )}
        </Box>

        {/* 액션 버튼 */}
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={handleInquiryClick}
          sx={{ mt: 'auto' }}
        >
          문의하기
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(ProductCard);