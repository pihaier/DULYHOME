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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  TrendingUp,
  Language,
  Security,
  Speed,
  SupportAgent,
  Download,
  Business,
  People,
  WorkspacePremium,
} from "@mui/icons-material";
import Image from "next/image";

const CompanyIntro = () => {
  const advantages = [
    {
      icon: <TrendingUp />,
      title: "7년간의 검증된 경험",
      description: "2018년부터 쌓아온 한-중 무역 전문 노하우로 안전하고 신뢰할 수 있는 서비스를 제공합니다."
    },
    {
      icon: <Language />,
      title: "원활한 소통",
      description: "현지 중국 직원과 한국 전담팀의 완벽한 이중 언어 서비스로 의사소통 문제를 해결합니다."
    },
    {
      icon: <Security />,
      title: "투명한 프로세스",
      description: "모든 진행 과정을 실시간으로 확인할 수 있는 체계적인 관리 시스템을 운영합니다."
    },
    {
      icon: <Speed />,
      title: "빠른 처리 속도",
      description: "효율적인 업무 프로세스로 시장조사부터 검품감사까지 신속하게 처리합니다."
    },
    {
      icon: <SupportAgent />,
      title: "전담 고객 지원",
      description: "프로젝트별 전담 매니저가 배정되어 처음부터 끝까지 책임지고 관리합니다."
    },
    {
      icon: <CheckCircle />,
      title: "품질 보증",
      description: "엄격한 품질 관리 기준과 제3자 검증을 통해 최고 품질의 제품만을 취급합니다."
    }
  ];

  const companyInfo = [
    { icon: <Business />, label: "설립연도", value: "2018년" },
    { icon: <People />, label: "누적 고객사", value: "1,000+" },
    { icon: <WorkspacePremium />, label: "전문 인력", value: "한국팀 5명, 중국팀 10명" },
  ];

  return (
    <Box sx={{ py: { xs: 6, lg: 10 }, backgroundColor: "grey.50" }}>
      <Container sx={{ maxWidth: "1400px !important" }}>
        <Grid container spacing={6}>
          {/* 회사 소개 텍스트 */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={4}>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                두리무역 소개
              </Typography>
              
              {/* 회사 기본 정보 */}
              <Card sx={{ backgroundColor: "primary.light", mb: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    {companyInfo.map((info, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ color: "primary.main" }}>{info.icon}</Box>
                        <Typography variant="body1">
                          <strong>{info.label}:</strong> {info.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Typography variant="body1" lineHeight={1.8} color="text.secondary">
                <strong>두리무역</strong>은 2018년 설립 이래 <strong>7년간</strong> 한-중 무역 분야에서 
                축적한 전문성을 바탕으로, 중소기업과 개인 사업자들이 중국 시장에 안전하고 
                효율적으로 진출할 수 있도록 돕는 <strong>무역 전문 서비스 기업</strong>입니다.
              </Typography>
              
              <Typography variant="body1" lineHeight={1.8} color="text.secondary">
                광저우와 서울에 사무실을 운영하며, <strong>현지 중국 직원 10명</strong>과 
                <strong>한국 전담팀 5명</strong>이 긴밀하게 협력하여 고객의 성공적인 
                중국 무역을 지원합니다. 복잡한 중국 시장에서 발생할 수 있는 언어 장벽, 
                품질 문제, 신뢰성 이슈를 완벽하게 해결합니다.
              </Typography>
              
              <Typography variant="body1" lineHeight={1.8} color="text.secondary">
                <strong>1,000개 이상의 기업</strong>이 두리무역과 함께 성공적인 중국 무역을 
                진행했으며, 시장조사부터 검품감사까지 <strong>원스톱 토탈 솔루션</strong>을 
                통해 고객의 시간과 비용을 절약합니다.
              </Typography>
            </Stack>
          </Grid>

          {/* 사무실 이미지 */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={4}>
              <Typography variant="h4" fontWeight={700}>
                두리무역 네트워크
              </Typography>
              <Card sx={{ overflow: "hidden", boxShadow: 3 }}>
                <Box sx={{ position: "relative", width: "100%", height: 400 }}>
                  <Image
                    src="/images/about/office.jpg"
                    alt="두리무역 네트워크"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* 핵심 서비스 */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Stack spacing={3} alignItems="center" textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700}>
              핵심 서비스
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "800px" }}>
              두리무역은 중국 무역의 전 과정을 체계적으로 지원합니다
            </Typography>
          </Stack>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
                  시장조사
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  중국 시장의 제품 정보와 가격을 정확하게 조사하여 최적의 공급업체를 찾아드립니다
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
                  공장컨택
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  검증된 공장과의 직접 연결을 통해 샘플 제작부터 대량 생산까지 안전하게 진행합니다
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
                  검품감사
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  전문적인 제3자 검사를 통해 제품 품질과 공장 시설을 철저히 검증합니다
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3, backgroundColor: "grey.100" }}>
                <Typography variant="h5" fontWeight={700} color="text.secondary" mb={2}>
                  배송대행
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  준비중 - 중국에서 한국까지 안전하고 빠른 배송 서비스
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 경쟁 우위 */}
        <Box sx={{ mt: 8 }}>
          <Stack spacing={3} alignItems="center" textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700}>
              두리무역의 경쟁 우위
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "800px" }}>
              오랜 경험과 전문성을 바탕으로 고객에게 차별화된 가치를 제공합니다
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {advantages.map((advantage, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Card 
                  sx={{ 
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Stack spacing={2} alignItems="center">
                      <Box
                        sx={{
                          color: "primary.main",
                          backgroundColor: "primary.light",
                          borderRadius: "50%",
                          p: 2,
                          display: "flex"
                        }}
                      >
                        {advantage.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {advantage.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        lineHeight={1.6}
                      >
                        {advantage.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CompanyIntro;