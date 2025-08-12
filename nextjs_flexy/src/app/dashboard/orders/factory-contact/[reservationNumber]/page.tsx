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
  Chip,
  CardContent,
  Fab,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Divider,
  Card,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BlankCard from '@/app/components/shared/BlankCard';
import OrderHeader from '../../_components/OrderHeader';
import ChatPanel from '../../_components/ChatPanel';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Grid } from '@mui/material';
import { useUser } from '@/lib/context/GlobalContext';

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

interface ConfirmationRequest {
  id: string;
  request_type: string;
  title: string;
  description: string;
  options: any[];
  status: string;
  customer_response?: string;
  selected_option_id?: string;
  customer_comment?: string;
  is_urgent: boolean;
  deadline?: string;
  created_at: string;
}

export default function FactoryContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { user } = useUser();
  const reservationNumber = params.reservationNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState<ConfirmationRequest | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [confirmComment, setConfirmComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!reservationNumber) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // 공장컨택 정보 조회
        const { data, error } = await supabase
          .from('factory_contact_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();
        
        if (error) throw new Error(error.message);
        if (!data) throw new Error('데이터를 찾을 수 없습니다.');
        
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

        // 컨펌 요청 가져오기
        const { data: confirmData, error: confirmError } = await supabase
          .from('confirmation_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        if (confirmError) {
          console.error('Confirmation requests fetch error:', confirmError);
        } else {
          setConfirmations(confirmData || []);
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

  const handleConfirmationResponse = async (confirmation: ConfirmationRequest, response: 'approved' | 'rejected' | 'need_alternative') => {
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('confirmation_requests')
        .update({
          customer_response: response,
          selected_option_id: selectedOption,
          customer_comment: confirmComment,
          responded_at: new Date().toISOString(),
          status: 'responded'
        })
        .eq('id', confirmation.id);

      if (error) throw error;

      // 목록 새로고침
      const { data: confirmData } = await supabase
        .from('confirmation_requests')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .order('created_at', { ascending: false });

      setConfirmations(confirmData || []);
      setSelectedConfirmation(null);
      setSelectedOption('');
      setConfirmComment('');
      
      alert('응답이 전송되었습니다.');
    } catch (error) {
      console.error('Error responding to confirmation:', error);
      alert('응답 전송 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      quotation: '견적서',
      sample_option: '샘플 옵션',
      shipping_method: '배송 방법',
      payment_terms: '결제 조건',
      design_approval: '디자인 승인',
      schedule_confirm: '일정 확인',
      price_negotiation: '가격 협상',
      custom: '기타'
    };
    return typeMap[type] || type;
  };

  const getRequestTypeLabels = (types: string[]) => {
    const typeMap: { [key: string]: string } = {
      sample: '샘플 제작',
      bulk_order: '대량 주문',
      inspection: '검품 요청',
      shipping: '배송 문의',
      other: '기타'
    };
    
    return types.map(type => typeMap[type] || type);
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
        <Button onClick={() => router.push('/dashboard/orders/factory-contact')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <OrderHeader orderData={data} serviceType="factory_contact" reservationNumber={reservationNumber} />

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
              >
                <Tab icon={<BusinessIcon />} label="신청정보" iconPosition="start" />
                <Tab icon={<FactoryIcon />} label="공장정보" iconPosition="start" />
                <Tab 
                  icon={
                    <Badge badgeContent={confirmations.filter(c => c.status === 'pending').length} color="error">
                      <AssignmentIcon />
                    </Badge>
                  } 
                  label="컨펌대기" 
                  iconPosition="start" 
                />
                <Tab icon={<AttachFileIcon />} label="첨부파일" iconPosition="start" />
              </Tabs>
            </Box>

            {/* 신청정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      기본 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">회사명</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.company_name || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">담당자</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.contact_person || '-'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">연락처</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.contact_phone || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">이메일</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.contact_email || '-'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      제품 정보
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">제품명</Typography>
                        <Typography variant="body1" fontWeight="medium">{data?.product_name || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">제품 설명</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {data?.product_description || '-'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      요청 사항
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {getRequestTypeLabels(data?.request_type || []).map((type) => (
                        <Chip key={type} label={type} sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>
                    {data?.special_requirements && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">상세 요청사항</Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 1 }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.special_requirements}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 공장정보 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      공장 정보
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">공장명</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.factory_name || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">담당자</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.factory_contact_person || '-'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">연락처</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.factory_contact_phone || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">주소</Typography>
                            <Typography variant="body1" fontWeight="medium">{data?.factory_address || '-'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 컨펌대기 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                {confirmations.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                    컨펌 대기 중인 항목이 없습니다.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {confirmations.map((confirmation) => (
                      <Card key={confirmation.id} sx={{ 
                        border: confirmation.is_urgent ? '2px solid' : '1px solid',
                        borderColor: confirmation.is_urgent ? 'error.main' : 'divider'
                      }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="h6" fontWeight="bold">
                                  {confirmation.title}
                                </Typography>
                                {confirmation.is_urgent && (
                                  <Chip label="긴급" color="error" size="small" />
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {getRequestTypeLabel(confirmation.request_type)} • 
                                {new Date(confirmation.created_at).toLocaleDateString('ko-KR')}
                              </Typography>
                            </Box>
                            <Chip 
                              label={
                                confirmation.status === 'pending' ? '대기중' : 
                                confirmation.customer_response === 'approved' ? '승인됨' :
                                confirmation.customer_response === 'rejected' ? '거절됨' : '응답됨'
                              }
                              color={
                                confirmation.status === 'pending' ? 'warning' : 
                                confirmation.customer_response === 'approved' ? 'success' : 'error'
                              }
                              size="small"
                            />
                          </Stack>

                          <Typography variant="body2" sx={{ mb: 3 }}>
                            {confirmation.description}
                          </Typography>

                          {confirmation.options && confirmation.options.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                선택 옵션
                              </Typography>
                              <RadioGroup 
                                value={selectedConfirmation?.id === confirmation.id ? selectedOption : confirmation.selected_option_id || ''}
                                onChange={(e) => setSelectedOption(e.target.value)}
                              >
                                {confirmation.options.map((option: any) => (
                                  <Paper key={option.id} sx={{ p: 2, mb: 1 }} elevation={0}>
                                    <FormControlLabel
                                      value={option.id}
                                      control={<Radio disabled={confirmation.status !== 'pending'} />}
                                      label={
                                        <Box>
                                          <Typography variant="body2" fontWeight="bold">
                                            {option.label}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {option.description}
                                          </Typography>
                                          {option.price && (
                                            <Typography variant="body2" color="primary">
                                              ₩{option.price.toLocaleString()}
                                            </Typography>
                                          )}
                                        </Box>
                                      }
                                    />
                                  </Paper>
                                ))}
                              </RadioGroup>
                            </Box>
                          )}

                          {confirmation.status === 'pending' && (
                            <>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="추가 의견"
                                value={selectedConfirmation?.id === confirmation.id ? confirmComment : ''}
                                onChange={(e) => setConfirmComment(e.target.value)}
                                sx={{ mb: 2 }}
                              />

                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                  onClick={() => {
                                    setSelectedConfirmation(confirmation);
                                    handleConfirmationResponse(confirmation, 'rejected');
                                  }}
                                  disabled={submitting}
                                >
                                  거절
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    setSelectedConfirmation(confirmation);
                                    handleConfirmationResponse(confirmation, 'need_alternative');
                                  }}
                                  disabled={submitting}
                                >
                                  대안 요청
                                </Button>
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => {
                                    setSelectedConfirmation(confirmation);
                                    handleConfirmationResponse(confirmation, 'approved');
                                  }}
                                  disabled={submitting || (confirmation.options?.length > 0 && !selectedOption)}
                                >
                                  승인
                                </Button>
                              </Stack>
                            </>
                          )}

                          {confirmation.status !== 'pending' && confirmation.customer_comment && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                고객 의견
                              </Typography>
                              <Typography variant="body2">
                                {confirmation.customer_comment}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </TabPanel>

            {/* 첨부파일 탭 */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 3 }}>
                {files.length > 0 ? (
                  <Stack spacing={2}>
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
                                  border: '1px solid rgba(0,0,0,0.1)'
                                }}
                              />
                            </Box>
                          )}
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <AttachFileIcon color="action" />
                            <Box flex={1}>
                              <Typography variant="body1">
                                {file.original_filename}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(file.file_size / 1024 / 1024).toFixed(2)}MB • 
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
                  <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                    첨부된 파일이 없습니다.
                  </Typography>
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
              serviceType="factory-contact"
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
                  serviceType="factory-contact"
                />
              </Box>
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}

// Badge 컴포넌트 추가
const Badge = ({ badgeContent, color, children }: { badgeContent: number, color: string, children: React.ReactNode }) => {
  if (badgeContent === 0) return <>{children}</>;
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          minWidth: 20,
          height: 20,
          borderRadius: '10px',
          bgcolor: color === 'error' ? 'error.main' : 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        {badgeContent}
      </Box>
    </Box>
  );
};