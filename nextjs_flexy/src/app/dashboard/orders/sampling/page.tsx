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
import { 
  Visibility as VisibilityIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';

interface SamplingOrder {
  id: string;
  order_id: string;
  reservation_number?: string; // orders 테이블에서 가져올 예정
  product_name?: string;
  company_name?: string; // orders 테이블에서 가져올 예정
  sample_quantity?: number;
  specifications?: string;
  shipping_method?: string;
  status?: string; // orders 테이블에서 가져올 예정
  created_at: string;
  sample_items?: any;
  orders?: any;
}

export default function SamplingListPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const [orders, setOrders] = useState<SamplingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSamplingOrders();
  }, []);

  const fetchSamplingOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // sampling_applications 조회
      const { data: sampleOrders, error: sampleError } = await supabase
        .from('sampling_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (sampleError) throw sampleError;
      
      console.log('Sample orders:', sampleOrders);
      
      // sampling_applications 데이터를 사용
      const formattedOrders = (sampleOrders || []).map(sample => ({
        ...sample,
        product_name: sample.sample_items?.[0]?.productName || '제품명 없음',
        sample_quantity: sample.sample_items?.[0]?.quantity || 0
      }));
      
      console.log('Fetched sampling orders:', formattedOrders.length);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching sampling orders:', error);
      setError('샘플링 주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: SamplingOrder) => {
    if (order.reservation_number) {
      router.push(`/dashboard/orders/sampling/${order.reservation_number}`);
    }
  };

  const getStatusLabel = (status?: string) => {
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
        return { label: status || '상태없음', color: 'default' as const };
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.reservation_number?.toLowerCase().includes(searchLower) ||
      order.product_name.toLowerCase().includes(searchLower) ||
      order.company_name?.toLowerCase().includes(searchLower) ||
      ''
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
              샘플링 주문 조회
            </Typography>
            <Typography variant="body2" color="text.secondary">
              제품 샘플 수입 서비스 신청 현황을 확인하세요
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
                    <TableCell align="right">샘플수량</TableCell>
                    <TableCell>배송방법</TableCell>
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
                          sx={{ cursor: order.reservation_number ? 'pointer' : 'default' }}
                          onClick={() => order.reservation_number && handleViewOrder(order)}
                        >
                          <TableCell>
                            {order.reservation_number ? (
                              <Chip 
                                label={order.reservation_number} 
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={status.label} 
                              color={status.color} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {order.product_name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {order.sample_quantity ? `${order.sample_quantity.toLocaleString()}개` : '-'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {order.shipping_method === 'air' ? '항공' : order.shipping_method === 'sea' ? '해운' : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {order.company_name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {order.reservation_number ? (
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
                            ) : (
                              <IconButton 
                                size="small"
                                disabled
                              >
                                <VisibilityIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? '검색 결과가 없습니다' : '신청된 샘플링이 없습니다'}
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