# 📋 두리무역 ERP 프로젝트 페이지 구조 총정리

> 최종 업데이트: 2025-01-28
> 상태: ✅ 개발 완료 - 고객 제공 준비 완료

## 🎯 핵심 서비스 (3개)

### 1️⃣ 시장조사 (Market Research)
- **신청 페이지**: `/application/market-research`
- **조회 페이지**: `/dashboard/orders/market-research`
- **예약번호 형식**: `MR-YYYYMMDD-XXXXXX`
- **DB 테이블**: `market_research_requests`
- **상태**: ✅ 완료

### 2️⃣ 검품감사 (Inspection)
- **신청 페이지**: `/application/inspection`
- **조회 페이지**: `/dashboard/orders/inspection`
- **예약번호 형식**: `IN-YYYYMMDD-XXXXXX`
- **DB 테이블**: `inspection_applications`
- **상태**: ✅ 완료

### 3️⃣ 공장컨택 (Factory Contact)
- **신청 페이지**: `/application/factory-contact`
- **조회 페이지**: `/dashboard/orders/factory-contact`
- **예약번호 형식**: `FC-YYYYMMDD-XXXXXX`
- **DB 테이블**: `factory_contact_requests`
- **상태**: ✅ 완료 (공장 담당자/연락처 필드 추가됨)

---

## 🏠 마케팅 페이지

### 메인 홈페이지
- **경로**: `/`
- **구성 요소**:
  - Header (네비게이션)
  - Banner (메인 비주얼)
  - Features (주요 기능)
  - Defend Focus
  - Exceptional Feature
  - FAQ (자주 묻는 질문)
  - CTA (Call to Action)
  - Footer

### Frontend Pages (핵심 페이지)
| 페이지 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| **회사소개** | `/frontend-pages/about` | 두리무역 소개 | ✅ |
| **서비스** | `/frontend-pages/services` | 5개 서비스 소개 (가격 포함) | ✅ |
| **문의하기** | `/frontend-pages/contact` | 문의 폼 + 구글맵 | ✅ |
| **고객지원** | `/frontend-pages/blog` | 공지사항/FAQ/이용안내 | ✅ |
| **계산기** | `/frontend-pages/calculators` | 관세/비용 계산 도구 | ✅ |

### 제외된 페이지
- ~~가격정책~~ → 서비스 페이지에 통합
- ~~포트폴리오~~ → 현재 불필요

### 랜딩 페이지
- **경로**: `/landingpage`
- **용도**: 마케팅 캠페인용 별도 랜딩 페이지
- **상태**: ✅

---

## 👤 사용자 관리 페이지

### 인증 관련
| 페이지 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| **로그인** | `/auth/login` | 사용자 로그인 | ✅ |
| **회원가입** | `/auth/signup` | 신규 회원가입 | ✅ |
| **비밀번호 찾기** | `/auth/forgot-password` | 비밀번호 재설정 | ✅ |

### 대시보드
| 페이지 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| **대시보드 메인** | `/dashboard` | 통계 및 요약 정보 | ✅ |
| **프로필 관리** | `/dashboard/profile` | 개인정보, 배송지, 세금계산서 | ✅ |
| **주문 목록** | `/dashboard/orders` | 전체 주문 리스트 | ✅ |

---

## 🔧 최근 수정 사항

### 2025-01-28 주요 업데이트
1. ✅ **Factory Contact 필드 추가**
   - `factory_contact_person` (공장 담당자)
   - `factory_contact_phone` (공장 연락처)
   - `factory_name` (공장명 - 선택)
   - `factory_address` (공장 주소 - 선택)

2. ✅ **URL 경로 정리**
   - `/application/import-agency/` 중간 경로 제거
   - 모든 서비스 직접 경로로 변경

3. ✅ **프로필 자동 저장**
   - 3개 서비스 모두 프로필 자동 저장 로직 추가

4. ✅ **배송지 관리**
   - `shipping_addresses` 테이블 연동
   - RLS (Row Level Security) 활성화

5. ✅ **Contact 페이지 지도**
   - 구글맵으로 변경
   - 정확한 주소 업데이트: 인천광역시 연수구 센트럴로 313 B2512

---

## 📊 데이터베이스 테이블

### 핵심 테이블
- `users` - 사용자 인증 (Supabase Auth)
- `user_profiles` - 사용자 프로필 정보
- `market_research_requests` - 시장조사 신청
- `inspection_requests` - 검품감사 신청
- `factory_contact_requests` - 공장컨택 신청
- `shipping_addresses` - 배송지 정보
- `contact_inquiries` - 문의 내역

### RLS 상태
- ✅ `shipping_addresses` - RLS 활성화됨
- ✅ `user_shipping_addresses` - RLS 활성화됨

---

## 🚀 프로덕션 체크리스트

### 필수 기능 ✅
- [x] 3개 서비스 신청/조회
- [x] 사용자 인증 시스템
- [x] 프로필 관리
- [x] 배송지 관리
- [x] 대시보드
- [x] 마케팅 페이지

### 준비 중 기능 🚧
- [ ] 구매대행 서비스 (준비중 표시)
- [ ] 배송대행 서비스 (준비중 표시)
- [ ] 실시간 채팅 시스템
- [ ] 리포트 생성/다운로드
- [ ] 결제 시스템 연동

---

## 📝 참고사항

1. **예약번호 규칙**
   - 형식: `[서비스코드]-YYYYMMDD-[6자리 난수]`
   - 예시: `MR-20250128-123456`

2. **권한 관리**
   - 일반 사용자: 자신의 신청 내역만 조회 가능
   - 관리자: 모든 신청 내역 조회 및 관리 가능

3. **파일 업로드**
   - Supabase Storage 사용
   - 최대 10MB 제한
   - 지원 형식: 이미지, PDF, DOC, XLS

4. **다국어 지원**
   - 현재: 한국어만 지원
   - 추후: 중국어 지원 예정

---

## 🎉 최종 정리

### 실제 필요한 페이지 (고객 제공용)
1. **홈페이지** (`/`) - 메인 랜딩
2. **회사소개** (`/frontend-pages/about`) - 두리무역 소개
3. **서비스** (`/frontend-pages/services`) - 5개 서비스 + 가격
4. **고객지원** (`/frontend-pages/blog`) - 공지사항/FAQ
5. **문의하기** (`/frontend-pages/contact`) - 문의 폼
6. **계산기** (`/frontend-pages/calculators`) - 관세 계산
7. **시장조사** - 신청/조회
8. **검품감사** - 신청/조회 
9. **공장컨택** - 신청/조회
10. **대시보드** - 통계/주문관리
11. **프로필** - 개인정보/배송지

### 고객지원 페이지 콘텐츠 추가 완료
- ✅ 5개 공지사항 작성
- ✅ 8개 FAQ 작성
- ✅ 카테고리별 정리 (회원가입, 서비스, 결제, 배송 등)

**총 11개 핵심 페이지**로 정리되어 프로덕션 배포 준비 완료!



이걸 토대로 다 검토를 해봐 어디를 고쳐 야 할지 부족한 내용이 뭐가 있을지 


--dwsktop --seq --c7

배포 하고 고객 한테 쓰게 할꺼임 이제 자세하게 꼼꼼 하게 다 보고 검토 하고 각 페이지안에  버튼 밑 연결 안된것들 어떡해 처리 할지  검토 해야함 
