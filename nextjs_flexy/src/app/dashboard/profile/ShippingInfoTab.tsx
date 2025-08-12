import React, { useState, useEffect } from 'react';
import { 
  CardContent, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Stack, 
  Alert, 
  ToggleButtonGroup, 
  ToggleButton,
  MenuItem,
  FormHelperText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import BlankCard from '@/app/components/shared/BlankCard';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import { IconTrash, IconEdit, IconPlus, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useUser } from '@/lib/context/GlobalContext';

interface ShippingAddress {
  id?: string;
  address_name: string;
  shipping_address: string;
  receiver_name: string;
  receiver_phone: string;
  customs_clearance_type: string;
  customs_clearance_number: string;
  customs_type?: '개인통관' | '사업자통관';
  personal_name?: string;
  personal_customs_code?: string;
  business_name?: string;
  business_number?: string;
  is_default: boolean;
}

const ShippingInfoTab = () => {
  const { user, supabase } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [formData, setFormData] = useState<ShippingAddress>({
    address_name: '',
    shipping_address: '',
    receiver_name: '',
    receiver_phone: '',
    customs_clearance_type: '개인통관',
    customs_clearance_number: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchShippingAddresses();
    }
  }, [user]);

  const fetchShippingAddresses = async () => {
    if (!user || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setShippingAddresses(data || []);
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      setMessage({ type: 'error', text: '배송지 정보를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address?: ShippingAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        address_name: '',
        shipping_address: '',
        receiver_name: '',
        receiver_phone: '',
        customs_clearance_type: '개인통관',
        customs_clearance_number: '',
        is_default: shippingAddresses.length === 0 // 첫 번째 주소는 자동으로 기본값
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSave = async () => {
    if (!user || !supabase) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const addressData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (editingAddress) {
        // 수정
        const { error } = await supabase
          .from('shipping_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);
          
        if (error) throw error;
      } else {
        // 추가
        const { data, error } = await supabase
          .from('shipping_addresses')
          .insert({
            ...addressData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
      }

      setMessage({ type: 'success', text: '배송지가 저장되었습니다.' });
      handleCloseDialog();
      fetchShippingAddresses();
    } catch (error: any) {
      console.error('Error saving shipping address:', error);
      setMessage({ type: 'error', text: error.message || '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '배송지가 삭제되었습니다.' });
      fetchShippingAddresses();
    } catch (error: any) {
      console.error('Error deleting shipping address:', error);
      setMessage({ type: 'error', text: error.message || '삭제 중 오류가 발생했습니다.' });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user || !supabase) return;
    
    try {
      // 먼저 모든 주소의 기본값을 false로 설정
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // 선택한 주소를 기본값으로 설정
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '기본 배송지가 설정되었습니다.' });
      fetchShippingAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
      setMessage({ type: 'error', text: error.message || '설정 중 오류가 발생했습니다.' });
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
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">배송지 관리</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
        >
          배송지 추가
        </Button>
      </Box>

      <Grid container spacing={3}>
        {shippingAddresses.length === 0 ? (
          <Grid size={12}>
            <BlankCard>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary" mb={2}>
                    등록된 배송지가 없습니다
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<IconPlus />}
                    onClick={() => handleOpenDialog()}
                  >
                    첫 배송지 추가하기
                  </Button>
                </Box>
              </CardContent>
            </BlankCard>
          </Grid>
        ) : (
          shippingAddresses.map((address) => (
            <Grid size={12} key={address.id}>
              <BlankCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {address.address_name || '배송지'}
                        </Typography>
                        {address.is_default && (
                          <Chip label="기본" size="small" color="primary" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        {address.shipping_address}
                      </Typography>
                      
                      <Box display="flex" gap={3} mb={1}>
                        <Typography variant="body2">
                          <strong>수령인:</strong> {address.receiver_name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>연락처:</strong> {address.receiver_phone}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={3}>
                        <Typography variant="body2">
                          <strong>통관:</strong> {address.customs_clearance_type}
                        </Typography>
                        <Typography variant="body2">
                          <strong>번호:</strong> {address.customs_clearance_number}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      {!address.is_default && (
                        <IconButton
                          size="small"
                          onClick={() => handleSetDefault(address.id!)}
                          title="기본 배송지로 설정"
                        >
                          <IconStar size={20} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(address)}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(address.id!)}
                        disabled={address.is_default}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </BlankCard>
            </Grid>
          ))
        )}
      </Grid>

      {/* 배송지 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? '배송지 수정' : '배송지 추가'}
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomFormLabel htmlFor="address-name">
                  배송지 별칭
                </CustomFormLabel>
                <CustomTextField
                  id="address-name"
                  value={formData.address_name}
                  onChange={(e: any) => setFormData({ ...formData, address_name: e.target.value })}
                  variant="outlined"
                  fullWidth
                  placeholder="예: 집, 회사"
                />
              </Grid>

              <Grid size={12}>
                <CustomFormLabel htmlFor="shipping-address">
                  수령 주소 *
                </CustomFormLabel>
                <CustomTextField
                  id="shipping-address"
                  value={formData.shipping_address}
                  onChange={(e: any) => setFormData({ ...formData, shipping_address: e.target.value })}
                  variant="outlined"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  placeholder="예: 인천광역시 연수구 센트럴로 313 B2512"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="receiver-name">
                  수령인 성함 *
                </CustomFormLabel>
                <CustomTextField
                  id="receiver-name"
                  value={formData.receiver_name}
                  onChange={(e: any) => setFormData({ ...formData, receiver_name: e.target.value })}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="receiver-phone">
                  수령인 연락처 *
                </CustomFormLabel>
                <CustomTextField
                  id="receiver-phone"
                  value={formData.receiver_phone}
                  onChange={(e: any) => setFormData({ ...formData, receiver_phone: e.target.value })}
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="010-0000-0000"
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  통관 방식 선택 *
                </Typography>
                <ToggleButtonGroup
                  value={formData.customs_type}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setFormData({ 
                        ...formData, 
                        customs_type: newValue as '개인통관' | '사업자통관',
                        personal_name: '',
                        personal_customs_code: '',
                        business_name: '',
                        business_number: ''
                      });
                    }
                  }}
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
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
                  <ToggleButton value="사업자통관" sx={{ py: 1.5 }}>
                    사업자 통관
                  </ToggleButton>
                  <ToggleButton value="개인통관" sx={{ py: 1.5 }}>
                    개인 통관
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              
              {formData.customs_type === '개인통관' ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="personal-name">
                      개인 성명
                    </CustomFormLabel>
                    <CustomTextField
                      id="personal-name"
                      value={formData.personal_name || ''}
                      onChange={(e: any) => setFormData({ ...formData, personal_name: e.target.value })}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="personal-customs-code">
                      개인통관고유번호 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="personal-customs-code"
                      value={formData.personal_customs_code || ''}
                      onChange={(e: any) => setFormData({ ...formData, personal_customs_code: e.target.value })}
                      variant="outlined"
                      fullWidth
                      required
                      placeholder="P000000000000"
                      helperText="관세청 홈페이지에서 발급받은 번호를 입력하세요"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="business-name">
                      사업자명
                    </CustomFormLabel>
                    <CustomTextField
                      id="business-name"
                      value={formData.business_name || ''}
                      onChange={(e: any) => setFormData({ ...formData, business_name: e.target.value })}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="business-number">
                      사업자등록번호 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="business-number"
                      value={formData.business_number || ''}
                      onChange={(e: any) => setFormData({ ...formData, business_number: e.target.value })}
                      variant="outlined"
                      fullWidth
                      required
                      placeholder="000-00-00000"
                      helperText="사업자등록번호를 입력하세요"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving || !formData.shipping_address || !formData.receiver_name || !formData.receiver_phone || 
              (formData.customs_type === '개인통관' ? !formData.personal_customs_code : !formData.business_number)}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShippingInfoTab;