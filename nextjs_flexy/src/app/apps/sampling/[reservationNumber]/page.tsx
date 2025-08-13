'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/apps/sampling',
    title: '샘플링',
  },
  {
    title: '신청 상세',
  },
];

interface SamplingData {
  id: string;
  reservation_number: string;
  product_name: string;
  sample_quantity: number;
  requirements: string;
  detail_page?: string;
  shipping_address: {
    recipient_name: string;
    phone: string;
    postal_code: string;
    address: string;
    detail_address: string;
  };
  status: string;
  created_at: string;
}

export default function SamplingDetailPage() {
  const params = useParams();
  const reservationNumber = params.reservationNumber as string;
  const [data, setData] = useState<SamplingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [reservationNumber]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/sampling/${reservationNumber}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="샘플링 신청 상세" description="">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="샘플링 신청 상세" description="">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer title="샘플링 신청 상세" description="">
        <Alert severity="info">신청 정보를 찾을 수 없습니다.</Alert>
      </PageContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return '접수완료';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  return (
    <PageContainer title={`샘플링 신청 - ${reservationNumber}`} description="">
      <Breadcrumb title="샘플링 신청 상세" items={BCrumb} />

      <Paper elevation={0} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            샘플링 신청 상세
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" color="text.secondary">
              예약번호: {data.reservation_number}
            </Typography>
            <Chip
              label={getStatusLabel(data.status)}
              color={getStatusColor(data.status) as any}
              size="small"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  제품 정보
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    제품명
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {data.product_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    샘플 수량
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {data.sample_quantity}개
                  </Typography>

                  {data.detail_page && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        참고 URL
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <a href={data.detail_page} target="_blank" rel="noopener noreferrer">
                          {data.detail_page}
                        </a>
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  배송 정보
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    수령인
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {data.shipping_address.recipient_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    연락처
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {data.shipping_address.phone}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    배송지
                  </Typography>
                  <Typography variant="body1">
                    [{data.shipping_address.postal_code}] {data.shipping_address.address}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {data.shipping_address.detail_address}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  요청사항
                </Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {data.requirements}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  신청 정보
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  신청일시: {new Date(data.created_at).toLocaleString('ko-KR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </PageContainer>
  );
}
