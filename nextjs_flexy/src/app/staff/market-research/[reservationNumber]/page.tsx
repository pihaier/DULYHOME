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
  InputAdornment,
  Grid,
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
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

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
  const { userProfile } = useUser();
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
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => router.push('/staff/market-research')}>
          {isChineseStaff ? '返回列表' : '목록으로'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/staff/market-research')}
          >
            {isChineseStaff ? '返回列表' : '목록으로'}
          </Button>
          <Chip 
            label={getStatusLabel(data.status)} 
            color={getStatusColor(data.status) as any}
            size="small"
          />
        </Stack>
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

      {/* Tab Content - 기본정보 */}
      <TabPanel value={tabValue} index={0}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '申请人信息' : '신청자 정보'}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="30%">{isChineseStaff ? '公司名' : '회사명'}</TableCell>
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
                <TableRow>
                  <TableCell>{isChineseStaff ? '数量' : '수량'}</TableCell>
                  <TableCell>{data.quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{isChineseStaff ? '目标价格' : '목표가격'}</TableCell>
                  <TableCell>${data.target_price}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </BlankCard>
      </TabPanel>

      {/* Tab Content - 공장정보 */}
      <TabPanel value={tabValue} index={1}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '工厂信息' : '공장정보'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '行业（中文）' : '산업(중국어)'}
                  value={editMode ? editData.industry_cn || '' : data.industry_cn || ''}
                  onChange={(e) => editMode && setEditData({...editData, industry_cn: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '行业（韩文）' : '산업(한국어)'}
                  value={editMode ? editData.industry_kr || '' : data.industry_kr || ''}
                  onChange={(e) => editMode && setEditData({...editData, industry_kr: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '公司状态（中文）' : '회사상태(중국어)'}
                  value={editMode ? editData.company_status_cn || '' : data.company_status_cn || ''}
                  onChange={(e) => editMode && setEditData({...editData, company_status_cn: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '公司状态（韩文）' : '회사상태(한국어)'}
                  value={editMode ? editData.company_status_kr || '' : data.company_status_kr || ''}
                  onChange={(e) => editMode && setEditData({...editData, company_status_kr: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isChineseStaff ? '经营范围（中文）' : '사업범위(중국어)'}
                  value={editMode ? editData.business_scope_cn || '' : data.business_scope_cn || ''}
                  onChange={(e) => editMode && setEditData({...editData, business_scope_cn: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isChineseStaff ? '经营范围（韩文）' : '사업범위(한국어)'}
                  value={editMode ? editData.business_scope_kr || '' : data.business_scope_kr || ''}
                  onChange={(e) => editMode && setEditData({...editData, business_scope_kr: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </BlankCard>
      </TabPanel>

      {/* Tab Content - 제품정보 */}
      <TabPanel value={tabValue} index={2}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '产品信息' : '제품정보'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '产品代码' : '제품코드'}
                  value={editMode ? editData.product_code || '' : data.product_code || ''}
                  onChange={(e) => editMode && setEditData({...editData, product_code: e.target.value})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '箱子数量' : '박스수량'}
                  value={editMode ? editData.box_quantity || '' : data.box_quantity || ''}
                  onChange={(e) => editMode && setEditData({...editData, box_quantity: parseInt(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '长度(cm)' : '길이(cm)'}
                  value={editMode ? editData.box_length || '' : data.box_length || ''}
                  onChange={(e) => editMode && setEditData({...editData, box_length: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '宽度(cm)' : '너비(cm)'}
                  value={editMode ? editData.box_width || '' : data.box_width || ''}
                  onChange={(e) => editMode && setEditData({...editData, box_width: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '高度(cm)' : '높이(cm)'}
                  value={editMode ? editData.box_height || '' : data.box_height || ''}
                  onChange={(e) => editMode && setEditData({...editData, box_height: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '总CBM' : '총CBM'}
                  value={`${data.total_cbm?.toFixed(2) || '0.00'} m³`}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '运输方式' : '운송방식'}
                  value={data.shipping_method || '-'}
                  disabled
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </BlankCard>
      </TabPanel>

      {/* Tab Content - 가격정보 */}
      <TabPanel value={tabValue} index={3}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '价格信息' : '가격정보'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '中国单价' : '중국단가'}
                  value={editMode ? editData.china_unit_price || '' : data.china_unit_price || ''}
                  onChange={(e) => editMode && setEditData({...editData, china_unit_price: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">¥</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '汇率' : '환율'}
                  value={editMode ? editData.exchange_rate || '' : data.exchange_rate || ''}
                  onChange={(e) => editMode && setEditData({...editData, exchange_rate: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '韩国单价' : '한국단가'}
                  value={editMode ? editData.korea_unit_price || '' : data.korea_unit_price || ''}
                  onChange={(e) => editMode && setEditData({...editData, korea_unit_price: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₩</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '佣金' : '수수료'}
                  value={`₩${data.commission_amount?.toFixed(0) || '0'}`}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '进口VAT' : '수입VAT'}
                  value={`₩${data.import_vat?.toFixed(0) || '0'}`}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '预计总额' : '예상총액'}
                  value={`₩${data.expected_total?.toFixed(0) || '0'}`}
                  disabled
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </BlankCard>
      </TabPanel>

      {/* Tab Content - 운송정보 */}
      <TabPanel value={tabValue} index={4}>
        <BlankCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '运输信息' : '운송정보'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? '运输方式' : '운송방식'}
                  value={data.shipping_method || '-'}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isChineseStaff ? 'LCL运费' : 'LCL운송비'}
                  value={`₩${data.lcl_shipping_fee?.toFixed(0) || '0'}`}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '样品价格' : '샘플가격'}
                  value={editMode ? editData.sample_price || '' : data.sample_price || ''}
                  onChange={(e) => editMode && setEditData({...editData, sample_price: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">¥</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={isChineseStaff ? '样品运费' : '샘플운송비'}
                  value={editMode ? editData.sample_shipping_fee || '' : data.sample_shipping_fee || ''}
                  onChange={(e) => editMode && setEditData({...editData, sample_shipping_fee: parseFloat(e.target.value)})}
                  disabled={!editMode}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">¥</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </BlankCard>
      </TabPanel>
    </Box>
  );
}