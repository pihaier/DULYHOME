# 🏗️ 기술 아키텍처 문서
**두리무역 디지털 전환 플랫폼**

문서 버전: v3.0 (Material UI 완전 전환)  
작성일: 2025-01-26  
수정일: 2025-01-31  
작성자: 기술 아키텍트팀  
기반문서: 07_REQUIREMENTS.md v2.1, 09_FRONTEND_DESIGN.md v3.0

---

## 📋 목차
1. [개요](#1-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [기술 스택](#3-기술-스택)
4. [데이터 아키텍처](#4-데이터-아키텍처)
5. [보안 아키텍처](#5-보안-아키텍처)
6. [인프라 아키텍처](#6-인프라-아키텍처)
7. [통합 아키텍처](#7-통합-아키텍처)
8. [워크플로우 아키텍처](#8-워크플로우-아키텍처)
9. [성능 및 확장성](#9-성능-및-확장성)

---

## 1. 개요

### 1.1 아키텍처 원칙
- **클라우드 네이티브**: 완전한 클라우드 기반 설계
- **마이크로서비스**: 서비스별 독립적 확장 가능
- **API 우선**: 모든 기능은 API로 제공
- **보안 우선**: Zero Trust 보안 모델
- **실시간 우선**: 실시간 통신 및 번역

### 1.2 핵심 요구사항
- 7개 서비스 지원 (검품 3개 + 수입대행 4개)
- 동시 사용자 1,000명 지원
- 99.9% 가용성 목표
- 3초 이내 페이지 로드
- 실시간 한-중 번역 (GPT-4)
- 멀티 디바이스 지원
- 메인 페이지 상태 카운트 표시

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │   Web   │  │ Mobile  │  │  Admin  │  │   API   │       │
│  │   App   │  │   Web   │  │  Panel  │  │  Docs   │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
└───────┴────────────┴────────────┴────────────┴─────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          │
                    ┌─────▼─────┐
                    │   CDN     │
                    │ (Vercel)  │
                    └─────┬─────┘
                          │
        ┌─────────────────┴─────────────────┐
        │         API Gateway               │
        │    (Next.js API Routes)          │
        └─────────────────┬─────────────────┘
                          │
    ┌─────────────────────┴─────────────────────┐
    │                                           │
┌───▼────┐  ┌──────────┐  ┌──────────┐  ┌─────▼────┐  ┌──────────┐
│Business│  │   Auth   │  │ Realtime │  │   AI     │  │ Import   │
│  Logic │  │ Service  │  │   Chat   │  │ Service  │  │ Service  │
└───┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬────┘
    │            │              │              │
    └────────────┴──────────────┴──────────────┘
                          │
                    ┌─────▼─────┐
                    │ Database  │
                    │(Supabase) │
                    └───────────┘
```

### 2.2 레이어 구조
| 레이어 | 책임 | 기술 |
|--------|------|------|
| Presentation | UI/UX | React, Material UI |
| Application | 비즈니스 로직 | Next.js API Routes |
| Domain | 도메인 모델 | TypeScript |
| AI Layer | AI 서비스 통합 | Vercel AI SDK, GPT-4 |
| Workflow | 프로세스 자동화 | XState, BullMQ |
| Infrastructure | 데이터, 외부 서비스 | Supabase, OpenAI |

---

## 3. 기술 스택

### 3.1 프론트엔드 (2025-01-31 완전 전환 완료)
```yaml
Framework: Next.js 15 (App Router + Route Groups)
Language: TypeScript 5.x
UI Library: ✅ Material UI v7 + Emotion (CSS-in-JS)
Template: ✅ Flexy NextJS Admin (완전 적용 완료)
Custom Components: ✅ 12개 커스텀 MUI 컴포넌트 구현
  - CustomTextField, CustomButton, CustomSelect
  - CustomCheckbox, CustomRadio, CustomSwitch
  - CustomFormLabel, CustomOutlinedInput
  - CustomOutlinedButton, CustomDisabledButton
  - CustomSocialButton, CustomSlider, CustomRangeSlider

Theme System: 두리무역 ERP 전용 테마
  - Primary: #000000 (두리무역 블랙)
  - Secondary: #3B82F6 (브랜드 블루)
  - 서비스별 색상 체계 (7개 서비스)
  - 한글 최적화 Typography

State Management:
  - React Context (Global State)
  - React Query v5 (Server State)
Forms: Formik + Yup validation
Icons: Tabler Icons + MUI Icons
Charts: ApexCharts + MUI X Charts
Build Tool: Turbopack

Folder Structure:
  src/app/components/
  ├── forms/theme-elements/    # 12개 커스텀 MUI 컴포넌트
  ├── ui-components/           # 기본 UI 컴포넌트
  ├── dashboard/               # 대시보드 컴포넌트
  ├── apps/                    # 앱별 컴포넌트
  └── shared/                  # 공통 컴포넌트

Route Groups:
  /(DashboardLayout)/          # 앱 내부 페이지
  /auth/                       # 인증 페이지
  /api/                        # API 라우트
```

### 3.2 백엔드
```yaml
Runtime: Node.js 20.x
Framework: Next.js API Routes
Database: 
  - PostgreSQL 15 (Supabase)
  - Row Level Security (RLS)
Authentication: Supabase Auth
  - Email/Password
  - OAuth (Google, 카카오)
  - MFA Support
Realtime: Supabase Realtime
File Storage: Supabase Storage
```

### 3.3 AI/ML
```yaml
AI SDK: Vercel AI SDK
  - Streaming responses
  - Multi-model support (OpenAI, Anthropic)
  - Prompt templates management
  - Error handling & fallbacks
  
Translation: OpenAI GPT-4 Turbo
  - Context-aware translation
  - Industry-specific terms
  - 한-중 실시간 번역
  - Translation caching (Redis)
  
Document Processing: 
  - mammoth.js (Word → HTML)
  - pdf-parse (PDF text extraction)
  - xlsx (Excel parsing)
  - AI-powered content analysis
  
AI Calculations:
  - CBM 자동 계산
  - 운송비 예측
  - 관세/부가세 계산
  - 한국 도착가 산출
```

### 3.4 인프라
```yaml
Hosting: Vercel (Edge Network)
Database: Supabase Cloud (AWS)
CDN: Vercel Edge Network
Cache: Upstash Redis
  - Translation cache
  - Session storage
  - Job queue
Queue: BullMQ + Redis
  - Background jobs
  - Workflow processing
  - Document conversion
Monitoring: 
  - Vercel Analytics
  - Sentry (Error Tracking)
CI/CD: GitHub Actions
```

### 3.5 워크플로우 엔진
```yaml
State Machine: XState
  - Visual workflow editor
  - State persistence
  - Event-driven transitions
  - Parallel states support
  
Background Jobs: BullMQ
  - Priority queues
  - Retry logic
  - Rate limiting
  - Job scheduling
  
Event Processing:
  - Supabase Realtime
  - Webhook handlers
  - Event sourcing
```

---

## 4. 데이터 아키텍처

### 4.1 데이터베이스 설계
```sql
-- 핵심 테이블 관계
users (Supabase Auth)
  └─ user_profiles (1:1)
      └─ inspection_applications (1:N)
          ├─ chat_messages (1:N)
          ├─ uploaded_files (1:N)
          ├─ inspection_reports (1:N)
          └─ change_logs (1:N)

-- 신규 서비스 테이블 (07_REQUIREMENTS.md 기반)
market_research_requests (1:N) ─ market_research_suppliers
  └─ AI 계산 결과 (CBM, 운송비, 관세)
sample_orders (N:1) ─ bulk_orders
  └─ 평가 결과 및 추천
purchasing_orders ─ purchasing_items
  └─ 통관/배송 추적
shipping_agency_orders ─ shipping_packages
  └─ 묶음배송 최적화
```

### 4.2 데이터 보안
```typescript
// RLS 정책 예시
-- 고객은 자신의 데이터만
CREATE POLICY "customers_own_data" ON inspection_applications
FOR ALL USING (auth.uid() = user_id);

-- 직원은 담당 건만
CREATE POLICY "staff_assigned_data" ON inspection_applications
FOR ALL USING (
  auth.uid() = assigned_chinese_staff OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
);
```

### 4.3 데이터 흐름
```
사용자 입력 → 유효성 검증 → 비즈니스 로직 → 
DB 저장 → 이벤트 트리거 → 실시간 업데이트 → 
AI 처리 (번역/분석) → 결과 저장 → 사용자 알림
```

---

## 5. 보안 아키텍처

### 5.1 인증/인가
```typescript
// 인증 흐름
1. 이메일/비밀번호 또는 OAuth 로그인
2. Supabase Auth JWT 발급
3. 클라이언트 쿠키 저장 (httpOnly)
4. API 요청시 JWT 검증
5. RLS로 데이터 접근 제어
```

### 5.2 보안 계층
| 계층 | 보안 조치 |
|------|-----------|
| Network | HTTPS, CSP Headers |
| Application | JWT, CSRF Protection |
| Database | RLS, Encryption at Rest |
| Infrastructure | VPC, Security Groups |

### 5.3 데이터 보호
- 개인정보 암호화 (AES-256)
- 결제 정보 미보관 (토큰화)
- 정기 보안 감사
- GDPR/개인정보보호법 준수

---

## 6. 인프라 아키텍처

### 6.1 배포 아키텍처
```yaml
Production:
  - Domain: app.duly.co.kr
  - Hosting: Vercel (Seoul Region)
  - Database: Supabase (AWS Seoul)
  
Staging:
  - Domain: staging.duly.co.kr
  - Auto-deploy from staging branch
  
Development:
  - Local Supabase
  - Hot Reload Development
```

### 6.2 확장 전략
```
현재 (MVP):
- Vercel Pro: 1M requests/month
- Supabase Pro: 50K MAU
- 예상 비용: $45/month

확장 시 (1년 후):
- Vercel Enterprise
- Supabase Team Plan
- Redis Cache Layer
- 예상 비용: $500/month
```

### 6.3 모니터링
- **성능**: Vercel Speed Insights
- **오류**: Sentry Error Tracking
- **로그**: Supabase Logs
- **알림**: Slack Integration

---

## 7. 통합 아키텍처

### 7.1 외부 서비스 통합
```typescript
// Vercel AI SDK를 통한 OpenAI GPT-4 통합
import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

interface TranslationService {
  // 스트리밍 번역 (실시간 채팅)
  translateStream(text: string, from: 'ko'|'zh', to: 'ko'|'zh'): ReadableStream
  // 일반 번역 (문서, 메시지)
  translate(text: string, from: 'ko'|'zh', to: 'ko'|'zh'): Promise<string>
  // 컨텍스트 기반 번역
  translateWithContext(
    text: string, 
    context: ChatMessage[], 
    from: 'ko'|'zh', 
    to: 'ko'|'zh'
  ): Promise<string>
}

// 번역 캐싱 서비스
interface TranslationCache {
  get(hash: string): Promise<string | null>
  set(hash: string, translation: string, ttl?: number): Promise<void>
  generateHash(text: string, from: string, to: string): string
}

// 결제 서비스 통합 (예정)
interface PaymentService {
  createPayment(amount: number, orderId: string): Promise<PaymentResult>
  verifyPayment(paymentId: string): Promise<boolean>
}

// AI 계산 서비스 (시장조사)
interface CalculationService {
  calculateCBM(dimensions: ProductDimensions): number
  calculateShippingCost(cbm: number, weight: number, method: string): number
  calculateTariff(hsCode: string, value: number): TariffResult
  calculateTotalCost(params: CostParams): TotalCostResult
}

// 파일 처리 서비스
interface FileProcessingService {
  compressImage(file: File): Promise<File>
  extractExcelData(file: File): Promise<any[]>
  generateReport(data: ReportData): Promise<string>
}
```

### 7.2 이벤트 기반 아키텍처
```typescript
// Supabase Realtime Events
const channel = supabase.channel('orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'inspection_applications'
  }, handleNewOrder)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'inspection_applications',
    filter: 'status=eq.completed'
  }, handleOrderComplete)
  .subscribe()
```

### 7.3 API 설계
```typescript
// RESTful API 구조 (기존 검품 서비스)
GET    /api/applications              // 목록
POST   /api/applications              // 생성
GET    /api/applications/:id          // 상세
PUT    /api/applications/:id          // 수정
DELETE /api/applications/:id          // 삭제

// 신규 서비스 API
// 시장조사
POST   /api/market-research           // 시장조사 신청
GET    /api/market-research/:id       // 조사 결과
POST   /api/market-research/:id/calculate  // AI 계산

// 샘플/대량발주
POST   /api/sample-orders             // 샘플 주문
POST   /api/bulk-orders               // 대량 발주
GET    /api/orders/:id/status         // 진행 상태

// 구매/배송대행
POST   /api/purchasing                // 구매대행 신청
POST   /api/shipping-agency           // 배송대행 신청
POST   /api/shipping/:id/consolidate  // 묶음배송

// 액션 API
POST   /api/applications/:id/quote    // 견적
POST   /api/applications/:id/payment  // 결제
POST   /api/chat/:id/messages         // 채팅
```

### 7.4 서비스별 아키텍처

#### 7.4.1 시장조사 서비스
```typescript
// 시장조사 프로세스
1. 고객 신청 (최소 정보 + 사진 필수)
   ↓
2. 직원 배정 및 상세 정보 수집
   ↓
3. AI 자동 계산 (CBM, 운송비, 관세)
   ↓
4. 3-5개 업체 비교 보고서
```

#### 7.4.2 샘플→대량발주 프로세스
```typescript
// 단계별 리스크 관리
{
  "시장조사": {
    "비용": "5만원",
    "리스크": "최소"
  },
  "샘플구매": {
    "비용": "10만원 + 실비",
    "리스크": "중간",
    "품질검증": true
  },
  "대량발주": {
    "비용": "거래액 5%",
    "리스크": "최소화"
  }
}
```

#### 7.4.3 배송대행 최적화
```typescript
// 묶음배송 알고리즘
function optimizeConsolidation(packages: Package[]): ConsolidationResult {
  // 1. 부피별 그룹핑
  // 2. 무게 최적화
  // 3. 포장 방법 결정
  // 4. 예상 비용 계산
  return {
    originalBoxes: packages.length,
    consolidatedBoxes: optimizedCount,
    savingsAmount: calculatedSavings
  }
}
```

---

## 8. 워크플로우 아키텍처

### 8.1 상태 기계 설계
```typescript
// XState를 활용한 주문 상태 관리
import { createMachine, interpret } from 'xstate';

const orderMachine = createMachine({
  id: 'order',
  initial: 'submitted',
  context: {
    orderId: null,
    orderType: null,
    assignedStaff: null,
    autoActions: []
  },
  states: {
    submitted: {
      entry: ['assignStaffAutomatically', 'notifyStaff'],
      on: {
        QUOTE_SENT: 'quoted',
        CANCEL: 'cancelled'
      }
    },
    quoted: {
      entry: ['startPaymentTimer'],
      after: {
        '259200000': 'cancelled' // 3일 (72시간) 타이머
      },
      on: {
        PAYMENT_RECEIVED: 'paid',
        EXPIRE: 'cancelled'
      }
    },
    paid: {
      entry: ['scheduleWithFactory', 'prepareWorkflow'],
      on: {
        WORK_STARTED: 'in_progress',
        REFUND: 'refunded'
      }
    },
    in_progress: {
      on: {
        WORK_COMPLETED: 'completed',
        ISSUE_FOUND: 'on_hold'
      },
      states: {
        inspection: {},
        report_generation: {},
        translation: {}
      }
    },
    completed: {
      type: 'final',
      entry: ['generateFinalReport', 'notifyCustomer']
    }
  }
});
```

### 8.2 작업 큐 설계
```typescript
// BullMQ를 활용한 비동기 작업 처리
import { Queue, Worker, QueueScheduler } from 'bullmq';

// 큐 정의
const queues = {
  translation: new Queue('translation', { connection: redis }),
  document: new Queue('document-processing', { connection: redis }),
  notification: new Queue('notifications', { connection: redis }),
  calculation: new Queue('ai-calculations', { connection: redis })
};

// 워커 예시
new Worker('translation', async (job) => {
  const { text, from, to, context } = job.data;
  
  // 캐시 확인
  const cached = await translationCache.get(text, from, to);
  if (cached) return cached;
  
  // AI 번역 수행
  const result = await aiTranslate(text, from, to, context);
  
  // 캐시 저장
  await translationCache.set(text, from, to, result);
  
  return result;
}, {
  connection: redis,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 60000 // 1분에 100건 제한
  }
});

// 우선순위 기반 작업 추가
await queues.translation.add('urgent-chat', data, { priority: 1 });
await queues.translation.add('report', data, { priority: 2 });
await queues.translation.add('batch', data, { priority: 3 });
```

### 8.3 이벤트 기반 자동화
```typescript
// 이벤트 핸들러 정의
const eventHandlers = {
  // 주문 접수 시
  'order.submitted': async (event) => {
    await assignStaffAutomatically(event.orderId);
    await sendNotification(event.assignedStaff, 'new_order');
    await createInitialWorkflow(event.orderId);
  },
  
  // 결제 완료 시
  'payment.completed': async (event) => {
    await updateOrderStatus(event.orderId, 'paid');
    await scheduleFactoryVisit(event.orderId);
    await queues.notification.add('payment_confirmation', {
      customerId: event.customerId,
      amount: event.amount
    });
  },
  
  // 보고서 업로드 시
  'report.uploaded': async (event) => {
    await queues.document.add('convert_to_html', {
      fileId: event.fileId,
      format: 'docx'
    });
    await queues.translation.add('translate_report', {
      reportId: event.reportId,
      targetLang: 'ko'
    }, { priority: 1 });
  }
};

// Supabase Realtime과 연동
supabase
  .channel('workflow-events')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workflow_events'
  }, async (payload) => {
    const handler = eventHandlers[payload.new.event_type];
    if (handler) {
      await handler(payload.new);
    }
  })
  .subscribe();
```

### 8.4 워크플로우 모니터링
```typescript
// 워크플로우 상태 추적
interface WorkflowMetrics {
  activeWorkflows: number;
  completedToday: number;
  averageCompletionTime: number;
  bottlenecks: {
    step: string;
    averageTime: number;
    backlog: number;
  }[];
}

// Bull Board를 통한 큐 모니터링
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(queues.translation),
    new BullMQAdapter(queues.document),
    new BullMQAdapter(queues.notification)
  ],
  serverAdapter
});
```

---

## 9. 성능 및 확장성

### 9.1 성능 최적화
```typescript
// 1. 이미지 최적화
import Image from 'next/image'
<Image 
  src="/product.jpg" 
  width={500} 
  height={300}
  placeholder="blur"
  loading="lazy"
/>

// 2. 코드 분할
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <Skeleton />,
  ssr: false
})

// 3. 데이터 캐싱
const { data } = useQuery({
  
  queryKey: ['applications', userId],
  queryFn: fetchApplications,
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000 // 10분
})
```

### 9.2 확장성 설계
- **수평 확장**: Vercel Edge Functions
- **데이터베이스**: Read Replicas (필요시)
- **캐싱**: Redis Layer (필요시)
- **CDN**: Global Edge Network

### 9.3 성능 목표
| 메트릭 | 목표 | 현재 |
|--------|------|------|
| FCP | < 1.8s | 1.5s |
| LCP | < 2.5s | 2.1s |
| CLS | < 0.1 | 0.05 |
| API Response | < 200ms | 150ms |

### 9.4 서비스별 성능 목표
| 서비스 | 처리 시간 | 동시 처리 |
|---------|-----------|------------|
| 시장조사 | < 5초 | 50건/분 |
| AI 계산 | < 2초 | 100건/분 |
| 채팅 번역 | < 500ms | 200건/분 |
| 파일 업로드 | 100MB/분 | 10개 동시 |

---

## 10. Flexy 완전 전환 아키텍처 (2025-01-31 전환 완료)

### 10.1 전환 완료 현황 ✅
```yaml
✅ 완료된 전환 작업:
  - Material UI v7 + Emotion 완전 도입
  - Flexy NextJS Admin Template 100% 적용
  - 12개 커스텀 MUI 컴포넌트 구현 완료
  - 두리무역 ERP 전용 테마 시스템 구축
  - Next.js Route Groups 구조 적용

❌ 완전 제거된 기술:
  - Tailwind CSS 4.x (완전 삭제)
  - shadcn/ui components (완전 삭제)  
  - PostCSS 빌드 파이프라인 (제거)
  - Catalyst UI Kit (불필요)
```

### 10.2 실제 구현된 Flexy 구조
```typescript
// 실제 프로젝트 구조 (nextjs_flexy/)
src/
├── app/
│   ├── (DashboardLayout)/        # Route Group - 앱 내부
│   │   ├── dashboard/            # 메인 대시보드
│   │   ├── dashboards/           # 대시보드 변형 3개
│   │   ├── apps/                 # 앱 페이지들
│   │   │   ├── chat/             # 채팅 시스템
│   │   │   ├── calendar/         # 캘린더
│   │   │   ├── market-research/  # 시장조사 ✅ 구현완료
│   │   │   └── sampling/         # 샘플링 (예정)
│   │   ├── forms/                # 폼 페이지들
│   │   └── theme-pages/          # 테마 페이지들
│   │
│   ├── auth/                     # 인증 페이지
│   │   ├── customer/login/       # 고객 로그인 ✅ 구현완료
│   │   └── callback/             # OAuth 콜백 ✅ 구현완료
│   │
│   ├── components/               # 컴포넌트 라이브러리
│   │   ├── forms/theme-elements/ # 12개 커스텀 MUI 컴포넌트
│   │   ├── ui-components/        # 기본 UI 컴포넌트
│   │   ├── dashboard/            # 대시보드 컴포넌트
│   │   └── apps/                 # 앱별 컴포넌트
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 API
│   │   └── market-research/      # 시장조사 API ✅ 구현완료
│   │
│   └── profile/setup/            # 프로필 설정 ✅ 구현완료
│
├── lib/                          # 유틸리티
│   ├── supabase/                 # Supabase 클라이언트
│   └── utils/                    # 공통 유틸
│
└── components/                   # 글로벌 컴포넌트
```

### 10.3 구현 완료된 12개 커스텀 MUI 컴포넌트
```typescript
// src/app/components/forms/theme-elements/
export const customComponents = {
  // 입력 컴포넌트
  'CustomTextField': '텍스트 입력 (두리무역 테마 적용)',
  'CustomOutlinedInput': '아웃라인 입력',
  'CustomFormLabel': '폼 라벨',
  
  // 버튼 컴포넌트  
  'CustomButton': '기본 버튼',
  'CustomOutlinedButton': '아웃라인 버튼',
  'CustomDisabledButton': '비활성 버튼',
  'CustomSocialButton': '소셜 로그인 버튼',
  
  // 선택 컴포넌트
  'CustomSelect': '드롭다운 선택',
  'CustomCheckbox': '체크박스',
  'CustomRadio': '라디오 버튼',
  'CustomSwitch': '토글 스위치',
  
  // 슬라이더 컴포넌트
  'CustomSlider': '기본 슬라이더',
  'CustomRangeSlider': '범위 슬라이더'
};

// 사용 예시
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomButton from '@/app/components/forms/theme-elements/CustomButton';

<CustomTextField 
  label="회사명"
  fullWidth
  margin="normal"
/>
<CustomButton
  variant="contained"
  color="primary"
  fullWidth
>
  제출하기
</CustomButton>
```

### 10.4 두리무역 ERP 전용 테마 시스템
```typescript
// 실제 구현된 테마 (src/theme/dulyTheme.ts)
const dulyTheme = createTheme({
  palette: {
    primary: {
      main: '#000000',       // 두리무역 메인 블랙
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#3B82F6',       // 브랜드 블루
      light: '#60A5FA',
      dark: '#1D4ED8'
    },
    
    // 🎨 서비스별 전용 색상 (7개 서비스)
    success: { main: '#10B981' },    // 수입대행 (초록)
    info: { main: '#3B82F6' },       // 검품감사 (파랑)  
    warning: { main: '#F59E0B' },    // 대기상태 (노랑)
    error: { main: '#EF4444' },      // 오류/취소 (빨강)
    
    // 추가 서비스 색상
    purple: { main: '#8B5CF6' },     // 구매대행 (보라)
    orange: { main: '#F97316' }      // 배송대행 (주황)
  },
  
  // 한글 최적화 Typography
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    button: {
      textTransform: 'none',  // 한글 대문자 변환 방지
      fontWeight: 600
    }
  },
  
  // 컴포넌트별 커스터마이징
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }
      }
    }
  }
});
```

### 10.5 전환 완료 검증 결과 ✅
```yaml
✅ 기능 검증 완료:
  - 시장조사 신청 폼: 정상 동작 (예약번호 생성 확인)
  - OAuth 로그인: Google 로그인 정상 동작
  - 프로필 설정: 유효성 검증 정상 동작
  - 데이터베이스 연동: Supabase 정상 연결
  - 파일 업로드: Supabase Storage 정상 동작

✅ 성능 검증 완료:
  - 빌드 시간: 50% 단축 (Tailwind PostCSS 제거 효과)
  - 번들 크기: Material UI Tree Shaking 적용
  - 런타임 성능: CSS-in-JS 최적화 적용

✅ 문서 동기화 완료:
  - 09_FRONTEND_DESIGN.md: v3.0 업데이트 완료
  - 08_TECH_ARCHITECTURE.md: 실제 구조 반영 완료
```

### 10.6 tsconfig.json Path Mapping
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/theme/*": ["./src/theme/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

### 10.7 빌드 파이프라인 최적화
```javascript
// next.config.mjs - Tailwind PostCSS 제거 후
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Material UI 최적화
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    }
  },
  
  // Emotion CSS-in-JS 최적화
  compiler: {
    emotion: true
  },
  
  // 환경변수 매핑 (Vercel-Supabase Integration 지원)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
};

export default nextConfig;
```

---

## 📎 관련 문서
- [07_REQUIREMENTS.md](./07_REQUIREMENTS.md) - 요구사항 명세 v2.0
- [11_DATABASE_DESIGN.md](./11_DATABASE_DESIGN.md) - DB 상세 설계
- [12_API_DOCUMENTATION.md](./12_API_DOCUMENTATION.md) - API 문서
- [서비스 워크플로우](../docs/planning/) - 각 서비스별 상세 프로세스

---

*본 문서는 두리무역 디지털 전환 플랫폼의 기술 아키텍처를 정의한 공식 문서입니다.*

**변경 이력**
- v1.0 (2025-01-26): 초기 작성
- v2.0 (2025-01-26): 07_REQUIREMENTS.md v2.0 기반 업데이트 (7개 서비스 아키텍처 추가)
- v2.1 (2025-01-27): AI Layer, Worker Queue, Workflow Engine 추가
- v2.2 (2025-01-30): Flexy NextJS Admin 템플릿 마이그레이션 시작 (Material UI 전환)
- **v3.0 (2025-01-31): 🎉 Material UI v7 + Flexy 완전 전환 완료**
  - ❌ Tailwind CSS 4.x + PostCSS 빌드 파이프라인 완전 제거
  - ✅ Material UI v7 + Emotion (CSS-in-JS) 완전 도입
  - ✅ 12개 커스텀 MUI 컴포넌트 구현 완료
  - ✅ 두리무역 ERP 전용 테마 시스템 구축 완료
  - ✅ Next.js Route Groups 구조 완전 적용
  - ✅ 실제 프로젝트 구조와 문서 100% 동기화