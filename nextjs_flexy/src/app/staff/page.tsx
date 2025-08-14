'use client';

import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Chat as ChatIcon,
  Factory as FactoryIcon,
  Search as SearchIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link?: string;
}

interface MyOrder {
  id: string;
  reservation_number: string;
  service_type: string;
  company_name: string;
  product_name: string;
  status: string;
  created_at: string;
  urgent?: boolean;
}

export default function StaffDashboard() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    submitted: 0,
    in_progress: 0,
    pending_confirm: 0,
    completed: 0,
  });
  const [tabValue, setTabValue] = useState(0);

  // 권한 체크
  useEffect(() => {
    if (userProfile && !['admin', 'korean_team', 'chinese_staff'].includes(userProfile.role)) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  // 중국 직원인지 확인
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  // 내 담당 주문 가져오기
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // 검품감사 주문
        const { data: inspectionData } = await supabase
          .from('inspection_applications')
          .select('*')
          .eq('assigned_chinese_staff', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // 시장조사 주문
        const { data: marketData } = await supabase
          .from('market_research_requests')
          .select('*')
          .eq('assigned_staff', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // 공장컨택 주문
        const { data: factoryData } = await supabase
          .from('factory_contact_requests')
          .select('*')
          .eq('assigned_chinese_staff', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // 모든 주문 합치기
        const allOrders: MyOrder[] = [];

        if (inspectionData) {
          inspectionData.forEach((order) => {
            allOrders.push({
              id: order.id,
              reservation_number: order.reservation_number,
              service_type: 'inspection',
              company_name: order.company_name,
              product_name: order.product_name,
              status: order.status,
              created_at: order.created_at,
              urgent:
                order.status === 'submitted' &&
                new Date(order.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000,
            });
          });
        }

        if (marketData) {
          marketData.forEach((order) => {
            allOrders.push({
              id: order.id,
              reservation_number: order.reservation_number,
              service_type: 'market-research',
              company_name: order.company_name,
              product_name: order.product_name,
              status: order.status,
              created_at: order.created_at,
              urgent:
                order.status === 'submitted' &&
                new Date(order.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000,
            });
          });
        }

        if (factoryData) {
          factoryData.forEach((order) => {
            allOrders.push({
              id: order.id,
              reservation_number: order.reservation_number,
              service_type: 'factory-contact',
              company_name: order.company_name,
              product_name: order.product_name,
              status: order.status,
              created_at: order.created_at,
              urgent:
                order.status === 'submitted' &&
                new Date(order.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000,
            });
          });
        }

        // 정렬
        allOrders.sort((a, b) => {
          // 긴급 건 우선
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          // 날짜순
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setMyOrders(allOrders);

        // 상태별 카운트
        const counts = {
          submitted: 0,
          in_progress: 0,
          pending_confirm: 0,
          completed: 0,
        };

        allOrders.forEach((order) => {
          if (order.status === 'submitted' || order.status === 'quoted') {
            counts.submitted++;
          } else if (order.status === 'in_progress') {
            counts.in_progress++;
          } else if (order.status === 'pending_confirm') {
            counts.pending_confirm++;
          } else if (order.status === 'completed') {
            counts.completed++;
          }
        });

        setStatusCounts(counts);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, supabase]);

  const stats: StatCard[] = [
    {
      title: isChineseStaff ? '新订单' : '신규 주문',
      value: statusCounts.submitted,
      icon: <AssignmentIcon />,
      color: 'warning.main',
      bgColor: 'warning.light',
      link: '/staff/orders?status=submitted',
    },
    {
      title: isChineseStaff ? '进行中' : '진행 중',
      value: statusCounts.in_progress,
      icon: <HourglassEmptyIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
      link: '/staff/orders?status=in_progress',
    },
    {
      title: isChineseStaff ? '待确认' : '컨펌 대기',
      value: statusCounts.pending_confirm,
      icon: <PendingIcon />,
      color: 'info.main',
      bgColor: 'info.light',
      link: '/staff/orders?status=pending_confirm',
    },
    {
      title: isChineseStaff ? '已完成' : '완료',
      value: statusCounts.completed,
      icon: <CheckCircleIcon />,
      color: 'success.main',
      bgColor: 'success.light',
      link: '/staff/orders?status=completed',
    },
  ];

  const quickActions = [
    {
      label: isChineseStaff ? '质检审核管理' : '검품감사 관리',
      path: '/staff/orders?service=inspection',
      color: 'success',
      icon: <CheckCircleIcon />,
    },
    {
      label: isChineseStaff ? '市场调查管理' : '시장조사 관리',
      path: '/staff/orders?service=market-research',
      color: 'primary',
      icon: <SearchIcon />,
    },
    {
      label: isChineseStaff ? '工厂联系管理' : '공장컨택 관리',
      path: '/staff/orders?service=factory-contact',
      color: 'secondary',
      icon: <FactoryIcon />,
    },
    {
      label: isChineseStaff ? '聊天管理' : '채팅 관리',
      path: '/staff/chat-management',
      color: 'error',
      icon: <ChatIcon />,
    },
  ];

  const getServiceLabel = (service: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      inspection: { ko: '검품감사', zh: '质检' },
      'market-research': { ko: '시장조사', zh: '市调' },
      'factory-contact': { ko: '공장컨택', zh: '工厂' },
    };
    return isChineseStaff ? labels[service]?.zh : labels[service]?.ko;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      submitted: { ko: '접수', zh: '已提交' },
      quoted: { ko: '견적발송', zh: '已报价' },
      in_progress: { ko: '진행중', zh: '进行中' },
      pending_confirm: { ko: '컨펌대기', zh: '待确认' },
      completed: { ko: '완료', zh: '已完成' },
    };
    return isChineseStaff ? labels[status]?.zh || status : labels[status]?.ko || status;
  };

  const filteredOrders =
    tabValue === 0
      ? myOrders
      : myOrders.filter((order) => {
          if (tabValue === 1) return order.status === 'submitted' || order.status === 'quoted';
          if (tabValue === 2) return order.status === 'in_progress';
          if (tabValue === 3) return order.status === 'pending_confirm';
          return false;
        });

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
        {/* My Orders */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6" fontWeight="bold">
                {isChineseStaff ? '我的订单' : '내 담당 주문'}
              </Typography>
              <Button size="small" onClick={() => router.push('/staff/orders')}>
                {isChineseStaff ? '查看全部' : '전체 보기'}
              </Button>
            </Box>

            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 2 }}>
              <Tab label={isChineseStaff ? '全部' : '전체'} />
              <Tab label={isChineseStaff ? '新订单' : '신규'} />
              <Tab label={isChineseStaff ? '进行中' : '진행중'} />
              <Tab label={isChineseStaff ? '待确认' : '컨펌대기'} />
            </Tabs>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Alert severity="info">{isChineseStaff ? '没有订单' : '주문이 없습니다'}</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '预约号' : '예약번호'}</TableCell>
                      <TableCell>{isChineseStaff ? '服务' : '서비스'}</TableCell>
                      <TableCell>{isChineseStaff ? '公司' : '회사'}</TableCell>
                      <TableCell>{isChineseStaff ? '状态' : '상태'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(0, 5).map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() =>
                          router.push(
                            `/staff/orders/${order.service_type}/${order.reservation_number}`
                          )
                        }
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {order.urgent && <WarningIcon color="error" fontSize="small" />}
                            {order.reservation_number}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={getServiceLabel(order.service_type)} size="small" />
                        </TableCell>
                        <TableCell>{order.company_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            size="small"
                            color={order.status === 'submitted' ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

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
      </Grid>
    </Box>
  );
}
