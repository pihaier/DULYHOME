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
} from '@mui/material';
import { Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface BulkOrder {
  id: string;
  reservation_number: string;
  order_items: any[];
  company_name: string;
  desired_delivery_date: string;
  delivery_date?: string;
  delivery_method: string;
  status: string;
  created_at: string;
}

export default function BulkOrderListPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBulkOrders();
  }, []);

  const fetchBulkOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // 대량주문만 조회
      const { data, error } = await supabase
        .from('bulk_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      setError('대량주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: BulkOrder) => {
    router.push(`/dashboard/orders/bulk-order/${order.reservation_number}`);
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

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'DDP':
        return 'DDP (목적지 인도)';
      case 'FOB':
        return 'FOB (본선 인도)';
      case 'EXW':
        return 'EXW (공장 인도)';
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const productNames =
      order.order_items?.map((item: any) => item.product_name?.toLowerCase() || '').join(' ') || '';

    return (
      order.reservation_number.toLowerCase().includes(searchLower) ||
      productNames.includes(searchLower) ||
      order.company_name.toLowerCase().includes(searchLower)
    );
  });

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
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              대량주문 조회
            </Typography>
            <Typography variant="body2" color="text.secondary">
              대량 발주 서비스 신청 현황을 확인하세요
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="예약번호, 제품명, 회사명으로 검색"
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

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>예약번호</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell>신청일</TableCell>
                    <TableCell>제품명</TableCell>
                    <TableCell align="center">납품방법</TableCell>
                    <TableCell>희망납기</TableCell>
                    <TableCell>회사명</TableCell>
                    <TableCell align="center">상세보기</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const status = getStatusLabel(order.status);
                      const firstItem = order.order_items?.[0];
                      const itemCount = order.order_items?.length || 0;

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
                              color="warning"
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
                              {firstItem?.productName || firstItem?.product_name || '-'}
                            </Typography>
                            {itemCount > 1 && (
                              <Typography variant="caption" color="text.secondary">
                                외 {itemCount - 1}건
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{order.delivery_method || '-'}</Typography>
                          </TableCell>
                          <TableCell>
                            {order.delivery_date
                              ? new Date(order.delivery_date).toLocaleDateString('ko-KR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
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
                          {searchTerm ? '검색 결과가 없습니다' : '신청된 대량주문이 없습니다'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
