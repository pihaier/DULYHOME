'use client';
import React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import DemoOrderHeader from '../components/DemoOrderHeader';
import FactoryContactTabs from '@/app/dashboard/orders/[reservationNumber]/components/FactoryContactTabs';

// 실제 factory_contact 테이블과 동일한 필드 구조
const demoOrder = {
  id: 'demo-fc-001',
  reservationNumber: 'DL-20250811-FC001',
  serviceType: 'factory_contact',
  status: 'in_progress',
  createdAt: '2025-08-10T08:00:00Z',
  updatedAt: '2025-08-11T14:30:00Z',

  // 실제 factory_contact_applications 테이블 필드
  reservation_number: 'DL-20250811-FC001',
  company_name: '트레이드마스터 주식회사',
  contact_person: '최민수',
  contact_phone: '010-5555-7777',
  contact_email: 'choi@trademaster.co.kr',

  serviceData: {
    // 요청 유형
    request_types: ['quotation', 'sample', 'bulk_order', 'factory_audit'],

    // 제품 정보
    product_name: '친환경 실리콘 보온병 (500ml)',
    product_name_chinese: '环保硅胶保温瓶（500毫升）',
    product_category: '생활용품',
    product_description: 'BPA-FREE 실리콘 소재, 진공 이중벽 구조, 24시간 보온/보냉',

    // 상세 사양
    required_specs: `• 용량: 500ml
• 재질: 실리콘 (BPA-FREE 인증 필수)
• 진공 이중벽 구조
• 보온: 24시간 (70°C 이상)
• 보냉: 24시간 (10°C 이하)
• 뚜껑: 원터치 오픈 방식
• 색상: 5가지 (블랙, 화이트, 네이비, 민트, 핑크)
• 로고: 레이저 각인 또는 실크 인쇄`,

    // 공장 정보
    preferred_factories: [
      {
        name: '닝보 에코라이프 실리콘',
        location: '저장성 닝보시',
        contact: '왕총경리',
        status: '견적 접수완료',
        quote: '¥48/개',
        lead_time: '30일',
      },
    ],

    // 가격 및 수량
    target_price: 8500,
    target_price_rmb: '¥50',
    moq: 3000,
    first_order_quantity: 5000,
    annual_quantity: '연간 30,000개 예상',

    // 거래 조건
    delivery_terms: 'FOB Ningbo / CIF Busan 선택가능',
    payment_terms: '30% T/T 선금, 70% B/L Copy 후 지급',
    inspection_terms: '선적 전 제3자 검품 필수',
    warranty_terms: '제품 하자 시 100% 교환 또는 환불',

    // 인증 요구사항
    required_certifications: ['KC인증', 'FDA', 'LFGB', 'RoHS', 'REACH'],
    certification_status: {
      KC인증: '준비중',
      FDA: '보유',
      LFGB: '보유',
      RoHS: '보유',
      REACH: '진행중',
    },

    // 샘플 정보
    sample_status: '발송완료',
    sample_tracking: 'SF Express: 1234567890',
    sample_received_date: '2025-08-13 예정',
    sample_feedback: '대기중',

    // 컨택 진행 상황
    contact_progress: [
      {
        date: '2025-08-10',
        factory: '닝보 에코라이프',
        action: '초기 연락 및 제품 사양 전달',
        result: '견적서 접수',
      },
      {
        date: '2025-08-11',
        factory: '이우 그린텍',
        action: '화상 미팅 진행',
        result: '샘플 발송 합의',
      },
      {
        date: '2025-08-12',
        factory: '동관 실리콘월드',
        action: '가격 협상',
        result: '추가 할인 검토중',
      },
    ],

    // 확인 요청 사항
    confirmation_requests: [
      {
        id: 'conf-1',
        title: '로고 디자인 확정',
        description: '3가지 로고 디자인 중 선택 필요',
        status: 'pending',
        deadline: '2025-08-15',
      },
      {
        id: 'conf-2',
        title: '포장 방식 결정',
        description: '개별 포장 vs 벌크 포장 선택',
        status: 'confirmed',
        customer_response: '개별 포장 선택',
        confirmed_date: '2025-08-11',
      },
    ],

    // 특별 요구사항
    special_requirements: `1. 모든 제품에 KC 인증 마크 표시
2. 개별 포장 박스에 한국어 사용설명서 동봉
3. 마스터 카톤에 제품 사진 및 바코드 부착
4. 습도 방지 실리카겔 포함
5. 운송 중 파손 방지를 위한 에어캡 포장`,

    special_requirements_chinese: `1. 所有产品标注KC认证标志
2. 单独包装盒内附韩文使用说明书
3. 外箱贴产品照片和条形码
4. 包含防潮硅胶
5. 使用气泡膜包装防止运输损坏`,

    // 담당자 정보
    assigned_chinese_staff: '왕리나 (王丽娜)',
    assigned_korean_team: '박상준',
    contact_window: '왕리나 (중국어/영어) - WeChat: wanglina_trade',

    // 비용 정보
    service_fee: 300000,
    vat_amount: 30000,
    total_cost: 330000,
    payment_status: 'paid',
    payment_date: '2025-08-10T10:00:00Z',

    // 문서 및 파일
    documents: [
      { name: '제품_사양서.pdf', url: '/demo-files/product-spec.pdf' },
      { name: '로고_디자인.ai', url: '/demo-files/logo-design.ai' },
      { name: '인증서_모음.zip', url: '/demo-files/certificates.zip' },
      { name: '공장_감사_보고서.pdf', url: '/demo-files/audit-report.pdf' },
    ],

    // 추가 메타데이터
    factory_audit_score: {
      닝보: 92,
      이우: 88,
      동관: 85,
    },

    risk_assessment: '낮음 - 모든 공장 검증 완료',
    recommendation: '닝보 에코라이프 추천 (품질/가격 최적)',

    // 진행 상태
    overall_progress: 65,
    next_steps: ['샘플 테스트 완료', '최종 공장 선정', '계약서 작성', '선금 송금'],
  },
} as any;

export default function DemoFactoryContactPage() {
  return (
    <PageContainer
      title="공장컨택 서비스 데모"
      description="실제 공장컨택 서비스와 동일한 필드와 레이아웃을 보여주는 데모 페이지입니다."
    >
      <div style={{ padding: 24 }}>
        <DemoOrderHeader
          reservationNumber={demoOrder.reservationNumber}
          serviceType={demoOrder.serviceType as any}
          status={demoOrder.status as any}
          createdAt={demoOrder.createdAt}
          updatedAt={demoOrder.updatedAt}
        />
        <div style={{ marginTop: 16 }}>
          <FactoryContactTabs orderData={demoOrder} />
        </div>
      </div>
    </PageContainer>
  );
}
