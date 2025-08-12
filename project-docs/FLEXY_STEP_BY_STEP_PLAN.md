# 🚀 Flexy 마이그레이션 단계별 실행 계획
**두리무역 ERP - 프론트엔드 전면 교체**

작성일: 2025-01-30  
목표: 15일 내 완성 (2025-02-14)

---

## 📌 핵심 전략
**현재 nextjs 폴더의 프론트엔드를 전부 날리고 Flexy로 교체**

---

## 🎯 단계별 실행 계획

### 🔴 1단계: 백업 및 제거 (Day 1 - 오늘)
```bash
# 1-1. 전체 백업
cp -r C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\nextjs C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\nextjs_backup_20250130

# 1-2. 보존할 파일 임시 이동
mkdir C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\temp_preserve
cp -r nextjs\src\lib\supabase temp_preserve\
cp -r nextjs\src\lib\context temp_preserve\
cp -r nextjs\src\lib\types temp_preserve\
cp -r nextjs\src\lib\schemas temp_preserve\
cp nextjs\.env.local temp_preserve\
cp nextjs\middleware.ts temp_preserve\
cp -r nextjs\src\app\api temp_preserve\

# 1-3. 프론트엔드 전체 제거
rm -rf nextjs\src\app\*
rm -rf nextjs\src\components\*
rm -rf nextjs\src\styles\*
rm -rf nextjs\tailwind.config.js
rm -rf nextjs\postcss.config.js
rm -rf nextjs\public\* (로고 제외)
```

**✅ 완료 후 문서 업데이트**: 00_INDEX.md에 "Phase 1 완료" 기록

---

### 🟡 2단계: Flexy 설치 및 환경 설정 (Day 2)
```bash
# 2-1. Flexy main 버전 복사
cd nextjs
cp -r ..\flexy-nextjs-admin-v7-1\package\main\* .

# 2-2. 보존 파일 복원
cp -r ..\temp_preserve\supabase src\lib\
cp -r ..\temp_preserve\context src\lib\
cp -r ..\temp_preserve\types src\lib\
cp -r ..\temp_preserve\schemas src\lib\
cp ..\temp_preserve\.env.local .
cp ..\temp_preserve\middleware.ts .
cp -r ..\temp_preserve\api src\app\

# 2-3. package.json 수정 (필요한 패키지 추가)
# - @supabase/supabase-js
# - @supabase/auth-helpers-nextjs
# - react-dropzone (파일 업로드용)

# 2-4. 의존성 설치
npm install

# 2-5. 테스트 실행
npm run dev
```

**✅ 완료 후 문서 업데이트**: 
- 09_FRONTEND_DESIGN.md → Material UI로 변경
- 08_TECH_ARCHITECTURE.md → 기술 스택 업데이트

---

### 🟢 3단계: 인증 시스템 구현 (Day 3-4)

#### 3-1. 로그인 페이지 (`/auth/login`)
- [ ] Flexy 로그인 페이지 커스터마이징
- [ ] returnUrl 로직 구현 (localStorage)
- [ ] OAuth 버튼 추가 (Google, Kakao)
- [ ] 역할 확인 로직 (customer만 허용)

#### 3-2. 회원가입 페이지 (`/auth/register`)
- [ ] 약관 동의 체크박스
- [ ] 회사 정보 입력 필드
- [ ] 이메일 중복 확인

#### 3-3. 미들웨어 설정
- [ ] 인증 체크
- [ ] 역할별 라우팅

**✅ 완료 후 문서 업데이트**: 14_CODE_STANDARDS.md에 MUI 코딩 가이드 추가

---

### 🔵 4단계: 대시보드 구현 (Day 5-6)

#### 4-1. 고객 대시보드 (`/dashboards/dashboard1`)
- [ ] 통계 카드 (진행중, 완료, 대기, 매출)
- [ ] 빠른 신청 버튼 4개
- [ ] 최근 신청 테이블
- [ ] Supabase 연동

#### 4-2. 직원 대시보드 (`/dashboards/dashboard2`)
- [ ] 작업 현황 카드
- [ ] 긴급 처리 목록
- [ ] 오늘의 일정

---

### 🟣 5단계: 신청서 폼 구현 (Day 7-9)

#### 5-1. 시장조사 신청 (`/forms/form-wizard`)
```
Step 1: 제품 정보
- productName (필수)
- researchQuantity (필수, 기본값 1000)
- requirements (필수, 10-1000자)

Step 2: 파일 업로드
- photos (필수, 1-5개)
- detailPage (선택)

Step 3: 추가 옵션
- logoRequired → logoFile
- customBoxRequired → boxDesignFile
```

#### 5-2. 프로필 체크 로직
```typescript
// 프로필 없으면 /profile/setup으로
if (!profile.company_name || !profile.phone) {
  router.push('/profile/setup?from=market-research');
}
```

#### 5-3. 파일 업로드 컴포넌트
- [ ] react-dropzone 사용
- [ ] 이미지 압축 로직
- [ ] 진행률 표시

---

### 🟠 6단계: 채팅 시스템 (Day 10-11)

#### 6-1. 채팅 UI (`/apps/chat`)
- [ ] 예약번호별 채팅방
- [ ] 실시간 메시지 (Supabase Realtime)
- [ ] 파일 공유
- [ ] 번역 표시 (한국팀만)

#### 6-2. 채팅 목록
- [ ] 활성 채팅방 목록
- [ ] 읽지 않은 메시지 카운트
- [ ] 최근 메시지 미리보기

---

### ⚫ 7단계: 프로필 & 설정 (Day 12)

#### 7-1. 프로필 페이지 (`/theme-pages/account-settings`)
- [ ] 회사 정보 표시/수정
- [ ] 배송지 관리 모달
- [ ] 언어 설정
- [ ] 로그아웃 버튼

#### 7-2. 배송지 관리
- [ ] 기본 배송지 설정
- [ ] 개인/사업자 통관 분기
- [ ] 주소 추가/수정/삭제

---

### ⚪ 8단계: 테이블 & 목록 (Day 13)

#### 8-1. 신청 목록 (`/react-tables/filter`)
- [ ] 필터링 (상태, 날짜, 서비스)
- [ ] 정렬 기능
- [ ] 페이지네이션
- [ ] 엑셀 다운로드

#### 8-2. 상세 페이지
- [ ] 신청 정보 표시
- [ ] 상태 타임라인
- [ ] 첨부 파일 목록
- [ ] 채팅 바로가기

---

### 🔶 9단계: 한글화 & 테마 (Day 14)

#### 9-1. Material UI 테마 설정
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#000000' },
    secondary: { main: '#3B82F6' }
  },
  typography: {
    fontFamily: '"Pretendard", sans-serif'
  }
});
```

#### 9-2. 한글화
- [ ] 모든 라벨 한글로 변경
- [ ] 날짜 포맷 (YYYY-MM-DD)
- [ ] 통화 포맷 (₩1,234,567)
- [ ] 에러 메시지 한글화

---

### ✅ 10단계: 최종 테스트 & 배포 (Day 15)

#### 10-1. 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 신청서 작성 → 제출
- [ ] 채팅 기능
- [ ] 파일 업로드/다운로드

#### 10-2. 문서 최종 업데이트
- [ ] 16_DEPLOYMENT.md - 배포 절차
- [ ] 17_OPERATIONS_MANUAL.md - 운영 가이드
- [ ] 18_USER_MANUAL.md - 사용자 매뉴얼
- [ ] 19_CHANGELOG.md - v3.0.0 릴리즈 노트

#### 10-3. 프로덕션 배포
```bash
npm run build
vercel --prod
```

---

## 📊 진행 상황 추적

| 단계 | 작업 내용 | 예정일 | 완료 |
|-----|----------|--------|------|
| 1단계 | 백업 및 제거 | 1/30 | ⬜ |
| 2단계 | Flexy 설치 | 1/31 | ⬜ |
| 3단계 | 인증 시스템 | 2/1-2 | ⬜ |
| 4단계 | 대시보드 | 2/3-4 | ⬜ |
| 5단계 | 신청서 폼 | 2/5-7 | ⬜ |
| 6단계 | 채팅 | 2/8-9 | ⬜ |
| 7단계 | 프로필 | 2/10 | ⬜ |
| 8단계 | 테이블 | 2/11 | ⬜ |
| 9단계 | 한글화 | 2/12 | ⬜ |
| 10단계 | 배포 | 2/13-14 | ⬜ |

---

## 🔥 즉시 실행 (오늘 할 일)

```bash
# 1. 백업 먼저!
cd C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom
cp -r nextjs nextjs_backup_20250130

# 2. 보존 파일 임시 저장
mkdir temp_preserve
cp -r nextjs/src/lib/supabase temp_preserve/
cp -r nextjs/src/lib/context temp_preserve/
cp -r nextjs/src/lib/types temp_preserve/
cp -r nextjs/src/lib/schemas temp_preserve/
cp nextjs/.env.local temp_preserve/
cp nextjs/middleware.ts temp_preserve/
cp -r nextjs/src/app/api temp_preserve/

# 3. 프론트 싹 제거
cd nextjs
rm -rf src/app/* src/components/* src/styles/*
rm tailwind.config.js postcss.config.js

# 4. 준비 완료!
echo "프론트엔드 제거 완료! 내일 Flexy 설치 시작!"
```

---

*본 계획서는 단계별로 명확한 실행 지침을 제공합니다. 각 단계 완료 시 체크하세요!*