'use client';
import React from "react";
import { 
  Box, 
  Grid, 
  Typography, 
  Container, 
  Stack, 
  Button,
  Card,
  CardContent,
  Chip,
  Avatar
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { 
  IconSearch,
  IconGift,
  IconCheck,
  IconArrowRight,
  IconUsers,
  IconCalendarStats,
  IconFileAnalytics
} from "@tabler/icons-react";
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const GuaranteeCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  border: '2px solid',
  borderColor: theme.palette.primary.main,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: theme.spacing(2),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10],
  }
}));

const BenefitBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.15)',
    transform: 'translateX(5px)',
  }
}));

const C2aEnhanced = () => {
  const theme = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const guarantees = [
    {
      icon: <IconCalendarStats size={30} />,
      value: 7,
      suffix: '년',
      label: '검증된 경험',
      color: theme.palette.primary.main
    },
    {
      icon: <IconUsers size={30} />,
      value: 1000,
      suffix: '+',
      label: '파트너 기업',
      color: theme.palette.success.main
    },
    {
      icon: <IconFileAnalytics size={30} />,
      value: 98,
      suffix: '%',
      label: '고객 만족도',
      color: theme.palette.info.main
    },
  ];

  const freeServices = [
    '시장 조사 리포트 제공',
    '업체 추천 및 검증',
    '초기 상담 및 컨설팅',
    '견적 비교 분석'
  ];

  return (
    <Box 
      ref={ref}
      sx={{
        py: { xs: 8, sm: 10, lg: 12 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 패턴 */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* 왼쪽 콘텐츠 */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* 무료 서비스 뱃지 */}
              <Chip 
                icon={<IconGift />}
                label="시장조사 무료 서비스"
                sx={{
                  mb: 3,
                  px: 2,
                  py: 3,
                  fontSize: '16px',
                  fontWeight: 700,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
              
              <Typography 
                variant="h2" 
                fontWeight={700}
                sx={{
                  fontSize: { xs: '32px', sm: '40px', lg: '48px' },
                  color: 'white',
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                중국 무역의 첫걸음,
                <br />
                <Box component="span" sx={{ color: theme.palette.warning.light }}>
                  무료 시장조사
                </Box>
                부터 시작하세요
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                리스크 없이 시작하는 중국 무역, 전문가의 시장 분석과
                업체 검증 서비스를 무료로 제공합니다
              </Typography>

              {/* 무료 서비스 목록 */}
              <Stack spacing={2} mb={4}>
                {freeServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  >
                    <BenefitBox>
                      <IconCheck size={20} color={theme.palette.success.light} />
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                        {service}
                      </Typography>
                    </BenefitBox>
                  </motion.div>
                ))}
              </Stack>
              
              {/* CTA 버튼 */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<IconSearch />}
                    sx={{
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 700,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                    href="/auth/customer/login"
                  >
                    무료 시장조사 신청
                  </Button>
                </motion.div>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  endIcon={<IconArrowRight />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                  href="/frontend-pages/contact"
                >
                  상담 문의
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          
          {/* 오른쪽 보장 카드 */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              {guarantees.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <GuaranteeCard>
                    <CardContent>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: `${item.color}20`,
                          color: item.color,
                          width: 60,
                          height: 60
                        }}>
                          {item.icon}
                        </Avatar>
                        <Box flex={1} textAlign="left">
                          <Typography variant="h3" fontWeight={700} color={item.color}>
                            <CountUp 
                              end={item.value} 
                              duration={2} 
                              separator="," 
                              suffix={item.suffix}
                            />
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            {item.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </GuaranteeCard>
                </motion.div>
              ))}
            </Stack>
          </Grid>
        </Grid>
        
        {/* 하단 신뢰 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box 
            sx={{ 
              mt: 6, 
              pt: 4, 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}
          >
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              두리무역은 <Box component="span" sx={{ fontWeight: 700, color: 'white' }}>정직</Box>과{' '}
              <Box component="span" sx={{ fontWeight: 700, color: 'white' }}>신뢰</Box>를 바탕으로{' '}
              <Box component="span" sx={{ fontWeight: 700, color: theme.palette.warning.light }}>
                투명한 가격 정책
              </Box>을 약속합니다
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default C2aEnhanced;