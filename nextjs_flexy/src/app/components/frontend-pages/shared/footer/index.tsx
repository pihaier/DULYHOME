'use client';
import React from 'react';
import { Box, Grid, Typography, Container, Divider, Stack, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  {
    id: 1,
    children: [
      {
        title: true,
        titleText: '회사소개',
      },
      {
        title: false,
        titleText: '회사소개',
        link: '/frontend-pages/about',
      },
      {
        title: false,
        titleText: '문의하기',
        link: '/frontend-pages/contact',
      },
    ],
  },
  {
    id: 2,
    children: [
      {
        title: true,
        titleText: '서비스',
      },
      {
        title: false,
        titleText: '시장조사',
        link: '/application/market-research',
      },
      {
        title: false,
        titleText: '공장컨택',
        link: '/application/factory-contact',
      },
      {
        title: false,
        titleText: '품질검품',
        link: '/application/inspection/quality-inspection',
      },
    ],
  },
  {
    id: 3,
    children: [
      {
        title: true,
        titleText: '고객지원',
      },
      {
        title: false,
        titleText: '공지사항/FAQ',
        link: '/frontend-pages/blog',
      },
      {
        title: false,
        titleText: '계산기',
        link: '/frontend-pages/calculators',
      },
    ],
  },
  {
    id: 4,
    children: [
      {
        title: true,
        titleText: '약관 및 정책',
      },
      {
        title: false,
        titleText: '이용약관',
        link: '/legal/terms',
      },
      {
        title: false,
        titleText: '개인정보처리방침',
        link: '/legal/privacy',
      },
    ],
  },
];

const Footer = () => {
  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          pt: {
            xs: '30px',
            lg: '60px',
          },
        }}
      >
        <Grid container spacing={3} justifyContent="space-between" mb={7}>
          {footerLinks.map((footerlink, i) => (
            <Grid
              key={i}
              size={{
                xs: 6,
                sm: 4,
                lg: 2,
              }}
            >
              {footerlink.children.map((child, i) => (
                <React.Fragment key={i}>
                  {child.title ? (
                    <Typography fontSize="17px" fontWeight="600" mb="22px">
                      {child.titleText}
                    </Typography>
                  ) : (
                    <Link href={`${child.link}`}>
                      <Typography
                        sx={{
                          display: 'block',
                          padding: '10px 0',
                          fontSize: '15px',
                          color: (theme) => theme.palette.text.primary,
                          '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                          },
                        }}
                        component="span"
                      >
                        {child.titleText}
                      </Typography>
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider />

        <Box py="40px" display="flex" justifyContent="center">
          <Typography variant="body1" fontSize="15px" color="text.secondary">
            © 2025 두리무역. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Footer;
