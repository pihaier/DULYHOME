'use client';
import React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import DemoOrderHeader from '../components/DemoOrderHeader';
import MarketResearchTabs from '@/app/dashboard/orders/[reservationNumber]/components/MarketResearchTabs';

// 실제 market_research_requests 테이블과 동일한 필드 구조
const demoOrder = {
  id: 'demo-mr-001',
  reservationNumber: 'DL-20250811-MR001',
  serviceType: 'market_research',
  status: 'in_progress',
  createdAt: '2025-08-09T10:00:00Z',
  updatedAt: '2025-08-11T14:30:00Z',

  // 실제 market_research_requests 테이블 필드
  reservation_number: 'DL-20250811-MR001',
  company_name: '이노베이션 코리아',
  contact_person: '박지민',
  contact_phone: '010-9876-5432',
  contact_email: 'park@innovation.co.kr',

  serviceData: {
    // 신청정보 탭 - 실제 필드와 동일
    product_name: '스마트 공기청정기 (IoT 연동형)',
    research_quantity: 1000,
    created_at: '2025-08-09T10:00:00Z',
    detail_page: 'https://example.com/product/air-purifier',
    moq_check: true,
    logo_required: true,
    custom_box_required: true,

    // 요청사항 (실제 placeholder 형식)
    requirements: `1. 옵션: IoT 연동 기능 필수
2. 색상: 화이트, 블랙, 그레이
3. 규격: 400x300x600mm
4. 재질: ABS 플라스틱, HEPA H13 필터
5. 구성품: 본체, 리모컨, 필터 2개, 설명서
6. 기능 및 사양: WiFi 연결, 앱 제어, 공기질 센서
7. 희망 납기일: 2025년 9월 30일
8. 희망 단가 및 총 예산: 단가 80,000원, 총 예산 8천만원
9. 기타: KC 인증 필수, 소음 35dB 이하`,

    // 로고 상세정보
    logo_details: '제품 상단 및 포장 박스에 로고 인쇄 필요',
    box_details: '고급 박스, 풀컬러 인쇄, 제품 사진 포함',

    // 공장정보 탭 - 기업 신용정보 (天眼查)
    industry_kr: '가전제품 제조업',
    legal_type_kr: '법인',
    company_size_kr: '50-100명',
    established_date: '2015-03-15',
    business_scope_kr: '가전제품 제조, 판매, 수출입',
    registered_capital: '5000만위안',
    registered_address: '광둥성 광저우시 산업단지',
    company_status: '정상영업',

    // 제품정보 탭
    work_duration: '45일',
    factory_price_rmb: 420,
    export_port: '광저우항',

    // 가격정보 탭
    target_price: '80,000원',
    moq: 1000,
    production_quantity: 1000,

    // 공장 선정
    factory_candidates: [
      {
        name: '광저우 스마트홈 테크',
        location: '광둥성 광저우시',
        price_per_unit: '¥420',
        moq: '1,000',
        certification: ['CE', 'FCC', 'KC'],
        rating: 4.5,
      },
    ],

    // 조사 결과 요약
    research_findings: {
      선정공장: '광저우 스마트홈 테크',
      단가: '¥420',
      예상납기: '주문 후 45일',
      품질등급: 'A급',
      인증보유: 'CE, FCC, KC 모두 보유',
    },

    // 진행 상태
    research_status: '진행중',
    payment_status: 'paid',
    assigned_researcher: '장웨이 (张伟)',
    research_start_date: '2025-08-12T00:00:00Z',
    research_end_date: '2025-08-22T23:59:59Z',
    research_duration_days: 10,

    // 비용 정보
    research_fee: 500000,
    vat_amount: 50000,
    total_cost: 550000,
    payment_date: '2025-08-10T15:30:00Z',

    // 파일 및 문서
    market_report_url: '/demo-files/market-research-report.pdf',
    price_comparison_sheet: '/demo-files/price-comparison.xlsx',

    // 담당자 정보
    assigned_korean_team: '이준호',

    // 추가 메타데이터
    factories_contacted: 15,
    factories_shortlisted: 1,
    samples_received: 1,
    expected_order_quantity: '첫 주문 1,000개, 연간 10,000개 예상',

    // 조사 범위
    research_scope: ['공장 선정', '가격 협상', '품질 검증', '인증 확인'],

    // 진행 로그
    communication_log: [
      { date: '2025-08-09', message: '조사 시작, 15개 공장 컨택' },
      { date: '2025-08-11', message: '최적 공장 1개 선정 완료' },
      { date: '2025-08-13', message: '샘플 도착 예정, 테스트 준비중' },
    ],

    // 시장 동향
    market_trends: [
      'IoT 공기청정기 수요 증가 추세',
      '미세먼지 센서 정확도 중요성 상승',
      '에너지 효율 등급 요구 강화',
    ],

    // 경쟁사 분석
    competitor_analysis: {
      주요경쟁사: ['샤오미', '다이슨', 'LG'],
      평균가격대: '30-80만원',
      시장점유율: '신규 진입 가능',
    },
  },
} as any;

export default function DemoMarketResearchPage() {
  return (
    <PageContainer
      title="시장조사 서비스 데모"
      description="실제 시장조사 서비스와 동일한 필드와 레이아웃을 보여주는 데모 페이지입니다."
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
          <MarketResearchTabs orderData={demoOrder} />
        </div>
      </div>
    </PageContainer>
  );
}
