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
  Divider,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import PageContainer from '@/app/components/container/PageContainer';

interface UserProfile {
  user_id: string;
  role: string;
  company_name: string;
  company_name_chinese?: string;
  contact_person: string;
  phone: string;
  business_number?: string;
  personal_customs_code?: string;
  department?: string;
  position?: string;
  customer_type?: string;
  provider: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/auth/customer/login');
          return;
        }

        setUser(user);

        // 사용자 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          setError('프로필 정보를 가져오는 중 오류가 발생했습니다.');
          return;
        }

        if (!profileData) {
          // 프로필이 없으면 설정 페이지로 이동
          router.push('/profile/setup');
          return;
        }

        setProfile(profileData);
      } catch (err) {
        setError('프로필 페이지 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, [router, supabase]);

  const handleEditProfile = () => {
    router.push('/profile/setup');
  };

  if (loading) {
    return (
      <PageContainer title="프로필" description="내 프로필 정보">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="프로필" description="내 프로필 정보">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer title="프로필" description="내 프로필 정보">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            프로필 정보가 없습니다. 프로필을 설정해주세요.
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="프로필" description="내 프로필 정보">
      <Box py={4}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">내 프로필</Typography>
            <Button variant="outlined" onClick={handleEditProfile}>
              프로필 수정
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* 기본 정보 */}
            <Box>
              <Typography variant="h6" mb={2} color="primary">
                기본 정보
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <CustomFormLabel>역할</CustomFormLabel>
                  <CustomTextField
                    value={
                      profile.role === 'customer'
                        ? '고객'
                        : profile.role === 'chinese_staff'
                          ? '중국 직원'
                          : profile.role === 'korean_team'
                            ? '한국 팀'
                            : profile.role
                    }
                    fullWidth
                    disabled
                  />
                </Box>

                <Box>
                  <CustomFormLabel>이메일</CustomFormLabel>
                  <CustomTextField value={user?.email || ''} fullWidth disabled />
                </Box>

                <Box>
                  <CustomFormLabel>담당자명</CustomFormLabel>
                  <CustomTextField value={profile.contact_person} fullWidth disabled />
                </Box>

                <Box>
                  <CustomFormLabel>연락처</CustomFormLabel>
                  <CustomTextField value={profile.phone} fullWidth disabled />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* 회사 정보 */}
            <Box>
              <Typography variant="h6" mb={2} color="primary">
                회사 정보
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <CustomFormLabel>회사명</CustomFormLabel>
                  <CustomTextField value={profile.company_name} fullWidth disabled />
                </Box>

                {profile.company_name_chinese && (
                  <Box>
                    <CustomFormLabel>회사명 (중국어)</CustomFormLabel>
                    <CustomTextField value={profile.company_name_chinese} fullWidth disabled />
                  </Box>
                )}

                {profile.business_number && (
                  <Box>
                    <CustomFormLabel>사업자등록번호</CustomFormLabel>
                    <CustomTextField value={profile.business_number} fullWidth disabled />
                  </Box>
                )}

                {profile.personal_customs_code && (
                  <Box>
                    <CustomFormLabel>통관고유번호</CustomFormLabel>
                    <CustomTextField value={profile.personal_customs_code} fullWidth disabled />
                  </Box>
                )}
              </Stack>
            </Box>

            {/* 직원 정보 (직원인 경우만) */}
            {(profile.role === 'chinese_staff' || profile.role === 'korean_team') && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" mb={2} color="primary">
                    직원 정보
                  </Typography>
                  <Stack spacing={2}>
                    {profile.department && (
                      <Box>
                        <CustomFormLabel>부서</CustomFormLabel>
                        <CustomTextField value={profile.department} fullWidth disabled />
                      </Box>
                    )}

                    {profile.position && (
                      <Box>
                        <CustomFormLabel>직급</CustomFormLabel>
                        <CustomTextField value={profile.position} fullWidth disabled />
                      </Box>
                    )}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />

            {/* 계정 정보 */}
            <Box>
              <Typography variant="h6" mb={2} color="primary">
                계정 정보
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <CustomFormLabel>로그인 방식</CustomFormLabel>
                  <CustomTextField
                    value={
                      profile.provider === 'email'
                        ? '이메일/비밀번호'
                        : profile.provider === 'google'
                          ? 'Google OAuth'
                          : profile.provider === 'kakao'
                            ? 'Kakao OAuth'
                            : profile.provider
                    }
                    fullWidth
                    disabled
                  />
                </Box>

                <Box>
                  <CustomFormLabel>가입일</CustomFormLabel>
                  <CustomTextField
                    value={new Date(profile.created_at).toLocaleDateString('ko-KR')}
                    fullWidth
                    disabled
                  />
                </Box>

                {profile.updated_at !== profile.created_at && (
                  <Box>
                    <CustomFormLabel>최종 수정일</CustomFormLabel>
                    <CustomTextField
                      value={new Date(profile.updated_at).toLocaleDateString('ko-KR')}
                      fullWidth
                      disabled
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </PageContainer>
  );
}
