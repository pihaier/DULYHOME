'use client';

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
  Stack,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  CloudDownload as CloudDownloadIcon,
  Chat as ChatIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/dashboard/layout/shared/breadcrumb/Breadcrumb';
import BlankCard from '@/app/components/shared/BlankCard';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '검품감사 조회',
  },
];

const InspectionInquiry = () => {
  const params = useParams();
  const reservationNumber = params.reservationNumber as string;
  const [tabValue, setTabValue] = useState('0');
  const [loading, setLoading] = useState(true);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchInspectionData();
  }, [reservationNumber]);

  const fetchInspectionData = async () => {
    try {
      const { data, error } = await supabase
        .from('inspection_applications')
        .select(
          `
          *,
          user:user_id(email),
          chinese_staff:assigned_chinese_staff(
            id,
            email,
            user_profiles!inner(full_name, phone)
          )
        `
        )
        .eq('reservation_number', reservationNumber)
        .single();

      if (error) throw error;
      setInspectionData(data);
    } catch (error) {
      console.error('Error fetching inspection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      submitted: 'primary',
      quoted: 'info',
      paid: 'secondary',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: any = {
      submitted: '접수됨',
      quoted: '견적완료',
      paid: '결제완료',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusLabels[status] || status;
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const serviceLabels: any = {
      quality_inspection: '품질검품',
      factory_audit: '공장감사',
      loading_inspection: '선적검품',
    };
    return serviceLabels[serviceType] || serviceType;
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

  if (!inspectionData) {
    return (
      <PageContainer>
        <Breadcrumb title="검품감사 조회" items={BCrumb} />
        <Alert severity="error">검품감사 정보를 찾을 수 없습니다.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb title="검품감사 조회" items={BCrumb} />

      <Box>
        <Box>
          {/* 상단 정보 카드 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {reservationNumber}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {getServiceTypeLabel(inspectionData.service_type)}
                  </Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <Chip
                    label={getStatusLabel(inspectionData.status)}
                    color={getStatusColor(inspectionData.status)}
                    size="medium"
                  />
                  <Button variant="outlined" startIcon={<ChatIcon />}>
                    채팅
                  </Button>
                  <Button variant="outlined" startIcon={<AttachFileIcon />}>
                    관련파일
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <BlankCard>
                <TabContext value={tabValue}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleTabChange} variant="fullWidth">
                      <Tab
                        icon={<DescriptionIcon />}
                        iconPosition="start"
                        label="신청정보"
                        value="0"
                      />
                      <Tab
                        icon={<AssessmentIcon />}
                        iconPosition="start"
                        label="검품보고서"
                        value="1"
                      />
                    </TabList>
                  </Box>

                  {/* Tab 1: 신청정보 */}
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
                              <Typography variant="body2" color="text.secondary">
                                회사명
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.company_name}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                담당자
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.contact_person}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                연락처
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.contact_phone}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                이메일
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.contact_email}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* 검품 상세 정보 */}
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <FactoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            검품 상세 정보
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                제품명
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.product_name}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                생산 수량
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.production_quantity?.toLocaleString()}개
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                검품 방법
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.inspection_method === 'standard'
                                  ? '표준검품'
                                  : '전수검품'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                공장명
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.factory_name}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                공장 담당자
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.factory_contact_person}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                공장 연락처
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.factory_contact_phone}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                공장 주소
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.factory_address}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* 일정 및 특별 요구사항 */}
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            일정 및 요구사항
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                검품 시작일
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.inspection_start_date}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                검품 기간
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {inspectionData.inspection_days}일
                              </Typography>
                            </Box>
                            {inspectionData.special_requirements && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  특별 요구사항
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {inspectionData.special_requirements}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* 견적 정보 */}
                      {inspectionData.total_amount && (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              견적 정보
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  견적 금액
                                </Typography>
                                <Typography variant="h5" color="primary" fontWeight={600}>
                                  {inspectionData.total_amount?.toLocaleString()}원
                                </Typography>
                              </Box>
                              {inspectionData.confirmed_start_date && (
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    확정 시작일
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {inspectionData.confirmed_start_date}
                                  </Typography>
                                </Box>
                              )}
                              {inspectionData.confirmed_end_date && (
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    확정 종료일
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {inspectionData.confirmed_end_date}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      )}
                    </Stack>
                  </TabPanel>

                  {/* Tab 2: 검품보고서 */}
                  <TabPanel value="1">
                    <Stack spacing={3}>
                      {inspectionData.status === 'completed' ? (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              검품보고서
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={2}>
                              <Typography variant="body1">
                                검품이 완료되었습니다. 아래 버튼을 클릭하여 보고서를 다운로드하세요.
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<CloudDownloadIcon />}
                                size="large"
                                fullWidth
                              >
                                검품보고서 다운로드
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      ) : (
                        <Alert severity="info">
                          검품이 아직 완료되지 않았습니다. 검품 완료 후 보고서를 확인하실 수
                          있습니다.
                        </Alert>
                      )}
                    </Stack>
                  </TabPanel>
                </TabContext>
              </BlankCard>
            </Box>

            {/* 사이드바 - 담당자 정보 */}
            <Box sx={{ flex: '0 0 33.33%' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    담당자 정보
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    {inspectionData.chinese_staff ? (
                      <>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            중국 담당자
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {inspectionData.chinese_staff.user_profiles?.full_name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            연락처
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {inspectionData.chinese_staff.user_profiles?.phone}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            이메일
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {inspectionData.chinese_staff.email}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        담당자가 아직 배정되지 않았습니다.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default InspectionInquiry;
