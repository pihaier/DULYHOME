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
  TextField,
  MenuItem,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import { translateStaffInput } from '@/lib/utils/auto-translate';
import BlankCard from '@/app/components/shared/BlankCard';
import StaffOrderHeader from '@/app/staff/_components/StaffOrderHeader';
import ChatPanel from '@/app/dashboard/orders/_components/ChatPanel';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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

export default function StaffInspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const { userProfile } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [staffData, setStaffData] = useState<any>({});
  const [saving, setSaving] = useState(false);

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
        const supabase = createClient();

        const { data, error } = await supabase
          .from('inspection_applications')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('데이터를 찾을 수 없습니다.');

        setData(data);
        setStaffData({
          inspection_summary: data.inspection_summary || '',
          pass_fail_status: data.pass_fail_status || 'pending',
          improvement_items: data.improvement_items || '',
        });

        // 업로드된 파일들 가져오기
        const { data: filesData } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        setFiles(filesData || []);
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

  const handleSaveStaffData = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: updatedData, error } = await supabase
        .from('inspection_applications')
        .update({
          inspection_summary: staffData.inspection_summary,
          pass_fail_status: staffData.pass_fail_status,
          improvement_items: staffData.improvement_items,
          updated_at: new Date().toISOString(),
        })
        .eq('reservation_number', reservationNumber)
        .select()
        .single();

      if (error) throw error;

      // 백그라운드에서 자동 번역 실행 (실패해도 무시)
      // inspection_summary, pass_fail_status, improvement_items 필드는
      // 중국 직원이 입력하면 한국어로 번역되어야 함 (현재 번역 필드 없음)
      // 향후 번역 필드 추가 시 여기에 translateStaffInput 호출 추가 필요

      setEditMode(false);
      alert(isChineseStaff ? '保存成功' : '저장되었습니다');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
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
        <Button onClick={() => router.push('/staff/inspection')} sx={{ mt: 2 }}>
          {isChineseStaff ? '返回列表' : '목록으로 돌아가기'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <StaffOrderHeader
        orderData={data}
        serviceType="inspection"
        reservationNumber={reservationNumber}
        status={data?.status}
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
                  label={
                    isMobile
                      ? isChineseStaff
                        ? '申请'
                        : '신청'
                      : isChineseStaff
                        ? '申请信息'
                        : '신청정보'
                  }
                  iconPosition="start"
                />
                <Tab
                  icon={<InventoryIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={
                    isMobile
                      ? isChineseStaff
                        ? '检验'
                        : '검품'
                      : isChineseStaff
                        ? '检验信息'
                        : '검품정보'
                  }
                  iconPosition="start"
                />
                <Tab
                  icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={
                    isMobile
                      ? isChineseStaff
                        ? '费用'
                        : '비용'
                      : isChineseStaff
                        ? '费用信息'
                        : '비용정보'
                  }
                  iconPosition="start"
                />
                <Tab
                  icon={<AttachFileIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
                  label={
                    isMobile
                      ? isChineseStaff
                        ? '资料'
                        : '자료'
                      : isChineseStaff
                        ? '相关资料'
                        : '관련자료'
                  }
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
                      {isChineseStaff ? '检验申请信息' : '검품 신청 정보'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {isChineseStaff ? '产品名' : '제품명'}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {isChineseStaff
                                ? data?.product_name_translated || data?.product_name || '-'
                                : data?.product_name || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {isChineseStaff ? '生产数量' : '생산수량'}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {data?.production_quantity?.toLocaleString() || '-'}
                              {isChineseStaff ? '个' : '개'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {isChineseStaff ? '检验方法' : '검품방법'}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={
                                  data?.inspection_method === 'full'
                                    ? isChineseStaff
                                      ? '全数检验'
                                      : '전수검품'
                                    : isChineseStaff
                                      ? '标准检验'
                                      : '표준검품'
                                }
                                color={data?.inspection_method === 'full' ? 'primary' : 'default'}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {isChineseStaff ? '申请日期' : '신청일시'}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {data?.created_at
                                ? new Date(data.created_at).toLocaleDateString(
                                    isChineseStaff ? 'zh-CN' : 'ko-KR'
                                  )
                                : '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* 공장 정보 */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      {isChineseStaff ? '工厂信息' : '공장 정보'}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {isChineseStaff ? '工厂名' : '공장명'}
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_name || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {isChineseStaff ? '联系人' : '담당자'}
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
                              {isChineseStaff ? '电话' : '연락처'}
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_phone || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {isChineseStaff ? '地址' : '주소'}
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {data?.factory_address || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* 특별 요구사항 */}
                    {(data?.special_requirements || data?.special_requirements_translated) && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                          {isChineseStaff ? '特殊要求' : '특별 요구사항'}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.100' }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {isChineseStaff
                              ? data.special_requirements_translated ||
                                data.special_requirements ||
                                '-'
                              : data.special_requirements || '-'}
                          </Typography>
                        </Paper>
                      </>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 검품정보 탭 - Staff 전용 필드 추가 */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {isChineseStaff ? '检验信息' : '검품 일정 정보'}
                      </Typography>
                      {data?.status === 'in_progress' && (
                        <Stack direction="row" spacing={2}>
                          {!editMode ? (
                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={() => setEditMode(true)}
                            >
                              {isChineseStaff ? '编辑' : '편집'}
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveStaffData}
                                disabled={saving}
                              >
                                {isChineseStaff ? '保存' : '저장'}
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                  setEditMode(false);
                                  setStaffData({
                                    inspection_summary: data.inspection_summary || '',
                                    pass_fail_status: data.pass_fail_status || 'pending',
                                    improvement_items: data.improvement_items || '',
                                  });
                                }}
                                disabled={saving}
                              >
                                {isChineseStaff ? '取消' : '취소'}
                              </Button>
                            </>
                          )}
                        </Stack>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {isChineseStaff ? '检验天数' : '검품 기간'}
                          </Typography>
                          <Typography variant="h5" fontWeight="600" color="primary">
                            {data?.inspection_days || '-'}
                            {isChineseStaff ? '天' : '일'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {isChineseStaff ? '确定日期' : '확정 일자'}
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {data?.confirmed_date
                              ? new Date(data.confirmed_date).toLocaleDateString(
                                  isChineseStaff ? 'zh-CN' : 'ko-KR'
                                )
                              : isChineseStaff
                                ? '未定'
                                : '미정'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {isChineseStaff ? '检验状态' : '검품 상태'}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {editMode ? (
                              <TextField
                                select
                                size="small"
                                fullWidth
                                value={staffData.pass_fail_status}
                                onChange={(e) =>
                                  setStaffData({ ...staffData, pass_fail_status: e.target.value })
                                }
                              >
                                <MenuItem value="pending">
                                  {isChineseStaff ? '待定' : '대기중'}
                                </MenuItem>
                                <MenuItem value="pass">{isChineseStaff ? '合格' : '합격'}</MenuItem>
                                <MenuItem value="fail">
                                  {isChineseStaff ? '不合格' : '불합격'}
                                </MenuItem>
                                <MenuItem value="conditional">
                                  {isChineseStaff ? '有条件合格' : '조건부합격'}
                                </MenuItem>
                              </TextField>
                            ) : (
                              <>
                                {staffData.pass_fail_status === 'pass' ? (
                                  <Chip
                                    label={isChineseStaff ? '合格' : '합격'}
                                    color="success"
                                    size="small"
                                  />
                                ) : staffData.pass_fail_status === 'fail' ? (
                                  <Chip
                                    label={isChineseStaff ? '不合格' : '불합격'}
                                    color="error"
                                    size="small"
                                  />
                                ) : staffData.pass_fail_status === 'conditional' ? (
                                  <Chip
                                    label={isChineseStaff ? '有条件合格' : '조건부합격'}
                                    color="warning"
                                    size="small"
                                  />
                                ) : (
                                  <Chip
                                    label={isChineseStaff ? '待定' : '대기중'}
                                    color="default"
                                    size="small"
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Staff 전용 필드 - 중국 직원만 */}
                    {data?.status === 'in_progress' && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                          {isChineseStaff ? '检验详情（员工专用）' : '검품 상세 (직원 전용)'}
                        </Typography>

                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {isChineseStaff ? '检验摘要' : '검품 요약'}
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={staffData.inspection_summary}
                                onChange={(e) =>
                                  setStaffData({ ...staffData, inspection_summary: e.target.value })
                                }
                                placeholder={
                                  isChineseStaff
                                    ? '请输入检验结果摘要...'
                                    : '검품 결과 요약을 입력하세요...'
                                }
                              />
                            ) : (
                              <Paper sx={{ p: 2, bgcolor: 'grey.100' }} elevation={0}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {staffData.inspection_summary ||
                                    (isChineseStaff ? '未输入' : '미입력')}
                                </Typography>
                              </Paper>
                            )}
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {isChineseStaff ? '改善事项' : '개선사항'}
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={staffData.improvement_items}
                                onChange={(e) =>
                                  setStaffData({ ...staffData, improvement_items: e.target.value })
                                }
                                placeholder={
                                  isChineseStaff
                                    ? '请输入需要改善的事项...'
                                    : '개선이 필요한 사항을 입력하세요...'
                                }
                              />
                            ) : (
                              <Paper sx={{ p: 2, bgcolor: 'grey.100' }} elevation={0}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {staffData.improvement_items || (isChineseStaff ? '无' : '없음')}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </BlankCard>
              </Stack>
            </TabPanel>

            {/* 비용정보 탭 - 중국 직원은 결제 상태만 표시 */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3} sx={{ p: 2 }}>
                <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                      {isChineseStaff ? '费用信息' : '비용 정보'}
                    </Typography>
                    {isChineseStaff ? (
                      // 중국 직원은 결제 상태만 표시
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {isChineseStaff ? '支付状态' : '결제 상태'}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={data?.payment_status === 'paid' ? '已支付' : '待支付'}
                            color={data?.payment_status === 'paid' ? 'success' : 'default'}
                            size="medium"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      // 한국 직원은 전체 비용 정보 표시
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
                    )}
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
                      {isChineseStaff
                        ? `上传的文件 (${files.length}个)`
                        : `업로드된 파일 (${files.length}개)`}
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
                                {new Date(file.created_at).toLocaleDateString(
                                  isChineseStaff ? 'zh-CN' : 'ko-KR'
                                )}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {isChineseStaff ? '下载' : '다운로드'}
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    {isChineseStaff ? '没有相关资料' : '관련자료가 없습니다.'}
                  </Typography>
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
                <Typography variant="h6">{isChineseStaff ? '聊天' : '채팅'}</Typography>
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
