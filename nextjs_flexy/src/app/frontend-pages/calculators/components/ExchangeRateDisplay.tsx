'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Box, Paper, Stack, Typography, Chip, Divider } from '@mui/material';

interface ExchangeRate {
  date: string;
  usd_rate: number;
  cny_rate: number;
  applied_usd_rate: number;
  applied_cny_rate: number;
}

export default function ExchangeRateDisplay() {
  const [rates, setRates] = useState<ExchangeRate | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('exchange_rates')
        .select('date, usd_rate, cny_rate, applied_usd_rate, applied_cny_rate')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      if (data) setRates(data);
    };
    fetchRates();
  }, []);

  if (!rates) return null;

  const isInHeader =
    typeof window !== 'undefined' && window.location.pathname === '/frontend-pages/calculators';

  const CurrencyCard = ({
    flag,
    label,
    official,
    applied,
    light,
  }: {
    flag: string;
    label: string;
    official: number;
    applied: number;
    light?: boolean;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: light ? 'transparent' : 'background.paper',
        borderRadius: 2,
        border: light ? '1px solid rgba(255,255,255,0.25)' : '1px solid',
        borderColor: light ? 'rgba(255,255,255,0.25)' : 'divider',
      }}
    >
      <Stack spacing={1.25}>
        <Typography
          variant="subtitle2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: light ? 'rgba(255,255,255,0.9)' : 'text.primary',
          }}
        >
          <span style={{ fontSize: 18 }}>{flag}</span> {label}
        </Typography>
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              size="small"
              label="관세청"
              variant="outlined"
              sx={{
                borderColor: light ? 'rgba(255,255,255,0.4)' : 'divider',
                color: light ? 'rgba(255,255,255,0.85)' : 'text.secondary',
              }}
            />
            <Typography variant="body2" sx={{ color: light ? 'white' : 'text.primary' }}>
              ₩{official.toLocaleString()}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              size="small"
              color={light ? 'default' : 'primary'}
              label="두리무역"
              sx={{
                bgcolor: light ? 'rgba(255,255,255,0.2)' : 'primary.50',
                color: light ? 'white' : 'primary.main',
              }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: light ? 'white' : 'primary.main' }}
            >
              ₩{applied.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );

  if (isInHeader) {
    // 헤더(블루 히어로)에서 사용하는 라이트 카드 스타일
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.25)',
          bgcolor: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>
              오늘의 환율 ({rates.date})
            </Typography>
            <Chip
              size="small"
              label="매일 09:00 자동 업데이트"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.15)',
              }}
              variant="outlined"
            />
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <CurrencyCard
              light
              flag="🇺🇸"
              label="USD (달러)"
              official={rates.usd_rate}
              applied={rates.applied_usd_rate}
            />
            <CurrencyCard
              light
              flag="🇨🇳"
              label="CNY (위안)"
              official={rates.cny_rate}
              applied={rates.applied_cny_rate}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}
          >
            * 관세청 기준환율 기준, 두리무역 내부 적용 환율 병기
          </Typography>
        </Stack>
      </Box>
    );
  }

  // 일반 섹션용 – 라이트 테마 카드
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2, borderColor: 'primary.200', bgcolor: 'primary.50', mb: 3 }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={700}>
          오늘의 환율 ({rates.date})
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <CurrencyCard
            flag="🇺🇸"
            label="USD (달러)"
            official={rates.usd_rate}
            applied={rates.applied_usd_rate}
          />
          <CurrencyCard
            flag="🇨🇳"
            label="CNY (위안)"
            official={rates.cny_rate}
            applied={rates.applied_cny_rate}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
