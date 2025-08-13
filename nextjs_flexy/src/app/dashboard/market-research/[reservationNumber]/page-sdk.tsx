'use client';

import React, { useState, useEffect, use } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MarketResearchDetailPage({
  params,
}: {
  params: Promise<{ reservationNumber: string }>;
}) {
  const router = useRouter();
  const { reservationNumber } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      console.log('=== Simple fetchData started ===');
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        console.log('Supabase client created');

        console.log('Querying for:', reservationNumber);

        // 단순 쿼리만 실행
        const { data: result, error: queryError } = await supabase
          .from('market_research_requests')
          .select('*')
          .eq('reservation_number', reservationNumber);

        console.log('Query completed:', { result, queryError });

        if (queryError) {
          console.error('Query error:', queryError);
          throw queryError;
        }

        if (!result || result.length === 0) {
          throw new Error('데이터를 찾을 수 없습니다.');
        }

        setData(result[0]);
        console.log('Data set successfully');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    }

    if (reservationNumber) {
      fetchData();
    }
  }, [reservationNumber]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => router.push('/dashboard/orders')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        시장조사 상세 (Simple Test)
      </Typography>
      <Typography>예약번호: {data?.reservation_number}</Typography>
      <Typography>상태: {data?.status}</Typography>
      <Typography>회사명: {data?.company_name}</Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
}
