'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  Alert,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import FileUpload from '@/app/components/forms/form-elements/FileUpload';
import CompanyInfoForm from '@/app/components/forms/form-elements/CompanyInfoForm';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';

// service-fields-workflow.md 기준 대량주문 인터페이스 정의
interface MarketResearchData {
  id: string;
  product_name: string;
  research_quantity: number;
  moq_quantity: number;
  estimated_unit_price: number;
  product_specifications: string;
}

interface OrderItem {
  productName: string;
  originalQuantity: number; // 시장조사 시 수량 (읽기 전용)
  orderQuantity: number | ''; // 실제 주문 수량 (입력)
  specifications: string; // 규격 (수정 가능)
  customization: string; // 커스터마이징 요청
}

interface FormData {
  // 기본 정보 (CompanyInfoForm 재사용)
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;

  // 시장조사 연계 (필수)
  marketResearchId: string;

  // 주문 정보 (시장조사 데이터 참조하여 표시, 수정 가능)
  orderItems: OrderItem[];

  // 납품 정보
  deliveryDate: Dayjs | null; // 희망 납기일
  deliveryAddress: string; // 납품 주소
  deliveryMethod: string; // 납품 방법 (DDP/FOB/EXW)

  // 통관 정보
  customsClearanceType: string; // 통관 방식 (사업자통관/개인통관)
  customsClearanceNumber: string; // 통관번호

  // 추가 요청사항
  packingRequirements: string; // 포장 요구사항 (선택)
  qualityStandards: string; // 품질 기준 (선택)
  additionalRequests: string; // 기타 요청사항 (선택)
  referenceFiles: File[]; // 참고 파일

  // 저장 옵션
  saveToProfile: boolean;
  saveDeliveryAddress: boolean;
}

// 예약번호 생성 함수
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `BO-${year}${month}${day}-${random}`;
}

export default function BulkOrderApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationNumber, setReservationNumber] = useState('');
  const [marketResearchData, setMarketResearchData] = useState<MarketResearchData | null>(null);

  // 시장조사 연계 확인 (필수)
  const marketResearchId = searchParams.get('marketResearchId') || '';

  // 로그인 체크 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  React.useEffect(() => {
    if (!authLoading && !user) {
      // 현재 페이지를 returnUrl로 저장하여 로그인 후 돌아올 수 있도록 함
      const currentPath = '/application/bulk-order';
      router.push(`/auth/customer/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, router]);

  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    marketResearchId: marketResearchId,
    orderItems: [],
    deliveryDate: null,
    deliveryAddress: '',
    deliveryMethod: 'FOB',
    customsClearanceType: 'business',
    customsClearanceNumber: '',
    packingRequirements: '',
    qualityStandards: '',
    additionalRequests: '',
    referenceFiles: [],
    saveToProfile: false,
    saveDeliveryAddress: false,
  });

  // 시장조사 데이터 로드 (선택사항)
  useEffect(() => {
    if (marketResearchId) {
      loadMarketResearchData();
    }
    // 시장조사 연계 없이도 진행 가능하도록 변경
  }, [marketResearchId]);

  const loadMarketResearchData = async () => {
    try {
      // Supabase에서 시장조사 데이터 가져오기
      const { data: researchData, error } = await supabase
        .from('market_research_requests')
        .select('*')
        .eq('id', marketResearchId)
        .single();

      if (error) {
        throw error;
      }

      setMarketResearchData(researchData);

      // 주문 항목 초기화 (시장조사 데이터 기반)
      const orderItems: OrderItem[] = [
        {
          productName: researchData.product_name || '시장조사 제품',
          originalQuantity: researchData.research_quantity || researchData.moq_quantity || 1000,
          orderQuantity: researchData.research_quantity || researchData.moq_quantity || 1000,
          specifications: researchData.product_specifications || '시장조사 데이터 참조',
          customization: '',
        },
      ];

      setFormData((prev) => ({ ...prev, orderItems }));
    } catch (error) {

      // 실패 시 임시 데이터 사용 (시장조사 없이 진행)
      const fallbackOrderItems: OrderItem[] = [
        {
          productName: '대량주문용 제품',
          originalQuantity: 1000,
          orderQuantity: 1000,
          specifications: '확인 중',
          customization: '',
        },
      ];

      setFormData((prev) => ({ ...prev, orderItems: fallbackOrderItems }));
    }
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, orderItems: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/customer/login');
      return;
    }

    if (!marketResearchId) {
      alert('시장조사 연계 정보가 없습니다.');
      return;
    }

    // 필수 필드 검증 (service-fields-workflow.md 기준)
    if (!formData.company_name || !formData.contact_person || !formData.contact_phone) {
      alert('회사명, 담당자명, 연락처는 필수 입력 항목입니다.');
      return;
    }

    const hasEmptyQuantity = formData.orderItems.some((item) => !item.orderQuantity);
    if (hasEmptyQuantity) {
      alert('주문 수량을 모두 입력해주세요.');
      return;
    }

    if (!formData.deliveryDate || !formData.deliveryAddress) {
      alert('희망 납기일과 납품 주소는 필수 입력 항목입니다.');
      return;
    }

    if (!formData.customsClearanceNumber) {
      alert('통관번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 예약번호 생성
      const newReservationNumber = generateReservationNumber();

      // 대량주문 데이터 준비
      const applicationData = {
        reservation_number: newReservationNumber,
        user_id: user.id,
        service_type: 'bulk_order',
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || user.email,

        // 시장조사 연계 (필수)
        market_research_id: formData.marketResearchId,

        // 주문 정보 (JSON으로 저장)
        order_items: formData.orderItems.map((item) => ({
          productName: item.productName,
          originalQuantity: item.originalQuantity,
          orderQuantity:
            typeof item.orderQuantity === 'number' ? item.orderQuantity : item.originalQuantity,
          specifications: item.specifications || '',
          customization: item.customization || '',
          unitPrice: marketResearchData?.estimated_unit_price || 0,
        })),

        // 납품 정보
        delivery_date: formData.deliveryDate?.format('YYYY-MM-DD'),
        delivery_address: formData.deliveryAddress,
        delivery_method: formData.deliveryMethod,

        // 통관 정보
        customs_clearance_type: formData.customsClearanceType,
        customs_clearance_number: formData.customsClearanceNumber,

        // 추가 요청사항
        packing_requirements: formData.packingRequirements || null,
        quality_standards: formData.qualityStandards || null,
        additional_requests: formData.additionalRequests || null,

        status: 'submitted',
        payment_status: 'pending',
      };

      // Supabase에 직접 저장
      const { data: application, error: insertError } = await supabase
        .from('bulk_orders')
        .insert(applicationData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`신청 저장 실패: ${insertError.message}`);
      }

      setReservationNumber(newReservationNumber);

      // 중국직원 자동 배정
      const { data: chineseStaff } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'chinese_staff')
        .eq('approval_status', 'approved')
        .limit(1);

      if (chineseStaff && chineseStaff.length > 0) {
        await supabase
          .from('bulk_orders')
          .update({ assigned_chinese_staff: chineseStaff[0].user_id })
          .eq('id', application.id);
      }

      // 활동 로그 기록
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'create_bulk_order_application',
        entity_type: 'bulk_order_application',
        entity_id: application.id,
        metadata: {
          reservation_number: newReservationNumber,
          market_research_id: formData.marketResearchId,
        },
      });

      // 파일 업로드 처리 (Storage SDK 사용)
      if (formData.referenceFiles.length > 0) {
        for (const file of formData.referenceFiles) {
          try {
            // 파일명 안전하게 처리 (한글, 공백 제거)
            const fileExt = file.name.split('.').pop() || '';
            const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${newReservationNumber}/bulk_order_reference/${safeFileName}`;

            // Storage SDK로 업로드
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('application-files')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              throw uploadError;
            }

            // 파일 URL 생성
            const {
              data: { publicUrl },
            } = supabase.storage.from('application-files').getPublicUrl(uploadData.path);

            // uploaded_files 테이블에 기록
            const { error: dbError } = await supabase.from('uploaded_files').insert({
              reservation_number: newReservationNumber,
              uploaded_by: user.id,
              original_filename: file.name,
              file_path: uploadData.path,
              file_size: file.size,
              file_type: 'bulk_order_reference',
              mime_type: file.type,
              upload_purpose: 'application',
              upload_category: 'bulk_order_reference',
              upload_status: 'completed',
              file_url: publicUrl,
            });

            if (dbError) {
            }
          } catch (error) {
          }
        }
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중일 때만 로딩 스피너 표시
  if (authLoading) {
    return (
      <PageContainer
        title="대량주문 신청 - 두리무역"
        description="시장조사 결과를 바탕으로 대량주문을 신청하세요"
      >
        <HpHeader />
        <Container maxWidth="md" sx={{ py: 5 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="대량주문 신청 - 두리무역"
      description="시장조사 결과를 바탕으로 대량주문을 신청하세요"
    >
      <HpHeader />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              대량주문 신청
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              시장조사 결과를 바탕으로 원하시는 수량만큼 주문하실 수 있습니다.
            </Typography>

            {marketResearchId && (
              <Alert severity="success" sx={{ mb: 3 }}>
                시장조사 결과를 바탕으로 대량주문을 진행합니다.
                <br />
                <Typography variant="caption">연계된 시장조사 번호: {marketResearchId}</Typography>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} mt={4}>
              <Stack spacing={3}>
                {/* 기본 정보 입력 (CompanyInfoForm 재사용) */}
                <CompanyInfoForm
                  value={{
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    contact_phone: formData.contact_phone,
                    contact_email: formData.contact_email,
                  }}
                  onChange={(info) => setFormData({ ...formData, ...info })}
                  showSaveOption={true}
                  saveToProfile={formData.saveToProfile}
                  onSaveOptionChange={(save) => setFormData({ ...formData, saveToProfile: save })}
                />

                <Divider />

                {/* 주문 정보 (시장조사 데이터 참조) */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    주문 정보
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    시장조사 결과를 참조하여 실제 주문 수량과 요청사항을 입력하세요.
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>제품명</TableCell>
                          <TableCell align="center">조사 시 수량</TableCell>
                          <TableCell align="center">주문 수량</TableCell>
                          <TableCell>제품 규격</TableCell>
                          <TableCell>커스터마이징</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.productName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="text.secondary">
                                {item.originalQuantity.toLocaleString()}개
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                value={item.orderQuantity}
                                onChange={(e) =>
                                  updateOrderItem(
                                    index,
                                    'orderQuantity',
                                    e.target.value ? parseInt(e.target.value) : ''
                                  )
                                }
                                required
                                size="small"
                                sx={{ width: 120 }}
                                InputProps={{
                                  inputProps: { min: 1 },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.specifications}
                                onChange={(e) =>
                                  updateOrderItem(index, 'specifications', e.target.value)
                                }
                                placeholder="제품 규격 (수정 가능)"
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.customization}
                                onChange={(e) =>
                                  updateOrderItem(index, 'customization', e.target.value)
                                }
                                placeholder="로고, 색상, 특별 요청 등"
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    • 수량 변경에 따라 단가가 재조정됩니다
                    <br />
                    • 커스터마이징 요청은 추가 비용이 발생할 수 있습니다
                    <br />• 최종 견적은 중국직원 확인 후 제공됩니다
                  </Alert>
                </Box>

                <Divider />

                {/* 납품 정보 */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    납품 정보
                  </Typography>

                  <Stack spacing={2}>
                    <Box display="flex" gap={2}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="희망 납기일"
                          value={formData.deliveryDate}
                          onChange={(newValue) =>
                            setFormData({ ...formData, deliveryDate: newValue })
                          }
                          format="YYYY-MM-DD"
                          minDate={dayjs().add(30, 'day')}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              helperText: '최소 30일 이상 소요됩니다',
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <FormControl fullWidth required>
                        <InputLabel>납품 방법</InputLabel>
                        <Select
                          value={formData.deliveryMethod}
                          onChange={(e) =>
                            setFormData({ ...formData, deliveryMethod: e.target.value })
                          }
                          label="납품 방법"
                        >
                          <MenuItem value="DDP">DDP (관세포함 배송)</MenuItem>
                          <MenuItem value="FOB">FOB (중국 항구 인도)</MenuItem>
                          <MenuItem value="EXW">EXW (공장 인도)</MenuItem>
                        </Select>
                        <FormHelperText>DDP는 관세까지 포함된 가격입니다</FormHelperText>
                      </FormControl>
                    </Box>

                    <TextField
                      fullWidth
                      label="납품 주소"
                      value={formData.deliveryAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryAddress: e.target.value })
                      }
                      required
                      multiline
                      rows={2}
                      placeholder="정확한 납품 주소를 입력해주세요"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.saveDeliveryAddress}
                          onChange={(e) =>
                            setFormData({ ...formData, saveDeliveryAddress: e.target.checked })
                          }
                        />
                      }
                      label="이 배송 주소를 저장하여 다음에 재사용"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* 통관 정보 */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    통관 정보
                  </Typography>

                  <Stack spacing={2}>
                    <FormControl fullWidth required>
                      <InputLabel>통관 방식</InputLabel>
                      <Select
                        value={formData.customsClearanceType}
                        onChange={(e) =>
                          setFormData({ ...formData, customsClearanceType: e.target.value })
                        }
                        label="통관 방식"
                      >
                        <MenuItem value="business">사업자 통관</MenuItem>
                        <MenuItem value="personal">개인 통관</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label={
                        formData.customsClearanceType === 'business'
                          ? '사업자등록번호'
                          : '개인통관고유번호'
                      }
                      value={formData.customsClearanceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, customsClearanceNumber: e.target.value })
                      }
                      required
                      placeholder={
                        formData.customsClearanceType === 'business'
                          ? '000-00-00000'
                          : 'P000000000000'
                      }
                      helperText={
                        formData.customsClearanceType === 'business'
                          ? '사업자등록번호를 입력하세요'
                          : '개인통관고유번호를 입력하세요 (관세청 홈페이지에서 발급)'
                      }
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* 추가 요청사항 */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    추가 요청사항 (선택)
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="포장 요구사항"
                      value={formData.packingRequirements}
                      onChange={(e) =>
                        setFormData({ ...formData, packingRequirements: e.target.value })
                      }
                      multiline
                      rows={2}
                      placeholder="특별한 포장 방법이나 라벨 부착 요청사항을 입력하세요"
                    />

                    <TextField
                      fullWidth
                      label="품질 기준"
                      value={formData.qualityStandards}
                      onChange={(e) =>
                        setFormData({ ...formData, qualityStandards: e.target.value })
                      }
                      multiline
                      rows={2}
                      placeholder="특별히 요구하는 품질 기준이나 검사 항목을 입력하세요"
                    />

                    <TextField
                      fullWidth
                      label="기타 요청사항"
                      value={formData.additionalRequests}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalRequests: e.target.value })
                      }
                      multiline
                      rows={3}
                      placeholder="기타 특별히 요청하실 사항을 자세히 입력해주세요"
                    />
                  </Stack>
                </Box>

                {/* 파일 업로드 */}
                <FileUpload
                  label="참고 파일 (선택)"
                  description="디자인 파일, 품질 기준서, 계약서 등을 업로드해주세요"
                  maxFiles={5}
                  currentFiles={formData.referenceFiles}
                  onFilesChange={(files) => setFormData({ ...formData, referenceFiles: files })}
                />

                {/* 안내 메시지 */}
                <Alert severity="info">
                  <Typography variant="body2">
                    • 수량 변경에 따른 정확한 견적은 중국직원 확인 후 제공됩니다
                    <br />
                    • 계약 후 선금 30%, 생산 중 40%, 선적 전 30% 분할 결제
                    <br />
                    • 생산 진행 상황을 실시간으로 확인하실 수 있습니다
                    <br />• 품질 검사 후 문제 발생 시 재생산 또는 환불 처리됩니다
                  </Typography>
                </Alert>

                {/* 버튼 */}
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    취소
                  </Button>
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? '신청 중...' : '대량주문 신청하기'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* 신청 완료 모달 */}
      <Dialog
        open={showSuccessModal}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h4" color="success.main" fontWeight="bold">
            🏭 신청 완료!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            대량주문 신청이 성공적으로 접수되었습니다.
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              예약번호
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {reservationNumber}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            • 변경된 수량에 따른 재견적을 보내드립니다
            <br />
            • 견적 확인 후 계약을 진행하실 수 있습니다
            <br />• 궁금한 사항은 채팅으로 문의해주세요
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShowSuccessModal(false);
              router.push(`/dashboard/orders/bulk-order/${reservationNumber}`);
            }}
          >
            신청 내역 보기
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setShowSuccessModal(false);
              router.push('/');
            }}
          >
            메인으로 가기
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </PageContainer>
  );
}
