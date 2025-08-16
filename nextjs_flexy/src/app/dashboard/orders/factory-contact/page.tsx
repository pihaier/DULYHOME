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
  Badge,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';

interface FactoryContactOrder {
  id: string;
  reservation_number: string;
  product_name: string;
  company_name: string;
  factory_name: string;
  request_type: string[];
  status: string;
  created_at: string;
  confirmation_count?: number; // 컨펌 대기 개수
}

export default function FactoryContactListPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const [orders, setOrders] = useState<FactoryContactOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFactoryContactOrders();
  }, []);

  const fetchFactoryContactOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // 공장컨택 주문 조회
      const { data: contactData, error: contactError } = await supabase
        .from('factory_contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // 각 주문별로 컨펌 대기 개수 조회
      const ordersWithConfirmCount = await Promise.all(
        (contactData || []).map(async (order) => {
          const { count } = await supabase
            .from('confirmation_requests')
            .select('*', { count: 'exact', head: true })
            .eq('reservation_number', order.reservation_number)
            .eq('status', 'pending');

          return {
            ...order,
            confirmation_count: count || 0,
          };
        })
      );

      setOrders(ordersWithConfirmCount);
    } catch (error) {
      setError('공장컨택 주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: FactoryContactOrder) => {
    router.push(`/dashboard/orders/factory-contact/${order.reservation_number}`);
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

  const getRequestTypeLabels = (types: string | string[]) => {
    const typeMap: { [key: string]: string } = {
      sample: '샘플',
      bulk_order: '대량주문',
      inspection: '검품',
      shipping: '배송',
      other: '기타',
    };

    // types가 배열이 아닌 경우 처리
    const typeArray = Array.isArray(types) ? types : [types];
    return typeArray.map((type) => typeMap[type] || type).join(', ');
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
  const renderOrderCard = (order: FactoryContactOrder) => {
    const status = getStatusLabel(order.status);
    return (
      <Grid size={{ xs: 12 }} key={order.id}>
        <BlankCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                {/* 상단: 예약번호와 컨펌 대기 */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6">{order.reservation_number}</Typography>
                  <Chip label="공장컨택" size="small" color="secondary" />
                  {order.confirmation_count > 0 && (
                    <Badge badgeContent={order.confirmation_count} color="error">
                      <AssignmentIcon fontSize="small" />
                    </Badge>
                  )}
                </Box>

                {/* 제품 정보 */}
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {order.product_name}
                </Typography>

                {/* 상세 정보 */}
                <Box display="flex" gap={3} mb={1}>
                  <Typography variant="body2">
                    <strong>공장명:</strong> {order.factory_name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2" component="span">
                      <strong>상태:</strong>
                    </Typography>
                    <Chip label={status.label} size="small" color={status.color} />
                  </Box>
                </Box>

                {/* 요청 유형 */}
                <Box mb={1}>
                  <Typography variant="body2">
                    <strong>요청유형:</strong> {getRequestTypeLabels(order.request_type)}
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
    <PageContainer title="공장컨택 주문 조회" description="공장컨택 서비스 신청 현황">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                공장컨택 주문 조회
              </Typography>
              <Typography variant="body2" color="text.secondary">
                공장컨택 서비스 신청 현황을 확인하세요
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
                        {searchTerm ? '검색 결과가 없습니다' : '신청된 공장컨택이 없습니다'}
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
                          <TableCell>회사명</TableCell>
                          <TableCell>공장명</TableCell>
                          <TableCell>제품명</TableCell>
                          <TableCell>요청유형</TableCell>
                          <TableCell align="center">컨펌대기</TableCell>
                          <TableCell align="center">상태</TableCell>
                          <TableCell>신청일</TableCell>
                          <TableCell align="center">상세</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                {searchTerm ? '검색 결과가 없습니다' : '신청된 공장컨택이 없습니다'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
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
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="primary"
                                    noWrap
                                  >
                                    {order.reservation_number}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography noWrap>{order.company_name}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography noWrap>{order.factory_name}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography noWrap>{order.product_name}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {getRequestTypeLabels(order.request_type)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  {order.confirmation_count > 0 && (
                                    <Badge badgeContent={order.confirmation_count} color="error">
                                      <AssignmentIcon color="action" />
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={status.label} color={status.color} size="small" />
                                </TableCell>
                                <TableCell>
                                  {new Date(order.created_at).toLocaleDateString('ko-KR')}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewOrder(order);
                                    }}
                                    size="small"
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
