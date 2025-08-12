import React from "react";
import { Typography, Box, Stack, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "../../shared/DashboardCard";
import ThemeSelect from "../dashboard1/ThemeSelect";
import { ApexOptions } from "apexcharts";

const RevenueUpdates = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const optionsrevenue: ApexOptions = {
    grid: {
      show: true,
      borderColor: "rgba(0, 0, 0, .2)",

      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: "#adb0bb",
      fontFamily: "'DM Sans',sans-serif;",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: [primary, secondary],
    legend: {
      show: false,
    },
    xaxis: {
      categories: [
        "16/08",
        "17/08",
        "18/08",
        "19/08",
        "20/08",
        "21/08",
        "22/08",
        "23/08",
      ],
    },
    markers: {
      size: 4,
      strokeWidth: 1,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
      theme: "dark",
    },
  };
  const seriesrevenue = [
    {
      name: "Earnings",
      data: [0, 5, 6, 8, 25, 9, 11, 24],
    },
    {
      name: "Expense",
      data: [0, 3, 1, 2, 8, 1, 5, 1],
    },
  ];
  return (
    <DashboardCard title="Revenue Updates" action={<ThemeSelect />}>
      <>
        <Box>
          <Chart
            options={optionsrevenue}
            series={seriesrevenue}
            type="line"
            height={285}
            width={"100%"}
          />
        </Box>
        <Stack spacing={3} mt={3} direction="row" justifyContent="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 9,
                height: 9,
                bgcolor: primary,
                svg: { display: "none" },
              }}
            ></Avatar>
            <Typography variant="subtitle2" color="primary.main">
              Earnings
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 9,
                height: 9,
                bgcolor: secondary,
                svg: { display: "none" },
              }}
            ></Avatar>
            <Typography variant="subtitle2" color="secondary.main">
              Expense
            </Typography>
          </Stack>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default RevenueUpdates;
