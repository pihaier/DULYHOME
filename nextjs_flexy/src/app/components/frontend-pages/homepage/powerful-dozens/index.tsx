'use client';
import React from 'react';
import { Box, Grid, Typography, Container, useTheme } from '@mui/material';
import DozensCarousel from './DozensCarousel';

const features = [
  {
    title: '시장조사',
    subtitle: '제품 단가·공급망 데이터 기반 분석',
    points: ['공장 검증 및 가격 비교', '최적 파트너 선별'],
  },
  {
    title: '공장컨택',
    subtitle: '직접 컨택 및 조건 협상',
    points: ['표준 계약 및 조건 정리', '리스크 최소화 계약'],
  },
  {
    title: '검품감사',
    subtitle: '불량 예측하고 예방하는 시스템',
    points: ['3단계 크로스 체크 검품', '100% 투명한 실시간 공유'],
  },
  {
    title: '구매·배송대행',
    subtitle: '시스템 업데이트 중',
    points: ['1688 로그인 및 구매기록 연동 예정'],
  },
];

const PowerfulDozens = () => {
  const theme = useTheme();
  return (
    <>
      <Container
        sx={{
          maxWidth: '1400px !important',
          mt: {
            xs: '40px',
            lg: '90px',
          },
        }}
      >
        <Box
          borderRadius="24px"
          sx={{
            py: {
              xs: '56px',
              lg: '96px',
            },
            mt: { xs: 4, lg: 6 },
            mb: { xs: 4, lg: 6 },
            backgroundColor: theme.palette.mode == 'light' ? 'primary.light' : 'background.paper',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={3} alignItems="center" justifyContent="center">
              <Grid
                size={{
                  xs: 12,
                  lg: 8,
                  sm: 10,
                }}
              >
                <Typography
                  variant="h4"
                  mb={2}
                  fontWeight={700}
                  fontSize="40px"
                  lineHeight="1.3"
                  textAlign="center"
                  sx={{
                    fontSize: {
                      lg: '40px',
                      xs: '30px',
                    },
                  }}
                >
                  두리무역 서비스
                </Typography>
                <Typography
                  variant="body1"
                  textAlign="center"
                  sx={{
                    fontSize: '20px',
                    mb: 5,
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  데이터와 전문가가 만드는 무역의 새로운 기준
                </Typography>
              </Grid>
            </Grid>
          </Container>
          <DozensCarousel />
          <Container maxWidth="lg">
            <Grid container spacing={4} mt={5}>
              {features.map((feature, i) => (
                <Grid
                  key={i}
                  size={{
                    xs: 12,
                    lg: 3,
                    sm: 6,
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Typography variant="h5" mb={2} fontWeight={700} color="primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="subtitle1" mb={2} fontWeight={600} color="text.primary">
                      {feature.subtitle}
                    </Typography>
                    <Box>
                      {feature.points.map((point, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{
                            mb: 1,
                            display: 'flex',
                            alignItems: 'flex-start',
                            color: 'text.secondary',
                            '&:before': {
                              content: '"•"',
                              mr: 1,
                              color: 'primary.main',
                              fontWeight: 'bold',
                            },
                          }}
                        >
                          {point}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Container>
    </>
  );
};

export default PowerfulDozens;
