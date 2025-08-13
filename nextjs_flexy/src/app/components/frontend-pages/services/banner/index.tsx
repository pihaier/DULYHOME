'use client';
import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const ServicesBanner = () => {
  const BannerWrapper = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.2)',
      zIndex: 1,
    },
  }));

  return (
    <BannerWrapper sx={{ py: { xs: 8, lg: 12 } }}>
      <Container
        sx={{
          maxWidth: '1400px !important',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 700,
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            두리무역 전문 서비스
          </Typography>
          <Typography
            variant="h5"
            sx={{
              maxWidth: '800px',
              opacity: 0.9,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            7년간의 한-중 무역 경험을 바탕으로
            <br />
            검증된 전문 서비스를 제공합니다
          </Typography>
        </Stack>
      </Container>
    </BannerWrapper>
  );
};

export default ServicesBanner;
