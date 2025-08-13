import React, { useState, useEffect } from 'react';
import { CardContent, Grid, Typography, Box, Button, Stack, Alert } from '@mui/material';
import BlankCard from '@/app/components/shared/BlankCard';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { useUser } from '@/lib/context/GlobalContext';

const TaxInvoiceTab = () => {
  const { user, userProfile, supabase } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [taxData, setTaxData] = useState({
    tax_company_name: '',
    tax_registration_number: '',
    tax_representative: '',
    tax_address: '',
    tax_business_type: '',
    tax_business_item: '',
    tax_email: '',
    tax_phone: '',
    tax_fax: '',
  });

  useEffect(() => {
    if (user && userProfile) {
      // user_profiles 테이블에서 세금계산서 정보 가져오기
      setTaxData({
        tax_company_name: userProfile.tax_company_name || userProfile.company_name || '',
        tax_registration_number:
          userProfile.tax_registration_number || userProfile.business_number || '',
        tax_representative: userProfile.tax_representative || '',
        tax_address: userProfile.tax_address || '',
        tax_business_type: userProfile.tax_business_type || '',
        tax_business_item: userProfile.tax_business_item || '',
        tax_email: userProfile.tax_email || '',
        tax_phone: userProfile.tax_phone || '',
        tax_fax: userProfile.tax_fax || '',
      });
      setLoading(false);
    }
  }, [user, userProfile]);

  const handleSave = async () => {
    if (!user || !supabase) return;

    setSaving(true);
    setMessage(null);

    try {
      // user_profiles 테이블 업데이트
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...taxData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '세금계산서 정보가 업데이트되었습니다.' });
    } catch (error: any) {
      console.error('Error saving tax info:', error);
      setMessage({ type: 'error', text: error.message || '업데이트 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box>로딩 중...</Box>;

  return (
    <>
      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* 세금계산서 발행 정보 */}
        <Grid size={12}>
          <BlankCard>
            <CardContent>
              <Typography variant="h5" mb={1}>
                세금계산서 발행 정보
              </Typography>
              <Typography color="textSecondary" mb={3}>
                세금계산서 발행 시 사용될 사업자 정보입니다
              </Typography>
              <form>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-company">
                      상호명
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-company"
                      value={taxData.tax_company_name}
                      onChange={(e: any) =>
                        setTaxData({ ...taxData, tax_company_name: e.target.value })
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-registration">
                      사업자등록번호
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-registration"
                      value={taxData.tax_registration_number}
                      onChange={(e: any) =>
                        setTaxData({ ...taxData, tax_registration_number: e.target.value })
                      }
                      variant="outlined"
                      fullWidth
                      placeholder="000-00-00000"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-representative">
                      대표자명
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-representative"
                      value={taxData.tax_representative}
                      onChange={(e: any) =>
                        setTaxData({ ...taxData, tax_representative: e.target.value })
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-email">
                      세금계산서 수신 이메일
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-email"
                      value={taxData.tax_email}
                      onChange={(e: any) => setTaxData({ ...taxData, tax_email: e.target.value })}
                      variant="outlined"
                      fullWidth
                      type="email"
                    />
                  </Grid>

                  <Grid size={12}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-address">
                      사업장 주소
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-address"
                      value={taxData.tax_address}
                      onChange={(e: any) => setTaxData({ ...taxData, tax_address: e.target.value })}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-type">
                      업태
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-type"
                      value={taxData.tax_business_type}
                      onChange={(e: any) =>
                        setTaxData({ ...taxData, tax_business_type: e.target.value })
                      }
                      variant="outlined"
                      fullWidth
                      placeholder="예: 도소매업"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-item">
                      종목
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-item"
                      value={taxData.tax_business_item}
                      onChange={(e: any) =>
                        setTaxData({ ...taxData, tax_business_item: e.target.value })
                      }
                      variant="outlined"
                      fullWidth
                      placeholder="예: 무역업"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-phone">
                      연락처
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-phone"
                      value={taxData.tax_phone}
                      onChange={(e: any) => setTaxData({ ...taxData, tax_phone: e.target.value })}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel sx={{ mt: 0 }} htmlFor="tax-fax">
                      팩스번호
                    </CustomFormLabel>
                    <CustomTextField
                      id="tax-fax"
                      value={taxData.tax_fax}
                      onChange={(e: any) => setTaxData({ ...taxData, tax_fax: e.target.value })}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>

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
    </>
  );
};

export default TaxInvoiceTab;
