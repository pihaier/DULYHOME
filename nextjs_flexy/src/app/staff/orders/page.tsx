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
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';

interface Order {
  id: string;
  reservation_number: string;
  product_name: string;
  company_name: string;
  status: string;
  payment_status?: string;
  created_at: string;
  service_type: 'inspection' | 'market_research' | 'factory_contact';
  assigned_chinese_staff?: string;
  assigned_staff?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`staff-order-tabpanel-${index}`}
      aria-labelledby={`staff-order-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function StaffOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useUser();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState({
    status: 'all',
    assigned: 'mine', // mine or all
  });

  // 중국 직원 여부 확인
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  // 권한 체크
  useEffect(() => {
    if (userProfile && !['admin', 'korean_team', 'chinese_staff'].includes(userProfile.role)) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  // URL 파라미터로 서비스 탭 설정
  useEffect(() => {
    const service = searchParams.get('service');
    if (service === 'inspection') setTabValue(1);
    else if (service === 'market-research') setTabValue(2);
    else if (service === 'factory-contact') setTabValue(3);
    else setTabValue(0);
  }, [searchParams]);

  // 주문 데이터 조회
  const fetchOrders = async () => {
    try {
      setLoading(true);
      let allOrders: Order[] = [];

      // 검품감사 조회
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspection_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (inspectionError) throw inspectionError;
      
      if (inspectionData) {
        allOrders = [...allOrders, ...inspectionData.map(item => ({
          ...item,
          service_type: 'inspection' as const
        }))];
      }

      // 시장조사 조회
      const { data: marketData, error: marketError } = await supabase
        .from('market_research_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (marketError) throw marketError;
      
      if (marketData) {
        allOrders = [...allOrders, ...marketData.map(item => ({
          ...item,
          service_type: 'market_research' as const
        }))];
      }

      // 공장컨택 조회
      const { data: factoryData, error: factoryError } = await supabase
        .from('factory_contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (factoryError) throw factoryError;
      
      if (factoryData) {
        allOrders = [...allOrders, ...factoryData.map(item => ({
          ...item,
          service_type: 'factory_contact' as const
        }))];
      }

      // 필터링 적용
      if (filter.assigned === 'mine' && user) {
        allOrders = allOrders.filter(order => 
          order.assigned_chinese_staff === user.id || 
          order.assigned_staff === user.id
        );
      }

      if (filter.status !== 'all') {
        allOrders = allOrders.filter(order => order.status === filter.status);
      }

      // 날짜순 정렬
      allOrders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(allOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // 서비스별 필터링
  const getFilteredOrders = () => {
    if (tabValue === 0) return orders; // 전체
    if (tabValue === 1) return orders.filter(o => o.service_type === 'inspection');
    if (tabValue === 2) return orders.filter(o => o.service_type === 'market_research');
    if (tabValue === 3) return orders.filter(o => o.service_type === 'factory_contact');
    return orders;
  };

  // 상태 칩 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'quoted': return 'warning';
      case 'paid': return 'secondary';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // 상태 라벨
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

  // 서비스 아이콘
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'inspection': return <CheckCircleIcon />;
      case 'market_research': return <SearchIcon />;
      case 'factory_contact': return <FactoryIcon />;
      default: return <AssignmentIcon />;
    }
  };

  // 서비스 라벨
  const getServiceLabel = (service: string) => {
    const labels: { [key: string]: { ko: string; zh: string } } = {
      inspection: { ko: '검품감사', zh: '质检审核' },
      market_research: { ko: '시장조사', zh: '市场调查' },
      factory_contact: { ko: '공장컨택', zh: '工厂联系' },
    };
    return isChineseStaff ? labels[service]?.zh : labels[service]?.ko || service;
  };

  // 상세 페이지로 이동
  const handleViewDetails = (order: Order) => {
    router.push(`/staff/orders/${order.service_type}/${order.reservation_number}`);
  };

  return (
    <PageContainer 
      title={isChineseStaff ? '订单管理' : '주문 관리'} 
      description="직원 전용 주문 관리 페이지"
    >
      <BlankCard>
        <CardContent>
          {/* 필터 섹션 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  {isChineseStaff ? '状态' : '상태'}
                </InputLabel>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  {isChineseStaff ? '分配' : '담당'}
                </InputLabel>
                <Select
                  value={filter.assigned}
                  label={isChineseStaff ? '分配' : '담당'}
                  onChange={(e) => setFilter({ ...filter, assigned: e.target.value })}
                >
                  <MenuItem value="mine">{isChineseStaff ? '我的订单' : '내 담당'}</MenuItem>
                  <MenuItem value="all">{isChineseStaff ? '全部订单' : '전체'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  onClick={fetchOrders}
                  startIcon={<SearchIcon />}
                >
                  {isChineseStaff ? '刷新' : '새로고침'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* 탭 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab label={isChineseStaff ? '全部' : '전체'} />
              <Tab label={isChineseStaff ? '质检审核' : '검품감사'} />
              <Tab label={isChineseStaff ? '市场调查' : '시장조사'} />
              <Tab label={isChineseStaff ? '工厂联系' : '공장컨택'} />
            </Tabs>
          </Box>

          {/* 로딩 상태 */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 에러 상태 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 주문 테이블 */}
          {!loading && !error && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{isChineseStaff ? '预约号' : '예약번호'}</TableCell>
                    <TableCell>{isChineseStaff ? '服务' : '서비스'}</TableCell>
                    <TableCell>{isChineseStaff ? '公司' : '회사명'}</TableCell>
                    <TableCell>{isChineseStaff ? '产品' : '제품명'}</TableCell>
                    <TableCell>{isChineseStaff ? '状态' : '상태'}</TableCell>
                    <TableCell>{isChineseStaff ? '日期' : '등록일'}</TableCell>
                    <TableCell align="center">{isChineseStaff ? '操作' : '액션'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredOrders().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary">
                          {isChineseStaff ? '没有订单' : '주문이 없습니다'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredOrders().map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {order.reservation_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getServiceIcon(order.service_type)}
                            <Typography variant="body2">
                              {getServiceLabel(order.service_type)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{order.company_name}</TableCell>
                        <TableCell>{order.product_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(order)}
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