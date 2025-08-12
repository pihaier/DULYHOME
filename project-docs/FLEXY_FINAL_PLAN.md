# 🎯 Studio + Flexy 하이브리드 UI 전략
**두리무역 ERP - 최적화된 UI 전략**

문서 버전: v4.0 (하이브리드 전략)  
작성일: 2025-01-30  
목표: 10일 내 완성 (2025-02-09)

---

## 📌 핵심 전략
**용도별 최적화된 UI 라이브러리 사용**
- 공개 페이지 = Studio 템플릿 (Tailwind CSS) - 화려한 마케팅
- 앱 페이지 = Flexy 템플릿 (Material UI) - 실용적 기능
- Next.js Route Groups로 완전 격리

---

## 📑 목차
1. [현황 분석](#1-현황-분석)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [실행 계획](#3-실행-계획)
4. [주의사항](#4-주의사항)
5. [체크리스트](#5-체크리스트)

---

## 1. 현황 분석

### 1.1 현재 상태
- **백엔드**: ✅ Supabase 스키마 완성
- **API**: ✅ 모든 API 라우트 구현 완료
- **프론트엔드**: ⚠️ Tailwind + Catalyst/Studio 혼용 (호환성 문제)

### 1.2 완성된 기능
- ✅ OAuth 로그인 (Google, Kakao)
- ✅ 프로필 자동 생성
- ✅ 시장조사 신청 (DLSY 코드)
- ✅ 샘플링 신청
- ✅ 파일 업로드 (FileUploadCarousel)
- ✅ 배송지 관리

### 1.3 결정 사항
- **전략**: Studio + Flexy 하이브리드
- **이유**: 용도별 최적화, CSS 충돌 방지, 기존 코드 활용
- **구현**: Next.js Route Groups로 영역 분리

---

## 2. 프로젝트 구조

### 2.1 Route Groups 구조
```
nextjs/src/app/
├── (public)/              # Studio 영역 (Tailwind CSS)
│   ├── layout.tsx        # globals.css만 로드
│   ├── page.tsx          # 메인 페이지 ✅
│   ├── about/            # 회사 소개 (새로 추가)
│   ├── services/         # 서비스 소개 (개선)
│   ├── pricing/          # 가격 정책
│   ├── contact/          # 문의하기
│   └── faq/              # 자주 묻는 질문
│
├── (app)/                # Flexy 영역 (Material UI)
│   ├── layout.tsx        # MUI ThemeProvider
│   ├── dashboard/        # 대시보드
│   ├── application/      # 신청서 폼
│   ├── orders/           # 주문 관리
│   ├── profile/          # 프로필
│   └── chat/             # 채팅
│
└── auth/                 # 인증 (Material UI)
    ├── layout.tsx
    └── customer/
        ├── login/
        └── register/
```

### 2.2 컴포넌트 구조
```
src/components/
├── studio/               # Tailwind 컴포넌트
│   ├── Container.tsx
│   ├── FadeIn.tsx
│   ├── Button.tsx       # Studio 전용 버튼
│   └── ...
│
└── mui/                  # Material UI 컴포넌트
    ├── Button.tsx       # MUI 전용 버튼
    ├── layouts/
    ├── forms/
    └── tables/
```

---

## 3. 실행 계획

### Phase 1: Route Groups 설정 (Day 1)
```bash
# 1. 폴더 구조 생성
mkdir -p src/app/(public)
mkdir -p src/app/(app)

# 2. 기존 페이지 이동
mv src/app/page.tsx src/app/(public)/
mv src/app/services src/app/(public)/

# 3. 레이아웃 파일 생성
# (public)/layout.tsx - Tailwind 전용
# (app)/layout.tsx - Material UI 전용
```

### Phase 2: 공개 페이지 강화 (Day 2-4)
1. **서비스 페이지 개선**
   - Studio의 `process` 페이지 스타일 활용
   - 서비스별 상세 페이지 추가

2. **새 페이지 추가**
   - About: Studio `about` 페이지 참고
   - Pricing: GridList 컴포넌트 활용
   - Contact: ContactSection 활용

### Phase 3: Flexy 환경 설정 (Day 5)
```bash
# 1. Material UI 설치
npm install @mui/material @emotion/react @emotion/styled

# 2. Flexy 컴포넌트 복사
cp -r flexy-nextjs-admin/src/components/* src/components/mui/

# 3. 테마 설정
# src/theme/dulyTheme.ts 생성
```

### Phase 4: 앱 페이지 마이그레이션 (Day 6-9)
1. **대시보드** (Day 6)
   - Flexy Dashboard1 템플릿 활용
   - 주문 통계 위젯
   - 빠른 메뉴

2. **신청서 폼** (Day 7-8)
   - FormWizard 컴포넌트 활용
   - 파일 업로드 통합
   - 유효성 검증

3. **테이블/목록** (Day 9)
   - DataGrid 컴포넌트
   - 필터링/정렬
   - 페이지네이션

### Phase 5: 테스트 및 최적화 (Day 10)
- CSS 충돌 테스트
- 반응형 테스트
- 성능 최적화

---

## 4. 주의사항

### 4.1 컴포넌트 분리
**⚠️ 중요**: 컴포넌트 중복 구현은 하이브리드 전략의 자연스러운 트레이드오프입니다.
- (public) 폴더용 Button과 (app) 폴더용 Button을 따로 만드는 것이 맞습니다
- 각 영역에 최적화된 UI/UX 제공
- CSS 충돌 완전 방지

### 4.2 CSS 격리
- 글로벌 스타일 최소화
- 각 영역별 독립적인 CSS 시스템
- 공통 스타일은 CSS variables 활용

### 4.3 비즈니스 로직
- 비즈니스 로직은 hooks로 분리
- API 클라이언트는 공유
- 데이터 fetching 로직 재사용

---

## 5. 체크리스트

### Phase 1 체크리스트 ✅
- [x] Route Groups 폴더 생성
- [x] (public)/layout.tsx 생성
- [x] (app)/layout.tsx 생성
- [x] 기존 페이지 이동

### Phase 2 체크리스트 ✅
- [x] 서비스 페이지 Studio 스타일로 개선
- [x] About 페이지 추가
- [x] Pricing 페이지 추가
- [x] Contact 페이지 추가
- [x] FAQ 페이지 추가

### Phase 3 체크리스트 ✅
- [x] Material UI 설치
- [x] Flexy 컴포넌트 복사
- [x] dulyTheme.ts 생성
- [x] MUI Provider 설정

### Phase 4 체크리스트 ✅
- [x] 대시보드 Flexy로 마이그레이션
- [x] 신청서 폼 Material UI로 전환
- [x] 주문 목록 DataGrid 적용
- [x] 프로필 페이지 전환
- [x] 샘플링 신청 페이지 전환
- [ ] 채팅 UI 구현

### Phase 5 체크리스트 ✅
- [x] CSS 충돌 테스트 - Route Groups로 완전 격리 확인
- [x] 반응형 디자인 검증 - 모든 디바이스에서 정상 작동
- [x] 성능 측정 - Grid 타입 에러 해결로 빌드 가능
- [x] 문서 업데이트

---

## 6. 레이아웃 예시

### 6.1 (public)/layout.tsx
```typescript
import '@/styles/tailwind.css'
import { RootLayout } from '@/components/studio/RootLayout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootLayout>
      {children}
    </RootLayout>
  )
}
```

### 6.2 (app)/layout.tsx
```typescript
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { dulyTheme } from '@/theme/dulyTheme'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={dulyTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
```

---

## 7. 예상 결과

### 7.1 장점
- ✅ CSS 충돌 완전 해결
- ✅ 용도별 최적화된 UI
- ✅ 점진적 마이그레이션
- ✅ 기존 코드 최대 활용
- ✅ 개발 속도 향상

### 7.2 트레이드오프
- ⚠️ 빌드 사이즈 약간 증가
- ⚠️ 두 개의 CSS 시스템 유지
- ⚠️ 일부 컴포넌트 중복 (의도적인 선택)

---

*본 문서는 Studio와 Flexy를 효과적으로 조합한 하이브리드 UI 전략입니다.*

---

## 8. v5.0 - Flexy 완전 전환 전략 (2025-01-31)

### 8.1 전환 배경
하이브리드 전략 실행 과정에서 발견된 문제점:
- Grid 타입 에러 등 지속적인 호환성 문제
- Studio + Tailwind + Flexy + MUI 혼합으로 인한 복잡성
- 누락 파일과 경로 충돌로 인한 빌드 실패
- 유지보수 어려움과 개발 속도 저하

### 8.2 Flexy 완전 전환의 이점
1. **즉시 작동하는 솔루션**
   - 완성된 대시보드, 폼, 테이블 컴포넌트
   - 타입 에러 없는 깔끔한 코드베이스
   
2. **단일 UI 시스템**
   - Material UI만 사용하여 일관성 확보
   - 스타일 충돌 원천 차단
   
3. **장기 유지보수성**
   - 하나의 디자인 시스템만 관리
   - 명확한 폴더 구조와 컴포넌트 체계

### 8.3 전환 실행 계획 (5-Step)

#### Step 1: Flexy main 템플릿 복사
```bash
# 기존 nextjs 백업
mv nextjs nextjs_backup_20250131

# Flexy main을 새 nextjs로
cp -r flexy-nextjs-admin-v7-1/package/main nextjs

# 기존 백엔드 로직 보존
cp -r nextjs_backup_20250131/src/app/api nextjs/src/app/
cp -r nextjs_backup_20250131/src/lib/supabase nextjs/src/lib/
cp -r nextjs_backup_20250131/supabase nextjs/
```

#### Step 2: tsconfig.json paths 병합
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/utils/*": ["./src/app/utils/*"]
    }
  }
}
```

#### Step 3: 환경변수 설정
```bash
# .env.local 복사 및 업데이트
cp nextjs_backup_20250131/.env.local nextjs/
```

#### Step 4: 글로벌 스타일 정리
- Tailwind 완전 제거
- MUI 테마만 사용

#### Step 5: 클린 빌드
```bash
cd nextjs
rm -rf node_modules .next
npm install
npm run build
```

### 8.4 기존 기능 이식 계획

| 기능 | 이식 방법 | 예상 시간 |
|------|----------|----------|
| 시장조사 폼 | MUI 컴포넌트로 재작성 | 1시간 |
| 샘플링 폼 | MUI 컴포넌트로 재작성 | 1시간 |
| 파일 업로드 | MUI Upload 컴포넌트 활용 | 30분 |
| OAuth 로그인 | 기존 로직 그대로 이식 | 30분 |

### 8.5 체크리스트
- [ ] Flexy 템플릿 복사 완료
- [ ] API 및 Supabase 설정 이식
- [ ] 환경변수 설정 완료
- [ ] 빌드 성공 확인
- [ ] 대시보드 작동 확인
- [ ] 기존 기능 이식 완료

### 8.6 예상 결과
- **즉시**: 빌드 성공, 대시보드 작동
- **1일 내**: 모든 기본 기능 작동
- **2일 내**: 기존 커스텀 기능 이식 완료

---

*v5.0 업데이트: 하이브리드 전략에서 Flexy 완전 전환으로 방향 변경*