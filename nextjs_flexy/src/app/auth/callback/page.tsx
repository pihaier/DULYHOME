'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

// 실제 콜백 처리 컴포넌트
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // URL 파라미터 확인
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        router.push('/auth/customer/login?error=' + error);
        return;
      }

      // 세션 확인 - setTimeout 제거

      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 약관 동의 여부 확인
        const hasAcceptedTerms = user.user_metadata?.terms_accepted_at;
        const returnUrl = searchParams.get('returnUrl') || '/';

        if (!hasAcceptedTerms) {
          // 처음 가입하는 사용자 - 약관 동의 페이지로
          router.push(`/auth/complete-profile?returnUrl=${encodeURIComponent(returnUrl)}`);
        } else {
          // 기존 사용자 - 원래 가려던 페이지로
          router.push(returnUrl);
        }
      } else {
        // 세션 없음 - 로그인 페이지로
        router.push('/auth/customer/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, supabase]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="h6" color="textSecondary">
        로그인 처리 중...
      </Typography>
    </Box>
  );
}

// Suspense 래퍼
export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="h6" color="textSecondary">
            로그인 처리 중...
          </Typography>
        </Box>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
