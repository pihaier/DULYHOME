"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Factory as FactoryIcon,
  LocalShipping as LocalShippingIcon,
  CloudDownload as CloudDownloadIcon,
  Chat as ChatIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import BlankCard from '@/app/components/shared/BlankCard';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

const BulkOrderInquiry = () => {
  const params = useParams();
  const reservationNumber = params.reservationNumber as string;
  const [tabValue, setTabValue] = useState('0');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchOrderData();
  }, [reservationNumber]);

  const fetchOrderData = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_orders')
        .select(`
          *,
          user:user_id(email),
          chinese_staff:assigned_staff_id(
            id,
            email,
            user_profiles!inner(full_name, phone)
          ),
          market_research:market_research_id(
            research_type,
            product_name,
            company_name
          )
        `)
        .eq('reservation_number', reservationNumber)
        .single();

      if (error) throw error;
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching bulk order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      'submitted': 'primary',
      'quoted': 'info',
      'paid': 'secondary',
      'in_production': 'warning',
      'shipped': 'success',
      'completed': 'success',
      'cancelled': 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: any = {
      'submitted': '접수됨',
      'quoted': '견적완료',
      'paid': '결제완료',
      'in_production': '생산중',
      'shipped': '배송중',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statusLabels[status] || status;
  };

  const getDeliveryMethodLabel = (method: string) => {
    const labels: any = {
      'DDP': 'DDP (관세포함)',
      'FOB': 'FOB (본선인도)',
      'EXW': 'EXW (공장인도)'
    };
    return labels[method] || method;
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

  if (!orderData) {
    return (
      <PageContainer>
        <Alert severity="error">대량주문 정보를 찾을 수 없습니다.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                대량주문 조회
              </Typography>
              <Typography variant="h6" color="primary">
                {reservationNumber}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Chip 
                label={getStatusLabel(orderData.status)} 
                color={getStatusColor(orderData.status)}
                size="medium"
              />
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => setShowChat(!showChat)}
              >
                채팅
              </Button>
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
              >
                관련파일
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: showChat ? '0 0 66.67%' : '1 1 100%' }}>
          <BlankCard>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} variant="fullWidth">
                  <Tab icon={<DescriptionIcon />} iconPosition="start" label="주문정보" value="0" />
                  <Tab icon={<AttachMoneyIcon />} iconPosition="start" label="견적정보" value="1" />
                  <Tab icon={<FactoryIcon />} iconPosition="start" label="생산현황" value="2" />
                  <Tab icon={<LocalShippingIcon />} iconPosition="start" label="물류정보" value="3" />
                </TabList>
              </Box>

              {/* Tab 1: 주문정보 */}
              <TabPanel value="0">
                <Stack spacing={3}>
                  {/* 신청자 정보 */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        신청자 정보
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">회사명</Typography>
                          <Typography variant="body1">{orderData.company_name}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">담당자</Typography>
                          <Typography variant="body1">{orderData.contact_person}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">연락처</Typography>
                          <Typography variant="body1">{orderData.contact_phone}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">이메일</Typography>
                          <Typography variant="body1">{orderData.contact_email}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 시장조사 연계 정보 */}
                  {orderData.market_research && (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          시장조사 연계
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">조사 유형</Typography>
                            <Typography variant="body1">{orderData.market_research.research_type}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">제품명</Typography>
                            <Typography variant="body1">{orderData.market_research.product_name}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">공급업체</Typography>
                            <Typography variant="body1">{orderData.market_research.company_name}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* 주문 아이템 목록 */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        주문 제품 목록
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {orderData.order_items && orderData.order_items.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>제품명</TableCell>
                                <TableCell align="right">단가</TableCell>
                                <TableCell align="right">수량</TableCell>
                                <TableCell align="right">소계</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {orderData.order_items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{item.productName}</TableCell>
                                  <TableCell align="right">
                                    ¥{item.unitPrice?.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.quantity?.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    ¥{(item.unitPrice * item.quantity)?.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                                  총 금액
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  ¥{orderData.order_items.reduce((sum: number, item: any) => 
                                    sum + (item.unitPrice * item.quantity), 0
                                  ).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          주문 제품 정보가 없습니다.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* 배송 정보 */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        배송 정보
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">배송 방법</Typography>
                          <Typography variant="body1">
                            {getDeliveryMethodLabel(orderData.delivery_method)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">희망 납기일</Typography>
                          <Typography variant="body1">{orderData.delivery_date}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">배송지</Typography>
                          <Typography variant="body1">{orderData.delivery_address}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 추가 요청사항 */}
                  {(orderData.packing_requirements || orderData.quality_standards || orderData.additional_requests) && (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>추가 요청사항</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          {orderData.packing_requirements && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">포장 요구사항</Typography>
                              <Typography variant="body1">{orderData.packing_requirements}</Typography>
                            </Box>
                          )}
                          {orderData.quality_standards && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">품질 기준</Typography>
                              <Typography variant="body1">{orderData.quality_standards}</Typography>
                            </Box>
                          )}
                          {orderData.additional_requests && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">기타 요청사항</Typography>
                              <Typography variant="body1">{orderData.additional_requests}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </TabPanel>

              {/* Tab 2: 견적정보 */}
              <TabPanel value="1">
                <Stack spacing={3}>
                  {orderData.revised_unit_price || orderData.total_amount ? (
                    <>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>견적 정보</Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack spacing={2}>
                            {orderData.price_adjustment && (
                              <>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">가격 조정률</Typography>
                                  <Typography variant="body1">{orderData.price_adjustment}%</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">조정 사유</Typography>
                                  <Typography variant="body1">{orderData.adjustment_reason}</Typography>
                                </Box>
                              </>
                            )}
                            <Box>
                              <Typography variant="body2" color="text.secondary">최종 단가</Typography>
                              <Typography variant="h5" color="primary">
                                ¥{orderData.revised_unit_price?.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">총 금액</Typography>
                              <Typography variant="h5" color="primary">
                                ¥{orderData.total_amount?.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">납기 기간</Typography>
                              <Typography variant="body1">{orderData.delivery_period}</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* 견적서 다운로드 */}
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>문서 다운로드</Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack spacing={1}>
                            {orderData.quotation_file && (
                              <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                href={orderData.quotation_file}
                                target="_blank"
                              >
                                견적서
                              </Button>
                            )}
                            {orderData.purchase_order_file && (
                              <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                href={orderData.purchase_order_file}
                                target="_blank"
                              >
                                발주서
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Alert severity="info">
                      견적이 아직 준비되지 않았습니다.
                    </Alert>
                  )}
                </Stack>
              </TabPanel>

              {/* Tab 3: 생산현황 */}
              <TabPanel value="2">
                {orderData.production_schedule || orderData.production_progress ? (
                  <Stack spacing={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>생산 정보</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">공장 확인서</Typography>
                            <Typography variant="body1">
                              {orderData.factory_confirmation || '대기중'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">생산 일정</Typography>
                            <Typography variant="body1">
                              {orderData.production_schedule || '미정'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">진행률</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <Box
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'grey.300',
                                    position: 'relative',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${orderData.production_progress || 0}%`,
                                      bgcolor: 'primary.main',
                                      transition: 'width 0.5s ease',
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Typography variant="body2">
                                {orderData.production_progress || 0}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">완료 예정일</Typography>
                            <Typography variant="body1">
                              {orderData.expected_completion_date || '미정'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* 품질검사 보고서 */}
                    {orderData.quality_inspection_report && (
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>품질검사</Typography>
                          <Divider sx={{ my: 2 }} />
                          <Button
                            variant="contained"
                            startIcon={<CloudDownloadIcon />}
                            href={orderData.quality_inspection_report}
                            target="_blank"
                            fullWidth
                          >
                            품질검사 보고서 다운로드
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    생산이 아직 시작되지 않았습니다.
                  </Alert>
                )}
              </TabPanel>

              {/* Tab 4: 물류정보 */}
              <TabPanel value="3">
                {orderData.packing_status || orderData.bl_document ? (
                  <Stack spacing={3}>
                    {/* 물류 상태 */}
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>물류 상태</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">포장 상태</Typography>
                            <Typography variant="body1">
                              {orderData.packing_status || '대기중'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">통관 상태</Typography>
                            <Typography variant="body1">
                              {orderData.customs_status || '대기중'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">도착 예정일</Typography>
                            <Typography variant="body1">
                              {orderData.estimated_arrival_date || '미정'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* 물류 서류 */}
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>물류 서류</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1}>
                          {orderData.bl_document && (
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownloadIcon />}
                              href={orderData.bl_document}
                              target="_blank"
                            >
                              선하증권 (B/L)
                            </Button>
                          )}
                          {orderData.invoice_document && (
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownloadIcon />}
                              href={orderData.invoice_document}
                              target="_blank"
                            >
                              상업송장 (Invoice)
                            </Button>
                          )}
                          {orderData.packing_list_document && (
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownloadIcon />}
                              href={orderData.packing_list_document}
                              target="_blank"
                            >
                              포장명세서 (Packing List)
                            </Button>
                          )}
                          {orderData.delivery_receipt && (
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownloadIcon />}
                              href={orderData.delivery_receipt}
                              target="_blank"
                            >
                              배송 수령증
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                ) : (
                  <Alert severity="info">
                    물류 정보가 아직 등록되지 않았습니다.
                  </Alert>
                )}
              </TabPanel>
            </TabContext>
          </BlankCard>
        </Box>

        {/* Chat Section */}
        {showChat && (
          <Box sx={{ flex: '0 0 33.33%' }}>
            <Card>
              <CardContent>
                <Typography variant="h6">채팅</Typography>
                <Typography variant="body2" color="text.secondary">
                  채팅 기능은 준비 중입니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default BulkOrderInquiry;