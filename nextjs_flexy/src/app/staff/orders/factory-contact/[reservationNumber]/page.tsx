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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Add as AddIcon,
  Send as SendIcon,
  QuestionAnswer as QuestionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
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

export default function StaffFactoryContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userProfile } = useUser();
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [confirmationRequests, setConfirmationRequests] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newConfirmRequest, setNewConfirmRequest] = useState({
    title_chinese: '',
    title_korean: '',
    description_chinese: '',
    description_korean: '',
    options_chinese: [],
    options_korean: [],
    is_urgent: false,
    deadline: '',
  });

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
        // 기본 데이터 조회
        const { data, error } = await supabase
          .from('factory_contact_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('주문을 찾을 수 없습니다');

        setData(data);
        setEditData(data);

        // confirmation_requests 조회
        const { data: confirmData } = await supabase
          .from('confirmation_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .order('created_at', { ascending: false });

        if (confirmData) setConfirmationRequests(confirmData);
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
      const { error } = await supabase
        .from('factory_contact_requests')
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
        .from('factory_contact_requests')
        .update({ status: newStatus })
        .eq('reservation_number', reservationNumber);

      if (error) throw error;

      setData({ ...data, status: newStatus });
      alert(isChineseStaff ? '状态已更新' : '상태가 업데이트되었습니다');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSendConfirmRequest = async () => {
    try {
      // 자동번역 처리 (실제로는 GPT API 호출)
      const translatedRequest = {
        ...newConfirmRequest,
        reservation_number: reservationNumber,
        request_type: 'confirmation',
        status: 'pending',
        created_by: user?.id,
        sender_role: userProfile?.role,
        sender_language: isChineseStaff ? 'zh' : 'ko',
        // 중국 직원이 입력한 경우 한국어로 번역
        title_korean: newConfirmRequest.title_korean || `[번역] ${newConfirmRequest.title_chinese}`,
        description_korean: newConfirmRequest.description_korean || `[번역] ${newConfirmRequest.description_chinese}`,
        options_korean: newConfirmRequest.options_korean.length > 0 ? newConfirmRequest.options_korean : newConfirmRequest.options_chinese.map(opt => `[번역] ${opt}`),
      };

      const { error } = await supabase
        .from('confirmation_requests')
        .insert(translatedRequest);

      if (error) throw error;

      alert(isChineseStaff ? '确认请求已发送' : '컨펌 요청을 발송했습니다');
      setConfirmDialogOpen(false);
      
      // 리스트 새로고침
      const { data: confirmData } = await supabase
        .from('confirmation_requests')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .order('created_at', { ascending: false });

      if (confirmData) setConfirmationRequests(confirmData);
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
              {isChineseStaff ? '工厂联系' : '공장컨택'}
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
        <Tab label={isChineseStaff ? '确认请求' : '컨펌요청'} icon={<QuestionIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '报价管理' : '견적관리'} icon={<AttachMoneyIcon />} iconPosition="start" />
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
                      <TableCell>{isChineseStaff ? '产品说明' : '제품설명'}</TableCell>
                      <TableCell>{data.product_description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{isChineseStaff ? '请求类型' : '요청타입'}</TableCell>
                      <TableCell>
                        {data.request_type?.sample && <Chip label={isChineseStaff ? '样品' : '샘플'} size="small" sx={{ mr: 1 }} />}
                        {data.request_type?.bulk_order && <Chip label={isChineseStaff ? '批量订单' : '대량주문'} size="small" />}
                      </TableCell>
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
                  <TableCell>
                    {editMode ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editData.factory_name || ''}
                        onChange={(e) => setEditData({...editData, factory_name: e.target.value})}
                      />
                    ) : (
                      data.factory_name || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '联系人' : '담당자'}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editData.factory_contact_person || ''}
                        onChange={(e) => setEditData({...editData, factory_contact_person: e.target.value})}
                      />
                    ) : (
                      data.factory_contact_person || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '电话' : '연락처'}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editData.factory_contact_phone || ''}
                        onChange={(e) => setEditData({...editData, factory_contact_phone: e.target.value})}
                      />
                    ) : (
                      data.factory_contact_phone || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '地址' : '주소'}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={editData.factory_address || ''}
                        onChange={(e) => setEditData({...editData, factory_address: e.target.value})}
                      />
                    ) : (
                      data.factory_address || '-'
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {isChineseStaff ? '确认请求' : '컨펌요청'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setConfirmDialogOpen(true)}
                disabled={data.status === 'completed' || data.status === 'cancelled'}
              >
                {isChineseStaff ? '新建请求' : '새 요청'}
              </Button>
            </Box>
            
            {confirmationRequests.length === 0 ? (
              <Alert severity="info">
                {isChineseStaff ? '没有确认请求' : '컨펌 요청이 없습니다'}
              </Alert>
            ) : (
              <List>
                {confirmationRequests.map((request) => (
                  <ListItem key={request.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isChineseStaff ? request.title_chinese : request.title_korean}
                          {request.is_urgent && <Chip label={isChineseStaff ? '紧急' : '긴급'} color="error" size="small" />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="div">
                            {isChineseStaff ? request.description_chinese : request.description_korean}
                          </Typography>
                          {request.options_korean && (
                            <Box sx={{ mt: 1 }}>
                              {(isChineseStaff ? request.options_chinese : request.options_korean)?.map((opt: string, idx: number) => (
                                <Chip key={idx} label={opt} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                              ))}
                            </Box>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        icon={request.status === 'pending' ? <PendingIcon /> : <CheckCircleIcon />}
                        label={request.status === 'pending' 
                          ? (isChineseStaff ? '待回复' : '응답대기') 
                          : (isChineseStaff ? '已回复' : '응답완료')
                        }
                        color={request.status === 'pending' ? 'warning' : 'success'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </BlankCard>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '报价管理' : '견적관리'}
            </Typography>
            <Alert severity="info">
              {isChineseStaff ? '报价功能开发中' : '견적 기능 개발중'}
            </Alert>
          </CardContent>
        </BlankCard>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '上传文件' : '업로드 파일'}
            </Typography>
            {data.files?.length === 0 || !data.files ? (
              <Alert severity="info">
                {isChineseStaff ? '没有上传的文件' : '업로드된 파일이 없습니다'}
              </Alert>
            ) : (
              <Stack spacing={2}>
                {data.files?.map((file: any, index: number) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography>{file.name || file.url}</Typography>
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
                {isChineseStaff ? '开始进行' : '진행 시작'}
              </Button>
            )}
            {data.status === 'in_progress' && (
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleStatusChange('completed')}
              >
                {isChineseStaff ? '完成' : '완료'}
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

      {/* Confirmation Request Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isChineseStaff ? '新建确认请求' : '새 컨펌 요청'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label={isChineseStaff ? '标题（中文）' : '제목 (중국어)'}
              fullWidth
              value={newConfirmRequest.title_chinese}
              onChange={(e) => setNewConfirmRequest({...newConfirmRequest, title_chinese: e.target.value})}
            />
            <TextField
              label={isChineseStaff ? '说明（中文）' : '설명 (중국어)'}
              fullWidth
              multiline
              rows={3}
              value={newConfirmRequest.description_chinese}
              onChange={(e) => setNewConfirmRequest({...newConfirmRequest, description_chinese: e.target.value})}
            />
            <TextField
              label={isChineseStaff ? '选项（逗号分隔）' : '선택지 (쉼표 구분)'}
              fullWidth
              value={newConfirmRequest.options_chinese.join(', ')}
              onChange={(e) => setNewConfirmRequest({
                ...newConfirmRequest, 
                options_chinese: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              helperText={isChineseStaff ? '例如：选项1, 选项2, 选项3' : '예: 옵션1, 옵션2, 옵션3'}
            />
            <FormControl fullWidth>
              <InputLabel>{isChineseStaff ? '紧急程度' : '긴급도'}</InputLabel>
              <Select
                value={newConfirmRequest.is_urgent}
                onChange={(e) => setNewConfirmRequest({...newConfirmRequest, is_urgent: e.target.value as boolean})}
              >
                <MenuItem value={false as any}>{isChineseStaff ? '一般' : '일반'}</MenuItem>
                <MenuItem value={true as any}>{isChineseStaff ? '紧急' : '긴급'}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={isChineseStaff ? '截止日期' : '마감일'}
              type="date"
              fullWidth
              value={newConfirmRequest.deadline}
              onChange={(e) => setNewConfirmRequest({...newConfirmRequest, deadline: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            {isChineseStaff ? '取消' : '취소'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleSendConfirmRequest}
            disabled={!newConfirmRequest.title_chinese || !newConfirmRequest.description_chinese}
          >
            {isChineseStaff ? '发送' : '보내기'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}