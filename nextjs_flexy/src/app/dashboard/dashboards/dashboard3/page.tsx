"use client";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";

// components
import Congratulation from "@/app/components/dashboard/dashboard3/Congratulation";
import Purchases from "@/app/components/dashboard/dashboard3/Purchases";
import TotalEarnings from "@/app/components/dashboard/dashboard3/TotalEarnings";
import RevenueUpdates from "@/app/components/dashboard/dashboard3/RevenueUpdates";
import MonthlyEarnings from "@/app/components/dashboard/dashboard3/MonthlyEarnings";
import Customers from "@/app/components/dashboard/dashboard3/Customers";
import TotalSales from "@/app/components/dashboard/dashboard1/TheTotalSales";
import ProductPerformance from "@/app/components/dashboard/dashboard3/ProductPerformance";
import SalesOverview from "@/app/components/dashboard/dashboard1/TheSalesOverview";

import BlogCard from "@/app/components/dashboard/dashboard1/TheBlogCard";
import WeeklyStats from "@/app/components/dashboard/dashboard1/TheWeeklyStats";
import DailyActivities from "@/app/components/dashboard/dashboard3/DailyActivities";
import MedicalProBranding from "@/app/components/dashboard/dashboard2/TheMedicalProBranding";
import React from "react";

export default function Modern() {
  return (
    (<PageContainer title="Modern Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 5
            }}>
            <Congratulation />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 3
            }}>
            <Purchases />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <TotalEarnings />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <RevenueUpdates />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <MonthlyEarnings />
              </Grid>
              <Grid size={12}>
                <Customers />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <TotalSales />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ProductPerformance />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6
            }}>
            <DailyActivities />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6
            }}>
            <SalesOverview />
          </Grid>

          {/* ------------------------- row 3 ------------------------- */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <BlogCard />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <WeeklyStats />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <MedicalProBranding />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>)
  );
}
