'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Stack, Chip, Button, Skeleton, Alert } from '@mui/material';
import DashboardCard from '../shared/DashboardCard';
import { IconAlertCircle, IconClock, IconCheck } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';

interface ConfirmationRequest {
  id: string;
  reservation_number: string;
  request_type: string;
  request_content: string;
  options: string[];
  priority: 'high' | 'medium' | 'low';
  status: string;
  created_at: string;
  deadline?: string;
}

const PendingConfirmations = () => {
  const router = useRouter();
  const { user } = useUser();
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPendingConfirmations();
    }
  }, [user]);

  const fetchPendingConfirmations = async () => {
    try {
      const supabase = createClient();

      // confirmation_requests 테이블에 user_id가 없으므로 임시로 빈 배열 반환
      // TODO: 테이블 구조 확인 후 적절한 필터링 추가
      const data: any[] = [];
      const error = null;

      setConfirmations(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'error' as const,
          icon: <IconAlertCircle size={16} />,
          label: '긴급',
        };
      case 'medium':
        return {
          color: 'warning' as const,
          icon: <IconClock size={16} />,
          label: '보통',
        };
      case 'low':
        return {
          color: 'info' as const,
          icon: <IconCheck size={16} />,
          label: '낮음',
        };
      default:
        return {
          color: 'primary' as const,
          icon: null,
          label: priority,
        };
    }
  };

  const handleViewDetail = (confirmation: ConfirmationRequest) => {
    // 예약번호로 해당 서비스 페이지로 이동
    const prefix = confirmation.reservation_number.split('-')[0];
    let serviceRoute = '';

    switch (prefix) {
      case 'MR':
        serviceRoute = 'market-research';
        break;
      case 'FC':
        serviceRoute = 'factory-contact';
        break;
      case 'IN':
        serviceRoute = 'inspection';
        break;
    }

    if (serviceRoute) {
      router.push(`/dashboard/orders/${serviceRoute}/${confirmation.reservation_number}`);
    }
  };

  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffHours = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return (
        <Typography variant="caption" color="error">
          마감 초과
        </Typography>
      );
    } else if (diffHours < 24) {
      return (
        <Typography variant="caption" color="error">
          {diffHours}시간 남음
        </Typography>
      );
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return (
        <Typography variant="caption" color="warning">
          {diffDays}일 남음
        </Typography>
      );
    }
  };

  if (loading) {
    return (
      <DashboardCard title="내 확인 요청" subtitle="로딩 중">
        <Box>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} mb={2} p={2} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Stack direction="row" spacing={1} mt={1}>
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={80} height={32} />
              </Stack>
            </Box>
          ))}
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="내 확인 요청" subtitle="내가 확인해야 할 항목">
      <Box>
        {confirmations.length > 0 ? (
          confirmations.map((confirmation) => {
            const priorityInfo = getPriorityInfo(confirmation.priority);
            return (
              <Box
                key={confirmation.id}
                mb={2}
                p={2}
                sx={{
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  border: confirmation.priority === 'high' ? '1px solid' : 'none',
                  borderColor: 'error.main',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {confirmation.request_type}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {confirmation.reservation_number}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={priorityInfo.label}
                      color={priorityInfo.color}
                      size="small"
                      icon={priorityInfo.icon}
                    />
                    {formatDeadline(confirmation.deadline)}
                  </Stack>
                </Stack>

                <Typography variant="body2" mb={2}>
                  {confirmation.request_content}
                </Typography>

                {confirmation.options && confirmation.options.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {confirmation.options.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                )}

                <Button
                  variant="contained"
                  size="small"
                  color={priorityInfo.color}
                  onClick={() => handleViewDetail(confirmation)}
                >
                  확인하기
                </Button>
              </Box>
            );
          })
        ) : (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            확인할 요청이 없습니다
          </Alert>
        )}
      </Box>
    </DashboardCard>
  );
};

export default PendingConfirmations;
