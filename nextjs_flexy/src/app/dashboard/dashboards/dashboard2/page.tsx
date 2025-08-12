"use client";
import React from "react";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";

// components
import EarningsShop from "@/app/components/dashboard/dashboard2/TheEarningsShop";
import TopCards from "@/app/components/dashboard/dashboard2/TheTopCards";
import ProductPerformance from "@/app/components/dashboard/dashboard2/TheProductPerformance";
import Earnings from "@/app/components/dashboard/dashboard2/TheEarnings";
import YearlySales from "@/app/components/dashboard/dashboard2/TheYearlySales";
import RecentTransactions from "@/app/components/dashboard/dashboard2/TheRecentTransactions";
import ProductsTable from "@/app/components/dashboard/dashboard2/TheProductsTable";
import WeeklyStats from "@/app/components/dashboard/dashboard1/TheWeeklyStats";
import MedicalproBranding from "@/app/components/dashboard/dashboard2/TheMedicalProBranding";
import BlogCard from "@/app/components/dashboard/dashboard2/TheBlogCard";

export default function eCommerce() {
  return (
    (<PageContainer title="eCommerce Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <EarningsShop />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <TopCards />
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
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Earnings />
              </Grid>
              <Grid size={12}>
                <YearlySales />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <RecentTransactions />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ProductsTable />
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
            <MedicalproBranding />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <BlogCard />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>)
  );
}
