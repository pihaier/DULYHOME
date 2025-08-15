'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, Business as BusinessIcon } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';

interface CompanyInfo {
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

interface SavedCompanyAddress {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  is_default: boolean;
}

interface CompanyInfoFormProps {
  value: CompanyInfo;
  onChange: (info: CompanyInfo) => void;
  showSaveOption?: boolean;
  saveToProfile?: boolean;
  onSaveOptionChange?: (save: boolean) => void;
  updateProfile?: boolean; // 프로필 업데이트 여부
  onSubmit?: () => void; // 제출 시 호출할 콜백
}

export default function CompanyInfoForm({
  value,
  onChange,
  showSaveOption = false,
  saveToProfile = false,
  onSaveOptionChange,
  updateProfile = true, // 기본적으로 프로필 업데이트
  onSubmit,
}: CompanyInfoFormProps) {
  const { user, userProfile, refreshUser } = useUser();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedCompanyAddress[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasChanged, setHasChanged] = useState(false);

  // user_profiles에서 기본값 가져오기
  useEffect(() => {
    if (user && !value.company_name) {
      // userProfile이 있으면 그 값 사용, 없으면 빈 값
      const newValues = {
        company_name: userProfile?.company_name || '',
        contact_person: userProfile?.contact_person || '',
        contact_phone: userProfile?.phone || '',
        contact_email: user.email || '', // 항상 user.email 사용
      };
      onChange(newValues);
    }
  }, [userProfile, user]);

  // 저장된 회사 주소 목록 가져오기
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  // 값이 변경되었는지 추적
  useEffect(() => {
    if (userProfile && user) {
      const profileChanged =
        value.company_name !== userProfile.company_name ||
        value.contact_person !== userProfile.contact_person ||
        value.contact_phone !== userProfile.phone;
      setHasChanged(profileChanged);
    }
  }, [value, userProfile, user]);

  // 프로필 업데이트 함수
  const updateUserProfile = async () => {
    if (!user || !hasChanged || !updateProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_name: value.company_name,
          contact_person: value.contact_person,
          phone: value.contact_phone,
        })
        .eq('user_id', user.id);

      if (error) {
      } else {
        // GlobalContext의 프로필 정보 새로고침
        if (refreshUser) {
          refreshUser();
        }
      }
    } catch (err) {}
  };

  // 폼 제출 시 프로필 업데이트
  useEffect(() => {
    if (onSubmit) {
      const originalOnSubmit = onSubmit;
      onSubmit = async () => {
        await updateUserProfile();
        originalOnSubmit();
      };
    }
  }, [onSubmit, hasChanged]);

  const fetchSavedAddresses = async () => {
    setLoading(true);
    try {
      // Supabase에서 직접 회사 주소 가져오기
      const { data: addresses, error } = await supabase
        .from('company_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedAddresses(addresses || []);

      // 기본 주소가 있고 아직 값이 없으면 자동으로 채우기
      const defaultAddress = addresses?.find((addr: SavedCompanyAddress) => addr.is_default);
      if (defaultAddress && !value.company_name) {
        onChange({
          company_name: defaultAddress.company_name,
          contact_person: defaultAddress.contact_person,
          contact_phone: defaultAddress.phone,
          contact_email: defaultAddress.email || user?.email || '',
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: SavedCompanyAddress) => {
    onChange({
      company_name: address.company_name,
      contact_person: address.contact_person,
      contact_phone: address.phone,
      contact_email: address.email || user?.email || '',
    });
    setAnchorEl(null);
  };

  const handleNewAddress = () => {
    onChange({
      company_name: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
    });
    setAnchorEl(null);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">신청자 정보</Typography>

        {user && savedAddresses.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : '신청 정보 불러오기'}
          </Button>
        )}
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {savedAddresses.map((address) => (
          <MenuItem
            key={address.id}
            onClick={() => handleSelectAddress(address)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BusinessIcon fontSize="small" color="action" />
            <Box flex={1}>
              <Typography variant="body2" fontWeight={600}>
                {address.company_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {address.contact_person} | {address.phone}
              </Typography>
            </Box>
            {address.is_default && <Chip label="기본" size="small" color="primary" />}
          </MenuItem>
        ))}
        <MenuItem onClick={handleNewAddress}>
          <Typography color="primary">+ 새 주소 입력</Typography>
        </MenuItem>
      </Menu>

      <Stack spacing={2}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="회사명"
            value={value.company_name}
            onChange={(e) => onChange({ ...value, company_name: e.target.value })}
            required
            placeholder="두리무역"
          />
          <TextField
            fullWidth
            label="담당자명"
            value={value.contact_person}
            onChange={(e) => onChange({ ...value, contact_person: e.target.value })}
            required
            placeholder="홍길동"
          />
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="연락처"
            value={value.contact_phone}
            onChange={(e) => onChange({ ...value, contact_phone: e.target.value })}
            required
            placeholder="010-1234-5678"
          />
          <TextField
            fullWidth
            label="이메일"
            type="email"
            value={value.contact_email}
            onChange={(e) => onChange({ ...value, contact_email: e.target.value })}
            placeholder="example@company.com"
            helperText="선택사항 - 입력하지 않으면 로그인 이메일이 사용됩니다"
          />
        </Box>
      </Stack>

      {user && showSaveOption && (
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={saveToProfile}
                onChange={(e) => onSaveOptionChange?.(e.target.checked)}
                name="saveToProfile"
              />
            }
            label="이 정보를 프로필에 저장하여 다음에 재사용"
          />
        </Box>
      )}

      {/* 프로필 자동 업데이트 안내 */}
      {user && updateProfile && hasChanged && (
        <Alert severity="info" sx={{ mt: 2 }}>
          신청서 제출 시 변경된 정보가 프로필에 자동으로 업데이트됩니다.
        </Alert>
      )}

      {!user && (
        <Alert severity="info" sx={{ mt: 2 }}>
          로그인하시면 입력한 정보를 저장하여 다음에 재사용할 수 있습니다.
        </Alert>
      )}
    </Box>
  );
}

// CompanyInfoForm을 사용하는 신청서 페이지에서 프로필 업데이트를 위한 hook
export function useCompanyInfoSubmit(companyInfo: CompanyInfo) {
  const { user, refreshUser } = useUser();
  const supabase = createClient();

  const updateProfileOnSubmit = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_name: companyInfo.company_name,
          contact_person: companyInfo.contact_person,
          phone: companyInfo.contact_phone,
        })
        .eq('user_id', user.id);

      if (!error && refreshUser) {
        await refreshUser();
      }
    } catch (err) {}
  };

  return { updateProfileOnSubmit };
}
