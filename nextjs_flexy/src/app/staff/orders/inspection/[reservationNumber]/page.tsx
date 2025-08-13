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
  TextField,
  MenuItem,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import BlankCard from '@/app/components/shared/BlankCard';
import {
  Business as BusinessIcon,
  Factory as FactoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
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
  const { user, userProfile } = useUser();
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

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
        const { data, error } = await supabase
          .from('inspection_applications')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('주문을 찾을 수 없습니다');

        setData(data);
        setEditData(data);

        // 파일 조회
        const { data: filesData } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        if (filesData) setFiles(filesData);
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reservationNumber, supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 자동계산 필드
      if (editData.unit_price && editData.inspection_days) {
        editData.total_amount = editData.unit_price * editData.inspection_days;
        editData.vat_amount = editData.total_amount * 0.1;
        editData.final_amount = editData.total_amount + editData.vat_amount;
      }

      const { error } = await supabase
        .from('inspection_applications')
        .update(editData)
        .eq('reservation_number', reservationNumber);

      if (error) throw error;

      setData(editData);
      setEditMode(false);
      alert(isChineseStaff ? '保存成功' : '저장되었습니다');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(data);
    setEditMode(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inspection_applications')
        .update({ status: newStatus })
        .eq('reservation_number', reservationNumber);

      if (error) throw error;

      setData({ ...data, status: newStatus });
      alert(isChineseStaff ? '状态已更新' : '상태가 업데이트되었습니다');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'quoted': return 'info';
      case 'paid': return 'primary';
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      'submitted': { ko: '접수', zh: '已提交' },
      'quoted': { ko: '견적발송', zh: '已报价' },
      'paid': { ko: '결제완료', zh: '已付款' },
      'in_progress': { ko: '진행중', zh: '进行中' },
      'completed': { ko: '완료', zh: '已完成' },
      'cancelled': { ko: '취소', zh: '已取消' },
    };
    return isChineseStaff ? labels[status]?.zh || status : labels[status]?.ko || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || '데이터를 불러올 수 없습니다'}</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => router.push('/staff/orders')}>
          {isChineseStaff ? '返回列表' : '목록으로'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {reservationNumber}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip 
              label={getStatusLabel(data.status)} 
              color={getStatusColor(data.status) as any}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {isChineseStaff ? '质检审核' : '검품감사'}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2}>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              disabled={data.status === 'completed' || data.status === 'cancelled'}
            >
              {isChineseStaff ? '编辑' : '편집'}
            </Button>
          ) : (
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
                onClick={handleCancel}
                disabled={saving}
              >
                {isChineseStaff ? '取消' : '취소'}
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 3 }}>
        <Tab label={isChineseStaff ? '基本信息' : '기본정보'} icon={<BusinessIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '工厂信息' : '공장정보'} icon={<FactoryIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '检验信息' : '검품정보'} icon={<CheckCircleIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '费用信息' : '비용정보'} icon={<AttachMoneyIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '文件' : '파일'} icon={<AttachFileIcon />} iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BlankCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isChineseStaff ? '申请人信息' : '신청자 정보'}
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '公司名' : '회사명'}</TableCell>
                      <TableCell>{data.company_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '联系人' : '담당자'}</TableCell>
                      <TableCell>{data.contact_person}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '电话' : '연락처'}</TableCell>
                      <TableCell>{data.contact_phone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '邮箱' : '이메일'}</TableCell>
                      <TableCell>{data.contact_email}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </BlankCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <BlankCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isChineseStaff ? '产品信息' : '제품정보'}
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '产品名' : '제품명'}</TableCell>
                      <TableCell>{data.product_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '生产数量' : '생산수량'}</TableCell>
                      <TableCell>{data.production_quantity?.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '检验方式' : '검사방법'}</TableCell>
                      <TableCell>{data.inspection_method}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '特殊要求' : '특별요구사항'}</TableCell>
                      <TableCell>{data.special_requirements || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </BlankCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '工厂信息' : '공장정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '工厂名' : '공장명'}</TableCell>
                  <TableCell>{data.factory_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '联系人' : '담당자'}</TableCell>
                  <TableCell>{data.factory_contact_person}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '电话' : '연락처'}</TableCell>
                  <TableCell>{data.factory_contact_phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '地址' : '주소'}</TableCell>
                  <TableCell>{data.factory_address}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '检验日期' : '검사일정'}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          type="date"
                          size="small"
                          value={editData.confirmed_start_date || ''}
                          onChange={(e) => setEditData({...editData, confirmed_start_date: e.target.value})}
                          label={isChineseStaff ? '开始日期' : '시작일'}
                        />
                        <TextField
                          type="date"
                          size="small"
                          value={editData.confirmed_end_date || ''}
                          onChange={(e) => setEditData({...editData, confirmed_end_date: e.target.value})}
                          label={isChineseStaff ? '结束日期' : '종료일'}
                        />
                      </Stack>
                    ) : (
                      `${data.confirmed_start_date || '미정'} ~ ${data.confirmed_end_date || '미정'}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '检验天数' : '검사일수'}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.inspection_days || ''}
                        onChange={(e) => setEditData({...editData, inspection_days: parseInt(e.target.value)})}
                      />
                    ) : (
                      `${data.inspection_days || 0}일`
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </BlankCard>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '检验信息' : '검품정보'} 
              {data.status === 'in_progress' && (
                <Chip 
                  label={isChineseStaff ? '可编辑' : '편집가능'} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '检验报告' : '검품보고서'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        component="label"
                      >
                        {isChineseStaff ? '上传报告' : '보고서 업로드'}
                        <input type="file" hidden />
                      </Button>
                    ) : (
                      data.inspection_report || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '合格状态' : '합격여부'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editData.pass_fail_status || ''}
                          onChange={(e) => setEditData({...editData, pass_fail_status: e.target.value})}
                        >
                          <MenuItem value="pass">{isChineseStaff ? '合格' : '합격'}</MenuItem>
                          <MenuItem value="conditional_pass">{isChineseStaff ? '条件合格' : '조건부합격'}</MenuItem>
                          <MenuItem value="fail">{isChineseStaff ? '不合格' : '불합격'}</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip 
                        label={data.pass_fail_status || '미정'} 
                        color={data.pass_fail_status === 'pass' ? 'success' : 'default'}
                        size="small"
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '检验摘要' : '검품요약'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        value={editData.inspection_summary || ''}
                        onChange={(e) => setEditData({...editData, inspection_summary: e.target.value})}
                      />
                    ) : (
                      data.inspection_summary || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '改善事项' : '개선사항'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        value={editData.improvement_items || ''}
                        onChange={(e) => setEditData({...editData, improvement_items: e.target.value})}
                      />
                    ) : (
                      data.improvement_items || '-'
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </BlankCard>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '费用信息' : '비용정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '单价' : '단가'}</TableCell>
                  <TableCell>
                    {editMode && (data.status === 'submitted' || data.status === 'quoted') ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.unit_price || ''}
                        onChange={(e) => setEditData({...editData, unit_price: parseInt(e.target.value)})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₩</InputAdornment>
                        }}
                      />
                    ) : (
                      `₩${data.unit_price?.toLocaleString() || 0}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '总金额' : '총금액'}</TableCell>
                  <TableCell>₩{data.total_amount?.toLocaleString() || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '增值税' : 'VAT'}</TableCell>
                  <TableCell>₩{data.vat_amount?.toLocaleString() || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '最终金额' : '최종금액'}</TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      ₩{data.final_amount?.toLocaleString() || 0}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </BlankCard>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '上传文件' : '업로드 파일'}
            </Typography>
            {files.length === 0 ? (
              <Alert severity="info">
                {isChineseStaff ? '没有上传的文件' : '업로드된 파일이 없습니다'}
              </Alert>
            ) : (
              <Stack spacing={2}>
                {files.map((file) => (
                  <Paper key={file.id} sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography>{file.original_filename}</Typography>
                      <Button size="small">
                        {isChineseStaff ? '下载' : '다운로드'}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </BlankCard>
      </TabPanel>

      {/* Status Actions */}
      {data.status !== 'completed' && data.status !== 'cancelled' && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {isChineseStaff ? '状态管理' : '상태 관리'}
          </Typography>
          <Stack direction="row" spacing={2}>
            {data.status === 'submitted' && (
              <Button 
                variant="contained" 
                color="info"
                onClick={() => handleStatusChange('quoted')}
              >
                {isChineseStaff ? '发送报价' : '견적 발송'}
              </Button>
            )}
            {data.status === 'quoted' && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleStatusChange('paid')}
              >
                {isChineseStaff ? '确认付款' : '결제 확인'}
              </Button>
            )}
            {data.status === 'paid' && (
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => handleStatusChange('in_progress')}
              >
                {isChineseStaff ? '开始检验' : '검품 시작'}
              </Button>
            )}
            {data.status === 'in_progress' && (
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleStatusChange('completed')}
              >
                {isChineseStaff ? '完成检验' : '검품 완료'}
              </Button>
            )}
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => handleStatusChange('cancelled')}
            >
              {isChineseStaff ? '取消' : '취소'}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}