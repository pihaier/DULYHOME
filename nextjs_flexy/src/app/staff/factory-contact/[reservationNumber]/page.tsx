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
  TextField,
  IconButton,
  Divider,
  Card,
  RadioGroup,
  FormControlLabel,
  Radio,
  Fab,
  useMediaQuery,
  useTheme,
  Drawer,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { translateStaffInput } from '@/lib/utils/auto-translate';
import BlankCard from '@/app/components/shared/BlankCard';
import StaffOrderHeader from '@/app/staff/_components/StaffOrderHeader';
import ChatPanel from '@/app/dashboard/orders/_components/ChatPanel';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TranslateIcon from '@mui/icons-material/Translate';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { Grid } from '@mui/material';
import { useUser } from '@/lib/context/GlobalContext';

// Tab Panel Component - dashboard와 동일
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
  reservation_number: string;
  request_type: string;
  title: string;
  title_chinese?: string;
  title_korean?: string;
  description: string;
  description_chinese?: string;
  description_korean?: string;
  options: any[];
  options_chinese?: any[];
  options_korean?: any[];
  status: string;
  customer_response?: string;
  selected_option_id?: string;
  customer_comment?: string;
  is_urgent: boolean;
  deadline?: string;
  created_at: string;
}

export default function StaffFactoryContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const { user, userProfile } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  const supabase = createClient();
  const isChineseStaff = userProfile?.role === 'chinese_staff';

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
        setEditData(data);

        // 업로드된 파일들 가져오기
        const { data: filesData } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        setFiles(filesData || []);

        // 컨펌 요청 가져오기
        const { data: confirmData } = await supabase
          .from('confirmation_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        setConfirmations(confirmData || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reservationNumber]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 자동 번역 필드 처리
      const updates = {
        ...editData,
        product_name_chinese: editData.product_name_chinese || editData.product_name,
        product_description_chinese:
          editData.product_description_chinese || editData.product_description,
        special_requirements_chinese:
          editData.special_requirements_chinese || editData.special_requirements,
      };

      const { data: updatedData, error } = await supabase
        .from('factory_contact_requests')
        .update(updates)
        .eq('reservation_number', reservationNumber)
        .select()
        .single();

      if (error) throw error;

      // 백그라운드에서 자동 번역 실행 (실패해도 무시)
      if (updatedData?.id) {
        translateStaffInput({
          table: 'factory_contact_requests',
          recordId: updatedData.id,
          delay: 500, // 0.5초 후 실행
        });
      }

      setData(updates);
      setEditMode(false);
      alert(isChineseStaff ? '保存成功' : '저장되었습니다');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddConfirmationRequest = async () => {
    const newRequest = {
      reservation_number: reservationNumber,
      request_type: 'general',
      title_chinese: '',
      title_korean: '',
      description_chinese: '',
      description_korean: '',
      options_chinese: [],
      options_korean: [],
      status: 'pending',
      is_urgent: false,
    };

    try {
      const { data, error } = await supabase
        .from('confirmation_requests')
        .insert(newRequest)
        .select()
        .single();

      if (error) throw error;
      setConfirmations([data, ...confirmations]);
      alert(isChineseStaff ? '确认请求已添加' : '컨펌요청이 추가되었습니다');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || '데이터를 찾을 수 없습니다'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <StaffOrderHeader
        orderData={data}
        serviceType="factory-contact"
        reservationNumber={reservationNumber}
        status={data?.status}
      />

      {/* Main Content with Chat */}
      <Grid container spacing={isMobile ? 0 : 3} sx={{ mt: 2 }}>
        {/* Main Content - Full width on mobile */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Edit buttons */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={2}>
              {!editMode && data.status === 'in_progress' ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  {isChineseStaff ? '编辑' : '편집'}
                </Button>
              ) : editMode ? (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {isChineseStaff ? '保存' : '저장'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditData(data);
                      setEditMode(false);
                    }}
                  >
                    {isChineseStaff ? '取消' : '취소'}
                  </Button>
                </>
              ) : null}
            </Stack>
          </Box>

          {/* Tabs - Dashboard와 동일 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab
                icon={<BusinessIcon sx={{ fontSize: 20 }} />}
                label={isChineseStaff ? '申请信息' : '신청정보'}
                iconPosition="start"
              />
              <Tab
                icon={<FactoryIcon sx={{ fontSize: 20 }} />}
                label={isChineseStaff ? '工厂信息' : '공장정보'}
                iconPosition="start"
              />
              <Tab
                icon={<InventoryIcon sx={{ fontSize: 20 }} />}
                label={isChineseStaff ? '产品信息' : '제품정보'}
                iconPosition="start"
              />
              <Tab
                icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
                label={isChineseStaff ? '确认请求' : '컨펌대기'}
                iconPosition="start"
              />
              <Tab
                icon={<AttachFileIcon sx={{ fontSize: 20 }} />}
                label={isChineseStaff ? '相关资料' : '관련자료'}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Paper elevation={3} sx={{ mb: isMobile ? 8 : 0 }}>
            {/* 신청정보 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {isChineseStaff ? '申请人信息' : '신청자 정보'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isChineseStaff ? '公司名' : '회사명'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {data?.company_name || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isChineseStaff ? '联系人' : '담당자'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {data?.contact_person || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isChineseStaff ? '电话' : '연락처'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {data?.contact_phone || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isChineseStaff ? '邮箱' : '이메일'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {data?.contact_email || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 공장정보 탭 */}
            <TabPanel value={tabValue} index={1}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {isChineseStaff ? '工厂信息' : '공장 정보'}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '工厂名' : '공장명'}
                        value={editMode ? editData.factory_name || '' : data.factory_name || ''}
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, factory_name: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '工厂联系人' : '공장 담당자'}
                        value={
                          editMode
                            ? editData.factory_contact_person || ''
                            : data.factory_contact_person || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, factory_contact_person: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '工厂电话' : '공장 전화'}
                        value={
                          editMode
                            ? editData.factory_contact_phone || ''
                            : data.factory_contact_phone || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, factory_contact_phone: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '工厂地址' : '공장 주소'}
                        value={
                          editMode ? editData.factory_address || '' : data.factory_address || ''
                        }
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, factory_address: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* 제품정보 탭 - Staff 전용 필드 추가 */}
            <TabPanel value={tabValue} index={2}>
              <BlankCard>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {isChineseStaff ? '产品信息' : '제품 정보'}
                    </Typography>
                    {editMode && (
                      <Chip
                        icon={<TranslateIcon />}
                        label={isChineseStaff ? '自动翻译' : '자동번역'}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '产品名(韩文)' : '제품명(한국어)'}
                        value={data.product_name || ''}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '产品名(中文)' : '제품명(중국어)'}
                        value={
                          editMode
                            ? editData.product_name_chinese || ''
                            : data.product_name_chinese || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, product_name_chinese: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        sx={{ '& .MuiInputBase-input': { color: 'primary.main' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={isChineseStaff ? '产品说明(韩文)' : '제품설명(한국어)'}
                        value={data.product_description || ''}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={isChineseStaff ? '产品说明(中文)' : '제품설명(중국어)'}
                        value={
                          editMode
                            ? editData.product_description_chinese || ''
                            : data.product_description_chinese || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, product_description_chinese: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        sx={{ '& .MuiInputBase-input': { color: 'primary.main' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={isChineseStaff ? '特殊要求(韩文)' : '특별요구사항(한국어)'}
                        value={data.special_requirements || ''}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={isChineseStaff ? '特殊要求(中文)' : '특별요구사항(중국어)'}
                        value={
                          editMode
                            ? editData.special_requirements_chinese || ''
                            : data.special_requirements_chinese || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, special_requirements_chinese: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        sx={{ '& .MuiInputBase-input': { color: 'primary.main' } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* 컨펌대기 탭 */}
            <TabPanel value={tabValue} index={3}>
              <BlankCard>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {isChineseStaff ? '确认请求' : '컨펌 요청'}
                    </Typography>
                    {data.status === 'in_progress' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddConfirmationRequest}
                      >
                        {isChineseStaff ? '添加请求' : '요청 추가'}
                      </Button>
                    )}
                  </Box>

                  {confirmations.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                      {isChineseStaff ? '没有确认请求' : '컨펌 요청이 없습니다'}
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {confirmations.map((confirm) => (
                        <Card key={confirm.id} variant="outlined">
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                            >
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {isChineseStaff ? confirm.title_chinese : confirm.title_korean}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {isChineseStaff
                                    ? confirm.description_chinese
                                    : confirm.description_korean}
                                </Typography>
                              </Box>
                              <Chip
                                label={confirm.status}
                                size="small"
                                color={confirm.status === 'responded' ? 'success' : 'default'}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* 관련자료 탭 */}
            <TabPanel value={tabValue} index={4}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {isChineseStaff ? '上传的文件' : '업로드된 파일'}
                  </Typography>
                  {files.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                      {isChineseStaff ? '没有文件' : '파일이 없습니다'}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {files.map((file) => (
                        <Paper key={file.id} sx={{ p: 2 }}>
                          <Typography variant="body2">{file.original_filename}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(file.created_at).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </BlankCard>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Desktop - Chat on right side */}
        {!isMobile && (
          <Grid size={{ md: 4 }}>
            <Box sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden' }}>
              <ChatPanel reservationNumber={reservationNumber} serviceType="factory-contact" />
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
                <Typography variant="h6">{isChineseStaff ? '聊天' : '채팅'}</Typography>
                <IconButton onClick={() => setChatDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Box sx={{ height: 'calc(80vh - 100px)' }}>
                <ChatPanel reservationNumber={reservationNumber} serviceType="factory-contact" />
              </Box>
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
