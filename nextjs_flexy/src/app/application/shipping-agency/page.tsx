'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  Button,
} from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import { useRouter } from 'next/navigation';

export default function ShippingAgencyPage() {
  const router = useRouter();

  return (
    <PageContainer title="배송대행 서비스" description="중국에서 한국까지 안전하고 빠른 배송 서비스">
      <HpHeader />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Box 
                sx={{ 
                  color: '#00897b',
                  backgroundColor: '#00897b15',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex'
                }}
              >
                <LocalShipping sx={{ fontSize: 60 }} />
              </Box>
              
              <Typography variant="h3" fontWeight="bold">
                배송대행 서비스
              </Typography>
              
              <Typography variant="h6" color="text.secondary" textAlign="center">
                중국에서 한국까지 안전하고 빠른 배송 서비스
              </Typography>
              
              <Alert severity="info" sx={{ width: '100%', mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  서비스 준비중입니다
                </Typography>
                <Typography variant="body2">
                  배송대행 서비스는 현재 준비 중입니다. 
                  빠른 시일 내에 최고의 서비스로 찾아뵙겠습니다.
                </Typography>
              </Alert>
              
              <Card sx={{ bgcolor: '#f5f5f5', p: 3, width: '100%', mt: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  제공 예정 서비스
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography>• 항공/해운 배송 선택</Typography>
                  <Typography>• 통관 대행 서비스</Typography>
                  <Typography>• 실시간 배송 추적</Typography>
                  <Typography>• 보험 및 안전 배송</Typography>
                </Stack>
              </Card>
              
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => router.push('/frontend-pages/services')}
                >
                  서비스 목록으로
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => router.push('/frontend-pages/contact')}
                >
                  문의하기
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </PageContainer>
  );
}