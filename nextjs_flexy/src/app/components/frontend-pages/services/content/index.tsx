"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Avatar,
  useTheme,
  alpha
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp,
  Verified,
  LocalShipping,
  ShoppingCart,
  CheckCircle,
  ArrowForward,
  Factory,
  Search,
  Assessment,
  ContactPhone,
  Description,
  Speed,
  Security,
  Language,
  Support,
  Visibility
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DemoModal from '../../homepage/DemoModal';

const services = [
  {
    id: "inspection",
    title: "검품감사",
    subtitle: "전문적인 제3자 검사 및 품질 관리",
    icon: <Verified />,
    color: "primary",
    bgColor: "#f8f9fa",
    borderColor: "#e0e0e0",
    features: [
      "품질검품 (제품 품질 기준 검사)",
      "공장감사 (제조업체 시설 감사)",
      "선적검품 (선적 전 최종 확인)",
      "상세 검사 보고서 제공"
    ],
    process: "검사 신청 → 현장 검사 → 보고서 작성 → 결과 전달",
    applicationUrl: "/application/inspection",
    demoPath: "/frontend-pages/demo/inspection",
    badge: "인기",
    pricing: "1일 29만원",
    stats: { users: "2.3K+", satisfaction: "99%" },
    isActive: true
  },
  {
    id: "market-research",
    title: "시장조사",
    subtitle: "중국 시장의 제품 정보와 가격을 정확하게 조사",
    icon: <TrendingUp />,
    color: "secondary",
    bgColor: "#f8f9fa",
    borderColor: "#e0e0e0",
    features: [
      "제품 단가 조사 및 시장 분석",
      "공급업체 검증 및 선별",
      "품질 기준 확인",
      "MOQ 및 납기 조건 협상"
    ],
    process: "온라인 신청 → 조사 진행 → 보고서 제공",
    applicationUrl: "/application/market-research",
    demoPath: "/frontend-pages/demo/market-research",
    badge: "무료",
    pricing: "무료",
    stats: { users: "1.2K+", satisfaction: "98%" },
    isActive: true
  },
  {
    id: "factory-contact",
    title: "공장컨택",
    subtitle: "이미 알고 있는 공장과의 직접적인 업무 진행",
    icon: <Factory />,
    color: "success",
    bgColor: "#f8f9fa",
    borderColor: "#e0e0e0",
    features: [
      "공장 직접 연결",
      "샘플 제작 지원",
      "대량 주문 처리",
      "품질 관리 및 배송"
    ],
    process: "공장 정보 제공 → 연결 → 업무 진행 → 관리",
    applicationUrl: "/application/factory-contact",
    demoPath: "/frontend-pages/demo/factory-contact",
    badge: null,
    pricing: "수수료 5%",
    stats: { users: "500+", satisfaction: "95%" },
    isActive: true
  },
  {
    id: "purchase-agency",
    title: "구매대행",
    subtitle: "중국 제품의 구매부터 배송까지 원스톱 서비스",
    icon: <ShoppingCart />,
    color: "info",
    bgColor: "#fafafa",
    borderColor: "#f0f0f0",
    features: [
      "타오바오/알리바바 구매대행",
      "가격 협상 및 주문 처리",
      "품질 확인 및 검수",
      "한국 배송 및 통관"
    ],
    process: "제품 선택 → 구매 대행 → 검수 → 배송",
    applicationUrl: "/application/purchase-agency",
    badge: "준비중",
    stats: { users: "준비중", satisfaction: "-" },
    isActive: false
  },
  {
    id: "shipping-agency",
    title: "배송대행",
    subtitle: "중국에서 한국까지 안전하고 빠른 배송 서비스",
    icon: <LocalShipping />,
    color: "error",
    bgColor: "#fafafa",
    borderColor: "#f0f0f0",
    features: [
      "항공/해상 운송 선택",
      "실시간 배송 추적",
      "통관 대행 서비스",
      "도어투도어 배송"
    ],
    process: "배송 신청 → 집하 → 운송 → 통관 → 배송",
    applicationUrl: "/application/shipping-agency",
    badge: "준비중",
    stats: { users: "준비중", satisfaction: "-" },
    isActive: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const ServicesContent = () => {
  const theme = useTheme();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<'market-research' | 'factory-contact' | 'inspection' | null>(null);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');

  const handleOpenModal = (serviceType: 'market-research' | 'factory-contact' | 'inspection', title: string) => {
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
    <Box py={{ xs: 8, md: 12 }}>
      <Container maxWidth="lg">
        {/* 섹션 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Stack spacing={2} alignItems="center" mb={8}>
            <Chip 
              label="OUR SERVICES" 
              color="primary" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: 1,
                px: 2
              }}
            />
            <Typography 
              variant="h2" 
              fontWeight={700}
              textAlign="center"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              한-중 무역의 모든 솔루션
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              textAlign="center"
              maxWidth="600px"
            >
              두리무역은 시장조사부터 배송까지, 중국 무역에 필요한 
              모든 서비스를 원스톱으로 제공합니다
            </Typography>
          </Stack>
        </motion.div>

        {/* 서비스 그리드 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid key={service.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={service.isActive ? 2 : 0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      backgroundColor: service.bgColor,
                      border: `1px solid ${service.borderColor}`,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: service.isActive ? 'pointer' : 'default',
                      opacity: service.isActive ? 1 : 0.7,
                      '&:hover': service.isActive ? {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                        borderColor: theme.palette[service.color].main,
                      } : {}
                    }}
                    onClick={() => service.isActive && router.push(service.applicationUrl)}
                  >
                    {/* 배지 */}
                    {service.badge && (
                      <Chip
                        label={service.badge}
                        size="small"
                        color={service.badge === "준비중" ? "default" : service.color as any}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 600,
                          zIndex: 1
                        }}
                      />
                    )}

                    <Box p={4}>
                      {/* 아이콘 */}
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: alpha(theme.palette[service.color].main, 0.1),
                          color: theme.palette[service.color].main,
                          mb: 3,
                          '& svg': {
                            fontSize: 30
                          }
                        }}
                      >
                        {service.icon}
                      </Avatar>

                      {/* 제목 및 설명 */}
                      <Typography 
                        variant="h5" 
                        fontWeight={700} 
                        color="text.primary"
                        mb={1}
                      >
                        {service.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        mb={3}
                      >
                        {service.subtitle}
                      </Typography>

                      {/* 가격 정보 */}
                      {service.pricing && (
                        <Box 
                          sx={{ 
                            mb: 2,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: service.pricing === "무료" 
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette[service.color].main, 0.05),
                            border: `1px solid ${service.pricing === "무료" 
                              ? alpha(theme.palette.success.main, 0.3)
                              : alpha(theme.palette[service.color].main, 0.2)}`
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight={700} 
                            color={service.pricing === "무료" ? "success.main" : theme.palette[service.color].main}
                            textAlign="center"
                          >
                            {service.pricing}
                          </Typography>
                        </Box>
                      )}

                      {/* 통계 */}
                      {service.stats && service.isActive && (
                        <Stack direction="row" spacing={3} mb={3}>
                          <Box>
                            <Typography variant="h6" fontWeight={700} color={theme.palette[service.color].main}>
                              {service.stats.users}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              이용고객
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={700} color={theme.palette[service.color].main}>
                              {service.stats.satisfaction}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              만족도
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* 기능 목록 */}
                      <Stack spacing={1.5} mb={3}>
                        {service.features.map((feature, idx) => (
                          <Stack 
                            key={idx} 
                            direction="row" 
                            spacing={1} 
                            alignItems="flex-start"
                          >
                            <CheckCircle 
                              sx={{ 
                                fontSize: 18, 
                                color: service.isActive ? theme.palette[service.color].main : 'text.disabled',
                                mt: 0.3
                              }} 
                            />
                            <Typography 
                              variant="body2" 
                              color={service.isActive ? "text.primary" : "text.disabled"}
                              sx={{ lineHeight: 1.6 }}
                            >
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>

                      {/* 프로세스 */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette[service.color].main, 0.05),
                          border: `1px solid ${alpha(theme.palette[service.color].main, 0.2)}`,
                          mb: 3
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          진행 프로세스
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.primary"
                          fontWeight={500}
                        >
                          {service.process}
                        </Typography>
                      </Box>

                      {/* 버튼들 */}
                      <Stack spacing={2}>
                        {/* 샘플보기 버튼 - 활성화된 서비스만 */}
                        {service.isActive && service.demoPath && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color={service.color as any}
                            size="large"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation();
                              const serviceType = service.id === 'market-research' ? 'market-research' :
                                                service.id === 'factory-contact' ? 'factory-contact' :
                                                service.id === 'inspection' ? 'inspection' : null;
                              if (serviceType) {
                                handleOpenModal(serviceType, service.title);
                              }
                            }}
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1.5,
                            }}
                          >
                            샘플보기
                          </Button>
                        )}
                        
                        {/* 서비스 신청 버튼 */}
                        <Button
                          fullWidth
                          variant={service.isActive ? "contained" : "outlined"}
                          color={service.color as any}
                          size="large"
                          endIcon={service.isActive ? <ArrowForward /> : null}
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            py: 1.5,
                          }}
                          disabled={!service.isActive}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (service.isActive) {
                              router.push(service.applicationUrl);
                            }
                          }}
                        >
                          {service.badge === "준비중" ? "준비중" : "서비스 신청"}
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* 추가 정보 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box 
            mt={10} 
            p={5}
            borderRadius={4}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h4" fontWeight={700} color="white" mb={2}>
                  신뢰할 수 있는 한-중 무역 파트너
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.9)">
                  두리무역 전문가가 귀사의 비즈니스에 최적화된 솔루션을 제안해드립니다.
                  지금 바로 상담을 신청하세요.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.9),
                      }
                    }}
                    onClick={() => router.push('/contact')}
                  >
                    무료 상담 신청
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#ffffff', 0.1),
                      }
                    }}
                    onClick={() => router.push('/frontend-pages/calculators')}
                  >
                    요금 계산기
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* 특징 아이콘 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Grid container spacing={4} mt={8}>
            {[
              { icon: <Speed />, title: "빠른 처리", desc: "평균 24시간 내 응답" },
              { icon: <Security />, title: "안전한 거래", desc: "100% 검증된 파트너" },
              { icon: <Language />, title: "실시간 번역", desc: "GPT-5 기반 번역" },
              { icon: <Support />, title: "전담 지원", desc: "1:1 전담 매니저" }
            ].map((item, idx) => (
              <Grid key={idx} size={{ xs: 6, md: 3 }}>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      '& svg': {
                        fontSize: 40
                      }
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Demo Modal */}
      <DemoModal
        open={modalOpen}
        onClose={handleCloseModal}
        serviceType={selectedService}
        serviceTitle={selectedServiceTitle}
      />
    </Box>
  );
};

export default ServicesContent;