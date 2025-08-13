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
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  Calculate as CalculateIcon,
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

export default function StaffMarketResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userProfile } = useUser();
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
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
          .from('market_research_requests')
          .select('*')
          .eq('reservation_number', reservationNumber)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('주문을 찾을 수 없습니다');

        setData(data);
        setEditData(data);
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
      const updated = {...editData};
      
      // CBM 계산
      if (updated.box_quantity && updated.box_length && updated.box_width && updated.box_height) {
        updated.total_cbm = (updated.box_quantity * updated.box_length * updated.box_width * updated.box_height) / 1000000;
      }
      
      // 운송방법 결정
      if (updated.total_cbm) {
        updated.shipping_method = updated.total_cbm >= 15 ? 'FCL' : 'LCL';
        if (updated.shipping_method === 'LCL') {
          updated.lcl_shipping_fee = updated.total_cbm * 90000;
        } else {
          updated.lcl_shipping_fee = 0;
        }
      }

      // 수수료 계산
      if (updated.china_unit_price && updated.quantity && updated.exchange_rate) {
        updated.commission_amount = updated.china_unit_price * updated.quantity * updated.exchange_rate * 0.05;
      }

      // 수입VAT 계산
      if (updated.korea_unit_price && updated.quantity) {
        updated.import_vat = updated.korea_unit_price * updated.quantity * 0.1;
      }

      // 예상총액 계산
      if (updated.korea_unit_price && updated.quantity) {
        updated.expected_total = updated.korea_unit_price * updated.quantity + 
                                 (updated.lcl_shipping_fee || 0) + 
                                 (updated.import_vat || 0);
      }

      const { error } = await supabase
        .from('market_research_requests')
        .update(updated)
        .eq('reservation_number', reservationNumber);

      if (error) throw error;

      setData(updated);
      setEditData(updated);
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
        .from('market_research_requests')
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
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      'submitted': { ko: '접수', zh: '已提交' },
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
              {isChineseStaff ? '市场调查' : '시장조사'}
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
        <Tab label={isChineseStaff ? '产品信息' : '제품정보'} icon={<InventoryIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '价格信息' : '가격정보'} icon={<AttachMoneyIcon />} iconPosition="start" />
        <Tab label={isChineseStaff ? '运输信息' : '운송정보'} icon={<ShippingIcon />} iconPosition="start" />
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
                    <TableRow>
                      <TableCell>{isChineseStaff ? '产品名' : '제품명'}</TableCell>
                      <TableCell>{data.product_name}</TableCell>
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
                  <TableCell width="30%">{isChineseStaff ? '行业' : '산업'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          size="small"
                          value={editData.industry_cn || ''}
                          onChange={(e) => setEditData({...editData, industry_cn: e.target.value})}
                          label={isChineseStaff ? '中文' : '중국어'}
                        />
                        <TextField
                          size="small"
                          value={editData.industry_kr || ''}
                          onChange={(e) => setEditData({...editData, industry_kr: e.target.value})}
                          label={isChineseStaff ? '韩文' : '한국어'}
                        />
                      </Stack>
                    ) : (
                      `${data.industry_cn || '-'} / ${data.industry_kr || '-'}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '公司状态' : '회사상태'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          size="small"
                          value={editData.company_status_cn || ''}
                          onChange={(e) => setEditData({...editData, company_status_cn: e.target.value})}
                          label={isChineseStaff ? '中文' : '중국어'}
                        />
                        <TextField
                          size="small"
                          value={editData.company_status_kr || ''}
                          onChange={(e) => setEditData({...editData, company_status_kr: e.target.value})}
                          label={isChineseStaff ? '韩文' : '한국어'}
                        />
                      </Stack>
                    ) : (
                      `${data.company_status_cn || '-'} / ${data.company_status_kr || '-'}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '经营范围' : '사업범위'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          multiline
                          rows={2}
                          size="small"
                          value={editData.business_scope_cn || ''}
                          onChange={(e) => setEditData({...editData, business_scope_cn: e.target.value})}
                          label={isChineseStaff ? '中文' : '중국어'}
                        />
                        <TextField
                          multiline
                          rows={2}
                          size="small"
                          value={editData.business_scope_kr || ''}
                          onChange={(e) => setEditData({...editData, business_scope_kr: e.target.value})}
                          label={isChineseStaff ? '韩文' : '한국어'}
                        />
                      </Stack>
                    ) : (
                      `${data.business_scope_cn || '-'} / ${data.business_scope_kr || '-'}`
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
              {isChineseStaff ? '产品信息' : '제품정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '产品代码' : '제품코드'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        size="small"
                        value={editData.product_code || ''}
                        onChange={(e) => setEditData({...editData, product_code: e.target.value})}
                      />
                    ) : (
                      data.product_code || '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '箱子数量' : '박스수량'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.box_quantity || ''}
                        onChange={(e) => setEditData({...editData, box_quantity: parseInt(e.target.value)})}
                      />
                    ) : (
                      data.box_quantity || 0
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '箱子尺寸' : '박스치수'} (cm)</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Stack direction="row" spacing={1}>
                        <TextField
                          type="number"
                          size="small"
                          placeholder="长"
                          value={editData.box_length || ''}
                          onChange={(e) => setEditData({...editData, box_length: parseFloat(e.target.value)})}
                        />
                        <TextField
                          type="number"
                          size="small"
                          placeholder="宽"
                          value={editData.box_width || ''}
                          onChange={(e) => setEditData({...editData, box_width: parseFloat(e.target.value)})}
                        />
                        <TextField
                          type="number"
                          size="small"
                          placeholder="高"
                          value={editData.box_height || ''}
                          onChange={(e) => setEditData({...editData, box_height: parseFloat(e.target.value)})}
                        />
                      </Stack>
                    ) : (
                      `${data.box_length || 0} × ${data.box_width || 0} × ${data.box_height || 0}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '总CBM' : '총CBM'}</TableCell>
                  <TableCell>
                    <Typography color="primary" fontWeight="bold">
                      {data.total_cbm?.toFixed(2) || '0.00'} m³
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '样品价格' : '샘플가격'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          type="number"
                          size="small"
                          value={editData.sample_price || ''}
                          onChange={(e) => setEditData({...editData, sample_price: parseFloat(e.target.value)})}
                          label={isChineseStaff ? '价格' : '가격'}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">¥</InputAdornment>
                          }}
                        />
                        <TextField
                          type="number"
                          size="small"
                          value={editData.sample_shipping_fee || ''}
                          onChange={(e) => setEditData({...editData, sample_shipping_fee: parseFloat(e.target.value)})}
                          label={isChineseStaff ? '运费' : '운송비'}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">¥</InputAdornment>
                          }}
                        />
                      </Stack>
                    ) : (
                      `¥${data.sample_price || 0} + 운송비 ¥${data.sample_shipping_fee || 0}`
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
              {isChineseStaff ? '价格信息' : '가격정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '中国单价' : '중국단가'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.china_unit_price || ''}
                        onChange={(e) => setEditData({...editData, china_unit_price: parseFloat(e.target.value)})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">¥</InputAdornment>
                        }}
                      />
                    ) : (
                      `¥${data.china_unit_price || 0}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '汇率' : '환율'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.exchange_rate || ''}
                        onChange={(e) => setEditData({...editData, exchange_rate: parseFloat(e.target.value)})}
                      />
                    ) : (
                      data.exchange_rate || 0
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '韩国单价' : '한국단가'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.korea_unit_price || ''}
                        onChange={(e) => setEditData({...editData, korea_unit_price: parseFloat(e.target.value)})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₩</InputAdornment>
                        }}
                      />
                    ) : (
                      `₩${data.korea_unit_price?.toLocaleString() || 0}`
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '数量' : '수량'}</TableCell>
                  <TableCell>
                    {editMode && data.status === 'in_progress' ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editData.quantity || ''}
                        onChange={(e) => setEditData({...editData, quantity: parseInt(e.target.value)})}
                      />
                    ) : (
                      data.quantity || 0
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '佣金' : '수수료'} (5%)</TableCell>
                  <TableCell>₩{data.commission_amount?.toLocaleString() || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '进口VAT' : '수입VAT'} (10%)</TableCell>
                  <TableCell>₩{data.import_vat?.toLocaleString() || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '预期总额' : '예상총액'}</TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      ₩{data.expected_total?.toLocaleString() || 0}
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
              {isChineseStaff ? '运输信息' : '운송정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '运输方式' : '운송방법'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={data.shipping_method || 'LCL'} 
                      color={data.shipping_method === 'FCL' ? 'primary' : 'default'}
                    />
                    {data.total_cbm >= 15 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (CBM ≥ 15m³)
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
                {data.shipping_method === 'LCL' && (
                  <TableRow>
                    <TableCell>{isChineseStaff ? 'LCL运费' : 'LCL운송비'}</TableCell>
                    <TableCell>₩{data.lcl_shipping_fee?.toLocaleString() || 0}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell>{isChineseStaff ? '特殊要求' : '특별요구사항'}</TableCell>
                  <TableCell>{data.special_requirements || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
                color="secondary"
                onClick={() => handleStatusChange('in_progress')}
              >
                {isChineseStaff ? '开始调查' : '조사 시작'}
              </Button>
            )}
            {data.status === 'in_progress' && (
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleStatusChange('completed')}
              >
                {isChineseStaff ? '完成调查' : '조사 완료'}
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