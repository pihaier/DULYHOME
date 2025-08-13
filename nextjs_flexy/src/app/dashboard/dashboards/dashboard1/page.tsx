'use client';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
// components
import WelcomeCard from '@/app/components/dashboard/dashboard1/TheWelcomeCard';
import BlogCard from '@/app/components/dashboard/dashboard1/TheBlogCard';
import Earnings from '@/app/components/dashboard/dashboard1/TheEarnings';
import MonthlySales from '@/app/components/dashboard/dashboard1/TheMonthlySales';
import SalesOverview from '@/app/components/dashboard/dashboard1/TheSalesOverview';
import TotalSales from '@/app/components/dashboard/dashboard1/TheTotalSales';
import ProductPerformance from '@/app/components/dashboard/dashboard1/TheProductPerformance';
import WeeklyStats from '@/app/components/dashboard/dashboard1/TheWeeklyStats';
import DailyActivities from '@/app/components/dashboard/dashboard1/TheDailyActivities';
import Welcome from '@/app/dashboard/layout/shared/welcome/Welcome';

export default function Dashboard() {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* ------------------------- row 1 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <Grid container spacing={3}>
              <Grid size={12}>
                <WelcomeCard />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6,
                  sm: 6,
                }}
              >
                <Earnings />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6,
                  sm: 6,
                }}
              >
                <MonthlySales />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <SalesOverview />
          </Grid>
          {/* ------------------------- row 2 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <TotalSales />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <ProductPerformance />
          </Grid>
          {/* ------------------------- row 3 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <BlogCard />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <WeeklyStats />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <DailyActivities />
          </Grid>
        </Grid>
        <Welcome />
      </Box>
    </PageContainer>
  );
}
