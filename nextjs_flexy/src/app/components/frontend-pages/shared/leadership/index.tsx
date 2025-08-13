'use client';
import React from 'react';
import { Box, Grid, Typography, Container } from '@mui/material';
import 'slick-carousel/slick/slick.css';

import LeaderShipCarousel from './LeaderShipCarousel';
import Contact from './Contact';

const Leadership = () => {
  return (
    <>
      <Box
        sx={{
          py: {
            xs: 5,
            lg: 10,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center" mb={6}>
            <Grid
              size={{
                xs: 12,
                lg: 5,
                sm: 8,
              }}
            >
              <Typography
                variant="h4"
                mb={3}
                sx={{
                  fontSize: {
                    lg: '40px',
                    xs: '35px',
                  },
                }}
              >
                두리무역 전문팀
              </Typography>
              <Typography variant="body1" lineHeight="32px">
                7년간 축적된 중국 무역 노하우와 현지 상주 전문팀이 귀하의 성공적인 비즈니스를
                지원합니다
              </Typography>
            </Grid>
          </Grid>

          <LeaderShipCarousel />
        </Container>
      </Box>
      <Contact />
    </>
  );
};

export default Leadership;
