# 📋 요구사항 문서 (Software Requirements Specification)
**두리무역 디지털 전환 플랫폼**

문서 버전: v2.0  
작성일: 2025-01-26  
작성자: 프로젝트 관리팀  
표준: ISO/IEC/IEEE 29148:2018 기반

---

## 📑 목차

1. [서론](#1-서론)
2. [시스템 개요](#2-시스템-개요)
3. [기능 요구사항](#3-기능-요구사항)
4. [비기능 요구사항](#4-비기능-요구사항)
5. [인터페이스 요구사항](#5-인터페이스-요구사항)
6. [데이터 요구사항](#6-데이터-요구사항)
7. [비즈니스 규칙](#7-비즈니스-규칙)
8. [검수 기준](#8-검수-기준)

---

## 1. 서론

### 1.1 목적
본 문서는 두리무역 디지털 전환 플랫폼의 모든 요구사항을 정의합니다. docs/planning/ 폴더의 서비스 워크플로우 문서들을 기반으로 작성되었습니다.

### 1.2 범위
- **시스템명**: 두리무역 ERP 시스템 (Duly Trading ERP Platform)
- **대상 서비스**: 4개 서비스 카테고리 (총 7개 서비스)
  - **수입대행**: 제품 조사(기존: 시장조사), 샘플링, 대량 발주
  - **검품/감사**: 검품(생산 후), 공장감사, 선적검품
  - **구매대행**: B2B/단일상품 구매
  - **배송대행**: 묶음배송, 창고관리
- **사용자**: 고객(customer), 중국직원(chinese_staff), 한국팀(korean_team), 관리자(admin), 검품원(inspector), 공장(factory)

### 1.3 정의 및 약어
| 용어 | 설명 |
|------|------|
| SRS | Software Requirements Specification |
| RLS | Row Level Security (행 수준 보안) |
| GPT | Generative Pre-trained Transformer |
| FOB | Free On Board (본선인도가격) |
| MOQ | Minimum Order Quantity (최소주문수량) |
| CBM | Cubic Meter (입방미터) |

### 1.4 참조 문서
- [00_SERVICE_FRAMEWORK_TEMPLATE.md](../docs/planning/00_SERVICE_FRAMEWORK_TEMPLATE.md)
- [01_PAGE_STRUCTURE_FRAMEWORK.md](../docs/planning/01_PAGE_STRUCTURE_FRAMEWORK.md)
- [03_IMPORT_MARKET_RESEARCH_WORKFLOW.md](../docs/planning/03_IMPORT_MARKET_RESEARCH_WORKFLOW.md)
- [04_INSPECTION_SERVICE_WORKFLOW_FINAL.md](../docs/planning/04_INSPECTION_SERVICE_WORKFLOW_FINAL.md)
- [05_IMPORT_AGENCY_COMPLETE_WORKFLOW.md](../docs/planning/05_IMPORT_AGENCY_COMPLETE_WORKFLOW.md)
- [06_PURCHASING_AGENCY_WORKFLOW.md](../docs/planning/06_PURCHASING_AGENCY_WORKFLOW.md)
- [07_SHIPPING_AGENCY_WORKFLOW.md](../docs/planning/07_SHIPPING_AGENCY_WORKFLOW.md)

---

## 2. 시스템 개요

### 2.1 시스템 목표
한-중 무역의 복잡한 프로세스를 디지털화하여 70% 시간 단축 및 완전 자동화를 달성합니다.

### 2.2 주요 특징
- **실시간 번역**: GPT-4 기반 한-중 자동 번역으로 중국직원과 고객간 원활한 소통
- **예약번호 시스템**: DL-YYYYMMDD-XXXXXX 형식의 고유 식별자
- **역할 기반 접근**: 6개 역할별 차별화된 권한과 UI
- **모바일 우선**: 반응형 웹으로 언제 어디서나 접근
- **상태 표시**: 메인 페이지에 "진행중 3건 | 완료 12건" 형태로 현황 표시

### 2.3 시스템 아키텍처 개요
```
사용자 인터페이스 (Next.js 15)
    ↓
비즈니스 로직 계층 (TypeScript)
    ↓
데이터 접근 계층 (Supabase)
    ↓
데이터베이스 (PostgreSQL + RLS)
```

---

## 3. 기능 요구사항

### 3.1 사용자 관리 (AUTH)

#### AUTH-001: 사용자 등록
**우선순위**: 높음  
**설명**: 시스템은 역할별 차별화된 가입 프로세스를 제공해야 한다.

**세부 요구사항**:
1. 고객과 직원은 별도의 가입 페이지를 사용한다
   - 고객 가입: `/auth/customer/register` (즉시 이용 가능)
   - 직원 가입: `/auth/staff/register` (관리자 승인 필요)
2. 이메일/비밀번호와 OAuth 계정이 통합 관리되어야 한다
3. 필수 입력 정보:
   - 공통: 이메일, 비밀번호, 회사명, 담당자명, 연락처
   - 고객 추가: 사업자등록번호, 통관고유번호
   - 직원 추가: 부서, 직급, 담당 업무

#### AUTH-002: 사용자 로그인
**우선순위**: 높음  
**설명**: 시스템은 다양한 인증 방법을 지원해야 한다.

**세부 요구사항**:
1. 이메일/비밀번호 로그인
2. OAuth 로그인 (Google, 카카오)
3. MFA(다중 인증) 선택적 지원
4. 자동 로그인 유지 (Remember me)
5. 비밀번호 찾기/재설정

#### AUTH-003: 역할 기반 접근 제어
**우선순위**: 높음  
**설명**: 시스템은 6개 역할에 따른 접근 권한을 관리해야 한다.

**역할별 권한 매트릭스**:
| 역할 | 신청서 | 채팅 | 보고서 | 관리자 | 통계 |
|------|--------|------|--------|--------|------|
| customer | 자신의 것만 | 참여 | 조회 | ❌ | ❌ |
| chinese_staff | 배정된 것 | 참여 | 업로드 | ❌ | 자신의 것 |
| korean_team | 전체 | 전체 | 전체 | ❌ | 전체 |
| admin | 전체 | 전체 | 전체 | ✅ | 전체 |
| inspector | ❌ | 초대된 것 | ❌ | ❌ | ❌ |
| factory | ❌ | 초대된 것 | ❌ | ❌ | ❌ |

### 3.2 페이지 구조 (PAGE)

#### PAGE-001: 메인 페이지
**우선순위**: 높음  
**설명**: 시스템은 역할별 맞춤형 메인 페이지를 제공해야 한다.

**고객 메인 페이지**:
```
진행 현황: 진행중 3건 | 완료 12건 | 대기 2건
빠른 신청: [검품] [시장조사] [구매대행] [배송대행]
최근 신청: 리스트 표시
```

**직원 메인 페이지**:
```
오늘의 업무: 신규 5건 | 진행중 8건 | 마감임박 3건
담당 고객: 15개사
이번 달 실적: 완료 45건
```

#### PAGE-002: 신청 페이지
**우선순위**: 높음  
**설명**: 각 서비스별 최적화된 신청 폼을 제공해야 한다.

**서비스 선택 → 기본 정보 → 상세 정보 → 견적 확인 → 신청 완료**

### 3.3 검품 서비스 (INSPECTION)

#### INSP-001: 품질 검품 신청
**우선순위**: 높음  
**설명**: 기존 `inspection_applications` 테이블 구조를 활용한다.

**필수 입력 필드**:
```javascript
{
  "service_type": "quality_inspection",
  "product_name": "블루투스 이어폰",
  "production_quantity": 5000,
  "inspection_method": "standard", // standard | full
  "factory_name": "상하이 XX전자",
  "factory_contact_person": "왕경리",
  "factory_contact_phone": "138-1234-5678",
  "factory_address": "상하이시 푸동구...",
  "inspection_start_date": "2025-02-01",
  "inspection_days": 3,
  "special_requirements": "배터리 지속시간 중점 확인"
}
```

#### INSP-002: 검품 진행 프로세스
**우선순위**: 높음  
**설명**: 5단계 워크플로우를 따른다.

**상태 전이**:
```
submitted → quoted → paid → in_progress → completed
         ↘          ↘      ↘             ↘
              cancelled (모든 단계에서 가능)
```

#### INSP-003: 검품 보고서
**우선순위**: 높음  
**설명**: 중국 직원이 업로드한 보고서를 AI가 분석한다.

**보고서 처리**:
1. 직원이 Word/Excel 보고서 업로드
2. AI가 주요 내용 추출 및 번역
3. 한국팀 검토 및 승인
4. 고객에게 자동 전달

### 3.4 수입대행 서비스 (IMPORT)

#### IMP-001: 시장조사 서비스
**우선순위**: 높음  
**설명**: 고객은 간단히 입력, 직원이 상세 조사, AI가 계산한다.

**고객 입력 (최소)**:
```javascript
{
  "제품명": "무선충전기",
  "예상수량": "1000개",
  "목표가격": "개당 10-15달러",
  "요구사항": "KC인증 필수, 로고 인쇄",
  "참고사진": ["image1.jpg", "image2.jpg"] // 필수!
}
```

**직원 수집 정보**:
```javascript
{
  "제품크기": "15*10*3cm",
  "제품중량": "300g",
  "포장정보": {
    "박스크기": "60*40*30cm",
    "박스당수량": 50,
    "박스중량": "16kg"
  },
  "FOB가격": "$12.5",
  "MOQ": 500,
  "인증": "KC 보유"
}
```

**AI 자동 계산**:
- CBM 계산
- 해운비 계산
- 관세/부가세 계산
- 한국 도착가 산출

#### IMP-002: 샘플구매 → 대량발주
**우선순위**: 높음  
**설명**: 시장조사 후 샘플 구매, 검증 후 대량 발주로 이어진다.

**프로세스**:
```
시장조사 (5만원) → 샘플구매 (20만원+실비) → 평가 → 대량발주 (거래액 5%)
```

#### IMP-003: 구매대행 서비스
**우선순위**: 높음  
**설명**: 타오바오, 1688 등 중국 온라인 쇼핑몰 대행 구매

**고객 입력**:
```javascript
{
  "구매링크": ["https://1688.com/xxx", "https://taobao.com/yyy"],
  "수량": {"상품1": 10, "상품2": 5},
  "옵션": {"상품1": "색상: 블랙", "상품2": "사이즈: L"}
}
```

**처리 프로세스**:
1. 상품 확인 및 재고 검증
2. 구매 진행
3. 중국 물류센터 도착
4. 검수 및 포장
5. 국제배송 및 통관
6. 국내 배송

#### IMP-004: 배송대행 서비스
**우선순위**: 높음  
**설명**: 고객이 직접 구매한 물품의 한국 배송 대행

**서비스 특징**:
- 중국 물류센터 주소 제공
- 30일 무료 보관
- 묶음배송으로 운임 절감
- 실시간 입고 알림

### 3.5 AI 통합 시스템 (AI)

#### AI-001: Vercel AI SDK 통합
**우선순위**: 높음  
**설명**: 시스템은 Vercel AI SDK를 통해 다양한 AI 기능을 제공해야 한다.

**주요 기능**:
1. **스트리밍 응답**: AI 응답을 실시간으로 스트리밍
2. **모델 추상화**: OpenAI, Anthropic 등 다양한 모델 지원
3. **프롬프트 관리**: 재사용 가능한 프롬프트 템플릿
4. **에러 핸들링**: AI 서비스 장애 시 폴백 처리

**구현 예시**:
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages: [
    { role: 'system', content: '전문 무역 번역가' },
    { role: 'user', content: message }
  ],
});
```

#### AI-002: 문서 변환 시스템
**우선순위**: 높음  
**설명**: Word 문서를 HTML로 변환하여 AI 분석이 가능하도록 한다.

**기술 스택**:
- **Mammoth.js**: Word(.docx) → HTML 변환
- **pdf-parse**: PDF → 텍스트 추출
- **xlsx**: Excel → JSON 변환

**처리 플로우**:
```javascript
// Word 문서 변환
const mammoth = require('mammoth');
const result = await mammoth.convertToHtml({path: "report.docx"});
const htmlContent = result.value;

// AI 분석
const analysis = await analyzeWithAI(htmlContent);
```

#### AI-003: 지능형 번역 시스템
**우선순위**: 높음  
**설명**: 컨텍스트 기반 전문 용어 번역 및 캐싱

**캐싱 전략**:
```sql
-- AI 번역 캐시 테이블
ai_translation_cache {
  text_hash: VARCHAR(64),  -- SHA-256 해시
  source_lang: VARCHAR(5),
  target_lang: VARCHAR(5),
  translated_text: TEXT,
  confidence_score: DECIMAL,
  domain_context: VARCHAR(50),  -- 'inspection', 'trade', 'shipping'
  created_at: TIMESTAMP,
  hit_count: INTEGER
}
```

**번역 최적화**:
- 자주 사용되는 문장 캐싱
- 도메인별 전문 용어 사전
- 신뢰도 점수 기반 품질 관리

### 3.6 워크플로우 엔진 (WORKFLOW)

#### WF-001: XState 상태 머신
**우선순위**: 높음  
**설명**: 복잡한 비즈니스 프로세스를 상태 머신으로 관리한다.

**검품 서비스 상태 머신**:
```typescript
import { createMachine } from 'xstate';

const inspectionMachine = createMachine({
  id: 'inspection',
  initial: 'submitted',
  states: {
    submitted: {
      on: {
        QUOTE: 'quoted',
        CANCEL: 'cancelled'
      }
    },
    quoted: {
      on: {
        PAY: 'paid',
        EXPIRE: 'cancelled'
      },
      after: {
        '72 hours': 'cancelled'  // 3일 자동 취소
      }
    },
    paid: {
      on: {
        START: 'in_progress',
        REFUND: 'cancelled'
      }
    },
    in_progress: {
      on: {
        COMPLETE: 'completed',
        ISSUE: 'on_hold'
      }
    },
    completed: { type: 'final' },
    cancelled: { type: 'final' }
  }
});
```

#### WF-002: 이벤트 기반 자동화
**우선순위**: 높음  
**설명**: 상태 변경 시 자동으로 다음 작업을 트리거한다.

**자동화 규칙**:
1. **신청 접수** → 중국직원 자동 배정
2. **견적 발송** → 고객 알림 + 3일 타이머
3. **결제 완료** → 공장 일정 조율 시작
4. **검품 완료** → 보고서 번역 자동 시작
5. **번역 완료** → 고객 알림 + 보고서 전달

#### WF-003: 백그라운드 작업 큐
**우선순위**: 중간  
**설명**: BullMQ를 사용한 비동기 작업 처리

**작업 큐 구성**:
```typescript
import { Queue, Worker } from 'bullmq';

// 큐 정의
const translationQueue = new Queue('translation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

// 워커 정의
new Worker('translation', async (job) => {
  const { documentId, targetLang } = job.data;
  // 번역 처리
  await translateDocument(documentId, targetLang);
}, { connection: redis });
```

**큐 우선순위**:
- `urgent`: 실시간 채팅 번역
- `high`: 보고서 번역
- `normal`: 일반 문서 번역
- `low`: 배치 번역

### 3.7 실시간 채팅 (CHAT)

#### CHAT-001: 다국어 채팅
**우선순위**: 높음  
**설명**: GPT-4 기반 실시간 번역 채팅

**번역 규칙**:
- 한국 고객: 한국어만 표시
- 중국 직원/공장: 중국어만 표시
- 한국팀: 원문 + 번역문 모두 표시
- 메시지는 원문과 번역문 모두 저장

#### CHAT-002: 파일 공유
**우선순위**: 중간  
**설명**: 채팅에서 파일 공유 지원

**지원 파일**:
- 이미지: JPG, PNG, GIF (자동 압축)
- 문서: PDF, Word, Excel
- 동영상: MP4 (자동 압축)
- 최대 크기: 1GB/파일

#### CHAT-003: 참여자 관리
**우선순위**: 중간  
**설명**: 채팅방 참여자 관리

**기능**:
- 온라인/오프라인 상태
- 타이핑 인디케이터
- 읽음 표시
- 게스트 초대 (URL 생성)

### 3.6 보고서 관리 (REPORT)

#### REPORT-001: 보고서 업로드
**우선순위**: 높음  
**설명**: 중국 직원의 보고서 업로드 및 관리

**지원 형식**:
- Word (.docx)
- Excel (.xlsx)
- PDF (.pdf)

#### REPORT-002: AI 분석 및 번역
**우선순위**: 높음  
**설명**: AI가 보고서를 분석하고 주요 내용을 추출한다.

**AI 추출 정보**:
```javascript
{
  "총수량": 5000,
  "합격": 4850,
  "불량": 150,
  "불량률": "3%",
  "주요이슈": ["배터리 불량 20%", "외관 스크래치 10%"],
  "권장사항": ["배터리 공급업체 변경 검토"]
}
```

#### REPORT-003: Word 문서 HTML 변환
**우선순위**: 높음  
**설명**: 중국 직원이 업로드한 Word 문서를 AI가 분석할 수 있도록 변환한다.

**변환 프로세스**:
1. **문서 업로드**: 중국 직원이 .docx 파일 업로드
2. **HTML 변환**: Mammoth.js로 구조 보존 변환
3. **이미지 처리**: 문서 내 이미지 추출 및 저장
4. **AI 분석**: 변환된 HTML을 GPT-4로 분석
5. **결과 저장**: 분석 결과를 JSON으로 저장

**지원 요소**:
- 표(Table): 검사 결과표 → HTML 테이블
- 이미지: 불량품 사진 → Base64 또는 URL
- 차트: 통계 그래프 → 데이터 추출
- 스타일: 강조 텍스트 → 중요도 파악

### 3.7 예약번호 시스템 (RESERVATION)

#### RES-001: 예약번호 생성
**우선순위**: 높음  
**설명**: 모든 서비스에 고유한 예약번호를 부여한다.

**형식**: DL-YYYYMMDD-XXXXXX
- DL: 두리무역 식별자
- YYYYMMDD: 신청일
- XXXXXX: 일련번호 (자동 증가)

#### RES-002: 예약번호 조회
**우선순위**: 높음  
**설명**: 예약번호로 진행 상황을 조회할 수 있다.

**조회 가능 정보**:
- 서비스 종류 및 상태
- 담당자 정보
- 진행 이력
- 관련 문서
- 채팅 내역

### 3.8 관리자 기능 (ADMIN)

#### ADMIN-001: 대시보드
**우선순위**: 중간  
**설명**: 실시간 운영 현황 대시보드

**표시 정보**:
- 서비스별 신청 현황
- 직원별 업무량
- 월별 매출 통계
- 고객 만족도

#### ADMIN-002: 사용자 관리
**우선순위**: 높음  
**설명**: 직원 승인 및 권한 관리

**기능**:
- 가입 승인/거절
- 역할 변경
- 활동 이력 조회
- 접근 권한 설정

---

## 4. 비기능 요구사항

### 4.1 성능 요구사항

#### PERF-001: 응답 시간
- 페이지 로딩: 3초 이내 (FCP < 1.8s, LCP < 2.5s)
- API 응답: 200ms 이내
- 채팅 메시지: 100ms 이내 (실시간)
- 파일 업로드: 100MB/분
- AI 번역: 2초 이내 (캐시 히트 시 50ms)
- 문서 변환: 10MB 문서 5초 이내
- 워크플로우 전환: 500ms 이내

#### PERF-002: 처리량
- 동시 사용자: 1,000명 이상
- 초당 요청: 100 TPS 이상
- 일일 처리: 10,000건 이상

#### PERF-003: 가용성
- 시스템 가용성: 99.9% (월 43분 이내 다운타임)
- 계획된 유지보수: 월 1회, 새벽 2-4시
- 장애 복구: 4시간 이내

### 4.2 보안 요구사항

#### SEC-001: 인증 및 권한
- JWT 기반 인증 (24시간 만료)
- Refresh Token (7일 만료)
- RLS를 통한 데이터 격리
- IP 기반 접근 제한 (관리자)

#### SEC-002: 데이터 보호
- 전송: HTTPS (TLS 1.3)
- 저장: AES-256 암호화
- 백업: 일일 자동 백업
- 개인정보: 마스킹 처리

#### SEC-003: 감사 추적
- 모든 중요 작업 로깅
- 90일간 로그 보관
- 이상 행위 탐지
- 실시간 알림

### 4.3 사용성 요구사항

#### USE-001: 다국어 지원
- 한국어/중국어 완벽 지원
- 자동 언어 감지
- 전문 용어 사전
- 지역별 날짜/통화 형식

#### USE-002: 접근성
- WCAG 2.1 AA 준수
- 모바일 반응형
- 오프라인 부분 지원
- 저사양 기기 지원

---

## 5. 인터페이스 요구사항

### 5.1 사용자 인터페이스

#### UI-001: 디자인 시스템
- Tailwind CSS 4.x + shadcn/ui
- 서비스별 색상 구분
  - 파란색: 검품 서비스
  - 초록색: 수입대행 서비스
- 다크 모드 지원

#### UI-002: 네비게이션
- 역할별 맞춤 메뉴
- 브레드크럼
- 빠른 접근 툴바
- 검색 기능

### 5.2 외부 시스템 인터페이스

#### EXT-001: OpenAI GPT-4
- 용도: 실시간 번역, 문서 분석
- Rate Limit: 10,000 tokens/분
- Fallback: 번역 실패 시 원문 표시
- SDK: Vercel AI SDK 통합
- 모델: gpt-4-turbo (128K 컨텍스트)

#### EXT-004: Redis (신규)
- 용도: 워크플로우 큐, 캐싱
- 호스팅: Upstash Redis
- 용도별 구분:
  - `cache:*` - 번역 캐시
  - `queue:*` - 작업 큐
  - `session:*` - 세션 저장
  - `workflow:*` - 상태 저장

#### EXT-005: Edge Functions (신규)
- 용도: 서버리스 처리
- 플랫폼: Supabase Edge Functions
- 주요 함수:
  - `/functions/translate` - 번역 처리
  - `/functions/convert-document` - 문서 변환
  - `/functions/workflow-handler` - 워크플로우 처리
  - `/functions/ai-analyze` - AI 분석

#### EXT-002: 결제 시스템
- PG사 연동 (추후 결정)
- 신용카드, 계좌이체 지원
- 영수증 자동 발행

#### EXT-003: 알림 시스템
- 이메일: 주요 상태 변경
- SMS: 긴급 알림
- 푸시: 앱 알림 (추후)

---

## 6. 데이터 요구사항

### 6.1 데이터 모델

#### DATA-001: 핵심 테이블 구조
```sql
-- 검품 서비스
inspection_applications (기존 테이블 활용)

-- 시장조사
CREATE TABLE market_research_requests (
  id UUID PRIMARY KEY,
  reservation_number VARCHAR(50),
  customer_id UUID,
  product_name VARCHAR(200),
  quantity INTEGER,
  target_price_min DECIMAL,
  target_price_max DECIMAL,
  requirements TEXT,
  reference_photos JSONB,  -- 필수
  status VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE market_research_suppliers (
  id UUID PRIMARY KEY,
  request_id UUID,
  company_name VARCHAR(200),
  product_dimensions JSONB,
  product_weight DECIMAL,
  packaging_info JSONB,
  fob_price DECIMAL,
  moq INTEGER,
  product_photos JSONB,
  calculated_cbm DECIMAL,
  shipping_cost DECIMAL,
  total_cost_krw DECIMAL
);

-- 샘플/대량발주
CREATE TABLE sample_orders (
  id UUID PRIMARY KEY,
  research_id UUID,
  selected_suppliers JSONB,
  total_sample_cost DECIMAL,
  evaluation_results JSONB,
  status VARCHAR(50)
);

CREATE TABLE bulk_orders (
  id UUID PRIMARY KEY,
  sample_id UUID,
  supplier_info JSONB,
  order_details JSONB,
  payment_terms JSONB,
  production_status VARCHAR(50),
  documents JSONB
);

-- 구매대행
CREATE TABLE purchasing_orders (
  id UUID PRIMARY KEY,
  reservation_number VARCHAR(50),
  product_links JSONB,
  product_details JSONB,
  inspection_results JSONB,
  shipping_info JSONB,
  total_cost DECIMAL,
  status VARCHAR(50)
);

-- 배송대행
CREATE TABLE shipping_agency_orders (
  id UUID PRIMARY KEY,
  customer_code VARCHAR(20),
  expected_packages INTEGER,
  received_packages INTEGER,
  package_details JSONB,
  storage_location VARCHAR(50),
  consolidated_boxes INTEGER,
  shipping_method VARCHAR(50),
  status VARCHAR(50)
);
```

#### DATA-002: 데이터 관계
```
users → user_profiles → 각 서비스 테이블
                    ↓
              chat_messages
                    ↓
              uploaded_files
                    ↓
            inspection_reports
```

### 6.2 데이터 정책

#### DATA-003: 보관 정책
- 활성 데이터: 무제한
- 완료 데이터: 3년 보관
- 채팅 내역: 1년 보관
- 로그: 90일 보관

#### DATA-004: 백업 정책
- 실시간 복제
- 일일 전체 백업
- 주간 오프사이트 백업
- 30일 보관

---

## 7. 비즈니스 규칙

### 7.1 가격 정책

#### BIZ-001: 서비스별 가격
| 서비스 | 가격 | 비고 |
|--------|------|------|
| 품질검품 | 29만원/일 | 1-4일: 29만원, 5-9일: 27만원, 10일+: 25만원 |
| 공장감사 | 300만원/건 | 2-3일 소요 |
| 선적검품 | 50만원/일 | 당일 완료 |
| 시장조사 | 5만원/건 | 3-5개 업체 조사 |
| 샘플구매 | 20만원 + 실비 | 샘플비, 운송비 별도 |
| 대량발주 | 거래액의 5% | 최소 100만원 |
| 구매대행 | 거래액의 5-7% | 금액별 차등 |
| 배송대행 | 5천원/건 + 실비 | 묶음배송 가능 |

#### BIZ-002: 할인 정책
- 번들 이용: 2개 이상 서비스 10% 할인
- 연간 계약: 15% 할인
- 신규 고객: 첫 이용 20% 할인

### 7.2 업무 규칙

#### BIZ-003: 자동 배정
- 신규 신청: 업무량이 가장 적은 중국직원에게 자동 배정
- 재배정: 3일 이내 미처리 시 자동 재배정
- 우선순위: VIP > 긴급 > 일반

#### BIZ-004: 시한 규칙
- 견적 승인: 3영업일
- 결제 기한: 7일 (자동 취소)
- 보고서 제출: 검품 후 24시간
- 번역 완료: 보고서 접수 후 24시간

---

## 8. 검수 기준

### 8.1 기능 검수

#### ACC-001: 핵심 기능 체크리스트
- [ ] 7개 서비스 신청 프로세스 정상 작동
- [ ] 예약번호 자동 생성 및 조회
- [ ] 실시간 채팅 및 번역
- [ ] 파일 업로드/다운로드
- [ ] 역할별 접근 제어
- [ ] 상태별 워크플로우 전환
- [ ] AI SDK 스트리밍 응답
- [ ] Word→HTML 변환 정확도
- [ ] 워크플로우 자동 전환
- [ ] 번역 캐시 적중률 80% 이상

### 8.2 성능 검수

#### ACC-002: 성능 지표
- [ ] 페이지 로딩: 3초 이내
- [ ] 동시 접속: 100명 이상
- [ ] API 응답: 200ms 이내
- [ ] 가용성: 99.9% 이상

### 8.3 사용성 검수

#### ACC-003: 사용자 경험
- [ ] 3클릭 이내 주요 작업 완료
- [ ] 모바일 반응형 정상 작동
- [ ] 한중 번역 정확도 95% 이상
- [ ] 오류 메시지 명확성

---

## 📎 부록

### A. 요구사항 추적 매트릭스

| ID | 요구사항 | 우선순위 | 구현 상태 | 테스트 상태 |
|----|----------|----------|-----------|-------------|
| AUTH-001 | 역할별 가입 | 높음 | 개발중 | 대기 |
| PAGE-001 | 메인 페이지 | 높음 | 완료 | 테스트중 |
| INSP-001 | 검품 신청 | 높음 | 완료 | 완료 |
| IMP-001 | 시장조사 | 높음 | 개발중 | 대기 |
| CHAT-001 | 실시간 번역 | 높음 | 완료 | 테스트중 |

### B. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|---------|
| 1.0 | 2025-01-26 | 초기 작성 (기존 문서) | PM |
| 2.0 | 2025-01-26 | 서비스 워크플로우 기반 전면 개정 | PM |
| 2.1 | 2025-01-27 | AI SDK, 워크플로우 엔진, 문서 변환 추가 | PM |

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성 | PM | | 2025-01-26 |
| 검토 | Tech Lead | | |
| 승인 | CEO | | |

---

*본 문서는 두리무역 디지털 전환 프로젝트의 공식 요구사항 명세서입니다.*