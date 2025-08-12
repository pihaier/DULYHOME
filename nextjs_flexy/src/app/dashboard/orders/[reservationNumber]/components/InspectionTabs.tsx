import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { OrderData } from '../hooks/useOrderData';

interface InspectionTabsProps {
  orderData: OrderData;
}

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
      id={`inspection-tabpanel-${index}`}
      aria-labelledby={`inspection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InspectionTabs: React.FC<InspectionTabsProps> = ({ orderData }) => {
  const [value, setValue] = useState(0);
  const serviceData = orderData.serviceData;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // 검품 서비스 타입 텍스트
  const getServiceTypeText = (serviceType: string) => {
    switch (serviceType) {
      case 'quality_inspection': return '품질검품';
      case 'factory_audit': return '공장감사';
      case 'loading_inspection': return '선적검품';
      default: return serviceType;
    }
  };

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="검품감사 탭">
          <Tab label="기본정보" />
          <Tab label="공장정보" />
          <Tab label="일정관리" />
          <Tab label="보고서" />
        </Tabs>
      </Box>

      {/* 기본정보 탭 */}
      <TabPanel value={value} index={0}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>검품 정보</Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  disableTypography
                  primary={<Typography variant="body1" fontWeight={600}>서비스 유형</Typography>}
                  secondary={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Chip 
                        label={getServiceTypeText(serviceData.service_type)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="제품명"
                  secondary={serviceData.product_name || '미입력'}
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="제품명 (번역)"
                  secondary={serviceData.product_name_translated || '번역 중...'}
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="생산 수량"
                  secondary={`${serviceData.production_quantity || 0}개`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="검품 방법"
                  secondary={serviceData.inspection_method === 'standard' ? '표준검품' : '전수검품'}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>진행 상황</Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  disableTypography
                  primary={<Typography variant="body1" fontWeight={600}>일정 조율 상태</Typography>}
                  secondary={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Chip 
                        label={serviceData.schedule_coordination_status === 'coordinated' ? '조율완료' : '조율중'}
                        color={serviceData.schedule_coordination_status === 'coordinated' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="검품 일수"
                  secondary={`${serviceData.inspection_days || 0}일`}
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="담당 중국직원"
                  secondary={serviceData.assigned_chinese_staff || '배정 대기'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  disableTypography
                  primary={<Typography variant="body1" fontWeight={600}>결제 상태</Typography>}
                  secondary={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Chip 
                        label={serviceData.payment_status === 'paid' ? '결제완료' : '결제대기'}
                        color={serviceData.payment_status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>특별 요구사항</Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>원본 (한국어)</Typography>
                <Typography variant="body2" paragraph>
                  {serviceData.special_requirements || '특별 요구사항이 없습니다.'}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>번역 (중국어)</Typography>
                <Typography variant="body2" color="text.secondary">
                  {serviceData.special_requirements_translated || '번역 중...'}
                </Typography>
              </CardContent>
            </Card>
        </Box>
      </TabPanel>

      {/* 공장정보 탭 */}
      <TabPanel value={value} index={1}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>공장 기본정보</Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  primary="공장명"
                  secondary={serviceData.factory_name || '미입력'}
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="담당자"
                  secondary={serviceData.factory_contact_person || '미입력'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="연락처"
                  secondary={serviceData.factory_contact_phone || '미입력'}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>공장 주소</Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2">
                  {serviceData.factory_address || '주소가 입력되지 않았습니다.'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* 일정관리 탭 */}
      <TabPanel value={value} index={2}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={serviceData.schedule_coordination_status === 'coordinated' ? 'success' : 'warning'}
              sx={{ mb: 3 }}
            >
              일정 조율 상태: {serviceData.schedule_coordination_status === 'coordinated' ? '완료' : '진행 중'}
            </Alert>
          </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>검품 일정</Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  primary="희망 시작일"
                  secondary={serviceData.inspection_start_date ? 
                    new Date(serviceData.inspection_start_date).toLocaleDateString('ko-KR') : 
                    '미확정'
                  }
                />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="확정 시작일"
                  secondary={serviceData.confirmed_start_date ? 
                    new Date(serviceData.confirmed_start_date).toLocaleDateString('ko-KR') : 
                    '미확정'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="확정 종료일"
                  secondary={serviceData.confirmed_end_date ? 
                    new Date(serviceData.confirmed_end_date).toLocaleDateString('ko-KR') : 
                    '미확정'
                  }
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>진행 단계</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1단계: 신청 접수"
                  secondary="완료"
                  secondaryTypographyProps={{ color: 'success.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2단계: 일정 조율"
                  secondary={serviceData.schedule_coordination_status === 'coordinated' ? '완료' : '진행 중'}
                  secondaryTypographyProps={{ 
                    color: serviceData.schedule_coordination_status === 'coordinated' ? 'success.main' : 'warning.main' 
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3단계: 검품 진행"
                  secondary={orderData.status === 'in_progress' ? '진행 중' : '대기 중'}
                  secondaryTypographyProps={{ 
                    color: orderData.status === 'in_progress' ? 'primary.main' : 'text.secondary' 
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4단계: 보고서 작성"
                  secondary={orderData.status === 'completed' ? '완료' : '대기 중'}
                  secondaryTypographyProps={{ 
                    color: orderData.status === 'completed' ? 'success.main' : 'text.secondary' 
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
        </Box>
      </TabPanel>

      {/* 보고서 탭 */}
      <TabPanel value={value} index={3}>
        <Box>
          <Box sx={{ mb: 3 }}>
            {orderData.status === 'completed' ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                검품이 완료되었습니다. 보고서를 확인해 주세요.
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                검품이 완료되면 보고서가 여기에 표시됩니다.
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>검품 보고서</Typography>
            <Card variant="outlined">
              <CardContent>
                {orderData.serviceType === 'inspection' && orderData.status === 'in_progress' ? (
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="📄 공장감사 보고서"
                        secondary={
                          <a 
                            href="https://drive.google.com/file/d/13wehilazSrJoqZw_K03l5F6KhgkByLrK/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'none' }}
                          >
                            보고서 다운로드
                          </a>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="📄 적재검사 보고서"
                        secondary={
                          <a 
                            href="https://drive.google.com/file/d/1N0sN3j_ZsPsw8CcZu95nMr-BaImhOK6B/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'none' }}
                          >
                            보고서 다운로드
                          </a>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="📄 품질검품 보고서"
                        secondary={
                          <a 
                            href="https://drive.google.com/file/d/1T0g47pmy0bMVA7KPW4qqGu4GxeHD2s7R/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'none' }}
                          >
                            보고서 다운로드
                          </a>
                        }
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    {orderData.status === 'completed' ? 
                      '보고서 준비 중입니다.' : 
                      '검품 완료 후 보고서가 제공됩니다.'
                    }
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>보고서 구성</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="• 검품 결과 요약"
                  secondary="전체적인 품질 상태 및 주요 발견사항"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 상세 검품 데이터"
                  secondary="항목별 검품 결과 및 수치 데이터"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 사진 자료"
                  secondary="제품 및 포장 상태 사진"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 개선 권고사항"
                  secondary="품질 향상을 위한 전문가 의견"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </TabPanel>
    </Card>
  );
};

export default InspectionTabs;