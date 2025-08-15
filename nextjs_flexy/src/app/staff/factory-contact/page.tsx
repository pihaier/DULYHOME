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
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';

export default function FactoryContactListPage() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    assigned: 'all',
  });

  const isChineseStaff = userProfile?.role === 'chinese_staff';

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('factory_contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let filteredData = data || [];

      if (filter.assigned === 'mine' && user) {
        filteredData = filteredData.filter((order) => order.assigned_chinese_staff === user.id);
      }

      if (filter.status !== 'all') {
        filteredData = filteredData.filter((order) => order.status === filter.status);
      }

      if (search) {
        filteredData = filteredData.filter(
          (order) =>
            order.reservation_number?.toLowerCase().includes(search.toLowerCase()) ||
            order.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            order.product_name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setOrders(filteredData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'quoted':
        return 'warning';
      case 'paid':
        return 'secondary';
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
    const labels: { [key: string]: { ko: string; zh: string } } = {
      submitted: { ko: '접수', zh: '已提交' },
      quoted: { ko: '견적완료', zh: '已报价' },
      paid: { ko: '결제완료', zh: '已付款' },
      in_progress: { ko: '진행중', zh: '进行中' },
      completed: { ko: '완료', zh: '已完成' },
      cancelled: { ko: '취소', zh: '已取消' },
    };
    return isChineseStaff ? labels[status]?.zh : labels[status]?.ko || status;
  };

  const handleViewDetails = (reservationNumber: string) => {
    router.push(`/staff/factory-contact/${reservationNumber}`);
  };

  return (
    <PageContainer
      title={isChineseStaff ? '工厂联系管理' : '공장컨택 관리'}
      description="공장컨택 주문 관리 페이지"
    >
      <BlankCard>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={isChineseStaff ? '搜索...' : '검색...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{isChineseStaff ? '状态' : '상태'}</InputLabel>
                <Select
                  value={filter.status}
                  label={isChineseStaff ? '状态' : '상태'}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <MenuItem value="all">{isChineseStaff ? '全部' : '전체'}</MenuItem>
                  <MenuItem value="submitted">{isChineseStaff ? '已提交' : '접수'}</MenuItem>
                  <MenuItem value="in_progress">{isChineseStaff ? '进行中' : '진행중'}</MenuItem>
                  <MenuItem value="completed">{isChineseStaff ? '已完成' : '완료'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{isChineseStaff ? '分配' : '담당'}</InputLabel>
                <Select
                  value={filter.assigned}
                  label={isChineseStaff ? '分配' : '담당'}
                  onChange={(e) => setFilter({ ...filter, assigned: e.target.value })}
                >
                  <MenuItem value="all">{isChineseStaff ? '全部订单' : '전체'}</MenuItem>
                  <MenuItem value="mine">{isChineseStaff ? '我的订单' : '내 담당'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchOrders}
                startIcon={<RefreshIcon />}
              >
                {isChineseStaff ? '刷新' : '새로고침'}
              </Button>
            </Grid>
          </Grid>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{isChineseStaff ? '预约号' : '예약번호'}</TableCell>
                    <TableCell>{isChineseStaff ? '公司' : '회사명'}</TableCell>
                    <TableCell>{isChineseStaff ? '产品' : '제품명'}</TableCell>
                    <TableCell>{isChineseStaff ? '数量' : '수량'}</TableCell>
                    <TableCell>{isChineseStaff ? '状态' : '상태'}</TableCell>
                    <TableCell>{isChineseStaff ? '日期' : '등록일'}</TableCell>
                    <TableCell align="center">{isChineseStaff ? '操作' : '액션'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary">
                          {isChineseStaff ? '没有订单' : '주문이 없습니다'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {order.reservation_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.company_name}</TableCell>
                        <TableCell>{order.product_name}</TableCell>
                        <TableCell>{order.required_quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(order.reservation_number)}
                            title={isChineseStaff ? '查看详情' : '상세보기'}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
}
