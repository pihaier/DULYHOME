'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Rating,
  Divider,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TranslateIcon from '@mui/icons-material/Translate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ProductDescriptionProps {
  productDetail: any;
  onTranslateDescription: () => void;
  isTranslatingDescription: boolean;
  translatedDescription: string | null;
  onTranslateImage: (imageUrl: string) => void;
  translatingImage: string | null;
  translatedImages: Record<string, string>;
}

export default function ProductDescription({
  productDetail,
  onTranslateDescription,
  isTranslatingDescription,
  translatedDescription,
  onTranslateImage,
  translatingImage,
  translatedImages,
}: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!productDetail) return null;

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="상품 상세" />
        <Tab label="상품 속성" />
        <Tab label="배송 정보" />
        <Tab label="거래 기록" />
        <Tab label="평가" />
      </Tabs>

      <Box sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        {activeTab === 0 && (
          <>
            {/* 번역 버튼과 안내 */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={isTranslatingDescription ? <CircularProgress size={20} /> : <TranslateIcon />}
                onClick={onTranslateDescription}
                disabled={isTranslatingDescription || !!translatedDescription}
                color="primary"
              >
                {isTranslatingDescription ? '번역 중...' : translatedDescription ? '번역 완료' : '상품 설명 한글 번역'}
              </Button>
              
              <Alert severity="info" icon={<TranslateIcon />}>
                상품 설명의 이미지를 클릭하면 한글로 번역된 이미지를 볼 수 있습니다
              </Alert>
            </Stack>
            
            {/* 번역 중 메시지 */}
            {translatingImage && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                이미지 번역 중...
              </Alert>
            )}
            
            {/* 번역된 텍스트 표시 */}
            {translatedDescription && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  📝 번역된 상품 설명
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {translatedDescription}
                </Typography>
              </Paper>
            )}
            
            <Box
              className="product-description"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'IMG') {
                  const img = target as HTMLImageElement;
                  onTranslateImage(img.src);
                }
              }}
              dangerouslySetInnerHTML={{ __html: productDetail.description }}
              sx={{
                width: '100%',
                '& img': {
                  width: '100% !important',
                  maxWidth: '100% !important',
                  height: 'auto !important',
                  display: 'block !important',
                  margin: '0 auto !important',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                  },
                },
                '& p': {
                  margin: '10px 0',
                  padding: '0 10px',
                  wordBreak: 'break-word',
                  fontSize: { xs: '14px', sm: '16px' },
                  lineHeight: 1.6,
                },
                '& *': {
                  maxWidth: '100%',
                },
              }}
            />
          </>
        )}

        {activeTab === 1 && (
          <TableContainer>
            <Table>
              <TableBody>
                {productDetail.productAttribute?.map((attr: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{attr.attributeNameTrans || attr.attributeName}</TableCell>
                    <TableCell>{attr.valueTrans || attr.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              배송 정보
            </Typography>
            
            <Stack spacing={3}>
              {/* 배송 보장 정보 */}
              {productDetail.productShippingInfo?.shippingTimeGuarantee && (
                <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LocalShippingIcon color="success" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {productDetail.productShippingInfo.shippingTimeGuarantee === 'shipIn48Hours' 
                          ? '48시간 내 발송 보장' 
                          : '빠른 배송 보장'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        판매자가 약속한 시간 내에 발송을 보장합니다
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* 포장 정보 */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  기본 포장 정보
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        가로
                      </Typography>
                      <Typography variant="body1">
                        {productDetail.productShippingInfo?.width ? `${productDetail.productShippingInfo.width} cm` : '미제공'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        세로
                      </Typography>
                      <Typography variant="body1">
                        {productDetail.productShippingInfo?.length ? `${productDetail.productShippingInfo.length} cm` : '미제공'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        높이
                      </Typography>
                      <Typography variant="body1">
                        {productDetail.productShippingInfo?.height ? `${productDetail.productShippingInfo.height} cm` : '미제공'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        무게
                      </Typography>
                      <Typography variant="body1">
                        {productDetail.productShippingInfo?.weight ? `${productDetail.productShippingInfo.weight} kg` : '미제공'}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* SKU별 포장 정보 */}
              {productDetail.productShippingInfo?.skuShippingDetails && 
               productDetail.productShippingInfo.skuShippingDetails.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    SKU별 포장 정보
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {productDetail.productShippingInfo.skuShippingDetails.map((detail: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{detail.skuName || `SKU ${idx + 1}`}</TableCell>
                            <TableCell align="center">{detail.width || '-'} cm</TableCell>
                            <TableCell align="center">{detail.length || '-'} cm</TableCell>
                            <TableCell align="center">{detail.height || '-'} cm</TableCell>
                            <TableCell align="center">{detail.weight || '-'} kg</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* 배송 방식 정보 */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  배송 방식
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">
                      중국 내 배송: 판매자 → 항저우 창고
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">
                      국제 배송: 항저우 → 한국 (해운/항공)
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">
                      통관 및 국내 배송 대행 가능
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Alert severity="info">
                실제 배송비는 구매 수량, 배송 방법, 최종 목적지에 따라 달라질 수 있습니다.
                정확한 배송비는 가격 계산기를 통해 확인하세요.
              </Alert>
            </Stack>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              거래 정보
            </Typography>
            
            <Stack spacing={3}>
              {/* 판매량 정보 */}
              <Paper sx={{ p: 2, bgcolor: '#f8f8f8' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    총 판매량
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {productDetail.soldOut || '0'}개
                  </Typography>
                </Stack>
              </Paper>

              {/* 거래 점수 */}
              <Paper sx={{ p: 2, bgcolor: '#f8f8f8' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    거래 점수
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating value={Number(productDetail.tradeScore)} readOnly precision={0.1} />
                    <Typography variant="h6" color="primary">
                      {productDetail.tradeScore}/5.0
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* 판매자 거래 정보 */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  판매자 거래 통계
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 6 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        재구매율
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {(Number(productDetail.sellerDataInfo?.repeatPurchasePercent || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        품질 환불율
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {(Number(productDetail.sellerDataInfo?.qualityRefundWithin30Day || 0) * 100).toFixed(2)}%
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              상품 평가
            </Typography>
            
            <Stack spacing={2}>
              {productDetail.productStatInfo?.avgStar && (
                <Paper sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle1">평균 평점:</Typography>
                    <Rating
                      value={parseFloat(productDetail.productStatInfo.avgStar)}
                      readOnly
                      precision={0.1}
                    />
                    <Typography variant="body1">
                      ({productDetail.productStatInfo.avgStar})
                    </Typography>
                  </Stack>
                </Paper>
              )}
              
              {productDetail.sellerDataInfo && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    판매자 서비스 평가
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        종합 서비스 점수
                      </Typography>
                      <Rating
                        value={Number(productDetail.sellerDataInfo.compositeServiceScore)}
                        readOnly
                        size="small"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        물류 체험 점수
                      </Typography>
                      <Rating
                        value={Number(productDetail.sellerDataInfo.logisticsExperienceScore)}
                        readOnly
                        size="small"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        상품 체험 점수
                      </Typography>
                      <Rating
                        value={Number(productDetail.sellerDataInfo.offerExperienceScore)}
                        readOnly
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  );
}