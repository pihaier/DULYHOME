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
  TableHead,
  TableContainer,
  Chip,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Fab,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Divider,
  MenuItem,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';
import { translateStaffInput } from '@/lib/utils/auto-translate';
import BlankCard from '@/app/components/shared/BlankCard';
import StaffOrderHeader from '@/app/staff/_components/StaffOrderHeader';
import ChatPanel from '@/app/dashboard/orders/_components/ChatPanel';
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
  Chat as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

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

// 숫자 포맷 함수 (콤마 추가)
const formatNumber = (num: number | string | null | undefined): string => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return number.toLocaleString('ko-KR');
};

// 숫자 입력 시 콤마 제거
const parseNumberInput = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

export default function MarketResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const { userProfile } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const reservationNumber = params.reservationNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [tariffDetails, setTariffDetails] = useState<any>(null);

  const supabase = createClient();
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  // 자동 계산 함수
  const calculateValues = (data: any) => {
    const updated = { ...data };

    // 총 박스수 계산
    if (updated.quoted_quantity && updated.units_per_box) {
      updated.total_boxes = Math.ceil(updated.quoted_quantity / updated.units_per_box);
    }

    // CBM 계산
    if (updated.total_boxes && updated.box_length && updated.box_width && updated.box_height) {
      updated.total_cbm =
        (updated.total_boxes * updated.box_length * updated.box_width * updated.box_height) /
        1000000;
    }

    // 운송방법 결정
    if (updated.total_cbm) {
      updated.shipping_method = updated.total_cbm >= 15 ? 'FCL' : 'LCL';
      if (updated.shipping_method === 'LCL') {
        updated.lcl_shipping_fee = updated.total_cbm * 90000;
      }
    }

    // 환율 기본값
    if (!updated.exchange_rate) {
      updated.exchange_rate = 203.0;
    }

    // 수수료 계산
    if (updated.china_unit_price && updated.quoted_quantity && updated.exchange_rate) {
      updated.commission_rate = 5.0;
      updated.commission_amount =
        updated.china_unit_price * updated.quoted_quantity * updated.exchange_rate * 0.05;
    }

    // EXW 합계
    if (updated.china_unit_price && updated.quoted_quantity && updated.exchange_rate) {
      const chinaShippingInKrw = (updated.china_shipping_fee || 0) * updated.exchange_rate;
      updated.exw_total =
        updated.china_unit_price * updated.quoted_quantity * updated.exchange_rate +
        chinaShippingInKrw;
    }

    // 1차 결제비용
    if (updated.exw_total && updated.commission_amount) {
      const commission_vat = updated.commission_amount * 0.1;
      updated.first_payment_amount = updated.exw_total + updated.commission_amount + commission_vat;
    }

    // 운송비 결정
    let shipping_fee = 0;
    if (updated.shipping_method === 'LCL' && updated.lcl_shipping_fee) {
      shipping_fee = updated.lcl_shipping_fee;
    } else if (updated.shipping_method === 'FCL' && updated.fcl_shipping_fee) {
      shipping_fee = updated.fcl_shipping_fee;
    }

    // 관세 계산 (운송비가 0이어도 계산)
    if (updated.customs_rate && updated.exw_total) {
      const dutiable_value = updated.exw_total + shipping_fee; // 과세가격 = EXW + 운송비
      updated.customs_duty = (updated.customs_rate / 100) * dutiable_value;
    }

    // 수입VAT (관세 포함하여 계산)
    if (updated.exw_total) {
      const cif_value = updated.exw_total + shipping_fee; // CIF 가격
      const vat_base = cif_value + (updated.customs_duty || 0); // 부가세 과세표준
      updated.import_vat = vat_base * 0.1;
    }

    // 2차 결제비용 (운송비 + 관세 + 부가세)
    updated.expected_second_payment =
      shipping_fee + (updated.customs_duty || 0) + (updated.import_vat || 0);

    // 예상 총 합계
    if (updated.first_payment_amount && updated.expected_second_payment) {
      updated.expected_total_supply_price =
        updated.first_payment_amount + updated.expected_second_payment;
    }

    // 예상 단가
    if (updated.expected_total_supply_price && updated.quoted_quantity) {
      updated.expected_unit_price = updated.expected_total_supply_price / updated.quoted_quantity;
    }

    return updated;
  };

  // 값 변경 시 자동 계산
  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...editData, [field]: value };
    const calculated = calculateValues(newData);
    setEditData(calculated);

    // HS코드가 변경되면 자동으로 관세율과 인증 정보 조회
    if (field === 'hs_code' && value && value.length === 10) {
      fetchTariffAndCertification(value);
    }
  };

  // 관세율 및 인증 정보 자동 조회
  const fetchTariffAndCertification = async (hsCode: string) => {
    try {
      // 병렬로 관세율과 인증 정보 조회
      const [tariffResponse, customsResponse] = await Promise.all([
        supabase.functions.invoke('tariff-rate', {
          body: { hsCode },
        }),
        supabase.functions.invoke('customs-verification', {
          body: { hsCode },
        }),
      ]);

      // 관세율 처리 - tariff-rate Edge Function의 응답 구조에 맞게 파싱
      if (!tariffResponse.error && tariffResponse.data?.success) {
        const tariffData = tariffResponse.data.tariffRates;

        // 상세 정보 저장
        setTariffDetails({
          basic_rate: tariffData.basic?.rate || 8,
          wto_rate: tariffData.wto?.rate || null,
          fta_rate: tariffData.fta_us?.rate || tariffData.fta_vietnam?.rate || null,
          korea_china_fta_rate: tariffData.fta_china?.rate || null,
        });

        // 가장 낮은 세율 찾기 (한중 FTA > FTA > WTO > 기본)
        let lowestRate = tariffData.basic?.rate || 8;
        let rateType = '기본세율';

        if (tariffData.fta_china?.rate !== undefined && tariffData.fta_china.rate < lowestRate) {
          lowestRate = tariffData.fta_china.rate;
          rateType = '한중FTA';
        } else if (tariffData.fta_us?.rate !== undefined && tariffData.fta_us.rate < lowestRate) {
          lowestRate = tariffData.fta_us.rate;
          rateType = '한미FTA';
        } else if (
          tariffData.fta_vietnam?.rate !== undefined &&
          tariffData.fta_vietnam.rate < lowestRate
        ) {
          lowestRate = tariffData.fta_vietnam.rate;
          rateType = '한베트남FTA';
        } else if (tariffData.wto?.rate !== undefined && tariffData.wto.rate < lowestRate) {
          lowestRate = tariffData.wto.rate;
          rateType = 'WTO협정';
        }

        // 관세율 설정 및 재계산
        setEditData((prev) => {
          const updated = { ...prev, customs_rate: lowestRate };
          return calculateValues(updated);
        });
      }

      // 인증 필요 여부 처리 - customs-verification Edge Function의 응답 구조에 맞게 파싱
      if (!customsResponse.error && customsResponse.data?.success) {
        const hasRequirements = customsResponse.data.totalCount > 0;
        const certifications = customsResponse.data.requirements
          ?.map((req: any) => req.documentName || req.lawName)
          .filter(Boolean)
          .join(', ');

        setEditData((prev) => ({
          ...prev,
          certification_required: hasRequirements,
          required_certifications: certifications || null,
        }));

        if (certifications) {
        }
      }
    } catch (error) {}
  };

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
      // 최종 계산 실행
      const updated = calculateValues(editData);
      updated.exchange_rate_date = new Date().toISOString().split('T')[0];

      const { data: updatedData, error } = await supabase
        .from('market_research_requests')
        .update(updated)
        .eq('reservation_number', reservationNumber)
        .select()
        .single();

      if (error) throw error;

      // 백그라운드에서 자동 번역 실행 (실패해도 무시)
      if (updatedData?.id) {
        translateStaffInput({
          table: 'market_research_requests',
          recordId: updatedData.id,
          delay: 500, // 0.5초 후 실행
        });
      }

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
      case 'submitted':
        return 'warning';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; zh: string }> = {
      submitted: { ko: '접수', zh: '已提交' },
      in_progress: { ko: '진행중', zh: '进行中' },
      completed: { ko: '완료', zh: '已完成' },
      cancelled: { ko: '취소', zh: '已取消' },
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
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => router.push('/staff/market-research')}
        >
          {isChineseStaff ? '返回列表' : '목록으로'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <StaffOrderHeader
        orderData={data}
        serviceType="market-research"
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

          {/* Tabs - 4개 탭으로 간소화 */}
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 3 }}>
            <Tab
              label={isChineseStaff ? '基本信息' : '기본정보'}
              icon={<BusinessIcon />}
              iconPosition="start"
            />
            <Tab
              label={isChineseStaff ? '工厂信息' : '공장정보'}
              icon={<FactoryIcon />}
              iconPosition="start"
            />
            <Tab
              label={isChineseStaff ? '产品信息' : '제품정보'}
              icon={<InventoryIcon />}
              iconPosition="start"
            />
            <Tab
              label={isChineseStaff ? '价格/关税信息' : '가격/관세정보'}
              icon={<AttachMoneyIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab Panels in Paper */}
          <Paper elevation={3} sx={{ mb: isMobile ? 8 : 0 }}>
            {/* Tab Content - 기본정보 (중국직원은 고객정보 미표시) */}
            <TabPanel value={tabValue} index={0}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isChineseStaff ? '基本信息' : '기본정보'}
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {/* 중국 직원에게는 회사/연락처 정보 미표시 */}
                      {!isChineseStaff && (
                        <>
                          <TableRow>
                            <TableCell width="30%">회사명</TableCell>
                            <TableCell>{data.company_name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>담당자</TableCell>
                            <TableCell>{data.contact_person}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>연락처</TableCell>
                            <TableCell>{data.contact_phone}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>이메일</TableCell>
                            <TableCell>{data.contact_email}</TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow>
                        <TableCell width="30%">{isChineseStaff ? '产品名' : '제품명'}</TableCell>
                        <TableCell>{data.product_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? '调查数量' : '조사수량'}</TableCell>
                        <TableCell>{data.research_quantity?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? '目标价格' : '목표가격'}</TableCell>
                        <TableCell>{data.target_price ? `$${data.target_price}` : '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? '要求事项' : '요구사항'}</TableCell>
                        <TableCell>{data.requirements || '-'}</TableCell>
                      </TableRow>
                      {/* 중국 직원에게만 번역된 요구사항 표시 */}
                      {isChineseStaff && data.requirements_translated && (
                        <TableRow>
                          <TableCell>要求事项（中文）</TableCell>
                          <TableCell>{data.requirements_translated}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell>{isChineseStaff ? '详细页面' : '상세페이지 URL'}</TableCell>
                        <TableCell>
                          {data.detail_page ? (
                            <a href={data.detail_page} target="_blank" rel="noopener noreferrer">
                              {data.detail_page}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? 'MOQ确认' : 'MOQ 확인'}</TableCell>
                        <TableCell>
                          <Checkbox checked={data.moq_check || false} disabled />
                          {data.moq_check
                            ? isChineseStaff
                              ? '需要'
                              : '필요'
                            : isChineseStaff
                              ? '不需要'
                              : '불필요'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? '需要Logo' : '로고 필요'}</TableCell>
                        <TableCell>
                          <Checkbox checked={data.logo_required || false} disabled />
                          {data.logo_required
                            ? isChineseStaff
                              ? '需要'
                              : '필요'
                            : isChineseStaff
                              ? '不需要'
                              : '불필요'}
                        </TableCell>
                      </TableRow>
                      {data.logo_details && (
                        <TableRow>
                          <TableCell>{isChineseStaff ? 'Logo详情' : '로고 상세'}</TableCell>
                          <TableCell>{data.logo_details}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell>{isChineseStaff ? '定制包装' : '커스텀박스'}</TableCell>
                        <TableCell>
                          <Checkbox checked={data.custom_box_required || false} disabled />
                          {data.custom_box_required
                            ? isChineseStaff
                              ? '需要'
                              : '필요'
                            : isChineseStaff
                              ? '不需要'
                              : '불필요'}
                        </TableCell>
                      </TableRow>
                      {data.box_details && (
                        <TableRow>
                          <TableCell>{isChineseStaff ? '包装详情' : '박스 상세'}</TableCell>
                          <TableCell>{data.box_details}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell>{isChineseStaff ? '状态' : '상태'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(data.status)}
                            color={getStatusColor(data.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{isChineseStaff ? '申请日期' : '신청일'}</TableCell>
                        <TableCell>
                          {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* Tab Content - 공장정보 (중국직원 입력, 한중 병기) */}
            <TabPanel value={tabValue} index={1}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isChineseStaff ? '工厂信息' : '공장정보'}
                    {editMode && (
                      <Chip
                        label={isChineseStaff ? '中文输入后自动翻译' : '중국어 입력시 자동번역'}
                        size="small"
                        color="info"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Typography>
                  <Grid container spacing={2}>
                    {/* 산업 - 중국직원은 중국어만, 한국직원은 둘 다 */}
                    <Grid size={{ xs: 12, md: isChineseStaff ? 12 : 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '行业' : '산업(중국어)'}
                        value={editMode ? editData.industry_cn || '' : data.industry_cn || ''}
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, industry_cn: e.target.value })
                        }
                        disabled={!editMode || !isChineseStaff}
                        size="small"
                        helperText={isChineseStaff && editMode ? '请输入中文' : ''}
                      />
                    </Grid>
                    {!isChineseStaff && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="산업(한국어)"
                          value={data.industry_kr || ''}
                          disabled
                          size="small"
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              color: 'text.secondary',
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {/* 회사상태 - 중국직원은 중국어만, 한국직원은 둘 다 */}
                    <Grid size={{ xs: 12, md: isChineseStaff ? 12 : 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '公司状态' : '회사상태(중국어)'}
                        value={
                          editMode ? editData.company_status_cn || '' : data.company_status_cn || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, company_status_cn: e.target.value })
                        }
                        disabled={!editMode || !isChineseStaff}
                        size="small"
                        helperText={isChineseStaff && editMode ? '例: 正常营业, 注销' : ''}
                      />
                    </Grid>
                    {!isChineseStaff && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="회사상태(한국어)"
                          value={data.company_status || ''}
                          disabled
                          size="small"
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              color: 'text.secondary',
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {/* 법인형태, 인원규모 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label={isChineseStaff ? '法人类型' : '법인형태'}
                        value={editMode ? editData.legal_type_kr || '' : data.legal_type_kr || ''}
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, legal_type_kr: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      >
                        <MenuItem value="">선택</MenuItem>
                        <MenuItem value="주식회사">주식회사</MenuItem>
                        <MenuItem value="유한회사">유한회사</MenuItem>
                        <MenuItem value="개인사업자">개인사업자</MenuItem>
                        <MenuItem value="기타">기타</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '人员规模' : '인원규모'}
                        value={
                          editMode ? editData.company_size_kr || '' : data.company_size_kr || ''
                        }
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, company_size_kr: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        placeholder="예: 50-100명"
                      />
                    </Grid>

                    {/* 개업시간, 등록자본 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label={isChineseStaff ? '开业时间' : '개업시간'}
                        value={
                          editMode ? editData.established_date || '' : data.established_date || ''
                        }
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, established_date: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '注册资本' : '등록자본'}
                        value={
                          editMode
                            ? editData.registered_capital || ''
                            : data.registered_capital || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, registered_capital: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        placeholder="예: 100만 위안"
                      />
                    </Grid>

                    {/* 실납자본금, 소규모기업 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '实缴资本' : '실납자본금'}
                        value={
                          editMode ? editData.real_paid_capital || '' : data.real_paid_capital || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, real_paid_capital: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                        placeholder="예: 100만 위안"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editData.is_small_business || false}
                            onChange={(e) =>
                              editMode &&
                              setEditData({ ...editData, is_small_business: e.target.checked })
                            }
                            disabled={!editMode}
                          />
                        }
                        label={isChineseStaff ? '小微企业' : '소규모기업'}
                      />
                    </Grid>

                    {/* 사업범위 - 중국직원은 중국어만, 한국직원은 둘 다 */}
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={isChineseStaff ? '经营范围' : '사업범위(중국어)'}
                        value={
                          editMode ? editData.business_scope_cn || '' : data.business_scope_cn || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, business_scope_cn: e.target.value })
                        }
                        disabled={!editMode || !isChineseStaff}
                        size="small"
                        helperText={isChineseStaff && editMode ? '请详细输入经营范围' : ''}
                      />
                    </Grid>
                    {!isChineseStaff && (
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="사업범위(한국어)"
                          value={data.business_scope_kr || ''}
                          disabled
                          size="small"
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              color: 'text.secondary',
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {/* 공장 연락처 - 중국직원 전용, 고객 미표시 */}
                    {(isChineseStaff ||
                      userProfile?.role === 'korean_team' ||
                      userProfile?.role === 'admin') && (
                      <>
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
                        <Grid size={12}>
                          <TextField
                            fullWidth
                            label={isChineseStaff ? '产品网址' : '제품 사이트 URL'}
                            value={
                              editMode
                                ? editData.product_site_url || ''
                                : data.product_site_url || ''
                            }
                            onChange={(e) =>
                              editMode &&
                              setEditData({ ...editData, product_site_url: e.target.value })
                            }
                            disabled={!editMode}
                            size="small"
                            helperText={
                              isChineseStaff ? '1688或淘宝链接' : '1688 또는 타오바오 링크'
                            }
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* Tab Content - 제품정보 (MARKET_RESEARCH_FIELDS_USAGE.md 기준) */}
            <TabPanel value={tabValue} index={2}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isChineseStaff ? '产品信息' : '제품정보'}
                  </Typography>
                  <Grid container spacing={2}>
                    {/* 제품번호 - 자동생성 */}
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '产品编号' : '제품번호'}
                        value={data.product_code || '자동생성 예정'}
                        disabled
                        size="small"
                        helperText="자동 발급"
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            fontWeight: 'bold',
                            color: 'primary.main',
                            WebkitTextFillColor: theme.palette.primary.main,
                          },
                        }}
                      />
                    </Grid>

                    {/* 제품 기본정보 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '报价数量' : '견적수량'}
                        value={
                          editMode ? editData.quoted_quantity || '' : data.quoted_quantity || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          handleFieldChange('quoted_quantity', parseInt(e.target.value) || 0)
                        }
                        disabled={!editMode}
                        size="small"
                        type="number"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '每箱数量' : '박스당 수량'}
                        value={editMode ? editData.units_per_box || '' : data.units_per_box || ''}
                        onChange={(e) =>
                          editMode &&
                          handleFieldChange('units_per_box', parseInt(e.target.value) || 0)
                        }
                        disabled={!editMode}
                        size="small"
                        type="number"
                      />
                    </Grid>

                    {/* 박스 치수 */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '长度(cm)' : '길이(cm)'}
                        value={editMode ? editData.box_length || '' : data.box_length || ''}
                        onChange={(e) =>
                          editMode &&
                          handleFieldChange('box_length', parseFloat(e.target.value) || 0)
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '宽度(cm)' : '너비(cm)'}
                        value={editMode ? editData.box_width || '' : data.box_width || ''}
                        onChange={(e) =>
                          editMode &&
                          handleFieldChange('box_width', parseFloat(e.target.value) || 0)
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '高度(cm)' : '높이(cm)'}
                        value={editMode ? editData.box_height || '' : data.box_height || ''}
                        onChange={(e) =>
                          editMode &&
                          handleFieldChange('box_height', parseFloat(e.target.value) || 0)
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '总箱数' : '총 박스수'}
                        value={editMode ? editData.total_boxes || '-' : data.total_boxes || '-'}
                        disabled
                        size="small"
                        helperText="자동계산"
                      />
                    </Grid>

                    {/* CBM 및 운송 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '总CBM' : '총CBM'}
                        value={
                          editMode
                            ? `${editData.total_cbm?.toFixed(2) || '0.00'} m³`
                            : `${data.total_cbm?.toFixed(2) || '0.00'} m³`
                        }
                        disabled
                        size="small"
                        helperText="자동계산"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '运输方式' : '운송방식'}
                        value={
                          editMode ? editData.shipping_method || '-' : data.shipping_method || '-'
                        }
                        disabled
                        size="small"
                        helperText="15CBM 기준 자동결정"
                      />
                    </Grid>

                    {/* 기타사항 - 중국직원은 중국어만, 한국직원은 둘 다 */}
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={isChineseStaff ? '其他事项' : '기타사항(중국어)'}
                        value={
                          editMode ? editData.other_matters_cn || '' : data.other_matters_cn || ''
                        }
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, other_matters_cn: e.target.value })
                        }
                        disabled={!editMode || !isChineseStaff}
                        size="small"
                      />
                    </Grid>
                    {!isChineseStaff && (
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="기타사항(한국어)"
                          value={data.other_matters_kr || ''}
                          disabled
                          size="small"
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              color: 'text.secondary',
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {/* 샘플 정보 */}
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip label={isChineseStaff ? '样品信息' : '샘플 정보'} size="small" />
                      </Divider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editData.sample_available || false}
                            onChange={(e) =>
                              editMode &&
                              setEditData({ ...editData, sample_available: e.target.checked })
                            }
                            disabled={!editMode}
                          />
                        }
                        label={isChineseStaff ? '样品库存' : '샘플재고 유무'}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '样品单价' : '샘플단가'}
                        value={
                          editMode ? editData.sample_unit_price || '' : data.sample_unit_price || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({
                            ...editData,
                            sample_unit_price: parseFloat(e.target.value) || null,
                          })
                        }
                        disabled={!editMode}
                        size="small"
                        helperText={
                          editMode && editData.china_unit_price && editData.exchange_rate
                            ? `${isChineseStaff ? '参考' : '참고'}: ₩${(editData.china_unit_price * editData.exchange_rate).toFixed(0)}`
                            : ''
                        }
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '样品订购量' : '샘플 주문 가능 수량'}
                        value={
                          editMode ? editData.sample_order_qty || '' : data.sample_order_qty || ''
                        }
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, sample_order_qty: parseInt(e.target.value) })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '样品制作时间' : '샘플 제작기간'}
                        value={
                          editMode ? editData.sample_make_time || '' : data.sample_make_time || ''
                        }
                        onChange={(e) =>
                          editMode && setEditData({ ...editData, sample_make_time: e.target.value })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '样品重量(kg)' : '샘플 무게(kg)'}
                        value={editMode ? editData.sample_weight || '' : data.sample_weight || ''}
                        onChange={(e) =>
                          editMode &&
                          setEditData({ ...editData, sample_weight: parseFloat(e.target.value) })
                        }
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>

            {/* Tab Content - 가격/관세정보 (통합) */}
            <TabPanel value={tabValue} index={3}>
              <BlankCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isChineseStaff ? '价格/关税信息' : '가격/관세정보'}
                  </Typography>
                    
                  <Grid container spacing={3}>
                    {/* ========== 입력 필드 섹션 (상단) ========== */}
                    <Grid size={12}>
                      <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', fontSize: '1.3rem' }}>
                          📝 {isChineseStaff ? '输入项目' : '입력 항목'}
                        </Typography>
                        <Grid container spacing={3}>
                          {/* 소요시간 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '所需时间' : '소요시간'}
                              value={editMode ? editData.work_duration || '' : data.work_duration || ''}
                              onChange={(e) =>
                                editMode && setEditData({ ...editData, work_duration: e.target.value })
                              }
                              disabled={!editMode}
                              size="medium"
                              placeholder="예: 30일"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 중국단가 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '中国单价' : '중국단가'}
                              value={
                                editMode 
                                  ? formatNumber(editData.china_unit_price) 
                                  : formatNumber(data.china_unit_price)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('china_unit_price', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">¥</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 600,
                                  color: '#d32f2f',
                                },
                              }}
                            />
                          </Grid>

                          {/* 환율 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '汇率' : '환율'}
                              value={
                                editMode 
                                  ? formatNumber(editData.exchange_rate || 203.0) 
                                  : formatNumber(data.exchange_rate || 203.0)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('exchange_rate', value || 203.0);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              helperText="두리무역 적용환율 (203.00)"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 중국 운송료 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '中国运费' : '중국 운송료'}
                              value={
                                editMode 
                                  ? formatNumber(editData.china_shipping_fee) 
                                  : formatNumber(data.china_shipping_fee)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('china_shipping_fee', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">¥</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* FCL 운송비 (FCL인 경우만) */}
                          {editData.shipping_method === 'FCL' && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? 'FCL运费' : 'FCL 운송비'}
                              value={
                                editMode 
                                  ? formatNumber(editData.fcl_shipping_fee) 
                                  : formatNumber(data.fcl_shipping_fee)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('fcl_shipping_fee', value);
                                }
                              }}
                              disabled={!editMode || (editMode && editData.shipping_method !== 'FCL')}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">₩</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* HS코드 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? 'HS编码' : 'HS코드'}
                              value={editMode ? editData.hs_code || '' : data.hs_code || ''}
                              onChange={(e) => {
                                if (editMode) {
                                  const value = e.target.value;
                                  setEditData({ ...editData, hs_code: value });
                                  if (value.length === 10) {
                                    fetchTariffAndCertification(value);
                                  }
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              placeholder="10자리 숫자"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 관세율 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '关税率' : '관세율'}
                              type="number"
                              value={editMode ? editData.customs_rate || '' : data.customs_rate || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('customs_rate', parseFloat(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 수출항 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '出口港' : '수출항'}
                              value={editMode ? editData.export_port_cn || '' : data.export_port_cn || ''}
                              onChange={(e) =>
                                editMode && setEditData({ ...editData, export_port_cn: e.target.value })
                              }
                              disabled={!editMode || !isChineseStaff}
                              size="medium"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* ========== 제품 수량 및 박스 정보 ========== */}
                          <Grid size={12}>
                            <Divider sx={{ my: 2 }}>
                              <Chip label={isChineseStaff ? '产品/包装信息' : '제품/포장 정보'} size="small" color="info" />
                            </Divider>
                          </Grid>

                          {/* 견적수량 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '报价数量' : '견적수량'}
                              value={editMode ? editData.quoted_quantity || '' : data.quoted_quantity || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('quoted_quantity', parseInt(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              type="number"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 박스당 수량 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '每箱数量' : '박스당 수량'}
                              value={editMode ? editData.units_per_box || '' : data.units_per_box || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('units_per_box', parseInt(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              type="number"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>

                          {/* 박스 치수 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={isChineseStaff ? '长度(cm)' : '길이(cm)'}
                              value={editMode ? editData.box_length || '' : data.box_length || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('box_length', parseFloat(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={isChineseStaff ? '宽度(cm)' : '너비(cm)'}
                              value={editMode ? editData.box_width || '' : data.box_width || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('box_width', parseFloat(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={isChineseStaff ? '高度(cm)' : '높이(cm)'}
                              value={editMode ? editData.box_height || '' : data.box_height || ''}
                              onChange={(e) =>
                                editMode &&
                                handleFieldChange('box_height', parseFloat(e.target.value) || 0)
                              }
                              disabled={!editMode}
                              size="medium"
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 500,
                                  color: '#000',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* ========== 자동계산 필드 섹션 (하단) ========== */}
                    <Grid size={12}>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '2px dashed #e0e0e0', mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'secondary.main', fontSize: '1.3rem' }}>
                          🔢 {isChineseStaff ? '自动计算项目' : '자동계산 항목'}
                        </Typography>
                        
                        {/* 가격 정보 */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#555', mb: 2, fontSize: '1.1rem' }}>
                          💰 {isChineseStaff ? '价格信息' : '가격 정보'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {/* 수수료 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '佣金率' : '수수료율'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              5%
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '佣金金额' : '수수료 금액'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              ₩ {formatNumber(editMode ? editData.commission_amount : data.commission_amount || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? 'EXW合计' : 'EXW 합계 (원화)'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              ₩ {formatNumber(editMode ? editData.exw_total : data.exw_total || 0)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 제품/포장 계산 정보 */}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#555', mb: 2, fontSize: '1.1rem' }}>
                          📦 {isChineseStaff ? '包装计算' : '포장 계산'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {/* 총 박스수 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '总箱数' : '총 박스수'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              {formatNumber(editMode ? editData.total_boxes : data.total_boxes || 0)} {isChineseStaff ? '箱' : '박스'}
                            </Typography>
                          </Grid>
                          {/* 박스당 CBM */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '每箱CBM' : '박스당 CBM'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              {((editMode ? editData.box_length : data.box_length || 0) * 
                                (editMode ? editData.box_width : data.box_width || 0) * 
                                (editMode ? editData.box_height : data.box_height || 0) / 1000000).toFixed(4)} m³
                            </Typography>
                          </Grid>
                          {/* 총CBM */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '总CBM' : '총CBM'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#2196f3' }}>
                              {(editMode ? editData.total_cbm?.toFixed(2) : data.total_cbm?.toFixed(2)) || '0.00'} m³
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 운송 정보 */}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#555', mb: 2, fontSize: '1.1rem' }}>
                          🚢 {isChineseStaff ? '物流信息' : '물류 정보'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {/* 운송방식 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '运输方式' : '운송방식'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              {editMode ? editData.shipping_method || '-' : data.shipping_method || '-'}
                            </Typography>
                          </Grid>
                          {/* LCL 운비 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? 'LCL运费' : 'LCL 운비'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#000' }}>
                              ₩ {formatNumber(editMode ? editData.lcl_shipping_fee : data.lcl_shipping_fee || 0)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 관부가세 정보 */}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#555', mb: 2, fontSize: '1.1rem' }}>
                          📋 {isChineseStaff ? '关税/认证' : '관부가세'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {/* 관세 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '关税' : '관세'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#d32f2f' }}>
                              ₩ {formatNumber(editMode ? editData.customs_duty : data.customs_duty || 0)}
                            </Typography>
                          </Grid>
                          {/* 수입 VAT */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '进口VAT' : '수입 VAT'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#d32f2f' }}>
                              ₩ {formatNumber(editMode ? editData.import_vat : data.import_vat || 0)}
                            </Typography>
                          </Grid>
                          {/* 통관 수수료 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '通关手续费' : '통관 수수료'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#d32f2f' }}>
                              ₩ {formatNumber(editMode ? editData.customs_clearance_fee : data.customs_clearance_fee || 0)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 최종 가격 정보 */}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#555', mb: 2, fontSize: '1.1rem' }}>
                          💵 {isChineseStaff ? '最终价格' : '최종 가격'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '1次结算费用' : '1차 결제비용'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#1976d2' }}>
                              ₩ {formatNumber(editMode ? editData.first_payment_amount : data.first_payment_amount || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '预计2次结算费用' : '예상 2차결제비용'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#1976d2' }}>
                              ₩ {formatNumber(editMode ? editData.expected_second_payment : data.expected_second_payment || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '预计总合计' : '예상 총 합계'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#388e3c' }}>
                              ₩ {formatNumber(editMode ? editData.expected_total_supply_price : data.expected_total_supply_price || 0)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ color: '#666', fontSize: '1rem', mb: 1 }}>
                              {isChineseStaff ? '预计单价(VAT含)' : '예상 단가(VAT포함)'}
                            </Typography>
                            <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#388e3c' }}>
                              ₩ {formatNumber(editMode ? editData.expected_unit_price : data.expected_unit_price || 0)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 총 합계 */}
                        <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 1 }}>
                          <Typography sx={{ color: '#fff', fontSize: '1.1rem', mb: 1 }}>
                            {isChineseStaff ? '总预计费用 (产品 + 运输 + 关税)' : '총 예상 비용 (제품 + 운송 + 관부가세)'}
                          </Typography>
                          <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
                            ₩ {formatNumber(
                              (editMode ? editData.exw_total : data.exw_total || 0) + 
                              (editMode ? editData.lcl_shipping_fee || editData.fcl_shipping_fee : data.lcl_shipping_fee || data.fcl_shipping_fee || 0) + 
                              (editMode ? editData.customs_duty : data.customs_duty || 0) + 
                              (editMode ? editData.import_vat : data.import_vat || 0) + 
                              (editMode ? editData.customs_clearance_fee : data.customs_clearance_fee || 0)
                            )}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>








          </Paper>
        </Grid>

        {/* Desktop - Chat on right side */}
        {!isMobile && (
          <Grid size={{ md: 4 }}>
            <Box sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden' }}>
              <ChatPanel reservationNumber={reservationNumber} serviceType="market-research" />
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
                <ChatPanel reservationNumber={reservationNumber} serviceType="market-research" />
              </Box>
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
