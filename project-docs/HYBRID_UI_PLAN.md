# 🎯 Studio + Flexy 하이브리드 UI 전략
**두리무역 ERP - 최적화된 UI 전략**

문서 버전: v1.0  
작성일: 2025-01-30  
목표: 10일 내 완성 (2025-02-09)

---

## 📌 핵심 전략
**용도별 최적화된 UI 라이브러리 사용**
- 공개 페이지 = Studio 템플릿 (화려한 마케팅)
- 앱 페이지 = Flexy 템플릿 (실용적 기능)

---

## 1. 현황 분석

### 1.1 기존 문제점
- Tailwind CSS 템플릿 혼용 (Studio, Catalyst, Salient)
- 스타일 충돌 및 일관성 부족
- 입력 폼 컴포넌트 부족

### 1.2 새로운 접근법
- Next.js Route Groups로 영역 분리
- CSS 시스템 완전 격리
- 용도별 최적화

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
│   │   ├── page.tsx      # 전체 서비스
│   │   ├── inspection/   # 검품 서비스
│   │   ├── import/       # 수입대행
│   │   ├── purchasing/   # 구매대행
│   │   └── shipping/     # 배송대행
│   ├── pricing/          # 가격 정책
│   ├── contact/          # 문의하기
│   └── faq/              # 자주 묻는 질문
│
├── (app)/                # Flexy 영역 (Material UI)
│   ├── layout.tsx        # MUI ThemeProvider
│   ├── dashboard/        # 대시보드
│   ├── application/      # 신청서 폼
│   │   ├── import-agency/
│   │   ├── inspection/
│   │   ├── purchasing/
│   │   └── shipping/
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
│   ├── SectionIntro.tsx
│   ├── ContactSection.tsx
│   └── ...
│
└── mui/                  # Material UI 컴포넌트
    ├── layouts/
    ├── forms/
    ├── tables/
    └── charts/
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

## 4. 레이아웃 파일 예시

### 4.1 (public)/layout.tsx
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

### 4.2 (app)/layout.tsx
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

## 5. 주의사항

### 5.1 CSS 격리
- 글로벌 스타일 최소화
- 각 영역별 독립적인 CSS 시스템
- 공통 스타일은 CSS variables 활용

### 5.2 컴포넌트 재사용
- 비즈니스 로직은 hooks로 분리
- UI 컴포넌트는 각 시스템별 구현
- API 클라이언트는 공유

### 5.3 빌드 최적화
- 동적 임포트 활용
- 불필요한 의존성 제거
- Tree shaking 확인

---

## 6. 예상 결과

### 6.1 장점
- ✅ CSS 충돌 완전 해결
- ✅ 용도별 최적화된 UI
- ✅ 점진적 마이그레이션
- ✅ 기존 코드 최대 활용
- ✅ 개발 속도 향상

### 6.2 트레이드오프
- ⚠️ 빌드 사이즈 약간 증가
- ⚠️ 두 개의 CSS 시스템 유지
- ⚠️ 일부 컴포넌트 중복

---

## 7. 체크리스트

### Phase 1
- [ ] Route Groups 폴더 생성
- [ ] 레이아웃 파일 설정
- [ ] 기존 페이지 이동

### Phase 2
- [ ] 서비스 페이지 개선
- [ ] About 페이지 추가
- [ ] Pricing 페이지 추가
- [ ] Contact 페이지 추가

### Phase 3
- [ ] Material UI 설치
- [ ] Flexy 컴포넌트 복사
- [ ] 테마 설정

### Phase 4
- [ ] 대시보드 마이그레이션
- [ ] 신청서 폼 마이그레이션
- [ ] 테이블/목록 마이그레이션

### Phase 5
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 문서 업데이트

---

*본 문서는 Studio와 Flexy를 효과적으로 조합한 하이브리드 UI 전략입니다.*