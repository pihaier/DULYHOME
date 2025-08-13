'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link?: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  const { user, userProfile } = useUser();

  // 권한 체크
  useEffect(() => {
    if (userProfile && !['admin', 'korean_team', 'chinese_staff'].includes(userProfile.role)) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  // 중국 직원인지 확인
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  const stats: StatCard[] = [
    {
      title: isChineseStaff ? '全部订单' : '전체 주문',
      value: '127',
      icon: <AssignmentIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
      link: '/dashboard/orders',
    },
    {
      title: isChineseStaff ? '活跃用户' : '활성 사용자',
      value: '45',
      icon: <PeopleIcon />,
      color: 'success.main',
      bgColor: 'success.light',
      link: '/staff/users',
    },
    {
      title: isChineseStaff ? '本月销售额' : '이번 달 매출',
      value: '₩12,450,000',
      icon: <TrendingUpIcon />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: isChineseStaff ? '完成订单' : '완료된 주문',
      value: '89',
      icon: <CheckCircleIcon />,
      color: 'info.main',
      bgColor: 'info.light',
    },
  ];

  const recentActivities = [
    { time: '10분 전', action: '새로운 시장조사 신청', user: '김철수' },
    { time: '30분 전', action: '공장컨택 견적 승인', user: '이영희' },
    { time: '1시간 전', action: '검품 보고서 업로드', user: '박민수' },
    { time: '2시간 전', action: '결제 완료', user: '최지은' },
    { time: '3시간 전', action: '회원가입 승인', user: '정대한' },
  ];

  const quickActions = [
    { 
      label: isChineseStaff ? '聊天管理' : '채팅 관리', 
      path: '/staff/chat-management', 
      color: 'error',
      icon: <ChatIcon /> 
    },
    { 
      label: isChineseStaff ? '客户支持' : '고객지원 관리', 
      path: '/staff/customer-support', 
      color: 'primary' 
    },
    { 
      label: isChineseStaff ? '用户管理' : '사용자 관리', 
      path: '/staff/users', 
      color: 'secondary' 
    },
    { 
      label: isChineseStaff ? '订单管理' : '주문 관리', 
      path: '/dashboard/orders', 
      color: 'success' 
    },
    { 
      label: isChineseStaff ? '系统设置' : '시스템 설정', 
      path: '/staff/settings', 
      color: 'warning' 
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isChineseStaff ? '员工管理仪表板' : '직원 관리 대시보드'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleDateString(isChineseStaff ? 'zh-CN' : 'ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}{' '}
          {isChineseStaff ? '当前系统状态' : '현재 시스템 현황입니다.'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                position: 'relative',
                cursor: stat.link ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': stat.link
                  ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    }
                  : {},
              }}
              onClick={() => stat.link && router.push(stat.link)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                {stat.link && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="primary">
                      {isChineseStaff ? '查看详情' : '자세히 보기'}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5, color: 'primary.main' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {isChineseStaff ? '快速操作' : '빠른 실행'}
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  color={action.color as any}
                  onClick={() => router.push(action.path)}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6" fontWeight="bold">
                {isChineseStaff ? '最近活动' : '최근 활동'}
              </Typography>
              <Button size="small" onClick={() => router.push('/dashboard/orders')}>
                {isChineseStaff ? '查看全部' : '전체 보기'}
              </Button>
            </Box>
            <Stack spacing={2}>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={activity.time} size="small" variant="outlined" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.user}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
