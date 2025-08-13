'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { Add as AddIcon, Business as BusinessIcon } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';

interface CompanyAddress {
  id: string;
  company_name: string;
  company_name_chinese?: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  address_detail?: string;
  postal_code?: string;
  is_default: boolean;
}

interface CompanyAddressSelectorProps {
  value?: CompanyAddress | null;
  onChange: (address: CompanyAddress) => void;
  required?: boolean;
}

export default function CompanyAddressSelector({
  value,
  onChange,
  required = false,
}: CompanyAddressSelectorProps) {
  const { user } = useUser();
  const [addresses, setAddresses] = useState<CompanyAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 새 주소 폼 데이터
  const [newAddress, setNewAddress] = useState({
    company_name: '',
    company_name_chinese: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    address_detail: '',
    postal_code: '',
    is_default: false,
  });

  // 주소 목록 불러오기
  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      // user가 없으면 로딩 상태 해제
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('company_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);

      // 기본 주소가 있으면 자동 선택
      const defaultAddress = data?.find((addr) => addr.is_default);
      if (defaultAddress && !value) {
        setSelectedId(defaultAddress.id);
        onChange(defaultAddress);
      } else if (value) {
        setSelectedId(value.id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    const selected = addresses.find((addr) => addr.id === addressId);
    if (selected) {
      setSelectedId(addressId);
      onChange(selected);
    }
  };

  const handleSaveNewAddress = async () => {
    setError('');

    // 유효성 검사
    if (!newAddress.company_name || !newAddress.contact_person || !newAddress.phone) {
      setError('회사명, 담당자명, 연락처는 필수 입력 항목입니다.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // 기본 주소로 설정하는 경우, 기존 기본 주소 해제
      if (newAddress.is_default) {
        await supabase
          .from('company_addresses')
          .update({ is_default: false })
          .eq('user_id', user!.id)
          .eq('is_default', true);
      }

      // 새 주소 추가
      const { data, error } = await supabase
        .from('company_addresses')
        .insert({
          user_id: user!.id,
          ...newAddress,
        })
        .select()
        .single();

      if (error) throw error;

      // 목록에 추가하고 선택
      const newAddresses = [
        data,
        ...addresses.filter((addr) => !addr.is_default || !data.is_default),
      ];
      setAddresses(newAddresses);
      setSelectedId(data.id);
      onChange(data);

      // 다이얼로그 닫기 및 폼 초기화
      setOpenDialog(false);
      setNewAddress({
        company_name: '',
        company_name_chinese: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        address_detail: '',
        postal_code: '',
        is_default: false,
      });
    } catch (err) {
      console.error('Error saving address:', err);
      setError('주소 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
          회사 정보 선택
        </FormLabel>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={30} />
        </Box>
      </Box>
    );
  }

  return (
    <FormControl component="fieldset" required={required} fullWidth>
      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
        회사 정보 선택
      </FormLabel>

      {!user ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          로그인이 필요합니다. 로그인 후 회사 정보를 저장할 수 있습니다.
        </Alert>
      ) : addresses.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          등록된 회사 정보가 없습니다. 새로운 회사 정보를 추가해주세요.
        </Alert>
      ) : (
        <RadioGroup value={selectedId} onChange={(e) => handleAddressSelect(e.target.value)}>
          <Stack spacing={2}>
            {addresses.map((address) => (
              <Paper
                key={address.id}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedId === address.id ? 2 : 1,
                  borderColor: selectedId === address.id ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <FormControlLabel
                  value={address.id}
                  control={<Radio />}
                  label={
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {address.company_name}
                        </Typography>
                        {address.is_default && <Chip label="기본" size="small" color="primary" />}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        담당자: {address.contact_person} | 연락처: {address.phone}
                      </Typography>

                      {address.email && (
                        <Typography variant="body2" color="text.secondary">
                          이메일: {address.email}
                        </Typography>
                      )}

                      {address.address && (
                        <Typography variant="body2" color="text.secondary">
                          주소: {address.address} {address.address_detail}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            ))}
          </Stack>
        </RadioGroup>
      )}

      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        onClick={() => {
          if (!user) {
            alert('로그인이 필요합니다.');
            return;
          }
          setOpenDialog(true);
        }}
        sx={{ mt: 2 }}
      >
        새 회사 정보 추가
      </Button>

      {/* 새 주소 추가 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={() => !saving && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 회사 정보 추가</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              label="회사명"
              value={newAddress.company_name}
              onChange={(e) => setNewAddress({ ...newAddress, company_name: e.target.value })}
              required
              fullWidth
              disabled={saving}
            />

            <TextField
              label="회사명 (중문)"
              value={newAddress.company_name_chinese}
              onChange={(e) =>
                setNewAddress({ ...newAddress, company_name_chinese: e.target.value })
              }
              fullWidth
              disabled={saving}
              helperText="선택사항"
            />

            <TextField
              label="담당자명"
              value={newAddress.contact_person}
              onChange={(e) => setNewAddress({ ...newAddress, contact_person: e.target.value })}
              required
              fullWidth
              disabled={saving}
            />

            <TextField
              label="연락처"
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              required
              fullWidth
              disabled={saving}
              placeholder="010-1234-5678"
            />

            <TextField
              label="이메일"
              type="email"
              value={newAddress.email}
              onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
              fullWidth
              disabled={saving}
              helperText="선택사항"
            />

            <Divider />

            <TextField
              label="주소"
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              fullWidth
              disabled={saving}
              helperText="선택사항"
            />

            <TextField
              label="상세주소"
              value={newAddress.address_detail}
              onChange={(e) => setNewAddress({ ...newAddress, address_detail: e.target.value })}
              fullWidth
              disabled={saving}
              helperText="선택사항"
            />

            <TextField
              label="우편번호"
              value={newAddress.postal_code}
              onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
              fullWidth
              disabled={saving}
              helperText="선택사항"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                  disabled={saving}
                />
              }
              label="기본 회사 정보로 설정"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            취소
          </Button>
          <Button onClick={handleSaveNewAddress} variant="contained" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
}
