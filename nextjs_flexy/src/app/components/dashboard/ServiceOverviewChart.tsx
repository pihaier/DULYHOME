'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Stack, Avatar, Skeleton } from '@mui/material';
import DashboardCard from '../shared/DashboardCard';
import { IconSearch, IconBuildingFactory, IconClipboardList } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

interface ServiceData {
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const ServiceOverviewChart = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [chartData, setChartData] = useState({
    series: [0, 0, 0],
    labels: ['시장조사', '공장컨택', '검품감사'],
  });

  useEffect(() => {
    fetchServiceData();
  }, []);

  const fetchServiceData = async () => {
    try {
      const supabase = createClient();

      // 각 서비스별 총 건수 조회
      const { count: marketResearchCount } = await supabase
        .from('market_research_requests')
        .select('*', { count: 'exact', head: true });

      const { count: factoryContactCount } = await supabase
        .from('factory_contact_requests')
        .select('*', { count: 'exact', head: true });

      const { count: inspectionCount } = await supabase
        .from('inspection_applications')
        .select('*', { count: 'exact', head: true });

      const data: ServiceData[] = [
        {
          name: '시장조사',
          count: marketResearchCount || 0,
          icon: <IconSearch size={20} />,
          color: theme.palette.primary.main,
        },
        {
          name: '공장컨택',
          count: factoryContactCount || 0,
          icon: <IconBuildingFactory size={20} />,
          color: theme.palette.secondary.main,
        },
        {
          name: '검품감사',
          count: inspectionCount || 0,
          icon: <IconClipboardList size={20} />,
          color: theme.palette.success.main,
        },
      ];

      setServiceData(data);
      setChartData({
        series: data.map((d) => d.count),
        labels: data.map((d) => d.name),
      });
    } catch (error) {
      console.error('Error fetching service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const optionsDonutChart: ApexCharts.ApexOptions = {
    chart: {
      id: 'donut-chart',
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '18px',
              color: undefined,
              offsetY: 5,
            },
            value: {
              show: false,
            },
            total: {
              show: true,
              label: '전체',
              color: theme.palette.text.secondary,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toString() + '건';
              },
            },
          },
        },
      },
    },
    legend: {
      show: false,
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main],
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    labels: chartData.labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
  };

  return (
    <DashboardCard title="서비스별 신청 현황" subtitle="전체 서비스 신청 분포">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      ) : (
        <>
          <Box mt="-10px">
            <Chart
              options={optionsDonutChart}
              series={chartData.series}
              type="donut"
              height={260}
            />
          </Box>
          <Stack direction="row" spacing={2} justifyContent="space-between" mt={2}>
            {serviceData.map((service) => (
              <Stack key={service.name} direction="row" alignItems="center" spacing={1}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `${service.color}20`,
                    color: service.color,
                  }}
                >
                  {service.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    {service.count}건
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.name}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </DashboardCard>
  );
};

export default ServiceOverviewChart;
