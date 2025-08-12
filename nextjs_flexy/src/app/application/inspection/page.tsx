'use client';

import React, { useState } from 'react';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Divider,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import FileUpload from '@/app/components/forms/form-elements/FileUpload';
import CompanyInfoForm from '@/app/components/forms/form-elements/CompanyInfoForm';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface FormData {
  // 회사 정보
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  
  // 서비스 타입
  serviceSubType: string;
  
  // 품질검품 전용 필드
  productName: string;
  quantity: number | '';
  inspectionMethod: string;
  
  // 공장 정보
  factoryName: string;
  factoryContact: string;
  factoryPhone: string;
  factoryAddress: string;
  
  // 일정 옵션
  scheduleType: string;
  confirmedDate: Dayjs | null;
  inspectionDays: number | '';
  
  // 요청사항
  inspectionRequest: string;
  requestFiles: File[];
}

// 예약번호 생성 함수
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `IN-${year}${month}${day}-${random}`;
}

export default function InspectionApplicationPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationNumber, setReservationNumber] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    serviceSubType: '',
    productName: '',
    quantity: '',
    inspectionMethod: 'standard',
    factoryName: '',
    factoryContact: '',
    factoryPhone: '',
    factoryAddress: '',
    scheduleType: 'duly_coordination',
    confirmedDate: null,
    inspectionDays: 1,
    inspectionRequest: '',
    requestFiles: [],
  });

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

    if (!formData.serviceSubType) {
      alert('검품 타입을 선택해주세요.');
      return;
    }

    if (formData.serviceSubType === 'quality_inspection' && !formData.productName) {
      alert('제품명은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.factoryPhone) {
      alert('공장 연락처는 필수 입력 항목입니다.');
      return;
    }

    if (formData.scheduleType === 'already_booked' && !formData.confirmedDate) {
      alert('예약된 검품일자를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 체크박스 상태 확인
      const saveToProfileCheckbox = document.querySelector('input[name="saveToProfile"]') as HTMLInputElement;
      const saveAsDefaultCheckbox = document.querySelector('input[name="saveAsDefault"]') as HTMLInputElement;
      
      // 예약번호 생성
      const newReservationNumber = generateReservationNumber();
      
      // 신청 데이터 준비
      const applicationData = {
        reservation_number: newReservationNumber,
        user_id: user.id,
        service_type: formData.serviceSubType,  // 이미 영어로 되어있음
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || user.email,
        
        // 품질검품 전용 필드
        product_name: formData.productName || '검품 신청',
        production_quantity: formData.quantity || null,
        inspection_method: formData.inspectionMethod || null,
        
        // 공장 정보
        factory_name: formData.factoryName || null,
        factory_contact: formData.factoryContact || null,
        factory_phone: formData.factoryPhone,
        factory_address: formData.factoryAddress || null,
        
        // 일정 정보
        schedule_type: formData.scheduleType || 'duly_coordination',
        confirmed_date: formData.confirmedDate ? formData.confirmedDate.format('YYYY-MM-DD') : null,
        inspection_days: formData.inspectionDays || 1,
        
        // 요청사항
        special_requirements: formData.inspectionRequest || null,
        
        status: 'submitted',
        payment_status: 'pending',
      };

      // Supabase에 직접 저장
      const { data: application, error: insertError } = await supabase
        .from('inspection_applications')
        .insert(applicationData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`신청 저장 실패: ${insertError.message}`);
      }

      setReservationNumber(newReservationNumber);

      // 회사 정보 저장 (saveAsDefault 체크된 경우)
      if (saveAsDefaultCheckbox?.checked) {
        await supabase
          .from('company_addresses')
          .upsert({
            user_id: user.id,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.contact_phone,
            email: formData.contact_email || null,
            is_default: true,
          }, {
            onConflict: 'user_id,is_default'
          });
      }

      // 사용자 프로필이 없거나 정보가 변경된 경우 자동으로 프로필 업데이트
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile || 
          currentProfile.company_name !== formData.company_name ||
          currentProfile.contact_person !== formData.contact_person ||
          currentProfile.phone !== formData.contact_phone) {
        
        const profileData = {
          user_id: user.id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.contact_phone,
        };

        if (!currentProfile) {
          // 프로필이 없으면 생성
          await supabase
            .from('user_profiles')
            .insert(profileData);
        } else {
          // 프로필이 있으면 업데이트
          await supabase
            .from('user_profiles')
            .update({
              company_name: formData.company_name,
              contact_person: formData.contact_person,
              phone: formData.contact_phone,
            })
            .eq('user_id', user.id);
        }
      }

      // 중국직원 자동 배정 (라운드 로빈 방식)
      const { data: chineseStaff } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'chinese_staff')
        .eq('approval_status', 'approved')
        .limit(1);

      if (chineseStaff && chineseStaff.length > 0) {
        await supabase
          .from('inspection_applications')
          .update({ assigned_chinese_staff: chineseStaff[0].user_id })
          .eq('id', application.id);
      }

      // 활동 로그 기록
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'create_inspection_application',
          entity_type: 'inspection_application',
          entity_id: application.id,
          metadata: {
            reservation_number: newReservationNumber,
            service_type: formData.serviceSubType,
          }
        });

      // 파일 업로드 처리 (Storage SDK 사용)
      if (formData.requestFiles.length > 0) {
        for (const file of formData.requestFiles) {
          try {
            // 파일명 안전하게 처리 (한글, 공백 제거)
            const fileExt = file.name.split('.').pop() || '';
            const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${newReservationNumber}/inspection_request/${safeFileName}`;
            
            // Storage SDK로 업로드
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('application-files')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error(`Storage 업로드 오류: ${file.name}`, uploadError);
              
              // Word 파일 등 지원하지 않는 MIME 타입의 경우 API 폴백 사용
              if (uploadError.message?.includes('mime type') || uploadError.message?.includes('not supported')) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('reservationNumber', newReservationNumber);
                formData.append('category', 'inspection_request');
                formData.append('uploadPurpose', 'application');

                try {
                  const uploadResponse = await fetch('/api/files/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                  });

                  if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    return; // API 업로드 성공 시 다음 파일로 진행
                  } else {
                    const error = await uploadResponse.json();
                    throw new Error(`파일 업로드 실패: ${error.message}`);
                  }
                } catch (apiError) {
                  throw apiError;
                }
              } else {
                throw uploadError;
              }
            }

            // 파일 URL 생성
            const { data: { publicUrl } } = supabase.storage
              .from('application-files')
              .getPublicUrl(uploadData.path);
            
            // uploaded_files 테이블에 기록
            const { error: dbError } = await supabase
              .from('uploaded_files')
              .insert({
                reservation_number: newReservationNumber,
                uploaded_by: user.id,
                original_filename: file.name,
                file_path: uploadData.path,
                file_size: file.size,
                file_type: 'inspection_request',
                mime_type: file.type,
                upload_purpose: 'application',
                upload_category: 'inspection_request',
                upload_status: 'completed',
                file_url: publicUrl
              });

            if (dbError) {
              console.error('파일 정보 DB 저장 오류:', dbError);
            }
          } catch (error) {
            console.error('파일 업로드 오류:', error);
          }
        }
      }

      // 신청 완료 모달 표시
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('신청 오류:', error);
      alert(error.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중일 때만 로딩 스피너 표시
  if (authLoading) {
    return (
      <PageContainer title="검품감사 신청 - 두리무역" description="품질검품, 공장감사, 선적검품 서비스를 신청하세요">
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
    <PageContainer title="검품감사 신청 - 두리무역" description="품질검품, 공장감사, 선적검품 서비스를 신청하세요">
      <HpHeader />
      
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              검품감사 신청
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              품질검품, 공장감사, 선적검품 서비스를 신청하실 수 있습니다.
            </Typography>

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

                {/* 서비스 타입 선택 */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    검품 타입 선택 *
                  </Typography>
                  <ToggleButtonGroup
                    value={formData.serviceSubType}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setFormData({ ...formData, serviceSubType: newValue });
                      }
                    }}
                    aria-label="검품 타입 선택"
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiTypography-root': {
                            color: 'white',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="quality_inspection" sx={{ py: 2, flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                      <Typography fontWeight={600} gutterBottom>
                        품질검품
                      </Typography>
                      <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                        제품의 품질, 수량, 규격을 검사합니다
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="factory_audit" sx={{ py: 2, flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                      <Typography fontWeight={600} gutterBottom>
                        공장감사
                      </Typography>
                      <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                        제조 시설, 생산 능력, 품질 관리 시스템을 평가합니다
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="loading_inspection" sx={{ py: 2, flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                      <Typography fontWeight={600} gutterBottom>
                        선적검품
                      </Typography>
                      <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                        선적 전 최종 검사 및 수량 확인을 진행합니다
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* 품질검품 전용 필드 */}
                {formData.serviceSubType === 'quality_inspection' && (
                  <>
                    <TextField
                      fullWidth
                      label="제품명"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      required
                      placeholder="검품할 제품명을 입력해주세요"
                    />

                    <Box display="flex" gap={2}>
                      <TextField
                        fullWidth
                        label="생산 수량"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? parseInt(e.target.value) : '' })}
                        required
                        placeholder="1000"
                        InputProps={{
                          inputProps: { min: 1 }
                        }}
                      />
                      
                      <FormControl fullWidth required>
                        <InputLabel>검품 방법</InputLabel>
                        <Select
                          value={formData.inspectionMethod}
                          onChange={(e) => setFormData({ ...formData, inspectionMethod: e.target.value })}
                          label="검품 방법"
                        >
                          <MenuItem value="standard">표준검품 (AQL 기준)</MenuItem>
                          <MenuItem value="full">전수검품 (100% 검사)</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </>
                )}

                <Divider />

                {/* 공장 정보 */}
                <Typography variant="h6" fontWeight={600}>공장 정보</Typography>
                
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <TextField
                    fullWidth
                    label="공장명 (선택)"
                    value={formData.factoryName}
                    onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                    placeholder="예: 광저우 ABC 공장"
                  />
                  <TextField
                    fullWidth
                    label="공장 담당자 (선택)"
                    value={formData.factoryContact}
                    onChange={(e) => setFormData({ ...formData, factoryContact: e.target.value })}
                    placeholder="담당자 이름"
                  />
                </Box>

                <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                  <TextField
                    fullWidth
                    label="공장 연락처"
                    value={formData.factoryPhone}
                    onChange={(e) => setFormData({ ...formData, factoryPhone: e.target.value })}
                    required
                    placeholder="+86-123-4567-8901"
                  />
                  <TextField
                    fullWidth
                    label="공장 주소 (선택)"
                    value={formData.factoryAddress}
                    onChange={(e) => setFormData({ ...formData, factoryAddress: e.target.value })}
                    placeholder="상세 주소를 입력해주세요"
                  />
                </Box>

                <Divider />

                {/* 일정 옵션 */}
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>검품 일정</Typography>
                  
                  <ToggleButtonGroup
                    value={formData.scheduleType}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setFormData({ ...formData, scheduleType: newValue });
                      }
                    }}
                    aria-label="검품 일정 선택"
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
                    <ToggleButton value="duly_coordination" sx={{ py: 2 }}>
                      <Typography>두리무역과 협의하여 일정 조율</Typography>
                    </ToggleButton>
                    <ToggleButton value="already_booked" sx={{ py: 2 }}>
                      <Typography>이미 예약된 일정이 있음</Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* 이미 예약된 경우 날짜 입력 */}
                {formData.scheduleType === 'already_booked' && (
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="예약된 검품일자"
                        value={formData.confirmedDate}
                        onChange={(newValue) => setFormData({ ...formData, confirmedDate: newValue })}
                        format="YYYY-MM-DD"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            size: 'medium',
                          },
                        }}
                      />
                    </LocalizationProvider>
                    
                    <FormControl fullWidth>
                      <InputLabel>검품 일수</InputLabel>
                      <Select
                        value={formData.inspectionDays}
                        onChange={(e) => setFormData({ ...formData, inspectionDays: Number(e.target.value) })}
                        label="검품 일수"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30].map((days) => (
                          <MenuItem key={days} value={days}>
                            {days}일
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>검품에 소요되는 일수를 선택하세요</FormHelperText>
                    </FormControl>
                  </Box>
                )}

                {/* 파일 업로드 */}
                <FileUpload
                  label="참고 파일 (선택)"
                  description="제품 사양서, 검품 체크리스트, 품질 기준서 등을 업로드해주세요"
                  maxFiles={5}
                  currentFiles={formData.requestFiles}
                  onFilesChange={(files) => setFormData({ ...formData, requestFiles: files })}
                />

                {/* 요청사항 */}
                <TextField
                  fullWidth
                  label="검품 요청사항 (선택)"
                  multiline
                  rows={4}
                  value={formData.inspectionRequest}
                  onChange={(e) => setFormData({ ...formData, inspectionRequest: e.target.value })}
                  placeholder="특별히 확인이 필요한 사항이나 주의사항을 입력해주세요"
                />

                {/* 안내 메시지 */}
                <Alert severity="info">
                  <Typography variant="body2">
                    • 검품 일정은 공장과 협의 후 확정됩니다<br />
                    • 검품 보고서는 사진과 함께 상세하게 제공됩니다<br />
                    • 불량품 발견 시 즉시 연락드리고 대응 방안을 협의합니다
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
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                  >
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
          ✅ 신청 완료!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            검품감사 신청이 성공적으로 접수되었습니다.
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
            • 담당자가 곧 연락드릴 예정입니다<br/>
            • 검품 일정은 공장과 협의 후 확정됩니다<br/>
            • 진행 상황은 실시간으로 확인하실 수 있습니다
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShowSuccessModal(false);
              router.push(`/dashboard/orders/inspection/${reservationNumber}`);
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