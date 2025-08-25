'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Avatar,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon,
  FilterList as FilterIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';

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

interface ChatRoom {
  reservation_number: string;
  service_type: string | null;
  sender_name: string;
  original_message: string;
  created_at: string;
  unread_count: number;
  metadata?: any;
}

const BCrumb = [
  {
    to: '/dashboard',
    title: '대시보드',
  },
  {
    title: '메시지',
  },
];

export default function MessagesPage() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [totalUnread, setTotalUnread] = useState(0);

  const supabase = createClient();

  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      // 사용자가 참여한 채팅방의 메시지만 가져오기
      // 1. 먼저 사용자가 참여한 채팅방 찾기
      const { data: userChats, error: chatError } = await supabase
        .from('chat_messages')
        .select('reservation_number')
        .eq('sender_id', user.id);
      
      if (chatError) throw chatError;
      
      const userReservations = new Set(userChats?.map(c => c.reservation_number) || []);
      
      // 2. 해당 채팅방들의 최신 메시지 가져오기
      const { data: latestMessages, error: latestError } = await supabase
        .from('chat_messages')
        .select('reservation_number, service_type, sender_name, original_message, created_at, metadata')
        .in('reservation_number', Array.from(userReservations))
        .order('created_at', { ascending: false });

      if (latestError) throw latestError;

      // 예약번호별로 그룹핑 (최신 메시지만)
      const groupedMessages = new Map<string, any>();
      latestMessages?.forEach((msg) => {
        if (!groupedMessages.has(msg.reservation_number)) {
          groupedMessages.set(msg.reservation_number, msg);
        }
      });

      // 안읽은 메시지 수 계산 (read_by 배열 기반)
      const { data: allMessages, error: unreadError } = await supabase
        .from('chat_messages')
        .select('reservation_number, read_by, sender_id')
        .in('reservation_number', Array.from(userReservations))
        .neq('sender_id', user.id);

      if (unreadError) throw unreadError;

      // 예약번호별 안읽은 수 계산 (내가 읽지 않은 메시지)
      const unreadMap = new Map<string, number>();
      allMessages?.forEach((msg) => {
        const readBy = msg.read_by || [];
        // 내가 읽지 않은 메시지인지 확인
        if (!readBy.includes(user.id)) {
          const count = unreadMap.get(msg.reservation_number) || 0;
          unreadMap.set(msg.reservation_number, count + 1);
        }
      });

      // 최종 채팅방 목록 생성
      const rooms: ChatRoom[] = Array.from(groupedMessages.values()).map((msg) => ({
        ...msg,
        unread_count: unreadMap.get(msg.reservation_number) || 0,
      }));

      setChatRooms(rooms);
      setTotalUnread(Array.from(unreadMap.values()).reduce((sum, count) => sum + count, 0));
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();

    // Realtime 구독
    const channel = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchChatRooms(); // 새 메시지가 있으면 목록 새로고침
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 필터링된 채팅방
  const filteredRooms = chatRooms.filter((room) => {
    // 검색어 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !room.reservation_number.toLowerCase().includes(searchLower) &&
        !room.sender_name.toLowerCase().includes(searchLower) &&
        !room.original_message.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // 서비스 타입 필터
    if (filterType !== 'all') {
      const serviceType = room.service_type || getServiceTypeFromReservation(room.reservation_number);
      if (serviceType !== filterType) {
        return false;
      }
    }

    return true;
  });

  const handleChatRoomClick = (reservationNumber: string) => {
    router.push(`/dashboard/messages/${reservationNumber}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb title="메시지 센터" items={BCrumb} />
      
      <DashboardCard>
        <CardContent>
          {/* 헤더 */}
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                💬 전체 메시지
                {totalUnread > 0 && (
                  <Chip
                    label={`${totalUnread} 새 메시지`}
                    color="error"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
            </Stack>

            {/* 검색 및 필터 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={(e, value) => value && setFilterType(value)}
                size="small"
              >
                <ToggleButton value="all">전체</ToggleButton>
                <ToggleButton value="market-research">시장조사</ToggleButton>
                <ToggleButton value="factory-contact">공장컨택</ToggleButton>
                <ToggleButton value="inspection">검품</ToggleButton>
                <ToggleButton value="product">1688</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Divider />

            {/* 채팅방 목록 */}
            {filteredRooms.length === 0 ? (
              <Alert severity="info">메시지가 없습니다</Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredRooms.map((room) => {
                  const serviceType = room.service_type || getServiceTypeFromReservation(room.reservation_number);
                  const config = serviceTypeConfig[serviceType] || serviceTypeConfig.inspection;
                  
                  return (
                    <Grid key={room.reservation_number} size={12}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          bgcolor: room.unread_count > 0 ? 'action.selected' : 'background.paper',
                        }}
                        onClick={() => handleChatRoomClick(room.reservation_number)}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: `${config.color}.main`, width: 48, height: 48 }}>
                              {config.icon}
                            </Avatar>
                            
                            <Box flexGrow={1}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {room.reservation_number}
                                </Typography>
                                {room.unread_count > 0 && (
                                  <Badge badgeContent={room.unread_count} color="error" />
                                )}
                              </Stack>
                              
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  {room.sender_name} • {config.label}
                                  {/* PROD 메시지의 경우 제품명 표시 */}
                                  {room.reservation_number.startsWith('PROD-') && room.metadata?.productName && (
                                    <> • {room.metadata.productName}</>
                                  )}
                                </Typography>
                                {/* PROD로 시작하면 제품 보기 링크 */}
                                {room.reservation_number.startsWith('PROD-') && (
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation(); // 카드 클릭 이벤트 방지
                                      const productId = room.reservation_number.replace('PROD-', '');
                                      router.push(`/1688/product/${productId}`);
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <ShoppingBagIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                              
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%',
                                }}
                              >
                                {room.original_message}
                              </Typography>
                            </Box>
                            
                            <Stack alignItems="flex-end" spacing={1}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(room.created_at), {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>
        </CardContent>
      </DashboardCard>
    </PageContainer>
  );
}