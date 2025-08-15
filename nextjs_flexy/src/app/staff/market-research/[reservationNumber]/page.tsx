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
  Dialog,
  DialogContent,
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
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
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

// 숫자 포맷 함수 (콤마 추가, 소수점 제거)
const formatNumber = (num: number | string | null | undefined): string => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  // 소수점 제거하고 정수로 변환
  return Math.round(number).toLocaleString('ko-KR');
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
  const [lookingUpHsCode, setLookingUpHsCode] = useState(false);
  const [hsCodeProgress, setHsCodeProgress] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        // 1 CBM 이하는 90,000원 고정
        updated.lcl_shipping_fee = updated.total_cbm <= 1 ? 90000 : updated.total_cbm * 90000;
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

    // 관세사 비용 (고정 3만원)
    updated.customs_broker_fee = 30000;

    // 원산지 증명서 비용은 이미 fetchTariffAndCertification에서 설정됨
    // co_certificate_fee가 없으면 0으로 설정
    if (!updated.co_certificate_fee) {
      updated.co_certificate_fee = 0;
    }

    // 수입VAT (관세 + 관세사 + 원산지증명서 포함하여 계산)
    if (updated.exw_total) {
      const cif_value = updated.exw_total + shipping_fee; // CIF 가격
      const vat_base = cif_value + 
                      (updated.customs_duty || 0) + 
                      updated.customs_broker_fee + 
                      updated.co_certificate_fee; // 부가세 과세표준
      updated.import_vat = vat_base * 0.1;
    }

    // 2차 결제비용 (운송비 + 관세 + 관세사 + C/O + 수입VAT)
    updated.expected_second_payment =
      shipping_fee + 
      (updated.customs_duty || 0) + 
      updated.customs_broker_fee +
      updated.co_certificate_fee +
      (updated.import_vat || 0);

    // 예상 총 합계
    if (updated.first_payment_amount && updated.expected_second_payment) {
      updated.expected_total_supply_price =
        updated.first_payment_amount + updated.expected_second_payment;
    }

    // 예상 단가
    if (updated.expected_total_supply_price && updated.quoted_quantity) {
      updated.expected_unit_price = updated.expected_total_supply_price / updated.quoted_quantity;
    }

    // 샘플 단가 자동 계산 (중국단가 * 환율)
    if (updated.china_unit_price && updated.exchange_rate) {
      updated.sample_unit_price = updated.china_unit_price * updated.exchange_rate;
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

  // HS코드 조회 버튼 핸들러 - hs-code-classifier SSE 스트리밍 처리
  const handleHsCodeLookup = async () => {
    if (!editData.product_name) {
      alert(isChineseStaff ? '请先输入产品名' : '제품명을 먼저 입력해주세요');
      return;
    }

    setLookingUpHsCode(true);
    setHsCodeProgress(isChineseStaff ? '正在查询HS编码...' : 'HS코드 조회 중...');
    
    try {
      // Edge Function URL 직접 호출 (SSE 스트리밍)
      const response = await fetch('https://fzpyfzpmwyvqumvftfbr.supabase.co/functions/v1/hs-code-classifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
        },
        body: JSON.stringify({ 
          productName: editData.product_name,
          stream: true  // SSE 스트리밍 활성화
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalHsCode = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // 진행 상황 업데이트
                switch (data.type) {
                  case 'start':
                    setHsCodeProgress(isChineseStaff ? '分析开始...' : '분석 시작...');
                    break;
                  case 'step':
                    setHsCodeProgress(data.data.description || (isChineseStaff ? '处理中...' : '처리 중...'));
                    break;
                  case 'progress':
                    setHsCodeProgress(data.data.message || (isChineseStaff ? '进行中...' : '진행 중...'));
                    break;
                  case 'complete':
                    // 최종 HS코드 받음
                    if (data.data && data.data.hsCode) {
                      finalHsCode = data.data.hsCode;
                      console.log('최종 HS코드:', finalHsCode);
                      setHsCodeProgress(`${isChineseStaff ? 'HS编码' : 'HS코드'}: ${finalHsCode}`);
                    }
                    break;
                  case 'error':
                    throw new Error(data.data.message || '처리 중 오류');
                }
              } catch (e) {
                console.error('SSE 파싱 오류:', e);
              }
            }
          }
        }
      }

      // HS코드 설정
      if (finalHsCode && /^\d{10}$/.test(finalHsCode)) {
        handleFieldChange('hs_code', finalHsCode);
        
        // 관세율 자동 조회
        await fetchTariffAndCertification(finalHsCode);
        
        // 완료 메시지는 이미 setHsCodeProgress로 표시됨
      } else {
        setHsCodeProgress(isChineseStaff ? '未找到有效的HS编码' : '유효한 HS코드를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('HS code lookup error:', error);
      setHsCodeProgress(
        `${isChineseStaff ? '查询失败' : '조회 실패'}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setLookingUpHsCode(false);
      // 3초 후 진행 메시지 지우기
      setTimeout(() => {
        setHsCodeProgress('');
      }, 3000);
    }
  };

  // 관세율 및 인증 정보 자동 조회 - typeCode A, C, FCN1 파싱
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

      // 관세율 처리 - typeCode A(기본), C(WTO), FCN1(한중FTA) 중 최저값
      if (!tariffResponse.error && tariffResponse.data?.success) {
        const tariffData = tariffResponse.data.tariffRates;
        
        console.log('관세율 조회 결과:', tariffData);

        // A, C, FCN1 값 추출 - 0도 유효한 값이므로 ?? 사용
        const rateA = tariffData.basic?.rate ?? 8;  // typeCode: A
        const rateC = tariffData.wto?.rate ?? rateA;  // typeCode: C
        const rateFCN1 = tariffData.fta_china?.rate ?? rateA;  // typeCode: FCN1

        // 상세 정보 저장 - 3개 값 모두 표시
        setTariffDetails({
          basic_rate: rateA,
          wto_rate: rateC,
          korea_china_fta_rate: rateFCN1,
        });

        // 최저값 찾기
        let lowestRate = rateA;
        let rateType = 'A(기본)';
        let usesFTA = false;

        if (rateC < lowestRate) {
          lowestRate = rateC;
          rateType = 'C(WTO)';
          usesFTA = false;
        }
        if (rateFCN1 < lowestRate) {
          lowestRate = rateFCN1;
          rateType = 'FCN1(한중FTA)';
          usesFTA = true;  // FCN1이 최저값일 때 원산지 증명서 필요
        }
        
        console.log(`관세율 선택: ${rateType} = ${lowestRate}%`);

        // 관세율 설정 및 재계산 (원산지 증명서 비용 포함)
        setEditData((prev) => {
          const updated = { 
            ...prev, 
            customs_rate: lowestRate,
            co_certificate_fee: usesFTA ? 50000 : 0  // FCN1 적용시 5만원
          };
          return calculateValues(updated);
        });
      } else {
        // 오류 시 기본값 설정
        setTariffDetails({
          basic_rate: 8,
          wto_rate: 8,
          korea_china_fta_rate: 8,
        });
        
        setEditData((prev) => {
          const updated = { ...prev, customs_rate: 8 };
          return calculateValues(updated);
        });
      }

      // 인증 필요 여부 처리
      if (!customsResponse.error && customsResponse.data?.success) {
        const hasRequirements = customsResponse.data.totalCount > 0;
        
        setEditData((prev) => ({
          ...prev,
          certification_required: hasRequirements,
          // required_certifications 필드는 테이블에 없으므로 제거
        }));
      }
    } catch (error) {
      console.error('Tariff/Certification lookup error:', error);
      // 에러 시 기본값 설정
      setTariffDetails({
        basic_rate: 8,
        wto_rate: 8,
        korea_china_fta_rate: 8,
      });
    }
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

        // product_actual_photos가 없으면 빈 배열로 초기화
        const dataWithPhotos = {
          ...data,
          product_actual_photos: data.product_actual_photos || []
        };
        setData(dataWithPhotos);
        setEditData(dataWithPhotos);

        // files 상태는 더 이상 필요없음 - 컬럼에서 직접 읽음
        // application_photos, logo_files, box_files 등은 data에 포함되어 있음
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
      // 이미 계산된 editData를 그대로 사용 (화면에서 이미 계산됨)
      const dataToSave = { ...editData };
      
      // 환율 산정 날짜를 저장 시점의 날짜로 기록
      dataToSave.exchange_rate_date = new Date().toISOString().split('T')[0];

      const { data: updatedData, error } = await supabase
        .from('market_research_requests')
        .update(dataToSave)
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

      setData(dataToSave);
      setEditData(dataToSave);
      setEditMode(false);
      alert(isChineseStaff ? '保存成功' : '저장되었습니다');
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(data);
    setEditMode(false);
  };

  // 파일 업로드 함수
  const uploadProductPhotos = async (files: FileList) => {
    const supabase = createClient();
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${reservationNumber}/product-photos/${safeFileName}`;
        
        // Supabase Storage에 업로드 (고객과 동일한 버킷 사용)
        const { data, error } = await supabase.storage
          .from('application-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Upload error:', error);
          alert(isChineseStaff ? `文件上传失败: ${error.message}` : `파일 업로드 실패: ${error.message}`);
          continue;
        }
        
        // 업로드된 파일의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('application-files')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
        
        // uploaded_files 테이블에 기록
        if (userProfile?.user_id) {
          const { error: uploadError } = await supabase.from('uploaded_files').insert({
            reservation_number: reservationNumber,
            uploaded_by: userProfile.user_id,
            original_filename: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: 'product-photo',
            mime_type: file.type,
            upload_purpose: 'product-actual',  // 이제 허용됨
            file_url: publicUrl,
          });
          
          if (uploadError) {
            console.error('uploaded_files insert error:', uploadError);
            // 에러가 발생해도 업로드는 성공했으므로 계속 진행
          }
        }
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Upload failed:', error);
      alert(isChineseStaff ? '文件上传失败' : '파일 업로드 실패');
      return [];
    }
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
                        <TableCell>
                          {isChineseStaff && data.product_name_chinese
                            ? data.product_name_chinese
                            : data.product_name}
                        </TableCell>
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
                        <TableCell>
                          {isChineseStaff && data.requirements_chinese
                            ? data.requirements_chinese
                            : data.requirements || '-'}
                        </TableCell>
                      </TableRow>
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
                          <TableCell>
                            {isChineseStaff && data.logo_details_chinese
                              ? data.logo_details_chinese
                              : data.logo_details}
                          </TableCell>
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
                          <TableCell>
                            {isChineseStaff && data.box_details_chinese
                              ? data.box_details_chinese
                              : data.box_details}
                          </TableCell>
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

              {/* 客户申请照片 - Customer Application Photos */}
              {data?.application_photos && data.application_photos.length > 0 && (
                <BlankCard sx={{ mt: 2, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      {isChineseStaff ? '客户申请照片' : '고객 신청 사진'} (
                      {data.application_photos.length}
                      {isChineseStaff ? '张' : '개'})
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
                      {data.application_photos.map((file: any, index: number) => (
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
                            setSelectedImage(file.url);
                            setModalOpen(true);
                          }}
                        >
                          <Box
                            component="img"
                            src={file.url}
                            alt={`${isChineseStaff ? '申请照片' : '신청 사진'} ${index + 1}`}
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

                    {/* 제품 실사 사진 */}
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip label={isChineseStaff ? '产品实物照片' : '제품 실물 사진'} size="small" />
                      </Divider>
                    </Grid>
                    <Grid size={12}>
                      <Box sx={{ 
                        border: '2px dashed #ccc', 
                        borderRadius: 2, 
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.paper'
                      }}>
                        {editData.product_actual_photos && editData.product_actual_photos.length > 0 ? (
                          <Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
                              {editData.product_actual_photos.map((photo: string, index: number) => (
                                <Box
                                  key={index}
                                  sx={{
                                    position: 'relative',
                                    width: 120,
                                    height: 120,
                                    border: '1px solid #ddd',
                                    borderRadius: 1,
                                    overflow: 'hidden',
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
                                  {editMode && (
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                      }}
                                      onClick={() => {
                                        const newPhotos = [...editData.product_actual_photos];
                                        newPhotos.splice(index, 1);
                                        setEditData({ ...editData, product_actual_photos: newPhotos });
                                      }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                            </Box>
                            {editMode && (
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                              >
                                {isChineseStaff ? '添加更多照片' : '사진 추가'}
                                <input
                                  type="file"
                                  hidden
                                  multiple
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                      const uploadedUrls = await uploadProductPhotos(files);
                                      if (uploadedUrls.length > 0) {
                                        setEditData({
                                          ...editData,
                                          product_actual_photos: [...(editData.product_actual_photos || []), ...uploadedUrls]
                                        });
                                      }
                                    }
                                  }}
                                />
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              {isChineseStaff ? '产品实物照片' : '제품 실물 사진'}
                            </Typography>
                            {editMode ? (
                              <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mt: 2 }}
                              >
                                {isChineseStaff ? '选择照片' : '사진 선택'}
                                <input
                                  type="file"
                                  hidden
                                  multiple
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                      const uploadedUrls = await uploadProductPhotos(files);
                                      if (uploadedUrls.length > 0) {
                                        setEditData({
                                          ...editData,
                                          product_actual_photos: uploadedUrls
                                        });
                                      }
                                    }
                                  }}
                                />
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {isChineseStaff ? '尚未上传照片' : '업로드된 사진이 없습니다'}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>

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
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label={isChineseStaff ? '样品单价(¥)' : '샘플단가(¥)'}
                        value={
                          editMode 
                            ? (editData.sample_china_price || '')
                            : (data.sample_china_price || '')
                        }
                        onChange={(e) => {
                          if (editMode) {
                            const chinaPrice = parseFloat(e.target.value) || 0;
                            // 중국 단가 저장 및 원화 자동 계산
                            setEditData({
                              ...editData,
                              sample_china_price: chinaPrice,
                              sample_unit_price: chinaPrice * (editData.exchange_rate || 203)
                            });
                          }
                        }}
                        disabled={!editMode}
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        label={isChineseStaff ? '样品单价(韩元)' : '샘플단가(원)'}
                        value={
                          editMode 
                            ? (editData.sample_unit_price ? editData.sample_unit_price.toLocaleString() : '')
                            : (data.sample_unit_price ? data.sample_unit_price.toLocaleString() : '')
                        }
                        disabled
                        size="small"
                        helperText="자동계산"
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            color: 'text.primary',
                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                            fontWeight: 500,
                          },
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
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
                      <Paper
                        elevation={3}
                        sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 3, fontWeight: 600, color: 'primary.main', fontSize: '1.3rem' }}
                        >
                          📝 {isChineseStaff ? '手动输入项目' : '수동 입력 항목'}
                        </Typography>
                        <Grid container spacing={3}>
                          {/* 1번째 줄: 기본 가격 정보 */}
                          <Grid size={{ xs: 12, md: 3 }}>
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
                          
                          <Grid size={{ xs: 12, md: 3 }}>
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
                          
                          <Grid size={{ xs: 12, md: 3 }}>
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
                          
                          <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '所需时间' : '소요시간'}
                              value={
                                editMode ? editData.work_duration || '' : data.work_duration || ''
                              }
                              onChange={(e) =>
                                editMode &&
                                setEditData({ ...editData, work_duration: e.target.value })
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

                          {/* FCL 운송비 (FCL인 경우만 별도 줄에 표시) */}
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
                                disabled={!editMode}
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
                          )}

                          {/* 제품 수량 및 박스 정보 구분선 */}
                          <Grid size={12}>
                            <Divider sx={{ my: 2 }}>
                              <Chip label={isChineseStaff ? '📦 产品数量与包装' : '📦 제품 수량 및 포장'} size="small" color="secondary" />
                            </Divider>
                          </Grid>

                          {/* 2번째 줄: 수량 정보 */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '报价数量' : '견적수량'}
                              value={
                                editMode
                                  ? formatNumber(editData.quoted_quantity)
                                  : formatNumber(data.quoted_quantity)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('quoted_quantity', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">개</InputAdornment>,
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
                          
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '每箱数量' : '박스당 수량'}
                              value={
                                editMode
                                  ? formatNumber(editData.units_per_box)
                                  : formatNumber(data.units_per_box)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('units_per_box', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">개/박스</InputAdornment>,
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

                          {/* 3번째 줄: 박스 치수 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '箱长' : '박스 길이'}
                              value={
                                editMode
                                  ? formatNumber(editData.box_length)
                                  : formatNumber(data.box_length)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('box_length', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
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
                          
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '箱宽' : '박스 너비'}
                              value={
                                editMode
                                  ? formatNumber(editData.box_width)
                                  : formatNumber(data.box_width)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('box_width', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
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
                          
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="text"
                              label={isChineseStaff ? '箱高' : '박스 높이'}
                              value={
                                editMode
                                  ? formatNumber(editData.box_height)
                                  : formatNumber(data.box_height)
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseNumberInput(e.target.value);
                                  handleFieldChange('box_height', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
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

                          {/* 가격 섹션 구분선 */}
                          <Grid size={12}>
                            <Divider sx={{ my: 2 }}>
                              <Chip label={isChineseStaff ? '💰 价格信息' : '💰 가격 정보'} size="small" color="primary" />
                            </Divider>
                          </Grid>

                          {/* HS코드 with 조회 버튼 */}
                          <Grid size={{ xs: 12, md: 8 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
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
                              {editMode && (
                                <Button
                                  variant="contained"
                                  onClick={handleHsCodeLookup}
                                  disabled={lookingUpHsCode || !editData.product_name}
                                  startIcon={<SearchIcon />}
                                  sx={{ minWidth: '120px' }}
                                >
                                  {lookingUpHsCode
                                    ? isChineseStaff
                                      ? '查询中...'
                                      : '조회중...'
                                    : isChineseStaff
                                      ? '自动查询'
                                      : '자동조회'}
                                </Button>
                              )}
                            </Box>
                            {/* HS코드 조회 진행 상황 표시 */}
                            {hsCodeProgress && (
                              <Typography 
                                variant="body2" 
                                color="primary" 
                                sx={{ mt: 1, fontWeight: 500 }}
                              >
                                {hsCodeProgress}
                              </Typography>
                            )}
                          </Grid>

                          {/* 관세율 */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label={isChineseStaff ? '关税率' : '관세율'}
                              value={
                                editMode
                                  ? editData.customs_rate || 0
                                  : data.customs_rate || 0
                              }
                              onChange={(e) => {
                                if (editMode) {
                                  const value = parseFloat(e.target.value) || 0;
                                  handleFieldChange('customs_rate', value);
                                }
                              }}
                              disabled={!editMode}
                              size="medium"
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              helperText={
                                tariffDetails
                                  ? `A(기본): ${tariffDetails.basic_rate || 8}%, C(WTO): ${tariffDetails.wto_rate || 8}%, FCN1(한중FTA): ${tariffDetails.korea_china_fta_rate || 8}%`
                                  : editMode 
                                    ? '수동 입력 가능 (HS코드 조회 시 자동입력)'
                                    : 'HS코드 입력 시 자동조회'
                              }
                              sx={{
                                '& .MuiInputLabel-root': {
                                  fontSize: '1.1rem',
                                  color: '#333',
                                  fontWeight: 500,
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  fontSize: '1.2rem',
                                  fontWeight: 600,
                                  color: 'success.main',
                                  WebkitTextFillColor: theme.palette.success.main,
                                },
                                '& .MuiFormHelperText-root': {
                                  fontSize: '0.85rem',
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* ========== 자동 계산 섹션 (하단) ========== */}
                    <Grid size={12}>
                      <Paper
                        elevation={3}
                        sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 3, fontWeight: 600, color: 'secondary.main', fontSize: '1.3rem' }}
                        >
                          💰 {isChineseStaff ? '自动计算结果' : '자동 계산 결과'}
                        </Typography>

                        {/* 계산 결과 테이블 */}
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    fontWeight: 'bold',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    py: 2,
                                  }}
                                >
                                  {isChineseStaff ? '项目' : '항목'}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 'bold',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    py: 2,
                                  }}
                                  align="right"
                                >
                                  {isChineseStaff ? '金额' : '금액'}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 'bold',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    py: 2,
                                  }}
                                >
                                  {isChineseStaff ? '计算公式' : '계산식'}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>

                              {/* 총 박스수 */}
                              <TableRow>
                                <TableCell sx={{ fontSize: '1rem', py: 1.5 }}>{isChineseStaff ? '总箱数' : '총 박스수'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', py: 1.5 }}>
                                  {formatNumber(editData.total_boxes)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.95rem', py: 1.5 }}>
                                  수량 ÷ 박스당개수
                                </TableCell>
                              </TableRow>

                              {/* CBM */}
                              <TableRow>
                                <TableCell sx={{ fontSize: '1rem', py: 1.5 }}>{isChineseStaff ? '总CBM' : '총 CBM'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', py: 1.5, color: 'info.main' }}>
                                  {editData.total_cbm?.toFixed(2) || 0} m³
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.95rem', py: 1.5 }}>
                                  박스수 × (가로×세로×높이)÷1,000,000
                                </TableCell>
                              </TableRow>

                              {/* 운송방법 */}
                              <TableRow>
                                <TableCell sx={{ fontSize: '1rem', py: 1.5 }}>{isChineseStaff ? '运输方式' : '운송방법'}</TableCell>
                                <TableCell align="right" sx={{ 
                                  fontWeight: 700, 
                                  fontSize: '1.2rem', 
                                  py: 1.5,
                                  color: editData.shipping_method === 'FCL' ? 'error.main' : 'success.main'
                                }}>
                                  {editData.shipping_method}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.95rem', py: 1.5 }}>
                                  CBM ≥ 15 ? FCL : LCL
                                </TableCell>
                              </TableRow>

                              {/* LCL 운송비 (LCL인 경우만) */}
                              {editData.shipping_method === 'LCL' && (
                                <TableRow>
                                  <TableCell>{isChineseStaff ? 'LCL运费' : 'LCL 운송비'}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    ₩{formatNumber(editData.lcl_shipping_fee)}
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                    {editData.total_cbm <= 1
                                      ? '1CBM 이하 ₩90,000'
                                      : `${editData.total_cbm}CBM × ₩90,000`}
                                  </TableCell>
                                </TableRow>
                              )}

                              {/* 수수료 */}
                              <TableRow>
                                <TableCell>{isChineseStaff ? '手续费' : '수수료'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ₩{formatNumber(editData.commission_amount)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  중국단가 × 수량 × 환율 × 5%
                                </TableCell>
                              </TableRow>

                              {/* EXW 합계 */}
                              <TableRow>
                                <TableCell>{isChineseStaff ? 'EXW合计' : 'EXW 합계'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ₩{formatNumber(editData.exw_total)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  (중국단가 × 수량 + 중국운송료) × 환율
                                </TableCell>
                              </TableRow>


                              {/* 관세 */}
                              <TableRow>
                                <TableCell>{isChineseStaff ? '关税' : '관세'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ₩{formatNumber(editData.customs_duty)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  (EXW + 운송비) × 관세율
                                </TableCell>
                              </TableRow>

                              {/* 수입 VAT */}
                              <TableRow>
                                <TableCell>{isChineseStaff ? '进口VAT' : '수입 VAT'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ₩{formatNumber(editData.import_vat)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  (EXW + 운송비 + 관세 + 관세사 + C/O) × 10%
                                </TableCell>
                              </TableRow>

                              {/* 관세사 비용 */}
                              <TableRow>
                                <TableCell>{isChineseStaff ? '报关代理费' : '관세사 비용'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ₩{formatNumber(editData.customs_broker_fee)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  ₩30,000 (고정)
                                </TableCell>
                              </TableRow>

                              {/* 원산지 증명서 비용 (FCN1 적용시만) */}
                              {editData.co_certificate_fee > 0 && (
                                <TableRow>
                                  <TableCell>{isChineseStaff ? '原产地证明书费用' : '원산지 증명서 비용'}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    ₩{formatNumber(editData.co_certificate_fee)}
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                    ₩50,000 (FCN1 적용)
                                  </TableCell>
                                </TableRow>
                              )}

                              {/* ===== 합계 섹션 ===== */}
                              <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell colSpan={3} sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                  💰 {isChineseStaff ? '合计' : '합계'}
                                </TableCell>
                              </TableRow>

                              {/* 1차 결제비용 */}
                              <TableRow sx={{ bgcolor: 'warning.light' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {isChineseStaff ? '1次付款' : '1차 결제비용'}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                                >
                                  ₩{formatNumber(editData.first_payment_amount)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  EXW + 수수료 + 수수료VAT
                                </TableCell>
                              </TableRow>

                              {/* 2차 결제비용 */}
                              <TableRow sx={{ bgcolor: 'info.light' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {isChineseStaff ? '预计2次付款' : '예상 2차 결제비용'}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                                >
                                  ₩{formatNumber(editData.expected_second_payment)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  운송비 + 관세 + 관세사 + C/O + 수입VAT
                                </TableCell>
                              </TableRow>

                              {/* 예상 총 합계 */}
                              <TableRow sx={{ bgcolor: 'error.light' }}>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                  {isChineseStaff ? '预计总合计' : '예상 총 합계'}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1.3rem',
                                    color: 'error.dark',
                                  }}
                                >
                                  ₩{formatNumber(editData.expected_total_supply_price)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  1차 + 2차 결제비용
                                </TableCell>
                              </TableRow>

                              {/* 예상 단가 */}
                              <TableRow sx={{ bgcolor: 'success.light' }}>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                  {isChineseStaff ? '预计单价(含VAT)' : '예상 단가(VAT포함)'}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1.3rem',
                                    color: 'success.dark',
                                  }}
                                >
                                  ₩{formatNumber(editData.expected_unit_price)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  총합계 ÷ 수량
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* 인증 정보 */}
                        {editData.certification_required && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {isChineseStaff ? '需要认证' : '인증 필요'}
                            </Typography>
                            <Typography variant="body2">
                              {editData.required_certifications || '인증 정보 확인 중...'}
                            </Typography>
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </BlankCard>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Chat Panel - Desktop only */}
        {!isMobile && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ position: 'sticky', top: 100, height: 'calc(100vh - 200px)' }}>
              <ChatPanel
                reservationNumber={reservationNumber}
                currentUserRole={userProfile?.role || ''}
                serviceType="market-research"
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Mobile Chat FAB and Drawer */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            aria-label="chat"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
            onClick={() => setChatDrawerOpen(true)}
          >
            <ChatIcon />
          </Fab>

          <Drawer
            anchor="right"
            open={chatDrawerOpen}
            onClose={() => setChatDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '100%',
                maxWidth: '400px',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <IconButton onClick={() => setChatDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 2 }}>
                {isChineseStaff ? '聊天' : '채팅'}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
              <ChatPanel
                reservationNumber={reservationNumber}
                currentUserRole={userProfile?.role || ''}
                serviceType="market-research"
              />
            </Box>
          </Drawer>
        </>
      )}

      {/* Image Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedImage(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent
          sx={{
            position: 'relative',
            p: 0,
            bgcolor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <IconButton
            onClick={() => {
              setModalOpen(false);
              setSelectedImage(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="확대 이미지"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}