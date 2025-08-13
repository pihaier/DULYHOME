'use client';
import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import Image from 'next/image';

const Banner = () => {
  return (
    <>
      <Box
        bgcolor="primary.light"
        sx={{
          paddingTop: {
            xs: '40px',
            lg: '100px',
          },
          paddingBottom: {
            xs: '40px',
            lg: '200px',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid
              alignItems="center"
              textAlign="center"
              size={{
                xs: 12,
                lg: 8,
              }}
            >
              <Typography color="primary.main" textTransform="uppercase" fontSize="13px">
                문의하기
              </Typography>
              <Typography
                variant="h1"
                mb={3}
                lineHeight={1.4}
                fontWeight={700}
                sx={{
                  fontSize: {
                    xs: '34px',
                    sm: '48px',
                    lg: '56px',
                  },
                }}
              >
                두리무역에 문의해주세요
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box
        sx={{
          mt: {
            lg: '-150px',
          },
        }}
      >
        <Container maxWidth="lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3161.8574471057587!2d127.02797387648023!3d37.57873607207066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357cbcd5f8d6c0b3%3A0x5a9e9b4db5c7a8d1!2z7ISc7Jq47Yq567OE7IucIOyihey0iOq1rCDrj5nrjIDrrLjroZw!5e0!3m2!1sko!2skr!4v1691234567890!5m2!1sko!2skr"
            width="100%"
            height="440"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
          ></iframe>

          {/* <Image src="/images/frontend-pages/contact/map.jpg" alt="map" width={1218} height={440} style={{ borderRadius: '16px', width: '100%', height: 'auto' }} /> */}
        </Container>
      </Box>
    </>
  );
};

export default Banner;
