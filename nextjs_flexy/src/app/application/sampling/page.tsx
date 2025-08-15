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
  FormLabel,
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
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Remove,
  ArrowDropDown as ArrowDropDownIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import FileUpload from '@/app/components/forms/form-elements/FileUpload';
import CompanyInfoForm from '@/app/components/forms/form-elements/CompanyInfoForm';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';

interface SampleItem {
  productName: string;
  quantity: number | '';
  specifications: string;
}

interface FormData {
  // 회사 정보
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;

  // 시장조사 연계
  marketResearchId: string;

  // 샘플 정보
  sampleItems: SampleItem[];

  // 배송 정보
  sampleReceiveAddress: string;
  receiverName: string;
  receiverPhone: string;
  customsClearanceType: string;
  customsClearanceNumber: string;
  shippingMethod: string;

  // 요청사항
  requirements: string;
  referenceFiles: File[];
}

interface SavedShippingAddress {
  id: string;
  address: string;
  receiver_name: string;
  receiver_phone: string;
  customs_clearance_type: string;
  customs_clearance_number: string;
  is_default: boolean;
}

// 예약번호 생성 함수
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `SA-${year}${month}${day}-${random}`;
}

export default function SamplingApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationNumber, setReservationNumber] = useState('');
  const [savedShippingAddresses, setSavedShippingAddresses] = useState<SavedShippingAddress[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveShippingAsDefault, setSaveShippingAsDefault] = useState(false);

  // 시장조사 연계 데이터 확인 - 선택사항으로 변경
  const marketResearchId = searchParams.get('marketResearchId') || '';
  const isLinkedFromMarketResearch = !!marketResearchId;

  // 로그인 체크 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  React.useEffect(() => {
    if (!authLoading && !user) {
      // 현재 페이지를 returnUrl로 저장하여 로그인 후 돌아올 수 있도록 함
      const currentPath = '/application/sampling';
      router.push(`/auth/customer/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, router]);

  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    marketResearchId: marketResearchId,
    sampleItems: [
      {
        productName: '',
        quantity: '',
        specifications: '',
      },
    ],
    sampleReceiveAddress: '',
    receiverName: '',
    receiverPhone: '',
    customsClearanceType: 'business',
    customsClearanceNumber: '',
    shippingMethod: 'air',
    requirements: '',
    referenceFiles: [],
  });

  // 저장된 배송 주소 목록 가져오기
  useEffect(() => {
    if (user) {
      fetchSavedShippingAddresses();
    }
  }, [user]);

  const fetchSavedShippingAddresses = async () => {
    setLoadingShipping(true);
    try {
      // Supabase에서 직접 배송 주소 가져오기
      const { data: addresses, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedShippingAddresses(addresses || []);

      // 기본 배송 주소가 있으면 자동으로 채우기
      const defaultAddress = addresses?.find((addr: SavedShippingAddress) => addr.is_default);
      if (defaultAddress && !formData.sampleReceiveAddress) {
        setFormData((prev) => ({
          ...prev,
          sampleReceiveAddress: defaultAddress.address,
          receiverName: defaultAddress.receiver_name,
          receiverPhone: defaultAddress.receiver_phone,
          customsClearanceType: defaultAddress.customs_clearance_type,
          customsClearanceNumber: defaultAddress.customs_clearance_number,
        }));
      }
    } catch (err) {
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleSelectShippingAddress = (address: SavedShippingAddress) => {
    setFormData((prev) => ({
      ...prev,
      sampleReceiveAddress: address.address,
      receiverName: address.receiver_name,
      receiverPhone: address.receiver_phone,
      customsClearanceType: address.customs_clearance_type,
      customsClearanceNumber: address.customs_clearance_number,
    }));
    setAnchorEl(null);
  };

  const handleNewShippingAddress = () => {
    setFormData((prev) => ({
      ...prev,
      sampleReceiveAddress: '',
      receiverName: '',
      receiverPhone: '',
      customsClearanceNumber: '',
    }));
    setSaveShippingAsDefault(true);
    setAnchorEl(null);
  };

  // 시장조사 데이터 로드 (실제 구현 시)
  useEffect(() => {
    if (marketResearchId) {
      // API 호출로 시장조사 데이터 가져오기
      // loadMarketResearchData(marketResearchId);
    }
  }, [marketResearchId]);

  const addSampleItem = () => {
    setFormData({
      ...formData,
      sampleItems: [...formData.sampleItems, { productName: '', quantity: '', specifications: '' }],
    });
  };

  const removeSampleItem = (index: number) => {
    if (formData.sampleItems.length > 1) {
      const newItems = formData.sampleItems.filter((_, i) => i !== index);
      setFormData({ ...formData, sampleItems: newItems });
    }
  };

  const updateSampleItem = (index: number, field: keyof SampleItem, value: string | number) => {
    const newItems = [...formData.sampleItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, sampleItems: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/customer/login');
      return;
    }

    // 필수 필드 검증
    if (!formData.company_name || !formData.contact_person || !formData.contact_phone) {
      alert('회사명, 담당자명, 연락처는 필수 입력 항목입니다.');
      return;
    }

    const hasEmptySampleItem = formData.sampleItems.some(
      (item) => !item.productName || !item.quantity
    );
    if (hasEmptySampleItem) {
      alert('샘플 제품명과 수량은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.sampleReceiveAddress || !formData.receiverName || !formData.receiverPhone) {
      alert('배송 정보는 모두 필수 입력 항목입니다.');
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

      // 샘플링 신청 데이터 준비
      const applicationData = {
        reservation_number: newReservationNumber,
        user_id: user.id,
        service_type: 'sampling',
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || user.email,
        market_research_id: formData.marketResearchId || null,
        sample_items: formData.sampleItems,
        sample_receive_address: formData.sampleReceiveAddress,
        receiver_name: formData.receiverName,
        receiver_phone: formData.receiverPhone,
        customs_clearance_type: formData.customsClearanceType,
        customs_clearance_number: formData.customsClearanceNumber,
        shipping_method: formData.shippingMethod,
        requirements: formData.requirements || null,
        status: 'submitted',
        payment_status: 'pending',
      };

      // Supabase에 직접 저장
      const { data: application, error: insertError } = await supabase
        .from('sampling_applications')
        .insert(applicationData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`신청 저장 실패: ${insertError.message}`);
      }

      setReservationNumber(newReservationNumber);

      // 배송 주소 저장 (saveShippingAsDefault 체크된 경우)
      if (saveShippingAsDefault) {
        // 기존 기본 주소 해제
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);

        // 새 주소 저장
        await supabase.from('shipping_addresses').insert({
          user_id: user.id,
          address: formData.sampleReceiveAddress,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          customs_clearance_type: formData.customsClearanceType,
          customs_clearance_number: formData.customsClearanceNumber,
          is_default: true,
        });
      }

      // 중국직원 자동 배정
      const { data: chineseStaff } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'chinese_staff')
        .eq('approval_status', 'approved')
        .limit(1);

      if (chineseStaff && chineseStaff.length > 0) {
        await supabase
          .from('sampling_applications')
          .update({ assigned_chinese_staff: chineseStaff[0].user_id })
          .eq('id', application.id);
      }

      // 활동 로그 기록
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'create_sampling_application',
        entity_type: 'sampling_application',
        entity_id: application.id,
        metadata: {
          reservation_number: newReservationNumber,
          sample_count: formData.sampleItems.length,
        },
      });

      // 파일 업로드 처리 (Storage SDK 사용)
      if (formData.referenceFiles.length > 0) {
        for (const file of formData.referenceFiles) {
          try {
            // 파일명 안전하게 처리 (한글, 공백 제거)
            const fileExt = file.name.split('.').pop() || '';
            const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${newReservationNumber}/sample_reference/${safeFileName}`;

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
              file_type: 'sample_reference',
              mime_type: file.type,
              upload_purpose: 'application',
              upload_category: 'sample_reference',
              upload_status: 'completed',
              file_url: publicUrl,
            });

            if (dbError) {
            }
          } catch (error) {}
        }
      }

      // 신청 완료 모달 표시
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
      <PageContainer title="샘플링 신청 - 두리무역" description="중국 제품의 샘플을 신청하세요">
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
    <PageContainer title="샘플링 신청 - 두리무역" description="중국 제품의 샘플을 신청하세요">
      <HpHeader />

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              샘플링 신청
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              원하시는 제품의 샘플을 제작하여 한국으로 배송해드립니다.
            </Typography>

            {isLinkedFromMarketResearch && (
              <Alert severity="info" sx={{ mb: 3 }}>
                시장조사 결과를 바탕으로 샘플을 신청하고 있습니다.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} mt={4}>
              <Stack spacing={3}>
                {/* 회사 정보 입력 */}
                <CompanyInfoForm
                  value={{
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    contact_phone: formData.contact_phone,
                    contact_email: formData.contact_email,
                  }}
                  onChange={(info) => setFormData({ ...formData, ...info })}
                />

                <Divider />

                {/* 샘플 정보 */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    샘플 정보
                  </Typography>

                  {formData.sampleItems.map((item, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          샘플 #{index + 1}
                        </Typography>
                        {formData.sampleItems.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeSampleItem(index)}
                            sx={{ ml: 1 }}
                          >
                            <Remove />
                          </IconButton>
                        )}
                      </Box>

                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="제품명"
                          value={item.productName}
                          onChange={(e) => updateSampleItem(index, 'productName', e.target.value)}
                          required
                          placeholder="샘플 제품명을 입력하세요"
                        />

                        <Box display="flex" gap={2}>
                          <TextField
                            fullWidth
                            label="수량"
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateSampleItem(
                                index,
                                'quantity',
                                e.target.value ? parseInt(e.target.value) : ''
                              )
                            }
                            required
                            placeholder="1"
                            InputProps={{
                              inputProps: { min: 1 },
                            }}
                          />

                          <TextField
                            fullWidth
                            label="규격/사양"
                            value={item.specifications}
                            onChange={(e) =>
                              updateSampleItem(index, 'specifications', e.target.value)
                            }
                            placeholder="크기, 색상, 재질 등"
                          />
                        </Box>
                      </Stack>
                    </Box>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addSampleItem}
                    sx={{ mt: 1 }}
                  >
                    샘플 추가
                  </Button>
                </Box>

                <Divider />

                {/* 배송 정보 */}
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      배송 정보
                    </Typography>

                    {user && (
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        disabled={loadingShipping}
                      >
                        {loadingShipping ? <CircularProgress size={16} /> : '배송 정보 불러오기'}
                      </Button>
                    )}
                  </Stack>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    {savedShippingAddresses.length > 0 ? (
                      savedShippingAddresses.map((address) => (
                        <MenuItem
                          key={address.id}
                          onClick={() => handleSelectShippingAddress(address)}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <LocalShippingIcon fontSize="small" color="action" />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {address.receiver_name} | {address.receiver_phone}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {address.address}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {address.customs_clearance_type === 'business' ? '사업자' : '개인'} |{' '}
                              {address.customs_clearance_number}
                            </Typography>
                          </Box>
                          {address.is_default && <Chip label="기본" size="small" color="primary" />}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          저장된 배송지가 없습니다
                        </Typography>
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleNewShippingAddress}>
                      <Typography color="primary">+ 새 배송지 입력</Typography>
                    </MenuItem>
                  </Menu>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="수령 주소"
                      value={formData.sampleReceiveAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, sampleReceiveAddress: e.target.value })
                      }
                      required
                      placeholder="샘플을 받으실 주소를 입력하세요"
                      multiline
                      rows={2}
                    />

                    <Box display="flex" gap={2}>
                      <TextField
                        fullWidth
                        label="수령인"
                        value={formData.receiverName}
                        onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                        required
                        placeholder="받는 분 성함"
                      />

                      <TextField
                        fullWidth
                        label="수령인 연락처"
                        value={formData.receiverPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, receiverPhone: e.target.value })
                        }
                        required
                        placeholder="010-0000-0000"
                      />
                    </Box>

                    {/* 통관 정보 */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        통관 방식 선택
                      </Typography>
                      <ToggleButtonGroup
                        value={formData.customsClearanceType}
                        exclusive
                        onChange={(e, newValue) => {
                          if (newValue !== null) {
                            setFormData({
                              ...formData,
                              customsClearanceType: newValue,
                              customsClearanceNumber: '', // 타입 변경 시 번호 초기화
                            });
                          }
                        }}
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            '&.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            },
                          },
                        }}
                      >
                        <ToggleButton value="business" sx={{ py: 1.5 }}>
                          사업자 통관
                        </ToggleButton>
                        <ToggleButton value="personal" sx={{ py: 1.5 }}>
                          개인 통관
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

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

                    {/* 배송 방법 */}
                    <FormControl fullWidth>
                      <InputLabel>배송 방법</InputLabel>
                      <Select
                        value={formData.shippingMethod}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingMethod: e.target.value })
                        }
                        label="배송 방법"
                      >
                        <MenuItem value="air">항공 배송 (빠름)</MenuItem>
                        <MenuItem value="sea">해운 배송 (저렴)</MenuItem>
                      </Select>
                      <FormHelperText>항공: 3-5일 소요 / 해운: 15-20일 소요</FormHelperText>
                    </FormControl>
                  </Stack>

                  {/* 배송 정보 저장 옵션 */}
                  {user && (
                    <Box mt={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={saveShippingAsDefault}
                            onChange={(e) => setSaveShippingAsDefault(e.target.checked)}
                            name="saveShippingAsDefault"
                          />
                        }
                        label="이 배송 정보를 기본으로 설정"
                      />
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* 파일 업로드 */}
                <FileUpload
                  label="참고 파일 (선택)"
                  description="제품 사진, 디자인 파일 등을 업로드해주세요"
                  maxFiles={5}
                  currentFiles={formData.referenceFiles}
                  onFilesChange={(files) => setFormData({ ...formData, referenceFiles: files })}
                />

                {/* 요청사항 */}
                <TextField
                  fullWidth
                  label="추가 요청사항 (선택)"
                  multiline
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="샘플 제작 시 특별히 요청하실 사항을 입력해주세요"
                />

                {/* 안내 메시지 */}
                <Alert severity="info">
                  <Typography variant="body2">
                    • 샘플 제작은 보통 3-7일 소요됩니다
                    <br />
                    • 샘플 비용과 배송비는 별도로 청구됩니다
                    <br />
                    • 통관 시 관세가 발생할 수 있습니다
                    <br />• 제작 진행 상황은 실시간으로 확인 가능합니다
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
                    {loading ? '신청 중...' : '신청하기'}
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
            📦 신청 완료!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            샘플링 신청이 성공적으로 접수되었습니다.
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
            • 공급업체 확인 후 견적을 보내드립니다
            <br />
            • 샘플 제작 및 배송 진행 상황을 확인하실 수 있습니다
            <br />• 궁금한 사항은 채팅으로 문의해주세요
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShowSuccessModal(false);
              router.push(`/dashboard/orders/sampling/${reservationNumber}`);
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
