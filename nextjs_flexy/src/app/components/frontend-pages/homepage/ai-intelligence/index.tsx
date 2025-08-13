'use client';
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import {
  IconBrain,
  IconChartLine,
  IconClock,
  IconShieldCheck,
  IconLanguage,
  IconRobot,
  IconEye,
} from '@tabler/icons-react';
import CountUp from 'react-countup';
import { useRouter } from 'next/navigation';
import DemoModal from '../DemoModal';

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: (theme.shape.borderRadius as number) * 2,
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const services = [
  {
    icon: <IconBrain size={30} />,
    title: '시장조사',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    subtitle: '제품 단가·공급망 데이터 기반 분석',
    description: '공장 검증 및 가격 비교 리포트',
    highlight: '최적 파트너 선별',
    stats: '95%',
    statLabel: '정확도',
    demoPath: '/frontend-pages/demo/market-research',
  },
  {
    icon: <IconChartLine size={30} />,
    title: '공장컨택',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    subtitle: '직접 컨택 및 조건 협상',
    description: '표준 계약 및 조건 정리',
    highlight: '리스크 최소화 계약',
    stats: '92%',
    statLabel: '협상 성공률',
    demoPath: '/frontend-pages/demo/factory-contact',
  },
  {
    icon: <IconShieldCheck size={30} />,
    title: '검품감사',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    subtitle: '제3자 검품 및 공장 실사',
    description: '3단계 크로스 체크 및 리포트',
    highlight: '불량 사전 차단',
    stats: '100%',
    statLabel: '투명 보고',
    demoPath: '/frontend-pages/demo/inspection',
  },
  {
    icon: <IconClock size={30} />,
    title: '구매·배송대행',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    subtitle: '시스템 업데이트 중',
    description: '1688 로그인 및 구매기록 연동 예정',
    highlight: '',
    stats: '0%',
    statLabel: '서비스 상태',
    demoPath: null,
  },
];

const coreFeatures = [
  {
    icon: <IconRobot size={24} />,
    title: 'AI 기반 분석 시스템',
    description: '120개 항목 교차 검증으로 95% 리스크 필터링',
    color: '#6366f1',
  },
  {
    icon: <IconLanguage size={24} />,
    title: '실시간 AI 통번역',
    description: 'GPT 기반 한중 실시간 통번역 시스템',
    color: '#8b5cf6',
  },
  {
    icon: <IconClock size={24} />,
    title: '원클릭 통합 관리',
    description: '구매부터 배송까지 하나의 플랫폼에서',
    color: '#06b6d4',
  },
  {
    icon: <IconChartLine size={24} />,
    title: '470% ROI 실현',
    description: '7년간 검증된 수익 극대화 시스템',
    color: '#10b981',
  },
];

const AIIntelligenceSystem = () => {
  const theme = useTheme();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<
    'market-research' | 'factory-contact' | 'inspection' | null
  >(null);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');

  const handleOpenModal = (
    serviceType: 'market-research' | 'factory-contact' | 'inspection',
    title: string
  ) => {
    setSelectedService(serviceType);
    setSelectedServiceTitle(title);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedService(null);
    setSelectedServiceTitle('');
  };

  return (
    <>
      <Box
        sx={{
          py: { xs: 10, sm: 12, lg: 16 },
          mt: { xs: 4, lg: 6 },
          mb: { xs: 4, lg: 6 },
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 40%, #f1f5f9 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          {/* 헤더 섹션 */}
          <Grid container spacing={3} justifyContent="center" mb={8}>
            <Grid size={{ xs: 12, lg: 10 }}>
              <Typography
                variant="h2"
                textAlign="center"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '32px', sm: '40px', lg: '48px' },
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                두리무역 인텔리전스 시스템
              </Typography>
              <Typography
                variant="h6"
                textAlign="center"
                color="text.secondary"
                sx={{ fontSize: { xs: '16px', sm: '18px' } }}
              >
                AI 기반 무역 데이터 분석으로 최적의 비즈니스 결정을 지원합니다
              </Typography>
            </Grid>
          </Grid>

          {/* 서비스 카드 그리드 */}
          <Grid container spacing={3} mb={8}>
            {services.map((service, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatsCard sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <IconBox sx={{ backgroundColor: service.bgColor }}>
                      <Box sx={{ color: service.color }}>{service.icon}</Box>
                    </IconBox>

                    <Typography variant="h5" fontWeight={700} mb={1}>
                      {service.title}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                      {service.subtitle}
                    </Typography>

                    <Box mb={3} sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        • {service.description}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        • {service.highlight}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {service.statLabel}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={service.color}>
                          <CountUp end={parseInt(service.stats)} duration={2} suffix="%" />
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parseInt(service.stats)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: service.bgColor,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: service.color,
                            borderRadius: 3,
                          },
                          mb: 2,
                        }}
                      />
                      {service.demoPath && (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<IconEye size={18} />}
                          onClick={() => {
                            const serviceType = service.demoPath.includes('market-research')
                              ? 'market-research'
                              : service.demoPath.includes('factory-contact')
                                ? 'factory-contact'
                                : service.demoPath.includes('inspection')
                                  ? 'inspection'
                                  : null;
                            if (serviceType) {
                              handleOpenModal(serviceType, service.title);
                            }
                          }}
                          sx={{
                            backgroundColor: service.color,
                            '&:hover': {
                              backgroundColor: service.color,
                              opacity: 0.9,
                            },
                          }}
                        >
                          샘플보기
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
            ))}
          </Grid>

          {/* 핵심 기능 섹션 */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 4,
              p: { xs: 4, sm: 6 },
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            <Typography variant="h4" textAlign="center" color="white" fontWeight={700} mb={4}>
              중국 무역의 새로운 기준
            </Typography>

            <Grid container spacing={3}>
              {coreFeatures.map((feature, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 3,
                      height: '100%',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'white',
                          color: feature.color,
                          width: 40,
                          height: 40,
                          mr: 2,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" color="white" fontWeight={600}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* 데모 모달 */}
      <DemoModal
        open={modalOpen}
        onClose={handleCloseModal}
        serviceType={selectedService}
        title={selectedServiceTitle}
      />
    </>
  );
};

export default AIIntelligenceSystem;
