'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SamplingForm } from '@/components/SamplingForm';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';
import { Paper, Alert, AlertTitle, Typography, Box } from '@mui/material';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '샘플링 신청',
  },
];

export default function SamplingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (data: { reservationNumber: string; orderId: string }) => {
    toast.success(
      `샘플링 신청이 완료되었습니다!\n예약번호: ${data.reservationNumber}`,
      {
        position: "top-center",
        autoClose: 5000,
      }
    );
    
    // 신청 완료 후 상세 페이지로 이동
    setTimeout(() => {
      router.push(`/apps/sampling/${data.reservationNumber}`);
    }, 2000);
  };

  return (
    <PageContainer title="샘플링 신청" description="중국 제품 샘플링 서비스 신청">
      <Breadcrumb title="샘플링 신청" items={BCrumb} />
      
      <Paper elevation={0} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            중국 제품 샘플링 서비스 신청
          </Typography>
          <Typography variant="body1" color="text.secondary">
            중국 현지 공장에서 샘플 제품을 받아 검수 후 한국으로 배송해드립니다.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>신청 안내</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>제품 사진은 최대 5장까지 업로드 가능합니다.</li>
            <li>샘플 수량과 요청사항을 상세히 작성해주세요.</li>
            <li>배송 주소는 정확하게 입력해주세요.</li>
            <li>신청 완료 후 담당자가 24시간 이내에 연락드립니다.</li>
          </ul>
        </Alert>

        <SamplingForm onSuccess={handleSuccess} />
      </Paper>

      <ToastContainer />
    </PageContainer>
  );
}