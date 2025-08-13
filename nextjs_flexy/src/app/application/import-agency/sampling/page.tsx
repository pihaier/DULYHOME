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
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Paper,
  Stack,
  Checkbox,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import FileUpload from '@/app/components/forms/form-elements/FileUpload';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';

interface FormData {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  productName: string;
  quantity: string;
  moqCheck: boolean;
  requirements: string;
  logoRequired: boolean;
  logoDetails: string;
  logoFiles: File[];
  customBoxRequired: boolean;
  boxDetails: string;
  boxDesignFiles: File[];
  files: File[];
}

export default function SamplingPage() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    productName: '',
    quantity: '',
    moqCheck: false,
    requirements: '',
    logoRequired: false,
    logoDetails: '',
    logoFiles: [],
    customBoxRequired: false,
    boxDetails: '',
    boxDesignFiles: [],
    files: [],
  });

  // userProfile에서 기본값 채우기
  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        company_name: userProfile.company_name || prev.company_name,
        contact_person: userProfile.contact_person || prev.contact_person,
        contact_phone: userProfile.phone || prev.contact_phone,
      }));
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/customer/login');
      return;
    }

    if (!formData.company_name || !formData.contact_person || !formData.contact_phone) {
      alert('회사명, 담당자명, 연락처는 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 예약번호 생성
      const { data: reservationData, error: reservationError } = await supabase.rpc(
        'generate_reservation_number',
        { prefix: 'DLSS' }
      );

      if (reservationError) throw reservationError;

      const reservationNumber = reservationData;

      // 모든 파일 업로드
      const uploadedFiles = [];

      // 제품 관련 파일
      for (const file of formData.files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${reservationNumber}/product_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inspection-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        uploadedFiles.push({
          original_filename: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          upload_type: 'product',
        });
      }

      // 로고 파일
      if (formData.logoRequired && formData.logoFiles.length > 0) {
        for (const file of formData.logoFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${reservationNumber}/logo_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspection-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          uploadedFiles.push({
            original_filename: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            upload_type: 'logo',
          });
        }
      }

      // 박스 디자인 파일
      if (formData.customBoxRequired && formData.boxDesignFiles.length > 0) {
        for (const file of formData.boxDesignFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${reservationNumber}/box_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspection-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          uploadedFiles.push({
            original_filename: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            upload_type: 'box_design',
          });
        }
      }

      // 신청 데이터 저장
      const applicationData = {
        reservation_number: reservationNumber,
        user_id: user.id,
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || user.email,
        service_type: 'import_agency',
        service_subtype: 'sampling',
        product_name: formData.productName,
        production_quantity: formData.moqCheck ? 0 : parseInt(formData.quantity),
        moq_check: formData.moqCheck,
        special_requirements: formData.requirements,
        logo_required: formData.logoRequired,
        logo_details: formData.logoRequired ? formData.logoDetails : null,
        custom_box_required: formData.customBoxRequired,
        box_details: formData.customBoxRequired ? formData.boxDetails : null,
        status: 'submitted',
        payment_status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('inspection_applications')
        .insert(applicationData);

      if (insertError) throw insertError;

      // 프로필 저장 체크박스가 선택되었으면 프로필 업데이트
      const saveToProfileCheckbox = document.querySelector(
        'input[name="saveToProfile"]'
      ) as HTMLInputElement;
      if (saveToProfileCheckbox?.checked && user) {
        await supabase
          .from('user_profiles')
          .update({
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.contact_phone,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }

      // 파일 정보 저장
      if (uploadedFiles.length > 0) {
        const fileRecords = uploadedFiles.map((file) => ({
          reservation_number: reservationNumber,
          uploaded_by: user.id,
          ...file,
          upload_purpose: 'application',
        }));

        const { error: fileError } = await supabase.from('uploaded_files').insert(fileRecords);

        if (fileError) throw fileError;
      }

      // 신청 완료 후 상세 페이지로 이동
      router.push(`/orders/${reservationNumber}`);
    } catch (error) {
      console.error('Error:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="샘플링 신청 - 두리무역" description="맞춤형 샘플 제작을 신청하세요">
      <HpHeader />

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              샘플링 신청
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              제조 단계부터 관여하여 고객 요구사항에 맞는 맞춤형 샘플을 제작하고 품질을 검증합니다.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} mt={4}>
              <Stack spacing={3}>
                {/* 회사 정보 입력 */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    신청자 정보
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="회사명"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                      placeholder="두리무역"
                    />
                    <TextField
                      fullWidth
                      label="담당자명"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      required
                      placeholder="홍길동"
                    />
                    <TextField
                      fullWidth
                      label="연락처"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      required
                      placeholder="010-1234-5678"
                    />
                    <TextField
                      fullWidth
                      label="이메일"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="example@company.com"
                      helperText="선택사항 - 입력하지 않으면 로그인 이메일이 사용됩니다"
                    />
                  </Stack>

                  {user && userProfile && (
                    <FormControlLabel
                      control={<Checkbox defaultChecked name="saveToProfile" />}
                      label="이 정보를 내 프로필에 저장"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                <Divider />

                {/* 제품명 */}
                <TextField
                  fullWidth
                  label="제품명"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                  placeholder="조사하실 제품명을 입력해주세요"
                  helperText="정확한 제품명을 입력하시면 더 정확한 조사가 가능합니다"
                />

                {/* 수량 및 MOQ */}
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Box sx={{ flex: 1, maxWidth: '300px' }}>
                    <TextField
                      fullWidth
                      label="예상 수량"
                      type="number"
                      value={formData.moqCheck ? '0' : formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      placeholder="1000"
                      helperText="대략적인 주문 예상 수량을 입력해주세요"
                      disabled={formData.moqCheck}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                    />
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.moqCheck}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              moqCheck: checked,
                              quantity: checked ? '0' : formData.quantity,
                            });
                          }}
                        />
                      }
                      label="MOQ 확인"
                    />
                    {formData.moqCheck && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        최소주문수량(MOQ)을 확인하고 싶습니다
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* 파일 업로드 */}
                <FileUpload
                  label="제품 사진 및 관련 서류"
                  description="제품 사진, 도면, 사양서 등을 업로드해주세요 (최대 5개)"
                  maxFiles={5}
                  currentFiles={formData.files}
                  onFilesChange={(files) => setFormData({ ...formData, files })}
                  required
                />

                {/* 요청사항 */}
                <TextField
                  fullWidth
                  label="요청사항"
                  multiline
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  placeholder="조사하고 싶은 내용을 자세히 입력해주세요&#10;예: 최소 주문량, 단가, 배송 기간, 인증서 유무, 원재료 정보 등"
                  helperText="구체적으로 작성하실수록 정확한 조사가 가능합니다"
                />

                {/* 로고 인쇄 및 박스 제작 옵션 */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    추가 옵션
                  </Typography>
                  <Box display="flex" gap={3} flexWrap="wrap">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.logoRequired}
                          onChange={(e) =>
                            setFormData({ ...formData, logoRequired: e.target.checked })
                          }
                        />
                      }
                      label="로고 인쇄 필요"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.customBoxRequired}
                          onChange={(e) =>
                            setFormData({ ...formData, customBoxRequired: e.target.checked })
                          }
                        />
                      }
                      label="맞춤 박스 제작 필요"
                    />
                  </Box>
                </Paper>

                {/* 로고 인쇄 상세 (조건부) */}
                {formData.logoRequired && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      로고 인쇄 정보
                    </Typography>
                    <Stack spacing={2}>
                      <FileUpload
                        label="로고 파일 업로드"
                        description="AI, PSD, PNG 등 로고 파일을 업로드해주세요 (선택사항)"
                        maxFiles={3}
                        currentFiles={formData.logoFiles}
                        onFilesChange={(files) => setFormData({ ...formData, logoFiles: files })}
                      />
                      <TextField
                        fullWidth
                        label="로고 인쇄 상세 정보"
                        multiline
                        rows={3}
                        value={formData.logoDetails}
                        onChange={(e) => setFormData({ ...formData, logoDetails: e.target.value })}
                        placeholder="로고 인쇄 위치, 크기, 방식(실크인쇄, UV인쇄 등) 등을 상세히 기재해주세요"
                        helperText="로고 파일이 없으시면 추후 제공 가능합니다"
                      />
                    </Stack>
                  </Paper>
                )}

                {/* 박스 제작 상세 (조건부) */}
                {formData.customBoxRequired && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      맞춤 박스 제작 정보
                    </Typography>
                    <Stack spacing={2}>
                      <FileUpload
                        label="박스 디자인 파일 업로드"
                        description="박스 디자인 AI 파일을 업로드해주세요 (선택사항)"
                        maxFiles={3}
                        currentFiles={formData.boxDesignFiles}
                        onFilesChange={(files) =>
                          setFormData({ ...formData, boxDesignFiles: files })
                        }
                      />
                      <TextField
                        fullWidth
                        label="박스 제작 상세 정보"
                        multiline
                        rows={3}
                        value={formData.boxDetails}
                        onChange={(e) => setFormData({ ...formData, boxDetails: e.target.value })}
                        placeholder="박스 크기, 재질, 인쇄 방식, 수량 등을 상세히 기재해주세요"
                        helperText="박스 디자인이 없으시면 추후 제공 가능합니다"
                      />
                    </Stack>
                  </Paper>
                )}

                {/* 안내 메시지 */}
                <Alert severity="info">
                  <Typography variant="body2">
                    • 샘플 제작은 7-10일 정도 소요됩니다.
                    <br />
                    • 맞춤형 샘플 제작으로 품질을 사전 검증할 수 있습니다.
                    <br />
                    • 수수료 2만원 + 샘플비 + 중국 배송비가 발생합니다.
                    <br />• 제작된 샘플은 한국으로 직접 배송해드립니다.
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

      <Footer />
    </PageContainer>
  );
}
