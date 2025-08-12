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
import { ShoppingCart } from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import { useRouter } from 'next/navigation';

export default function PurchaseAgencyPage() {
  const router = useRouter();

  return (
    <PageContainer title="구매대행 서비스" description="중국 제품의 구매부터 배송까지 원스톱 서비스">
      <HpHeader />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Box 
                sx={{ 
                  color: '#7b1fa2',
                  backgroundColor: '#7b1fa215',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex'
                }}
              >
                <ShoppingCart sx={{ fontSize: 60 }} />
              </Box>
              
              <Typography variant="h3" fontWeight="bold">
                구매대행 서비스
              </Typography>
              
              <Typography variant="h6" color="text.secondary" textAlign="center">
                중국 제품의 구매부터 배송까지 원스톱 서비스
              </Typography>
              
              <Alert severity="info" sx={{ width: '100%', mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  서비스 준비중입니다
                </Typography>
                <Typography variant="body2">
                  구매대행 서비스는 현재 준비 중입니다. 
                  빠른 시일 내에 최고의 서비스로 찾아뵙겠습니다.
                </Typography>
              </Alert>
              
              <Card sx={{ bgcolor: '#f5f5f5', p: 3, width: '100%', mt: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  제공 예정 서비스
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography>• 타오바오/알리바바 구매대행</Typography>
                  <Typography>• 가격 협상 및 주문 처리</Typography>
                  <Typography>• 품질 확인 및 검수</Typography>
                  <Typography>• 한국 배송 및 통관</Typography>
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