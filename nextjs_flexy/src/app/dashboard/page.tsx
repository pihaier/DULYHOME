'use client';
import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
// components
import WelcomeCard from '@/app/components/dashboard/dashboard1/TheWelcomeCard';
import MyOrderStatsCards from '@/app/components/dashboard/MyOrderStatsCards';
import RecentApplications from '@/app/components/dashboard/RecentApplications';
import PendingConfirmations from '@/app/components/dashboard/PendingConfirmations';
import UnreadMessagesWidget from '@/app/components/dashboard/UnreadMessagesWidget';

export default function Dashboard() {
  return (
    <PageContainer title="마이페이지" description="두리무역 ERP 마이페이지">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* ------------------------- row 1: 환영 메시지 & 주요 통계 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <WelcomeCard />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <MyOrderStatsCards />
          </Grid>

          {/* ------------------------- row 2: 내 최근 활동 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <RecentApplications />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PendingConfirmations />
              <UnreadMessagesWidget />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
