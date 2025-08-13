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
  Modal,
  IconButton,
  Divider,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../_components/OrderHeader';
import ChatPanel from '../../_components/ChatPanel';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
import { Grid } from '@mui/material';
import { Fab, useMediaQuery, useTheme, Drawer } from '@mui/material';

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

export default function SamplingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;
  const { supabase } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('=== Sampling fetchData started ===');
      console.log('Reservation Number:', reservationNumber);

      if (!reservationNumber) {
        console.log('No reservation number provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Supabase SDK 사용 - 목록 페이지처럼 간단하게

        // sample_request_items 테이블에서 직접 조회
        const { data: sampleData, error: sampleError } = await supabase
          .from('sample_request_items')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        if (sampleError) {
          console.error('Sample order query error:', sampleError);
          throw new Error(sampleError.message);
        }

        if (!sampleData) {
          throw new Error('샘플링 데이터를 찾을 수 없습니다.');
        }

        console.log('Sample data:', sampleData);
        setData(sampleData);
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
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
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
      <OrderHeader reservationNumber={reservationNumber} orderData={data} serviceType="sampling" />

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
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                sx={{
                  '& .MuiTab-root': {
                    minWidth: isMobile ? 'auto' : 120,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                }}
              >
                <Tab
                  icon={<InfoIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '샘플' : '샘플정보'}
                  iconPosition="start"
                />
                <Tab
                  icon={<ShoppingCartIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '발주' : '발주내역'}
                  iconPosition="start"
                />
                <Tab
                  icon={<LocalShippingIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '배송' : '배송정보'}
                  iconPosition="start"
                />
                <Tab
                  icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '비용' : '비용정보'}
                  iconPosition="start"
                />
                <Tab
                  icon={<AttachFileIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '자료' : '관련자료'}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* 샘플정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 기본 정보 */}
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      샘플 기본정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                          >
                            샘플 신청일
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            {data?.created_at
                              ? new Date(data.created_at).toLocaleString('ko-KR')
                              : '-'}
                          </TableCell>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                          >
                            진행상태
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            <Chip
                              label={data?.status || '접수'}
                              color={data?.status === 'completed' ? 'success' : 'primary'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            공급업체
                          </TableCell>
                          <TableCell>{data?.supplier_name || '지정 대기중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            담당자
                          </TableCell>
                          <TableCell>{data?.supplier_contact || '지정 대기중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            배송방법
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={data?.shipping_method || '해운'}
                              color={data?.shipping_method === '항공' ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            수령지
                          </TableCell>
                          <TableCell>{data?.sample_receive_address || '미지정'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 요청사항 */}
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

            {/* 발주내역 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      샘플 발주내역
                    </Typography>

                    {data?.sample_items && data.sample_items.length > 0 ? (
                      <Box>
                        {data.sample_items.map((item: any, index: number) => (
                          <Box key={index} sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              color="primary"
                              sx={{ mb: 2 }}
                            >
                              샘플 {index + 1}
                            </Typography>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}
                                  >
                                    제품명
                                  </TableCell>
                                  <TableCell>{item.product_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    규격
                                  </TableCell>
                                  <TableCell>{item.specifications || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    수량
                                  </TableCell>
                                  <TableCell>{item.quantity || 0}개</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    샘플단가
                                  </TableCell>
                                  <TableCell>
                                    {item.unit_price
                                      ? `${item.unit_price.toLocaleString()}원`
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    샘플무게
                                  </TableCell>
                                  <TableCell>{item.weight ? `${item.weight}kg` : '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                            {index < data.sample_items.length - 1 && <Divider sx={{ my: 2 }} />}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">발주내역이 없습니다.</Typography>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 배송정보 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 중국 내 배송 */}
                <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      중국 내 배송정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}
                          >
                            공장 샘플 송장
                          </TableCell>
                          <TableCell>{data?.factory_sample_invoice || '대기중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            공장 배송조회
                          </TableCell>
                          <TableCell>
                            {data?.factory_delivery_tracking ? (
                              <a
                                href={`#${data.factory_delivery_tracking}`}
                                style={{ color: '#1976d2', textDecoration: 'underline' }}
                              >
                                {data.factory_delivery_tracking}
                              </a>
                            ) : (
                              '대기중'
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 국제 배송 */}
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      국제 배송정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}
                          >
                            광저우 샘플 송장번호
                          </TableCell>
                          <TableCell>{data?.gz_sample_invoice_number || '대기중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            광저우 배송조회
                          </TableCell>
                          <TableCell>
                            {data?.gz_delivery_tracking ? (
                              <a
                                href={`#${data.gz_delivery_tracking}`}
                                style={{ color: '#1976d2', textDecoration: 'underline' }}
                              >
                                {data.gz_delivery_tracking}
                              </a>
                            ) : (
                              '대기중'
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            국제 운송번호
                          </TableCell>
                          <TableCell>
                            {data?.international_tracking ? (
                              <a
                                href={`#${data.international_tracking}`}
                                style={{ color: '#1976d2', textDecoration: 'underline' }}
                              >
                                {data.international_tracking}
                              </a>
                            ) : (
                              '대기중'
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 통관 정보 */}
                {data?.customs_info && (
                  <BlankCard sx={{ bgcolor: 'secondary.lighter' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                        통관 정보
                      </Typography>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell
                              component="th"
                              sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}
                            >
                              통관상태
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={data.customs_info.status || '대기중'}
                                color={data.customs_info.status === '완료' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              component="th"
                              sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                            >
                              통관번호
                            </TableCell>
                            <TableCell>{data.customs_info.number || '-'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </BlankCard>
                )}
              </Stack>
            </TabPanel>

            {/* 비용정보 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      비용 상세내역
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50' }}
                          >
                            샘플제작비용
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" color="primary">
                              {data?.total_sample_cost
                                ? `₩${data.total_sample_cost.toLocaleString()}`
                                : '산정중'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            打样费
                          </TableCell>
                          <TableCell>
                            {data?.sample_making_cost
                              ? `¥${data.sample_making_cost.toLocaleString()}`
                              : '산정중'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            배송비
                          </TableCell>
                          <TableCell>
                            {data?.shipping_cost
                              ? `₩${data.shipping_cost.toLocaleString()}`
                              : '산정중'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            결제상태
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={data?.payment_status || '대기'}
                              color={data?.payment_status === 'paid' ? 'success' : 'default'}
                              size="small"
                            />
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
                {data?.files && data.files.length > 0 ? (
                  <Stack spacing={2}>
                    {data.files.map((file: any, index: number) => (
                      <Paper
                        key={index}
                        sx={{ p: 2, cursor: 'pointer' }}
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Typography>{file.name}</Typography>
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
              zIndex: 1200,
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
              },
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

      {/* Image Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="image-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={() => setModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="샘플 이미지"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
