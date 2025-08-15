'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Fab, Box, Grid, Skeleton } from '@mui/material';
import {
  IconClipboardList,
  IconCircleCheck,
  IconCurrencyDollar,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';

interface StatCard {
  btnbg: string;
  btntext: string;
  icon: React.ReactNode;
  digits: string;
  subtext: string;
  link: string;
}

const MyOrderStatsCards = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const borderColor = theme.palette.divider;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    pendingPayments: 0,
    pendingConfirmations: 0,
  });

  useEffect(() => {
    if (user) {
      fetchMyStats();
    }
  }, [user]);

  const fetchMyStats = async () => {
    try {
      const supabase = createClient();

      // 내 진행중 주문 (모든 서비스)
      let activeCount = 0;
      let completedCount = 0;

      // 시장조사
      const { count: activeMR } = await supabase
        .from('market_research_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .in('status', ['submitted', 'in_progress']);

      const { count: completedMR } = await supabase
        .from('market_research_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // 공장컨택
      const { count: activeFC } = await supabase
        .from('factory_contact_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .in('status', ['submitted', 'in_progress']);

      const { count: completedFC } = await supabase
        .from('factory_contact_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // 검품
      const { count: activeIN } = await supabase
        .from('inspection_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .in('status', ['submitted', 'in_progress']);

      const { count: completedIN } = await supabase
        .from('inspection_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      activeCount = (activeMR || 0) + (activeFC || 0) + (activeIN || 0);
      completedCount = (completedMR || 0) + (completedFC || 0) + (completedIN || 0);

      // 결제 대기 주문 수
      let pendingPaymentCount = 0;

      // 시장조사 결제 대기
      const { count: pendingPayMR } = await supabase
        .from('market_research_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('payment_status', 'pending');

      // 공장컨택 결제 대기
      const { count: pendingPayFC } = await supabase
        .from('factory_contact_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('payment_status', 'pending');

      // 검품 결제 대기
      const { count: pendingPayIN } = await supabase
        .from('inspection_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('payment_status', 'pending');

      pendingPaymentCount = (pendingPayMR || 0) + (pendingPayFC || 0) + (pendingPayIN || 0);

      // 내 대기중 확인 요청 (현재 user_id 컬럼이 없으므로 0으로 설정)
      const pendingConfirmations = 0;

      setStats({
        activeOrders: activeCount,
        completedOrders: completedCount,
        pendingPayments: pendingPaymentCount,
        pendingConfirmations: pendingConfirmations || 0,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      btnbg: 'primary.light',
      btntext: 'primary.main',
      icon: <IconClipboardList size={20} />,
      digits: stats.activeOrders.toString(),
      subtext: '진행중인 주문',
      link: '/dashboard/orders?status=in_progress',
    },
    {
      btnbg: 'success.light',
      btntext: 'success.main',
      icon: <IconCircleCheck size={20} />,
      digits: stats.completedOrders.toString(),
      subtext: '완료된 주문',
      link: '/dashboard/orders?status=completed',
    },
    {
      btnbg: 'warning.light',
      btntext: 'warning.main',
      icon: <IconCurrencyDollar size={20} />,
      digits: stats.pendingPayments.toString(),
      subtext: '결제 대기',
      link: '/dashboard/orders?status=pending_payment',
    },
    {
      btnbg: 'warning.light',
      btntext: 'warning.main',
      icon: <IconAlertCircle size={20} />,
      digits: stats.pendingConfirmations.toString(),
      subtext: '대기중 확인',
      link: '/dashboard/orders',
    },
  ];

  return (
    <Card sx={{ p: 0 }}>
      <Grid container spacing={0}>
        {statCards.map((card, index) => (
          <Grid
            key={card.subtext}
            size={{
              xs: 6,
              lg: 3,
              sm: 3,
            }}
          >
            <CardContent
              sx={{
                borderRight: {
                  xs: '0',
                  sm: index < 3 ? `1px solid ${borderColor}` : '0',
                },
                padding: '30px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => router.push(card.link)}
            >
              <Fab
                size="large"
                aria-label={card.subtext}
                sx={{
                  backgroundColor: card.btnbg,
                  color: card.btntext,
                  boxShadow: 'none',
                  width: 50,
                  height: 50,
                  '&:hover': {
                    backgroundColor: card.btnbg,
                  },
                }}
              >
                {card.icon}
              </Fab>
              <Box display="flex" alignItems="center" mt={3}>
                {loading ? (
                  <Skeleton variant="text" width={60} height={40} />
                ) : (
                  <Typography variant="h3">{card.digits}</Typography>
                )}
              </Box>
              <Typography color="textSecondary" variant="h6" fontWeight="400">
                {card.subtext}
              </Typography>
            </CardContent>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
};

export default MyOrderStatsCards;
