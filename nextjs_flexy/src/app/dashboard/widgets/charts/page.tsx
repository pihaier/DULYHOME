'use client';
import { useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import YearlyBreakup from '@/app/components/widgets/charts/YearlyBreakup';
import Projects from '@/app/components/widgets/charts/Projects';
import Customers from '@/app/components/widgets/charts/Customers';
import SalesTwo from '@/app/components/widgets/charts/SalesTwo';
import MonthlyEarnings from '@/app/components/widgets/charts/MonthlyEarnings';
import SalesOverview from '@/app/components/widgets/charts/SalesOverview';
import RevenueUpdates from '@/app/components/widgets/charts/RevenueUpdates';
import YearlySales from '@/app/components/widgets/charts/YearlySales';
import MostVisited from '@/app/components/widgets/charts/MostVisited';
import PageImpressions from '@/app/components/widgets/charts/PageImpressions';
import Followers from '@/app/components/widgets/charts/Followers';
import Views from '@/app/components/widgets/charts/Views';
import Earned from '@/app/components/widgets/charts/Earned';
import CurrentValue from '@/app/components/widgets/charts/CurrentValue';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Charts',
  },
];

const WidgetCharts = () => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <PageContainer title="Charts" description="this is Charts">
      {/* breadcrumb */}
      <Breadcrumb title="Charts" items={BCrumb} />
      {/* end breadcrumb */}
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <Followers />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <Views />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <Earned />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <SalesTwo />
        </Grid>
        <Grid size={12}>
          <CurrentValue />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              <YearlyBreakup />
            </Grid>
            <Grid size={12}>
              <MonthlyEarnings />
            </Grid>
            <Grid size={12}>
              <MostVisited />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              <YearlySales />
            </Grid>
            <Grid size={12}>
              <PageImpressions />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Customers />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Projects />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              <RevenueUpdates />
            </Grid>
            <Grid size={12}>
              <SalesOverview />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default WidgetCharts;
