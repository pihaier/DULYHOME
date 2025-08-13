'use client';
import Link from 'next/link';
import { Grid, Box, Stack, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import AuthLogin from '../../authForms/AuthLogin';
import Image from 'next/image';

export default function CustomerLogin() {
  return (
    <PageContainer title="고객 로그인" description="두리무역 고객 로그인 페이지">
      <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: (theme) => (theme.palette.mode === 'light' ? '#ffe8ef' : '#2a1f26'),
              position: 'absolute',
              inset: 0,
              opacity: 1,
              zIndex: 0,
              pointerEvents: 'none',
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8,
          }}
        >
          <Box position="relative" sx={{ zIndex: 1 }}>
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 75px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <Image
                src={'/images/auth/login-side.png'}
                alt="두리무역 로그인 일러스트"
                width={700}
                height={700}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '560px',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size={{
            xs: 12,
            sm: 12,
            lg: 5,
            xl: 4,
          }}
        >
          <Box p={4} sx={{ zIndex: 1 }}>
            <AuthLogin
              title="고객 로그인"
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  두리무역 서비스를 이용하시려면 로그인해주세요
                </Typography>
              }
              subtitle={
                <Stack direction="row" spacing={1} mt={3}>
                  <Typography color="textSecondary" variant="h6" fontWeight="500">
                    처음이신가요?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/auth/customer/register"
                    fontWeight="500"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                    }}
                  >
                    회원가입
                  </Typography>
                </Stack>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
