'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Badge,
  Avatar,
  Drawer,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  ShoppingCart as OrderIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import ChatPanel from '@/app/dashboard/orders/_components/ChatPanel';
import { useUser } from '@/lib/context/GlobalContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  reservation_number: string;
  company_name: string;
  service_type: string;
  status: string;
  created_at: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

interface UserProfile {
  user_id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  role: string;
}

export default function ChatManagementPage() {
  const { supabase, user, userProfile } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerProfile, setCustomerProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 사이드바 토글 버튼 추가
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  
  // 중국 직원인지 확인
  const isChineseStaff = userProfile?.role === 'chinese_staff';

  // 주문 목록 가져오기
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // 모든 서비스 타입의 주문 가져오기 (현재 3가지만 구현됨)
      const tables = [
        { table: 'market_research_requests', type: 'market-research' },
        { table: 'factory_contact_requests', type: 'factory-contact' },
        { table: 'inspection_applications', type: 'inspection' },
        // { table: 'sampling_requests', type: 'sampling' }, // 아직 구현되지 않음
      ];

      const allOrders: Order[] = [];

      for (const { table, type } of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mappedOrders = data.map((item: any) => ({
            id: item.id,
            reservation_number: item.reservation_number,
            company_name: item.company_name,
            service_type: type,
            status: item.status,
            created_at: item.created_at,
          }));
          allOrders.push(...mappedOrders);
        }
      }

      // 각 주문의 최신 메시지와 읽지 않은 메시지 수 가져오기
      for (const order of allOrders) {
        // 최신 메시지
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('reservation_number', order.reservation_number)
          .order('created_at', { ascending: false })
          .limit(1);

        if (messages && messages.length > 0) {
          order.last_message = messages[0].original_message;
          order.last_message_time = messages[0].created_at;
        }

        // 읽지 않은 메시지 수 (현재 사용자가 보낸 메시지 제외)
        if (user?.id) {
          // read_by가 null이거나 현재 사용자 ID를 포함하지 않은 메시지 수 세기
          // 더 간단한 방법: is_read 필드만 사용
          const { data: unreadMessages, error: unreadError } = await supabase
            .from('chat_messages')
            .select('id')
            .eq('reservation_number', order.reservation_number)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          if (unreadError) {
            console.error('Error fetching unread count:', unreadError);
            order.unread_count = 0;
          } else {
            order.unread_count = unreadMessages?.length || 0;
          }
        }
      }

      // 날짜순 정렬
      allOrders.sort((a, b) => 
        new Date(b.last_message_time || b.created_at).getTime() - 
        new Date(a.last_message_time || a.created_at).getTime()
      );

      setOrders(allOrders);
      
      // 첫 번째 주문 선택
      if (allOrders.length > 0 && !selectedOrder) {
        handleOrderSelect(allOrders[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 주문 선택
  const handleOrderSelect = async (order: Order) => {
    setSelectedOrder(order);
    
    // 메시지를 읽음으로 표시 (더 간단한 방법)
    if (user?.id && order.unread_count && order.unread_count > 0) {
      try {
        // 해당 예약번호의 모든 메시지를 읽음으로 표시
        const { error } = await supabase
          .from('chat_messages')
          .update({ 
            is_read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('reservation_number', order.reservation_number)
          .neq('sender_id', user.id);

        if (error) {
          console.error('Error marking messages as read:', error);
        } else {
          // 로컬 상태 업데이트
          setOrders(prev => prev.map(o => 
            o.id === order.id ? { ...o, unread_count: 0 } : o
          ));
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
    
    // 고객 프로필 가져오기
    try {
      const { data: orderData } = await supabase
        .from(getTableName(order.service_type))
        .select('user_id')
        .eq('reservation_number', order.reservation_number)
        .single();

      if (orderData?.user_id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', orderData.user_id)
          .single();

        setCustomerProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  // 테이블명 매핑
  const getTableName = (serviceType: string) => {
    const mapping: { [key: string]: string } = {
      'market-research': 'market_research_requests',
      'factory-contact': 'factory_contact_requests',
      'inspection': 'inspection_applications',
      // 'sampling': 'sampling_requests', // 아직 구현되지 않음
    };
    return mapping[serviceType] || 'market_research_requests';
  };

  // 서비스 타입 한글명
  const getServiceTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'market-research': isChineseStaff ? '市场调查' : '시장조사',
      'factory-contact': isChineseStaff ? '工厂联系' : '공장컨택',
      'inspection': isChineseStaff ? '检品代理' : '검품대행',
      // 'sampling': isChineseStaff ? '样品进口' : '샘플수입', // 아직 구현되지 않음
    };
    return names[type] || type;
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      'submitted': 'info',
      'quoted': 'warning',
      'paid': 'success',
      'in_progress': 'primary',
      'completed': 'default',
      'cancelled': 'error',
    };
    return colors[status] || 'default';
  };

  useEffect(() => {
    fetchOrders();
    
    // Realtime 구독 (새 메시지 알림)
    const channel = supabase
      .channel('orders_update')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMessage = payload.new as any;
          
          // 자기가 보낸 메시지가 아닌 경우에만 알림
          if (newMessage.sender_id !== user?.id) {
            // 브라우저 알림 (권한이 있는 경우)
            if (Notification.permission === 'granted') {
              new Notification('새 메시지', {
                body: `${newMessage.sender_name}: ${newMessage.original_message}`,
                icon: '/favicon.ico',
                tag: newMessage.reservation_number,
              });
            }
            
            // 알림 소리 재생 (옵션)
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
            
            // 주문 목록 새로고침
            fetchOrders();
          }
        }
      )
      .subscribe();

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 검색 필터링
  const filteredOrders = orders.filter(order => 
    order.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.reservation_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={toggleDrawer} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {isChineseStaff ? '聊天管理' : '채팅 관리'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 180px)' }}>
        {/* 주문 목록 사이드바 */}
        <Paper
          sx={{
            width: drawerOpen ? 320 : 0,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.3s',
            mr: drawerOpen ? 2 : 0,
          }}
        >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" gutterBottom>
              {isChineseStaff ? '订单管理' : '주문 관리'}
            </Typography>
            <IconButton onClick={toggleDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* 검색 */}
          <TextField
            fullWidth
            size="small"
            placeholder={isChineseStaff ? "搜索公司名或预约号" : "회사명 또는 예약번호 검색"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider />

        {/* 주문 목록 */}
        <List sx={{ overflow: 'auto', flex: 1 }}>
          {loading ? (
            <ListItem>
              <ListItemText primary={isChineseStaff ? "加载中..." : "로딩 중..."} />
            </ListItem>
          ) : filteredOrders.length === 0 ? (
            <ListItem>
              <ListItemText primary={isChineseStaff ? "没有订单" : "주문이 없습니다."} />
            </ListItem>
          ) : (
            filteredOrders.map((order) => (
              <ListItemButton
                key={order.id}
                selected={selectedOrder?.id === order.id}
                onClick={() => handleOrderSelect(order)}
                sx={{
                  borderLeft: order.unread_count ? '4px solid' : 'none',
                  borderColor: 'error.main',
                }}
              >
                <ListItemIcon>
                  <Badge badgeContent={order.unread_count} color="error">
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {order.company_name[0]}
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {order.company_name}
                      </Typography>
                      <Chip
                        label={getServiceTypeName(order.service_type)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {order.reservation_number}
                      </Typography>
                      {order.last_message && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: order.unread_count ? 'text.primary' : 'text.secondary',
                            fontWeight: order.unread_count ? 'bold' : 'normal',
                          }}
                        >
                          {order.last_message}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {order.last_message_time
                          ? new Date(order.last_message_time).toLocaleString('ko-KR')
                          : new Date(order.created_at).toLocaleString('ko-KR')}
                      </Typography>
                    </>
                  }
                />
                <Chip
                  label={order.status}
                  size="small"
                  color={getStatusColor(order.status)}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* 메인 컨텐츠 영역 */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {selectedOrder ? (
          <>
            {/* 상단 헤더 */}
            <Paper sx={{ mb: 2 }}>
              <Toolbar sx={{ px: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {selectedOrder.company_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedOrder.reservation_number} | {getServiceTypeName(selectedOrder.service_type)}
                  </Typography>
                </Box>
                
                {/* 고객 프로필 및 주문 상세 버튼 */}
                <Stack direction="row" spacing={1}>
                  {customerProfile && (
                    <Button
                      startIcon={<PersonIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // 고객 프로필 모달 또는 페이지 이동
                        const labels = isChineseStaff 
                          ? { company: '公司', person: '负责人', phone: '电话', email: '邮箱' }
                          : { company: '회사', person: '담당자', phone: '연락처', email: '이메일' };
                        alert(`${isChineseStaff ? '客户信息' : '고객 정보'}:\n${labels.company}: ${customerProfile.company_name}\n${labels.person}: ${customerProfile.contact_person}\n${labels.phone}: ${customerProfile.phone}\n${labels.email}: ${customerProfile.email || 'N/A'}`);
                      }}
                    >
                      {isChineseStaff ? '客户信息' : '고객 정보'}
                    </Button>
                  )}
                  <Button
                    startIcon={<OrderIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // 주문 상세 페이지로 이동
                      const detailPath = `/dashboard/orders/${selectedOrder.service_type}/${selectedOrder.reservation_number}`;
                      router.push(detailPath);
                    }}
                  >
                    {isChineseStaff ? '订单详情' : '주문 상세'}
                  </Button>
                  <Button
                    startIcon={<ViewIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(`/dashboard/orders/${selectedOrder.service_type}/${selectedOrder.reservation_number}`, '_blank')}
                  >
                    {isChineseStaff ? '在新窗口打开' : '새 창에서 보기'}
                  </Button>
                </Stack>
              </Toolbar>
            </Paper>

            {/* 채팅 패널 */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <ChatPanel
                key={selectedOrder.reservation_number}
                reservationNumber={selectedOrder.reservation_number}
                serviceType={selectedOrder.service_type}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <ChatIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              {isChineseStaff ? '选择订单开始聊天' : '주문을 선택하여 채팅을 시작하세요'}
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
}