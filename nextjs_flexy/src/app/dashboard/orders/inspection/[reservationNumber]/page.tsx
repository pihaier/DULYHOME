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
  Fab,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Divider,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../_components/OrderHeader';
import ChatPanel from '../../_components/ChatPanel';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
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

export default function InspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('=== Inspection fetchData started ===');
      console.log('Reservation Number:', reservationNumber);

      if (!reservationNumber) {
        console.log('No reservation number provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        console.log('Querying inspection_applications...');
        const { data, error } = await supabase
          .from('inspection_applications')
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

        // 업로드된 파일들 가져오기
        const { data: filesData, error: filesError } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        if (filesError) {
          console.error('Files fetch error:', filesError);
        } else {
          setFiles(filesData || []);
        }
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
        <Button onClick={() => router.push('/dashboard/inspection')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <OrderHeader
        orderData={data}
        serviceType="inspection"
        reservationNumber={reservationNumber}
      />

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
                  icon={<BusinessIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '신청' : '신청정보'}
                  iconPosition="start"
                />
                <Tab
                  icon={<InventoryIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={isMobile ? '검품' : '검품정보'}
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

            {/* 신청정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      검품 신청 정보
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              제품명
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {data?.product_name || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              생산수량
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {data?.production_quantity?.toLocaleString() || '-'}개
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              검품방법
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={data?.inspection_method === 'full' ? '전수검품' : '표준검품'}
                                color={data?.inspection_method === 'full' ? 'primary' : 'default'}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              신청일시
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {data?.created_at
                                ? new Date(data.created_at).toLocaleDateString('ko-KR')
                                : '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* 공장 정보 */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      공장 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              공장명
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_name || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              담당자
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_contact || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              연락처
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_phone || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              주소
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_address || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* 일정 정보 */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      일정 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              일정 조율 방식
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.schedule_type === 'already_booked'
                                ? '이미 예약됨'
                                : '두리무역이 조율'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              검품 일수
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.inspection_days || 1}일
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                          {data?.confirmed_date && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                확정된 검품일
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {new Date(data.confirmed_date).toLocaleDateString('ko-KR')}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* 특별 요구사항 */}
                    {data?.special_requirements && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          특별 요구사항
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100' }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.special_requirements}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* 첨부 파일 */}
                    {files.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          첨부 파일 ({files.length}개)
                        </Typography>
                        <Stack spacing={1}>
                          {files.map((file) => (
                            <Paper key={file.id} sx={{ p: 2 }} elevation={0}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {/* 이미지 미리보기 */}
                                {(file.mime_type?.startsWith('image/') ||
                                  file.original_filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                                  <Box
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      border: '1px solid rgba(0,0,0,0.1)',
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <img
                                      src={file.file_url}
                                      alt={file.original_filename}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  </Box>
                                )}
                                {/* 파일 아이콘 (이미지가 아닌 경우) */}
                                {!(
                                  file.mime_type?.startsWith('image/') ||
                                  file.original_filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                                ) && <AttachFileIcon color="action" sx={{ fontSize: 40 }} />}
                                <Box flex={1}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {file.original_filename}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(file.file_size / 1024 / 1024).toFixed(2)}MB •
                                    {new Date(file.created_at).toLocaleDateString('ko-KR')}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  다운로드
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 검품정보 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      검품 일정 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            검품 기간
                          </Typography>
                          <Typography variant="h5" fontWeight="600" color="primary">
                            {data?.inspection_days || '-'}일
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            확정 일자
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {data?.confirmed_date
                              ? new Date(data.confirmed_date).toLocaleDateString('ko-KR')
                              : '미정'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            검품 상태
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {data?.pass_fail_status === 'pass' ? (
                              <Chip label="합격" color="success" size="small" />
                            ) : data?.pass_fail_status === 'fail' ? (
                              <Chip label="불합격" color="error" size="small" />
                            ) : (
                              <Chip label="대기중" color="default" size="small" />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 개선사항 */}
                    {data?.improvement_items && data.improvement_items.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          개선사항
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100' }} elevation={0}>
                          {data.improvement_items.map((item: string, index: number) => (
                            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                              • {item}
                            </Typography>
                          ))}
                        </Paper>
                      </Box>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 비용정보 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      비용 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            총 비용
                          </Typography>
                          <Typography variant="h4" fontWeight="700" color="primary">
                            {data?.total_cost ? `₩${data.total_cost.toLocaleString()}` : '미정'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            VAT
                          </Typography>
                          <Typography variant="h5" fontWeight="600">
                            {data?.vat_amount ? `₩${data.vat_amount.toLocaleString()}` : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            결제 상태
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={data?.payment_status === 'paid' ? '결제완료' : '대기중'}
                              color={data?.payment_status === 'paid' ? 'success' : 'default'}
                              size="medium"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 관련자료 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 3 }}>
                {files.length > 0 ? (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      업로드된 파일 ({files.length}개)
                    </Typography>
                    {files.map((file) => (
                      <Paper key={file.id} sx={{ p: 2 }} elevation={1}>
                        <Stack spacing={2}>
                          {/* 이미지 파일인 경우 미리보기 표시 */}
                          {(file.mime_type?.startsWith('image/') ||
                            file.original_filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                            <Box sx={{ mb: 2 }}>
                              <img
                                src={file.file_url}
                                alt={file.original_filename}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '300px',
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                }}
                                onError={(e) => {
                                  console.error('이미지 로드 실패:', file.file_url);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </Box>
                          )}
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <AttachFileIcon color="action" />
                            <Box flex={1}>
                              <Typography variant="body1">{file.original_filename}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {file.file_type} • {(file.file_size / 1024 / 1024).toFixed(2)}MB •
                                {new Date(file.created_at).toLocaleDateString('ko-KR')}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              다운로드
                            </Button>
                          </Stack>
                        </Stack>
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
            <Box sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden' }}>
              <ChatPanel reservationNumber={reservationNumber} serviceType="inspection" />
            </Box>
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
                <ChatPanel reservationNumber={reservationNumber} serviceType="inspection" />
              </Box>
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
