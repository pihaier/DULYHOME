# 🎨 프론트엔드 설계 문서 (Frontend Design Document)
**두리무역 디지털 전환 플랫폼**

문서 버전: v3.0 (Material UI 완전 전환)  
작성일: 2025-01-26  
마지막 업데이트: 2025-01-31  
작성자: 프론트엔드 아키텍트  
표준: Next.js 15 + TypeScript + Material UI v7 + Emotion

---

## 📑 목차
1. [설계 개요](#1-설계-개요)
2. [포털 분리 전략](#2-포털-분리-전략)
3. [고객 포털 설계](#3-고객-포털-설계)
4. [직원 포털 설계](#4-직원-포털-설계)
5. [공통 컴포넌트](#5-공통-컴포넌트)
6. [상태 관리](#6-상태-관리)
7. [백엔드 연동](#7-백엔드-연동)
8. [성능 최적화](#8-성능-최적화)

---

## 1. 설계 개요

### 1.1 핵심 설계 원칙
```
✅ 고객과 직원 포털 완전 분리
✅ 역할별 맞춤형 UI/UX
✅ 실시간 상태 추적
✅ 모바일 우선 반응형
✅ 백엔드 완벽 연동
```

### 1.2 기술 스택 (2025-01-31 Flexy 완전 적용)
- **Framework**: Next.js 15 (App Router + Route Groups)
- **Language**: TypeScript 5.x
- **Styling**: **Material UI v7 + Emotion** ✅ 완전 적용 완료
- **UI Template**: **Flexy NextJS Admin** ✅ 완전 마이그레이션 완료
- **State Management**: React Context + React Query v5
- **Form Handling**: Formik + Yup validation
- **Real-time**: Supabase Realtime
- **Charts**: ApexCharts + MUI X Charts
- **Icons**: Tabler Icons + MUI Icons
- **Authentication**: Supabase Auth (OAuth + Email/Password)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage

**주요 변경사항:**
- ❌ **Tailwind CSS 완전 제거** (2025-01-31)
- ✅ **Material UI v7 + Emotion 전면 도입**
- ✅ **12개 커스텀 MUI 컴포넌트** 구현 완료
- ✅ **Flexy 라우팅 구조** 적용 완료

### 1.3 전체 페이지 구조 (총 82페이지)
```
두리무역 ERP
├── 고객 포털 (26페이지)
├── 직원 포털 (35페이지)
├── 관리자 포털 (15페이지)
└── 공통 페이지 (6페이지)
```

---

## 2. 포털 분리 전략

### 2.1 실제 Flexy 라우팅 구조 (Next.js 15 App Router + Route Groups)
```
# 🌐 Public Pages (공개 페이지)
/                            → 랜딩 페이지 (src/app/page.tsx)
/landingpage                 → 상세 랜딩 페이지
/frontend-pages/*            → 마케팅 페이지들

# 🔐 Authentication (인증 페이지)
/auth/customer/login         → 고객 로그인 ✅ 구현 완료
/auth/staff/login           → 직원 로그인
/auth/callback              → OAuth 콜백

# 📊 Dashboard Layout (Route Group)
/(DashboardLayout)/
├── dashboard                → 메인 대시보드
├── dashboards/
│   ├── dashboard1          → 대시보드 변형 1
│   ├── dashboard2          → 대시보드 변형 2
│   └── dashboard3          → 대시보드 변형 3
│
├── apps/                   → 앱 페이지들
│   ├── chat               → 채팅 시스템
│   ├── calendar           → 캘린더
│   ├── contacts           → 연락처
│   ├── market-research    → 시장조사 신청 ✅ 구현 완료
│   └── sampling           → 샘플링 신청 (예정)
│
├── forms/                 → 폼 페이지들
│   ├── form-wizard        → 다단계 폼
│   ├── form-layouts       → 폼 레이아웃
│   └── form-validation    → 폼 검증
│
└── theme-pages/           → 테마 페이지들
    ├── account-settings   → 계정 설정
    └── pricing           → 가격 페이지

# 👤 Profile Pages
/profile/setup              → 프로필 설정 ✅ 구현 완료

# 🔧 API Routes
/api/auth/*                → 인증 API
/api/market-research/*     → 시장조사 API ✅ 구현 완료
```

**Route Groups 특징:**
- `(DashboardLayout)` 그룹: 공통 레이아웃 적용
- 물리적 폴더 구조와 URL 분리
- 각 그룹별 독립적인 layout.tsx 적용

### 2.2 인증 분리
```typescript
// 고객 인증
/auth/customer/login    // 고객 로그인
/auth/customer/register // 고객 회원가입

// 직원 인증
/auth/staff/login       // 직원 로그인
/auth/staff/register    // 직원 가입 (승인 필요)
```

---

## 3. 고객 포털 설계 (26페이지)

### 3.1 페이지 구조
```
고객 포털 (https://duly.co.kr)
├── 📄 공개 페이지 (6)
│   ├── / (랜딩 페이지)
│   ├── /services (서비스 소개)
│   ├── /pricing (가격 정책)
│   ├── /about (회사 소개)
│   ├── /contact (문의하기)
│   └── /faq (자주 묻는 질문)
│
├── 🔐 인증 페이지 (4)
│   ├── /auth/customer/login
│   ├── /auth/customer/register
│   ├── /auth/customer/forgot-password
│   └── /auth/customer/reset-password
│
├── 📝 신청 페이지 (7)
│   ├── /apply (4개 서비스 카테고리 선택)
│   ├── /apply/import-agency (수입대행: 제품 조사, 샘플링, 대량 발주)
│   ├── /apply/inspection (검품/감사: 검품 3종)
│   ├── /apply/purchasing (구매대행: B2B/단일상품)
│   ├── /apply/shipping (배송대행: 묶음배송, 창고관리)
│   ├── /apply/success (신청 완료)
│   └── /apply/[reservationNumber] (신청 상세 + 실시간 채팅)
│
├── 👤 프로필 페이지 (4)
│   ├── /profile (프로필 메인)
│   ├── /profile/company (기업 정보)
│   ├── /profile/tax (세금계산서 정보)
│   └── /profile/addresses (배송지 관리)
│
├── 📊 대시보드 페이지 (3)
│   ├── /my (내 신청 현황)
│   ├── /my/applications (신청 목록)
│   └── /my/documents (문서함)
│
└── 💬 채팅/문서 페이지 (2)
    ├── /chat/[reservationNumber]
    └── /reports/[reservationNumber]
```

### 3.2 고객 메인 대시보드 UI
```
┌─────────────────────────────────────────────────┐
│ 🏠 두리무역 - 홍길동님 환영합니다               │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📊 신청 현황                                    │
│ ┌───────────┬───────────┬───────────┐          │
│ │ 진행중    │ 완료      │ 대기중    │          │
│ │    3건    │   12건    │    2건    │          │
│ └───────────┴───────────┴───────────┘          │
│                                                 │
│ 🚀 빠른 신청                                    │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │ 검품 │ │조사 │ │구매 │ │배송 │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                 │
│ 📋 최근 신청 내역                               │
│ ┌─────────────────────────────────────────┐    │
│ │ DL-20250126-123456 | 무선충전기 | 진행중 │    │
│ │ DL-20250125-123455 | 블루투스   | 완료   │    │
│ │ DL-20250124-123454 | 케이블     | 견적중 │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 3.3 상태 추적 UI (고객 핵심 요구사항)
```
┌─────────────────────────────────────────────────┐
│ 📍 DL-20250126-123456 진행 상황                │
├─────────────────────────────────────────────────┤
│                                                 │
│  신청 ──● 견적 ──● 결제 ──○ 진행 ──○ 완료      │
│       완료    완료    대기중                     │
│                                                 │
│ 📅 예상 일정                                    │
│ • 견적 확정: 2025-01-26 ✓                      │
│ • 결제 마감: 2025-01-27 (D-1)                  │
│ • 검품 시작: 2025-01-28                        │
│ • 완료 예정: 2025-01-30                        │
│                                                 │
│ 💬 실시간 알림                                  │
│ • 견적서가 도착했습니다 (2시간 전)             │
│ • 결제 마감일이 하루 남았습니다                │
│                                                 │
│ [채팅하기] [견적서 보기] [결제하기]             │
└─────────────────────────────────────────────────┘
```

### 3.4 서비스별 조회 페이지 (2025-08-03 추가)

#### 3.4.1 조회 페이지 구조
```
📊 주문 조회 (통일된 UI 패턴)
├── /dashboard/orders         → 시장조사 조회 (기준 표준)
├── /dashboard/sampling       → 샘플링 조회 ✅ 신규 추가
├── /dashboard/inspection     → 검품감사 조회 ✅ 신규 추가
└── /dashboard/bulk-orders    → 대량주문 조회 ✅ 신규 추가
```

#### 3.4.2 통일된 조회 UI 패턴
```
┌─────────────────────────────────────────────────┐
│ 📊 [서비스명] 목록                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📋 신청한 [서비스명] 현황을 확인하세요          │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 예약번호 │ 제품명 │ 수량 │ 상태 │ 신청일시 │ │
│ ├─────────────────────────────────────────────┤ │
│ │ DLSY-XXX │ 블루투스│ 1000 │진행중│ 08-03  │ │
│ │ DLSP-XXX │ 텀블러  │ 100  │완료  │ 08-02  │ │
│ │ IN-XXX   │ 케이블  │ 500  │대기  │ 08-01  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🎨 상태별 색상 코딩:                           │
│ • 신청접수: 파란색 • 진행중: 주황색             │
│ • 완료: 초록색 • 취소: 빨간색                  │
└─────────────────────────────────────────────────┘
```

#### 3.4.3 서비스별 특화 컬럼
| 서비스 | 특화 컬럼 | 상태 라벨 |
|--------|-----------|-----------|
| **시장조사** | 조사수량, 기본 상태 | 신청접수→진행중→조사완료→취소됨 |
| **샘플링** | 샘플수량, 배송방법 | 결제대기→결제완료→진행중→배송중→완료→취소 |
| **검품감사** | 서비스유형, 생산수량, 공장명 | 신청접수→견적완료→결제완료→진행중→검품완료→취소됨 |
| **대량주문** | 총주문수량, 배송방법, 시장조사연계 | 신청접수→견적완료→결제완료→생산중→배송중→완료→취소됨 |

#### 3.4.4 구현된 공통 기능
- ✅ 일관된 테이블 구조 (예약번호, 제품명, 수량, 상태, 신청일시, 상세보기)
- ✅ 표준화된 Chip 컴포넌트 상태 표시 (색상 코딩)
- ✅ 통일된 날짜 형식 (한국어 로케일: YYYY-MM-DD HH:MM)
- ✅ 호버 효과 및 클릭으로 상세보기 이동
- ✅ 빈 상태 메시지 표준화
- ✅ 로딩 및 에러 상태 처리
- ✅ 반응형 디자인 적용

---

## 4. 직원 포털 설계 (35페이지)

### 4.1 중국직원 포털 (15페이지)
```
중국직원 포털 (https://staff.duly.co.kr/zh)
├── 🏠 대시보드 (1)
│   └── /dashboard (작업 현황)
│
├── 📋 작업 관리 (6)
│   ├── /tasks (작업 목록)
│   ├── /tasks/pending (대기중)
│   ├── /tasks/in-progress (진행중)
│   ├── /tasks/urgent (긴급)
│   ├── /applications/[id] (신청 상세)
│   └── /applications/[id]/schedule (일정 관리)
│
├── 💬 채팅 관리 (3)
│   ├── /chats (채팅 목록)
│   ├── /chats/[reservationNumber]
│   └── /chats/guest-url (게스트 URL 생성)
│
├── 📄 보고서 (2)
│   ├── /reports/upload (보고서 업로드)
│   └── /reports/status (업로드 현황)
│
└── 📅 일정 (3)
    ├── /calendar (검품 일정)
    ├── /calendar/coordination (일정 조율)
    └── /profile (내 정보)
```

### 4.2 중국직원 작업 대시보드 UI
```
┌─────────────────────────────────────────────────┐
│ 🇨🇳 工作管理系统 - 王经理                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📊 今日任务                                     │
│ ┌───────────┬───────────┬───────────┐          │
│ │ 新任务    │ 进行中    │ 紧急      │          │
│ │    5个    │    8个    │    3个    │          │
│ └───────────┴───────────┴───────────┘          │
│                                                 │
│ 🔥 紧急处理                                     │
│ ┌─────────────────────────────────────────┐    │
│ │ ⚠️ DL-20250126-123456 | 明天开始检验    │    │
│ │ ⚠️ DL-20250125-123455 | 等待日程确认    │    │
│ │ ⚠️ DL-20250124-123454 | 报价单待发送    │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ 📋 任务列表 (按优先级)                          │
│ ┌─────────────────────────────────────────┐    │
│ │ 优先级 │ 预约号 │ 状态 │ 截止时间      │    │
│ ├─────────────────────────────────────────┤    │
│ │ 🔴 高  │ DL-123 │ 待确认 │ 今天 18:00  │    │
│ │ 🟡 中  │ DL-124 │ 进行中 │ 明天 12:00  │    │
│ │ 🟢 低  │ DL-125 │ 新任务 │ 后天 09:00  │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 4.3 한국팀 포털 (15페이지)
```
한국팀 포털 (https://staff.duly.co.kr/ko)
├── 📊 개요 (3)
│   ├── /dashboard (통합 대시보드)
│   ├── /analytics (실시간 통계)
│   └── /team-performance (팀 성과)
│
├── 📋 신청 관리 (4)
│   ├── /applications (전체 신청)
│   ├── /applications/assign (담당자 배정)
│   ├── /applications/[id] (상세 관리)
│   └── /applications/export (데이터 추출)
│
├── 📄 보고서 처리 (3)
│   ├── /reports/queue (번역 대기열)
│   ├── /reports/review (검토/승인)
│   └── /reports/history (처리 이력)
│
├── 🏢 CRM (3)
│   ├── /crm/companies (회사 관리)
│   ├── /crm/contacts (연락처)
│   └── /crm/opportunities (영업 기회)
│
└── 👥 팀 관리 (2)
    ├── /team/workload (업무 분배)
    └── /team/schedule (팀 일정)
```

### 4.4 관리자 포털 (15페이지)
```
관리자 포털 (https://admin.duly.co.kr)
├── 👥 사용자 관리 (4)
│   ├── /users (사용자 목록)
│   ├── /users/pending (승인 대기)
│   ├── /users/roles (역할 관리)
│   └── /users/activity (활동 로그)
│
├── ⚙️ 시스템 설정 (5)
│   ├── /settings (일반 설정)
│   ├── /settings/pricing (가격 관리)
│   ├── /settings/email (이메일 템플릿)
│   ├── /settings/business-hours (업무 시간)
│   └── /settings/holidays (휴일 관리)
│
├── 📊 모니터링 (4)
│   ├── /monitoring (시스템 상태)
│   ├── /monitoring/api (API 사용량)
│   ├── /monitoring/errors (오류 로그)
│   └── /monitoring/performance (성능 지표)
│
└── 🔍 감사 (2)
    ├── /audit/logs (감사 로그)
    └── /audit/reports (보고서)
```

---

## 5. 공통 컴포넌트

### 5.1 실제 Flexy 컴포넌트 구조 (2025-01-31 확인)
```
src/app/components/ ✅ 실제 구조
├── forms/                   # 📝 Formik + MUI 폼 컴포넌트
│   ├── theme-elements/      # 🎨 커스텀 MUI 컴포넌트 (12개)
│   │   ├── CustomTextField.tsx      ✅ 구현 완료
│   │   ├── CustomButton.tsx         ✅ 구현 완료
│   │   ├── CustomSelect.tsx         ✅ 구현 완료
│   │   ├── CustomCheckbox.tsx       ✅ 구현 완료
│   │   ├── CustomRadio.tsx          ✅ 구현 완료
│   │   ├── CustomSwitch.tsx         ✅ 구현 완료
│   │   ├── CustomFormLabel.tsx      ✅ 구현 완료
│   │   ├── CustomOutlinedInput.tsx  ✅ 구현 완료
│   │   ├── CustomOutlinedButton.tsx ✅ 구현 완료
│   │   ├── CustomDisabledButton.tsx ✅ 구현 완료
│   │   ├── CustomSocialButton.tsx   ✅ 구현 완료
│   │   ├── CustomSlider.tsx         ✅ 구현 완료
│   │   └── CustomRangeSlider.tsx    ✅ 구현 완료
│   │
│   ├── form-layouts/        # 📋 폼 레이아웃
│   ├── form-horizontal/     # ↔️ 수평 폼 레이아웃
│   ├── form-vertical/       # ↕️ 수직 폼 레이아웃
│   ├── form-wizard/         # 🪄 다단계 폼 (신청서용)
│   ├── form-validation/     # ✅ 폼 검증
│   └── form-tiptap/         # 📝 리치 텍스트 에디터
│
├── ui-components/           # 🧩 기본 UI 컴포넌트
│   ├── alert/              # 🚨 MUI Alert 래퍼
│   ├── badge/              # 🏷️ MUI Badge 래퍼
│   ├── cards/              # 🃏 MUI Card 래퍼
│   ├── modal/              # 🪟 MUI Dialog 래퍼
│   └── tables/             # 📊 MUI Table 래퍼
│
├── dashboard/              # 📊 대시보드 컴포넌트
│   ├── dashboard1/         # 📈 메인 대시보드
│   ├── dashboard2/         # 📉 대시보드 변형 2
│   └── shared/             # 🔗 공유 위젯
│
├── apps/                   # 📱 앱별 컴포넌트
│   ├── chat/               # 💬 채팅 관련
│   ├── calendar/           # 📅 캘린더 관련
│   └── contacts/           # 👥 연락처 관련
│
├── landingpage/            # 🏠 랜딩페이지 컴포넌트
├── frontend-pages/         # 🌐 마케팅 페이지 컴포넌트
├── widgets/                # 🔧 위젯 컴포넌트
├── tables/                 # 📋 테이블 컴포넌트
├── react-table/            # ⚛️ React Table 컴포넌트
├── muicharts/              # 📊 MUI Charts 컴포넌트
├── muitrees/               # 🌳 MUI Tree View 컴포넌트
├── pages/                  # 📄 페이지별 컴포넌트
├── container/              # 📦 컨테이너 컴포넌트
├── custom-scroll/          # 📜 커스텀 스크롤
└── shared/                 # 🔗 공통 유틸리티 컴포넌트
```

**주요 특징:**
- ✅ **12개 커스텀 MUI 컴포넌트** 완전 구현
- ✅ **Material UI v7 완전 호환**
- ✅ **TypeScript 완전 지원**
- ✅ **Emotion CSS-in-JS 사용**

### 5.2 두리무역 ERP Material UI 테마 시스템 (2025-01-31)

#### 5.2.1 핵심 테마 설정
```typescript
// src/theme/dulyTheme.ts - 두리무역 ERP 전용 테마
import { createTheme } from '@mui/material/styles';

const dulyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',       // 두리무역 메인 블랙
      light: '#333333',      // 라이트 블랙
      dark: '#000000',       // 다크 블랙
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#3B82F6',       // 브랜드 블루
      light: '#60A5FA',      // 라이트 블루
      dark: '#1D4ED8',       // 다크 블루
      contrastText: '#ffffff'
    },
    
    // 🎨 서비스별 전용 색상 (7개 서비스)
    success: {
      main: '#10B981',       // ✅ 수입대행 - 시장조사, 샘플링, 대량발주
      light: '#34D399',
      dark: '#059669'
    },
    info: {
      main: '#3B82F6',       // 🔍 검품감사 - 품질검품, 공장감사, 선적검품
      light: '#60A5FA',
      dark: '#1D4ED8'
    },
    warning: {
      main: '#F59E0B',       // ⚠️ 상태 표시 - 대기중, 검토중
      light: '#FBBF24',
      dark: '#D97706'
    },
    error: {
      main: '#EF4444',       // ❌ 오류, 취소, 거부
      light: '#F87171',
      dark: '#DC2626'
    },
    
    // 🏢 추가 서비스 색상
    purple: {
      main: '#8B5CF6',       // 💜 구매대행
      light: '#A78BFA',
      dark: '#7C3AED'
    },
    orange: {
      main: '#F97316',       // 🧡 배송대행
      light: '#FB923C',
      dark: '#EA580C'
    },
    
    // 🎯 상태별 색상
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  // 📝 한글 최적화 Typography
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    h1: { 
      fontWeight: 700, 
      fontSize: '2.125rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: { 
      fontWeight: 600, 
      fontSize: '1.875rem',
      lineHeight: 1.3,
      letterSpacing: '-0.005em'
    },
    h3: { 
      fontWeight: 600, 
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h4: { 
      fontWeight: 600, 
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    h5: { 
      fontWeight: 500, 
      fontSize: '1.125rem',
      lineHeight: 1.5
    },
    h6: { 
      fontWeight: 500, 
      fontSize: '1rem',
      lineHeight: 1.5
    },
    
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em'
    },
    
    button: {
      textTransform: 'none',  // 🚫 한글 대문자 변환 방지
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02857em'
    },
    
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em'
    }
  },
  
  // 🎨 컴포넌트별 커스터마이징
  components: {
    // 🔘 Button 스타일링
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        containedPrimary: {
          backgroundColor: '#000000',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }
      }
    },
    
    // 🃏 Card 스타일링
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.24)',
          border: '1px solid #E5E7EB'
        }
      }
    },
    
    // 📝 TextField 스타일링
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3B82F6'
            }
          }
        }
      }
    },
    
    // 🏷️ Chip 스타일링 (상태 표시용)
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem'
        },
        colorSuccess: {
          backgroundColor: '#DCFCE7',
          color: '#166534'
        },
        colorInfo: {
          backgroundColor: '#DBEAFE',
          color: '#1E40AF'
        },
        colorWarning: {
          backgroundColor: '#FEF3C7',
          color: '#92400E'
        },
        colorError: {
          backgroundColor: '#FEE2E2',
          color: '#991B1B'
        }
      }
    },
    
    // 📊 Paper 스타일링
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none'
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.24)'
        }
      }
    },
    
    // 🔘 IconButton 스타일링
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: '#F3F4F6'
          }
        }
      }
    }
  },
  
  // 📏 간격 및 브레이크포인트
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  }
});

export default dulyTheme;
```

---

## 6. 상태 관리

### 6.1 전역 상태 (Context API)
```typescript
// GlobalContext
interface GlobalState {
  user: User | null
  userProfile: UserProfile | null
  language: 'ko' | 'zh'
  theme: 'light' | 'dark'
}

// ApplicationContext  
interface ApplicationState {
  applications: Application[]
  currentApplication: Application | null
  filters: ApplicationFilters
}
```

### 6.2 서버 상태 (React Query)
```typescript
// 신청 목록 조회
const useApplications = () => {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => fetchApplications(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 실시간 상태 업데이트
const useApplicationStatus = (reservationNumber: string) => {
  return useSubscription({
    channelName: `application:${reservationNumber}`,
    event: 'status_changed',
    onMessage: (payload) => {
      queryClient.invalidateQueries(['application', reservationNumber])
    }
  })
}
```

### 6.3 실시간 상태 (Supabase Realtime)
```typescript
// 채팅 실시간 구독
const useChatSubscription = (reservationNumber: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${reservationNumber}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `reservation_number=eq.${reservationNumber}`
      }, handleNewMessage)
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [reservationNumber])
}
```

---

## 7. 백엔드 연동

### 7.1 API 클라이언트 구조
```typescript
// API 계층 구조
src/lib/api/
├── client.ts          # API 클라이언트 설정
├── auth/             # 인증 관련
│   ├── customer.ts
│   └── staff.ts
├── applications/     # 신청 관리
│   ├── create.ts
│   ├── update.ts
│   └── status.ts
├── chat/            # 채팅
│   ├── messages.ts
│   └── realtime.ts
└── reports/         # 보고서
    ├── upload.ts
    └── translate.ts
```

### 7.2 데이터 페칭 패턴
```typescript
// 서버 컴포넌트 (SSR)
async function ApplicationPage({ params }: Props) {
  const supabase = createServerClient()
  const { data: application } = await supabase
    .from('inspection_applications')
    .select('*')
    .eq('reservation_number', params.reservationNumber)
    .single()
    
  return <ApplicationDetail application={application} />
}

// 클라이언트 컴포넌트 (CSR)
function ApplicationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications
  })
  
  if (isLoading) return <Skeleton />
  return <ApplicationTable data={data} />
}
```

### 7.3 파일 업로드 처리
```typescript
const uploadFile = async (file: File) => {
  // 1. 압축 (이미지/동영상)
  const compressed = await compressFile(file)
  
  // 2. Supabase Storage 업로드
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${userId}/${Date.now()}_${file.name}`, compressed)
    
  // 3. DB 레코드 생성
  await supabase.from('uploaded_files').insert({
    file_path: data.path,
    file_size: compressed.size,
    mime_type: file.type
  })
}
```

---

## 8. 성능 최적화

### 8.1 코드 스플리팅
```typescript
// 동적 임포트
const ApplicationForm = dynamic(
  () => import('@/components/features/application/ApplicationForm'),
  { 
    loading: () => <FormSkeleton />,
    ssr: false 
  }
)

// 라우트 기반 스플리팅
const routes = [
  {
    path: '/apply',
    component: lazy(() => import('@/pages/Apply'))
  }
]
```

### 8.2 이미지 최적화
```typescript
// Next.js Image 컴포넌트
<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL={product.blurHash}
  loading="lazy"
/>
```

### 8.3 캐싱 전략
```typescript
// React Query 캐싱
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5분
      cacheTime: 10 * 60 * 1000,     // 10분
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
})

// 정적 데이터 캐싱
export const revalidate = 3600 // 1시간
```

### 8.4 번들 최적화
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@supabase/supabase-js', 'react-icons']
  },
  images: {
    formats: ['image/avif', 'image/webp']
  }
}
```

---

## 📊 페이지별 성능 목표

| 페이지 유형 | FCP | LCP | TTI | CLS |
|------------|-----|-----|-----|-----|
| 랜딩 페이지 | <1.0s | <2.0s | <3.0s | <0.1 |
| 대시보드 | <1.5s | <2.5s | <3.5s | <0.1 |
| 신청 폼 | <1.2s | <2.2s | <3.2s | <0.05 |
| 채팅 | <0.8s | <1.8s | <2.5s | <0.05 |

---

## 🔄 개발 워크플로우

### Phase 1: 기초 구축 (Week 1-2)
- [ ] 프로젝트 초기 설정
- [ ] 디자인 시스템 구축
- [ ] 공통 컴포넌트 개발
- [ ] 레이아웃 구조 설정

### Phase 2: 고객 포털 (Week 3-5)
- [ ] 공개 페이지 개발
- [ ] 인증 시스템 구현
- [ ] 신청 프로세스 구현
- [ ] 프로필 관리 구현

### Phase 3: 직원 포털 (Week 6-8)
- [ ] 중국직원 대시보드
- [ ] 작업 관리 시스템
- [ ] 한국팀 관리 도구
- [ ] 보고서 처리 시스템

### Phase 4: 통합 및 최적화 (Week 9-10)
- [ ] 실시간 기능 통합
- [ ] 성능 최적화
- [ ] 테스트 및 디버깅
- [ ] 배포 준비

---

## 9. Material UI 컴포넌트 실전 사용 가이드 (2025-01-31)

### 9.1 두리무역 ERP → Material UI 컴포넌트 매핑

#### 9.1.1 신청 폼 시스템
```typescript
// ✅ 시장조사 신청 폼 예시 (실제 구현 완료)
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';

// ERP 신청 폼 패턴
const MarketResearchForm = () => {
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          🔍 시장조사 신청
        </Typography>
        
        {/* 제품 정보 */}
        <TextField
          fullWidth
          label="제품명"
          variant="outlined"
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="조사 수량"
          type="number"
          variant="outlined"
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="요청사항"
          multiline
          rows={4}
          variant="outlined"
          margin="normal"
          required
          placeholder="제품의 최소 주문 수량, 단가, 배송 기간, 인증서 유무 등"
          sx={{ mb: 2 }}
        />
        
        {/* 추가 옵션 */}
        <FormControlLabel
          control={<Checkbox />}
          label="로고 인쇄 필요"
          sx={{ mb: 1 }}
        />
        
        <FormControlLabel
          control={<Checkbox />}
          label="맞춤 박스 제작 필요"
          sx={{ mb: 2 }}
        />
        
        {/* 제출 버튼 */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 2, py: 1.5 }}
        >
          신청서 제출하기
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### 9.1.2 상태 표시 시스템
```typescript
// ✅ 주문 상태 표시 컴포넌트
import { Chip, Stepper, Step, StepLabel } from '@mui/material';

// 상태별 색상 매핑
const getStatusColor = (status: string) => {
  const statusColors = {
    'submitted': 'info',      // 📋 신청완료 - 파랑
    'quoted': 'warning',      // 💰 견적완료 - 노랑  
    'paid': 'success',        // 💳 결제완료 - 초록
    'in_progress': 'primary', // 🔄 진행중 - 검정
    'completed': 'success',   // ✅ 완료 - 초록
    'cancelled': 'error'      // ❌ 취소 - 빨강
  } as const;
  
  return statusColors[status] || 'default';
};

// 상태 Chip 컴포넌트
const StatusChip = ({ status }: { status: string }) => (
  <Chip 
    label={status}
    color={getStatusColor(status)}
    size="small"
    sx={{ fontWeight: 500 }}
  />
);

// 진행 단계 표시
const OrderProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = ['신청', '견적', '결제', '진행', '완료'];
  
  return (
    <Stepper activeStep={currentStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
```

#### 9.1.3 데이터 테이블 시스템  
```typescript
// ✅ 주문 목록 테이블
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Edit, Visibility, Chat } from '@mui/icons-material';

const OrdersTable = ({ orders }: { orders: Order[] }) => (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>예약번호</TableCell>
          <TableCell>서비스</TableCell>
          <TableCell>제품명</TableCell>
          <TableCell>상태</TableCell>
          <TableCell>신청일</TableCell>
          <TableCell>작업</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Typography variant="body2" fontWeight="bold">
                {order.reservationNumber}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={order.serviceType} 
                size="small"
                color="primary"
              />
            </TableCell>
            <TableCell>{order.productName}</TableCell>
            <TableCell>
              <StatusChip status={order.status} />
            </TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString('ko-KR')}
            </TableCell>
            <TableCell>
              <IconButton size="small" color="primary">
                <Visibility />
              </IconButton>
              <IconButton size="small" color="secondary">
                <Chat />
              </IconButton>
              <IconButton size="small">
                <Edit />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
```

### 9.2 대시보드 컴포넌트 패턴

#### 9.2.1 통계 카드
```typescript
// ✅ 대시보드 통계 카드
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  color = 'primary' 
}: StatsCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" fontWeight="bold">
            {value}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            {trend === 'up' ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography 
              variant="body2" 
              color={trend === 'up' ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {change}
            </Typography>
          </Box>
        </Box>
        <Chip label="이번 달" size="small" color={color} />
      </Box>
    </CardContent>
  </Card>
);

// 사용 예시
const Dashboard = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <StatsCard 
        title="총 신청 건수"
        value="156"
        change="+12%"
        trend="up"
        color="primary"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatsCard 
        title="진행 중"
        value="23" 
        change="+5%"
        trend="up"
        color="info"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatsCard 
        title="완료"
        value="98"
        change="+18%"
        trend="up" 
        color="success"
      />
    </Grid>
    <Grid item xs={12} sm{6} md={3}>
      <StatsCard 
        title="취소/보류"
        value="12"
        change="-3%"
        trend="down"
        color="warning"
      />
    </Grid>
  </Grid>
);
```

### 9.3 채팅 시스템 컴포넌트

#### 9.3.1 실시간 채팅 UI
```typescript
// ✅ 실시간 채팅 컴포넌트
import { 
  Paper, 
  TextField, 
  IconButton, 
  List, 
  ListItem,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';

const ChatMessage = ({ message, isOwn }: { message: Message, isOwn: boolean }) => (
  <ListItem sx={{ 
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    px: 1 
  }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      maxWidth: '70%'
    }}>
      <Avatar 
        sx={{ 
          width: 32, 
          height: 32,
          mx: 1,
          bgcolor: isOwn ? 'primary.main' : 'grey.400' 
        }}
      >
        {message.senderName[0]}
      </Avatar>
      <Box>
        <Paper sx={{ 
          p: 1.5,
          bgcolor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'white' : 'text.primary',
          borderRadius: 2
        }}>
          <Typography variant="body2">
            {message.content}
          </Typography>
        </Paper>
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
          {new Date(message.createdAt).toLocaleTimeString('ko-KR')}
        </Typography>
      </Box>
    </Box>
  </ListItem>
);

const ChatRoom = ({ reservationNumber }: { reservationNumber: string }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  return (
    <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      {/* 채팅 헤더 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          📞 {reservationNumber} 상담
        </Typography>
      </Box>
      
      {/* 메시지 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOwn={msg.senderId === currentUserId}
            />
          ))}
        </List>
      </Box>
      
      {/* 메시지 입력 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            size="small"
          />
          <IconButton color="primary">
            <AttachFile />
          </IconButton>
          <IconButton color="primary" onClick={handleSend}>
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
```

### 9.4 커스텀 MUI 컴포넌트 사용법

#### 9.4.1 Flexy 커스텀 컴포넌트 활용
```typescript
// ✅ 실제 구현된 12개 커스텀 컴포넌트 사용
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomButton from '@/app/components/forms/theme-elements/CustomButton';  
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';

// 사용 예시
const CustomForm = () => (
  <Box>
    <CustomTextField 
      label="회사명"
      fullWidth
      margin="normal"
    />
    
    <CustomSelect
      label="서비스 유형"
      options={serviceOptions}
      fullWidth
      margin="normal"
    />
    
    <CustomCheckbox
      label="이용약관 동의"
      required
    />
    
    <CustomButton
      variant="contained"
      color="primary"
      fullWidth
      size="large"
    >
      제출하기
    </CustomButton>
  </Box>
);
```

### 9.5 반응형 레이아웃 패턴

#### 9.5.1 Grid 시스템 활용
```typescript
// ✅ 반응형 대시보드 레이아웃
import { Grid, Container } from '@mui/material';

const ResponsiveDashboard = () => (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    <Grid container spacing={3}>
      {/* 헤더 영역 */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          📊 두리무역 ERP 대시보드
        </Typography>
      </Grid>
      
      {/* 통계 카드들 */}
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="전체 신청" value="156" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="진행중" value="23" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="완료" value="98" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="취소" value="12" />
      </Grid>
      
      {/* 메인 콘텐츠 */}
      <Grid item xs={12} md={8}>
        <OrdersTable orders={orders} />
      </Grid>
      
      {/* 사이드바 */}
      <Grid item xs={12} md={4}>
        <RecentActivity />
        <QuickActions />
      </Grid>
    </Grid>
  </Container>
);
```

### 9.6 Material UI vs 기존 라이브러리 매핑표

| 기능 | 기존 (Tailwind/shadcn) | Material UI | Flexy 커스텀 |
|------|----------------------|-------------|--------------|
| **텍스트 입력** | `<input>` + Tailwind | `TextField` | `CustomTextField` ✅ |
| **버튼** | `<button>` + Tailwind | `Button` | `CustomButton` ✅ |
| **선택상자** | `<select>` + Tailwind | `Select` | `CustomSelect` ✅ |
| **체크박스** | `<input type="checkbox">` | `Checkbox` | `CustomCheckbox` ✅ |
| **라디오** | `<input type="radio">` | `Radio` | `CustomRadio` ✅ |
| **스위치** | 커스텀 구현 | `Switch` | `CustomSwitch` ✅ |
| **카드** | `<div>` + Tailwind | `Card` | MUI Card 직접 사용 |
| **테이블** | `<table>` + Tailwind | `Table` or `DataGrid` | MUI 직접 사용 |
| **모달** | Headless UI | `Dialog` | MUI Dialog 직접 사용 |
| **알림** | react-hot-toast | `Snackbar` | MUI Snackbar 직접 사용 |
| **뱃지** | `<span>` + Tailwind | `Chip` | MUI Chip 직접 사용 |

**✅ 사용 권장사항:**
- **폼 컴포넌트**: Flexy 커스텀 컴포넌트 우선 사용
- **레이아웃 컴포넌트**: MUI 컴포넌트 직접 사용
- **복잡한 컴포넌트**: MUI 직접 사용 + 필요시 커스터마이징

---

## 📌 추후 작업 사항

### 서비스 소개 페이지 디자인 개선 (2025-01-31 추가)
- **페이지**: `/application/import-agency`
- **현재 상태**: 기본 서비스 소개 페이지로 구현됨
- **작업 내용**: 프론트엔드 디자이너와 협업하여 디자인 개선 필요
- **우선순위**: 낮음 (기능 구현 후 진행)

---

*본 문서는 두리무역 디지털 전환 프로젝트의 프론트엔드 설계를 담은 공식 문서입니다.*