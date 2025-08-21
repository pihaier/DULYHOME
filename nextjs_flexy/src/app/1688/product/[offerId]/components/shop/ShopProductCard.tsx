'use client';

import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';

// 환율 상수 (실제로는 환경변수나 API에서 가져와야 함)
const EXCHANGE_RATE = 203;

interface ShopProduct {
  imageUrl: string;
  subject: string;
  subjectTrans: string;
  offerId: string;
  priceInfo: {
    price: string;
    consignPrice: string;
  };
  monthSold: number;
  repurchaseRate: string;
  isJxhy: boolean;
  isOnePsale: boolean;
}

interface ShopProductCardProps {
  product: ShopProduct;
}

export default function ShopProductCard({ product }: ShopProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // 새 탭에서 상품 상세 페이지 열기
    window.open(`/1688/product/${product.offerId}`, '_blank');
  };

  // 이미지 프록시 처리
  const proxyImageUrl = `/api/1688/image-proxy?url=${encodeURIComponent(product.imageUrl)}`;

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
      onClick={handleClick}
    >
      {/* 상품 이미지 */}
      <CardMedia
        component="img"
        height="200"
        image={proxyImageUrl}
        alt={product.subjectTrans}
        sx={{
          objectFit: 'cover',
        }}
      />
      
      <CardContent sx={{ p: 1.5 }}>
        {/* 상품 제목 */}
        <Typography 
          variant="body2" 
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5em',
            mb: 1,
          }}
        >
          {product.subjectTrans}
        </Typography>

        {/* 가격 정보 */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ¥{product.priceInfo.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ₩{(parseFloat(product.priceInfo.price) * EXCHANGE_RATE).toLocaleString('ko-KR')}
          </Typography>
          {product.priceInfo.consignPrice && product.priceInfo.consignPrice !== product.priceInfo.price && (
            <Typography variant="caption" color="text.secondary">
              드롭쉬핑: ¥{product.priceInfo.consignPrice} 
              (₩{(parseFloat(product.priceInfo.consignPrice) * EXCHANGE_RATE).toLocaleString('ko-KR')})
            </Typography>
          )}
        </Box>

        {/* 판매 정보 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            30일 판매: {product.monthSold}개
          </Typography>
          <Typography variant="caption" color="text.secondary">
            재구매율: {product.repurchaseRate}
          </Typography>
        </Box>

        {/* 태그 */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {product.isJxhy && (
            <Chip 
              label="정선화원" 
              size="small" 
              color="primary" 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
          {product.isOnePsale && (
            <Chip 
              label="일건대발" 
              size="small" 
              color="success" 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}