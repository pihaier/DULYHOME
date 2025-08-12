import React, { useState, useEffect } from 'react';
import { CardContent, Grid, Typography, MenuItem, Box, Avatar, Button, Stack, Alert } from '@mui/material';
import BlankCard from '@/app/components/shared/BlankCard';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import { useUser } from '@/lib/context/GlobalContext';

const ProfileInfoTab = () => {
  const { user, userProfile, supabase, loading: contextLoading, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {

    
    // Context가 아직 로딩 중이면 대기
    if (contextLoading) {
      return;
    }
    

    
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        company_name: userProfile.company_name || '',
        contact_person: userProfile.contact_person || '',
        phone: userProfile.phone || '',
        email: userProfile.email || user.email || ''
      }));
      setLoading(false);
    } else if (user && !userProfile) {
      // 유저는 있지만 프로필이 없는 경우 (신규 사용자)
      // 프로필이 없으면 자동으로 생성 (SDK 직접 사용)
      const createProfile = async () => {
        
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              company_name: '',
              contact_person: '',
              phone: '',
              role: 'customer',
              approval_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating profile:', error);
          } else {
            // GlobalContext의 refreshUser 호출
            await refreshUser();
          }
        } catch (error) {
          console.error('Exception creating profile:', error);
        }
      };
      
      createProfile();
      
      setFormData(prev => ({
        ...prev,
        email: user.email || ''  // 초기값은 auth.users.email 사용
      }));
      setLoading(false);
    } else if (!user && !contextLoading) {
      // 로그인이 안 되어있는 경우
      setLoading(false);
    }
  }, [user, userProfile, contextLoading, supabase]);

  const handleSave = async () => {
    if (!user || !supabase) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      // 프로필 업데이트 (SDK 직접 사용)
      const updateData = {
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email,  // 연락용 이메일 추가
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || '프로필 업데이트에 실패했습니다.');
      }

      // 비밀번호 변경 처리
      if (formData.new_password && formData.new_password === formData.confirm_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.new_password
        });

        if (passwordError) {
          throw new Error('비밀번호 변경에 실패했습니다.');
        }
      }

      setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
      
      // GlobalContext 업데이트
      await refreshUser();
      
      // 비밀번호 필드 초기화
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.message || '업데이트 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box>로딩 중...</Box>;

  return (
    <>
      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)} 
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}
      <Grid container spacing={3}>
      {/* 비밀번호 변경 */}
      <Grid size={12}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              비밀번호 변경
            </Typography>
            <Typography color="textSecondary" mb={3}>
              비밀번호를 변경하려면 여기에서 확인하세요
            </Typography>
            <form>
              <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-cpwd">
                현재 비밀번호
              </CustomFormLabel>
              <CustomTextField
                id="text-cpwd"
                value={formData.current_password}
                onChange={(e: any) => setFormData({ ...formData, current_password: e.target.value })}
                variant="outlined"
                fullWidth
                type="password"

              />
              
              <CustomFormLabel htmlFor="text-npwd">새 비밀번호</CustomFormLabel>
              <CustomTextField
                id="text-npwd"
                value={formData.new_password}
                onChange={(e: any) => setFormData({ ...formData, new_password: e.target.value })}
                variant="outlined"
                fullWidth
                type="password"
                inputProps={{ autoComplete: "new-password" }}
              />
              
              <CustomFormLabel htmlFor="text-conpwd">비밀번호 확인</CustomFormLabel>
              <CustomTextField
                id="text-conpwd"
                value={formData.confirm_password}
                onChange={(e: any) => setFormData({ ...formData, confirm_password: e.target.value })}
                variant="outlined"
                fullWidth
                type="password"
                inputProps={{ autoComplete: "new-password" }}
              />
            </form>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* 기본 정보 수정 */}
      <Grid size={12}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              기본 정보
            </Typography>
            <Typography color="textSecondary" mb={3}>
              기본 정보를 변경하려면 여기에서 편집하고 저장하세요
            </Typography>
            <form>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-company">
                    회사명
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-company"
                    value={formData.company_name}
                    onChange={(e: any) => setFormData({ ...formData, company_name: e.target.value })}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-contact-person">
                    담당자명
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-contact-person"
                    value={formData.contact_person}
                    onChange={(e: any) => setFormData({ ...formData, contact_person: e.target.value })}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-phone">
                    연락처
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-phone"
                    value={formData.phone}
                    onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-email">
                    연락용 이메일
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-email"
                    value={formData.email}
                    onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                    variant="outlined"
                    fullWidth
                    type="email"
                    helperText="알림 및 연락을 받을 이메일 주소"
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </BlankCard>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
          <Button 
            size="large" 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
          <Button size="large" variant="text" color="error">
            취소
          </Button>
        </Stack>
      </Grid>
    </Grid>
    </>
  );
};

export default ProfileInfoTab;