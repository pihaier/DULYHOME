'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';

// ChatPanel 동적 import
const ChatPanel = React.lazy(() => import('@/app/dashboard/orders/_components/ChatPanel'));

// 서비스 타입 설정
const serviceTypeConfig: Record<string, { icon: string; label: string; color: any }> = {
  'market-research': {
    icon: '🔍',
    label: '시장조사',
    color: 'primary',
  },
  'factory-contact': {
    icon: '🏭',
    label: '공장컨택',
    color: 'secondary',
  },
  inspection: {
    icon: '📋',
    label: '검품감사',
    color: 'success',
  },
  product: {
    icon: '🛍️',
    label: '1688 상품',
    color: 'info',
  },
  sampling: {
    icon: '📦',
    label: '샘플링',
    color: 'warning',
  },
  'bulk-purchase': {
    icon: '🚛',
    label: '대량구매',
    color: 'error',
  },
};

// 예약번호에서 서비스 타입 추출
function getServiceTypeFromReservation(reservationNumber: string): string {
  if (reservationNumber.startsWith('PROD-')) return 'product';
  if (reservationNumber.startsWith('MR-')) return 'market-research';
  if (reservationNumber.startsWith('FC-')) return 'factory-contact';
  if (reservationNumber.startsWith('DL-')) return 'inspection';
  if (reservationNumber.startsWith('SP-')) return 'sampling';
  if (reservationNumber.startsWith('BP-')) return 'bulk-purchase';
  return 'inspection'; // 기본값
}

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useUser();
  const reservationNumber = params.reservationNumber as string;
  const [productName, setProductName] = useState<string | null>(null);
  
  const supabase = createClient();

  // 서비스 타입 결정
  const serviceType = getServiceTypeFromReservation(reservationNumber);
  const config = serviceTypeConfig[serviceType] || serviceTypeConfig.inspection;

  const BCrumb = [
    {
      to: '/dashboard',
      title: '대시보드',
    },
    {
      to: '/dashboard/messages',
      title: '메시지',
    },
    {
      title: reservationNumber,
    },
  ];

  // PROD 메시지의 경우 제품명 가져오기
  useEffect(() => {
    const fetchProductName = async () => {
      if (reservationNumber.startsWith('PROD-')) {
        const { data } = await supabase
          .from('chat_messages')
          .select('metadata')
          .eq('reservation_number', reservationNumber)
          .not('metadata', 'is', null)
          .limit(1)
          .single();
        
        if (data?.metadata?.productName) {
          setProductName(data.metadata.productName);
        }
      }
    };
    
    fetchProductName();
  }, [reservationNumber]);

  // 페이지 진입 시 메시지 읽음 처리
  useEffect(() => {
    const markAsRead = async () => {
      if (!user) return;

      try {
        // 먼저 내가 아직 읽지 않은 메시지들을 가져옴
        const { data: unreadMessages, error: fetchError } = await supabase
          .from('chat_messages')
          .select('id, read_by')
          .eq('reservation_number', reservationNumber)
          .neq('sender_id', user.id);

        if (fetchError) throw fetchError;

        // 내가 읽지 않은 메시지들만 필터링
        const messagesToUpdate = unreadMessages?.filter(msg => {
          const readBy = msg.read_by || [];
          return !readBy.includes(user.id);
        });

        if (messagesToUpdate && messagesToUpdate.length > 0) {
          // 각 메시지의 read_by 배열에 내 ID 추가
          for (const msg of messagesToUpdate) {
            const currentReadBy = msg.read_by || [];
            const updatedReadBy = [...currentReadBy, user.id];

            await supabase
              .from('chat_messages')
              .update({ 
                is_read: true,
                read_by: updatedReadBy,
                read_at: new Date().toISOString()
              })
              .eq('id', msg.id);
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [reservationNumber, user]);

  return (
    <PageContainer>
      <Breadcrumb title="메시지 상세" items={BCrumb} />
      
      <DashboardCard>
        <CardContent>
          {/* 헤더 */}
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <IconButton onClick={() => router.push('/dashboard/messages')}>
              <ArrowBackIcon />
            </IconButton>
            
            <Avatar sx={{ bgcolor: `${config.color}.main` }}>
              {config.icon}
            </Avatar>
            
            <Box flexGrow={1}>
              <Typography variant="h5">{reservationNumber}</Typography>
              {/* PROD 메시지의 경우 제품명 표시 */}
              {productName && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {productName}
                </Typography>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={config.label} color={config.color} size="small" />
                {/* PROD로 시작하면 제품 상세 보기 버튼 표시 */}
                {reservationNumber.startsWith('PROD-') && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => {
                      const productId = reservationNumber.replace('PROD-', '');
                      router.push(`/1688/product/${productId}`);
                    }}
                  >
                    제품 상세 보기
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* 채팅 패널 */}
          <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Suspense
              fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              }
            >
              <ChatPanel
                reservationNumber={reservationNumber}
                currentUserId={user?.id}
                currentUserRole={userProfile?.role}
                currentUserName={userProfile?.company_name || userProfile?.contact_person || user?.email}
                serviceType={serviceType}
              />
            </Suspense>
          </Box>
        </CardContent>
      </DashboardCard>
    </PageContainer>
  );
}