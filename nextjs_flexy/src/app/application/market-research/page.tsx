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
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import FileUpload from '@/app/components/forms/form-elements/FileUpload';
import CompanyInfoForm, {
  useCompanyInfoSubmit,
} from '@/app/components/forms/form-elements/CompanyInfoForm';
import { createClient } from '@/lib/supabase/client';
import { createServiceClient } from '@/lib/supabase/service';
import { useUser } from '@/lib/context/GlobalContext';
import { translateInBackground } from '@/lib/utils/auto-translate';

interface FormData {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  productName: string;
  detailPage: string;
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

// 예약번호 생성 함수
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `MR-${year}${month}${day}-${random}`;
}

export default function MarketResearchPage() {
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
    productName: '',
    detailPage: '',
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

  // 로그인 체크 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  React.useEffect(() => {
    if (!authLoading && !user) {
      // 현재 페이지를 returnUrl로 저장하여 로그인 후 돌아올 수 있도록 함
      const currentPath = '/application/market-research';
      router.push(`/auth/customer/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, router]);

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

    if (!formData.productName) {
      alert('제품명은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.requirements) {
      alert('요청사항은 필수 입력 항목입니다.');
      return;
    }

    if (formData.files.length === 0) {
      alert('제품 사진 및 관련 서류는 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);

    try {
      // 체크박스 상태 확인
      const saveToProfileCheckbox = document.querySelector(
        'input[name="saveToProfile"]'
      ) as HTMLInputElement;
      const saveAsDefaultCheckbox = document.querySelector(
        'input[name="saveAsDefault"]'
      ) as HTMLInputElement;

      // 예약번호 생성
      const newReservationNumber = generateReservationNumber();

      // 시장조사 데이터 준비
      const applicationData = {
        reservation_number: newReservationNumber,
        user_id: user.id,
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || user.email,
        product_name: formData.productName,
        detail_page: formData.detailPage || null,
        research_quantity: formData.quantity ? parseInt(formData.quantity) : null,
        moq_check: formData.moqCheck,
        requirements: formData.requirements,
        logo_required: formData.logoRequired,
        logo_details: formData.logoDetails || null,
        custom_box_required: formData.customBoxRequired,
        box_details: formData.boxDetails || null,
        status: 'submitted',
        service_type: 'market_research',
        payment_status: 'not_required',
      };

      // Supabase에 직접 저장
      const { data: application, error: insertError } = await supabase
        .from('market_research_requests')
        .insert(applicationData)
        .select()
        .single();

      if (insertError) {
        throw new Error(
          `신청 저장 실패: ${insertError.message || insertError.details || '알 수 없는 오류'}`
        );
      }

      if (!application || !application.id) {
        throw new Error('신청서가 생성되었지만 데이터를 가져올 수 없습니다.');
      }

      setReservationNumber(newReservationNumber);

      // 백그라운드에서 자동 번역 실행 (실패해도 무시)
      translateInBackground({
        table: 'market_research_requests',
        recordId: application.id,
        delay: 1000, // 1초 후 실행
      });

      // 회사 정보 저장 (saveAsDefault 체크된 경우)
      if (saveAsDefaultCheckbox?.checked) {
        await supabase.from('company_addresses').upsert(
          {
            user_id: user.id,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.contact_phone,
            email: formData.contact_email || null,
            is_default: true,
          },
          {
            onConflict: 'user_id,is_default',
          }
        );
      }

      // 사용자 프로필이 없으면 생성 또는 업데이트
      if (!userProfile || saveToProfileCheckbox?.checked) {
        const profileData = {
          user_id: user.id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.contact_phone,
          role: 'customer',
          approval_status: 'approved',
        };

        if (!userProfile) {
          // 프로필이 없으면 생성
          await supabase.from('user_profiles').insert(profileData);
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

      // 중국직원 자동 배정
      const { data: chineseStaff } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'chinese_staff')
        .eq('approval_status', 'approved')
        .limit(1);

      if (chineseStaff && chineseStaff.length > 0 && application.id) {
        const { error: updateError } = await supabase
          .from('market_research_requests')
          .update({ assigned_staff: chineseStaff[0].user_id })
          .eq('id', application.id);

        if (updateError) {
          // 배정 실패해도 계속 진행 (중요하지 않은 오류)
        }
      }

      // 활동 로그 기록
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'create_market_research_application',
        entity_type: 'market_research_application',
        entity_id: application.id,
        metadata: {
          reservation_number: newReservationNumber,
          product_name: formData.productName,
        },
      });

      // 파일 업로드 처리 (Storage SDK 사용 + 컬럼에 직접 저장)
      const uploadFiles = async () => {
        const applicationPhotos = [];
        const logoFiles = [];
        const boxFiles = [];

        // 모든 파일을 배열로 모으기 (이미 압축된 파일들)
        const filesToUpload = [
          ...formData.files.map((file) => ({ file, category: 'product' })),
          ...(formData.logoRequired
            ? formData.logoFiles.map((file) => ({ file, category: 'logo' }))
            : []),
          ...(formData.customBoxRequired
            ? formData.boxDesignFiles.map((file) => ({ file, category: 'box_design' }))
            : []),
        ];

        // 각 파일 업로드 (Storage SDK 사용)
        for (const { file, category } of filesToUpload) {
          try {
            // 파일명 안전하게 처리 (한글, 공백 제거)
            const fileExt = file.name.split('.').pop() || '';
            const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `${newReservationNumber}/${category}/${safeFileName}`;

            // Storage SDK로 업로드 시도
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

            // 파일 정보를 적절한 배열에 추가
            const fileInfo = {
              url: publicUrl,
              filename: file.name,
              size: file.size,
              uploaded_at: new Date().toISOString()
            };

            // 카테고리별로 적절한 배열에 추가
            if (category === 'product') {
              applicationPhotos.push(fileInfo);
            } else if (category === 'logo') {
              logoFiles.push(fileInfo);
            } else if (category === 'box_design') {
              boxFiles.push(fileInfo);
            }
          } catch (error) {
            // 로컬 환경에서 Storage 오류 발생 시 API 폴백
            if (error.message?.includes('upstream server')) {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('reservationNumber', newReservationNumber);
              formData.append('category', category);
              formData.append('uploadPurpose', 'application');

              try {
                const uploadResponse = await fetch('/api/files/upload', {
                  method: 'POST',
                  body: formData,
                  credentials: 'include',
                });

                if (uploadResponse.ok) {
                  const result = await uploadResponse.json();
                  uploadedFiles.push(result.data);
                } else {
                  const error = await uploadResponse.json();
                  throw new Error(`파일 업로드 실패: ${error.message}`);
                }
              } catch (apiError) {
                throw apiError;
              }
            }
          }
        }

        // 파일 정보를 market_research_requests 테이블의 컬럼에 저장
        if (applicationPhotos.length > 0 || logoFiles.length > 0 || boxFiles.length > 0) {
          const updateData = {};
          
          if (applicationPhotos.length > 0) {
            updateData.application_photos = applicationPhotos;
          }
          if (logoFiles.length > 0) {
            updateData.logo_files = logoFiles;
          }
          if (boxFiles.length > 0) {
            updateData.box_files = boxFiles;
          }

          const { error: updateError } = await supabase
            .from('market_research_requests')
            .update(updateData)
            .eq('reservation_number', newReservationNumber);

          if (updateError) {
            console.error('Failed to update file columns:', updateError);
            // 파일 업로드는 성공했으므로 계속 진행
          }
        }

        return { applicationPhotos, logoFiles, boxFiles };
      };

      // 파일이 있으면 업로드
      if (
        formData.files.length > 0 ||
        (formData.logoRequired && formData.logoFiles.length > 0) ||
        (formData.customBoxRequired && formData.boxDesignFiles.length > 0)
      ) {
        const uploadedFiles = await uploadFiles();
      }

      // 신청 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = '신청 중 오류가 발생했습니다.';

      if (error.message) {
        errorMessage += '\n' + error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중일 때만 로딩 스피너 표시
  if (authLoading) {
    return (
      <PageContainer title="시장조사 신청 - 두리무역" description="중국 시장 조사를 신청하세요">
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
    <PageContainer title="시장조사 신청 - 두리무역" description="중국 시장 조사를 신청하세요">
      <HpHeader />

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              시장조사 신청
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              중국 시장의 제품 가격, 공장 정보, 최소 주문량 등을 조사해드립니다.
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

                {/* 상세 페이지 URL (선택사항) */}
                <TextField
                  fullWidth
                  label="제품 상세 페이지 URL (선택사항)"
                  value={formData.detailPage}
                  onChange={(e) => setFormData({ ...formData, detailPage: e.target.value })}
                  placeholder="https://taobao.com/product... 또는 https://1688.com/product..."
                  helperText="참고할 제품 페이지가 있다면 URL을 입력해주세요 (선택사항)"
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
                      label="MOQ로 진행"
                    />
                    {formData.moqCheck && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        최소주문수량(MOQ)으로 진행하고 싶습니다
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
                    • 시장조사는 3-5일 정도 소요됩니다.
                    <br />
                    • 조사 결과는 상세한 리포트로 제공됩니다.
                    <br />
                    • 여러 공장의 견적을 비교하여 최적의 조건을 찾아드립니다.
                    <br />• 로고 인쇄와 박스 제작은 선택사항이며, 조사 시 함께 견적을 받아드립니다.
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
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>🎉 신청 완료!</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            시장조사 신청이 성공적으로 접수되었습니다.
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
            • 조사 결과는 3-5일 내에 제공됩니다
            <br />
            • 진행 상황은 주문 내역에서 확인하실 수 있습니다
            <br />• 궁금한 사항은 채팅으로 문의해주세요
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShowSuccessModal(false);
              router.push(`/dashboard/orders/market-research/${reservationNumber}`);
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
