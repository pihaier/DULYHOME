'use client';

import React, { useState, useCallback } from 'react';
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
  FormGroup,
  FormControlLabel,
  Checkbox,
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
import CompanyInfoForm from '@/app/components/forms/form-elements/CompanyInfoForm';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';

interface FormData {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  // 공장 정보
  factory_name: string;
  factory_contact_person: string;
  factory_contact_phone: string;
  factory_address: string;
  // 제품 정보
  product_name: string;
  product_description: string;
  // 요청 사항
  request_types: {
    sample: boolean;
    bulk_order: boolean;
    inspection: boolean;
    shipping: boolean;
    other: boolean;
  };
  special_requirements: string;
  files: File[];
}

// 예약번호 생성 함수
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `FC-${year}${month}${day}-${random}`;
}

export default function FactoryContactPage() {
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
    factory_name: '',
    factory_contact_person: '',
    factory_contact_phone: '',
    factory_address: '',
    product_name: '',
    product_description: '',
    request_types: {
      sample: false,
      bulk_order: false,
      inspection: false,
      shipping: false,
      other: false,
    },
    special_requirements: '',
    files: [],
  });


  // 로그인 체크
  React.useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = '/application/factory-contact';
      router.push(`/auth/customer/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, router]);

  // 프로필 정보 자동 로드
  React.useEffect(() => {
    if (userProfile && !formData.company_name) {
      setFormData(prev => ({
        ...prev,
        company_name: userProfile.company_name || '',
        contact_person: userProfile.contact_person || '',
        contact_phone: userProfile.phone || '',
        contact_email: user?.email || '',
      }));
    }
  }, [userProfile, user]);

  // 체크박스 변경 핸들러
  const handleRequestTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      request_types: {
        ...formData.request_types,
        [event.target.name]: event.target.checked,
      },
    });
  };

  // 파일 업로드 핸들러
  const handleFilesChange = useCallback((files: File[]) => {
    setFormData(prev => ({ ...prev, files }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // 유효성 검사
      if (!formData.company_name || !formData.contact_person || !formData.contact_phone || !formData.contact_email) {
        alert('회사 정보를 모두 입력해주세요.');
        setLoading(false);
        return;
      }

      if (!formData.factory_contact_person || !formData.factory_contact_phone) {
        alert('공장 담당자명과 연락처는 필수 입력 사항입니다.');
        setLoading(false);
        return;
      }

      // 사용자 프로필이 없거나 정보가 변경된 경우 자동으로 프로필 업데이트
      if (!userProfile || 
          userProfile.company_name !== formData.company_name ||
          userProfile.contact_person !== formData.contact_person ||
          userProfile.phone !== formData.contact_phone) {
        
        const profileData = {
          user_id: user!.id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.contact_phone,
        };

        if (!userProfile) {
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
            .eq('user_id', user!.id);
        }
      }

      if (!formData.product_name || !formData.product_description) {
        alert('제품 정보를 입력해주세요.');
        setLoading(false);
        return;
      }

      // 요청 타입 배열로 변환
      const requestTypes = Object.keys(formData.request_types)
        .filter(key => formData.request_types[key as keyof typeof formData.request_types]);

      if (requestTypes.length === 0) {
        alert('최소 하나의 요청 유형을 선택해주세요.');
        setLoading(false);
        return;
      }

      // 예약번호 생성
      const newReservationNumber = generateReservationNumber();
      setReservationNumber(newReservationNumber);

      // 파일 업로드
      const uploadedFiles = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${newReservationNumber}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('application-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Storage URL 가져오기 (인증된 사용자만 접근 가능)
          const { data: { publicUrl } } = supabase.storage
            .from('application-files')
            .getPublicUrl(fileName);

          // uploaded_files 테이블에 저장
          const { error: fileError } = await supabase
            .from('uploaded_files')
            .insert({
              reservation_number: newReservationNumber,
              uploaded_by: user!.id,
              original_filename: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: 'document',
              mime_type: file.type,
              upload_purpose: 'application',
              file_url: publicUrl
            });

          if (fileError) throw fileError;

          uploadedFiles.push({
            filename: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }

      // factory_contact_requests 테이블에 저장
      const { error: insertError } = await supabase
        .from('factory_contact_requests')
        .insert({
          reservation_number: newReservationNumber,
          user_id: user!.id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          factory_name: formData.factory_name,
          factory_contact_person: formData.factory_contact_person,
          factory_contact_phone: formData.factory_contact_phone,
          factory_address: formData.factory_address,
          product_name: formData.product_name,
          product_description: formData.product_description,
          request_type: requestTypes,
          special_requirements: formData.special_requirements,
          files: uploadedFiles
        });

      if (insertError) throw insertError;

      setShowSuccessModal(true);
    } catch (error) {
      console.error('신청 처리 중 오류:', error);
      alert('신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/orders/factory-contact');
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="공장컨택 신청" description="이미 알고 있는 공장과의 업무를 진행합니다">
      <HpHeader />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h2" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          공장컨택 신청
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          이미 정보를 알고 있는 공장과 샘플제작, 대량주문, 검품, 배송 등의 업무를 진행합니다.
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          {/* 회사 정보 */}
          <CompanyInfoForm 
            value={{
              company_name: formData.company_name,
              contact_person: formData.contact_person,
              contact_phone: formData.contact_phone,
              contact_email: formData.contact_email,
            }}
            onChange={(info) => setFormData({ ...formData, ...info })}
          />
          

          <Divider sx={{ my: 4 }} />

          {/* 공장 정보 */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            공장 정보
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="공장명 (선택)"
              value={formData.factory_name}
              onChange={(e) => setFormData({ ...formData, factory_name: e.target.value })}
              placeholder="예: 광저우 텍스타일 유한공사"
            />
            <TextField
              fullWidth
              required
              label="공장 담당자명"
              value={formData.factory_contact_person}
              onChange={(e) => setFormData({ ...formData, factory_contact_person: e.target.value })}
              placeholder="담당자 이름을 입력해주세요"
            />
            <TextField
              fullWidth
              required
              label="공장 연락처"
              value={formData.factory_contact_phone}
              onChange={(e) => setFormData({ ...formData, factory_contact_phone: e.target.value })}
              placeholder="공장 전화번호 또는 담당자 휴대폰 번호"
            />
            <TextField
              fullWidth
              label="공장 주소 (선택)"
              value={formData.factory_address}
              onChange={(e) => setFormData({ ...formData, factory_address: e.target.value })}
              multiline
              rows={2}
              placeholder="공장의 상세 주소를 입력해주세요"
            />
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* 제품 정보 */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            제품 정보
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              required
              label="제품명"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="제품 설명"
              multiline
              rows={4}
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
              helperText="제품의 상세 사양, 재질, 크기, 용도 등을 자세히 설명해주세요"
            />
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* 요청 사항 */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            요청 사항
          </Typography>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">요청 유형 (복수 선택 가능)</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.request_types.sample}
                    onChange={handleRequestTypeChange}
                    name="sample"
                  />
                }
                label="샘플 제작"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.request_types.bulk_order}
                    onChange={handleRequestTypeChange}
                    name="bulk_order"
                  />
                }
                label="대량 주문"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.request_types.inspection}
                    onChange={handleRequestTypeChange}
                    name="inspection"
                  />
                }
                label="검품 요청"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.request_types.shipping}
                    onChange={handleRequestTypeChange}
                    name="shipping"
                  />
                }
                label="배송 문의"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.request_types.other}
                    onChange={handleRequestTypeChange}
                    name="other"
                  />
                }
                label="기타"
              />
            </FormGroup>
          </FormControl>

          <TextField
            fullWidth
            label="상세 요청사항"
            multiline
            rows={5}
            value={formData.special_requirements}
            onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
            placeholder="구체적인 요청사항, 일정, 수량, 예산 등을 자세히 작성해주세요"
            sx={{ mb: 3 }}
          />

          {/* 파일 업로드 */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            관련 자료 첨부
          </Typography>
          <FileUpload
            label="관련 자료 첨부"
            description="제품 사진, 도면, 스펙시트 등을 첨부해주세요 (최대 10개, 각 50MB)"
            onFilesChange={handleFilesChange}
            currentFiles={formData.files}
            maxFiles={10}
            maxSize={50 * 1024 * 1024}
          />

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : '신청하기'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onClose={handleCloseModal}>
        <DialogTitle>신청이 완료되었습니다!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            공장컨택 신청이 성공적으로 접수되었습니다.
          </Typography>
          <Typography variant="body2" color="primary">
            예약번호: {reservationNumber}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            담당자가 곧 연락드릴 예정입니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}