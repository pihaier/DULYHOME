'use client';
import React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import DemoOrderHeader from '../components/DemoOrderHeader';
import InspectionTabs from '@/app/dashboard/orders/[reservationNumber]/components/InspectionTabs';
import { Box, Card, CardContent, Typography, Button, Stack, Alert } from '@mui/material';
import { IconDownload, IconFileTypePdf, IconFileText, IconPhoto } from '@tabler/icons-react';

// 실제 데이터와 동일한 구조의 가짜 데이터
const demoOrder = {
  id: 'demo-insp-001',
  reservationNumber: 'DL-20250811-INS001',
  serviceType: 'inspection',
  status: 'in_progress',
  createdAt: '2025-08-08T09:30:00Z',
  updatedAt: '2025-08-11T14:30:00Z',

  // 실제 inspection_applications 테이블 필드와 동일
  reservation_number: 'DL-20250811-INS001',
  company_name: '글로벌테크 주식회사',
  contact_person: '김영수',
  contact_phone: '010-1234-5678',
  contact_email: 'kim@globaltech.co.kr',

  // 검품 서비스 특화 필드
  serviceData: {
    service_type: 'quality_inspection',
    product_name: '고급 알루미늄 합금 케이스 (노트북용)',
    product_name_translated: '高级铝合金笔记本外壳',
    production_quantity: 5000,
    inspection_method: 'standard',

    // 공장 정보
    factory_name: '선전 하이테크 금속 제조 유한공사',
    factory_contact_person: '왕민호 (王明浩)',
    factory_contact_phone: '+86-755-2345-6789',
    factory_address: '중국 광둥성 선전시 바오안구 산업단지 A동 3층',

    // 일정 정보
    schedule_coordination_status: 'coordinated',
    inspection_days: 3,
    inspection_start_date: '2025-08-15T00:00:00Z',
    confirmed_start_date: '2025-08-15T00:00:00Z',
    confirmed_end_date: '2025-08-17T23:59:59Z',

    // 검품 결과
    pass_fail_status: 'pass',
    improvement_items: [
      '포장 박스 라벨 위치 개선 필요',
      '제품 표면 광택 처리 균일성 향상 권고',
      '사용 설명서 한국어 번역 검수 필요',
      '충격 방지 포장재 추가 권장',
    ],
    defect_rate: 0.3,
    inspection_report_url: '/demo-files/inspection-report.pdf',

    // 비용 정보
    total_cost: 870000,
    vat_amount: 87000,
    payment_status: 'paid',
    payment_date: '2025-08-10T14:00:00Z',

    // 담당자
    assigned_chinese_staff: '이지안 (李志安)',
    assigned_korean_team: '김성호',

    // 특별 요구사항
    special_requirements: `1. 제품 표면 스크래치 검사 철저히 진행
2. 포장 상태 및 충격 테스트 실시
3. 샘플 10개 추가 확보 요청
4. 검품 과정 사진 및 동영상 촬영
5. 불량품 분류 및 별도 보관`,
    special_requirements_translated: `1. 产品表面划痕检查要彻底进行
2. 进行包装状态和冲击测试
3. 要求额外获取10个样品
4. 拍摄检验过程的照片和视频
5. 分类不良品并单独保管`,

    // 추가 메타데이터
    inspection_checklist: {
      외관검사: '완료',
      기능검사: '완료',
      포장검사: '완료',
      라벨검사: '진행중',
      서류검사: '대기',
    },

    sample_photos: [
      { id: 1, url: '/demo-images/sample1.jpg', caption: '제품 외관' },
      { id: 2, url: '/demo-images/sample2.jpg', caption: '포장 상태' },
      { id: 3, url: '/demo-images/sample3.jpg', caption: '라벨 위치' },
    ],

    // 업로드된 파일들
    uploaded_files: [
      {
        id: 'file-1',
        original_filename: '제품_사양서_v2.pdf',
        file_type: 'application/pdf',
        file_size: 2457600,
        created_at: '2025-08-08T10:00:00Z',
      },
      {
        id: 'file-2',
        original_filename: '품질_체크리스트.xlsx',
        file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        file_size: 345678,
        created_at: '2025-08-08T10:30:00Z',
      },
      {
        id: 'file-3',
        original_filename: '공장_인증서.pdf',
        file_type: 'application/pdf',
        file_size: 1234567,
        created_at: '2025-08-08T11:00:00Z',
      },
    ],
  },
} as any;

export default function DemoInspectionPage() {
  const sampleReports = [
    {
      title: '검품 보고서 샘플',
      description: '제품 품질 검사 상세 보고서',
      icon: <IconFileTypePdf size={24} />,
      url: 'https://fzpyfzpmwyvqumvftfbr.supabase.co/storage/v1/object/public/uploads/duly/Inspection%20report.pdf',
      color: '#dc2626',
    },
    {
      title: '검사 체크리스트',
      description: '품질 검사 항목별 체크리스트',
      icon: <IconFileText size={24} />,
      url: 'https://fzpyfzpmwyvqumvftfbr.supabase.co/storage/v1/object/public/uploads/duly/Factory%20audit.pdf',
      color: '#0ea5e9',
    },
    {
      title: '적재 검사',
      description: '제품 적재 상태 검사 보고서',
      icon: <IconPhoto size={24} />,
      url: 'https://fzpyfzpmwyvqumvftfbr.supabase.co/storage/v1/object/public/uploads/duly/Loading%20inspection.pdf',
      color: '#8b5cf6',
    },
  ];

  return (
    <PageContainer
      title="검품 서비스 데모"
      description="실제 검품 서비스와 동일한 필드와 레이아웃을 보여주는 데모 페이지입니다."
    >
      <div style={{ padding: '24px' }}>
        {/* 보고서 샘플 다운로드 섹션 */}
        <Card sx={{ mb: 3, bgcolor: 'primary.lighter' }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              📋 검품 보고서 샘플
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              실제 검품 서비스에서 제공되는 보고서 샘플을 확인하실 수 있습니다.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {sampleReports.map((report, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box
                        sx={{
                          color: report.color,
                          display: 'flex',
                          alignItems: 'center',
                          mr: 1,
                        }}
                      >
                        {report.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {report.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {report.description}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<IconDownload size={16} />}
                      href={report.url}
                      target="_blank"
                      sx={{
                        backgroundColor: report.color,
                        '&:hover': {
                          backgroundColor: report.color,
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      샘플 보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                ※ 샘플 보고서는 실제 고객 정보를 제외한 템플릿 형태로 제공됩니다.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <DemoOrderHeader
          reservationNumber={demoOrder.reservationNumber}
          serviceType={demoOrder.serviceType as any}
          status={demoOrder.status as any}
          createdAt={demoOrder.createdAt}
          updatedAt={demoOrder.updatedAt}
        />
        <div style={{ marginTop: 16 }}>
          <InspectionTabs orderData={demoOrder} />
        </div>
      </div>
    </PageContainer>
  );
}
