import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Grid } from '@mui/material';
import { OrderData } from '../hooks/useOrderData';

interface OrderHeaderProps {
  orderData: OrderData;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ orderData }) => {
  // 상태에 따른 색상 결정
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'quoted': return 'info';
      case 'paid': return 'primary';
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // 상태 텍스트 한국어화
  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return '신청완료';
      case 'quoted': return '견적발송';
      case 'paid': return '결제완료';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  // 서비스 타입 텍스트
  const getServiceText = (serviceType: string) => {
    switch (serviceType) {
      case 'market_research': return '시장조사';
      case 'inspection': return '검품감사';
      case 'sampling': return '샘플링';
      case 'bulk_order': return '대량주문';
      default: return serviceType;
    }
  };

  // 검품감사의 경우 세부 서비스 타입
  const getInspectionServiceText = (serviceData: any) => {
    if (orderData.serviceType !== 'inspection') return '';
    
    switch (serviceData?.service_type) {
      case 'quality_inspection': return '품질검품';
      case 'factory_audit': return '공장감사';
      case 'loading_inspection': return '선적검품';
      default: return serviceData?.service_type || '';
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
          {/* 기본 정보 */}
          <Box sx={{ flex: 2 }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {orderData.reservation_number}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {orderData.company_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={getServiceText(orderData.serviceType)}
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
                {orderData.serviceType === 'inspection' && (
                  <Chip 
                    label={getInspectionServiceText(orderData.serviceData)}
                    color="secondary" 
                    variant="outlined"
                    size="small"
                  />
                )}
                <Chip 
                  label={getStatusText(orderData.status)}
                  color={getStatusColor(orderData.status) as any}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {/* 연락처 정보 */}
          <Box sx={{ flex: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                담당자
              </Typography>
              <Typography variant="body2">
                {orderData.contact_person}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderData.contact_phone}
              </Typography>
            </Box>
          </Box>

          {/* 날짜 정보 */}
          <Box sx={{ flex: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                신청일
              </Typography>
              <Typography variant="body2">
                {new Date(orderData.created_at).toLocaleDateString('ko-KR')}
              </Typography>
              {orderData.updated_at && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    최종수정
                  </Typography>
                  <Typography variant="body2">
                    {new Date(orderData.updated_at).toLocaleDateString('ko-KR')}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* 서비스별 주요 정보 */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          {orderData.serviceType === 'market_research' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">제품명</Typography>
                <Typography variant="body2">{orderData.serviceData.product_name}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">목표단가</Typography>
                <Typography variant="body2">{orderData.serviceData.target_price}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">MOQ</Typography>
                <Typography variant="body2">{orderData.serviceData.moq}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">조사기간</Typography>
                <Typography variant="body2">{orderData.serviceData.research_duration_days}일</Typography>
              </Box>
            </Box>
          )}

          {orderData.serviceType === 'inspection' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">제품명</Typography>
                <Typography variant="body2">{orderData.serviceData.product_name}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">공장명</Typography>
                <Typography variant="body2">{orderData.serviceData.factory_name}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">검품일수</Typography>
                <Typography variant="body2">{orderData.serviceData.inspection_days}일</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">검품방법</Typography>
                <Typography variant="body2">
                  {orderData.serviceData.inspection_method === 'standard' ? '표준검품' : '전수검품'}
                </Typography>
              </Box>
            </Box>
          )}

          {orderData.serviceType === 'sampling' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">샘플 아이템</Typography>
                <Typography variant="body2">
                  {orderData.serviceData.sample_items?.length || 0}개 아이템
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">배송 방법</Typography>
                <Typography variant="body2">{orderData.serviceData.customs_method}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">수령인</Typography>
                <Typography variant="body2">{orderData.serviceData.shipping_recipient}</Typography>
              </Box>
            </Box>
          )}

          {orderData.serviceType === 'bulk_order' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">주문 아이템</Typography>
                <Typography variant="body2">
                  {orderData.serviceData.order_items?.length || 0}개 아이템
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">납품방법</Typography>
                <Typography variant="body2">{orderData.serviceData.delivery_method}</Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">희망납기일</Typography>
                <Typography variant="body2">
                  {orderData.serviceData.desired_delivery_date ? 
                    new Date(orderData.serviceData.desired_delivery_date).toLocaleDateString('ko-KR') : 
                    '미정'
                  }
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px', flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">연계 시장조사</Typography>
                <Typography variant="body2">
                  {orderData.serviceData.linked_market_research ? '연계됨' : '없음'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderHeader;