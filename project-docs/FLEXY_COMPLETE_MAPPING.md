# 📊 Flexy NextJS 완전 매핑 가이드
**두리무역 ERP 전체 82페이지 → Flexy 템플릿 매핑**

문서 버전: v1.0  
작성일: 2025-01-30  
작성자: 시스템 아키텍트

---

## 📑 목차
1. [매핑 개요](#1-매핑-개요)
2. [고객 포털 (26페이지)](#2-고객-포털-26페이지)
3. [중국직원 포털 (15페이지)](#3-중국직원-포털-15페이지)
4. [한국팀 포털 (15페이지)](#4-한국팀-포털-15페이지)
5. [관리자 포털 (15페이지)](#5-관리자-포털-15페이지)
6. [공통 페이지 (6페이지)](#6-공통-페이지-6페이지)
7. [실제 Flexy URL 검증](#7-실제-flexy-url-검증)

---

## 1. 매핑 개요

### 1.1 전체 페이지 구조
- **총 82페이지** (09_FRONTEND_DESIGN.md 기준)
- **고객 포털**: 26페이지
- **직원 포털**: 35페이지 (중국 15 + 한국 15)
- **관리자 포털**: 15페이지
- **공통 페이지**: 6페이지

### 1.2 Flexy 실제 가능한 URL
```
✅ 확인된 페이지:
/landingpage
/auth/login
/auth/register
/dashboards/dashboard1
/dashboards/dashboard2
/apps/blog/post
/apps/blog/detail/[id]
/apps/calendar
/apps/chat
/apps/contact
/apps/contacts
/apps/ecommerce/add-product
/apps/ecommerce/checkout
/apps/ecommerce/detail/[id]
/apps/ecommerce/edit-product
/apps/ecommerce/eco-product-list
/apps/ecommerce/shop
/apps/email
/apps/invoice/list
/apps/invoice/detail/[id]
/apps/invoice/create
/apps/notes
/apps/permissions/page
/apps/tickets
/apps/todo
/apps/user/list
/apps/user/profile
/forms/form-custom
/forms/form-elements
/forms/form-horizontal
/forms/form-layout
/forms/form-validation
/forms/form-vertical
/forms/form-wizard
/react-tables/basic
/react-tables/collapsible
/react-tables/dense
/react-tables/enhanced
/react-tables/filter
/react-tables/fixed-header
/react-tables/pagination
/react-tables/row-selection
/react-tables/search
/react-tables/sorting
/react-tables/sticky-header
/sample-page
/theme-pages/account-settings
/theme-pages/casl
/theme-pages/error
/theme-pages/faq
/theme-pages/gallery
/theme-pages/landingpage
/theme-pages/pricing
/theme-pages/search-result
/theme-pages/treeview
/widgets/charts
/widgets/cards
/widgets/banners
```

---

## 2. 고객 포털 (26페이지)

### 2.1 공개 페이지 (6개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/` | `/landingpage` | ✅ |
| `/services` | `/theme-pages/pricing` | ✅ |
| `/pricing` | `/theme-pages/pricing` | ✅ |
| `/about` | `/sample-page` (커스터마이징) | ✅ |
| `/contact` | `/apps/contact` | ✅ |
| `/faq` | `/theme-pages/faq` | ✅ |

### 2.2 인증 페이지 (4개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/auth/customer/login` | `/auth/login` | ✅ |
| `/auth/customer/register` | `/auth/register` | ✅ |
| `/auth/customer/forgot-password` | `/auth/login` (커스텀) | ✅ |
| `/auth/customer/reset-password` | `/auth/login` (커스텀) | ✅ |

### 2.3 신청 페이지 (7개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/apply` | `/widgets/cards` (서비스 카드) | ✅ |
| `/apply/import-agency` | `/forms/form-wizard` | ✅ |
| `/apply/inspection` | `/forms/form-wizard` | ✅ |
| `/apply/purchasing` | `/forms/form-wizard` | ✅ |
| `/apply/shipping` | `/forms/form-wizard` | ✅ |
| `/apply/success` | `/theme-pages/casl` (커스텀) | ✅ |
| `/apply/[reservationNumber]` | `/apps/invoice/detail/[id]` | ✅ |

### 2.4 프로필 페이지 (4개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/profile` | `/theme-pages/account-settings` | ✅ |
| `/profile/company` | `/forms/form-horizontal` | ✅ |
| `/profile/tax` | `/forms/form-horizontal` | ✅ |
| `/profile/addresses` | `/apps/contacts` | ✅ |

### 2.5 대시보드 페이지 (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/my` | `/dashboards/dashboard1` | ✅ |
| `/my/applications` | `/react-tables/filter` | ✅ |
| `/my/documents` | `/apps/notes` | ✅ |

### 2.6 채팅/문서 페이지 (2개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/chat/[reservationNumber]` | `/apps/chat` | ✅ |
| `/reports/[reservationNumber]` | `/apps/blog/detail/[id]` | ✅ |

---

## 3. 중국직원 포털 (15페이지)

### 3.1 대시보드 (1개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/dashboard` | `/dashboards/dashboard2` | ✅ |

### 3.2 작업 관리 (6개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/tasks` | `/apps/todo` | ✅ |
| `/tasks/pending` | `/react-tables/filter` | ✅ |
| `/tasks/in-progress` | `/react-tables/filter` | ✅ |
| `/tasks/urgent` | `/react-tables/filter` | ✅ |
| `/applications/[id]` | `/apps/invoice/detail/[id]` | ✅ |
| `/applications/[id]/schedule` | `/apps/calendar` | ✅ |

### 3.3 채팅 관리 (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/chats` | `/apps/chat` | ✅ |
| `/chats/[reservationNumber]` | `/apps/chat` | ✅ |
| `/chats/guest-url` | `/forms/form-custom` | ✅ |

### 3.4 보고서 (2개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/reports/upload` | `/forms/form-elements` | ✅ |
| `/reports/status` | `/react-tables/basic` | ✅ |

### 3.5 일정 (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/calendar` | `/apps/calendar` | ✅ |
| `/calendar/coordination` | `/apps/calendar` | ✅ |
| `/profile` | `/theme-pages/account-settings` | ✅ |

---

## 4. 한국팀 포털 (15페이지)

### 4.1 개요 (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/dashboard` | `/dashboards/dashboard1` | ✅ |
| `/analytics` | `/widgets/charts` | ✅ |
| `/team-performance` | `/widgets/charts` | ✅ |

### 4.2 신청 관리 (4개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/applications` | `/react-tables/enhanced` | ✅ |
| `/applications/assign` | `/react-tables/row-selection` | ✅ |
| `/applications/[id]` | `/apps/invoice/detail/[id]` | ✅ |
| `/applications/export` | `/react-tables/enhanced` | ✅ |

### 4.3 보고서 처리 (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/reports/queue` | `/react-tables/sorting` | ✅ |
| `/reports/review` | `/apps/blog/detail/[id]` | ✅ |
| `/reports/history` | `/react-tables/pagination` | ✅ |

### 4.4 CRM (3개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/crm/companies` | `/apps/contacts` | ✅ |
| `/crm/contacts` | `/apps/contacts` | ✅ |
| `/crm/opportunities` | `/apps/tickets` | ✅ |

### 4.5 팀 관리 (2개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/team/workload` | `/apps/user/list` | ✅ |
| `/team/schedule` | `/apps/calendar` | ✅ |

---

## 5. 관리자 포털 (15페이지)

### 5.1 사용자 관리 (4개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/users` | `/apps/user/list` | ✅ |
| `/users/pending` | `/react-tables/filter` | ✅ |
| `/users/roles` | `/apps/permissions/page` | ✅ |
| `/users/activity` | `/react-tables/pagination` | ✅ |

### 5.2 시스템 설정 (5개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/settings` | `/forms/form-layout` | ✅ |
| `/settings/pricing` | `/forms/form-horizontal` | ✅ |
| `/settings/email` | `/apps/email` | ✅ |
| `/settings/business-hours` | `/forms/form-vertical` | ✅ |
| `/settings/holidays` | `/apps/calendar` | ✅ |

### 5.3 모니터링 (4개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/monitoring` | `/dashboards/dashboard2` | ✅ |
| `/monitoring/api` | `/widgets/charts` | ✅ |
| `/monitoring/errors` | `/react-tables/dense` | ✅ |
| `/monitoring/performance` | `/widgets/charts` | ✅ |

### 5.4 감사 (2개)
| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/audit/logs` | `/react-tables/sticky-header` | ✅ |
| `/audit/reports` | `/apps/invoice/list` | ✅ |

---

## 6. 공통 페이지 (6페이지)

| 우리 페이지 | Flexy 매핑 | 실제 사용 가능 |
|------------|-----------|---------------|
| `/404` | `/theme-pages/error` | ✅ |
| `/500` | `/theme-pages/error` | ✅ |
| `/legal/terms` | `/sample-page` | ✅ |
| `/legal/privacy` | `/sample-page` | ✅ |
| `/search` | `/theme-pages/search-result` | ✅ |
| `/sitemap` | `/theme-pages/treeview` | ✅ |

---

## 7. 실제 Flexy URL 검증

### 7.1 핵심 페이지 우선순위
1. **Phase 1 (필수)**
   - 로그인: `/auth/login` ✅
   - 대시보드: `/dashboards/dashboard1` ✅
   - 신청서: `/forms/form-wizard` ✅
   - 채팅: `/apps/chat` ✅

2. **Phase 2 (중요)**
   - 프로필: `/theme-pages/account-settings` ✅
   - 테이블: `/react-tables/filter` ✅
   - 캘린더: `/apps/calendar` ✅
   - 파일업로드: `/forms/form-elements` ✅

3. **Phase 3 (보완)**
   - CRM: `/apps/contacts` ✅
   - 차트: `/widgets/charts` ✅
   - 권한: `/apps/permissions/page` ✅
   - 이메일: `/apps/email` ✅

### 7.2 컴포넌트 재사용 계획
- **Form Wizard**: 모든 신청서에 재사용
- **React Tables**: 모든 목록 페이지에 재사용
- **Chat**: 모든 채팅 기능에 재사용
- **Calendar**: 일정 관련 모든 페이지에 재사용

---

*본 문서는 09_FRONTEND_DESIGN.md의 82개 페이지를 Flexy 템플릿과 완전히 매핑한 가이드입니다.*