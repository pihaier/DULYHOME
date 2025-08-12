# 🗄️ 데이터베이스 설계 문서 (Database Design Document)
**두리무역 디지털 전환 플랫폼**

문서 버전: v1.0  
작성일: 2025-01-26  
작성자: 데이터베이스 아키텍트  
표준: PostgreSQL 14+ with Supabase RLS

---

## 📑 목차
1. [설계 개요](#1-설계-개요)
2. [테이블 구조](#2-테이블-구조)
3. [관계 정의](#3-관계-정의)
4. [인덱스 전략](#4-인덱스-전략)
5. [RLS 정책](#5-rls-정책)
6. [트리거 및 함수](#6-트리거-및-함수)
7. [데이터 마이그레이션](#7-데이터-마이그레이션)
8. [백업 및 복구](#8-백업-및-복구)

---

## 1. 설계 개요

### 1.1 설계 원칙
- **정규화**: 3NF(Third Normal Form) 준수
- **확장성**: 서비스 추가 시 스키마 변경 최소화
- **보안**: Row Level Security 필수 적용
- **성능**: 적절한 인덱스와 파티셔닝
- **무결성**: 외래 키 제약과 체크 제약

### 1.2 명명 규칙
```sql
-- 테이블: 복수형, snake_case
users, inspection_applications, chat_messages

-- 컬럼: snake_case
user_id, created_at, reservation_number

-- 인덱스: idx_테이블명_컬럼명
idx_applications_status, idx_messages_reservation

-- 외래키: fk_자식테이블_부모테이블
fk_applications_users, fk_messages_applications

-- 정책: 역할_액션_테이블
customers_read_applications, staff_update_reports
```

### 1.3 데이터 타입 표준
```sql
-- ID: UUID (Supabase 기본)
id UUID DEFAULT gen_random_uuid() PRIMARY KEY

-- 시간: TIMESTAMPTZ (시간대 포함)
created_at TIMESTAMPTZ DEFAULT NOW()

-- 문자열: TEXT (길이 제한 불필요한 경우)
-- VARCHAR(n) (길이 제한 필요한 경우)
name TEXT NOT NULL
phone VARCHAR(20) NOT NULL

-- 금액: DECIMAL(12,2)
amount DECIMAL(12,2) NOT NULL

-- 상태: VARCHAR(50) + CHECK 제약
status VARCHAR(50) CHECK (status IN (...))

-- JSON: JSONB (쿼리 가능)
metadata JSONB DEFAULT '{}'
```

---

## 2. 테이블 구조

### 2.1 사용자 및 인증

#### users (Supabase Auth 기본 테이블)
```sql
-- Supabase Auth가 자동 관리
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB
);
```

#### user_profiles (사용자 프로필)
```sql
CREATE TABLE public.user_profiles (
  -- 기본 정보
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN (
    'customer', 'chinese_staff', 'korean_team', 'admin', 'inspector', 'factory'
  )),
  
  -- 회사 정보
  company_name VARCHAR(100),
  company_name_chinese VARCHAR(100),
  business_number VARCHAR(20),
  
  -- 담당자 정보
  contact_person VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(50),
  position VARCHAR(50),
  
  -- 고객 전용
  customer_type VARCHAR(10) CHECK (customer_type IN ('개인', '법인')),
  personal_customs_code VARCHAR(20),
  virtual_account VARCHAR(50),
  
  -- 직원 전용
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (
    approval_status IN ('pending', 'approved', 'rejected')
  ),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- 설정
  language_preference VARCHAR(2) DEFAULT 'ko' CHECK (
    language_preference IN ('ko', 'zh')
  ),
  notification_enabled BOOLEAN DEFAULT true,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_role ON user_profiles(role);
CREATE INDEX idx_profiles_approval ON user_profiles(approval_status);
CREATE INDEX idx_profiles_company ON user_profiles(company_name);
```

### 2.2 오더 관리 (통합 오더번호)

#### orders (모든 서비스 통합 오더)
```sql
CREATE TABLE public.orders (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL, -- DL-YYYYMMDD-XXXXXX
  service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
    'quality_inspection', 'factory_audit', 'loading_inspection',
    'market_research', 'import_shipping', 'purchasing_agency', 'shipping_agency'
  )),
  
  -- 고객 정보
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_number VARCHAR(20), -- G000086
  
  -- 상태 (고객/직원 공통)
  status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN (
    -- 신청/검토
    'submitted', 'under_review', 'approved', 'rejected',
    -- 견적/결제
    'researching', 'quote_preparation', 'quote_sent', 
    'payment_pending', 'payment_confirmed',
    -- 실행
    'schedule_coordination', 'in_progress',
    -- 보고서
    'report_writing', 'final_review',
    -- 완료/취소
    'completed', 'cancelled', 'on_hold'
  )),
  
  -- 담당자
  assigned_staff UUID REFERENCES auth.users(id),
  duly_manager VARCHAR(50),
  
  -- 금액
  total_amount DECIMAL(12,2),
  margin_amount DECIMAL(12,2),
  margin_percentage DECIMAL(5,2),
  payment_status VARCHAR(20) CHECK (payment_status IN (
    'pending', 'paid', 'partial', 'refunded'
  )),
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}'
);

-- 인덱스
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_service ON orders(service_type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_staff ON orders(assigned_staff);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### 2.3 검품/감사 서비스

#### china_business_trips (중국 출장 대행)
```sql
CREATE TABLE public.china_business_trips (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 서비스 세부
  service_sub_type VARCHAR(30) NOT NULL CHECK (service_sub_type IN (
    '검품(생산 후)', '공장감사', '선적검품'
  )),
  
  -- 검품 정보
  inspection_days INTEGER,
  qc_standard TEXT,
  
  -- 공장 정보
  factory_name VARCHAR(100) NOT NULL,
  factory_contact VARCHAR(50),
  factory_phone VARCHAR(30),
  factory_address TEXT NOT NULL,
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  product_name_chinese VARCHAR(200),
  specification TEXT,
  quantity INTEGER,
  
  -- 일정
  desired_date DATE,
  confirmed_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- 요청사항
  inspection_request TEXT NOT NULL,
  inspection_request_cn TEXT,
  request_files JSONB DEFAULT '[]',
  
  -- 비용
  china_expenses_rmb DECIMAL(10,2),
  china_expenses_request DECIMAL(12,2),
  daily_rate DECIMAL(10,2),
  
  -- 결과물
  inspection_files JSONB DEFAULT '[]',
  inspection_report TEXT,
  
  -- 견적
  quotation_number VARCHAR(50),
  unit_price DECIMAL(10,2),
  supply_amount DECIMAL(12,2),
  tax_amount DECIMAL(10,2),
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_trips_order ON china_business_trips(order_id);
CREATE INDEX idx_trips_factory ON china_business_trips(factory_name);
CREATE INDEX idx_trips_dates ON china_business_trips(confirmed_date);
```

### 2.4 시장조사 서비스

#### market_research_requests (시장조사 요청)
```sql
CREATE TABLE public.market_research_requests (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 조사 타입
  research_type VARCHAR(20) CHECK (research_type IN ('정밀 조사', '일반 조사')),
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  product_name_chinese VARCHAR(200),
  expected_quantity INTEGER,
  target_price_min DECIMAL(10,2),
  target_price_max DECIMAL(10,2),
  
  -- 요청사항
  requirements TEXT NOT NULL,
  requirements_chinese TEXT,
  detail_page TEXT,
  photos JSONB DEFAULT '[]', -- 필수!
  
  -- 거래 조건
  trade_terms VARCHAR(10) CHECK (trade_terms IN ('FOB', 'DDP', 'EXW')),
  customs_name VARCHAR(100),
  export_port VARCHAR(50),
  
  -- 조사 결과
  research_status VARCHAR(30) DEFAULT 'pending',
  research_completed_at TIMESTAMPTZ,
  selected_supplier_id UUID,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_research_order ON market_research_requests(order_id);
CREATE INDEX idx_research_status ON market_research_requests(research_status);
```

#### market_research_suppliers (공급업체 정보)
```sql
CREATE TABLE public.market_research_suppliers (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES market_research_requests(id) ON DELETE CASCADE,
  
  -- 공급업체 정보
  supplier_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(50),
  contact_phone VARCHAR(30),
  contact_email VARCHAR(100),
  export_port VARCHAR(50),
  
  -- 제품 가격
  factory_price_rmb DECIMAL(10,2) NOT NULL,
  unit_price_krw DECIMAL(10,2),
  moq INTEGER,
  moq_unit VARCHAR(20),
  
  -- 제품 규격
  length_cm DECIMAL(8,2),
  width_cm DECIMAL(8,2),
  height_cm DECIMAL(8,2),
  weight_kg DECIMAL(8,3),
  units_per_box INTEGER,
  total_boxes INTEGER,
  total_cbm DECIMAL(10,3),
  
  -- 샘플 정보
  sample_available BOOLEAN DEFAULT false,
  sample_stock TEXT,
  sample_order_qty INTEGER,
  sample_price DECIMAL(10,2),
  sample_make_time VARCHAR(50),
  sample_weight_kg DECIMAL(8,3),
  
  -- 제품 상세
  product_options TEXT,
  product_colors TEXT,
  product_size TEXT,
  product_material TEXT,
  product_function TEXT,
  product_features TEXT,
  product_composition TEXT,
  product_photos JSONB DEFAULT '[]',
  
  -- 인증 정보
  certification_required BOOLEAN DEFAULT false,
  required_certs TEXT,
  cert_cost DECIMAL(10,2),
  cert_docs TEXT,
  
  -- 운송 계산
  shipping_method VARCHAR(10) CHECK (shipping_method IN ('LCL', 'FCL', '항공')),
  fcl_freight DECIMAL(10,2),
  lcl_freight DECIMAL(10,2),
  air_freight DECIMAL(10,2),
  
  -- 기업 신용정보 (天眼查)
  company_scale VARCHAR(50),
  registered_capital VARCHAR(50),
  registered_address TEXT,
  industry VARCHAR(100),
  tax_number VARCHAR(50),
  company_status VARCHAR(30),
  legal_person VARCHAR(50),
  established_date DATE,
  business_scope TEXT,
  
  -- 평가
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  price_score INTEGER CHECK (price_score BETWEEN 1 AND 10),
  service_score INTEGER CHECK (service_score BETWEEN 1 AND 10),
  recommendation_notes TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_suppliers_request ON market_research_suppliers(request_id);
CREATE INDEX idx_suppliers_name ON market_research_suppliers(supplier_name);
CREATE INDEX idx_suppliers_price ON market_research_suppliers(factory_price_rmb);
```

### 2.5 샘플링 서비스

#### sample_orders (샘플 주문)
```sql
CREATE TABLE public.sample_orders (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  research_id UUID REFERENCES market_research_requests(id),
  
  -- 공급업체
  supplier_name VARCHAR(200),
  supplier_contact VARCHAR(50),
  supplier_phone VARCHAR(30),
  
  -- 비용
  sample_making_cost DECIMAL(10,2),
  total_sample_cost DECIMAL(12,2),
  shipping_cost DECIMAL(10,2),
  
  -- 배송
  shipping_method VARCHAR(10) CHECK (shipping_method IN ('해운', '항공')),
  sample_receive_address TEXT,
  receiver_name VARCHAR(50),
  receiver_phone VARCHAR(30),
  
  -- 중국 내 배송
  factory_sample_invoice VARCHAR(100),
  factory_delivery_tracking VARCHAR(100),
  
  -- 국제 배송
  gz_sample_invoice_number VARCHAR(100),
  gz_delivery_tracking VARCHAR(100),
  international_tracking VARCHAR(100),
  
  -- 상태
  sample_status VARCHAR(30) DEFAULT 'ordered',
  received_at TIMESTAMPTZ,
  evaluation_result TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_samples_order ON sample_orders(order_id);
CREATE INDEX idx_samples_research ON sample_orders(research_id);
CREATE INDEX idx_samples_status ON sample_orders(sample_status);
```

#### sample_items (샘플 품목)
```sql
CREATE TABLE public.sample_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sample_order_id UUID NOT NULL REFERENCES sample_orders(id) ON DELETE CASCADE,
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  weight_kg DECIMAL(8,3),
  specifications TEXT,
  
  -- 평가
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  evaluation_notes TEXT,
  photos JSONB DEFAULT '[]',
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_items_sample ON sample_items(sample_order_id);
```

### 2.6 구매대행 서비스

#### purchasing_orders (구매대행 주문)
```sql
CREATE TABLE public.purchasing_orders (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 창고 정보
  warehouse_number VARCHAR(50),
  warehouse_location VARCHAR(100),
  
  -- 구매 정보
  purchase_type VARCHAR(20) CHECK (purchase_type IN ('B2B', '단일상품')),
  exchange_rate DECIMAL(8,4) NOT NULL,
  
  -- 비용 계산
  total_product_cost DECIMAL(12,2) NOT NULL,
  domestic_shipping DECIMAL(10,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  
  -- 배송 정보
  shipping_address TEXT NOT NULL,
  receiver_name VARCHAR(50) NOT NULL,
  receiver_phone VARCHAR(30) NOT NULL,
  postal_code VARCHAR(10),
  
  -- 통관
  customs_name VARCHAR(100) NOT NULL,
  customs_docs JSONB DEFAULT '[]',
  customs_clearance_status VARCHAR(30),
  
  -- 추가 정보
  marking_number VARCHAR(50),
  additional_requests TEXT,
  
  -- 상태
  purchase_status VARCHAR(30) DEFAULT 'pending',
  purchased_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_purchasing_order ON purchasing_orders(order_id);
CREATE INDEX idx_purchasing_warehouse ON purchasing_orders(warehouse_number);
CREATE INDEX idx_purchasing_status ON purchasing_orders(purchase_status);
```

#### purchase_items (구매 품목)
```sql
CREATE TABLE public.purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchasing_order_id UUID NOT NULL REFERENCES purchasing_orders(id) ON DELETE CASCADE,
  
  -- 제품 정보
  product_link TEXT,
  product_name VARCHAR(200) NOT NULL,
  options TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  
  -- 상태
  purchase_status VARCHAR(30) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_pitems_order ON purchase_items(purchasing_order_id);
```

### 2.7 배송대행 서비스

#### shipping_agency_orders (배송대행 주문)
```sql
CREATE TABLE public.shipping_agency_orders (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 고객 코드
  customer_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- 배송 정보
  shipping_number VARCHAR(50),
  customs_number VARCHAR(50),
  
  -- 창고 관리
  expected_packages INTEGER NOT NULL,
  received_packages INTEGER DEFAULT 0,
  storage_location VARCHAR(50),
  storage_start_date DATE,
  storage_end_date DATE,
  
  -- 묶음배송
  consolidated_boxes INTEGER,
  consolidation_request BOOLEAN DEFAULT false,
  consolidation_date DATE,
  
  -- 배송 상태
  shipping_status VARCHAR(30) DEFAULT '대기' CHECK (shipping_status IN (
    '대기', '입고', '포장', '출고', '배송중', '완료'
  )),
  delivery_memo TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_shipping_order ON shipping_agency_orders(order_id);
CREATE INDEX idx_shipping_code ON shipping_agency_orders(customer_code);
CREATE INDEX idx_shipping_status ON shipping_agency_orders(shipping_status);
```

#### shipping_items (배송 품목)
```sql
CREATE TABLE public.shipping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipping_order_id UUID NOT NULL REFERENCES shipping_agency_orders(id) ON DELETE CASCADE,
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(8,3),
  dimensions VARCHAR(50), -- 30x20x10
  tracking_number VARCHAR(100),
  
  -- 상태
  received_at TIMESTAMPTZ,
  package_condition VARCHAR(30),
  notes TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_sitems_order ON shipping_items(shipping_order_id);
CREATE INDEX idx_sitems_tracking ON shipping_items(tracking_number);
```

### 2.8 채팅 시스템

#### chat_messages (채팅 메시지)
```sql
CREATE TABLE public.chat_messages (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 발신자 정보
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(50) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  
  -- 메시지 내용
  original_message TEXT NOT NULL,
  original_language VARCHAR(2) NOT NULL CHECK (original_language IN ('ko', 'zh')),
  translated_message TEXT,
  translated_language VARCHAR(2) CHECK (translated_language IN ('ko', 'zh')),
  
  -- 메시지 타입
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN (
    'text', 'file', 'image', 'video', 'system'
  )),
  
  -- 파일 정보
  file_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  
  -- 상태
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_messages_order ON chat_messages(order_id);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);
```

#### chat_participants (채팅 참여자)
```sql
CREATE TABLE public.chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- 참여자 정보
  role VARCHAR(20) NOT NULL,
  display_name VARCHAR(50),
  
  -- 상태
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  typing BOOLEAN DEFAULT false,
  
  -- 참여 기록
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- 제약
  UNIQUE(order_id, user_id)
);

-- 인덱스
CREATE INDEX idx_participants_order ON chat_participants(order_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);
CREATE INDEX idx_participants_online ON chat_participants(is_online);
```

### 2.9 파일 관리

#### uploaded_files (업로드 파일)
```sql
CREATE TABLE public.uploaded_files (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- 파일 정보
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50),
  mime_type VARCHAR(100),
  
  -- 용도
  upload_purpose VARCHAR(30) NOT NULL CHECK (upload_purpose IN (
    'application', 'chat', 'report', 'quotation', 'invoice', 'customs'
  )),
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  -- 상태
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_files_order ON uploaded_files(order_id);
CREATE INDEX idx_files_uploader ON uploaded_files(uploaded_by);
CREATE INDEX idx_files_purpose ON uploaded_files(upload_purpose);
CREATE INDEX idx_files_created ON uploaded_files(created_at DESC);
```

### 2.10 보고서 관리

#### inspection_reports (검사 보고서)
```sql
CREATE TABLE public.inspection_reports (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 파일 정보
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  report_type VARCHAR(50),
  
  -- 상태
  status VARCHAR(30) DEFAULT 'uploaded' CHECK (status IN (
    'uploaded', 'processing', 'completed', 'approved'
  )),
  
  -- 업로드 정보
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 번역 정보
  translated_content JSONB,
  ai_analysis JSONB,
  translation_completed_at TIMESTAMPTZ,
  
  -- 승인 정보
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  report_url TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_reports_order ON inspection_reports(order_id);
CREATE INDEX idx_reports_status ON inspection_reports(status);
CREATE INDEX idx_reports_uploader ON inspection_reports(uploaded_by);
```

### 2.11 지원 시스템

#### customer_inquiries (고객 문의)
```sql
CREATE TABLE public.customer_inquiries (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number SERIAL,
  
  -- 문의 정보
  inquiry_channel VARCHAR(20) CHECK (inquiry_channel IN ('전화', '이메일', '웹')),
  customer_id UUID REFERENCES auth.users(id),
  customer_name VARCHAR(50),
  customer_email VARCHAR(100),
  customer_phone VARCHAR(30),
  
  -- 문의 내용
  inquiry_content TEXT NOT NULL,
  inquiry_files JSONB DEFAULT '[]',
  
  -- 처리 정보
  assigned_to UUID REFERENCES auth.users(id),
  response_content TEXT,
  response_files JSONB DEFAULT '[]',
  
  -- 상태
  status VARCHAR(20) DEFAULT '대기' CHECK (status IN ('대기', '처리중', '완료')),
  inquiry_date TIMESTAMPTZ DEFAULT NOW(),
  response_date TIMESTAMPTZ,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_inquiries_customer ON customer_inquiries(customer_id);
CREATE INDEX idx_inquiries_assigned ON customer_inquiries(assigned_to);
CREATE INDEX idx_inquiries_status ON customer_inquiries(status);
CREATE INDEX idx_inquiries_date ON customer_inquiries(inquiry_date DESC);
```

#### price_calculations (단가 계산)
```sql
CREATE TABLE public.price_calculations (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_number VARCHAR(30) UNIQUE, -- SY+날짜+일련번호
  user_id UUID REFERENCES auth.users(id),
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  unit_price_rmb DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  cbm DECIMAL(10,3),
  
  -- 거래 조건
  trade_terms VARCHAR(10) CHECK (trade_terms IN ('FOB', 'DDP', 'EXW')),
  export_port VARCHAR(50),
  
  -- 계산 결과
  exw_total DECIMAL(12,2),
  fob_total DECIMAL(12,2),
  commission DECIMAL(10,2),
  exchange_applied DECIMAL(8,4),
  tariff DECIMAL(10,2),
  customs_clearance DECIMAL(10,2),
  ddp_lcl DECIMAL(12,2),
  ddp_fcl DECIMAL(12,2),
  unit_price_ddp DECIMAL(10,2),
  
  -- 결제
  first_payment_amount DECIMAL(12,2),
  second_payment_estimate DECIMAL(12,2),
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_calculations_user ON price_calculations(user_id);
CREATE INDEX idx_calculations_number ON price_calculations(calculation_number);
```

### 2.12 로그 및 감사

#### process_logs (프로세스 로그 - 직원용)
```sql
CREATE TABLE public.process_logs (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- 프로세스 정보
  step_number INTEGER NOT NULL,
  processor VARCHAR(100) NOT NULL, -- 고객, 시스템, 담당자명
  process_node TEXT NOT NULL, -- 처리 내용
  process_result TEXT, -- 승인, 데이터 생성, 처리 취소 등
  process_feedback TEXT, -- 상세 설명
  
  -- 로그 타입
  log_type VARCHAR(20) CHECK (log_type IN ('system', 'manual', 'auto')),
  
  -- 내부 프로세스 (직원만 볼 수 있음)
  is_internal BOOLEAN DEFAULT false,
  internal_process VARCHAR(50) CHECK (internal_process IN (
    -- 자동화 프로세스
    'AUTO_MEMBER_REGISTRATION', 'ORDER_NUMBER_GENERATION',
    'AUTO_TRANSLATION', 'PRICE_CALCULATION', 'NOTIFICATION_SENT',
    -- 데이터 처리
    'DATA_VALIDATION', 'FILE_PROCESSING', 'BACKUP_CREATED',
    -- 연동 프로세스
    'API_CALL', 'WEBHOOK_RECEIVED', 'SYNC_COMPLETED'
  )),
  
  -- 시스템
  process_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 인덱스
CREATE INDEX idx_logs_order ON process_logs(order_id);
CREATE INDEX idx_logs_processor ON process_logs(processor);
CREATE INDEX idx_logs_time ON process_logs(process_time DESC);
CREATE INDEX idx_logs_internal ON process_logs(is_internal);
```

#### activity_logs (활동 로그)
```sql
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  -- 활동 정보
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- 상세 정보
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
```

### 2.13 AI 및 워크플로우 시스템 ⭐ (2025-01-27 추가)

#### workflow_events (워크플로우 이벤트)
```sql
CREATE TABLE public.workflow_events (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  
  -- 이벤트 정보
  event_type VARCHAR(50) NOT NULL, -- state_transition, action_trigger, error_occurred
  event_name VARCHAR(100) NOT NULL,
  from_state VARCHAR(50),
  to_state VARCHAR(50),
  
  -- 실행 정보
  triggered_by UUID REFERENCES auth.users(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- 결과
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- 메타데이터
  context JSONB DEFAULT '{}',
  actions_taken JSONB DEFAULT '[]',
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workflow_order ON workflow_events(order_id);
CREATE INDEX idx_workflow_status ON workflow_events(status);
CREATE INDEX idx_workflow_service ON workflow_events(service_type);
CREATE INDEX idx_workflow_created ON workflow_events(created_at DESC);
```

#### ai_translation_cache (AI 번역 캐시)
```sql
CREATE TABLE public.ai_translation_cache (
  -- 기본 정보
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 원문 정보
  original_text TEXT NOT NULL,
  original_language VARCHAR(2) NOT NULL CHECK (original_language IN ('ko', 'zh', 'en')),
  text_hash VARCHAR(64) NOT NULL, -- SHA256 해시로 중복 체크
  
  -- 번역 정보
  translated_text TEXT NOT NULL,
  target_language VARCHAR(2) NOT NULL CHECK (target_language IN ('ko', 'zh', 'en')),
  
  -- AI 정보
  model_name VARCHAR(50) NOT NULL, -- gpt-4, gpt-3.5-turbo 등
  model_version VARCHAR(20),
  prompt_template TEXT,
  
  -- 품질 및 사용 정보
  confidence_score DECIMAL(3,2), -- 0.00 ~ 1.00
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 컨텍스트
  context_type VARCHAR(50), -- chat_message, product_description, report 등
  domain VARCHAR(50), -- inspection, trading, shipping 등
  
  -- 비용 정보
  tokens_used INTEGER,
  cost_usd DECIMAL(6,4),
  
  -- 시스템
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 인덱스
CREATE UNIQUE INDEX idx_translation_hash ON ai_translation_cache(text_hash, target_language);
CREATE INDEX idx_translation_context ON ai_translation_cache(context_type);
CREATE INDEX idx_translation_usage ON ai_translation_cache(usage_count DESC);
CREATE INDEX idx_translation_expires ON ai_translation_cache(expires_at);

-- 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_translations()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_translation_cache
  WHERE expires_at < NOW()
  OR (usage_count = 1 AND created_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;
```

---

## 3. 관계 정의

### 3.1 ER 다이어그램
```
users (1) ─────┬─── (N) user_profiles
               │
               ├─── (N) orders
               │         │
               │         ├─── (1) china_business_trips
               │         ├─── (1) market_research_requests
               │         │         └─── (N) market_research_suppliers
               │         ├─── (1) sample_orders
               │         │         └─── (N) sample_items
               │         ├─── (1) purchasing_orders
               │         │         └─── (N) purchase_items
               │         ├─── (1) shipping_agency_orders
               │         │         └─── (N) shipping_items
               │         └─── (N) workflow_events ⭐ NEW
               │
               ├─── (N) chat_messages
               ├─── (N) chat_participants
               ├─── (N) uploaded_files
               ├─── (N) inspection_reports
               ├─── (N) activity_logs
               └─── (N) workflow_events (triggered_by)

ai_translation_cache ⭐ NEW (독립 테이블 - 캐싱 전용)

orders (1) ────┬─── (N) process_logs
               ├─── (N) chat_messages
               ├─── (N) uploaded_files
               └─── (N) inspection_reports
```

### 3.2 외래키 제약
```sql
-- 기본 CASCADE 정책
ON DELETE CASCADE -- 부모 삭제 시 자식도 삭제
ON UPDATE CASCADE -- 부모 수정 시 자식도 수정

-- 예외: 사용자 관련
ON DELETE SET NULL -- 사용자 삭제 시 NULL 설정 (이력 보존)

-- 예외: 중요 참조
ON DELETE RESTRICT -- 삭제 방지 (무결성 보호)
```

---

## 4. 인덱스 전략

### 4.1 기본 인덱스
```sql
-- Primary Key는 자동 인덱스 생성
-- Foreign Key는 자동 인덱스 생성 (PostgreSQL 기본)

-- 추가 인덱스: 자주 조회되는 컬럼
CREATE INDEX idx_table_column ON table(column);

-- 복합 인덱스: WHERE 절에 함께 사용되는 컬럼
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 부분 인덱스: 특정 조건만 인덱싱
CREATE INDEX idx_orders_pending ON orders(status) 
WHERE status IN ('submitted', 'quoted', 'payment_pending');

-- 함수 인덱스: 계산된 값 인덱싱
CREATE INDEX idx_orders_month ON orders(DATE_TRUNC('month', created_at));
```

### 4.2 성능 최적화 인덱스
```sql
-- 정렬용 인덱스
CREATE INDEX idx_orders_created_desc ON orders(created_at DESC);

-- 텍스트 검색용 인덱스
CREATE INDEX idx_suppliers_name_gin ON market_research_suppliers 
USING gin(to_tsvector('simple', supplier_name));

-- JSONB 인덱스
CREATE INDEX idx_files_metadata ON uploaded_files USING gin(metadata);

-- 범위 검색 인덱스
CREATE INDEX idx_orders_date_range ON orders(created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 5. RLS 정책

### 5.1 기본 정책 구조
```sql
-- 정책 생성 템플릿
CREATE POLICY "policy_name" ON table_name
FOR operation -- SELECT, INSERT, UPDATE, DELETE, ALL
TO role_name -- public, authenticated, service_role
USING (condition) -- SELECT, DELETE
WITH CHECK (condition); -- INSERT, UPDATE
```

### 5.2 오더 관련 정책
```sql
-- 고객: 자신의 오더만 조회
CREATE POLICY "customers_own_orders" ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 고객: 자신의 오더만 생성
CREATE POLICY "customers_create_orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'customer'
  )
);

-- 중국직원: 배정된 오더만 조회/수정
CREATE POLICY "staff_assigned_orders" ON orders
FOR ALL
TO authenticated
USING (
  auth.uid() = assigned_staff OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'chinese_staff'
  )
);

-- 한국팀/관리자: 모든 오더 접근
CREATE POLICY "korean_team_all_orders" ON orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
);
```

### 5.3 채팅 관련 정책
```sql
-- 채팅 참여자만 메시지 조회
CREATE POLICY "chat_participants_messages" ON chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE order_id = chat_messages.order_id
    AND user_id = auth.uid()
  )
);

-- 채팅 참여자만 메시지 전송
CREATE POLICY "chat_participants_send" ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE order_id = chat_messages.order_id
    AND user_id = auth.uid()
  )
);
```

### 5.4 파일 관련 정책
```sql
-- 파일 업로더만 삭제 가능
CREATE POLICY "file_uploader_delete" ON uploaded_files
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);

-- 오더 관련자만 파일 조회
CREATE POLICY "order_participants_files" ON uploaded_files
FOR SELECT
TO authenticated
USING (
  -- 오더 소유자
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = uploaded_files.order_id
    AND user_id = auth.uid()
  ) OR
  -- 담당 직원
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = uploaded_files.order_id
    AND assigned_staff = auth.uid()
  ) OR
  -- 한국팀
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('korean_team', 'admin')
  )
);
```

### 5.5 RLS 성능 최적화 ⭐ (2025-01-27 추가)

#### 5.5.1 성능 문제 진단
```sql
-- RLS 정책 성능 테스트
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user_id_here", "role": "authenticated"}';
EXPLAIN ANALYZE SELECT COUNT(*) FROM orders;
RESET ROLE;
```

#### 5.5.2 최적화 전략

**1. auth.uid() 함수 캐싱**
```sql
-- ❌ 비효율적: 각 행마다 auth.uid() 호출
CREATE POLICY "bad_policy" ON orders
USING (auth.uid() = user_id);

-- ✅ 효율적: SELECT로 감싸서 한 번만 실행
CREATE POLICY "good_policy" ON orders
USING ((SELECT auth.uid()) = user_id);
```

**2. Security Definer 함수 활용**
```sql
-- 사용자 역할 캐싱 함수
CREATE OR REPLACE FUNCTION get_user_role_cached() 
RETURNS user_role 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- 스태프 확인 최적화 함수
CREATE OR REPLACE FUNCTION is_staff_cached() 
RETURNS boolean 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('chinese_staff', 'korean_team', 'admin')
  )
$$;
```

**3. 복합 인덱스 전략**
```sql
-- 자주 함께 사용되는 컬럼들
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_messages_order_created ON chat_messages(order_id, created_at DESC);

-- 부분 인덱스로 효율성 증대
CREATE INDEX idx_orders_active ON orders(user_id, created_at DESC) 
WHERE status IN ('submitted', 'quoted', 'payment_pending', 'in_progress');
```

**4. JOIN 최소화**
```sql
-- ❌ 비효율적: RLS 내부에서 JOIN
CREATE POLICY "bad_join_policy" ON orders
USING (
  auth.uid() IN (
    SELECT user_id FROM team_members 
    WHERE team_id = orders.team_id
  )
);

-- ✅ 효율적: IN 절로 변환
CREATE POLICY "good_join_policy" ON orders
USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = (SELECT auth.uid())
  )
);
```

**5. 클라이언트 필터 추가**
```javascript
// RLS만 의존하지 말고 클라이언트에서도 필터링
const { data } = await supabase
  .from('orders')
  .select()
  .eq('user_id', userId); // 명시적 필터 추가
```

#### 5.5.3 성능 벤치마크 목표
| 쿼리 타입 | 최적화 전 | 최적화 후 | 개선율 |
|-----------|-----------|-----------|--------|
| 단순 SELECT | ~200ms | <50ms | 75% |
| JOIN 포함 | ~500ms | <150ms | 70% |
| 집계 쿼리 | ~1000ms | <300ms | 70% |

---

## 6. 트리거 및 함수

### 6.1 자동 타임스탬프
```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 오더번호 생성
```sql
-- 오더번호 시퀀스
CREATE SEQUENCE order_number_seq;

-- 오더번호 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part := LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  RETURN 'DL-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- 트리거로 자동 생성
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();
```

### 6.3 상태 변경 로그
```sql
-- 상태 변경 시 자동 로그
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO process_logs (
      order_id,
      step_number,
      processor,
      process_node,
      process_result,
      log_type
    ) VALUES (
      NEW.id,
      (SELECT COALESCE(MAX(step_number), 0) + 1 FROM process_logs WHERE order_id = NEW.id),
      current_setting('app.current_user', true),
      '상태 변경',
      OLD.status || ' → ' || NEW.status,
      'system'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();
```

### 6.4 자동 직원 배정
```sql
-- 업무량 기반 자동 배정
CREATE OR REPLACE FUNCTION auto_assign_staff()
RETURNS TRIGGER AS $$
DECLARE
  staff_id UUID;
BEGIN
  -- 업무량이 가장 적은 중국직원 찾기
  SELECT user_id INTO staff_id
  FROM user_profiles up
  LEFT JOIN (
    SELECT assigned_staff, COUNT(*) as workload
    FROM orders
    WHERE status NOT IN ('completed', 'cancelled')
    GROUP BY assigned_staff
  ) w ON up.user_id = w.assigned_staff
  WHERE up.role = 'chinese_staff'
  AND up.approval_status = 'approved'
  ORDER BY COALESCE(w.workload, 0) ASC
  LIMIT 1;
  
  -- 배정
  NEW.assigned_staff := staff_id;
  
  -- 로그
  INSERT INTO process_logs (
    order_id, step_number, processor, 
    process_node, process_result, log_type, is_internal
  ) VALUES (
    NEW.id, 1, '시스템', 
    '자동 직원 배정', staff_id::TEXT, 'auto', true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_staff_on_create
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.assigned_staff IS NULL)
  EXECUTE FUNCTION auto_assign_staff();
```

---

## 7. 데이터 마이그레이션

### 7.1 초기 데이터
```sql
-- 기본 관리자 계정
INSERT INTO auth.users (email, raw_user_meta_data)
VALUES ('admin@duly.co.kr', '{"role": "admin"}');

-- 역할별 테스트 계정
INSERT INTO user_profiles (user_id, role, company_name, contact_person, phone)
VALUES
  ('customer-uuid', 'customer', '테스트고객사', '김고객', '010-1111-1111'),
  ('chinese-uuid', 'chinese_staff', '두리무역', '왕직원', '010-2222-2222'),
  ('korean-uuid', 'korean_team', '두리무역', '박한국', '010-3333-3333');

-- 기본 설정 데이터
INSERT INTO system_settings (key, value, description)
VALUES
  ('exchange_rate', '180', 'CNY to KRW 환율'),
  ('commission_rate', '0.05', '기본 수수료율'),
  ('daily_inspection_rate', '290000', '검품 일일 단가');
```

### 7.2 마이그레이션 스크립트
```sql
-- V1__initial_schema.sql
-- 모든 CREATE TABLE 문

-- V2__add_indexes.sql
-- 모든 CREATE INDEX 문

-- V3__add_rls_policies.sql
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY
-- 모든 CREATE POLICY 문

-- V4__add_triggers.sql
-- 모든 CREATE FUNCTION 및 CREATE TRIGGER 문

-- V5__seed_data.sql
-- 초기 데이터 INSERT 문
```

---

## 8. 백업 및 복구

### 8.1 백업 전략
```bash
# 일일 전체 백업
pg_dump -h localhost -U postgres -d duly_trading > backup_$(date +%Y%m%d).sql

# 증분 백업 (WAL 아카이빙)
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# Point-in-Time Recovery 설정
recovery_target_time = '2025-01-26 12:00:00'
```

### 8.2 복구 절차
```bash
# 전체 복구
psql -h localhost -U postgres -d duly_trading < backup_20250126.sql

# 특정 테이블 복구
pg_restore -t orders -d duly_trading backup_20250126.dump

# 트랜잭션 로그 재생
pg_wal_replay_resume()
```

### 8.3 모니터링
```sql
-- 테이블 크기 모니터링
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 인덱스 사용률
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 슬로우 쿼리
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;
```

---

## 📊 용량 예측

### 연간 데이터 증가량
| 테이블 | 일일 | 월간 | 연간 | 5년 |
|--------|------|------|------|-----|
| orders | 50건 | 1,500건 | 18,000건 | 90,000건 |
| chat_messages | 500건 | 15,000건 | 180,000건 | 900,000건 |
| uploaded_files | 200건 | 6,000건 | 72,000건 | 360,000건 |
| process_logs | 1,000건 | 30,000건 | 360,000건 | 1,800,000건 |

### 스토리지 요구사항
- 데이터베이스: 100GB (5년)
- 파일 스토리지: 1TB (5년)
- 백업: 2TB (전체+증분)

---

*본 문서는 두리무역 디지털 전환 프로젝트의 데이터베이스 설계를 담은 공식 문서입니다.*