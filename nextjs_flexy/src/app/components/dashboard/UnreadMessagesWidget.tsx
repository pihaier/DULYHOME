'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Stack, Avatar, Chip, Button, Skeleton, Alert } from '@mui/material';
import DashboardCard from '../shared/DashboardCard';
import { IconMessage, IconMessageCircle } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';

interface UnreadMessage {
  id: string;
  reservation_number: string;
  sender_name: string;
  sender_role: string;
  original_message: string;
  created_at: string;
  service_type?: string | null;
}

const UnreadMessagesWidget = () => {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<UnreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const supabase = createClient();

      // 최근 메시지 조회 (service_type 직접 사용)
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .neq('sender_id', user?.id) // 자신이 보낸 메시지 제외
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // service_type이 이미 저장되어 있으므로 추가 쿼리 불필요
      setMessages(messages || []);
      setTotalUnread(messages?.length || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // 에러가 발생해도 위젯은 표시되도록 함
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'customer':
        return { label: '고객', color: 'primary' as const };
      case 'chinese_staff':
        return { label: '중국직원', color: 'secondary' as const };
      case 'korean_team':
        return { label: '한국팀', color: 'info' as const };
      case 'factory':
        return { label: '공장', color: 'warning' as const };
      case 'inspector':
        return { label: '검사관', color: 'success' as const };
      default:
        return { label: role, color: 'default' as const };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const handleViewMessage = (message: UnreadMessage) => {
    // service_type을 직접 사용하여 라우팅
    if (message.service_type) {
      router.push(`/dashboard/orders/${message.service_type}/${message.reservation_number}`);
    } else {
      // 서비스 타입이 없는 경우 전체 주문 목록으로
      router.push('/dashboard/orders');
    }
  };

  if (loading) {
    return (
      <DashboardCard title="최근 메시지" subtitle="메시지 로딩 중">
        <Box>
          {Array.from({ length: 3 }).map((_, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </Box>
            </Stack>
          ))}
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="최근 메시지" subtitle={`최근 메시지 ${totalUnread}개`}>
      <Box>
        {messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const roleInfo = getRoleInfo(message.sender_role);
              return (
                <Stack
                  key={message.id}
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  mb={2}
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => handleViewMessage(message)}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <IconMessageCircle size={20} />
                  </Avatar>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {message.sender_name}
                      </Typography>
                      <Chip
                        label={roleInfo.label}
                        size="small"
                        color={roleInfo.color}
                        sx={{ height: 20 }}
                      />
                      <Typography variant="caption" color="text.secondary" ml="auto">
                        {formatTimeAgo(message.created_at)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {truncateMessage(message.original_message)}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {message.reservation_number}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
            {totalUnread > 5 && (
              <Box textAlign="center" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  +{totalUnread - 5}개의 메시지가 더 있습니다
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Alert severity="info" icon={<IconMessage />} sx={{ borderRadius: 1 }}>
            최근 메시지가 없습니다
          </Alert>
        )}
      </Box>
    </DashboardCard>
  );
};

export default UnreadMessagesWidget;
