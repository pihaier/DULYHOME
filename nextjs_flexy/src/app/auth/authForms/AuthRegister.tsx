'use client';
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { Stack } from '@mui/system';
import { registerType } from '@/app/dashboard/types/auth/auth';
import AuthSocialButtons from './AuthSocialButtons';

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    terms_accepted: false,
    privacy_accepted: false,
    marketing_accepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [otp, setOtp] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.terms_accepted || !formData.privacy_accepted) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      // Supabase 공식 signUp 사용
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            terms_accepted_at: new Date().toISOString(),
            privacy_accepted_at: new Date().toISOString(),
            marketing_accepted_at: formData.marketing_accepted ? new Date().toISOString() : null,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // 회원가입 성공
      if (data.user) {
        // 세션이 있으면 자동 확인된 것
        if (data.session) {
          // 강제 로그아웃
          await supabase.auth.signOut();
          alert('회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.');
          router.push(
            '/auth/auth1/login?message=signup_success&email=' + encodeURIComponent(formData.email)
          );
        } else {
          // 정상적으로 이메일 인증 대기 상태 - OTP 입력 화면으로 이동
          setStep('verify');
          alert('인증번호가 이메일로 발송되었습니다. 확인해주세요.');
        }
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError('이미 등록된 이메일입니다.');
      } else {
        setError(err.message || '회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // OTP 확인 (signup 타입 사용)
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: 'signup', // signup 타입으로 변경
      });

      if (error) {
        setError('인증번호가 올바르지 않습니다.');
        return;
      }

      if (data.user && data.session) {
        // 회원가입 완료 - 홈으로 이동
        router.push('/');
      }
    } catch (err) {
      setError('인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'kakao') => {
    setError('');
    setLoading(true);

    try {
      const returnUrl = searchParams.get('returnUrl') || '/';
      const callbackUrl = new URL('/api/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('returnUrl', returnUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('OAuth 회원가입 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // OTP 입력 화면
  if (step === 'verify') {
    return (
      <>
        <Typography fontWeight="700" variant="h3" mb={1}>
          이메일 인증
        </Typography>

        <Typography color="textSecondary" variant="h6" fontWeight={400} mb={3}>
          {formData.email}로 전송된 6자리 인증번호를 입력해주세요.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <CustomFormLabel htmlFor="otp">인증번호</CustomFormLabel>
            <CustomTextField
              id="otp"
              variant="outlined"
              fullWidth
              placeholder="6자리 숫자 입력"
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              disabled={loading}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' },
              }}
            />
          </Box>

          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={handleOtpVerify}
            disabled={loading || otp.length !== 6}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '인증 완료'}
          </Button>

          <Typography variant="body2" color="textSecondary" align="center">
            이메일을 받지 못하셨나요? 스팸함을 확인해주세요.
          </Typography>

          <Button
            variant="text"
            fullWidth
            onClick={() => {
              setStep('register');
              setOtp('');
              setError('');
            }}
          >
            이전 단계로
          </Button>
        </Stack>
      </>
    );
  }

  // 회원가입 폼
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AuthSocialButtons
        title="간편 회원가입"
        onGoogleClick={() => handleOAuthSignUp('google')}
        onKakaoClick={() => handleOAuthSignUp('kakao')}
        disabled={loading}
      />

      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            또는 이메일로 회원가입
          </Typography>
        </Divider>
      </Box>

      <Box component="form" onSubmit={handleEmailSignUp}>
        <Stack spacing={2} mb={3}>
          <Box>
            <CustomFormLabel htmlFor="email">이메일 주소 *</CustomFormLabel>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              placeholder="example@company.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('email', e.target.value)
              }
              disabled={loading}
              required
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="password">비밀번호 *</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="6자 이상 입력"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('password', e.target.value)
              }
              disabled={loading}
              required
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="confirmPassword">비밀번호 확인 *</CustomFormLabel>
            <CustomTextField
              id="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              disabled={loading}
              required
            />
          </Box>
        </Stack>

        {/* 약관 동의 */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mt: 3,
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
                  const allChecked = formData.terms_accepted && formData.privacy_accepted;
                  handleInputChange('terms_accepted', !allChecked);
                  handleInputChange('privacy_accepted', !allChecked);
                  handleInputChange('marketing_accepted', !allChecked);
                }}
                disabled={loading}
              >
                전체 동의
              </Button>
            </Box>

            <Stack spacing={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.terms_accepted}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('terms_accepted', e.target.checked)
                      }
                      disabled={loading}
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
                <MuiLink
                  href="/legal/terms"
                  target="_blank"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  보기
                </MuiLink>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.privacy_accepted}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('privacy_accepted', e.target.checked)
                      }
                      disabled={loading}
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
                <MuiLink
                  href="/legal/privacy"
                  target="_blank"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  보기
                </MuiLink>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.marketing_accepted}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('marketing_accepted', e.target.checked)
                      }
                      disabled={loading}
                    />
                  }
                  label={<Typography variant="body2">마케팅 정보 수신 동의 (선택)</Typography>}
                />
                <MuiLink
                  href="/legal/marketing"
                  target="_blank"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  보기
                </MuiLink>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Button
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
