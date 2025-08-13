'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepIcon,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface OrderHeaderProps {
  reservationNumber: string;
  serviceType: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  orderData?: any;
}

export default function OrderHeader({
  reservationNumber,
  serviceType,
  status,
  createdAt,
  updatedAt,
  orderData,
}: OrderHeaderProps) {
  const router = useRouter();

  // 서비스 타이틀
  const getServiceTitle = () => {
    switch (serviceType) {
      case 'market_research':
        return '수입대행 - 시장조사';
      case 'inspection':
        return '검품감사 서비스';
      case 'sampling':
        return '수입대행 - 샘플링';
      case 'bulk_order':
        return '수입대행 - 대량주문';
      default:
        return '주문 상세';
    }
  };

  // 상태 라벨
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'submitted':
        return '접수완료';
      case 'quoted':
        return '견적완료';
      case 'paid':
        return '결제완료';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return '대기중';
    }
  };

  // 서비스별 진행 단계
  const getSteps = () => {
    switch (serviceType) {
      case 'market_research':
        return [
          { label: '신청접수', icon: <BusinessIcon sx={{ fontSize: 24 }} /> },
          { label: '공장조사', icon: <ScienceIcon sx={{ fontSize: 24 }} /> },
          { label: '조사완료', icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> },
        ];
      case 'inspection':
        return [
          { label: '신청접수', icon: <BusinessIcon sx={{ fontSize: 24 }} /> },
          { label: '일정조율', icon: <InventoryIcon sx={{ fontSize: 24 }} /> },
          { label: '견적및결제', icon: <PaymentIcon sx={{ fontSize: 24 }} /> },
          { label: '검품진행', icon: <ScienceIcon sx={{ fontSize: 24 }} /> },
          { label: '검품완료', icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> },
        ];
      case 'sampling':
        return [
          { label: '신청접수', icon: <BusinessIcon sx={{ fontSize: 24 }} /> },
          { label: '샘플제작', icon: <ScienceIcon sx={{ fontSize: 24 }} /> },
          { label: '배송중', icon: <LocalShippingIcon sx={{ fontSize: 24 }} /> },
          { label: '수령완료', icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> },
        ];
      case 'bulk_order':
        return [
          { label: '주문접수', icon: <BusinessIcon sx={{ fontSize: 24 }} /> },
          { label: '계약/결제', icon: <PaymentIcon sx={{ fontSize: 24 }} /> },
          { label: '생산진행', icon: <InventoryIcon sx={{ fontSize: 24 }} /> },
          { label: '배송중', icon: <LocalShippingIcon sx={{ fontSize: 24 }} /> },
          { label: '납품완료', icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> },
        ];
      default:
        return [];
    }
  };

  const getCurrentStep = () => {
    if (!status) return 0;

    switch (serviceType) {
      case 'market_research':
        return status === 'completed' ? 2 : status === 'in_progress' ? 1 : 0;
      case 'inspection':
        if (status === 'completed') return 4;
        if (status === 'in_progress') return 3;
        if (status === 'paid') return 2;
        if (status === 'quoted') return 1;
        return 0;
      case 'sampling':
        if (status === 'completed') return 3;
        if (status === 'in_progress') return 2;
        if (status === 'paid') return 1;
        return 0;
      case 'bulk_order':
        if (status === 'completed') return 4;
        if (orderData?.production_status === 'shipping') return 3;
        if (orderData?.production_status === 'in_production') return 2;
        if (status === 'paid') return 1;
        return 0;
      default:
        return 0;
    }
  };

  const steps = getSteps();
  const currentStep = getCurrentStep();

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <IconButton
                  onClick={() => router.push('/dashboard/orders')}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">
                  {getServiceTitle()}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body1">오더번호: {reservationNumber}</Typography>
                <Chip
                  label={getStatusLabel(status)}
                  size="small"
                  sx={{
                    bgcolor:
                      status === 'completed'
                        ? 'success.main'
                        : status === 'in_progress'
                          ? 'warning.main'
                          : status === 'paid'
                            ? 'info.main'
                            : 'grey.300',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Stack>
            </Box>

            {/* 진행 상태 표시 */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: { md: 2, lg: 3 },
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                p: { md: 1.5, lg: 2 },
              }}
            >
              {steps.map((step, index) => (
                <Box key={step.label} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: { md: 30, lg: 40 },
                        height: { md: 30, lg: 40 },
                        borderRadius: '50%',
                        bgcolor: index <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                        color: index <= currentStep ? 'primary.main' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontSize: { md: '0.7rem', lg: '0.75rem' },
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: 60,
                        height: 2,
                        bgcolor: index < currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                        mx: 1,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
