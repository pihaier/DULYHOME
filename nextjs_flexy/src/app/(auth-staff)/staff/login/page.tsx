'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Stack,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import AuthLogin from '@/app/auth/authForms/AuthLogin';
import Image from 'next/image';
import { useUser } from '@/lib/context/GlobalContext';
import { useRouter } from 'next/navigation';
import { Language as LanguageIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

export default function StaffLogin() {
  const { user, userProfile } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [language, setLanguage] = useState<'ko' | 'zh'>('ko');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contact_person: '',
    phone: '',
    role: 'korean_team' as 'korean_team' | 'chinese_staff',
    department: '',
  });

  // 이미 로그인한 직원은 대시보드로 리다이렉트
  useEffect(() => {
    if (user && userProfile) {
      if (
        userProfile.role === 'korean_team' ||
        userProfile.role === 'chinese_staff' ||
        userProfile.role === 'admin'
      ) {
        router.push('/staff');
      }
    }
  }, [user, userProfile, router]);

  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: 'ko' | 'zh' | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const getText = (ko: string, zh: string) => (language === 'ko' ? ko : zh);

  const handleRegisterSubmit = async () => {
    setRegisterError('');

    // 유효성 검사
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError(getText('비밀번호가 일치하지 않습니다.', '密码不匹配'));
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError(getText('비밀번호는 최소 6자 이상이어야 합니다.', '密码至少需要6个字符'));
      return;
    }

    setRegisterLoading(true);

    try {
      // 1. 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (authError) throw authError;

      // 2. 프로필 생성
      if (authData.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          user_id: authData.user.id,
          email: registerForm.email,
          company_name: '두리무역', // 자동으로 두리무역 설정
          contact_person: registerForm.contact_person,
          phone: registerForm.phone,
          role: registerForm.role,
          department: registerForm.department,
          approval_status: 'pending', // 직원은 승인 대기
          language_preference: language,
        });

        if (profileError) throw profileError;
      }

      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterModalOpen(false);
        setRegisterSuccess(false);
        setRegisterForm({
          email: '',
          password: '',
          confirmPassword: '',
          contact_person: '',
          phone: '',
          role: 'korean_team',
          department: '',
        });
      }, 3000);
    } catch (error: any) {
      setRegisterError(error.message || getText('등록 중 오류가 발생했습니다.', '注册时发生错误'));
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <PageContainer
      title={getText('직원 로그인', '员工登录')}
      description={getText('두리무역 직원 로그인 페이지', '杜立贸易员工登录页面')}
    >
      <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.15',
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8,
          }}
        >
          <Box position="relative">
            <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
              <Logo />
              {/* 언어 전환 버튼 - 크게 */}
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={handleLanguageChange}
                aria-label="language selection"
                size="large"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                    fontSize: '1.1rem',
                    fontWeight: 600,
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
                <ToggleButton value="ko" aria-label="korean">
                  🇰🇷 한국어
                </ToggleButton>
                <ToggleButton value="zh" aria-label="chinese">
                  🇨🇳 中文
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 120px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Image
                    src={'/images/duly-logo.png'}
                    alt="Duly Trading Logo"
                    width={250}
                    height={250}
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      mt: 3,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    {getText('두리무역', '杜立贸易')}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {getText('ERP 시스템', 'ERP 系统')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 2,
                      color: 'text.secondary',
                      fontSize: '1.1rem',
                    }}
                  >
                    {getText('한중 무역의 든든한 파트너', '韩中贸易的可靠伙伴')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size={{
            xs: 12,
            sm: 12,
            lg: 5,
            xl: 4,
          }}
        >
          <Box p={4}>
            <AuthLogin
              title={getText('직원 로그인', '员工登录')}
              staffLogin={true}
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  {getText('두리무역 직원 전용 로그인', '杜立贸易员工专用登录')}
                </Typography>
              }
              subtitle={
                <Stack spacing={2} mt={3}>
                  <Stack direction="row" spacing={1}>
                    <Typography color="textSecondary" variant="body2">
                      {getText('계정이 없으신가요?', '没有账号？')}
                    </Typography>
                    <Typography
                      component="span"
                      fontWeight="500"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        cursor: 'pointer',
                      }}
                      onClick={() => setRegisterModalOpen(true)}
                    >
                      {getText('직원 등록 요청', '申请员工注册')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography color="textSecondary" variant="body2">
                      {getText('고객이신가요?', '您是客户吗？')}
                    </Typography>
                    <Typography
                      component={Link}
                      href="/auth/customer/login"
                      fontWeight="500"
                      sx={{
                        textDecoration: 'none',
                        color: 'secondary.main',
                      }}
                    >
                      {getText('고객 로그인으로 이동', '前往客户登录')}
                    </Typography>
                  </Stack>
                </Stack>
              }
              loginButtonText={getText('로그인', '登录')}
              emailLabel={getText('이메일', '电子邮箱')}
              passwordLabel={getText('비밀번호', '密码')}
              rememberMeLabel={getText('로그인 유지', '保持登录')}
              hideForgotPassword={true}
            />
          </Box>
        </Grid>
      </Grid>

      {/* 직원 등록 요청 모달 */}
      <Dialog
        open={registerModalOpen}
        onClose={() => !registerLoading && setRegisterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">{getText('직원 등록 요청', '申请员工注册')}</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {registerSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              {getText(
                '등록 요청이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.',
                '注册申请已完成。管理员批准后即可登录。'
              )}
            </Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {registerError && <Alert severity="error">{registerError}</Alert>}

              <TextField
                label={getText('이메일', '电子邮箱')}
                type="email"
                fullWidth
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                disabled={registerLoading}
                required
              />

              <TextField
                label={getText('비밀번호', '密码')}
                type="password"
                fullWidth
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                disabled={registerLoading}
                required
                helperText={getText('최소 6자 이상', '至少6个字符')}
              />

              <TextField
                label={getText('비밀번호 확인', '确认密码')}
                type="password"
                fullWidth
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                }
                disabled={registerLoading}
                required
              />

              <TextField
                label={getText('담당자명', '负责人姓名')}
                fullWidth
                value={registerForm.contact_person}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, contact_person: e.target.value })
                }
                disabled={registerLoading}
                required
              />

              <TextField
                label={getText('연락처', '联系电话')}
                fullWidth
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                disabled={registerLoading}
                required
                placeholder="010-1234-5678"
              />

              <FormControl fullWidth required>
                <InputLabel>{getText('직원 구분', '员工类型')}</InputLabel>
                <Select
                  value={registerForm.role}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, role: e.target.value as any })
                  }
                  disabled={registerLoading}
                  label={getText('직원 구분', '员工类型')}
                >
                  <MenuItem value="korean_team">{getText('한국팀', '韩国团队')}</MenuItem>
                  <MenuItem value="chinese_staff">{getText('중국 직원', '中国员工')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label={getText('부서', '部门')}
                fullWidth
                value={registerForm.department}
                onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                disabled={registerLoading}
                placeholder={getText('예: 무역팀, 영업팀', '例：贸易部、销售部')}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setRegisterModalOpen(false);
              setRegisterError('');
              setRegisterSuccess(false);
            }}
            disabled={registerLoading}
          >
            {getText('취소', '取消')}
          </Button>
          {!registerSuccess && (
            <Button
              onClick={handleRegisterSubmit}
              variant="contained"
              disabled={
                registerLoading ||
                !registerForm.email ||
                !registerForm.password ||
                !registerForm.confirmPassword ||
                !registerForm.contact_person ||
                !registerForm.phone
              }
            >
              {registerLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                getText('등록 요청', '提交申请')
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
