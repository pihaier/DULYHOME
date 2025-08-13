# 📋 Staff 페이지 상세 구현 계획

C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\supabase_tables_documentation.md  참조

절대 시발 네버 고객 페이지 건들지말아 !!!!  /dahsboard  는 참고 만해라 시발년아  ui같은거는 다 고객페이지꺼 뱃겨 쓰면되자나 !!
## 1. 🔍 현황 분석

### 기존 구조 참고
- **고객 조회 페이지**: `/dashboard/orders/[service]/[reservationNumber]`
- **현재 Staff 페이지**: `/staff` (이미 존재, 중국어 지원 구현됨)
- **참고 구조**: dashboard/orders의 탭 구조와 리스트 형식

### 현재 구현된 기능
- ✅ 중국어/한국어 전환 (`isChineseStaff`)
- ✅ 권한 체크 로직
- ✅ 통계 카드
- ✅ 채팅 관리, 고객지원 메뉴

## 2. 📊 진행 상태별 직원 입력 시점

### 🔍 검품감사 (inspection_applications)
```
submitted (접수) 
  → 직원 할당: assigned_chinese_staff
  → 일정 조율: confirmed_date, inspection_days
  
quoted (견적발송)
  → 비용 입력: unit_price, total_cost, vat_amount
  
paid (결제완료)
  → 검품 시작 알림
  
in_progress (진행중) ⭐ 주요 입력 시점

  → inspection_report 업로드
  → inspection_summary 작성
  → pass_fail_status 결정
  → improvement_items 작성
  
completed (완료)
  → 최종 확인 및 마감
```

### 📈 시장조사 (market_research_requests)
```
submitted (접수)
  → 직원 할당: assigned_staff
  
in_progress (진행중) ⭐ 주요 입력 시점
  → 공장정보: industry_cn, company_status_cn, business_scope_cn
  → 제품정보: product_code, box 치수, sample 정보
  → 가격정보: china_unit_price, exchange_rate, 각종 비용
  → 자동계산: total_cbm, commission_amount, import_vat 등
  
completed (완료)
  → 최종 조사 보고서 제출
```

### 🏭 공장컨택 (factory_contact_requests)
```
submitted (접수)
  → 직원 할당: assigned_chinese_staff
  → 번역 필드 자동 생성
  
in_progress (진행중) ⭐ 주요 입력 시점
  → confirmation_requests 생성 (중국어)
    - title_chinese, description_chinese, options_chinese
    - 자동번역 → title_korean, description_korean, options_korean
  → factory_contact_quotations 견적 추가
    - 단가, 수량, VAT 자동계산
    
quoted (견적완료)
  → 고객 선택 대기
  
completed (완료)
  → 최종 계약 완료
```

## 3. 🗂️ 페이지 라우팅 구조

```
/staff
├── page.tsx (메인 대시보드) ✅ 이미 존재
├── layout.tsx ✅ 이미 존재
├── orders/ (신규 추가 필요)
│   ├── page.tsx (주문 리스트)
│   ├── inspection/
│   │   └── [reservationNumber]/
│   │       └── page.tsx (검품 상세)
│   ├── market-research/
│   │   └── [reservationNumber]/
│   │       └── page.tsx (시장조사 상세)
│   └── factory-contact/
│       └── [reservationNumber]/
│           └── page.tsx (공장컨택 상세)
├── chat-management/ ✅ 이미 존재
└── customer-support/ ✅ 이미 존재
```

## 4. 🚀 메인 대시보드 개선 (/staff/page.tsx)

### 현재 구성
```typescript
// 이미 구현된 부분
- 통계 카드 (전체 주문, 활성 사용자, 매출, 완료 주문)
- 중국어 지원 (isChineseStaff ? '中文' : '한글')
- 최근 활동 로그
- 빠른 액션 버튼
```

### 추가 필요 기능
```typescript
// 1. 담당 주문 섹션 추가
const MyOrders = () => {
  // assigned_chinese_staff = user.id인 주문만 필터
  // 상태별 그룹핑 (submitted, in_progress, pending_confirm)
  // 긴급 처리 필요 건 상단 표시
}

// 2. 진행 상태별 요약
const StatusSummary = () => {
  const statuses = {
    submitted: { label: isChineseStaff ? '新订单' : '신규 주문', count: 0 },
    in_progress: { label: isChineseStaff ? '进行中' : '진행 중', count: 0 },
    pending_confirm: { label: isChineseStaff ? '待确认' : '컨펌 대기', count: 0 },
    completed: { label: isChineseStaff ? '已完成' : '완료', count: 0 }
  };
}

// 3. 서비스별 빠른 액션
const ServiceQuickActions = [
  {
    title: isChineseStaff ? '质检审核管理' : '검품감사 관리',
    icon: <InspectionIcon />,
    href: '/staff/orders?service=inspection',
    color: 'success'
  },
  {
    title: isChineseStaff ? '市场调查管理' : '시장조사 관리',
    icon: <ResearchIcon />,
    href: '/staff/orders?service=market-research',
    color: 'primary'
  },
  {
    title: isChineseStaff ? '工厂联系管理' : '공장컨택 관리',
    icon: <FactoryIcon />,
    href: '/staff/orders?service=factory-contact',
    color: 'secondary'
  }
];
```

## 5. 📋 주문 리스트 페이지 (/staff/orders/page.tsx)

### 구조 (dashboard/orders 참고)
```typescript
// 탭 구조
const tabs = [
  { label: isChineseStaff ? '全部' : '전체', value: 'all' },
  { label: isChineseStaff ? '质检' : '검품', value: 'inspection' },
  { label: isChineseStaff ? '调查' : '조사', value: 'market-research' },
  { label: isChineseStaff ? '工厂' : '공장', value: 'factory-contact' }
];

// 필터
const filters = {
  status: ['submitted', 'in_progress', 'completed'],
  dateRange: ['today', 'week', 'month'],
  assigned: ['mine', 'all'] // 내 담당만 / 전체
};

// 테이블 컬럼
const columns = [
  '예약번호',
  '서비스',
  '회사명',
  '제품명',
  '상태',
  '담당자',
  '생성일',
  '액션'
];
```

## 6. 📝 상세 페이지 구조붙하고 연동필드값참고 해서 C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\supabase_tables_documentation.md 여기를 참고해서 필드 만 바꿔놔
  그리고 연동 하면 되자나시발   그대로 !!!! 중국직원이 입력 해야되는거는 중국직원 입력 전용으로다가 시발년아 중국직원이 한글 보면 어떡해해 시발아 
  

### 검품감사 상세 (/staff/orders/inspection/[reservationNumber])
```typescript
const tabs = [
  { 
    label: isChineseStaff ? '基本信息' : '기본정보',
    fields: ['company_name', 'product_name', 'status']
  },
  { 
    label: isChineseStaff ? '工厂信息' : '공장정보',
    fields: ['factory_name', 'factory_address', 'inspection_days']
  },
  { 
    label: isChineseStaff ? '检验信息' : '검품정보',
    fields: ['inspection_report', 'pass_fail_status', 'improvement_items'],
    editable: true // 직원 입력 가능
  },
  { 
    label: isChineseStaff ? '费用信息' : '비용정보',
    fields: ['unit_price', 'total_amount', 'vat_amount'],
    autoCalculate: true
  }
];
```

### 시장조사 상세 (/staff/orders/market-research/[reservationNumber])
```typescript
const tabs = [
  { label: isChineseStaff ? '基本信息' : '기본정보' },
  { 
    label: isChineseStaff ? '工厂信息' : '공장정보',
    fields: ['industry_cn', 'company_status_cn', 'business_scope_cn'],
    editable: true,
    bilingual: true // 한중 병기
  },
  { 
    label: isChineseStaff ? '产品信息' : '제품정보',
    fields: ['product_code', 'box_dimensions', 'total_cbm'],
    autoCalculate: ['total_cbm'] // 자동계산 필드
  },
  { 
    label: isChineseStaff ? '价格信息' : '가격정보',
    fields: ['china_unit_price', 'exchange_rate', 'commission_amount'],
    autoCalculate: ['commission_amount', 'import_vat', 'expected_total']
  }
];
```

### 공장컨택 상세 (/staff/orders/factory-contact/[reservationNumber])
```typescript
const tabs = [
  { label: isChineseStaff ? '基本信息' : '기본정보' },
  { 
    label: isChineseStaff ? '确认请求' : '컨펌요청',
    component: <ConfirmationRequests />,
    translation: true // 자동번역 활성화
  },
  { 
    label: isChineseStaff ? '报价管理' : '견적관리',
    component: <QuotationManagement />,
    autoCalculate: true
  }
];
```

## 7. 🌐 네비게이션 메뉴 추가

### MenuItems.ts 수정
```typescript
// Staff 섹션 추가 (권한 체크 필요)
{
  navlabel: true,
  subheader: isChineseStaff ? '👥 员工管理' : '👥 직원 관리',
  visible: ['admin', 'korean_team', 'chinese_staff'].includes(userRole)
},
{
  id: uniqueId(),
  title: isChineseStaff ? '员工仪表板' : 'Staff 대시보드',
  icon: IconDashboard,
  href: '/staff',
},
{
  id: uniqueId(),
  title: isChineseStaff ? '订单管理' : '주문 관리',
  icon: IconClipboard,
  href: '/staff/orders',
  children: [
    {
      title: isChineseStaff ? '质检审核' : '검품감사',
      href: '/staff/orders?service=inspection',
    },
    {
      title: isChineseStaff ? '市场调查' : '시장조사',
      href: '/staff/orders?service=market-research',
    },
    {
      title: isChineseStaff ? '工厂联系' : '공장컨택',
      href: '/staff/orders?service=factory-contact',
    }
  ]
},
```

## 8. 🔧 공통 컴포넌트

### 자동계산 Hook
```typescript
// hooks/useAutoCalculation.ts
export const useAutoCalculation = (serviceType: string, data: any) => {
  const calculations = useMemo(() => {
    switch(serviceType) {
      case 'market-research':
        return {
          total_cbm: calculateCBM(data),
          shipping_method: data.total_cbm >= 15 ? 'FCL' : 'LCL',
          lcl_shipping_fee: data.shipping_method === 'LCL' ? data.total_cbm * 90000 : 0,
          commission_amount: data.china_unit_price * data.quantity * data.exchange_rate * 0.05,
          // ... 기타 계산
        };
      case 'inspection':
        return {
          total_amount: data.unit_price * data.inspection_days,
          vat_amount: data.total_amount * 0.1,
          final_amount: data.total_amount + data.vat_amount
        };
      default:
        return {};
    }
  }, [serviceType, data]);
  
  return calculations;
};
```

### 언어 전환 컴포넌트
```typescript
// components/LanguageToggle.tsx
export const LanguageToggle = () => {
  const [language, setLanguage] = useState<'ko' | 'zh'>('zh');
  
  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      onChange={(e, val) => setLanguage(val)}
    >
      <ToggleButton value="ko">한국어</ToggleButton>
      <ToggleButton value="zh">中文</ToggleButton>
    </ToggleButtonGroup>
  );
};
```

## 9. 📅 구현 순서

### Phase 1 (기본 구조)
1. `/staff/orders/page.tsx` - 주문 리스트 페이지
2. 네비게이션 메뉴 추가
3. 권한 체크 미들웨어

### Phase 2 (상세 페이지)
1. `/staff/orders/inspection/[reservationNumber]/page.tsx`
2. `/staff/orders/market-research/[reservationNumber]/page.tsx`
3. `/staff/orders/factory-contact/[reservationNumber]/page.tsx`

### Phase 3 (자동화)
1. 자동계산 Hook 구현
2. 번역 API 연동
3. 실시간 업데이트

### Phase 4 (최적화)
1. 메인 대시보드 개선
2. 필터/검색 기능
3. 대량 작업 기능

## 10. 🎯 핵심 기능 체크리스트

- [ ] 중국어/한국어 전환 (이미 구현됨 ✅)
- [ ] 진행 상태별 적절한 입력 시점
- [ ] 자동계산 필드 실시간 업데이트
- [ ] confirmation_requests 번역 자동화
- [ ] 담당 주문만 필터링
- [ ] 긴급 처리 알림
- [ ] 채팅 통합 (이미 구현됨 ✅)
- [ ] 파일 업로드/다운로드
- [ ] 견적서 PDF 생성
- [ ] 상태 변경 로그