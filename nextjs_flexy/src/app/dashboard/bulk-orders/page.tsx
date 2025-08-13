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
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface BulkOrder {
  id: string;
  reservation_number: string;
  order_items: Array<{
    product_name: string;
    order_quantity: number;
    specifications?: string;
  }>;
  status: string;
  created_at: string;
  delivery_method: string;
  market_research_id?: string;
}

export default function BulkOrdersListPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Supabase SDK로 직접 조회
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('bulk_order_requests')
        .select(
          `
          *,
          market_research_requests (
            product_name,
            research_quantity
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // 데이터 형식 변환
      const formattedOrders = (data || []).map((order: any) => ({
        id: order.id,
        reservation_number: order.reservation_number,
        order_items: order.order_items || [],
        status: order.status,
        created_at: order.created_at,
        delivery_method: order.delivery_method,
        market_research_id: order.market_research_id,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      setError('대량주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (reservationNumber: string) => {
    router.push(`/orders/${reservationNumber}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: '신청접수', color: 'info' as const };
      case 'quoted':
        return { label: '견적완료', color: 'warning' as const };
      case 'paid':
        return { label: '결제완료', color: 'primary' as const };
      case 'in_progress':
        return { label: '생산중', color: 'secondary' as const };
      case 'shipping':
        return { label: '배송중', color: 'info' as const };
      case 'completed':
        return { label: '완료', color: 'success' as const };
      case 'cancelled':
        return { label: '취소됨', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'DDP':
        return 'DDP (관세포함)';
      case 'FOB':
        return 'FOB (중국항구)';
      case 'EXW':
        return 'EXW (공장인도)';
      default:
        return method;
    }
  };

  const getFirstProductInfo = (orderItems: BulkOrder['order_items']) => {
    if (!orderItems || orderItems.length === 0) {
      return { name: '-', quantity: 0 };
    }

    const firstItem = orderItems[0];
    const totalQuantity = orderItems.reduce((sum, item) => sum + (item.order_quantity || 0), 0);

    return {
      name:
        orderItems.length > 1
          ? `${firstItem.product_name} 외 ${orderItems.length - 1}개`
          : firstItem.product_name,
      quantity: totalQuantity,
    };
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
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 모바일용 카드 렌더링
  const renderOrderCard = (order: BulkOrder) => {
    const status = getStatusLabel(order.status);
    const productInfo = getFirstProductInfo(order.order_items);

    return (
      <Card
        key={order.id}
        elevation={1}
        sx={{
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
          },
        }}
        onClick={() => handleViewOrder(order.reservation_number)}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* 상단: 주문번호와 상태 */}
            <Grid size={12}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    주문번호
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {order.reservation_number}
                  </Typography>
                </Box>
                <Chip label={status.label} color={status.color} size="small" />
              </Box>
            </Grid>

            {/* 중단: 제품 정보 */}
            <Grid size={12}>
              <Typography
                variant="body1"
                fontWeight="medium"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {productInfo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                수량: {productInfo.quantity.toLocaleString()}개
              </Typography>
              {order.market_research_id && (
                <Chip
                  label="시장조사 연계"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* 하단: 배송방법과 날짜 */}
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                배송방법
              </Typography>
              <Typography variant="body2">
                {getDeliveryMethodLabel(order.delivery_method)}
              </Typography>
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                신청일시
              </Typography>
              <Typography variant="body2">
                {new Date(order.created_at).toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(order.created_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>

            {/* 상세보기 버튼 */}
            <Grid size={12}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewOrder(order.reservation_number);
                }}
              >
                상세보기
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              gutterBottom
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              대량주문 목록
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              신청한 대량주문 현황을 확인하세요
            </Typography>
          </CardContent>
        </Card>

        <Card>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              {orders.length > 0 ? (
                orders.map((order) => renderOrderCard(order))
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  신청된 대량주문이 없습니다
                </Typography>
              )}
            </Box>
          ) : (
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: isTablet ? 600 : 'auto' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>주문번호</TableCell>
                        <TableCell>제품명</TableCell>
                        {!isTablet && <TableCell align="right">총 주문수량</TableCell>}
                        {!isTablet && <TableCell align="center">배송방법</TableCell>}
                        <TableCell align="center">상태</TableCell>
                        <TableCell>신청일시</TableCell>
                        <TableCell align="center">상세</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.length > 0 ? (
                        orders.map((order) => {
                          const status = getStatusLabel(order.status);
                          const productInfo = getFirstProductInfo(order.order_items);
                          return (
                            <TableRow
                              key={order.id}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleViewOrder(order.reservation_number)}
                            >
                              <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                {order.reservation_number}
                              </TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: isTablet ? '150px' : 'auto',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <Typography variant="body2" noWrap>
                                  {productInfo.name}
                                </Typography>
                                {order.market_research_id && !isTablet && (
                                  <Chip
                                    label="시장조사 연계"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </TableCell>
                              {!isTablet && (
                                <TableCell align="right">
                                  {productInfo.quantity.toLocaleString()}개
                                </TableCell>
                              )}
                              {!isTablet && (
                                <TableCell align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    {getDeliveryMethodLabel(order.delivery_method)}
                                  </Typography>
                                </TableCell>
                              )}
                              <TableCell align="center">
                                <Chip label={status.label} color={status.color} size="small" />
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {new Date(order.created_at).toLocaleDateString('ko-KR', {
                                  year: isTablet ? '2-digit' : 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  ...(isTablet
                                    ? {}
                                    : {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }),
                                })}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton color="primary" size="small">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isTablet ? 5 : 7} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              신청된 대량주문이 없습니다
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          )}
        </Card>
      </Stack>
    </Box>
  );
}
