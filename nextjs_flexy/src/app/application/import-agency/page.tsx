'use client';

import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

// 서비스 정보
const services = [
  {
    id: 'market-research',
    title: '시장조사',
    description: '중국 제조 공장과 직접 소통하여 맞춤형 제품 제조 가능성과 조건을 상세 조사합니다.',
    features: [
      '제조 공장 직접 컨택 및 조사',
      '커스터마이징 가능 여부 확인',
      '박스제작/로고인쇄 등 부가서비스',
      '인증서류/품질검증 지원',
      '통관서류 및 관세율 안내',
    ],
    price: '무료',
    period: '3-5일',
    image: '/images/services/market-research.jpg',
    route: '/application/import-agency/market-research',
    color: 'primary',
  },
  {
    id: 'sampling',
    title: '샘플링',
    description:
      '제조 단계부터 관여하여 고객 요구사항에 맞는 맞춤형 샘플을 제작하고 품질을 검증합니다.',
    features: [
      '맞춤형 샘플 제작 요청',
      '제조 공장과 직접 협의',
      '특별 요청사항 반영',
      '품질 비교 분석 리포트',
      '한국 배송 및 검수',
    ],
    price: '수수료 2만원 + 샘플비 + 중국 배송비',
    period: '7-10일',
    image: '/images/services/sampling.jpg',
    route: '/application/import-agency/sampling',
    color: 'secondary',
  },
  {
    id: 'bulk-order',
    title: '대량발주',
    description:
      '제조 공장과 직접 계약하여 대량 생산을 진행하고, 품질관리부터 통관까지 전 과정을 관리합니다.',
    features: [
      '제조 공장 직접 계약',
      '생산 과정 품질 관리',
      '맞춤 제작 및 특별 요청 반영',
      '선적 및 통관 서류 대행',
      '관세 최적화 및 A/S 지원',
    ],
    price: '주문금액의 5%',
    period: '제품별 상이',
    image: '/images/services/bulk-order.jpg',
    route: '/application/import-agency/bulk-order',
    color: 'success',
  },
];

export default function ImportAgencyPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="수입대행 서비스 - 두리무역"
      description="두리무역의 수입대행 서비스를 신청하세요"
    >
      <HpHeader />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* 헤더 섹션 */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" fontWeight={700} gutterBottom>
            수입대행 서비스
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={2}>
            제조 공장과 직접 소통하는 맞춤형 제조 수입
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="900px" mx="auto" mb={2}>
            <strong>구매대행과 다른 차별화된 서비스</strong>
            <br />
            구매대행이 중간 도매상을 통한 단순 구매라면, 수입대행은 제조 공장과 직접 컨택하여
            커스터마이징이 가능한 맞춤형 제조 서비스입니다.
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="900px" mx="auto">
            박스제작, 로고인쇄, 특별요청 반영부터 인증서류, 통관서류, 관세율 최적화까지 제조
            단계부터 한국 도착까지 전 과정을 관리합니다. 한 제품을 대량으로 구매할 때 최적의
            선택입니다.
          </Typography>
        </Box>

        {/* 서비스 카드 그리드 */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          {services.map((service) => (
            <Box key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.shadows[10],
                  },
                }}
              >
                {/* 서비스 이미지 (임시 색상 박스) */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: `${service.color}.light`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h3" color={`${service.color}.main`}>
                    {service.title}
                  </Typography>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    {service.title}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    {service.description}
                  </Typography>

                  {/* 주요 특징 */}
                  <Box mb={2}>
                    {service.features.map((feature, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 0.5,
                          '&:before': {
                            content: '"✓"',
                            color: 'success.main',
                            fontWeight: 'bold',
                            marginRight: 1,
                          },
                        }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>

                  {/* 가격 및 기간 정보 */}
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        예상 비용
                      </Typography>
                      <Typography variant="h6" color={`${service.color}.main`} fontWeight={600}>
                        {service.price}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        소요 기간
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {service.period}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color={service.color as any}
                    onClick={() => router.push(service.route)}
                  >
                    신청하기
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        {/* 하단 안내 섹션 */}
        <Box mt={8} p={4} bgcolor="grey.100" borderRadius={2}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            맞춤형 제조 수입 프로세스
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
            제조 공장과 직접 소통하여 고객의 요구사항에 맞는 제품을 제작합니다
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }}
            gap={3}
            mt={2}
          >
            <Box textAlign="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                1
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                제조 공장 조사
              </Typography>
              <Typography variant="body2" color="text.secondary">
                맞춤 제작 가능한 제조 공장을 직접 컨택하여 조건을 협의합니다
              </Typography>
            </Box>

            <Box textAlign="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                2
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                맞춤 샘플 제작
              </Typography>
              <Typography variant="body2" color="text.secondary">
                고객 요구사항을 반영한 맞춤형 샘플을 제작하여 품질을 검증합니다
              </Typography>
            </Box>

            <Box textAlign="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                3
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                맞춤 제조 생산
              </Typography>
              <Typography variant="body2" color="text.secondary">
                공장과 직접 계약하여 맞춤 제품을 대량 생산합니다
              </Typography>
            </Box>

            <Box textAlign="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                4
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                품질관리/통관
              </Typography>
              <Typography variant="body2" color="text.secondary">
                생산 품질을 관리하고 통관서류 준비부터 한국 도착까지 관리합니다
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* CTA 섹션 */}
        <Box mt={6} textAlign="center">
          <Typography variant="h5" fontWeight={600} gutterBottom>
            맞춤형 제조가 가능한지 궁금하신가요?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            시장조사를 통해 원하는 제품의 맞춤 제작 가능성을 무료로 확인해보세요.
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={600} mb={3}>
            🎁 시장조사는 완전 무료입니다!
          </Typography>
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => router.push('/application/import-agency/market-research')}
          >
            무료 시장조사 신청하기
          </Button>
        </Box>
      </Container>

      <Footer />
    </PageContainer>
  );
}
