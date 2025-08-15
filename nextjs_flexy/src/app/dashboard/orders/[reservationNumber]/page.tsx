'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Modal,
  Backdrop,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import {
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Science as ScienceIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as LocalShippingIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/app/components/shared/ParentCard';
import BlankCard from '@/app/components/shared/BlankCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reservationNumber = params.reservationNumber as string;


  const [tabValue, setTabValue] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 디버깅: Supabase 클라이언트 확인
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Determine service type from reservation number prefix
  const getServiceType = (reservationNumber: string) => {
    const prefix = reservationNumber.split('-')[0];
    switch (prefix) {
      case 'DLSY':
        return 'market_research';
      case 'DL':
        return 'inspection'; // 검품감사는 'DL-' prefix 사용
      case 'IN':
        return 'inspection'; // Legacy 지원
      case 'DLSP':
        return 'sampling';
      case 'BO':
        return 'bulk_order';
      case 'DLBO':
        return 'bulk_order'; // Keep legacy support
      default:
        return 'unknown';
    }
  };

  const serviceType = getServiceType(reservationNumber);

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'market_research':
        return '시장조사 상세정보';
      case 'inspection':
        return '검품감사 상세정보';
      case 'sampling':
        return '샘플링 상세정보';
      case 'bulk_order':
        return '대량주문 상세정보';
      default:
        return '주문 상세정보';
    }
  };

  // 주문 정보 로드
  const fetchOrderDetails = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {
      let data = null;
      let error = null;

      // 서비스 타입별로 적절한 테이블에서 조회
      switch (serviceType) {
        case 'market_research':
          const marketResult = await supabase
            .from('market_research_requests')
            .select('*')
            .eq('reservation_number', reservationNumber)
            .single();

          data = marketResult.data;
          error = marketResult.error;
          break;

        case 'inspection':
          const inspectionResult = await supabase
            .from('inspection_applications')
            .select('*')
            .eq('reservation_number', reservationNumber)
            .single();
          data = inspectionResult.data;
          error = inspectionResult.error;
          break;

        case 'sampling':
          const samplingResult = await supabase
            .from('sample_orders')
            .select(
              `
              *,
              orders (
                order_number,
                company_name,
                contact_person,
                contact_phone,
                contact_email,
                status,
                created_at,
                updated_at
              )
            `
            )
            .eq('order_number', reservationNumber)
            .single();

          if (samplingResult.data && !samplingResult.error) {
            // 데이터 구조 평탄화
            data = {
              ...samplingResult.data,
              ...samplingResult.data.orders,
            };
          } else {
            data = samplingResult.data;
          }
          error = samplingResult.error;
          break;

        case 'bulk_order':
          const bulkResult = await supabase
            .from('bulk_orders')
            .select(
              `
              *,
              orders (
                order_number,
                company_name,
                contact_person,
                contact_phone,
                contact_email,
                status,
                created_at,
                updated_at
              )
            `
            )
            .eq('order_number', reservationNumber)
            .single();

          if (bulkResult.data && !bulkResult.error) {
            // 데이터 구조 평탄화
            data = {
              ...bulkResult.data,
              ...bulkResult.data.orders,
            };
          } else {
            data = bulkResult.data;
          }
          error = bulkResult.error;
          break;

        default:
          setError('지원하지 않는 서비스 타입입니다.');
          return;
      }


      if (data && !error) {
        setData(data);

        // 관련 파일들도 로드
        const { data: filesData, error: filesError } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('reservation_number', reservationNumber);

        if (filesData && !filesError) {
          setFiles(filesData);
        } else {
          setFiles([]);
        }
      } else {
        setError(`${getServiceTitle()} 정보를 찾을 수 없습니다.`);
      }
    } catch (error) {
      setError('주문 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [reservationNumber, serviceType]);

  // 채팅 메시지 로드
  const loadChatMessages = async () => {
    setLoadingChat(true);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .order('created_at', { ascending: true });

      if (error) {
      } else {
        setChatMessages(data || []);
      }
    } catch (error) {
    } finally {
      setLoadingChat(false);
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!chatMessage.trim()) return;


    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // serviceType을 URL 형식으로 변환
      const getServiceTypeForDB = () => {
        switch (serviceType) {
          case 'market_research':
            return 'market-research';
          case 'inspection':
            return 'inspection';
          case 'sampling':
            return 'sampling';
          case 'bulk_order':
            return 'bulk-order';
          default:
            return null;
        }
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          reservation_number: reservationNumber,
          sender_id: user?.id,
          sender_name: user?.email || '사용자',
          sender_role: 'customer',
          original_message: chatMessage,
          original_language: 'ko',
          message_type: 'text',
          service_type: getServiceTypeForDB(), // service_type 추가
        })
        .select()
        .single();

      if (error) {
      } else {
        setChatMessage('');

        // 스크롤을 아래로
        setTimeout(() => {
          chatScrollRef.current?.scrollTo({
            top: chatScrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!reservationNumber) return;

    // 주문 정보와 채팅을 동시에 로드

    // Supabase Realtime 구독 설정
    const channel = supabase
      .channel(`chat:${reservationNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT와 UPDATE 모두 감지
          schema: 'public',
          table: 'chat_messages',
          filter: `reservation_number=eq.${reservationNumber}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChatMessages((prev) => [...prev, payload.new as any]);
          } else if (payload.eventType === 'UPDATE') {
            // 번역 업데이트
            setChatMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          }
        }
      )
      .subscribe((status) => {
      });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservationNumber]);

  // 채팅 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileUpload = () => {
    // 파일 업로드 로직
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (e: any) => {
      const files = e.target.files;
      // 파일 업로드 처리
    };
    input.click();
  };

  // 채팅 메시지 전송
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      setLoadingChat(true);

      // 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // 언어 감지
      const detectLanguage = (text: string): 'ko' | 'zh' => {
        const chineseRegex = /[\u4e00-\u9fa5]/;
        const koreanRegex = /[\uac00-\ud7af]/;
        const chineseCount = (text.match(chineseRegex) || []).length;
        const koreanCount = (text.match(koreanRegex) || []).length;
        return chineseCount > koreanCount ? 'zh' : 'ko';
      };

      // 메시지 직접 저장 (Supabase로)
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          reservation_number: reservationNumber,
          sender_id: user?.id,
          sender_name:
            userProfile?.contact_person || userProfile?.company_name || user?.email || 'Unknown',
          sender_role: userProfile?.role || 'customer',
          original_message: chatMessage,
          original_language: detectLanguage(chatMessage),
          message_type: 'text',
          // 번역은 Edge Function이 자동으로 처리
        })
        .select()
        .single();

      if (error) {
        alert('메시지 전송에 실패했습니다.');
      } else {
        setChatMessage(''); // 입력창 초기화

        // Edge Function 직접 호출로 번역 처리
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke(
            'translate-message',
            {
              body: { record: data },
            }
          );

          if (functionError) {
          } else {
          }
        } catch (translationError) {
        }
      }
    } catch (error) {
      alert('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setLoadingChat(false);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOrderSample = () => {
    // 샘플 주문 로직
    // TODO: 샘플 주문 페이지로 이동 또는 모달 열기
  };

  const handlePayment = () => {
    // 결제 진행 로직
    // TODO: 결제 페이지로 이동
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <PageContainer title="시장조사 상세" description="시장조사 상세 정보">
        <Breadcrumb
          title="시장조사 상세"
          items={[
            { title: '홈', to: '/' },
            { title: '시장조사 목록', to: '/orders' },
            { title: reservationNumber },
          ]}
        />
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  // 실제 데이터 구조에 맞게 정리
  const orderData = data; // fetchOrderDetails에서 설정한 데이터

  // 서비스 타입별로 데이터를 다르게 처리하지만,
  // 현재는 market_research_requests 테이블의 데이터만 있음

  // 기본 데이터 (DB 데이터가 없을 때 사용)
  const defaultData = {
    request: {
      reservation_number: reservationNumber,
      status: 'submitted',
      created_at: new Date().toISOString(),
      research_type: '제품 조사',
      product_name: '샘플 제품',
      production_quantity: 1000,
      company_name: '샘플 회사',
      contact_person: '담당자',
      contact_phone: '010-1234-5678',
      special_requirements: '샘플 요청사항입니다.',
      logo_required: true,
      logo_details: '로고 인쇄 요청',
      custom_box_required: true,
      box_details: '커스텀 박스 제작 요청',
      moq_check: true,
    },
    // Mock files removed - using real data from database
    sample: {
      sample_available: true,
      sample_unit_price: 50000,
      sample_make_time: '3-5일',
      hs_code: '8517.12.00',
      certification_required: true,
      cert_cost: 200000,
    },
    cost: {
      first_payment: 1500000,
      second_payment_estimate: 300000,
      unit_price: 15000,
      exw_total: 1200000,
      tariff: 8,
      vat: 150000,
      total_supply_price: 1950000,
      commission_rate: 5,
      commission_amount: 75000,
      shipping_method: '해상운송',
      china_unit_price: 120,
      exchange_rate: 190,
    },
  };

  // 진행 상태 단계
  const steps = [
    {
      label: '신청접수',
      icon: <BusinessIcon sx={{ fontSize: 24 }} />,
      date: orderData?.created_at,
    },
    {
      label: '공장조사',
      icon: <ScienceIcon sx={{ fontSize: 24 }} />,
      date:
        orderData?.status === 'in_progress' || orderData?.status === 'completed'
          ? orderData?.updated_at
          : null,
    },
    {
      label: '조사완료',
      icon: <CheckCircleIcon sx={{ fontSize: 24 }} />,
      date: orderData?.status === 'completed' ? orderData?.updated_at : null,
    },
  ];
  const currentStep =
    orderData?.status === 'completed' ? 2 : orderData?.status === 'in_progress' ? 1 : 0;

  return (
    <Box
      sx={{
        height: 'calc(100vh - 170px)',
        margin: '0 -240px', // 좌우 더 확장
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 0,
          boxShadow: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 헤더 영역 */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {getServiceTitle()}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">오더번호: {reservationNumber}</Typography>
                    <Chip
                      label={
                        orderData?.status === 'completed'
                          ? '조사완료'
                          : orderData?.status === 'in_progress'
                            ? '진행중'
                            : '신청접수'
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          orderData?.status === 'completed'
                            ? 'success.main'
                            : orderData?.status === 'in_progress'
                              ? 'warning.main'
                              : 'grey.300',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Stack>
                </Box>
                {/* 컴팩트한 진행 현황 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  {steps.map((step, index) => (
                    <Box key={step.label} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: index <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index <= currentStep ? 'primary.main' : 'white',
                        }}
                      >
                        {React.cloneElement(step.icon, { sx: { fontSize: 18 } })}
                      </Box>
                      <Box sx={{ ml: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.9)', display: 'block' }}
                        >
                          {step.label}
                        </Typography>
                        {step.date && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}
                          >
                            {new Date(step.date).toLocaleDateString('ko-KR')}
                          </Typography>
                        )}
                      </Box>
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            width: 40,
                            height: 2,
                            bgcolor: index < currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                            mx: 2,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/orders')}
                sx={{ color: 'primary.main', bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
              >
                목록으로
              </Button>
              {/* 동적 액션 버튼들 */}
              {orderData?.status === 'completed' && orderData?.sample_availability && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleOrderSample}
                >
                  샘플 주문하기
                </Button>
              )}
              {orderData?.status === 'quoted' && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PaymentIcon />}
                  onClick={handlePayment}
                >
                  결제하기
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* 메인 컨텐츠 영역 */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 왼쪽: 정보 */}
          <Box
            sx={{
              flex: 1,
              borderRight: 1,
              borderColor: 'divider',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                position: 'sticky',
                top: 0,
                bgcolor: 'background.paper',
                zIndex: 10,
                px: 3,
                pt: 3,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="detail tabs"
                variant="fullWidth"
              >
                {serviceType === 'inspection'
                  ? [
                      <Tab
                        key="tab1"
                        icon={<BusinessIcon />}
                        label="신청정보"
                        iconPosition="start"
                      />,
                      <Tab
                        key="tab2"
                        icon={<AccessTimeIcon />}
                        label="예약정보"
                        iconPosition="start"
                      />,
                      <Tab
                        key="tab3"
                        icon={<CheckCircleIcon />}
                        label="검품결과"
                        iconPosition="start"
                      />,
                      <Tab
                        key="tab4"
                        icon={<AttachMoneyIcon />}
                        label="비용정산"
                        iconPosition="start"
                      />,
                    ]
                  : serviceType === 'sampling'
                    ? [
                        <Tab
                          key="tab1"
                          icon={<BusinessIcon />}
                          label="신청정보"
                          iconPosition="start"
                        />,
                        <Tab
                          key="tab2"
                          icon={<ShoppingCartIcon />}
                          label="샘플정보"
                          iconPosition="start"
                        />,
                        <Tab
                          key="tab3"
                          icon={<LocalShippingIcon />}
                          label="배송정보"
                          iconPosition="start"
                        />,
                        <Tab
                          key="tab4"
                          icon={<AttachFileIcon />}
                          label="관련자료"
                          iconPosition="start"
                        />,
                      ]
                    : serviceType === 'bulk_order'
                      ? [
                          <Tab
                            key="tab1"
                            icon={<BusinessIcon />}
                            label="신청정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab2"
                            icon={<ShoppingCartIcon />}
                            label="주문정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab3"
                            icon={<LocalShippingIcon />}
                            label="배송정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab4"
                            icon={<AttachFileIcon />}
                            label="관련자료"
                            iconPosition="start"
                          />,
                        ]
                      : [
                          <Tab
                            key="tab1"
                            icon={<BusinessIcon />}
                            label="신청정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab2"
                            icon={<LocalShippingIcon />}
                            label="공장정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab3"
                            icon={<InventoryIcon />}
                            label="제품정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab4"
                            icon={<AttachMoneyIcon />}
                            label="가격정보"
                            iconPosition="start"
                          />,
                          <Tab
                            key="tab5"
                            icon={<AttachFileIcon />}
                            label="관련자료"
                            iconPosition="start"
                          />,
                        ]}
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {/* 신청정보 탭 */}
              <TabPanel value={tabValue} index={0}>
                {serviceType === 'bulk_order' ? (
                  // 대량주문 신청정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          신청자 정보
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    회사명
                                  </TableCell>
                                  <TableCell>{data?.company_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    담당자
                                  </TableCell>
                                  <TableCell>{data?.contact_person || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    연락처
                                  </TableCell>
                                  <TableCell>{data?.contact_phone || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    이메일
                                  </TableCell>
                                  <TableCell>{data?.contact_email || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          주문 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                예약번호
                              </TableCell>
                              <TableCell>{data?.reservation_number || reservationNumber}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                신청일시
                              </TableCell>
                              <TableCell>
                                {data?.created_at
                                  ? new Date(data.created_at).toLocaleString('ko-KR')
                                  : '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                상태
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    data?.status === 'completed'
                                      ? '완료'
                                      : data?.status === 'in_progress'
                                        ? '진행중'
                                        : '접수'
                                  }
                                  color={
                                    data?.status === 'completed'
                                      ? 'success'
                                      : data?.status === 'in_progress'
                                        ? 'warning'
                                        : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {data?.marketResearch && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  연계 시장조사
                                </TableCell>
                                <TableCell>
                                  <Chip label="시장조사 연계" color="info" size="small" />
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    제품: {data.marketResearch.product_name || '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {data?.additional_requests && (
                      <Box sx={{ mt: 4 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          추가 요청사항
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.additional_requests}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                ) : serviceType === 'sampling' ? (
                  // 샘플링 신청정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          신청자 정보
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    회사명
                                  </TableCell>
                                  <TableCell>{data?.company_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    담당자
                                  </TableCell>
                                  <TableCell>{data?.contact_person || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    연락처
                                  </TableCell>
                                  <TableCell>{data?.contact_phone || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    이메일
                                  </TableCell>
                                  <TableCell>{data?.contact_email || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          주문 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                예약번호
                              </TableCell>
                              <TableCell>{data?.order_number || reservationNumber}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                신청일시
                              </TableCell>
                              <TableCell>
                                {data?.created_at
                                  ? new Date(data.created_at).toLocaleString('ko-KR')
                                  : '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                상태
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    data?.status === 'completed'
                                      ? '완료'
                                      : data?.status === 'in_progress'
                                        ? '진행중'
                                        : '접수'
                                  }
                                  color={
                                    data?.status === 'completed'
                                      ? 'success'
                                      : data?.status === 'in_progress'
                                        ? 'warning'
                                        : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {data?.sampleOrder?.research_id && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  연계 시장조사
                                </TableCell>
                                <TableCell>
                                  <Chip label="시장조사 연계" color="info" size="small" />
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {data?.sampleOrder?.requirements && (
                      <Box sx={{ mt: 4 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          요청사항
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.sampleOrder.requirements}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                ) : serviceType === 'inspection' ? (
                  // 검품감사 신청정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          신청자 정보
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    회사명
                                  </TableCell>
                                  <TableCell>{data?.company_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    담당자
                                  </TableCell>
                                  <TableCell>{data?.contact_person || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    연락처
                                  </TableCell>
                                  <TableCell>{data?.contact_phone || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    이메일
                                  </TableCell>
                                  <TableCell>{data?.contact_email || '-'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          서비스 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                서비스 유형
                              </TableCell>
                              <TableCell>
                                {data?.service_subtype === 'quality_inspection'
                                  ? '품질검사'
                                  : data?.service_subtype === 'factory_audit'
                                    ? '공장심사'
                                    : data?.service_subtype === 'loading_inspection'
                                      ? '선적검사'
                                      : '-'}
                              </TableCell>
                            </TableRow>
                            {data?.product_name && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  제품명
                                </TableCell>
                                <TableCell>{data.product_name}</TableCell>
                              </TableRow>
                            )}
                            {data?.production_quantity && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  생산수량
                                </TableCell>
                                <TableCell>{data.production_quantity}개</TableCell>
                              </TableRow>
                            )}
                            {data?.inspection_method && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  검품방법
                                </TableCell>
                                <TableCell>
                                  {data.inspection_method === 'standard' ? '표준검품' : '전수검품'}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          공장 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                공장명
                              </TableCell>
                              <TableCell>{data?.factory_name || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                담당자
                              </TableCell>
                              <TableCell>{data?.factory_contact || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                연락처
                              </TableCell>
                              <TableCell>{data?.factory_phone || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                주소
                              </TableCell>
                              <TableCell>{data?.factory_address || '-'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {data?.special_requirements && (
                      <Box sx={{ mt: 4 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          특별 요청사항
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.special_requirements}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  // 시장조사 신청정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    {/* 신청 정보 */}
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          신청 정보
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    품명
                                  </TableCell>
                                  <TableCell>{orderData?.product_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    조사수량
                                  </TableCell>
                                  <TableCell>
                                    {orderData?.research_quantity?.toLocaleString() || '-'}개
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>

                            {/* 조사수량 밑에 제품 사진 표시 */}
                            {(() => {
                              const photos = orderData?.research_photos || [];
                              if (!photos || photos.length === 0) return null;

                              return (
                                <Box sx={{ mt: 2 }}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ color: 'success.main' }}
                                  >
                                    제품 사진 ({photos.length}개)
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 1,
                                      overflowX: 'auto',
                                      pb: 1,
                                      '&::-webkit-scrollbar': {
                                        height: 4,
                                      },
                                      '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: 10,
                                      },
                                      '&::-webkit-scrollbar-thumb': {
                                        background: '#888',
                                        borderRadius: 10,
                                      },
                                      '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#555',
                                      },
                                    }}
                                  >
                                    {photos.map((photoUrl: string, index: number) => (
                                      <Box
                                        key={index}
                                        sx={{
                                          minWidth: 80,
                                          width: 80,
                                          height: 80,
                                          position: 'relative',
                                          cursor: 'pointer',
                                          borderRadius: 1,
                                          overflow: 'hidden',
                                          border: '2px solid',
                                          borderColor: 'success.light',
                                          '&:hover': {
                                            borderColor: 'success.main',
                                            transform: 'scale(1.05)',
                                            transition: 'all 0.3s ease',
                                          },
                                        }}
                                        onClick={() => {
                                          setSelectedImage(photoUrl);
                                          setModalOpen(true);
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={photoUrl}
                                          alt={`제품 사진 ${index + 1}`}
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                          }}
                                        />
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              );
                            })()}
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    신청일시
                                  </TableCell>
                                  <TableCell>
                                    {orderData?.created_at
                                      ? new Date(orderData.created_at).toLocaleString('ko-KR')
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    상세 페이지 URL
                                  </TableCell>
                                  <TableCell>
                                    {orderData?.detail_page ? (
                                      <a
                                        href={orderData.detail_page}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#1976d2', textDecoration: 'underline' }}
                                      >
                                        {orderData.detail_page}
                                      </a>
                                    ) : (
                                      '없음'
                                    )}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    MOQ 확인 여부
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={orderData?.moq_check ? '확인 필요' : '미확인'}
                                      color={orderData?.moq_check ? 'warning' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    로고 인쇄
                                  </TableCell>
                                  <TableCell>
                                    {orderData?.logo_required ? (
                                      <>
                                        <Chip label="로고 인쇄 필요" color="warning" size="small" />
                                        {orderData?.logo_details && (
                                          <Typography
                                            variant="body2"
                                            sx={{ mt: 1, color: 'text.secondary' }}
                                          >
                                            {orderData.logo_details}
                                          </Typography>
                                        )}
                                      </>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        요청 없음
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    커스텀 박스
                                  </TableCell>
                                  <TableCell>
                                    {orderData?.custom_box_required ? (
                                      <>
                                        <Chip
                                          label="커스텀 박스 제작"
                                          color="warning"
                                          size="small"
                                        />
                                        {orderData?.box_details && (
                                          <Typography
                                            variant="body2"
                                            sx={{ mt: 1, color: 'text.secondary' }}
                                          >
                                            {orderData.box_details}
                                          </Typography>
                                        )}
                                      </>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        요청 없음
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </BlankCard>

                    {/* 요청사항 섹션 - 같은 프레임 내 */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                        요청사항
                      </Typography>
                      <Paper sx={{ p: 3, bgcolor: 'grey.100' }} elevation={0}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {orderData?.requirements || '요청사항이 없습니다.'}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* 로고 파일 - 같은 프레임 내 */}
                    {orderData?.logo_file && (
                      <Box sx={{ mt: 4 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          업로드된 로고 파일
                        </Typography>
                        <Grid container spacing={2}>
                          {[orderData.logo_file].map((file: any) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                              <Paper
                                sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => window.open(file.file_url, '_blank')}
                              >
                                {file.mime_type?.startsWith('image/') ? (
                                  <Box
                                    component="img"
                                    src={file.file_url}
                                    alt={file.original_filename}
                                    sx={{
                                      width: '100%',
                                      height: 120,
                                      objectFit: 'contain',
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ py: 3 }}>
                                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                                  </Box>
                                )}
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                  {file.original_filename}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* 박스 디자인 파일 - 같은 프레임 내 */}
                    {false && (
                      <Box sx={{ mt: 4 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          업로드된 박스 디자인 파일
                        </Typography>
                        <Grid container spacing={2}>
                          {files
                            .filter((f: any) => f.upload_category === 'box_design')
                            .map((file: any) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                                <Paper
                                  sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}
                                  onClick={() => window.open(file.file_url, '_blank')}
                                >
                                  {file.mime_type?.startsWith('image/') ? (
                                    <Box
                                      component="img"
                                      src={file.file_url}
                                      alt={file.original_filename}
                                      sx={{
                                        width: '100%',
                                        height: 120,
                                        objectFit: 'contain',
                                      }}
                                    />
                                  ) : (
                                    <Box sx={{ py: 3 }}>
                                      <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                                    </Box>
                                  )}
                                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {file.original_filename}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    )}
                  </Stack>
                )}
              </TabPanel>

              {/* 두번째 탭 - 서비스별 분기 */}
              <TabPanel value={tabValue} index={1}>
                {serviceType === 'bulk_order' ? (
                  // 대량주문 주문정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          주문 아이템
                        </Typography>
                        {data?.order_items && data.order_items.length > 0 ? (
                          <Table>
                            <TableBody>
                              {data.order_items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '20%' }}
                                  >
                                    아이템 {index + 1}
                                  </TableCell>
                                  <TableCell>
                                    <Stack spacing={1}>
                                      <Typography variant="body2">
                                        <strong>제품명:</strong> {item.product_name || '-'}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>주문 수량:</strong>{' '}
                                        {item.order_quantity?.toLocaleString() || '-'}개
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>단가:</strong> ¥
                                        {item.unit_price?.toLocaleString() || '-'}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>총액:</strong> ¥
                                        {item.total_price?.toLocaleString() || '-'}
                                      </Typography>
                                      {item.specifications && (
                                        <Typography variant="body2">
                                          <strong>사양:</strong> {item.specifications}
                                        </Typography>
                                      )}
                                      {item.customization && (
                                        <Typography variant="body2">
                                          <strong>커스터마이징:</strong> {item.customization}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography color="text.secondary">
                            등록된 주문 아이템이 없습니다.
                          </Typography>
                        )}
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          주문 상태
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                주문 상태
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    data?.status === 'completed'
                                      ? '완료'
                                      : data?.status === 'in_progress'
                                        ? '진행중'
                                        : data?.status === 'quoted'
                                          ? '견적 완료'
                                          : '접수'
                                  }
                                  color={
                                    data?.status === 'completed'
                                      ? 'success'
                                      : data?.status === 'in_progress'
                                        ? 'info'
                                        : data?.status === 'quoted'
                                          ? 'warning'
                                          : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {data?.assigned_staff_id && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  담당자 배정
                                </TableCell>
                                <TableCell>배정됨</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>
                  </Stack>
                ) : serviceType === 'sampling' ? (
                  // 샘플링 샘플정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          샘플 아이템
                        </Typography>
                        {data?.sampleOrder?.sample_items &&
                        data.sampleOrder.sample_items.length > 0 ? (
                          <Table>
                            <TableBody>
                              {data.sampleOrder.sample_items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '20%' }}
                                  >
                                    아이템 {index + 1}
                                  </TableCell>
                                  <TableCell>
                                    <Stack spacing={1}>
                                      <Typography variant="body2">
                                        <strong>상품명:</strong> {item.productName || '-'}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>수량:</strong> {item.quantity || '-'}개
                                      </Typography>
                                      {item.specification && (
                                        <Typography variant="body2">
                                          <strong>사양:</strong> {item.specification}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography color="text.secondary">
                            등록된 샘플 아이템이 없습니다.
                          </Typography>
                        )}
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          샘플 상태
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                샘플 상태
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    data?.sampleOrder?.sample_status === 'shipped'
                                      ? '배송완료'
                                      : data?.sampleOrder?.sample_status === 'in_transit'
                                        ? '배송중'
                                        : data?.sampleOrder?.sample_status === 'preparing'
                                          ? '준비중'
                                          : '대기중'
                                  }
                                  color={
                                    data?.sampleOrder?.sample_status === 'shipped'
                                      ? 'success'
                                      : data?.sampleOrder?.sample_status === 'in_transit'
                                        ? 'info'
                                        : data?.sampleOrder?.sample_status === 'preparing'
                                          ? 'warning'
                                          : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {data?.sampleOrder?.tracking_number && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  운송장 번호
                                </TableCell>
                                <TableCell>{data.sampleOrder.tracking_number}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>
                  </Stack>
                ) : serviceType === 'inspection' ? (
                  // 검품감사 예약정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          일정 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                일정 조율 상태
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    data?.schedule_type === 'already_booked'
                                      ? '이미 예약'
                                      : '두리무역 협의'
                                  }
                                  color={
                                    data?.schedule_type === 'already_booked' ? 'success' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {data?.confirmed_date && (
                              <>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    검품 시작일
                                  </TableCell>
                                  <TableCell>{data.confirmed_date}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    검품 일수
                                  </TableCell>
                                  <TableCell>{data.inspection_days}일</TableCell>
                                </TableRow>
                              </>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          중국 담당자
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {data?.assigned_chinese_staff ? '담당자 배정됨' : '담당자 배정 대기중'}
                        </Typography>
                      </CardContent>
                    </BlankCard>
                  </Stack>
                ) : (
                  // 시장조사 공장정보
                  <Box sx={{ p: 3 }}>
                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          공장 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            {/* 공급업체 정보는 DB에 없으므로 제거
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            업종
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>조사중</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}>
                            법인구분
                          </TableCell>
                          <TableCell sx={{ width: '35%' }}>조사중</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            인원규모
                          </TableCell>
                          <TableCell>조사중</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            개업시간
                          </TableCell>
                          <TableCell>조사중</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            기업상태
                          </TableCell>
                          <TableCell>조사중</TableCell>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            등록자본금
                          </TableCell>
                          <TableCell>조사중</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            등록주소
                          </TableCell>
                          <TableCell colSpan={3}>조사중</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            영업범위
                          </TableCell>
                          <TableCell colSpan={3}>조사중</TableCell>
                        </TableRow>
                        */}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>
                  </Box>
                )}
              </TabPanel>

              {/* 세번째 탭 - 서비스별 분기 */}
              <TabPanel value={tabValue} index={2}>
                {serviceType === 'bulk_order' ? (
                  // 대량주문 배송정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          배송 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                배송 주소
                              </TableCell>
                              <TableCell>{data?.delivery_address || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                희망 납기일
                              </TableCell>
                              <TableCell>
                                {data?.delivery_date
                                  ? new Date(data.delivery_date).toLocaleDateString('ko-KR')
                                  : '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                배송 방법
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={data?.delivery_method || '-'}
                                  color={
                                    data?.delivery_method === 'DDP'
                                      ? 'primary'
                                      : data?.delivery_method === 'FOB'
                                        ? 'secondary'
                                        : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {(data?.packing_requirements || data?.quality_standards) && (
                      <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            포장 및 품질 요구사항
                          </Typography>
                          <Table>
                            <TableBody>
                              {data?.packing_requirements && (
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    포장 요구사항
                                  </TableCell>
                                  <TableCell>{data.packing_requirements}</TableCell>
                                </TableRow>
                              )}
                              {data?.quality_standards && (
                                <TableRow>
                                  <TableCell
                                    component="th"
                                    sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                  >
                                    품질 기준
                                  </TableCell>
                                  <TableCell>{data.quality_standards}</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </BlankCard>
                    )}

                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          진행 상황
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data?.status === 'completed'
                            ? '대량주문이 완료되었습니다.'
                            : data?.status === 'in_progress'
                              ? '대량주문이 진행 중입니다.'
                              : data?.status === 'quoted'
                                ? '견적이 완료되었습니다. 결제를 진행해주세요.'
                                : '대량주문이 접수되었습니다. 견적을 준비 중입니다.'}
                        </Typography>
                      </CardContent>
                    </BlankCard>
                  </Stack>
                ) : serviceType === 'sampling' ? (
                  // 샘플링 배송정보
                  <Stack spacing={3} sx={{ p: 2 }}>
                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          배송 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                수령 주소
                              </TableCell>
                              <TableCell>
                                {data?.sampleOrder?.sample_receive_address || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                수령인
                              </TableCell>
                              <TableCell>{data?.sampleOrder?.receiver_name || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                수령인 연락처
                              </TableCell>
                              <TableCell>{data?.sampleOrder?.receiver_phone || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                배송 방법
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={data?.sampleOrder?.shipping_method || '-'}
                                  color={
                                    data?.sampleOrder?.shipping_method === '항공'
                                      ? 'primary'
                                      : 'secondary'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          통관 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                통관 유형
                              </TableCell>
                              <TableCell>
                                {data?.sampleOrder?.customs_clearance_type === 'personal'
                                  ? '개인통관'
                                  : '일반통관'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                통관번호
                              </TableCell>
                              <TableCell>
                                {data?.sampleOrder?.customs_clearance_number || '-'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {data?.sampleOrder?.shipping_cost && (
                      <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            배송비
                          </Typography>
                          <Typography variant="h5" color="primary">
                            ₩{data.sampleOrder.shipping_cost.toLocaleString()}
                          </Typography>
                        </CardContent>
                      </BlankCard>
                    )}
                  </Stack>
                ) : serviceType === 'inspection' ? (
                  // 검품감사 검품결과
                  <Stack spacing={3} sx={{ p: 2 }}>
                    {data?.inspection_report ? (
                      <>
                        <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              검품 보고서
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AttachFileIcon />}
                              href={data.inspection_report}
                              target="_blank"
                            >
                              보고서 다운로드
                            </Button>
                          </CardContent>
                        </BlankCard>

                        {data?.pass_fail_status && (
                          <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                검품 결과
                              </Typography>
                              <Chip
                                label={data.pass_fail_status}
                                color={data.pass_fail_status === '합격' ? 'success' : 'error'}
                                size="medium"
                              />
                            </CardContent>
                          </BlankCard>
                        )}

                        {data?.improvement_items && data.improvement_items.length > 0 && (
                          <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                개선 요구사항
                              </Typography>
                              {data.improvement_items.map((item: string, index: number) => (
                                <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                                  • {item}
                                </Typography>
                              ))}
                            </CardContent>
                          </BlankCard>
                        )}
                      </>
                    ) : (
                      <Alert severity="info">검품 결과가 아직 등록되지 않았습니다.</Alert>
                    )}
                  </Stack>
                ) : (
                  // 시장조사 제품정보
                  <Stack spacing={3} sx={{ p: 3 }}>
                    {/* 제품 기본 정보 */}
                    <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          제품 기본정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                제품번호
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                {data?.product_code || '조사중'}
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                견적수량
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                {data?.quoted_quantity?.toLocaleString() || '조사중'}개
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                박스당 제품개수
                              </TableCell>
                              <TableCell>{data?.units_per_box || '조사중'}개</TableCell>
                              <TableCell colSpan={2}></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                박스 길이
                              </TableCell>
                              <TableCell>
                                {data?.box_length ? `${data.box_length}cm` : '조사중'}
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                박스 너비
                              </TableCell>
                              <TableCell>
                                {data?.box_width ? `${data.box_width}cm` : '조사중'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                박스 높이
                              </TableCell>
                              <TableCell>
                                {data?.box_height ? `${data.box_height}cm` : '조사중'}
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                총 박스수
                              </TableCell>
                              <TableCell>{data?.total_boxes || '조사중'}박스</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                기타사항
                              </TableCell>
                              <TableCell colSpan={3}>
                                {data?.other_matters_kr || data?.other_matters || '조사중'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {/* 제품 사진 */}
                    {(() => {
                      const productImages =
                        files?.filter(
                          (file: any) =>
                            file.upload_purpose === 'product' &&
                            file.mime_type?.startsWith('image/')
                        ) || [];

                      return (
                        productImages.length > 0 && (
                          <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                            <CardContent>
                              <Typography
                                variant="h6"
                                gutterBottom
                                fontWeight="bold"
                                sx={{ mb: 3 }}
                              >
                                <ImageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                제품 사진
                              </Typography>
                              <Grid container spacing={2}>
                                {productImages.map((file: any, index: number) => (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                                    <Box
                                      sx={{
                                        position: 'relative',
                                        paddingTop: '75%',
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        boxShadow: 1,
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: 3,
                                          '& .preview-overlay': {
                                            opacity: 1,
                                          },
                                        },
                                      }}
                                      onClick={() =>
                                        window.open(file.file_url || file.file_path, '_blank')
                                      }
                                    >
                                      <Box
                                        component="img"
                                        src={file.file_url || file.file_path}
                                        alt={file.original_filename}
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                      />
                                      <Box
                                        className="preview-overlay"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          bgcolor: 'rgba(0,0,0,0.7)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          opacity: 0,
                                          transition: 'opacity 0.2s',
                                        }}
                                      >
                                        <Typography variant="body2" sx={{ color: 'white' }}>
                                          클릭하여 크게 보기
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                                    >
                                      {file.original_filename}
                                    </Typography>
                                  </Grid>
                                ))}
                              </Grid>
                            </CardContent>
                          </BlankCard>
                        )
                      );
                    })()}

                    {/* 샘플 정보 */}
                    <BlankCard sx={{ bgcolor: 'secondary.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          샘플 정보
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                샘플재고 유무
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                {data?.sample_available !== undefined ? (
                                  <Chip
                                    label={data.sample_available ? '재고 있음' : '재고 없음'}
                                    color={data.sample_available ? 'success' : 'default'}
                                    size="small"
                                  />
                                ) : (
                                  '조사중'
                                )}
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                샘플 단가
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                {data?.sample_unit_price
                                  ? `${data.sample_unit_price.toLocaleString()}원`
                                  : '조사중'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                주문 가능 수량
                              </TableCell>
                              <TableCell>
                                {data?.sample_order_qty ? `${data.sample_order_qty}개` : '조사중'}
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                샘플 무게
                              </TableCell>
                              <TableCell>
                                {data?.sample_weight ? `${data.sample_weight}kg` : '조사중'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                제작 기간
                              </TableCell>
                              <TableCell>{data?.sample_make_time || '조사중'}</TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                              >
                                HS코드
                              </TableCell>
                              <TableCell>{data?.hs_code || '조사중'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>

                    {/* 포장 요구사항 */}
                    <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                          포장 요구사항
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                로고 필요 여부
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                <Chip
                                  label={orderData?.logo_required ? '필요' : '불필요'}
                                  color={orderData?.logo_required ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell
                                component="th"
                                sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                              >
                                커스텀 박스 필요 여부
                              </TableCell>
                              <TableCell sx={{ width: '35%' }}>
                                <Chip
                                  label={orderData?.custom_box_required ? '필요' : '불필요'}
                                  color={orderData?.custom_box_required ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            {(orderData?.logo_required || orderData?.custom_box_required) && (
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  로고 상세
                                </TableCell>
                                <TableCell>
                                  {orderData?.logo_required ? orderData?.logo_details || '-' : '-'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  박스 상세
                                </TableCell>
                                <TableCell>
                                  {orderData?.custom_box_required
                                    ? orderData?.box_details || '-'
                                    : '-'}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </BlankCard>
                  </Stack>
                )}
              </TabPanel>

              {/* 네번째 탭 - 서비스별 분기 */}
              <TabPanel value={tabValue} index={3}>
                {serviceType === 'bulk_order' ? (
                  // 대량주문 관련자료
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {false ? (
                        <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              업로드된 파일
                            </Typography>
                            <Grid container spacing={2}>
                              {files.map((file: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                  <Paper
                                    sx={{
                                      p: 2,
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: 'grey.100' },
                                    }}
                                    onClick={() => window.open(file.file_url, '_blank')}
                                  >
                                    {file.mime_type?.startsWith('image/') ? (
                                      <Box
                                        component="img"
                                        src={file.file_url}
                                        alt={file.original_filename}
                                        sx={{
                                          width: '100%',
                                          height: 150,
                                          objectFit: 'contain',
                                        }}
                                      />
                                    ) : (
                                      <Box sx={{ py: 4 }}>
                                        <AttachFileIcon
                                          sx={{ fontSize: 48, color: 'text.secondary' }}
                                        />
                                      </Box>
                                    )}
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                      {file.original_filename}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <AttachFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography color="text.secondary">등록된 파일이 없습니다.</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ) : serviceType === 'sampling' ? (
                  // 샘플링 관련자료
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {false ? (
                        <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              업로드된 파일
                            </Typography>
                            <Grid container spacing={2}>
                              {files.map((file: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                  <Paper
                                    sx={{
                                      p: 2,
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: 'grey.100' },
                                    }}
                                    onClick={() => window.open(file.file_url, '_blank')}
                                  >
                                    {file.mime_type?.startsWith('image/') ? (
                                      <Box
                                        component="img"
                                        src={file.file_url}
                                        alt={file.original_filename}
                                        sx={{
                                          width: '100%',
                                          height: 150,
                                          objectFit: 'contain',
                                        }}
                                      />
                                    ) : (
                                      <Box sx={{ py: 4 }}>
                                        <AttachFileIcon
                                          sx={{ fontSize: 48, color: 'text.secondary' }}
                                        />
                                      </Box>
                                    )}
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                      {file.original_filename}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <AttachFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography color="text.secondary">등록된 파일이 없습니다.</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ) : serviceType === 'inspection' ? (
                  // 검품감사 비용정산
                  <Stack spacing={3} sx={{ p: 2 }}>
                    {data?.total_cost ? (
                      <>
                        <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              결제 정보
                            </Typography>
                            <Table size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell>총 금액</TableCell>
                                  <TableCell align="right">
                                    <Typography variant="h6" color="primary">
                                      ₩{data.total_data?.toLocaleString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>부가세</TableCell>
                                  <TableCell align="right">
                                    ₩{data.vat_amount?.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>결제 상태</TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={data.payment_status === 'paid' ? '결제완료' : '대기중'}
                                      color={data.payment_status === 'paid' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </BlankCard>

                        <BlankCard sx={{ bgcolor: 'primary.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              문서 다운로드
                            </Typography>
                            <Stack spacing={1}>
                              {data.quotation_pdf && (
                                <Button
                                  variant="outlined"
                                  startIcon={<AttachFileIcon />}
                                  href={data.quotation_pdf}
                                  target="_blank"
                                  fullWidth
                                >
                                  견적서
                                </Button>
                              )}
                              {data.tax_invoice_pdf && (
                                <Button
                                  variant="outlined"
                                  startIcon={<AttachFileIcon />}
                                  href={data.tax_invoice_pdf}
                                  target="_blank"
                                  fullWidth
                                >
                                  세금계산서
                                </Button>
                              )}
                            </Stack>
                          </CardContent>
                        </BlankCard>
                      </>
                    ) : (
                      <Alert severity="info">견적이 아직 준비되지 않았습니다.</Alert>
                    )}
                  </Stack>
                ) : (
                  // 시장조사 가격정보
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {/* 1차 결제 정보 */}
                      <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            1차 결제 정보
                          </Typography>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                                >
                                  중국단가
                                </TableCell>
                                <TableCell sx={{ width: '35%' }}>
                                  {data?.china_unit_price || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                                >
                                  환율
                                </TableCell>
                                <TableCell sx={{ width: '35%' }}>
                                  {data?.exchange_rate || '조사중'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  EXW 합계
                                </TableCell>
                                <TableCell>
                                  {data?.exw_total?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  중국 운송료
                                </TableCell>
                                <TableCell>
                                  {data?.china_shipping_fee?.toLocaleString() || '조사중'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  수수료(5%)
                                </TableCell>
                                <TableCell>
                                  {data?.commission_amount?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  1차 상세비용
                                </TableCell>
                                <TableCell>{data?.first_payment_detail || '조사중'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  1차 결제비용
                                </TableCell>
                                <TableCell>
                                  {data?.first_payment?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  운송방식
                                </TableCell>
                                <TableCell>{data?.shipping_method || '조사중'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </BlankCard>

                      {/* 2차 결제 예상 정보 */}
                      <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            2차 결제 예상 정보
                          </Typography>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                                >
                                  예상단가 (한국 도착)
                                </TableCell>
                                <TableCell sx={{ width: '35%' }}>
                                  {data?.unit_price?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', width: '15%', bgcolor: 'grey.50' }}
                                >
                                  1차 결제금액
                                </TableCell>
                                <TableCell sx={{ width: '35%' }}>
                                  {data?.first_payment?.toLocaleString() || '조사중'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  2차 결제 예상 금액
                                </TableCell>
                                <TableCell>
                                  {data?.second_payment_estimate?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  1차 상세비용
                                </TableCell>
                                <TableCell>{data?.first_payment_detail || '조사중'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  관세 ({data?.tariff || 8}%)
                                </TableCell>
                                <TableCell>
                                  {(
                                    ((data?.exw_total || 0) * (data?.tariff || 8)) /
                                    100
                                  ).toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  VAT
                                </TableCell>
                                <TableCell>{data?.vat?.toLocaleString() || '조사중'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                >
                                  한국 도착 예상 공급가
                                </TableCell>
                                <TableCell>
                                  {data?.total_supply_price?.toLocaleString() || '조사중'}
                                </TableCell>
                                <TableCell
                                  component="th"
                                  sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                                ></TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </BlankCard>
                    </Stack>
                  </Box>
                )}
              </TabPanel>

              {/* 관련자료 탭 (시장조사 전용) */}
              {serviceType !== 'inspection' && (
                <TabPanel value={tabValue} index={4}>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {/* 제품 사진 */}
                      {false && (
                        <BlankCard sx={{ bgcolor: 'success.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              제품 사진
                            </Typography>
                            <Grid container spacing={2}>
                              {files
                                .filter(
                                  (f: any) =>
                                    f.upload_category === 'product' &&
                                    f.mime_type?.startsWith('image/')
                                )
                                .map((file: any) => (
                                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                    <Box
                                      sx={{
                                        position: 'relative',
                                        paddingTop: '100%',
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        '&:hover': {
                                          '& .preview-overlay': {
                                            opacity: 1,
                                          },
                                        },
                                      }}
                                      onClick={() => window.open(file.file_url, '_blank')}
                                    >
                                      <Box
                                        component="img"
                                        src={file.file_url}
                                        alt={file.original_filename}
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                      />
                                      <Box
                                        className="preview-overlay"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          bgcolor: 'rgba(0,0,0,0.7)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          opacity: 0,
                                          transition: 'opacity 0.3s',
                                        }}
                                      >
                                        <Typography color="white">미리보기</Typography>
                                      </Box>
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                                    >
                                      {file.original_filename}
                                    </Typography>
                                  </Grid>
                                ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      )}

                      {/* 로고 파일 */}
                      {false && (
                        <BlankCard sx={{ bgcolor: 'warning.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              로고 파일
                            </Typography>
                            <Grid container spacing={2}>
                              {files
                                .filter((f: any) => f.upload_category === 'logo')
                                .map((file: any) => (
                                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                    <Paper
                                      sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'grey.100' },
                                      }}
                                      onClick={() => window.open(file.file_url, '_blank')}
                                    >
                                      {file.mime_type?.startsWith('image/') ? (
                                        <Box
                                          component="img"
                                          src={file.file_url}
                                          alt={file.original_filename}
                                          sx={{
                                            width: '100%',
                                            height: 150,
                                            objectFit: 'contain',
                                          }}
                                        />
                                      ) : (
                                        <Box sx={{ py: 4 }}>
                                          <ImageIcon
                                            sx={{ fontSize: 48, color: 'text.secondary' }}
                                          />
                                        </Box>
                                      )}
                                      <Typography
                                        variant="caption"
                                        sx={{ mt: 1, display: 'block' }}
                                      >
                                        {file.original_filename}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      )}

                      {/* 박스 디자인 파일 */}
                      {false && (
                        <BlankCard sx={{ bgcolor: 'error.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              박스 디자인 파일
                            </Typography>
                            <Grid container spacing={2}>
                              {files
                                .filter((f: any) => f.upload_category === 'box_design')
                                .map((file: any) => (
                                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                    <Paper
                                      sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'grey.100' },
                                      }}
                                      onClick={() => window.open(file.file_url, '_blank')}
                                    >
                                      {file.mime_type?.startsWith('image/') ? (
                                        <Box
                                          component="img"
                                          src={file.file_url}
                                          alt={file.original_filename}
                                          sx={{
                                            width: '100%',
                                            height: 150,
                                            objectFit: 'contain',
                                          }}
                                        />
                                      ) : (
                                        <Box sx={{ py: 4 }}>
                                          <AttachFileIcon
                                            sx={{ fontSize: 48, color: 'text.secondary' }}
                                          />
                                        </Box>
                                      )}
                                      <Typography
                                        variant="caption"
                                        sx={{ mt: 1, display: 'block' }}
                                      >
                                        {file.original_filename}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      )}

                      {/* 채팅 파일 */}
                      {false && (
                        <BlankCard sx={{ bgcolor: 'info.lighter' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                              채팅 파일
                            </Typography>
                            <Grid container spacing={2}>
                              {files
                                .filter((f: any) => f.upload_purpose === 'chat')
                                .map((file: any) => (
                                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                                    <Paper
                                      sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'grey.100' },
                                      }}
                                      onClick={() => window.open(file.file_url, '_blank')}
                                    >
                                      {file.mime_type?.startsWith('image/') ? (
                                        <Box
                                          component="img"
                                          src={file.file_url}
                                          alt={file.original_filename}
                                          sx={{
                                            width: '100%',
                                            height: 150,
                                            objectFit: 'contain',
                                          }}
                                        />
                                      ) : (
                                        <Box sx={{ py: 4 }}>
                                          <AttachFileIcon
                                            sx={{ fontSize: 48, color: 'text.secondary' }}
                                          />
                                        </Box>
                                      )}
                                      <Typography
                                        variant="caption"
                                        sx={{ mt: 1, display: 'block' }}
                                      >
                                        {file.original_filename}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                            </Grid>
                          </CardContent>
                        </BlankCard>
                      )}

                      {/* 파일이 없는 경우 */}
                      {(!files || files.length === 0) && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <AttachFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography color="text.secondary">등록된 파일이 없습니다.</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </TabPanel>
              )}
            </Box>
          </Box>

          {/* 오른쪽: 채팅 - 고정 */}
          <Box sx={{ width: '400px', height: '100%', bgcolor: 'grey.50', flexShrink: 0 }}>
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1,
                  mb: 2,
                }}
              >
                실시간 채팅
              </Typography>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box
                  ref={chatScrollRef}
                  sx={{ flex: 1, overflow: 'auto', bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}
                >
                  {/* 채팅 메시지 영역 */}
                  {loadingChat ? (
                    <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'error.light' }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        채팅 로딩 중... (loadingChat: true)
                      </Typography>
                    </Box>
                  ) : chatMessages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary" variant="body2">
                        채팅 메시지가 없습니다
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {chatMessages.map((msg: any) => (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent:
                              msg.sender_id === data?.user_id ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '70%',
                              bgcolor:
                                msg.sender_id === data?.user_id ? 'primary.main' : 'grey.100',
                              color: msg.sender_id === data?.user_id ? 'white' : 'text.primary',
                            }}
                          >
                            <Typography variant="caption" display="block" fontWeight="bold">
                              {msg.sender_name} ({msg.sender_role})
                            </Typography>
                            <Typography variant="body2">{msg.original_message}</Typography>
                            {msg.translated_message && (
                              <Typography
                                variant="body2"
                                sx={{ mt: 0.5, fontStyle: 'italic', opacity: 0.8 }}
                              >
                                {msg.translated_message}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString('ko-KR')}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="메시지를 입력하세요..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ bgcolor: 'white' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" size="small" onClick={handleFileUpload}>
                          <AttachFileIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          color="primary"
                          size="small"
                          onClick={handleSendMessage}
                          disabled={loadingChat || !chatMessage.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 이미지 미리보기 모달 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {selectedImage && (
            <>
              <Box
                component="img"
                src={selectedImage}
                alt="제품 이미지"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              <Button onClick={() => setModalOpen(false)} sx={{ mt: 2 }} variant="outlined">
                닫기
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
