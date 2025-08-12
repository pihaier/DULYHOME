import { Box, CardContent, Card, Typography, Stack, Grid } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import React from "react";
import { ApexOptions } from "apexcharts";

const Customers = () => {
  const theme = useTheme();
  // chart
  const optionsmonthlychart: ApexOptions = {
    grid: {
      show: true,
      borderColor: 'transparent',
      strokeDashArray: 2,
      padding: {
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: '#adb0bb',
      fontFamily: "'DM Sans',sans-serif",
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 2,
      curve: 'smooth',
      colors: ['#fff'],
    },
    tooltip: {
      theme: 'dark',
    },
  };
  const seriesmonthlychart = [
    {
      name: 'Monthly Sales',
      data: [1, 19, 3, 13, 2, 19],
    },
  ];

  return (
    <>
      <Card
        sx={{
          backgroundColor: () => theme.palette.secondary.main,
          color: 'white',
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            mb={0}
          >
            Customers
          </Typography>
          <Box mt="20px">
            <Chart
              options={optionsmonthlychart}
              series={seriesmonthlychart}
              type="line"
              height="55px"
            />
          </Box>
          <Box
            mt="15px"
            sx={{
              display: {
                sm: 'flex',
                xs: 'block',
              },
              alignItems: 'flex-end',
            }}
          >
            <Typography
              sx={{
                marginTop: '8px',
                marginBottom: '0px',
                position: 'relative',
                zIndex: 9,
              }}
              variant="h2"
              gutterBottom
            >
              750
            </Typography>
            <Box ml="10px">
              <IconArrowUpLeft width={18} height={18} />
            </Box>

            <Typography
              fontWeight="500"
              sx={{
                lineHeight: '30px',
                position: 'relative',
                zIndex: 9,
                marginTop: '12px',
                marginBottom: '0px',
              }}
              variant="h6"
              gutterBottom
            >
              +9 this week
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default Customers;
