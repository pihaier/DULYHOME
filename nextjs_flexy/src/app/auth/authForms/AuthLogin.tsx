'use client';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginType } from '@/app/dashboard/types/auth/auth';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import AuthSocialButtons from './AuthSocialButtons';

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // URL 파라미터에서 메시지 처리
  useEffect(() => {
    const message = searchParams.get('message');
    const emailParam = searchParams.get('email');

    if (message === 'signup_success') {
      setSuccessMessage('회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.');
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    } else if (message === 'auto_confirmed') {
      setError('회원가입이 자동으로 완료되었습니다. Supabase 설정을 확인해주세요.');
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    } else if (message === 'signup_email_sent') {
      setSuccessMessage('인증 메일이 발송되었습니다! 이메일을 확인해주세요.');
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 에러 메시지 한글화
        let koreanError = error.message;
        if (error.message.includes('Invalid login credentials')) {
          koreanError = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          koreanError = '이메일 인증이 완료되지 않았습니다.';
        } else if (error.message.includes('Too many requests')) {
          koreanError = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
        setError(koreanError);
        return;
      }

      if (data.user) {
        // 세션이 제대로 설정될 때까지 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 로그인 성공 - 리다이렉트 처리
        const redirectTo = searchParams.get('redirectTo');
        const returnUrl = searchParams.get('returnUrl');

        if (redirectTo) {
          // middleware에서 보낸 redirectTo 파라미터 우선
          router.push(decodeURIComponent(redirectTo));
        } else if (returnUrl) {
          // 기존 returnUrl 파라미터
          router.push(decodeURIComponent(returnUrl));
        } else {
          // 이전 페이지가 없으면 대시보드로 이동
          router.push('/dashboard');
        }

        // 페이지 새로고침을 강제로 수행하여 세션 업데이트
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    setError('');
    setLoading(true);

    try {
      const redirectTo = searchParams.get('redirectTo');
      const returnUrl = searchParams.get('returnUrl');
      const finalReturnUrl = redirectTo || returnUrl || '/';

      const callbackUrl = new URL('/api/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('returnUrl', finalReturnUrl);

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
      // OAuth는 리다이렉트되므로 loading을 false로 설정하지 않음
    } catch (err) {
      console.error('OAuth login error:', err);
      setError('OAuth 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

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

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <AuthSocialButtons
        title="간편 로그인"
        onGoogleClick={() => handleOAuthLogin('google')}
        onKakaoClick={() => handleOAuthLogin('kakao')}
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
            또는 이메일로 로그인
          </Typography>
        </Divider>
      </Box>

      <Box component="form" onSubmit={handleLogin}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="email">이메일 주소</CustomFormLabel>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">비밀번호</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </Box>
          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="로그인 상태 유지"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/auth/auth1/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              비밀번호 찾기
            </Typography>
          </Stack>
        </Stack>

        <Box mt={2}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
          </Button>
        </Box>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthLogin;
