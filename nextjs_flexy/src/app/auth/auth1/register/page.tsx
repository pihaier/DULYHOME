'use client';
import Link from 'next/link';
import { Grid, Box, Typography, Stack } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';

import AuthRegister from '../../authForms/AuthRegister';
import Image from 'next/image';

export default function Register() {
  return (
    <PageContainer title="Register Page" description="this is Sample page">
      <Grid container spacing={0} justifyContent="center" sx={{ overflowX: 'hidden' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8,
          }}
        >
          <Box position="relative">
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
                src={'/images/backgrounds/login-bg.svg'}
                alt="bg"
                width={500}
                height={500}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '500px',
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
          <Box p={4}>
            <AuthRegister
              title="두리무역 ERP 회원가입"
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  새로운 계정을 만들어 서비스를 시작하세요
                </Typography>
              }
              subtitle={
                <Stack direction="row" spacing={1} mt={3}>
                  <Typography color="textSecondary" variant="h6" fontWeight="400">
                    이미 계정이 있으신가요?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/auth/auth1/login"
                    fontWeight="500"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                    }}
                  >
                    로그인하기
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
