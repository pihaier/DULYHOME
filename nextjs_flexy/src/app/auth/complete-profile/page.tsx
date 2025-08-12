"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  Link,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/app/components/container/PageContainer";
import Logo from "@/app/dashboard/layout/shared/logo/Logo";

export default function CompleteProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    terms_accepted: false,
    privacy_accepted: false,
    marketing_accepted: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 이미 약관 동의했으면 리다이렉트
      if (user?.user_metadata?.terms_accepted_at) {
        const returnUrl = searchParams.get('returnUrl');
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : '/';
      }
    };
    
    checkSession();
  }, [supabase, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 유효성 검사
    if (!formData.terms_accepted || !formData.privacy_accepted) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      // API 라우트를 통해 약관 동의 처리
      const response = await fetch('/api/auth/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          terms_accepted: formData.terms_accepted,
          privacy_accepted: formData.privacy_accepted,
          marketing_accepted: formData.marketing_accepted,
          returnUrl: searchParams.get('returnUrl') || '/'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '약관 동의 처리 중 오류가 발생했습니다.');
        return;
      }

      // 성공 - 리다이렉트
      window.location.href = result.redirectUrl;
      
    } catch (err) {
      console.error('Terms update error:', err);
      setError('약관 동의 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="약관 동의" description="서비스 이용을 위한 약관 동의">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" justifyContent="center" mb={4}>
              <Logo />
            </Box>
            
            <Card elevation={9} sx={{ p: 4 }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} gutterBottom align="center">
                  서비스 이용 약관 동의
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                <Typography variant="body1" color="text.secondary" align="center" mb={4}>
                  환영합니다!<br/>
                  서비스 이용을 위해 약관에 동의해주세요.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      backgroundColor: 'grey.50',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2
                    }}
                  >
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          이용 약관
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const allChecked = formData.terms_accepted && formData.privacy_accepted;
                            setFormData({
                              terms_accepted: !allChecked,
                              privacy_accepted: !allChecked,
                              marketing_accepted: !allChecked
                            });
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
                                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                                disabled={loading}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                <Box component="span" fontWeight="bold" color="error.main">*</Box>
                                {' '}이용약관 동의 (필수)
                              </Typography>
                            }
                          />
                          <Link 
                            href="/legal/terms" 
                            target="_blank" 
                            underline="hover"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            보기
                          </Link>
                        </Box>
                        
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.privacy_accepted}
                                onChange={(e) => setFormData({ ...formData, privacy_accepted: e.target.checked })}
                                disabled={loading}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                <Box component="span" fontWeight="bold" color="error.main">*</Box>
                                {' '}개인정보처리방침 동의 (필수)
                              </Typography>
                            }
                          />
                          <Link 
                            href="/legal/privacy" 
                            target="_blank" 
                            underline="hover"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            보기
                          </Link>
                        </Box>
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.marketing_accepted}
                              onChange={(e) => setFormData({ ...formData, marketing_accepted: e.target.checked })}
                              disabled={loading}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              마케팅 정보 수신 동의 (선택)
                            </Typography>
                          }
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 4, mb: 2, py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      '동의하고 시작하기'
                    )}
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  약관에 동의하시면 두리무역 ERP 시스템의 모든 서비스를 이용하실 수 있습니다.
                </Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    <strong>개인정보 제3자 제공 안내:</strong> 서비스 제공을 위해 OpenAI(GPT-4 번역), 
                    AWS(클라우드 인프라), Supabase(데이터베이스), 중국 현지 협력사 등에 필요한 정보가 
                    제공됩니다. 자세한 내용은 개인정보처리방침을 확인해주세요.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </PageContainer>
  );
}