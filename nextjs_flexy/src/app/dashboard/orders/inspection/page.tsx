'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';

interface InspectionOrder {
  id: string;
  reservation_number: string;
  product_name: string;
  company_name: string;
  service_type: string;
  production_quantity: number;
  inspection_method?: string;
  factory_name: string;
  status: string;
  created_at: string;
}

export default function InspectionListPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const [orders, setOrders] = useState<InspectionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInspectionOrders();
  }, []);

  const fetchInspectionOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // 검품감사 주문만 조회 (quality_inspection, factory_audit, loading_inspection)
      const { data, error } = await supabase
        .from('inspection_applications')
        .select('*')
        .in('service_type', ['quality_inspection', 'factory_audit', 'loading_inspection'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      setError('검품감사 주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: InspectionOrder) => {
    router.push(`/dashboard/orders/inspection/${order.reservation_number}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: '접수완료', color: 'info' as const };
      case 'in_progress':
        return { label: '진행중', color: 'warning' as const };
      case 'completed':
        return { label: '완료', color: 'success' as const };
      case 'cancelled':
        return { label: '취소됨', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'quality_inspection':
        return '품질검품';
      case 'factory_audit':
        return '공장감사';
      case 'loading_inspection':
        return '선적검품';
      default:
        return type;
    }
  };

  const getInspectionMethodLabel = (method?: string) => {
    switch (method) {
      case 'standard':
        return '표준검사';
      case 'full':
        return '전수검사';
      default:
        return method || '-';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.reservation_number.toLowerCase().includes(searchLower) ||
      order.product_name.toLowerCase().includes(searchLower) ||
      order.company_name.toLowerCase().includes(searchLower) ||
      order.factory_name.toLowerCase().includes(searchLower)
    );
  });

  // 모바일용 카드 렌더링 (배송지 카드 스타일)
  const renderOrderCard = (order: InspectionOrder) => {
    const status = getStatusLabel(order.status);
    return (
      <Grid size={{ xs: 12 }} key={order.id}>
        <BlankCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                {/* 상단: 예약번호와 서비스 타입 */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6">{order.reservation_number}</Typography>
                  <Chip
                    label={getServiceTypeLabel(order.service_type)}
                    size="small"
                    color="success"
                  />
                </Box>

                {/* 제품 정보 */}
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {order.product_name}
                </Typography>

                {/* 상세 정보 */}
                <Box display="flex" gap={3} mb={1}>
                  <Typography variant="body2">
                    <strong>생산수량:</strong> {order.production_quantity?.toLocaleString() || '-'}
                    개
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2" component="span">
                      <strong>상태:</strong>
                    </Typography>
                    <Chip label={status.label} size="small" color={status.color} />
                  </Box>
                </Box>

                {/* 검사 방법 및 공장 정보 */}
                <Box display="flex" gap={3} mb={1}>
                  <Typography variant="body2">
                    <strong>검사방법:</strong> {getInspectionMethodLabel(order.inspection_method)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>공장명:</strong> {order.factory_name}
                  </Typography>
                </Box>

                {/* 회사명 및 날짜 정보 */}
                <Typography variant="body2" color="textSecondary">
                  <strong>회사명:</strong> {order.company_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>신청일:</strong>{' '}
                  {new Date(order.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>

              {/* 액션 버튼 */}
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => handleViewOrder(order)} title="상세보기">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <PageContainer title="검품감사 주문 조회" description="검품감사 서비스 신청 현황">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                검품감사 주문 조회
              </Typography>
              <Typography variant="body2" color="text.secondary">
                품질검품, 공장감사, 선적검품 서비스 신청 현황을 확인하세요
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="예약번호, 제품명, 회사명, 공장명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {isMobile ? (
                // 모바일: 카드 레이아웃
                <Grid container spacing={2}>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => renderOrderCard(order))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        {searchTerm ? '검색 결과가 없습니다' : '신청된 검품감사가 없습니다'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                // 데스크탑: 테이블 레이아웃
                <Box sx={{ overflowX: 'auto' }}>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>예약번호</TableCell>
                          <TableCell align="center">상태</TableCell>
                          <TableCell>신청일</TableCell>
                          <TableCell>서비스타입</TableCell>
                          <TableCell>제품명</TableCell>
                          <TableCell>공장명</TableCell>
                          <TableCell>회사명</TableCell>
                          <TableCell align="center">상세보기</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => {
                            const status = getStatusLabel(order.status);
                            return (
                              <TableRow
                                key={order.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleViewOrder(order)}
                              >
                                <TableCell>
                                  <Chip
                                    label={order.reservation_number}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={status.label} color={status.color} size="small" />
                                </TableCell>
                                <TableCell>
                                  {new Date(order.created_at).toLocaleDateString('ko-KR')}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {getServiceTypeLabel(order.service_type)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500} noWrap>
                                    {order.product_name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {order.factory_name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {order.company_name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewOrder(order);
                                    }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                {searchTerm ? '검색 결과가 없습니다' : '신청된 검품감사가 없습니다'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </PageContainer>
  );
}
