'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContainer from '@/app/components/container/PageContainer';
import ChatPanel from '@/app/dashboard/orders/_components/ChatPanel';
import { useUser } from '@/lib/context/GlobalContext';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatRoomId = params.chatRoomId as string;
  const { user, userProfile } = useUser();
  
  // 제품 문의인지 주문 채팅인지 구분
  const isProductInquiry = chatRoomId?.startsWith('PROD-');
  const productId = isProductInquiry ? chatRoomId.replace('PROD-', '') : null;
  
  // 채팅 타입 표시
  const getChatTypeInfo = () => {
    if (isProductInquiry) {
      return {
        type: '제품 문의',
        color: 'info' as const,
        description: `제품 ID: ${productId}`,
      };
    }
    
    // 주문 채팅 타입 구분 (MR-, QI-, DL- 등)
    if (chatRoomId?.startsWith('MR-')) {
      return {
        type: '시장조사',
        color: 'primary' as const,
        description: chatRoomId,
      };
    }
    if (chatRoomId?.startsWith('QI-')) {
      return {
        type: '품질검사',
        color: 'success' as const,
        description: chatRoomId,
      };
    }
    if (chatRoomId?.startsWith('DL-')) {
      return {
        type: '배송대행',
        color: 'warning' as const,
        description: chatRoomId,
      };
    }
    
    return {
      type: '일반 문의',
      color: 'default' as const,
      description: chatRoomId,
    };
  };
  
  const chatInfo = getChatTypeInfo();
  
  return (
    <PageContainer title="채팅" description="실시간 채팅">
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* 헤더 */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                if (isProductInquiry) {
                  router.push(`/1688/product/${productId}`);
                } else {
                  router.push('/dashboard');
                }
              }}
            >
              돌아가기
            </Button>
            
            <Chip 
              label={chatInfo.type} 
              color={chatInfo.color}
              size="small"
            />
            
            <Typography variant="h6">
              {chatInfo.description}
            </Typography>
          </Stack>
          
          {/* 안내 메시지 */}
          {isProductInquiry && (
            <Alert severity="info" sx={{ mb: 2 }}>
              제품에 대한 문의사항을 남겨주세요. 담당자가 확인 후 답변드리겠습니다.
            </Alert>
          )}
          
          {/* 채팅 패널 */}
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <ChatPanel
              reservationNumber={chatRoomId}
              currentUserId={user?.id}
              currentUserRole={userProfile?.role || 'customer'}
              currentUserName={userProfile?.contact_person || '고객'}
              serviceType={isProductInquiry ? 'product-inquiry' : undefined}
            />
          </Paper>
        </Box>
      </Container>
    </PageContainer>
  );
}