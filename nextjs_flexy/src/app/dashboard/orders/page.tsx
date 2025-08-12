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
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Visibility as VisibilityIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';

interface Order {
  id: string;
  reservation_number: string;
  product_name: string;
  company_name?: string;
  quantity?: number;
  status: string;
  payment_status?: string;
  created_at: string;
  service_type: 'market_research' | 'factory_contact' | 'inspection';
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
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function OrdersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const isTablet = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // URL 파라미터에서 탭 및 필터 설정
  useEffect(() => {
    const tab = searchParams.get('tab');
    switch(tab) {
      case 'market-research':
        setTabValue(0);
        break;
      case 'factory-contact':
        setTabValue(1);
        break;
      case 'inspection':
        setTabValue(2);
        break;
      default:
        setTabValue(0);
    }
    
    // 상태 필터 설정
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const allOrders: Order[] = [];

      // Fetch market research orders
      const { data: marketResearch } = await supabase
        .from('market_research_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (marketResearch) {
        allOrders.push(...marketResearch.map(order => ({
          ...order,
          quantity: order.research_quantity,
          service_type: 'market_research' as const,
          payment_status: order.payment_status
        })));
      }

      // Fetch inspection orders
      const { data: inspection } = await supabase
        .from('inspection_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (inspection) {
        allOrders.push(...inspection.map(order => ({
          ...order,
          quantity: order.production_quantity,
          service_type: 'inspection' as const,
          payment_status: order.payment_status
        })));
      }

      // Fetch factory contact orders
      const { data: factoryContact } = await supabase
        .from('factory_contact_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (factoryContact) {
        allOrders.push(...factoryContact.map(order => ({
          ...order,
          quantity: 0, // Factory contact doesn't have quantity
          service_type: 'factory_contact' as const,
          payment_status: order.payment_status
        })));
      }

      // Bulk orders 및 sampling orders는 현재 비활성화 상태

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    // order 객체의 service_type을 직접 사용
    let serviceType = '';
    
    switch(order.service_type) {
      case 'market_research':
        serviceType = 'market-research';
        break;
      case 'factory_contact':
        serviceType = 'factory-contact';
        break;
      case 'inspection':
        serviceType = 'inspection';
        break;
      default:
        console.error('Unknown service type:', order.service_type);
        return;
    }
    
    router.push(`/dashboard/orders/${serviceType}/${order.reservation_number}`);
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

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'market_research':
        return '시장조사';
      case 'factory_contact':
        return '공장컨택';
      case 'inspection':
        return '검품감사';
      default:
        return serviceType;
    }
  };

  const getFilteredOrders = (serviceType?: string) => {
    let filtered = orders;
    
    // 서비스 타입 필터
    if (serviceType) {
      filtered = filtered.filter(order => order.service_type === serviceType);
    }
    
    // 상태 필터
    if (statusFilter !== 'all') {
      switch(statusFilter) {
        case 'pending_payment':
          filtered = filtered.filter(order => order.payment_status === 'pending');
          break;
        case 'in_progress':
          filtered = filtered.filter(order => 
            order.status === 'in_progress' || 
            (order.status === 'submitted' && order.payment_status === 'paid')
          );
          break;
        case 'completed':
          filtered = filtered.filter(order => order.status === 'completed');
          break;
      }
    }
    
    return filtered;
  };
  
  const handleStatusFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 모바일용 카드 렌더링 (배송지 카드 스타일)
  const renderOrderCard = (order: Order) => {
    const status = getStatusLabel(order.status);
    return (
      <Grid size={{ xs: 12 }} key={order.id}>
        <BlankCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                {/* 상단: 예약번호와 서비스 타입 */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6">
                    {order.reservation_number}
                  </Typography>
                  <Chip 
                    label={getServiceLabel(order.service_type)} 
                    size="small" 
                    color={
                      order.service_type === 'market_research' ? 'primary' :
                      order.service_type === 'factory_contact' ? 'secondary' :
                      order.service_type === 'inspection' ? 'success' :
                      'default'
                    }
                  />
                </Box>
                
                {/* 제품 정보 */}
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {order.product_name}
                </Typography>
                
                {/* 상세 정보 */}
                <Box display="flex" gap={3} mb={1}>
                  {order.quantity !== undefined && order.quantity !== null && order.quantity !== 0 && (
                    <Typography variant="body2">
                      <strong>수량:</strong> {order.quantity.toLocaleString()}개
                    </Typography>
                  )}
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2" component="span">
                      <strong>상태:</strong>
                    </Typography>
                    <Chip label={status.label} size="small" color={status.color} />
                  </Box>
                </Box>
                
                {/* 날짜 정보 */}
                <Typography variant="body2" color="textSecondary">
                  <strong>신청일:</strong> {new Date(order.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              
              {/* 액션 버튼 */}
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleViewOrder(order)}
                  title="상세보기"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>
    );
  };

  // 데스크톱용 테이블 렌더링 (반응형 개선)
  const renderOrderTable = (filteredOrders: Order[]) => (
    <Box sx={{ overflowX: 'auto' }}>
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: isTablet ? 600 : 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell>오더번호</TableCell>
              {!isTablet && <TableCell>서비스</TableCell>}
              <TableCell>품명</TableCell>
              {!isTablet && <TableCell align="right">수량</TableCell>}
              <TableCell align="center">상태</TableCell>
              <TableCell>신청일시</TableCell>
              <TableCell align="center">상세</TableCell>
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
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {order.reservation_number}
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        <Chip 
                          label={getServiceLabel(order.service_type)} 
                          size="small"
                          color={
                            order.service_type === 'market_research' ? 'primary' :
                            order.service_type === 'factory_contact' ? 'secondary' :
                            order.service_type === 'inspection' ? 'success' :
                            'warning'
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      maxWidth: isTablet ? '150px' : 'auto',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {order.product_name}
                    </TableCell>
                    {!isTablet && (
                      <TableCell align="right">
                        {order.quantity?.toLocaleString() || '-'}개
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {new Date(order.created_at).toLocaleDateString('ko-KR', {
                        year: isTablet ? '2-digit' : 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        ...(isTablet ? {} : {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      })}
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
                    신청된 주문이 없습니다
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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

  return (
    <PageContainer title="주문 조회" description="모든 서비스의 주문 현황을 확인하세요">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom 
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              주문 조회
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              모든 서비스의 주문 현황을 확인하세요
            </Typography>
          </CardContent>
        </Card>

        {/* 상태별 필터 */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={handleStatusFilterChange}
              aria-label="status filter"
              sx={{
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': {
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="all">
                전체 ({orders.length})
              </ToggleButton>
              <ToggleButton value="pending_payment">
                결제 대기 ({orders.filter(o => o.payment_status === 'pending').length})
              </ToggleButton>
              <ToggleButton value="in_progress">
                진행중 ({orders.filter(o => o.status === 'in_progress' || (o.status === 'submitted' && o.payment_status === 'paid')).length})
              </ToggleButton>
              <ToggleButton value="completed">
                완료 ({orders.filter(o => o.status === 'completed').length})
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="order tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  minWidth: { xs: 'auto', sm: 120 },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label={`시장조사 (${getFilteredOrders('market_research').length})`} />
              <Tab label={`공장컨택 (${getFilteredOrders('factory_contact').length})`} />
              <Tab label={`검품감사 (${getFilteredOrders('inspection').length})`} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {getFilteredOrders('market_research').length > 0 ? (
                    getFilteredOrders('market_research').map(order => renderOrderCard(order))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        신청된 주문이 없습니다
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              renderOrderTable(getFilteredOrders('market_research'))
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {getFilteredOrders('factory_contact').length > 0 ? (
                    getFilteredOrders('factory_contact').map(order => renderOrderCard(order))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        신청된 주문이 없습니다
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              renderOrderTable(getFilteredOrders('factory_contact'))
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {getFilteredOrders('inspection').length > 0 ? (
                    getFilteredOrders('inspection').map(order => renderOrderCard(order))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        신청된 주문이 없습니다
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              renderOrderTable(getFilteredOrders('inspection'))
            )}
          </TabPanel>
        </Card>
        </Stack>
      </Box>
    </PageContainer>
  );
}