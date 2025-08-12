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
  Button,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  Verified,
  ShoppingCart,
  LocalShipping,
  ArrowForward,
} from "@mui/icons-material";

const ServiceHighlights = () => {
  const services = [
    {
      id: "market-research",
      title: "시장조사",
      category: "수입대행",
      subtitle: "중국 시장 제품 정보 및 가격 조사",
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: "#1976d2",
      highlights: [
        "제품 단가 및 시장 분석",
        "공급업체 검증",
        "품질 기준 확인"
      ],
      applicationUrl: "/application/import-agency/market-research",
      popular: true
    },
    {
      id: "sampling",
      title: "샘플링",
      category: "수입대행",
      subtitle: "제품 샘플을 통한 품질 검증",
      icon: <Verified sx={{ fontSize: 32 }} />,
      color: "#388e3c",
      highlights: [
        "제품 샘플 수급",
        "품질 검증 및 테스트",
        "한국 배송 및 통관"
      ],
      applicationUrl: "/application/sampling",
      popular: false
    },
    {
      id: "bulk-order",
      title: "대량주문",
      category: "수입대행",
      subtitle: "검증된 제품의 대량 구매 및 수입",
      icon: <ShoppingCart sx={{ fontSize: 32 }} />,
      color: "#f57c00",
      highlights: [
        "대량 주문 협상",
        "최적 가격 확보",
        "품질 관리 및 검수"
      ],
      applicationUrl: "/application/bulk-order",
      popular: false
    },
    {
      id: "inspection",
      title: "검품감사",
      category: "품질관리",
      subtitle: "전문적인 제3자 검사 및 품질 관리",
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      color: "#7b1fa2",
      highlights: [
        "품질검품 서비스",
        "공장감사 서비스",
        "선적검품 서비스"
      ],
      applicationUrl: "/application/inspection",
      popular: true
    }
  ];

  return (
    <Box sx={{ py: { xs: 6, lg: 10 } }}>
      <Container sx={{ maxWidth: "1400px !important" }}>
        {/* 섹션 헤더 */}
        <Stack spacing={3} alignItems="center" textAlign="center" mb={8}>
          <Typography variant="h3" fontWeight={700}>
            서비스 하이라이트
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: "800px" }}
          >
            고객의 다양한 요구사항에 맞춘 4가지 전문 서비스를 제공하여<br />
            성공적인 중국 진출을 지원합니다
          </Typography>
        </Stack>

        {/* 서비스 카드 */}
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={service.id}>
              <Card 
                sx={{ 
                  height: "100%",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 4
                  },
                  overflow: "visible"
                }}
              >
                {service.popular && (
                  <Chip
                    label="인기"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: 16,
                      backgroundColor: service.color,
                      color: "white",
                      fontWeight: 600,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* 서비스 헤더 */}
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box 
                        sx={{ 
                          color: service.color,
                          backgroundColor: `${service.color}15`,
                          borderRadius: 2,
                          p: 1.5,
                          display: "flex"
                        }}
                      >
                        {service.icon}
                      </Box>
                      <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Chip 
                            label={service.category}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: service.color,
                              color: service.color,
                              fontSize: "0.75rem"
                            }}
                          />
                        </Stack>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {service.title}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {service.subtitle}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* 서비스 특징 */}
                    <Box>
                      <Stack spacing={1}>
                        {service.highlights.map((highlight, idx) => (
                          <Typography 
                            key={idx}
                            variant="body2" 
                            sx={{ 
                              pl: 2,
                              position: "relative",
                              "&::before": {
                                content: '"•"',
                                position: "absolute",
                                left: 0,
                                color: service.color,
                                fontWeight: "bold"
                              }
                            }}
                          >
                            {highlight}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    {/* 신청 버튼 */}
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<ArrowForward />}
                      href={service.applicationUrl}
                      sx={{
                        backgroundColor: service.color,
                        "&:hover": {
                          backgroundColor: service.color,
                          filter: "brightness(0.9)"
                        },
                        py: 1.5,
                        mt: 2
                      }}
                    >
                      {service.title} 신청하기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 하단 CTA */}
        <Box sx={{ mt: 8 }}>
          <Card 
            sx={{ 
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              textAlign: "center"
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h4" fontWeight={700}>
                  맞춤형 서비스 상담
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: "600px" }}>
                  고객님의 비즈니스에 최적화된 서비스 조합을 제안해드립니다.<br />
                  전문 상담을 통해 효율적인 중국 진출 전략을 수립하세요.
                </Typography>
                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button 
                    variant="outlined" 
                    size="large"
                    href="/frontend-pages/contact"
                    sx={{ 
                      borderColor: "white", 
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255,255,255,0.1)"
                      },
                      minWidth: 160
                    }}
                  >
                    문의하기
                  </Button>
                  <Button 
                    variant="contained" 
                    size="large"
                    href="/auth/customer/register"
                    sx={{ 
                      backgroundColor: "white", 
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "grey.100"
                      },
                      minWidth: 160
                    }}
                  >
                    회원가입
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ServiceHighlights;