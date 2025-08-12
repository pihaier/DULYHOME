# 🚀 Flexy NextJS 마이그레이션 계획 (수정본)
**두리무역 ERP - UI 전면 교체 프로젝트**

문서 버전: v2.0  
작성일: 2025-01-30  
작성자: 시스템 아키텍트

---

## 📑 목차
1. [현황 분석](#1-현황-분석)
2. [실제 구현된 페이지와 필드](#2-실제-구현된-페이지와-필드)
3. [페이지별 Flexy 매핑](#3-페이지별-flexy-매핑)
4. [마이그레이션 전략](#4-마이그레이션-전략)
5. [실행 계획](#5-실행-계획)
6. [체크리스트](#6-체크리스트)

---

## 1. 현황 분석

### 1.1 현재 상태
- **백엔드**: ✅ Supabase 스키마 완성
- **프론트엔드**: ⚠️ Tailwind + Catalyst/Studio 혼용 (호환성 문제)
- **완성된 페이지**: 
  - ✅ 메인 페이지 (Studio 템플릿)
  - ✅ 로그인/회원가입 (Catalyst)
  - ✅ 대시보드 (Catalyst)
  - ✅ 프로필 (Catalyst)
  - ✅ 시장조사 신청 (Catalyst)
  - ✅ 샘플링 신청 (Catalyst)
  - ✅ 채팅 (미구현)

### 1.2 결정 사항
- **전략**: Flexy NextJS로 프론트엔드 전면 교체
- **이유**: 호환성 문제 해결, 개발 속도 향상, 완성된 UI 활용

---

## 2. 실제 구현된 페이지와 필드

### 2.1 로그인 페이지 (/auth/customer/login)
```typescript
// 필드
- email: string
- password: string
- rememberMe: boolean
- termsAccepted: boolean (OAuth용)
- privacyAccepted: boolean (OAuth용)

// 주요 로직
- returnUrl 처리 (localStorage 저장)
- OAuth 로그인 (Google, Kakao)
- 역할 확인 (customer만 허용)
- 프로필 체크 후 리다이렉트
```

### 2.2 시장조사 신청 (/application/import-agency/market-research)
```typescript
// 필드 (실제 구현)
- productName: string (필수)
- researchQuantity: number (필수, 기본값: 1000)
- requirements: string (필수, 10-1000자)
- photos: File[] (필수, 1-5개, 이미지만)
- detailPage?: string (선택, URL)
- logoRequired: boolean
- logoFile?: File[] (조건부, 최대 5개)
- logoPrintDetails?: string (조건부)
- customBoxRequired: boolean
- boxDesignFile?: File[] (조건부, 최대 5개)

// 주요 로직
- 프로필 체크 (없으면 프로필 설정으로 리다이렉트)
- 파일 업로드 (이미지 압축)
- 예약번호 생성: DLSY-YYYYMMDD-XXXXXX
- 성공 시 상세 페이지로 이동
```

### 2.3 샘플링 신청 (/application/.../[reservationNumber]/sampling)
```typescript
// 필드
- sample_quantity: number (필수)
- requirements: string (필수)
- request_files: File[]
- shipping_method: '협력업체' | '직접배송'

// 협력업체 배송 시
- customs_type?: '개인통관' | '사업자통관'
- personal_name?: string
- personal_customs_code?: string
- business_name?: string
- business_number?: string
- korea_shipping_address?: string
- korea_receiver_name?: string
- korea_receiver_phone?: string

// 직접배송 시
- china_address?: string
- china_receiver_name?: string
- china_receiver_phone?: string

// 주요 로직
- 시장조사 완료 상태 확인 (research_completed)
- 샘플 가격 정보 표시
- 배송지 주소 관리 (ShippingAddressModal)
- 기본 배송지 자동 입력
```

### 2.4 대시보드 (/dashboard)
```typescript
// 표시 데이터
- 진행 중인 주문 수
- 완료된 주문 수
- 대기 중인 주문 수
- 이번 달 매출

// 빠른 메뉴
- 시장조사 신청
- 샘플링 신청
- 주문 관리
- 프로필 설정

// 주요 기능
- 통계 카드
- 최근 활동 (현재 비어있음)
```

### 2.5 프로필 (/profile)
```typescript
// 표시 정보
- 이름 (contact_person)
- 이메일
- 회사명 (company_name, company_name_chinese)
- 전화번호
- 승인 상태
- 역할
- 가입일
- 언어 설정

// 주요 기능
- 프로필 수정 링크
- 로그아웃
- 대시보드 이동
```

---

## 3. 페이지별 Flexy 매핑

### 3.1 인증 관련
| 현재 페이지 | Flexy 컴포넌트 | Flexy 데모 URL |
|------------|---------------|----------------|
| `/auth/customer/login` | `/auth/auth1/login` | [로그인](https://flexy-next-js-dashboard.vercel.app/auth/auth1/login) |
| `/auth/customer/register` | `/auth/auth1/register` | [회원가입](https://flexy-next-js-dashboard.vercel.app/auth/auth1/register) |

### 3.2 메인 & 대시보드
| 현재 페이지 | Flexy 컴포넌트 | Flexy 데모 URL |
|------------|---------------|----------------|
| `/` (메인) | `/landingpage` | [랜딩페이지](https://flexy-next-js-dashboard.vercel.app/landingpage) |
| `/dashboard` | `/dashboards/modern` | [모던 대시보드](https://flexy-next-js-dashboard.vercel.app/dashboards/modern) |

### 3.3 신청서 폼
| 현재 페이지 | Flexy 컴포넌트 | Flexy 데모 URL |
|------------|---------------|----------------|
| 시장조사 신청 | `/forms/form-wizard` | [폼 위저드](https://flexy-next-js-dashboard.vercel.app/forms/form-wizard) |
| 샘플링 신청 | `/forms/form-wizard` | [폼 위저드](https://flexy-next-js-dashboard.vercel.app/forms/form-wizard) |
| 파일 업로드 | `/forms/form-elements` | [폼 요소](https://flexy-next-js-dashboard.vercel.app/forms/form-elements) |

### 3.4 프로필 & 설정
| 현재 페이지 | Flexy 컴포넌트 | Flexy 데모 URL |
|------------|---------------|----------------|
| `/profile` | `/theme-pages/account-settings` | [계정 설정](https://flexy-next-js-dashboard.vercel.app/theme-pages/account-settings) |
| 배송지 관리 | `/apps/contacts` | [연락처](https://flexy-next-js-dashboard.vercel.app/apps/contacts) |

### 3.5 채팅 & 상세
| 현재 페이지 | Flexy 컴포넌트 | Flexy 데모 URL |
|------------|---------------|----------------|
| 채팅 (미구현) | `/apps/chats` | [채팅](https://flexy-next-js-dashboard.vercel.app/apps/chats) |
| 신청 상세 | 커스텀 필요 | - |
| 신청 목록 | `/react-tables/dense` | [테이블](https://flexy-next-js-dashboard.vercel.app/react-tables/dense) |

---

## 4. 마이그레이션 전략

### 4.1 보존할 핵심 로직
```typescript
// 1. 인증 로직
- returnUrl 처리 (localStorage)
- OAuth 콜백 처리
- 역할 기반 라우팅

// 2. 프로필 체크
checkUserProfile() {
  - 로그인 확인
  - 프로필 완성도 검증
  - 미완성시 /profile/setup 리다이렉트
}

// 3. 예약번호 생성
- DLSY-YYYYMMDD-XXXXXX (시장조사)
- DLKP-YYYYMMDD-XXXXXX (검품)

// 4. 파일 업로드
- 이미지 압축
- Supabase Storage 업로드
- 진행률 표시

// 5. 배송지 관리
- ShippingAddressModal
- 기본 배송지 설정
- 개인/사업자 통관 분기
```

### 4.2 컴포넌트 매핑
| Catalyst 컴포넌트 | Material UI 컴포넌트 |
|------------------|-------------------|
| Button | Button |
| Input | TextField |
| Textarea | TextField (multiline) |
| Select | Select |
| Checkbox | Checkbox |
| Modal (Dialog) | Dialog |
| Table | DataGrid |
| Badge | Chip |
| Alert | Alert |

---

## 5. 실행 계획

### Phase 1: 환경 설정 (Day 1)
- [ ] Flexy main 버전을 새 폴더에 설치
- [ ] 환경 변수 복사 (.env.local)
- [ ] 불필요한 데모 페이지 제거
- [ ] 프로젝트 구조 정리

### Phase 2: 핵심 설정 (Day 2-3)
- [ ] Supabase 클라이언트 설정 복사
  - `/lib/supabase/client.ts`
  - `/lib/supabase/server.ts`
  - `/lib/supabase/service.ts`
- [ ] GlobalContext 이식
- [ ] 미들웨어 설정
- [ ] 타입 정의 복사

### Phase 3: 인증 시스템 (Day 4-5)
- [ ] 로그인 페이지 구현
  - returnUrl 로직 유지
  - OAuth 통합 (Google, Kakao)
  - 약관 동의 체크박스
- [ ] 회원가입 페이지
- [ ] 프로필 설정 페이지

### Phase 4: 대시보드 (Day 6-7)
- [ ] 통계 카드 구현
- [ ] 빠른 메뉴 버튼
- [ ] 최근 활동 섹션
- [ ] 반응형 레이아웃

### Phase 5: 신청서 폼 (Day 8-10)
- [ ] 시장조사 신청 (Form Wizard)
  - Step 1: 제품 정보
  - Step 2: 파일 업로드
  - Step 3: 추가 옵션
- [ ] 샘플링 신청
  - 배송 방법 선택
  - 주소 입력/선택
- [ ] FileUploadCarousel 컴포넌트 재구현

### Phase 6: 프로필 & 설정 (Day 11-12)
- [ ] 프로필 페이지
- [ ] 배송지 관리 모달
- [ ] 회사 정보 수정

### Phase 7: 채팅 & 상세 (Day 13-14)
- [ ] 채팅 UI 구현
- [ ] 실시간 메시지
- [ ] 파일 공유
- [ ] 신청 상세 페이지

### Phase 8: 마무리 (Day 15)
- [ ] 한글화
- [ ] 테마 커스터마이징
- [ ] 전체 테스트
- [ ] 배포 준비

---

## 6. 체크리스트

### 6.1 제거할 패키지
```json
// package.json에서 제거
- "@tailwindcss/*"
- "tailwind-merge"
- "@headlessui/react"
- "clsx" (MUI sx로 대체)
```

### 6.2 필수 이식 파일
```
/lib/
  /supabase/         # 전체 복사
  /context/          # GlobalContext.tsx
  /types/            # 전체 복사
  /schemas/          # 폼 스키마들

/app/api/           # 전체 API 라우트
/middleware.ts      # 인증 미들웨어

/components/
  - FileUploadCarousel (재구현 필요)
  - ShippingAddressModal (재구현 필요)
  - Toast (MUI Snackbar로 대체)
```

### 6.3 Material UI 테마 설정
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',     // 두리무역 블랙
      contrastText: '#fff'
    },
    secondary: {
      main: '#3B82F6',     // 블루
    }
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 한글은 대문자 변환 제거
        }
      }
    }
  }
});
```

### 6.4 주의사항
- **파일 업로드**: MUI는 파일 업로드 컴포넌트가 없음 → react-dropzone 사용
- **데이터 테이블**: MUI DataGrid는 유료 → 무료 버전 제한 확인
- **아이콘**: Heroicons → Material Icons 변경
- **애니메이션**: Framer Motion은 그대로 사용 가능

---

*본 문서는 실제 구현을 기반으로 작성된 정확한 마이그레이션 계획서입니다.*
---

## 7. 프로젝트 문서 수정 계획

### 7.1 수정해야 할 문서 목록

#### 🔴 **즉시 수정 필요 (Day 1-2)**
1. **00_INDEX.md** - Flexy 마이그레이션 진행 상황 업데이트
   - [ ] Phase 체크리스트 추가
   - [ ] 마이그레이션 진행률 표시
   - [ ] 주요 변경사항 기록

2. **09_FRONTEND_DESIGN.md** - 프론트엔드 설계 전면 수정
   - [ ] 기술 스택: Tailwind CSS → Material UI
   - [ ] UI Reference: Catalyst/Studio → Flexy
   - [ ] 컴포넌트 구조 변경
   - [ ] 디자인 시스템 업데이트

3. **08_TECH_ARCHITECTURE.md** - 기술 아키텍처 업데이트
   - [ ] Styling: Tailwind → Material UI + Emotion
   - [ ] UI Library: shadcn/ui → MUI Components
   - [ ] 파일 구조 변경사항 반영

#### 🟡 **개발 중 수정 (Day 3-10)**
4. **14_CODE_STANDARDS.md** - 코딩 표준 업데이트
   - [ ] Material UI 코딩 가이드라인 추가
   - [ ] sx prop 사용법
   - [ ] 테마 커스터마이징 방법
   - [ ] 아이콘 사용 (Material Icons)

5. **12_API_DOCUMENTATION.md** - API 문서 (변경 없음)
   - ✅ 백엔드는 그대로 유지

6. **11_DATABASE_DESIGN.md** - DB 설계 (변경 없음)
   - ✅ Supabase 스키마 그대로 유지

#### 🟢 **완료 후 수정 (Day 11-15)**
7. **16_DEPLOYMENT.md** - 배포 문서 업데이트
   - [ ] 빌드 설정 변경사항
   - [ ] 환경 변수 (변경 없음)
   - [ ] Vercel 배포 설정

8. **17_OPERATIONS_MANUAL.md** - 운영 매뉴얼
   - [ ] 새로운 폴더 구조 설명
   - [ ] Material UI 관련 트러블슈팅

9. **18_USER_MANUAL.md** - 사용자 가이드
   - [ ] UI 스크린샷 교체
   - [ ] 네비게이션 가이드 업데이트

10. **19_CHANGELOG.md** - 변경 로그
    - [ ] v3.0.0 - Flexy 마이그레이션 기록
    - [ ] Breaking Changes 명시
    - [ ] 마이그레이션 가이드 링크

### 7.2 문서별 주요 변경사항

#### **09_FRONTEND_DESIGN.md 주요 변경**
```markdown
### 1.2 기술 스택 (변경 전 → 변경 후)
- Framework: Next.js 15 (유지)
- Language: TypeScript 5.x (유지)
- Styling: ~~Tailwind CSS~~ → **Material UI + Emotion**
- State: React Context + React Query (유지)
- Real-time: Supabase Realtime (유지)
- UI Template: ~~Catalyst/Studio~~ → **Flexy NextJS**

### 5.2 디자인 시스템 (변경)
// Material UI 테마로 교체
const theme = createTheme({
  palette: {
    primary: { main: '#000000' },
    secondary: { main: '#3B82F6' }
  }
});
```

#### **14_CODE_STANDARDS.md 추가 내용**
```markdown
### 10. Material UI 코딩 가이드

#### 10.1 스타일링
- sx prop 사용 (인라인 스타일)
- styled() 함수 (재사용 컴포넌트)
- 테마 활용 필수

#### 10.2 컴포넌트 import
import { Button, TextField } from '@mui/material';

#### 10.3 아이콘
import { Home, Dashboard } from '@mui/icons-material';
```

### 7.3 현재 프론트엔드 제거 계획

#### **제거할 디렉토리**
```bash
# nextjs 폴더 내 프론트엔드 전체 제거
rm -rf nextjs/src/app/*
rm -rf nextjs/src/components/*
rm -rf nextjs/src/styles/*
rm -rf nextjs/tailwind.config.js
rm -rf nextjs/postcss.config.js

# 보존할 것들
# nextjs/src/lib/supabase/*
# nextjs/src/lib/context/*
# nextjs/src/lib/types/*
# nextjs/src/lib/schemas/*
# nextjs/.env.local
```

#### **Flexy 설치 위치**
```bash
# 현재 nextjs 폴더에 직접 설치
cd nextjs
cp -r ../flexy-nextjs-admin-v7-1/package/main/* .

# 불필요한 데모 제거
rm -rf src/app/dashboards/dashboard3
rm -rf src/app/dashboards/dashboard4
# ... 기타 불필요한 데모 페이지
```

### 7.4 실행 일정

| 일차 | 작업 내용 | 수정 문서 |
|-----|----------|----------|
| Day 1 | 프론트엔드 제거, Flexy 설치 | 00_INDEX.md |
| Day 2 | 환경 설정, 문서 업데이트 | 09_FRONTEND_DESIGN.md, 08_TECH_ARCHITECTURE.md |
| Day 3-4 | 인증 시스템 구현 | 14_CODE_STANDARDS.md |
| Day 5-7 | 대시보드, 신청서 | - |
| Day 8-10 | 채팅, 프로필 | - |
| Day 11-12 | 테스트, 한글화 | 16_DEPLOYMENT.md |
| Day 13-14 | 문서 정리 | 17_OPERATIONS_MANUAL.md, 18_USER_MANUAL.md |
| Day 15 | 최종 점검, 배포 | 19_CHANGELOG.md |

---

## 8. 즉시 실행 명령어

```bash
# 1. 백업 (중요!)
cp -r nextjs nextjs_backup_20250130

# 2. 프론트엔드 제거
cd nextjs
rm -rf src/app/* src/components/* tailwind.config.js postcss.config.js

# 3. 필수 파일 임시 보관
mkdir ../temp_preserve
cp -r src/lib ../temp_preserve/
cp .env.local ../temp_preserve/
cp -r public ../temp_preserve/

# 4. Flexy 복사
cp -r ../flexy-nextjs-admin-v7-1/package/main/* .

# 5. 보존 파일 복원
cp -r ../temp_preserve/lib/* src/lib/
cp ../temp_preserve/.env.local .
cp -r ../temp_preserve/public/* public/

# 6. 의존성 설치
npm install

# 7. 개발 서버 시작
npm run dev
```

---

*마이그레이션 계획 v2.0 - 2025-01-30 업데이트 완료*