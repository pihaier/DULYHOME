"use client";
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Card,
  CardContent,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LocalShipping,
  Speed,
  Security,
  CheckCircleOutline,
  TrendingDown,
  Map,
  Schedule,
  AccountTree,
} from "@mui/icons-material";
import Image from "next/image";

const ShippingShowcase = () => {
  const shippingFeatures = [
    {
      icon: <Map sx={{ fontSize: 40 }} />,
      title: "AI 기반 최적 루트 설계",
      description: "머신러닝으로 최적의 운송 경로를 자동 설계하여 운송 시간을 단축합니다",
      highlight: "평균 30% 시간 단축",
      color: "#1976d2",
      bgColor: "rgba(25, 118, 210, 0.1)",
    },
    {
      icon: <TrendingDown sx={{ fontSize: 40 }} />,
      title: "물류비 최대 70% 절감",
      description: "다년간의 물류 네트워크와 대량 운송 계약으로 최저가를 보장합니다",
      highlight: "업계 최저가 보장",
      color: "#388e3c",
      bgColor: "rgba(56, 142, 60, 0.1)",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "리스크 제로 통관 서비스",
      description: "전문 통관사와 협업하여 100% 안전한 통관을 진행합니다",
      highlight: "통관 성공률 99.9%",
      color: "#f57c00",
      bgColor: "rgba(245, 124, 0, 0.1)",
    },
  ];

  const processSteps = [
    { step: 1, title: "견적 요청", description: "온라인으로 간편하게 견적 신청" },
    { step: 2, title: "최적 루트 설계", description: "AI가 최적의 운송 경로 제안" },
    { step: 3, title: "실시간 추적", description: "화물 위치를 실시간으로 확인" },
    { step: 4, title: "안전 배송 완료", description: "문앞까지 안전하게 배송" },
  ];

  return (
    <Box 
      sx={{ 
        py: { xs: 6, lg: 10 }, 
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 80% 50%, rgba(245, 124, 0, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        }
      }}
    >
      <Container sx={{ maxWidth: "1400px !important", position: "relative", zIndex: 1 }}>
        {/* 섹션 헤더 */}
        <Stack spacing={3} alignItems="center" textAlign="center" mb={8}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: "primary.main",
              fontWeight: 600,
              letterSpacing: 2,
              fontSize: "14px"
            }}
          >
            SHIPPING SERVICE
          </Typography>
          <Typography variant="h2" fontWeight={700}>
            스마트 배송대행 서비스
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: "700px" }}
          >
            AI 기반 최적 루트 설계로 물류비는 줄이고, 배송 속도는 높입니다
          </Typography>
        </Stack>

        {/* 메인 콘텐츠 */}
        <Grid container spacing={4} mb={8}>
          {/* 왼쪽: 이미지 섹션 */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              {/* 메인 이미지 */}
              <Card 
                sx={{ 
                  overflow: "hidden", 
                  borderRadius: 3,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  }
                }}
              >
                <Box
                  sx={{
                    height: 400,
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "-50%",
                      right: "-50%",
                      width: "200%",
                      height: "200%",
                      background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                      animation: "pulse 3s ease-in-out infinite",
                    }
                  }}
                >
                  <Stack spacing={3} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                    <LocalShipping sx={{ fontSize: 120, color: "white" }} />
                    <Typography
                      variant="h3"
                      color="white"
                      fontWeight={700}
                      textAlign="center"
                    >
                      물류비 70% 절감
                    </Typography>
                    <Typography
                      variant="h6"
                      color="white"
                      sx={{ opacity: 0.9 }}
                    >
                      스마트 물류 시스템
                    </Typography>
                  </Stack>
                </Box>
              </Card>

              {/* 통계 카드들 */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "primary.light" }}>
                    <Typography variant="h3" color="primary.main" fontWeight={700}>
                      99.9%
                    </Typography>
                    <Typography variant="body2">통관 성공률</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.light" }}>
                    <Typography variant="h3" color="success.main" fontWeight={700}>
                      30%
                    </Typography>
                    <Typography variant="body2">시간 단축</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "warning.light" }}>
                    <Typography variant="h3" color="warning.main" fontWeight={700}>
                      24/7
                    </Typography>
                    <Typography variant="body2">실시간 추적</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* 오른쪽: 기능 설명 */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              {shippingFeatures.map((feature, index) => (
                <Card key={index} sx={{ transition: "all 0.3s", "&:hover": { transform: "translateX(10px)" } }}>
                  <CardContent>
                    <Stack direction="row" spacing={3} alignItems="flex-start">
                      <Box sx={{ color: "primary.main" }}>
                        {feature.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {feature.description}
                        </Typography>
                        <Paper 
                          sx={{ 
                            display: "inline-block",
                            px: 2, 
                            py: 1, 
                            bgcolor: "primary.light",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {feature.highlight}
                          </Typography>
                        </Paper>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* 프로세스 단계 */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>
            간편한 배송 프로세스
          </Typography>
          <Grid container spacing={3}>
            {processSteps.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.step}>
                <Stack alignItems="center" spacing={2} textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 700,
                    }}
                  >
                    {step.step}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                  {index < processSteps.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: "none", md: "block" },
                        position: "absolute",
                        top: 40,
                        right: -20,
                        width: 40,
                        height: 2,
                        bgcolor: "primary.main",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          right: -8,
                          top: -4,
                          width: 0,
                          height: 0,
                          borderTop: "5px solid transparent",
                          borderBottom: "5px solid transparent",
                          borderLeft: "8px solid",
                          borderLeftColor: "primary.main",
                        },
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA 섹션 */}
        <Card 
          sx={{ 
            p: 5, 
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight={700} gutterBottom>
            지금 바로 배송비를 절감하세요
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            AI 최적화 시스템으로 물류비 70% 절감 효과를 경험해보세요
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
              href="/application/shipping"
            >
              배송 견적 받기
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
              href="/frontend-pages/calculators"
            >
              물류비 계산기
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default ShippingShowcase;