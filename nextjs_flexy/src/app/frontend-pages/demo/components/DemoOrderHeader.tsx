'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Chip, Stepper, Step, StepLabel } from '@mui/material';

interface DemoOrderHeaderProps {
  reservationNumber: string;
  serviceType: 'market_research' | 'factory_contact' | 'inspection';
  status?: 'submitted' | 'quoted' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

const serviceTitle: Record<string, string> = {
  market_research: '수입대행 - 시장조사',
  inspection: '검품감사 서비스',
  factory_contact: '공장컨택 서비스',
};

const stepsByService: Record<string, string[]> = {
  market_research: ['신청접수', '공장조사', '조사완료'],
  inspection: ['신청접수', '일정조율', '견적및결제', '검품진행', '검품완료'],
  factory_contact: ['신청접수', '공장컨택', '조건협의', '완료'],
};

export default function DemoOrderHeader({
  reservationNumber,
  serviceType,
  status,
  createdAt,
  updatedAt,
}: DemoOrderHeaderProps) {
  const steps = stepsByService[serviceType] || [];
  const current = Math.min(
    steps.length - 1,
    status === 'completed'
      ? steps.length - 1
      : status === 'in_progress'
        ? Math.floor(steps.length / 2)
        : 0
  );

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'in_progress':
        return '조사중';
      case 'completed':
        return '완료';
      case 'submitted':
        return '접수';
      case 'quoted':
        return '견적완료';
      case 'paid':
        return '결제완료';
      default:
        return status || '';
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {serviceTitle[serviceType] || '주문 상세'}
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={`예약번호: ${reservationNumber}`} size="small" />
            {status && (
              <Chip
                label={`상태: ${getStatusLabel(status)}`}
                color={
                  status === 'completed'
                    ? 'success'
                    : status === 'in_progress'
                      ? 'primary'
                      : 'default'
                }
                size="small"
              />
            )}
          </Stack>
          {(createdAt || updatedAt) && (
            <Typography variant="caption" color="text.secondary" mt={1} display="block">
              생성: {createdAt ? new Date(createdAt).toLocaleString('ko-KR') : '-'} / 업데이트:{' '}
              {updatedAt ? new Date(updatedAt).toLocaleString('ko-KR') : '-'}
            </Typography>
          )}
        </Box>
      </Stack>
      {!!steps.length && (
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={current} alternativeLabel>
            {steps.map((label, idx) => (
              <Step key={idx}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}
    </Box>
  );
}
