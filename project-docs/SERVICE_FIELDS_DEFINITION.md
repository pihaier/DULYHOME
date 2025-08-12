# 📋 서비스별 필드 정의 문서 (Service Fields Definition)
**두리무역 디지털 전환 플랫폼**

문서 버전: v1.0  
작성일: 2025-01-26  
작성자: 시스템 아키텍트  
출처: QingFlow 엑셀 데이터 분석

---

## 📑 목차
1. [개요](#1-개요)
2. [공통 필드](#2-공통-필드)
3. [검품/감사 서비스](#3-검품감사-서비스)
4. [시장조사 서비스](#4-시장조사-서비스)
5. [샘플링 서비스](#5-샘플링-서비스)
6. [구매대행 서비스](#6-구매대행-서비스)
7. [배송대행 서비스](#7-배송대행-서비스)
8. [지원 시스템](#8-지원-시스템)

---

## 1. 개요

### 1.1 필드 정의 원칙
- QingFlow 실제 운영 데이터 기반
- 한국어/중국어 필드명 병행
- 자동 계산 필드 구분
- 필수/선택 구분 명확화

### 1.2 서비스별 예약번호 체계
```
형식: DLXX-YYYYMMDD-XXXXXX

서비스별 코드:
- DLKP: 검품 서비스 (품질검품, 공장감사, 선적검품)
- DLSY: 수입대행 (조사, 샘플, 발주)  
- DLGM: 구매대행
- DLBS: 배송대행

예시:
- DLKP-20250126-000001 (품질검품 신청)
- DLSY-20250126-000002 (시장조사 신청)
- DLGM-20250126-000003 (구매대행 신청)
- DLBS-20250126-000004 (배송대행 신청)
```

**장점**:
- 한눈에 서비스 유형 식별 가능
- 직원 업무 효율성 향상
- 서비스별 통계 분석 용이
- 시스템 확장성 확보

---

## 2. 공통 필드

### 2.1 고객 정보 (Customer Info)
```typescript
interface CustomerInfo {
  // 기본 정보
  customerNumber: string;        // 고객번호 (G000086)
  companyName: string;           // 회사명
  companyNameChinese?: string;   // 중국 거래시 사용 기업명
  businessNumber: string;        // 사업자등록번호
  
  // 담당자 정보
  contactPerson: string;         // 담당자
  contactPhone: string;          // 연락처
  contactEmail: string;          // 이메일
  
  // 추가 정보
  customerType: '개인' | '법인'; // 구분
  personalCustomsCode?: string;  // 개인통관고유부호
  virtualAccount?: string;       // 가상계좌
}
```

### 2.2 오더 기본 정보 (Order Base)
```typescript
interface OrderBase {
  orderNumber: string;           // 오더번호
  serviceType: ServiceType;      // 서비스 타입
  status: OrderStatus;           // 진행 상태
  processStatus: string;         // 当前流程状态
  
  // 워크플로우 자동화 (신규)
  workflowStatus?: WorkflowStatus; // 워크플로우 상태
  nextTransition?: Date;         // 다음 상태 전환 예정 시간
  
  // AI 자동화 (신규)
  aiSummary?: string;            // AI 자동 요약
  aiTranslationCache?: boolean;  // 번역 캐시 사용 여부
  
  // 담당자
  dulyManager?: string;          // 두리무역 담당자
  assignedStaff?: string;        // 배정된 중국직원
  
  // 시스템 정보
  dataId: string;                // 数据ID
  applicant: string;             // 申请人
  createdAt: Date;               // 申请时间
  updatedAt: Date;               // 更新时间
  processLog: ProcessLog[];      // 流程日志
}

// 진행 상태 enum
enum OrderStatus {
  // 공통 상태
  WAITING = '대기중',
  IN_PROGRESS = '진행중',
  COMPLETED = '완료',
  CANCELLED = '취소',
  
  // 검품 서비스 상태
  APPROVAL_WAITING = '승인대기',
  PAYMENT_WAITING = '결제대기',
  
  // 시장조사 상태
  QUOTE_SENT = '견적서 발송',
  SAMPLE_ORDERED = '샘플 주문',
  
  // 중국어 상태
  APPROVED = '已通过',
  PAID_CONFIRMED = '입금확인'
}

// 워크플로우 상태 enum (신규)
enum WorkflowStatus {
  IDLE = 'idle',                    // 대기 상태
  PROCESSING = 'processing',        // 처리 중
  WAITING_INPUT = 'waiting_input',  // 입력 대기
  SCHEDULED = 'scheduled',          // 예약됨
  COMPLETED = 'completed',          // 완료됨
  FAILED = 'failed',                // 실패
  RETRY = 'retry'                   // 재시도 중
}
```

### 2.3 결제 정보 (Payment Info)
```typescript
interface PaymentInfo {
  // 기본 결제
  totalAmount: number;           // 결제금액
  paymentStatus: string;         // 결제여부
  servicePaymentStatus?: string; // 서비스 결제 여부
  
  // 1차/2차 결제 (구매대행)
  firstPayment?: number;         // 1차결제비용
  secondPaymentEstimate?: number;// 예상 2차결제비용
  
  // 계산 정보
  exchangeRate?: number;         // 환율
  commissionRate?: number;       // 수수료(%)
  commissionAmount?: number;     // 수수료(금액)
}
```

---

## 3. 검품/감사 서비스 (중국 출장 대행)

### 3.1 테이블: `china_business_trips`
```typescript
interface ChinaBusinessTrip extends OrderBase {
  // 서비스 타입
  serviceSubType: '검품(생산 후)' | '공장감사' | '선적검품';
  
  // 검품 정보
  inspectionDays?: number;       // 검품일수
  qcStandard?: string;           // QC기준
  
  // 공장 정보
  factoryName: string;           // 공장명
  factoryContact?: string;       // 공장 담당자
  factoryPhone?: string;         // 공장 연락처
  factoryAddress: string;        // 공장 주소
  
  // 제품 정보
  productName: string;           // 제품명
  productNameChinese?: string;   // 品名
  specification?: string;        // 규격
  quantity?: number;             // 수량
  
  // 일정
  desiredDate?: Date;            // 답사 희망일자
  confirmedDate?: Date;          // 답사 확정일자
  
  // 요청사항
  inspectionRequest: string;     // 답사요청사항
  inspectionRequestCn?: string;  // 考察要求事项
  requestFiles?: string[];       // 요청사항 업로드
  
  // 비용
  chinaExpensesRMB?: number;     // 采购申请付款RMB
  chinaExpensesRequest?: number; // 중국답사비용신청
  
  // 결과물
  inspectionFiles?: string[];    // 提交考察文件
  inspectionReport?: string;     // 조사리포트
  
  // 견적
  quotation?: string;            // 견적서
  unitPrice?: number;            // 단가
  supplyAmount?: number;         // 공급가액
  taxAmount?: number;            // 세액
}
```

---

## 4. 시장조사 서비스 (수입대행 조사)

### 4.1 테이블: `market_research_requests`
```typescript
interface MarketResearchRequest extends OrderBase {
  // 기본 정보
  orderNumber: string;           // 오더번호
  status: string;                // 진행 상태
  createdAt: Date;               // 신청일시
  
  // 고객 정보 (한국팀만 조회)
  customerInfo?: {
    companyName: string;         // 회사명
    contactPerson: string;       // 이름
    contactPhone: string;        // 휴대폰
    contactEmail: string;        // 이메일
  };
  
  // 신청 정보
  researchType: string;          // 제품 조사 선택
  productName: string;           // 품명
  productNameChinese?: string;   // 品名 (중국직원용/번역필요)
  researchQuantity: number;      // 조사수량
  researchQuantityCn?: number;   // 调查数量 (중국직원용)
  detailPage?: string;           // 상세 페이지
  detailPageCn?: string;         // 客户给出的产品链接 (중국직원용)
  photos?: string[];             // 사진 및 파일
  photosCn?: string[];           // 客户上传的产品照片及参考文件 (중국직원용)
  
  // 요청사항
  requirements: string;          // 요청사항 (placeholder 예시 포함)
  requirementsChinese?: string;  // 客户要求事项 (중국직원용/번역필요)
  
  /* 요청사항 placeholder 예시:
    1.옵션 :  
    2.색상 :  
    3.규격 : 
    4.재질 : 
    5.구성품 : 
    6.기능 및 사양 : 
    7.희망 납기일 : 
    8.희망 단가 및 총 예산 : 
    9.기타 : 
  */
}
```

### 4.2 테이블: `market_research_info` (조사정보)
```typescript
interface MarketResearchInfo {
  requestId: string;             // FK to market_research_requests
  
  // 조사 정보
  workDuration?: string;         // 소요시간 (耗时) - 중국직원 입력
  productLink?: string;          // 调查产品的连接 - 중국직원 입력 (고객 안보임)
  factoryPriceRMB: number;       // 出厂价RMB - 중국직원 입력
  exportPort?: string;           // 수출항 (出口港) - 중국직원 입력
}
```

### 4.3 테이블: `market_research_suppliers` (공장정보)
```typescript
interface MarketResearchSupplier {
  requestId: string;             // FK to market_research_requests
  
  // 공급업체 정보 (고객 안보임)
  supplierName: string;          // 供应商名 - 중국직원 입력
  contactPhone?: string;         // 手机/微信 - 중국직원 입력
  contactPerson?: string;        // 联系人 - 중국직원 입력
  
  // 기업 신용정보 (天眼查) - 고객 조회 가능 (사업자번호 제외)
  companyScale?: string;         // 人员规模
  registeredCapital?: string;    // 注册资本
  registeredAddress?: string;    // 注册地址
  industry?: string;             // 行业
  companyStatus?: string;        // 企业状态
  realPaidCapital?: string;      // 实收注册资金
  taxNumber?: string;            // 统一社会信用代码 (고객 안보임)
  isSmallBusiness?: boolean;     // 是否小微企业
  
  // 한글 번역 정보 (고객용)
  industryKr?: string;           // 업종 (天眼查결과번역)
  legalTypeKr?: string;          // 법인/개인 (天眼查결과번역)
  companySizeKr?: string;        // 인원규모 (天眼查결과번역)
  establishedDate?: Date;        // 개업시간
  businessScope?: string;        // 经营范围
  businessScopeKr?: string;      // 영업범위 (天眼查결과번역)
}
```

### 4.4 테이블: `market_research_products` (제품정보)
```typescript
interface MarketResearchProduct {
  requestId: string;             // FK to market_research_requests
  
  // 제품 기본 정보
  productCode: string;           // 제품 번호 (자동 발급)
  productCodeCn?: string;        // 产品编码 (중국직원용)
  researchPhotos?: string[];     // 조사 사진 및 파일 (照片及文件)
  quotedQuantity: number;        // 견적 수량
  quotedQuantityCn?: number;     // 数量 (중국직원용)
  workPeriod?: string;           // 작업 소요 기간 (day)
  
  // 기타사항 (중국직원 입력, 고객은 번역값 조회)
  otherMatters?: string;         // 其他事项(产品选项,产品颜色,产品尺寸,产品材质,产品功能,产品特征,产品构成)
  otherMattersKr?: string;       // 기타사항 번역값
  
  // 박스 규격 (개별 필드)
  boxLength?: number;            // 길이 (长) - cm
  boxWidth?: number;             // 너비 (宽) - cm
  boxHeight?: number;            // 높이 (高) - cm
  unitsPerBox?: number;          // 박스당 제품 개수 (每箱产品个数)
  totalBoxes?: number;           // 총 박스수 (总箱数) - 자동계산
  totalCBM?: number;             // 총 CBM (总立方) - 자동계산
}
```

### 4.5 테이블: `market_research_samples` (패킹 및 샘플 정보)
```typescript
interface MarketResearchSample {
  requestId: string;             // FK to market_research_requests
  
  // 샘플 정보
  sampleAvailable?: boolean;     // 샘플재고 유무
  sampleUnitPrice?: number;      // 샘플단가
  sampleOrderQty?: number;       // 샘플 주문 가능 수량
  sampleWeight?: number;         // 샘플 무게(kg)
  sampleMakeTime?: string;       // 샘플 제작 기간(day)
  samplePrice?: number;          // 샘플 가격
  
  // HS코드 및 인증
  hsCode?: string;               // HS코드 - 중국직원 입력
  certificationRequired?: boolean;// 수입 시 인증 필요 여부 - API 조회
  certCost?: number;             // 인증 예상 비용 - AI 예측
}
```

### 4.6 테이블: `market_research_costs` (비용정보)
```typescript
interface MarketResearchCost {
  requestId: string;             // FK to market_research_requests
  
  // 수수료
  commissionRate: number;        // 수수료(%) - 5% 고정
  commissionAmount?: number;     // 수수료(금액) - 자동계산
  
  // 1차 비용
  firstDetailCost?: number;      // 1차 상세비용 - 자동계산
  
  // 운송방식
  shippingMethod?: 'LCL' | 'FCL'; // 운송방식 - CBM 기준 자동선택
  chinaShippingCost?: number;    // 중국 운송료 (LCL일 때)
  fclFreight?: number;           // FCL运费 (FCL일 때)
  
  // 가격 계산
  chinaUnitPrice?: number;       // 중국단가
  exchangeRate?: number;         // 환율 (관세청 API + 8)
  exwTotal?: number;             // EXW합계 - 자동계산
  firstPayment?: number;         // 1차결제비용 - 자동계산
  
  // 예상비용
  tariff?: number;               // 관세 - 관세청 API
  vat?: number;                  // 부가세 - 자동계산
  secondPaymentEstimate?: number;// 예상 2차결제비용 - 자동계산
  
  // 최종 계산
  totalSupplyPrice?: number;     // 예상 총 공급가 - 자동계산
  unitPrice?: number;            // 예상 단가 (VAT 별도) - 자동계산
}
```

### 4.7 자동 계산 공식
```typescript
// CBM 계산
totalCBM = (boxLength * boxWidth * boxHeight) / 1000000 * totalBoxes;

// 총 박스수 계산
totalBoxes = Math.ceil(quotedQuantity / unitsPerBox);

// 운송방식 자동 선택
shippingMethod = totalCBM < 15 ? 'LCL' : 'FCL';

// 환율 적용
exchangeRate = customsAPIRate + 8;

// EXW 합계
exwTotal = chinaUnitPrice * exchangeRate * quotedQuantity;

// 수수료 계산
commissionAmount = exwTotal * 0.05;

// 1차 상세비용
firstDetailCost = exwTotal + chinaShippingCost + commissionAmount;

// 1차 결제비용
firstPayment = exwTotal + chinaShippingCost + commissionAmount + (commissionAmount * 0.1);

// 부가세
vat = (exwTotal + shippingCost + tariff) * 0.1;

// 예상 2차결제비용
secondPaymentEstimate = (shippingMethod === 'LCL' ? lclCost : fclCost) + tariff + vat;

// 예상 총 공급가
totalSupplyPrice = firstPayment + shippingCost + tariff + commissionAmount;

// 예상 단가
unitPrice = totalSupplyPrice / quotedQuantity; // (VAT 별도)
```

### 4.8 역할별 필드 가시성
```typescript
// 고객이 볼 수 있는 필드
const customerVisibleFields = [
  // 기본 정보
  'orderNumber', 'status', 'createdAt',
  
  // 신청 정보
  'researchType', 'productName', 'researchQuantity',
  'detailPage', 'photos', 'requirements',
  
  // 조사 정보
  'workDuration', 'exportPort',
  
  // 공장 정보 (천안차 정보만)
  'industryKr', 'legalTypeKr', 'companySizeKr',
  'establishedDate', 'businessScopeKr',
  
  // 제품 정보
  'productCode', 'researchPhotos', 'quotedQuantity',
  'workPeriod', 'otherMattersKr', 'boxLength',
  'boxWidth', 'boxHeight', 'unitsPerBox',
  'totalBoxes', 'totalCBM',
  
  // 샘플 정보
  'sampleAvailable', 'sampleUnitPrice', 'sampleOrderQty',
  'sampleWeight', 'sampleMakeTime', 'samplePrice',
  
  // 비용 정보
  'hsCode', 'certificationRequired', 'certCost',
  'commissionRate', 'commissionAmount', 'firstDetailCost',
  'shippingMethod', 'chinaShippingCost', 'fclFreight',
  'chinaUnitPrice', 'exchangeRate', 'exwTotal',
  'firstPayment', 'tariff', 'vat', 'secondPaymentEstimate',
  'totalSupplyPrice', 'unitPrice'
];

// 중국직원만 볼 수 있는 필드
const chineseStaffOnlyFields = [
  'productLink', 'supplierName', 'contactPhone',
  'contactPerson', 'taxNumber'
];

// 한국팀만 볼 수 있는 필드
const koreanTeamOnlyFields = [
  'customerInfo'
];
```

---

## 5. 샘플링 서비스

### 5.1 테이블: `sample_orders`
```typescript
interface SampleOrder extends OrderBase {
  // 샘플 발주내역
  sampleItems: SampleItem[];     // 샘플발주내역 (다중)
  
  // 공급업체
  supplierName?: string;         // 供应商名
  supplierContact?: string;      // 联系人
  
  // 비용
  sampleMakingCost?: number;     // 打样费
  totalSampleCost?: number;      // 샘플제작비용
  
  // 배송
  shippingMethod?: '해운' | '항공'; // 배송선택
  sampleReceiveAddress?: string; // 샘플 제품 수령지
  
  // 중국 내 배송
  factorySampleInvoice?: string; // 공장샘플송장
  factoryDeliveryTracking?: string; // 공장 샘플 배송조회
  
  // 국제 배송
  gzSampleInvoiceNumber?: string;// 광저우 샘플 송장번호
  gzDeliveryTracking?: string;   // 광저우 배송조회
  internationalTracking?: string;// 국제 운송번호
  
  // 통관
  customsInfo?: CustomsInfo;     // 통관 정보
}

interface SampleItem {
  productName: string;           // 제품명
  quantity: number;              // 주문수량
  unitPrice: number;             // 샘플단가
  weight?: number;               // 샘플무게
  specifications?: string;       // 규격
}
```

---

## 6. 구매대행 서비스

### 6.1 테이블: `purchasing_orders`
```typescript
interface PurchasingOrder extends OrderBase {
  // 창고 정보
  warehouseNumber?: string;      // 창고번호
  
  // 구매 정보
  purchaseType: 'B2B' | '단일상품'; // 구매 타입
  exchangeRate: number;          // 적용환율
  
  // B2B 발주내역 (최대 25개)
  purchaseItems: PurchaseItem[]; // B2B 발주내역
  
  // 비용 계산
  totalProductCost: number;      // 화물대금 (货价)
  domesticShipping: number;      // 중국내륙 운송비 (国内运费)
  commission: number;            // 수수료
  
  // 배송 정보
  shippingAddress: string;       // 물건 받는주소
  receiverName: string;          // 수취인
  receiverPhone: string;         // 수취인 연락처
  
  // 통관
  customsName: string;           // 통관명의
  customsDocs?: string[];        // 통관서류
  
  // 추가 정보
  markingNumber?: string;        // 마킹번호
  additionalRequests?: string;   // 추가사항
}

interface PurchaseItem {
  productLink?: string;          // 구매링크
  productName: string;           // 제품명
  options?: string;              // 옵션
  quantity: number;              // 수량
  unitPrice: number;             // 단가
  totalPrice: number;            // 합계
}
```

---

## 7. 배송대행 서비스

### 7.1 테이블: `shipping_agency_orders`
```typescript
interface ShippingAgencyOrder extends OrderBase {
  // 고객 코드
  customerCode: string;          // 고객 전용 코드
  
  // 배송 정보
  shippingNumber?: string;       // 배송번호
  customsNumber?: string;        // 통관번호
  
  // 배송 내역
  shippingItems: ShippingItem[]; // 배송내역 (다중)
  
  // 창고 관리
  expectedPackages: number;      // 예상 패키지 수
  receivedPackages: number;      // 수령 패키지 수
  storageLocation?: string;      // 보관 위치
  storageStartDate?: Date;       // 보관 시작일
  
  // 묶음배송
  consolidatedBoxes?: number;    // 통합 박스 수
  consolidationRequest?: boolean;// 묶음배송 요청
  
  // 배송 상태
  shippingStatus: '대기' | '입고' | '포장' | '출고' | '배송중' | '완료';
  deliveryMemo?: string;         // 배송 메모
}

interface ShippingItem {
  productName: string;           // 제품명
  quantity: number;              // 수량
  weight?: number;               // 무게
  trackingNumber?: string;       // 개별 추적번호
}
```

---

## 8. 지원 시스템

### 8.1 고객 문의 테이블: `customer_inquiries`
```typescript
interface CustomerInquiry {
  inquiryId: number;             // 편호
  inquiryChannel: '전화' | '이메일' | '웹'; // 문의경로
  
  // 고객 정보
  customerInfo?: CustomerInfo;   // 고객 정보 (회원/비회원)
  
  // 문의 내용
  inquiryContent: string;        // 문의사항
  inquiryFiles?: string[];       // 문의 파일첨부
  
  // 처리 정보
  assignedTo?: string;           // 담당자 배정
  responseContent?: string;      // 답변내용
  responseFiles?: string[];      // 답변 파일첨부
  
  // 상태
  status: '대기' | '처리중' | '완료'; // 처리 상태
  inquiryDate: Date;             // 문의날짜
  responseDate?: Date;           // 답변날짜
}
```

### 8.2 단가계산기 테이블: `price_calculations`
```typescript
interface PriceCalculation {
  calculationId: string;         // SY+날짜+일련번호
  
  // 기본 정보
  productInfo: {
    name: string;                // 제품명
    unitPriceRMB: number;        // 단가(RMB)
    quantity: number;            // 수량
    cbm: number;                 // CBM
  };
  
  // 거래 조건
  tradeTerms: 'FOB' | 'DDP' | 'EXW';
  exportPort: string;            // 출하항구
  
  // 자동 계산 결과
  calculations: {
    exwTotal: number;            // EXW 합계
    fobTotal: number;            // FOB 합계
    commission: number;          // 수수료
    exchangeApplied: number;     // 환율 적용
    tariff: number;              // 관세
    customsClearance: number;    // 통관비
    ddpLcl: number;              // DDP/LCL
    ddpFcl: number;              // DDP/FCL
    unitPriceDDP: number;        // 개당 DDP 단가
  };
  
  // 결제
  firstPaymentAmount: number;    // 1차 결제비용
  secondPaymentEstimate: number; // 2차 결제 예상비용
}
```

### 8.3 프로세스 로그: `workflow_logs`
```typescript
interface WorkflowLog {
  orderId: string;               // 오더번호
  processNode: string;           // 处理节点
  processor: string;             // 处理人
  processResult: string;         // 处理结果
  processFeedback?: string;      // 处理反馈
  processTime: Date;             // 处理时间
}
```

---

## 9. 추가 필드 정의 (엑셀 데이터 기반)

### 9.1 상태값 상세 정의 (통합)
```typescript
// 진행 상태 (모든 사용자가 동일하게 보는 상태)
enum OrderStatus {
  // 신청/검토 단계
  SUBMITTED = '신청완료',
  UNDER_REVIEW = '검토중',
  APPROVED = '승인완료',
  REJECTED = '반려',
  
  // 견적/결제 단계
  RESEARCHING = '조사중',
  QUOTE_PREPARATION = '견적작성중',
  QUOTE_SENT = '견적발송',
  PAYMENT_PENDING = '결제대기',
  PAYMENT_CONFIRMED = '결제확인',
  
  // 실행 단계
  SCHEDULE_COORDINATION = '일정조율중',
  IN_PROGRESS = '진행중',
  
  // 보고서 단계
  REPORT_WRITING = '보고서작성중',
  FINAL_REVIEW = '최종검토',
  
  // 완료/취소
  COMPLETED = '완료',
  CANCELLED = '취소',
  ON_HOLD = '보류'
}

// 시스템 내부 프로세스 (로그용, UI에 표시하지 않음)
enum SystemProcess {
  // 자동화 프로세스
  AUTO_MEMBER_REGISTRATION = '자동회원등록',
  ORDER_NUMBER_GENERATION = '오더번호생성',
  AUTO_TRANSLATION = '자동번역',
  PRICE_CALCULATION = '가격계산',
  NOTIFICATION_SENT = '알림발송',
  
  // 데이터 처리
  DATA_VALIDATION = '데이터검증',
  FILE_PROCESSING = '파일처리',
  BACKUP_CREATED = '백업생성',
  
  // 연동 프로세스
  API_CALL = 'API호출',
  WEBHOOK_RECEIVED = '웹훅수신',
  SYNC_COMPLETED = '동기화완료'
}

// 세부 진행 상태 (진행상태)
enum DetailedStatus {
  // 결제 관련
  PAYMENT_WAITING = '결제대기',
  PAYMENT_CONFIRMED = '결제확인',
  
  // 검품 관련
  SCHEDULE_PENDING = '일정대기',
  SCHEDULE_CONFIRMED = '일정확정',
  INSPECTION_READY = '검품준비',
  INSPECTION_ONGOING = '검품진행',
  
  // 보고서 관련
  REPORT_PENDING = '보고서대기',
  REPORT_REVIEWING = '보고서검토',
  REPORT_APPROVED = '보고서승인',
  
  // 배송 관련
  SHIPPING_READY = '배송준비',
  SHIPPING_IN_TRANSIT = '배송중',
  CUSTOMS_CLEARANCE = '통관중',
  DELIVERED = '배송완료'
}
```

### 9.2 서비스별 특수 필드

#### 검품 서비스 추가 필드
```typescript
interface InspectionAdditionalFields {
  // 문의 시스템
  inquiries?: {
    inquiryNumber: string;       // 문의번호
    inquiryContent: string;      // 문의내용
    inquiryAttachment?: string;  // 문의 파일첨부
    responseContent?: string;    // 답변내용
    responseAttachment?: string; // 답변 파일첨부
    inquiryDate: Date;          // 문의날짜
  }[];
  
  // 비밀번호 (조회용)
  password?: string;             // 비밀번호 (전화번호 뒷 4자리)
}
```

#### 시장조사 추가 필드
```typescript
interface MarketResearchAdditionalFields {
  // 조사 링크
  productLink?: string;          // 调查产品的连接
  researchPhotos?: string[];     // 조사 사진 및 파일
  
  // 작업 시간
  workDuration?: string;         // 耗时
  estimatedWorkPeriod?: string;  // 작업 소요 기간
  
  // 기타 사항
  otherMatters?: string;         // 其他事项
  otherMattersKr?: string;       // 기타 사항
  
  // 문의 내역
  inquiryHistory?: {
    inquiryNumber: string;
    content: string;
    date: Date;
  }[];
  
  // 청구 관련
  researchFeeInvoiced?: boolean; // 조사비용 청구여부
  invoice?: string;              // 청구서
  quotation?: string;            // 견적서
}
```

#### 구매대행 추가 필드
```typescript
interface PurchasingAdditionalFields {
  // 카테고리
  purchaseCategory?: string;     // 카테고리 (B2B, 단일상품)
  
  // 배송 상태
  deliveryCategory?: '정상배송' | '반송' | '보류';
  entryCode?: string;            // 입고코드
  progressStatus?: string;       // 진행상태
  
  // 발주 대기
  pendingOrderManagement?: {
    waitingItems: number;
    readyItems: number;
  };
}
```

### 9.3 프로세스 로그 상세
```typescript
interface ProcessLog {
  step: number;                  // 단계 번호
  processor: string;             // 处理人 (고객, 시스템, 담당자명)
  processNode: string;           // 处理节点 (처리 내용)
  processResult: string | null;  // 处理结果 (승인, 데이터 생성, 처리 취소 등)
  processFeedback?: string;      // 处理反馈 (상세 설명)
  processTime: Date;             // 处理时间
  
  // 로그 타입
  logType: 'system' | 'manual' | 'auto';
  
  // 실제 프로세스 로그 예시 (오더 221403984)
  // Step 1: processor: "고객 / 시스템", processNode: "신규 오더 접수", result: "신청 시작"
  // Step 2: processor: "시스템(qrobot)", processNode: "자동 회원 가입", result: "데이터 생성"
  // Step 3: processor: "시스템(qrobot)", processNode: "오더 번호 생성", result: "데이터 업데이트"
  // Step 4: processor: "김두호 DooHo KIM", processNode: "내부 검토 및 승인", result: "승인 (통과)"
  // Step 5: processor: "시스템(qrobot)", processNode: "조사 시작", result: "데이터 업데이트"
  // Step 6: processor: "시스템(qrobot)", processNode: "품명/요청사항 번역 요청", result: "Webhook 트리거"
  // Step 7: processor: "김두호 DooHo KIM", processNode: "번역 내용 수정 및 승인", result: "승인 (통과)"
  // Step 8: processor: "西文", processNode: "공급업체 정보 입력", result: "승인 (통과)"
  // Step 9: processor: "西文", processNode: "공급업체 정보 입력 취소", result: "처리 취소"
  // Step 10: processor: "西文", processNode: "공급업체 정보 재입력", result: "승인 (통과)"
  // Step 11: processor: "Soyeon", processNode: "제품 상세 정보 번역", result: "데이터 업데이트"
  // Step 12-22: 단가 계산, 견적서 발송 등 추가 단계들
}

// 처리자 타입
enum ProcessorType {
  CUSTOMER = '고객',
  SYSTEM = '시스템',
  QROBOT = '시스템(qrobot)',
  KOREAN_TEAM = '한국팀',
  CHINESE_STAFF = '중국직원',
  ADMIN = '관리자'
}
```

---

## 10. AI 자동화 필드 (신규)

### 10.1 AI 번역 관련 필드
```typescript
interface AITranslationFields {
  // 번역 메타데이터
  translationId?: string;         // 번역 ID
  sourceLanguage: 'ko' | 'zh';   // 원본 언어
  targetLanguage: 'ko' | 'zh';   // 대상 언어
  translationModel: string;       // 사용된 모델 (gpt-4-turbo)
  
  // 번역 품질
  confidenceScore?: number;       // 신뢰도 점수 (0-1)
  contextUsed?: boolean;          // 문맥 사용 여부
  technicalTermsCount?: number;   // 전문 용어 개수
  
  // 캐싱
  cacheHit?: boolean;             // 캐시 사용 여부
  cacheKey?: string;              // 캐시 키
  cachedAt?: Date;                // 캐시 저장 시간
}
```

### 10.2 AI 문서 처리 필드
```typescript
interface AIDocumentProcessing {
  // 문서 변환
  documentType: 'word' | 'pdf' | 'excel';
  conversionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  conversionTime?: number;        // 변환 소요 시간 (ms)
  
  // AI 분석
  documentSummary?: string;       // AI 요약
  keyPoints?: string[];           // 핵심 포인트
  extractedData?: any;            // 추출된 구조화 데이터
  
  // 품질 메트릭
  extractionAccuracy?: number;    // 추출 정확도
  formattingPreserved?: boolean;  // 포맷 보존 여부
}
```

### 10.3 AI 자동 계산 필드
```typescript
interface AICalculations {
  // CBM 계산
  autoCBM?: boolean;              // 자동 계산 여부
  cbmSource?: 'manual' | 'ai';   // 계산 출처
  
  // 가격 예측
  predictedShipping?: number;     // 예상 운송비
  predictedTariff?: number;       // 예상 관세
  predictedTotal?: number;        // 예상 총비용
  predictionConfidence?: number;  // 예측 신뢰도
  
  // 최적화 제안
  optimizationSuggestions?: {
    type: 'packaging' | 'shipping' | 'timing';
    description: string;
    potentialSaving: number;
  }[];
}
```

### 10.4 워크플로우 자동화 필드
```typescript
interface WorkflowAutomation {
  // 자동 처리
  autoAssigned?: boolean;         // 자동 배정 여부
  autoAssignedTo?: string;        // 자동 배정 대상
  autoAssignReason?: string;      // 자동 배정 사유
  
  // 상태 전환
  nextStateScheduled?: Date;      // 다음 상태 예약
  stateTransitionRules?: string[]; // 적용된 전환 규칙
  
  // 이벤트 추적
  triggeredEvents?: {
    eventType: string;
    timestamp: Date;
    result: 'success' | 'failed';
  }[];
}
```

---

## 📊 필드 통계

### 전체 필드 수
- 중국 출장 대행: 53개 필드
- 시장조사: 181개 필드 (가장 복잡)
- 샘플링: 약 40개 필드
- 구매대행: 약 50개 필드
- 배송대행: 약 30개 필드

### 자동 계산 필드
1. **환율 적용**: RMB → KRW 자동 변환
2. **수수료 계산**: 거래액의 5-10%
3. **CBM 계산**: 가로×세로×높이
4. **운송비 계산**: LCL/FCL 자동 산출
5. **관세 계산**: CIF × 세율
6. **총액 계산**: 모든 비용 합산

### 번역 필요 필드
- 제품명 (한 ↔ 중)
- 요청사항 (한 ↔ 중)  
- 공장 정보 (영 → 한)
- 보고서 내용 (중 → 한)

---

*본 문서는 QingFlow 실제 운영 데이터를 기반으로 작성된 서비스별 필드 정의서입니다.*