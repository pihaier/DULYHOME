'use client';
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  Verified,
  ShoppingCart,
  LocalShipping,
  ArrowForward,
} from '@mui/icons-material';

const ServiceOverview = () => {
  const services = [
    {
      id: 'market-research',
      title: '시장조사',
      category: '핵심 서비스',
      description: '중국 시장의 제품/가격/공급망을 데이터로 분석해 최적 파트너를 선별합니다.',
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      color: '#1976d2',
      features: ['제품 단가 분석', '공급업체 검증', '품질 기준 확립'],
      applicationUrl: '/application/market-research',
    },
    {
      id: 'factory-contact',
      title: '공장컨택',
      category: '핵심 서비스',
      description: '목록화된 공장과 직접 컨택하여 가격 협상과 표준 계약을 지원합니다.',
      icon: <Verified sx={{ fontSize: 28 }} />,
      color: '#388e3c',
      features: ['공장 리스트업', '가격 협상', '표준 계약 안내'],
      applicationUrl: '/application/factory-contact',
    },
    {
      id: 'inspection',
      title: '검품감사',
      category: '핵심 서비스',
      description: '제3자 검품/공장 실사/선적 전 검사로 불량을 사전에 차단합니다.',
      icon: <LocalShipping sx={{ fontSize: 28 }} />,
      color: '#7b1fa2',
      features: ['선적 전 검품', '공장 실사', '불량 예방 시스템'],
      applicationUrl: '/application/inspection',
    },
    {
      id: 'purchase-shipping',
      title: '구매·배송대행',
      category: '업데이트',
      description: '1688 로그인 및 구매기록 연동 예정',
      icon: <ShoppingCart sx={{ fontSize: 28 }} />,
      color: '#9e9e9e',
      features: ['1688 로그인 및 구매기록 연동 예정'],
      applicationUrl: '/frontend-pages/services',
      disabled: true,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, lg: 14 }, backgroundColor: 'grey.50', mt: { xs: 2, lg: 4 } }}>
      <Container sx={{ maxWidth: '1400px !important' }}>
        {/* 섹션 헤더 */}
        <Stack spacing={3} alignItems="center" textAlign="center" mb={8}>
          <Typography variant="h2" fontWeight={700}>
            두리무역 전문 서비스
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px' }}>
            7년간의 한-중 무역 경험을 바탕으로 체계적이고 안전한 서비스를 제공합니다
          </Typography>
        </Stack>

        {/* 서비스 카드 */}
        <Grid container spacing={4} mb={6}>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4,
                  },
                  cursor: service.disabled ? 'not-allowed' : 'pointer',
                  opacity: service.disabled ? 0.6 : 1,
                }}
                onClick={() => {
                  if (!service.disabled) window.location.href = service.applicationUrl;
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Stack spacing={3} alignItems="center">
                    {/* 아이콘 */}
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: service.color,
                        color: 'white',
                      }}
                    >
                      {service.icon}
                    </Avatar>

                    {/* 서비스 정보 */}
                    <Stack spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: `${service.color}15`,
                          color: service.color,
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                        }}
                      >
                        {service.category}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.6}
                        sx={{ minHeight: '48px' }}
                      >
                        {service.description}
                      </Typography>
                    </Stack>

                    {/* 주요 기능 */}
                    <Stack spacing={1} width="100%">
                      {service.features.map((feature, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{
                            textAlign: 'left',
                            pl: 2,
                            position: 'relative',
                            '&::before': {
                              content: '"•"',
                              position: 'absolute',
                              left: 0,
                              color: service.color,
                              fontWeight: 'bold',
                            },
                          }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Stack>

                    {/* 신청 버튼 */}
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      endIcon={service.disabled ? undefined : <ArrowForward />}
                      disabled={Boolean(service.disabled)}
                      href={service.disabled ? undefined : service.applicationUrl}
                      sx={{
                        backgroundColor: service.disabled ? 'grey.400' : service.color,
                        '&:hover': {
                          backgroundColor: service.disabled ? 'grey.400' : service.color,
                          filter: service.disabled ? 'none' : 'brightness(0.9)',
                        },
                        mt: 2,
                      }}
                    >
                      {service.disabled ? '업데이트 중' : '신청하기'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 하단 CTA 제거: SEO/가독성 단순화 */}
      </Container>
    </Box>
  );
};

export default ServiceOverview;
