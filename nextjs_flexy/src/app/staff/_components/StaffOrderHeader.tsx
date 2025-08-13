'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
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
import { useUser } from '@/lib/context/GlobalContext';

interface OrderHeaderProps {
  reservationNumber: string;
  serviceType: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  orderData?: any;
}

export default function StaffOrderHeader({
  reservationNumber,
  serviceType,
  status,
  createdAt,
  updatedAt,
  orderData,
}: OrderHeaderProps) {
  const router = useRouter();
  const { userProfile } = useUser();
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  // 서비스 타이틀
  const getServiceTitle = () => {
    switch (serviceType) {
      case 'market_research':
        return isChineseStaff ? '进口代理 - 市场调查' : '수입대행 - 시장조사';
      case 'inspection':
        return isChineseStaff ? '质检审核服务' : '검품감사 서비스';
      case 'factory_contact':
        return isChineseStaff ? '工厂联系服务' : '공장컨택 서비스';
      case 'sampling':
        return isChineseStaff ? '进口代理 - 采样' : '수입대행 - 샘플링';
      case 'bulk_order':
        return isChineseStaff ? '进口代理 - 大量订单' : '수입대행 - 대량주문';
      default:
        return isChineseStaff ? '订单详情' : '주문 상세';
    }
  };

  // 상태 라벨
  const getStatusLabel = (status?: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      'submitted': { ko: '접수완료', zh: '已接收' },
      'quoted': { ko: '견적완료', zh: '报价完成' },
      'paid': { ko: '결제완료', zh: '已付款' },
      'in_progress': { ko: '진행중', zh: '进行中' },
      'completed': { ko: '완료', zh: '已完成' },
      'cancelled': { ko: '취소됨', zh: '已取消' },
    };
    
    if (!status) return isChineseStaff ? '待处理' : '대기중';
    return isChineseStaff ? labels[status]?.zh || status : labels[status]?.ko || status;
  };

  // 서비스별 진행 단계
  const getSteps = () => {
    switch (serviceType) {
      case 'market_research':
        return [
          { 
            label: isChineseStaff ? '申请接收' : '신청접수', 
            icon: <BusinessIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '工厂调查' : '공장조사', 
            icon: <ScienceIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '调查完成' : '조사완료', 
            icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> 
          },
        ];
      case 'inspection':
        return [
          { 
            label: isChineseStaff ? '申请接收' : '신청접수', 
            icon: <BusinessIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '日程协调' : '일정조율', 
            icon: <InventoryIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '报价及付款' : '견적및결제', 
            icon: <PaymentIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '检验进行' : '검품진행', 
            icon: <ScienceIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '检验完成' : '검품완료', 
            icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> 
          },
        ];
      case 'factory_contact':
        return [
          { 
            label: isChineseStaff ? '申请接收' : '신청접수', 
            icon: <BusinessIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '工厂确认' : '공장확인', 
            icon: <ScienceIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '报价提供' : '견적제공', 
            icon: <PaymentIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '合同完成' : '계약완료', 
            icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> 
          },
        ];
      case 'sampling':
        return [
          { 
            label: isChineseStaff ? '申请接收' : '신청접수', 
            icon: <BusinessIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '样品制作' : '샘플제작', 
            icon: <ScienceIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '配送中' : '배송중', 
            icon: <LocalShippingIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '收货完成' : '수령완료', 
            icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> 
          },
        ];
      case 'bulk_order':
        return [
          { 
            label: isChineseStaff ? '订单接收' : '주문접수', 
            icon: <BusinessIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '合同/付款' : '계약/결제', 
            icon: <PaymentIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '生产进行' : '생산진행', 
            icon: <InventoryIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '配送中' : '배송중', 
            icon: <LocalShippingIcon sx={{ fontSize: 24 }} /> 
          },
          { 
            label: isChineseStaff ? '交货完成' : '납품완료', 
            icon: <CheckCircleIcon sx={{ fontSize: 24 }} /> 
          },
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
      case 'factory_contact':
        if (status === 'completed') return 3;
        if (status === 'quoted') return 2;
        if (status === 'in_progress') return 1;
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
                  onClick={() => router.push('/staff/orders')}
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
                <Typography variant="body1">
                  {isChineseStaff ? '订单号' : '오더번호'}: {reservationNumber}
                </Typography>
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