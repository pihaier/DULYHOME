'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import PageContainer from '@/app/components/container/PageContainer';

interface ProfileSetupData {
  role: string;
  company_name: string;
  company_name_chinese: string;
  contact_person: string;
  phone: string;
  business_number: string;
  personal_customs_code: string;
  department: string;
  position: string;
  customer_type: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_accepted: boolean;
}

export default function ProfileSetup() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const [profileData, setProfileData] = useState<ProfileSetupData>({
    role: 'customer', // erro.md: 고객 로그인은 무조건 고객임
    company_name: '',
    company_name_chinese: '',
    contact_person: '',
    phone: '',
    business_number: '',
    personal_customs_code: '',
    department: '',
    position: '',
    customer_type: '',
    terms_accepted: false,
    privacy_accepted: false,
    marketing_accepted: false,
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // erro.md 요구사항: 로그인 성공 시 이전 페이지로 돌아가기
        // 현재 페이지를 returnUrl로 전달
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/auth/customer/login?returnUrl=${currentUrl}`);
        return;
      }
      setUser(user);

      // erro.md: OAuth 사용자 감지 - 고객 로그인은 무조건 고객임
      const isOAuth = user.app_metadata.provider !== 'email';
      setIsOAuthUser(isOAuth);

      // OAuth 로그인인 경우 기본 정보 설정 및 역할을 customer로 고정
      if (isOAuth) {
        setProfileData((prev) => ({
          ...prev,
          role: 'customer', // OAuth는 무조건 고객
          contact_person: user.user_metadata.full_name || user.email?.split('@')[0] || '',
        }));
      }
    };

    getUser();
  }, [router, supabase]);

  const handleInputChange = (field: keyof ProfileSetupData, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 필수 약관 동의 체크
    if (!profileData.terms_accepted || !profileData.privacy_accepted) {
      setError('필수 약관에 동의해주세요.');
      setLoading(false);
      return;
    }

    // 역할별 필수 필드 체크
    const requiredFields = ['role', 'company_name', 'contact_person', 'phone'];
    const missingFields = requiredFields.filter(
      (field) => !profileData[field as keyof ProfileSetupData]
    );

    if (missingFields.length > 0) {
      setError('필수 필드를 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // erro.md: 기존 프로필 존재 여부 확인하고 업데이트 처리
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id, company_name, phone')
        .eq('user_id', user.id)
        .single();

      let operation = 'insert';
      let result;

      if (existingProfile) {
        operation = 'update';

        // 기존 프로필 업데이트
        const updateData = {
          role: isOAuthUser ? 'customer' : profileData.role,
          company_name: profileData.company_name.trim(),
          company_name_chinese: profileData.company_name_chinese?.trim() || null,
          contact_person: profileData.contact_person.trim(),
          phone: profileData.phone.trim(),
          business_number: profileData.business_number?.trim() || null,
          personal_customs_code: profileData.personal_customs_code?.trim() || null,
          department: profileData.department?.trim() || null,
          position: profileData.position?.trim() || null,
          customer_type: profileData.customer_type?.trim() || null,
          avatar_url: user.user_metadata.avatar_url || null,
          full_name: user.user_metadata.full_name || profileData.contact_person.trim(),
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
          marketing_accepted_at: profileData.marketing_accepted ? new Date().toISOString() : null,
          approval_status: isOAuthUser || profileData.role === 'customer' ? 'approved' : 'pending',
          language_preference: 'ko',
          notification_enabled: true,
          updated_at: new Date().toISOString(),
        };

        result = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select();
      } else {
        // 새 프로필 생성
        const profileInsertData = {
          user_id: user.id,
          role: isOAuthUser ? 'customer' : profileData.role, // OAuth는 강제로 customer
          company_name: profileData.company_name.trim(),
          company_name_chinese: profileData.company_name_chinese?.trim() || null,
          contact_person: profileData.contact_person.trim(),
          phone: profileData.phone.trim(),
          business_number: profileData.business_number?.trim() || null,
          personal_customs_code: profileData.personal_customs_code?.trim() || null,
          department: profileData.department?.trim() || null,
          position: profileData.position?.trim() || null,
          customer_type: profileData.customer_type?.trim() || null,
          provider: user.app_metadata.provider || 'email',
          provider_id: user.id,
          avatar_url: user.user_metadata.avatar_url || null,
          full_name: user.user_metadata.full_name || profileData.contact_person.trim(),
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
          marketing_accepted_at: profileData.marketing_accepted ? new Date().toISOString() : null,
          approval_status: isOAuthUser || profileData.role === 'customer' ? 'approved' : 'pending',
          language_preference: 'ko',
          notification_enabled: true,
        };

        result = await supabase.from('user_profiles').insert(profileInsertData).select();
      }

      if (result.error) {
        // erro.md: 상세한 에러 정보 제공
        setError(
          `프로필 ${operation === 'insert' ? '생성' : '업데이트'} 중 오류가 발생했습니다: ${result.error.message || '알 수 없는 오류'}`
        );
        return;
      }

      // erro.md: OAuth 고객은 무조건 고객이므로 즉시 승인
      if (isOAuthUser || profileData.role === 'customer') {
        // erro.md 요구사항: 이전 페이지로 돌아가기, 대시보드로 가면 안됨
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          router.push('/?message=profile_setup_complete');
        }
      } else {
        // 직원 계정은 직원 로그인 페이지로
        router.push('/staff/login?message=approval_pending');
      }
    } catch (err) {
      setError('프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="프로필 설정" description="계정 프로필을 설정해주세요">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" py={4}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
          <Typography variant="h4" mb={3} textAlign="center">
            프로필 설정
          </Typography>

          <Typography variant="body2" color="textSecondary" mb={3} textAlign="center">
            서비스 이용을 위해 프로필 정보를 입력해주세요.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* 역할 선택 - erro.md: OAuth 사용자는 UI 완전히 숨김, API에서 자동 처리 */}
              {!isOAuthUser && (
                <Box>
                  <CustomFormLabel>역할 *</CustomFormLabel>
                  <CustomSelect
                    value={profileData.role}
                    onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                      handleInputChange('role', e.target.value as string)
                    }
                    fullWidth
                    required
                  >
                    <MenuItem value="customer">고객</MenuItem>
                    <MenuItem value="chinese_staff">중국 직원</MenuItem>
                    <MenuItem value="korean_team">한국 팀</MenuItem>
                  </CustomSelect>
                </Box>
              )}

              {/* 회사명 */}
              <Box>
                <CustomFormLabel>회사명 *</CustomFormLabel>
                <CustomTextField
                  value={profileData.company_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('company_name', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Box>

              {/* 중국어 회사명 (중국 직원만) */}
              {profileData.role === 'chinese_staff' && (
                <Box>
                  <CustomFormLabel>회사명 (중국어)</CustomFormLabel>
                  <CustomTextField
                    value={profileData.company_name_chinese}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('company_name_chinese', e.target.value)
                    }
                    fullWidth
                  />
                </Box>
              )}

              {/* 담당자명 */}
              <Box>
                <CustomFormLabel>담당자명 *</CustomFormLabel>
                <CustomTextField
                  value={profileData.contact_person}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('contact_person', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Box>

              {/* 연락처 */}
              <Box>
                <CustomFormLabel>연락처 *</CustomFormLabel>
                <CustomTextField
                  value={profileData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('phone', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Box>

              {/* erro.md 요구사항: 사업자등록번호, 통관고유번호, 고객 유형은 여기서 받지 않음 */}

              {/* 직원 전용 필드 */}
              {(profileData.role === 'chinese_staff' || profileData.role === 'korean_team') && (
                <>
                  <Box>
                    <CustomFormLabel>부서</CustomFormLabel>
                    <CustomTextField
                      value={profileData.department}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('department', e.target.value)
                      }
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <CustomFormLabel>직급</CustomFormLabel>
                    <CustomTextField
                      value={profileData.position}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('position', e.target.value)
                      }
                      fullWidth
                    />
                  </Box>
                </>
              )}

              {/* erro.md 요구사항: 전체 박스로 둘러서 전체 동의 체크 할 수 있게 */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  backgroundColor: 'grey.50',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                }}
              >
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      약관 동의
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const allChecked =
                          profileData.terms_accepted && profileData.privacy_accepted;
                        handleInputChange('terms_accepted', !allChecked);
                        handleInputChange('privacy_accepted', !allChecked);
                        handleInputChange('marketing_accepted', !allChecked);
                      }}
                    >
                      전체 동의
                    </Button>
                  </Box>

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={profileData.terms_accepted}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('terms_accepted', e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          <Box component="span" fontWeight="bold" color="error.main">
                            *
                          </Box>{' '}
                          이용약관 동의 (필수)
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={profileData.privacy_accepted}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('privacy_accepted', e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          <Box component="span" fontWeight="bold" color="error.main">
                            *
                          </Box>{' '}
                          개인정보처리방침 동의 (필수)
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={profileData.marketing_accepted}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('marketing_accepted', e.target.checked)
                          }
                        />
                      }
                      label={<Typography variant="body2">마케팅 정보 수신 동의 (선택)</Typography>}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '프로필 설정 완료'}
              </Button>

              {profileData.role !== 'customer' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  직원 계정은 관리자 승인 후 이용 가능합니다.
                </Alert>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
