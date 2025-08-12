'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button,
  Stack,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CardContent,
  Divider,
  Fab,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../_components/OrderHeader';
import ChatPanel from '../../_components/ChatPanel';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { Grid } from '@mui/material';

// Tab Panel Component
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function BulkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('=== BulkOrder fetchData started ===');
      console.log('Reservation Number:', reservationNumber);
      
      if (!reservationNumber) {
        console.log('No reservation number provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Supabase SDK 사용
        console.log('Creating Supabase client...');
        const supabase = createClient();
        
        console.log('Querying bulk_orders...');
        const { data, error } = await supabase
          .from('bulk_orders')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();
        
        console.log('Query result:', { data, error });
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }
        
        if (!data) {
          throw new Error('데이터를 찾을 수 없습니다.');
        }
        
        setData(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reservationNumber]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => router.push('/dashboard/orders')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <OrderHeader orderData={data} serviceType="bulk_order" reservationNumber={reservationNumber} />

      {/* Main Content with Chat */}
      <Grid container spacing={isMobile ? 0 : 3} sx={{ mt: 2 }}>
        {/* Main Content - Full width on mobile */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ mb: isMobile ? 8 : 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="order details tabs" 
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{
                  '& .MuiTab-root': {
                    minWidth: isMobile ? 'auto' : 120,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  }
                }}
              >
                <Tab icon={<BusinessIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "발주" : "발주정보"} iconPosition="start" />
                <Tab icon={<InventoryIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "제품" : "제품상세"} iconPosition="start" />
                <Tab icon={<LocalShippingIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "배송" : "배송정보"} iconPosition="start" />
                <Tab icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "결제" : "결제정보"} iconPosition="start" />
                <Tab icon={<AttachFileIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "자료" : "관련자료"} iconPosition="start" />
              </Tabs>
            </Box>

            {/* 발주정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 발주 기본정보 */}
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      발주 기본정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            발주일자
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            {data?.created_at ? new Date(data.created_at).toLocaleString('ko-KR') : '-'}
                          </TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            발주상태
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            <Chip 
                              label={data?.status || '진행중'} 
                              color={data?.status === 'completed' ? 'success' : 'primary'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            발주번호
                          </TableCell>
                          <TableCell>{data?.order_number || reservationNumber}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            총 발주수량
                          </TableCell>
                          <TableCell>{data?.total_quantity?.toLocaleString() || '-'}개</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            예상 납기일
                          </TableCell>
                          <TableCell>
                            {data?.expected_delivery_date ? 
                              new Date(data.expected_delivery_date).toLocaleDateString('ko-KR') : 
                              '협의중'}
                          </TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            긴급도
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={data?.urgency || '일반'} 
                              color={data?.urgency === '긴급' ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 공급업체 정보 */}
                <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      공급업체 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            공급업체명
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.supplier_name || '선정중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            담당자
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.supplier_contact || '미정'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            연락처
                          </TableCell>
                          <TableCell>{data?.supplier_phone || '-'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            주소
                          </TableCell>
                          <TableCell>{data?.supplier_address || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 특별 요청사항 */}
                {data?.special_requirements && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      특별 요청사항
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {data.special_requirements}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            </TabPanel>

            {/* 제품상세 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      발주 제품 상세
                    </Typography>
                    
                    {data?.order_items && data.order_items.length > 0 ? (
                      <Box>
                        {data.order_items.map((item: any, index: number) => (
                          <Box key={index} sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                              제품 {index + 1}
                            </Typography>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                                    제품명
                                  </TableCell>
                                  <TableCell>{item.product_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                    제품코드
                                  </TableCell>
                                  <TableCell>{item.product_code || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                    규격/사양
                                  </TableCell>
                                  <TableCell>{item.specifications || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                    발주수량
                                  </TableCell>
                                  <TableCell>{item.quantity?.toLocaleString() || 0}개</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                    단가
                                  </TableCell>
                                  <TableCell>{item.unit_price ? `${item.unit_price.toLocaleString()}원` : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                    소계
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="subtitle2" color="primary">
                                      {item.subtotal ? `₩${item.subtotal.toLocaleString()}` : '-'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                            {index < data.order_items.length - 1 && <Divider sx={{ my: 2 }} />}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">발주 제품이 없습니다.</Typography>
                    )}
                  </CardContent>
                </BlankCard>

                {/* 포장 정보 */}
                <BlankCard sx={{ bgcolor: 'secondary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      포장 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                            총 박스수
                          </TableCell>
                          <TableCell>{data?.total_boxes || '산정중'}박스</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            총 CBM
                          </TableCell>
                          <TableCell>{data?.total_cbm ? `${data.total_cbm}㎥` : '산정중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            총 중량
                          </TableCell>
                          <TableCell>{data?.total_weight ? `${data.total_weight}kg` : '산정중'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 배송정보 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      배송 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                            배송방법
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={data?.shipping_method || 'LCL'} 
                              color={data?.shipping_method === 'FCL' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            출발항
                          </TableCell>
                          <TableCell>{data?.departure_port || '청도'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            도착항
                          </TableCell>
                          <TableCell>{data?.arrival_port || '인천'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            배송주소
                          </TableCell>
                          <TableCell>{data?.delivery_address || '미정'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            수령인
                          </TableCell>
                          <TableCell>{data?.receiver_name || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            연락처
                          </TableCell>
                          <TableCell>{data?.receiver_phone || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 운송 추적 */}
                {data?.tracking_number && (
                  <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                        운송 추적
                      </Typography>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                              B/L 번호
                            </TableCell>
                            <TableCell>{data?.bl_number || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                              컨테이너 번호
                            </TableCell>
                            <TableCell>{data?.container_number || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                              선적일
                            </TableCell>
                            <TableCell>
                              {data?.shipping_date ? 
                                new Date(data.shipping_date).toLocaleDateString('ko-KR') : 
                                '-'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                              도착예정일
                            </TableCell>
                            <TableCell>
                              {data?.eta ? 
                                new Date(data.eta).toLocaleDateString('ko-KR') : 
                                '-'}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </BlankCard>
                )}
              </Stack>
            </TabPanel>

            {/* 결제정보 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 1차 결제 */}
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      1차 결제 정보 (계약금)
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                            계약금액
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" color="primary">
                              {data?.deposit_amount ? `₩${data.deposit_amount.toLocaleString()}` : '산정중'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            결제상태
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={data?.deposit_status || '대기'} 
                              color={data?.deposit_status === '완료' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            결제일
                          </TableCell>
                          <TableCell>
                            {data?.deposit_date ? 
                              new Date(data.deposit_date).toLocaleDateString('ko-KR') : 
                              '-'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 2차 결제 */}
                <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      2차 결제 정보 (잔금)
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                            잔금액
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" color="primary">
                              {data?.balance_amount ? `₩${data.balance_amount.toLocaleString()}` : '산정중'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            결제상태
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={data?.balance_status || '대기'} 
                              color={data?.balance_status === '완료' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            예정일
                          </TableCell>
                          <TableCell>
                            {data?.balance_due_date ? 
                              new Date(data.balance_due_date).toLocaleDateString('ko-KR') : 
                              '선적 후 결정'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 총 비용 */}
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      총 비용 요약
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}>
                            상품대금
                          </TableCell>
                          <TableCell>{data?.product_cost ? `₩${data.product_cost.toLocaleString()}` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            운송비
                          </TableCell>
                          <TableCell>{data?.shipping_cost ? `₩${data.shipping_cost.toLocaleString()}` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            관세/부가세
                          </TableCell>
                          <TableCell>{data?.tax_amount ? `₩${data.tax_amount.toLocaleString()}` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            수수료
                          </TableCell>
                          <TableCell>{data?.commission ? `₩${data.commission.toLocaleString()}` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            총 금액
                          </TableCell>
                          <TableCell>
                            <Typography variant="h5" color="error">
                              {data?.total_amount ? `₩${data.total_amount.toLocaleString()}` : '산정중'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 관련자료 탭 */}
            <TabPanel value={tabValue} index={4}>
              <Box sx={{ p: 3 }}>
                {data?.documents && data.documents.length > 0 ? (
                  <Stack spacing={2}>
                    {data.documents.map((doc: any, index: number) => (
                      <Paper key={index} sx={{ p: 2, cursor: 'pointer' }} onClick={() => window.open(doc.url, '_blank')}>
                        <Typography>{doc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.type} - {new Date(doc.uploaded_at).toLocaleDateString('ko-KR')}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">관련자료가 없습니다.</Typography>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Desktop - Chat on right side */}
        {!isMobile && (
          <Grid size={{ md: 4 }}>
            <ChatPanel 
              reservationNumber={reservationNumber} 
              currentUserRole="customer"
              currentUserId="test-user-id"
              currentUserName="테스트 사용자"
            />
          </Grid>
        )}
      </Grid>

      {/* Mobile - Floating Chat Button */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            aria-label="chat"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1200
            }}
            onClick={() => setChatDrawerOpen(true)}
          >
            <ChatIcon />
          </Fab>

          {/* Mobile Chat Drawer */}
          <Drawer
            anchor="bottom"
            open={chatDrawerOpen}
            onClose={() => setChatDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                height: '80vh',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">채팅</Typography>
                <IconButton onClick={() => setChatDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Box sx={{ height: 'calc(80vh - 100px)' }}>
                <ChatPanel 
                  reservationNumber={reservationNumber} 
                  currentUserRole="customer"
                  currentUserId="test-user-id"
                  currentUserName="테스트 사용자"
                />
              </Box>
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}