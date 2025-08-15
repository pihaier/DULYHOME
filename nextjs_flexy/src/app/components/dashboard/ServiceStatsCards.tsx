'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Fab, Box, Grid, Skeleton } from '@mui/material';
import {
  IconMessage,
  IconClipboardList,
  IconSearch,
  IconBuildingFactory,
} from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface StatCard {
  btnbg: string;
  btntext: string;
  icon: React.ReactNode;
  digits: string;
  subtext: string;
  link: string;
}

const ServiceStatsCards = () => {
  const theme = useTheme();
  const router = useRouter();
  const borderColor = theme.palette.divider;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    unreadMessages: 0,
    activeInspections: 0,
    activeMarketResearch: 0,
    pendingFactoryContacts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createClient();

      // 전체 메시지 수 (is_read 컬럼이 없으므로 전체 카운트)
      const { count: unreadMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      // 진행중인 검품
      const { count: activeInspections } = await supabase
        .from('inspection_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // 진행중인 시장조사
      const { count: activeMarketResearch } = await supabase
        .from('market_research_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // 대기중인 공장컨택
      const { count: pendingFactoryContacts } = await supabase
        .from('factory_contact_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      setStats({
        unreadMessages: unreadMessages || 0,
        activeInspections: activeInspections || 0,
        activeMarketResearch: activeMarketResearch || 0,
        pendingFactoryContacts: pendingFactoryContacts || 0,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      btnbg: 'error.light',
      btntext: 'error.main',
      icon: <IconMessage size={20} />,
      digits: stats.unreadMessages.toString(),
      subtext: '전체 메시지',
      link: '/dashboard/chat',
    },
    {
      btnbg: 'success.light',
      btntext: 'success.main',
      icon: <IconClipboardList size={20} />,
      digits: stats.activeInspections.toString(),
      subtext: '진행중인 검품',
      link: '/dashboard/orders/inspection',
    },
    {
      btnbg: 'primary.light',
      btntext: 'primary.main',
      icon: <IconSearch size={20} />,
      digits: stats.activeMarketResearch.toString(),
      subtext: '진행중인 시장조사',
      link: '/dashboard/orders/market-research',
    },
    {
      btnbg: 'secondary.light',
      btntext: 'secondary.main',
      icon: <IconBuildingFactory size={20} />,
      digits: stats.pendingFactoryContacts.toString(),
      subtext: '대기중인 공장컨택',
      link: '/dashboard/orders/factory-contact',
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

export default ServiceStatsCards;
