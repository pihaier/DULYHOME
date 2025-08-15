'use client';

import React, { useState, useEffect, use } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjY5NzksImV4cCI6MjA2OTI0Mjk3OX0.iz3EeD1-W84mHHRhQ4_JpimLjSAIYDTs00UgLeZIGW0';

async function fetchFromSupabase(table: string, query: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

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
      setLoading(true);
      setError(null);

      try {

        // 메인 데이터 조회
        const marketData = await fetchFromSupabase(
          'market_research_requests',
          `reservation_number=eq.${reservationNumber}`
        );


        if (!marketData || marketData.length === 0) {
          throw new Error('데이터를 찾을 수 없습니다.');
        }

        setData(marketData[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
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
        시장조사 상세 (Fetch API)
      </Typography>
      <Typography>예약번호: {data?.reservation_number}</Typography>
      <Typography>상태: {data?.status}</Typography>
      <Typography>회사명: {data?.company_name}</Typography>
      <Typography>담당자: {data?.contact_person}</Typography>
      <Typography>제품명: {data?.product_name}</Typography>
      <Typography>수량: {data?.research_quantity}</Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
}
