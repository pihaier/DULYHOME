'use client';
import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { ApexOptions } from 'apexcharts';
import {
  IconBrain,
  IconChartLine,
  IconShieldLock,
  IconClock24,
  IconArrowUpRight,
  IconDatabase,
  IconRobot,
  IconTrendingUp,
} from '@tabler/icons-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const StatsCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  boxShadow: theme.shadows[9],
  height: '100%',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[20],
  },
}));

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius as number,
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
}));

const AITradeSystem = () => {
  const theme = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // 차트 옵션
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 180,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    colors: [theme.palette.primary.main],
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  const chartSeries = [
    {
      name: 'HS 코드 매칭 정확도',
      data: [82, 85, 87, 89, 90, 92, 94, 94, 95, 96, 96, 97],
    },
  ];

  const tradeStats = [
    {
      icon: <IconBrain />,
      title: 'AI 분석 엔진',
      value: 120,
      suffix: '개',
      label: '검증 항목',
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light,
      description: '머신러닝 기반 리스크 분석',
    },
    {
      icon: <IconChartLine />,
      title: '예측 정확도',
      value: 95,
      suffix: '%',
      label: '성공률',
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light,
      description: '10년 데이터 학습 결과',
    },
    {
      icon: <IconShieldLock />,
      title: '보안 거래',
      value: 1000,
      suffix: '+',
      label: '안전 거래',
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light,
      description: '블록체인 검증 시스템',
    },
    {
      icon: <IconClock24 />,
      title: '실시간 모니터링',
      value: 24,
      suffix: '/7',
      label: '무중단 서비스',
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light,
      description: '자동 알림 시스템',
    },
  ];

  const systemFeatures = [
    {
      title: 'HS 코드 추정',
      value: 95,
      icon: <IconDatabase size={20} />,
      description: '상품 설명·스펙 기반 자동 분류(자신감 점수 제공)',
    },
    {
      title: '세금 자동 계산',
      value: 100,
      icon: <IconRobot size={20} />,
      description: '관세·부가세·통관수수료·물류비 예측',
    },
    {
      title: '리스크 관리',
      value: 92,
      icon: <IconShieldLock size={20} />,
      description: '금지/제한 품목·인증 필요 여부 사전 점검',
    },
    {
      title: 'ROI 최적화',
      value: 470,
      icon: <IconTrendingUp size={20} />,
      description: '데이터 기반 수익 극대화 전략',
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, sm: 12, lg: 16 },
        mt: { xs: 4, lg: 6 },
        mb: { xs: 4, lg: 6 },
        background:
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
            : theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            textAlign="center"
            fontWeight={700}
            sx={{
              fontSize: { xs: '28px', sm: '36px', lg: '44px' },
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI HS 코드·관세 인텔리전스
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            상품 설명 → HS 코드 추정 → 관세/부가세/통관비 자동 계산까지 원클릭
          </Typography>
        </motion.div>

        {/* 메인 통계 카드 */}
        <Grid container spacing={3} mb={6}>
          {tradeStats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <StatsCard>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: stat.bgColor,
                          color: stat.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                          bgcolor: theme.palette.success.light,
                          color: theme.palette.success.dark,
                          fontWeight: 600,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.6 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      />
                    </Stack>

                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {stat.title}
                    </Typography>

                    <Box display="flex" alignItems="baseline" mb={1}>
                      <Typography variant="h3" fontWeight={700} color={stat.color}>
                        <CountUp end={stat.value} duration={2} separator="," suffix={stat.suffix} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" ml={1}>
                        {stat.label}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* 실시간 차트 섹션 */}
        <Grid container spacing={3} mb={6}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StatsCard>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>
                        HS 코드 매칭 추이
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        최근 12개월 정확도
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconArrowUpRight size={20} color={theme.palette.success.main} />
                      <Typography variant="h6" color="success.main" fontWeight={600}>
                        +2.3%
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* 성능/SEO: inView일 때만 차트 렌더 */}
                  {inView && (
                    <Chart options={chartOptions} series={chartSeries} type="area" height={180} />
                  )}
                </CardContent>
              </StatsCard>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3} height="100%">
              {systemFeatures.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  style={{ flex: 1 }}
                >
                  <MetricCard>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      {feature.icon}
                      <Typography variant="h6" fontWeight={600}>
                        {feature.title}
                      </Typography>
                    </Stack>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption">성능 지표</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {feature.value}
                          {feature.value > 100 ? '%' : '%'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={feature.value > 100 ? 100 : feature.value}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {feature.description}
                    </Typography>
                  </MetricCard>
                </motion.div>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* 하단 기능 카드 */}
        <Grid container spacing={3}>
          {systemFeatures.slice(2).map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <StatsCard>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {feature.value}
                        {feature.value > 100 ? '%' : '%'}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={feature.value > 100 ? 100 : feature.value}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </CardContent>
                </StatsCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AITradeSystem;
