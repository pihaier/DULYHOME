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
  Fab,
  useMediaQuery,
  useTheme,
  Drawer
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../orders/_components/OrderHeader';
import ChatPanel from '../../orders/_components/ChatPanel';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
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

export default function MarketResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const reservationNumber = params.reservationNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('=== MarketResearch fetchData started ===');
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
        
        console.log('Querying market_research_requests...');
        const { data, error } = await supabase
          .from('market_research_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .single();
        
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
      <OrderHeader orderData={data} serviceType="market_research" reservationNumber={reservationNumber} />

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
                <Tab icon={<BusinessIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "신청" : "신청정보"} iconPosition="start" />
                <Tab icon={<LocalShippingIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "공장" : "공장정보"} iconPosition="start" />
                <Tab icon={<InventoryIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "제품" : "제품정보"} iconPosition="start" />
                <Tab icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "가격" : "가격정보"} iconPosition="start" />
                <Tab icon={<AttachFileIcon sx={{ fontSize: isMobile ? 20 : 24 }} />} label={isMobile ? "자료" : "관련자료"} iconPosition="start" />
              </Tabs>
            </Box>

            {/* 신청정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 신청 정보 */}
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      신청 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                품명
                              </TableCell>
                              <TableCell>{data?.product_name || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                조사수량
                              </TableCell>
                              <TableCell>{data?.research_quantity?.toLocaleString() || '-'}개</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        
                        {/* 제품 사진 */}
                        {data?.research_photos && data.research_photos.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
                              제품 사진 ({data.research_photos.length}개)
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1, 
                              overflowX: 'auto',
                              pb: 1,
                              '&::-webkit-scrollbar': {
                                height: 4,
                              },
                              '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: 10,
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: '#888',
                                borderRadius: 10,
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: '#555',
                              }
                            }}>
                              {data.research_photos.map((photoUrl: string, index: number) => (
                                <Box
                                  key={index}
                                  sx={{
                                    minWidth: 80,
                                    width: 80,
                                    height: 80,
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '2px solid',
                                    borderColor: 'success.light',
                                    '&:hover': {
                                      borderColor: 'success.main',
                                      transform: 'scale(1.05)',
                                      transition: 'all 0.3s ease'
                                    }
                                  }}
                                  onClick={() => {
                                    setSelectedImage(photoUrl);
                                    setModalOpen(true);
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={photoUrl}
                                    alt={`제품 사진 ${index + 1}`}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                신청일시
                              </TableCell>
                              <TableCell>
                                {data?.created_at ? new Date(data.created_at).toLocaleString('ko-KR') : '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                상세 페이지 URL
                              </TableCell>
                              <TableCell>
                                {data?.detail_page ? (
                                  <a href={data.detail_page} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                                    {data.detail_page}
                                  </a>
                                ) : '없음'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                MOQ 확인 여부
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={data?.moq_check ? '확인 필요' : '미확인'} 
                                  color={data?.moq_check ? 'warning' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                로고 인쇄
                              </TableCell>
                              <TableCell>
                                {data?.logo_required ? (
                                  <>
                                    <Chip label="로고 인쇄 필요" color="warning" size="small" />
                                    {data?.logo_details && (
                                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        {data.logo_details}
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">요청 없음</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                                커스텀 박스
                              </TableCell>
                              <TableCell>
                                {data?.custom_box_required ? (
                                  <>
                                    <Chip label="커스텀 박스 제작" color="warning" size="small" />
                                    {data?.box_details && (
                                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        {data.box_details}
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">요청 없음</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </CardContent>
                </BlankCard>

                {/* 요청사항 */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    요청사항
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {data?.requirements || '요청사항이 없습니다.'}
                    </Typography>
                  </Paper>
                </Box>

                {/* 로고 파일 */}
                {data?.logo_file && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      업로드된 로고 파일
                    </Typography>
                    <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }} onClick={() => window.open(data.logo_file, '_blank')}>
                      <Box sx={{ py: 3 }}>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      </Box>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        로고 파일
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            </TabPanel>

            {/* 공장정보 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      공장 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            공장명
                          </TableCell>
                          <TableCell>{data?.factory_name || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            담당자
                          </TableCell>
                          <TableCell>{data?.factory_contact || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            연락처
                          </TableCell>
                          <TableCell>{data?.factory_phone || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            주소
                          </TableCell>
                          <TableCell>{data?.factory_address || '조사중'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 제품정보 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 제품 기본정보 */}
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      제품 기본정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            제품번호
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.product_code || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            견적수량
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.quoted_quantity?.toLocaleString() || '조사중'}개</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            작업소요기간
                          </TableCell>
                          <TableCell>{data?.work_period || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            박스당 제품개수
                          </TableCell>
                          <TableCell>{data?.units_per_box || '조사중'}개</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            박스 길이
                          </TableCell>
                          <TableCell>{data?.box_length ? `${data.box_length}cm` : '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            박스 너비
                          </TableCell>
                          <TableCell>{data?.box_width ? `${data.box_width}cm` : '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            박스 높이
                          </TableCell>
                          <TableCell>{data?.box_height ? `${data.box_height}cm` : '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            총 박스수
                          </TableCell>
                          <TableCell>{data?.total_boxes || '조사중'}박스</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            기타사항
                          </TableCell>
                          <TableCell colSpan={3}>
                            {data?.other_matters_kr || data?.other_matters || '조사중'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 샘플 정보 */}
                <BlankCard sx={{ bgcolor: 'secondary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      샘플 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            샘플재고 유무
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            {data?.sample_available !== undefined ? (
                              <Chip 
                                label={data.sample_available ? '재고 있음' : '재고 없음'} 
                                color={data.sample_available ? 'success' : 'default'}
                                size="small"
                              />
                            ) : '조사중'}
                          </TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            샘플 단가
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.sample_unit_price ? `${data.sample_unit_price.toLocaleString()}원` : '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            주문 가능 수량
                          </TableCell>
                          <TableCell>{data?.sample_order_qty ? `${data.sample_order_qty}개` : '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            샘플 무게
                          </TableCell>
                          <TableCell>{data?.sample_weight ? `${data.sample_weight}kg` : '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            제작 기간
                          </TableCell>
                          <TableCell>{data?.sample_make_time || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            HS코드
                          </TableCell>
                          <TableCell>{data?.hs_code || '조사중'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 가격정보 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3} sx={{ p: 2 }}>
                {/* 1차 결제 정보 */}
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      1차 결제 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            중국단가
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.china_unit_price || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            환율
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.exchange_rate || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            EXW 합계
                          </TableCell>
                          <TableCell>{data?.exw_total?.toLocaleString() || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            중국 운송료
                          </TableCell>
                          <TableCell>{data?.china_shipping_fee?.toLocaleString() || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            수수료(5%)
                          </TableCell>
                          <TableCell>{data?.commission_amount?.toLocaleString() || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            1차 상세비용
                          </TableCell>
                          <TableCell>{data?.first_payment_detail || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            1차 결제비용
                          </TableCell>
                          <TableCell>{data?.first_payment?.toLocaleString() || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            운송방식
                          </TableCell>
                          <TableCell>{data?.shipping_method || '조사중'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 2차 결제 정보 */}
                <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      2차 결제 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            CIF 단가
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.cif_unit_price || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            관부가세
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.customs_tax?.toLocaleString() || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            국내운송료
                          </TableCell>
                          <TableCell>{data?.domestic_shipping_fee?.toLocaleString() || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            2차 상세비용
                          </TableCell>
                          <TableCell>{data?.second_payment_detail || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            2차 결제비용
                          </TableCell>
                          <TableCell colSpan={3}>
                            <Typography variant="h6" color="primary">
                              {data?.second_payment ? `₩${data.second_payment.toLocaleString()}` : '조사중'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </BlankCard>

                {/* 비용 산출 정보 */}
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      비용 산출 정보
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            제품상세단가
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.product_detail_price || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            평균 무게
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.avg_weight ? `${data.avg_weight}kg` : '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            국내물류비용
                          </TableCell>
                          <TableCell>{data?.domestic_logistics_cost || '조사중'}</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            통관요율
                          </TableCell>
                          <TableCell>{data?.customs_rate || '조사중'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            기타사항
                          </TableCell>
                          <TableCell colSpan={3}>{data?.other_requirements || '없음'}</TableCell>
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
                <Typography color="text.secondary">관련자료가 없습니다.</Typography>
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

      {/* Image Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="image-modal"
      >
        <Box sx={{
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
        }}>
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
              alt="제품 사진"
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