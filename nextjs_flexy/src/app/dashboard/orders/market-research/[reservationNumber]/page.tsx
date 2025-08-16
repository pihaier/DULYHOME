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
  Drawer,
  Divider,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../_components/OrderHeader';
import ChatPanel from '../../_components/ChatPanel';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!reservationNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // 현재 사용자 정보 확인
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user?.id);

        // SDK 사용하여 직접 조회
        const { data, error } = await supabase
          .from('market_research_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        console.log('Query result:', { data, error });

        // 파일들은 이제 data에 포함되어 있음 (application_photos, logo_files, box_files)

        if (error) {
          console.error('Database error:', error);
          throw new Error(error.message || '데이터를 불러오는데 실패했습니다.');
        }

        if (!data) {
          // 사용자 역할 확인
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user?.id)
            .single();
          
          console.error('No data found. User role:', profile?.role);
          throw new Error('데이터를 찾을 수 없습니다. 권한이 없거나 데이터가 존재하지 않습니다.');
        }

        setData(data);
        // files는 이제 data에 포함되어 있음
        // application_photos, logo_files, box_files를 통합하여 files 배열 생성
        const allFiles = [
          ...(data.application_photos || []).map((f: any) => ({ ...f, file_type: 'product', file_url: f.url })),
          ...(data.logo_files || []).map((f: any) => ({ ...f, file_type: 'logo', file_url: f.url })),
          ...(data.box_files || []).map((f: any) => ({ ...f, file_type: 'box_design', file_url: f.url }))
        ];
        setFiles(allFiles);
      } catch (err) {
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
    <Box
      sx={{
        // Container의 padding을 상쇄하기 위해 음수 마진 적용
        mx: { xs: -2, sm: -3, md: -4 },
        px: { xs: 2, sm: 3, md: 4 },
        width: 'calc(100% + 32px)',
        '@media (min-width: 600px)': {
          width: 'calc(100% + 48px)',
        },
        '@media (min-width: 900px)': {
          width: 'calc(100% + 64px)',
        },
      }}
    >
      {/* Header */}
      <OrderHeader
        reservationNumber={reservationNumber}
        serviceType="market_research"
        status={data?.status}
        createdAt={data?.created_at}
        updatedAt={data?.updated_at}
        orderData={data}
      />

      {/* Main Content with Chat */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          gap: 2,
          width: '100%',
          maxWidth: '100%',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Main Content */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            minHeight: { xs: 'auto', lg: 'calc(100vh - 200px)' },
            maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
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
                icon={<LocalShippingIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                label={isMobile ? '공장' : '공장정보'}
                iconPosition="start"
              />
              <Tab
                icon={<InventoryIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                label={isMobile ? '제품' : '제품정보'}
                iconPosition="start"
              />
              <Tab
                icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                label={isMobile ? '가격' : '가격정보'}
                iconPosition="start"
              />
              <Tab
                icon={<AttachFileIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                label={isMobile ? '자료' : '관련자료'}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content Container */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* 신청정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
              {/* 신청 정보 */}
              <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    신청 정보
                  </Typography>
                  {isMobile ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          품명
                        </Typography>
                        <Typography variant="body1">{data?.product_name || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          조사수량
                        </Typography>
                        <Typography variant="body1">
                          {data?.research_quantity?.toLocaleString() || '-'}개
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          신청일시
                        </Typography>
                        <Typography variant="body1">
                          {data?.created_at
                            ? new Date(data.created_at).toLocaleString('ko-KR')
                            : '-'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          상세 페이지 URL
                        </Typography>
                        <Typography variant="body1">
                          {data?.detail_page ? (
                            <a
                              href={data.detail_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1976d2', textDecoration: 'underline' }}
                            >
                              {data.detail_page}
                            </a>
                          ) : (
                            '없음'
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          추가 요청사항
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              MOQ 확인
                            </Typography>
                            <Typography variant="body2">
                              {data?.moq_check ? '확인 필요' : '미확인'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              로고 인쇄
                            </Typography>
                            <Typography variant="body2">
                              {data?.logo_required ? '요청' : '요청 없음'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              커스텀 박스
                            </Typography>
                            <Typography variant="body2">
                              {data?.custom_box_required ? '요청' : '요청 없음'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}
                          >
                            품명
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>{data?.product_name || '-'}</TableCell>
                          <TableCell
                            component="th"
                            sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}
                          >
                            조사수량
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>
                            {data?.research_quantity?.toLocaleString() || '-'}개
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            신청일시
                          </TableCell>
                          <TableCell>
                            {data?.created_at
                              ? new Date(data.created_at).toLocaleString('ko-KR')
                              : '-'}
                          </TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            상세 페이지 URL
                          </TableCell>
                          <TableCell>
                            {data?.detail_page ? (
                              <a
                                href={data.detail_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1976d2', textDecoration: 'underline' }}
                              >
                                {data.detail_page}
                              </a>
                            ) : (
                              '없음'
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            추가 요청사항
                          </TableCell>
                          <TableCell colSpan={3}>
                            <Stack
                              direction={isMobile ? 'column' : 'row'}
                              spacing={2}
                              alignItems={isMobile ? 'flex-start' : 'center'}
                            >
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  MOQ 확인
                                </Typography>
                                <Typography variant="body2">
                                  {data?.moq_check ? '확인 필요' : '미확인'}
                                </Typography>
                              </Box>
                              {!isMobile && <Divider orientation="vertical" flexItem />}
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  로고 인쇄
                                </Typography>
                                <Typography variant="body2">
                                  {data?.logo_required ? '요청' : '요청 없음'}
                                </Typography>
                              </Box>
                              {!isMobile && <Divider orientation="vertical" flexItem />}
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  커스텀 박스
                                </Typography>
                                <Typography variant="body2">
                                  {data?.custom_box_required ? '요청' : '요청 없음'}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </BlankCard>

              {/* 제품 사진 */}
              {files.filter((f) => f.file_type === 'product').length > 0 && (
                <BlankCard sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      제품 사진 ({files.filter((f) => f.file_type === 'product').length}개)
                    </Typography>
                    <Box
                      sx={{
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
                        },
                      }}
                    >
                      {files
                        .filter((f) => f.file_type === 'product')
                        .map((file: any, index: number) => (
                          <Box
                            key={index}
                            sx={{
                              minWidth: 120,
                              width: 120,
                              height: 120,
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: 'success.light',
                              '&:hover': {
                                borderColor: 'success.main',
                                transform: 'scale(1.05)',
                                transition: 'all 0.3s ease',
                              },
                            }}
                            onClick={() => {
                              setSelectedImage(file.file_url || file.public_url);
                              setModalOpen(true);
                            }}
                          >
                            <Box
                              component="img"
                              src={file.file_url || file.public_url}
                              alt={`제품 사진 ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </BlankCard>
              )}

              {/* 요청사항 */}
              <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    요청사항
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {data?.requirements || '요청사항이 없습니다.'}
                  </Typography>
                </CardContent>
              </BlankCard>

              {/* 로고 파일 */}
              {files.filter((f) => f.file_type === 'logo').length > 0 && (
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      업로드된 로고 파일 ({files.filter((f) => f.file_type === 'logo').length}개)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {files
                        .filter((f) => f.file_type === 'logo')
                        .map((file: any, index: number) => (
                          <Paper
                            key={index}
                            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', width: 150 }}
                            onClick={() => window.open(file.file_url || file.public_url, '_blank')}
                          >
                            <Box sx={{ py: 3 }}>
                              <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                            </Box>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                              {file.original_filename}
                            </Typography>
                          </Paper>
                        ))}
                    </Box>
                    {data?.logo_details && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          로고 인쇄 상세 정보
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {data.logo_details}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </BlankCard>
              )}

              {/* 박스 디자인 파일 */}
              {files.filter(
                (f) => f.file_type === 'box_design' || f.upload_category === 'box_design'
              ).length > 0 && (
                <BlankCard sx={{ bgcolor: 'secondary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      박스 디자인 파일 (
                      {
                        files.filter(
                          (f) => f.file_type === 'box_design' || f.upload_category === 'box_design'
                        ).length
                      }
                      개)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {files
                        .filter(
                          (f) => f.file_type === 'box_design' || f.upload_category === 'box_design'
                        )
                        .map((file: any, index: number) => (
                          <Paper
                            key={index}
                            sx={{ p: 2, textAlign: 'center', cursor: 'pointer', width: 150 }}
                            onClick={() => window.open(file.file_url || file.public_url, '_blank')}
                          >
                            <Box sx={{ py: 3 }}>
                              <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
                            </Box>
                            <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                              {file.original_filename}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {(file.file_size / 1024 / 1024).toFixed(2)}MB
                            </Typography>
                          </Paper>
                        ))}
                    </Box>
                    {data?.box_details && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          박스 제작 상세 정보
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {data.box_details}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </BlankCard>
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
                      {/* 기업 신용정보 */}
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          sx={{
                            bgcolor: 'info.lighter',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            borderTop: '2px solid #ddd',
                          }}
                        >
                          기업 신용정보
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}
                        >
                          업종
                        </TableCell>
                        <TableCell>{data?.industry_kr || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          법인/개인
                        </TableCell>
                        <TableCell>{data?.legal_type_kr || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          인원규모
                        </TableCell>
                        <TableCell>{data?.company_size_kr || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          개업시간
                        </TableCell>
                        <TableCell>
                          {data?.established_date
                            ? new Date(data.established_date).toLocaleDateString('ko-KR')
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          등록자본
                        </TableCell>
                        <TableCell>{data?.registered_capital || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          실수등록자금
                        </TableCell>
                        <TableCell>{data?.real_paid_capital || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          기업상태
                        </TableCell>
                        <TableCell>{data?.company_status || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          소규모기업 여부
                        </TableCell>
                        <TableCell>
                          {data?.is_small_business !== undefined
                            ? data.is_small_business
                              ? '소규모기업'
                              : '일반기업'
                            : '조사중'}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          영업범위
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                          {data?.business_scope_kr || '조사중'}
                        </TableCell>
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
              {/* 통합된 제품 정보 테이블 */}
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    제품 정보
                  </Typography>
                  <Table>
                    <TableBody>
                      {/* 제품 기본정보 섹션 */}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{
                            bgcolor: 'primary.lighter',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          제품 기본정보
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                        >
                          제품번호
                        </TableCell>
                        <TableCell sx={{ width: '35%' }}>
                          {data?.product_code || '자동발급'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                        >
                          견적수량
                        </TableCell>
                        <TableCell sx={{ width: '35%' }}>
                          {data?.quoted_quantity?.toLocaleString() || '조사중'}개
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          박스당 제품개수
                        </TableCell>
                        <TableCell>{data?.units_per_box || '조사중'}개</TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          총 박스수
                        </TableCell>
                        <TableCell>{data?.total_boxes || '자동계산'}박스</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          박스 사이즈
                        </TableCell>
                        <TableCell colSpan={3}>
                          {data?.box_length && data?.box_width && data?.box_height 
                            ? `${data.box_length} × ${data.box_width} × ${data.box_height} cm (가로×세로×높이)`
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          HS코드
                        </TableCell>
                        <TableCell>{data?.hs_code || '조사중'}</TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          인증필요여부
                        </TableCell>
                        <TableCell>
                          {data?.certification_required !== undefined ? (
                            <Chip
                              label={data.certification_required ? '인증 필요' : '인증 불필요'}
                              color={data.certification_required ? 'error' : 'success'}
                              size="small"
                            />
                          ) : (
                            'API 조회중'
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          소요시간
                        </TableCell>
                        <TableCell>{data?.work_duration || '조사중'}</TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          수출항
                        </TableCell>
                        <TableCell>{data?.export_port || '조사중'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          기타사항
                        </TableCell>
                        <TableCell colSpan={3}>
                          {data?.other_matters_kr || data?.other_matters || '조사중'}
                        </TableCell>
                      </TableRow>

                      {/* 샘플 정보 섹션 */}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{
                            bgcolor: 'secondary.lighter',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            borderTop: '2px solid #ddd',
                          }}
                        >
                          샘플 정보
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          샘플재고 유무
                        </TableCell>
                        <TableCell>
                          {data?.sample_available !== undefined ? (
                            <Chip
                              label={data.sample_available ? '재고 있음' : '재고 없음'}
                              color={data.sample_available ? 'success' : 'default'}
                              size="small"
                            />
                          ) : (
                            '조사중'
                          )}
                        </TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          샘플 주문 가능 수량
                        </TableCell>
                        <TableCell>
                          {data?.sample_order_qty ? `${data.sample_order_qty}개` : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          샘플 무게
                        </TableCell>
                        <TableCell>
                          {data?.sample_weight ? `${data.sample_weight}kg` : '조사중'}
                        </TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          샘플 제작 기간
                        </TableCell>
                        <TableCell>
                          {data?.sample_make_time ? `${data.sample_make_time}일` : '조사중'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </BlankCard>

              {/* 제품 실사 사진 */}
              {data?.product_actual_photos && data.product_actual_photos.length > 0 && (
                <BlankCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      제품 실사 사진
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {data.product_actual_photos.map((photo: string, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 150,
                            height: 150,
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 2,
                            },
                          }}
                          onClick={() => {
                            setSelectedImage(photo);
                            setModalOpen(true);
                          }}
                        >
                          <img
                            src={photo}
                            alt={`제품 실사 ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              p: 0.5,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption">실사 {index + 1}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </BlankCard>
              )}
            </Stack>
          </TabPanel>

            {/* 가격정보 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3} sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
              {/* 기본 정보 */}
              <BlankCard sx={{ bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    기본 정보
                  </Typography>
                  <Table sx={{ minWidth: { xs: 'auto', md: 700, lg: 900 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          견적수량
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.quoted_quantity?.toLocaleString() || '조사중'}개
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          중국단가
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.china_unit_price 
                            ? `¥${data.china_unit_price?.toLocaleString() || '0'}`
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          환율
                        </TableCell>
                        <TableCell>
                          {data?.exchange_rate 
                            ? `₩${data.exchange_rate.toFixed(2)}`
                            : '조사중'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          환율 산정일
                        </TableCell>
                        <TableCell>
                          {data?.exchange_rate_date 
                            ? new Date(data.exchange_rate_date).toLocaleDateString('ko-KR')
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </BlankCard>

              {/* 1차 결제 정보 */}
              <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    1차 결제 정보
                  </Typography>
                  <Table sx={{ minWidth: { xs: 'auto', md: 700, lg: 900 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          EXW 합계
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.exw_total 
                            ? `₩${data.exw_total?.toLocaleString() || '0'}`
                            : '조사중'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          중국 운송료
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.china_shipping_fee 
                            ? `¥${data.china_shipping_fee?.toLocaleString() || '0'}`
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}>
                          수수료
                        </TableCell>
                        <TableCell>
                          {data?.commission_amount 
                            ? `₩${data.commission_amount?.toLocaleString() || '0'} (${data?.commission_rate || 5}%)`
                            : '조사중'}
                        </TableCell>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}>
                          1차 결제비용
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" color="primary">
                            {data?.first_payment_amount 
                              ? `₩${data.first_payment_amount?.toLocaleString() || '0'}`
                              : '조사중'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </BlankCard>

              {/* 2차 결제 정보 */}
              <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    2차 결제 정보 (예측값)
                  </Typography>
                  <Table sx={{ minWidth: { xs: 'auto', md: 700, lg: 900 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          총 CBM
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.total_cbm ? `${data.total_cbm}㎥` : '조사중'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          운송방식
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.shipping_method || '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          LCL 운송비
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.lcl_shipping_fee
                            ? `₩${data.lcl_shipping_fee?.toLocaleString() || '0'}`
                            : '-'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '20%', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          FCL 운송비
                        </TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          {data?.fcl_shipping_fee
                            ? `₩${data.fcl_shipping_fee?.toLocaleString() || '0'}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          관세
                        </TableCell>
                        <TableCell>
                          {data?.customs_duty !== undefined
                            ? `₩${data.customs_duty?.toLocaleString() || '0'} (${data?.customs_rate || 0}%)`
                            : '조사중'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          수입 부가세
                        </TableCell>
                        <TableCell>
                          {data?.import_vat 
                            ? `₩${data.import_vat?.toLocaleString() || '0'}`
                            : '조사중'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          관세사 비용
                        </TableCell>
                        <TableCell>
                          {data?.customs_broker_fee
                            ? `₩${data.customs_broker_fee?.toLocaleString() || '0'}`
                            : '₩30,000 (고정)'}
                        </TableCell>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' }}
                        >
                          원산지 증명서
                        </TableCell>
                        <TableCell>
                          {data?.co_certificate_fee
                            ? `₩${data.co_certificate_fee?.toLocaleString() || '0'}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          예상 2차결제비용
                        </TableCell>
                        <TableCell colSpan={3}>
                          <Typography variant="h6" color="warning.main">
                            {data?.expected_second_payment 
                              ? `₩${data.expected_second_payment?.toLocaleString() || '0'}`
                              : '조사중'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </BlankCard>

              {/* 최종 예상 가격 */}
              <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    최종 예상 가격
                  </Typography>
                  <Table sx={{ minWidth: { xs: 'auto', md: 700, lg: 900 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', width: '30%', bgcolor: 'grey.50' }}
                        >
                          예상 총 공급가
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" color="text.primary">
                            {data?.expected_total_supply_price 
                              ? `₩${data.expected_total_supply_price?.toLocaleString() || '0'}`
                              : '조사중'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          component="th"
                          sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                        >
                          예상 단가 (VAT 포함)
                        </TableCell>
                        <TableCell>
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            {data?.expected_unit_price 
                              ? `₩${data.expected_unit_price?.toLocaleString() || '0'}`
                              : '조사중'}
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
              <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
              {files.length > 0 ? (
                <Stack spacing={2}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    전체 관련 파일 ({files.length}개)
                  </Typography>
                  {files.map((file: any, index: number) => (
                    <Paper key={index} elevation={1} sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {file.original_filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.file_type} | {(file.file_size / 1024 / 1024).toFixed(2)}MB |
                            {new Date(file.created_at).toLocaleString('ko-KR')}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          {(file.mime_type?.startsWith('image/') ||
                            file.original_filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedImage(file.file_url || file.public_url);
                                setModalOpen(true);
                              }}
                            >
                              <ImageIcon />
                            </IconButton>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            href={file.file_url || file.public_url}
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
          </Box>

        </Paper>

        {/* Desktop - Chat on right side */}
        {!isMobile && (
          <Paper
            elevation={2}
            sx={{
              flex: '0 0 400px',
              minHeight: 'calc(100vh - 200px)',
              maxHeight: 'calc(100vh - 200px)',
              overflow: 'hidden',
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
            }}
          >
            <ChatPanel reservationNumber={reservationNumber} serviceType="market-research" />
          </Paper>
        )}
      </Box>

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
                <ChatPanel reservationNumber={reservationNumber} serviceType="market-research" />
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
