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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (message: string) => {
    console.log(`[DEBUG] ${message}`);
    setDebugInfo((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    async function fetchData() {
      addDebug('=== fetchData started ===');
      setLoading(true);
      setError(null);

      try {
        addDebug('Creating Supabase client...');
        const supabase = createClient();
        addDebug('Supabase client created');

        addDebug(`Building query for: ${reservationNumber}`);

        // 쿼리 빌드
        const query = supabase
          .from('market_research_requests')
          .select('*')
          .eq('reservation_number', reservationNumber);

        addDebug('Query built, executing...');

        // 타임아웃 추가
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
        });

        // Promise.race로 타임아웃 처리
        const result = (await Promise.race([query, timeoutPromise])) as any;

        addDebug(`Query completed: ${JSON.stringify(result)}`);

        if (result.error) {
          throw result.error;
        }

        if (!result.data || result.data.length === 0) {
          throw new Error('데이터를 찾을 수 없습니다.');
        }

        setData(result.data[0]);
        addDebug('Data set successfully');
      } catch (err) {
        addDebug(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        addDebug('Setting loading to false');
        setLoading(false);
      }
    }

    if (reservationNumber) {
      fetchData();
    }
  }, [reservationNumber]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Debug Info:</Typography>
          {debugInfo.map((info, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
              {info}
            </Typography>
          ))}
        </Box>
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
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Debug Info:</Typography>
          {debugInfo.map((info, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
              {info}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        시장조사 상세 (SDK Debug)
      </Typography>
      <Typography>예약번호: {data?.reservation_number}</Typography>
      <Typography>상태: {data?.status}</Typography>
      <Typography>회사명: {data?.company_name}</Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
}
