# 📋 공장컨택(factory_contact_requests) 필드 사용 현황

## 🔍 실제 Supabase 테이블 컬럼 (27개)

### 📌 기본 테이블 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 (/application/factory-contact) | 고객 조회 (/dashboard/orders/factory-contact) | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **id** | uuid | NO | gen_random_uuid() | - | ✓ (숨김) | ✓ (숨김) | ✓ (숨김) | 시스템 자동 |
| **reservation_number** | varchar | NO | - | 자동생성 | "오더번호" 표시 | "订单号" 표시 | "오더번호" 표시 | FC-YYYYMMDD-XXXXXX |
| **user_id** | uuid | YES | - | 자동 | - | - | - | 사용자 연결 |
| **company_name** | varchar | NO | - | "회사명" 입력 | "회사명" 표시 | "公司名" 표시 | "회사명" 표시 | |
| **contact_person** | varchar | NO | - | "담당자명" 입력 | "담당자" 표시 | "联系人" 표시 | "담당자" 표시 | |
| **contact_phone** | varchar | NO | - | "연락처" 입력 | "연락처" 표시 | "电话" 표시 | "연락처" 표시 | |
| **contact_email** | varchar | NO | - | "이메일" 입력 | "이메일" 표시 | "邮箱" 표시 | "이메일" 표시 | |
| **status** | varchar | YES | 'submitted' | 자동 | 상태 칩 표시 | 중국어 상태 표시 | 한국어 상태 표시 | |
| **payment_status** | varchar | YES | 'pending' | - | "결제 상태" 표시 | "支付状态" 표시 | "결제 상태" 표시 | |
| **assigned_chinese_staff** | uuid | YES | - | - | - | ✓ (숨김) | ✓ (숨김) | 담당 중국직원 |
| **created_at** | timestamp | YES | now() | 자동 | "신청일" 표시 | "申请日期" 표시 | "신청일" 표시 | |
| **updated_at** | timestamp | YES | now() | 자동 | - | - | - | 수정일시 |
| **selected_quotation_pdf** | text | YES | - | - | "선택된 견적서" 표시 | "已选报价单" 표시 | "선택된 견적서" 표시 | Staff 처리 |
| **payment_amount** | numeric | YES | - | - | "결제금액" 표시 | "支付金额" 표시 | "결제금액" 표시 | 자동설정 |
| **files** | jsonb | YES | - | "첨부파일" 업로드 | - | - | - | uploaded_files 연동 |

### 📦 제품 정보 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **product_name** | varchar | NO | - | "제품명" 입력 | "제품명" 표시 | **product_name_chinese** 표시 | "제품명" 표시 | 중국 직원은 번역본 |
| **product_name_chinese** | varchar | YES | - | - | - | "产品名" (번역된 값) | - | 자동번역 |
| **product_description** | text | YES | - | "제품설명" 입력 | "제품설명" 표시 | **product_description_chinese** 표시 | "제품설명" 표시 | 중국 직원은 번역본 |
| **product_description_chinese** | text | YES | - | - | - | "产品说明" (번역된 값) | - | 자동번역 |
| **request_type** | jsonb | YES | - | 체크박스 선택 | "요청타입" 표시 | "请求类型" 표시 | "요청타입" 표시 | {sample, bulk_order} |
| **special_requirements** | text | YES | - | "특별요구사항" 입력 | "특별요구사항" 표시 | **special_requirements_chinese** 표시 | "특별요구사항" 표시 | 중국 직원은 번역본 |
| **special_requirements_chinese** | text | YES | - | - | - | "特殊要求" (번역된 값) | - | 자동번역 |

### 🏭 공장 정보 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **factory_name** | varchar | YES | - | "공장명" 입력 | "공장명" 표시 | "工厂名" 표시 | "공장명" 표시 | 원래 중국어 |
| **factory_contact_person** | varchar | YES | - | "공장 담당자" 입력 | "공장 담당자" 표시 | "工厂联系人" 표시 | "공장 담당자" 표시 | 원래 중국어 |
| **factory_contact_phone** | varchar | YES | - | "공장 연락처" 입력 | "공장 연락처" 표시 | "工厂电话" 표시 | "공장 연락처" 표시 | |
| **factory_address** | text | YES | - | "공장 주소" 입력 | "공장 주소" 표시 | "工厂地址" 표시 | "공장 주소" 표시 | 원래 중국어 |

## 📊 연관 테이블

### 🔔 confirmation_requests (확인 요청) - 32개 필드

| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **id** | uuid | NO | gen_random_uuid() | - | ✓ (숨김) | ✓ (숨김) | ✓ (숨김) | 고유 ID |
| **reservation_number** | varchar | NO | - | - | ✓ | ✓ | ✓ | 예약번호 (FK) |
| **request_type** | varchar | NO | - | - | "요청 유형" 표시 | "请求类型" 입력 | "요청 유형" 표시 | |
| **status** | varchar | YES | 'pending' | - | "대기중/응답완료" 표시 | "待处理/已回复" 표시 | "대기중/응답완료" 표시 | pending/responded |
| **is_urgent** | boolean | YES | false | - | "긴급" 뱃지 표시 | "紧急" 체크박스 | "긴급" 체크박스 | |
| **deadline** | timestamp | YES | - | - | "응답 기한" 표시 | "回复期限" 입력 | "응답 기한" 표시 | |
| **created_by** | uuid | YES | - | - | - | 자동 | 자동 | 중국직원 ID |
| **created_at** | timestamp | YES | now() | - | "요청일" 표시 | "请求日期" 표시 | "요청일" 표시 | |
| **updated_at** | timestamp | YES | now() | - | - | - | - | |
| **responded_at** | timestamp | YES | - | - | "응답일시" 표시 | "回复时间" 표시 | "응답일시" 표시 | |
| **selected_option_id** | varchar | YES | - | 선택 | "선택된 옵션" 표시 | "已选选项" 표시 | "선택된 옵션" 표시 | |
| **attachments** | jsonb | YES | - | - | 파일 표시 | "附件" 업로드 | 파일 표시 | |
| **parent_request_id** | uuid | YES | - | - | - | - | - | 상위 요청 ID |
| **related_order_type** | varchar | YES | - | - | - | 'factory_contact' 자동 | 'factory_contact' 자동 | |

#### 중국직원 작성 필드 (번역 필요)
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **title** | varchar | NO | - | - | - | - | - | 원본 (미사용) |
| **title_chinese** | varchar | YES | - | - | - | "标题" 입력 | - | 중국직원 입력 |
| **title_korean** | varchar | YES | - | - | "제목" 표시 | - | "제목" 표시 | 자동번역 |
| **description** | text | NO | - | - | - | - | - | 원본 (미사용) |
| **description_chinese** | text | YES | - | - | - | "说明" 입력 | - | 중국직원 입력 |
| **description_korean** | text | YES | - | - | "설명" 표시 | - | "설명" 표시 | 자동번역 |
| **options** | jsonb | YES | - | - | - | - | - | 원본 (미사용) |
| **options_chinese** | jsonb | YES | - | - | - | "选项" 입력 | - | 중국직원 입력 |
| **options_korean** | jsonb | YES | - | - | "선택지" 표시 | - | "선택지" 표시 | 자동번역 |

#### 고객 응답 필드 (번역 필요)
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **customer_response** | varchar | YES | - | - | - | - | - | 원본 (미사용) |
| **customer_response_original** | varchar | YES | - | "응답" 선택 | "응답" 표시 | - | "응답" 표시 | 한국어 원본 |
| **customer_response_translated** | varchar | YES | - | - | - | "客户回复" 표시 | - | 자동번역 |
| **customer_comment** | text | YES | - | "코멘트" 입력 | "코멘트" 표시 | - | "코멘트" 표시 | 한국어 원본 |
| **customer_comment_original** | text | YES | - | - | - | - | - | 동일 (중복) |
| **customer_comment_translated** | text | YES | - | - | - | "客户评论" 표시 | - | 자동번역 |

#### 언어/역할 추적 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **sender_role** | varchar | YES | - | - | - | 'chinese_staff' 자동 | 'korean_team' 자동 | |
| **sender_language** | varchar | YES | - | - | - | 'zh' 자동 | 'ko' 자동 | |
| **response_language** | varchar | YES | - | 'ko' 자동 | - | - | - | |

### 💰 factory_contact_quotations (견적서) - 25개 필드

| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **id** | uuid | NO | gen_random_uuid() | - | ✓ (숨김) | ✓ (숨김) | ✓ (숨김) | 고유 ID |
| **reservation_number** | varchar | NO | - | - | ✓ | ✓ | ✓ | 예약번호 (FK) |
| **quotation_number** | varchar | NO | - | - | "견적번호" 표시 | "报价单号" 입력 | "견적번호" 표시 | |
| **quotation_date** | date | YES | CURRENT_DATE | - | "견적일자" 표시 | "报价日期" 표시 | "견적일자" 표시 | |
| **created_by** | uuid | YES | - | - | - | 자동 | 자동 | 중국직원 ID |
| **created_at** | timestamp | YES | now() | - | - | - | - | |
| **updated_at** | timestamp | YES | now() | - | - | - | - | |

#### 공급자 정보
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **supplier_name** | varchar | YES | - | - | "공급자명" 표시 | - | "공급자명" 입력/표시 | 한국어 |
| **supplier_name_chinese** | varchar | YES | - | - | - | "供应商名" 입력 | - | 중국어 |

#### 가격 정보
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **unit_price** | numeric | YES | - | - | "단가" 표시 | "单价" 입력 | "단가" 입력/표시 | |
| **quantity** | integer | YES | - | - | "수량" 표시 | "数量" 입력 | "수량" 입력/표시 | |
| **total_amount** | numeric | YES | - | - | "총액" 표시 | 자동계산 표시 | 자동계산 표시 | unit_price * quantity |
| **vat_amount** | numeric | YES | - | - | "VAT" 표시 | 자동계산 표시 | 자동계산 표시 | total_amount * 0.1 |
| **final_amount** | numeric | YES | - | - | "최종금액" 표시 | 자동계산 표시 | 자동계산 표시 | total_amount + vat_amount |
| **currency** | varchar | YES | 'KRW' | - | "통화" 표시 | "货币" 표시 | "통화" 표시 | KRW 고정 |

#### 조건 정보
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **delivery_terms** | text | YES | - | - | "배송조건" 표시 | - | "배송조건" 입력/표시 | 한국어 |
| **delivery_terms_chinese** | text | YES | - | - | - | "交货条件" 입력 | - | 중국어 |
| **payment_terms** | text | YES | - | - | "결제조건" 표시 | - | "결제조건" 입력/표시 | 한국어 |
| **payment_terms_chinese** | text | YES | - | - | - | "付款条件" 입력 | - | 중국어 |
| **validity_period** | integer | YES | 30 | - | "유효기간" 표시 | "有效期" 입력 | "유효기간" 입력/표시 | 일 단위 |
| **quotation_pdf** | text | YES | - | - | PDF 다운로드 | "报价单PDF" 업로드 | PDF 다운로드 | |

#### 기타
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **is_selected** | boolean | YES | false | 선택 버튼 | "선택됨" 표시 | "已选择" 표시 | "선택됨" 표시 | 고객 선택 |
| **notes** | text | YES | - | - | "비고" 표시 | - | "비고" 입력/표시 | 한국어 |
| **notes_chinese** | text | YES | - | - | - | "备注" 입력 | - | 중국어 |

## 📊 주요 필드별 사용 현황

### 🌐 중국 직원 화면 (/staff/orders/factory-contact/[reservationNumber])

| 단계 | 작업 내용 | 입력/생성 필드 | 자동 처리 |
|------|----------|--------------|-----------|
| **1. 신청서 확인** | 고객 요청 확인 | - | product_name_chinese, product_description_chinese, special_requirements_chinese (자동번역) |
| **2. 공장 정보 입력** | 공장 연락 | factory_name, factory_contact_person, factory_contact_phone, factory_address | - |
| **3. 확인 요청 생성** | confirmation_requests 생성 | title_chinese, description_chinese, options_chinese, deadline, is_urgent | title_korean, description_korean, options_korean (자동번역) |
| **4. 견적서 생성** | factory_contact_quotations 생성 | supplier_name_chinese, unit_price, quantity, delivery_terms_chinese, payment_terms_chinese, notes_chinese | total_amount, vat_amount, final_amount (자동계산) |
| **5. 고객 응답 처리** | 고객 선택 확인 | - | customer_response_translated, customer_comment_translated (자동번역) |
| **6. 최종 처리** | 견적서 PDF 생성 | quotation_pdf, selected_quotation_pdf | payment_amount (선택된 견적 기준) |

### 🇰🇷 한국 직원 화면 (동일 경로, isChineseStaff=false)

| 표시 언어 | 중국 직원 | 한국 직원 |
|-----------|----------|----------|
| **제품명** | product_name_chinese | product_name |
| **제품설명** | product_description_chinese | product_description |
| **요구사항** | special_requirements_chinese | special_requirements |
| **확인요청 제목** | title_chinese | title_korean |
| **확인요청 설명** | description_chinese | description_korean |
| **확인요청 옵션** | options_chinese | options_korean |
| **견적 공급자** | supplier_name_chinese | supplier_name |
| **배송조건** | delivery_terms_chinese | delivery_terms |
| **결제조건** | payment_terms_chinese | payment_terms |
| **비고** | notes_chinese | notes |

### 📋 고객 조회 페이지 (/dashboard/orders/factory-contact/[reservationNumber])

| 탭 | 표시 필드 | 설명 |
|----|----------|------|
| **기본정보** | company_name, contact_*, product_name, product_description, request_type, special_requirements, factory_* | 신청 정보 |
| **컨펌대기** | confirmation_requests 테이블 조회 - title_korean, description_korean, options_korean, deadline, is_urgent | 확인 요청 목록 |
| **견적확인** | factory_contact_quotations 테이블 조회 - supplier_name, unit_price, quantity, total_amount, vat_amount, final_amount, delivery_terms, payment_terms | 견적서 목록 |
| **진행상황** | status, payment_status, payment_amount, selected_quotation_pdf | 현재 상태 |

## 💰 자동 계산 로직

```typescript
// factory_contact_quotations 자동 계산
total_amount = unit_price * quantity
vat_amount = total_amount * 0.1
final_amount = total_amount + vat_amount

// 고객이 견적 선택 시
if (quotation.is_selected) {
  factory_contact_requests.payment_amount = quotation.final_amount
  factory_contact_requests.selected_quotation_pdf = quotation.quotation_pdf
  factory_contact_requests.status = 'quoted'
}
```

## 🔄 자동 번역 처리

```typescript
// 1. 고객 입력 시 (한국어 → 중국어)
async function onCustomerSubmit(data) {
  const translated = await translateToChhinese({
    product_name: data.product_name,
    product_description: data.product_description,
    special_requirements: data.special_requirements
  })
  
  await supabase.from('factory_contact_requests').insert({
    ...data,
    product_name_chinese: translated.product_name,
    product_description_chinese: translated.product_description,
    special_requirements_chinese: translated.special_requirements
  })
}

// 2. 중국직원 확인요청 생성 시 (중국어 → 한국어)
async function createConfirmationRequest(data) {
  const translated = await translateToKorean({
    title: data.title_chinese,
    description: data.description_chinese,
    options: data.options_chinese
  })
  
  await supabase.from('confirmation_requests').insert({
    ...data,
    title_korean: translated.title,
    description_korean: translated.description,
    options_korean: translated.options,
    sender_role: 'chinese_staff',
    sender_language: 'zh'
  })
}

// 3. 고객 응답 시 (한국어 → 중국어)
async function submitCustomerResponse(data) {
  const translated = await translateToChinese({
    response: data.customer_response,
    comment: data.customer_comment
  })
  
  await supabase.from('confirmation_requests').update({
    customer_response_original: data.customer_response,
    customer_response_translated: translated.response,
    customer_comment_original: data.customer_comment,
    customer_comment_translated: translated.comment,
    response_language: 'ko',
    status: 'responded',
    responded_at: new Date()
  }).eq('id', requestId)
}
```

## 🚀 상태별 진행 단계

### 중국 직원 화면
```
待处理 (대기) → 工厂联系中 (공장연락중) → 确认请求中 (확인요청중) → 报价完成 (견적완료) → 已付款 (결제완료) → 完成 (완료)
```

### 한국 직원 화면
```
대기중 → 공장연락중 → 확인요청중 → 견적완료 → 결제완료 → 완료
```

### 고객 화면
```
접수완료 → 공장확인중 → 컨펌대기 → 견적확인 → 결제대기 → 완료
```

## ✅ 핵심 구현 포인트

### 1. **번역 자동화**
- 고객 입력 → 중국어 자동번역 (product_*, special_requirements)
- 중국직원 입력 → 한국어 자동번역 (title, description, options)
- 고객 응답 → 중국어 자동번역 (response, comment)

### 2. **확인 요청 워크플로우**
```
중국직원 생성 → 고객 알림 → 고객 응답 → 중국직원 확인 → 다음 단계
```

### 3. **견적서 관리**
- 여러 개의 견적서 생성 가능
- 고객이 하나 선택 → is_selected = true
- 선택된 견적 → payment_amount 자동 설정

### 4. **권한별 접근**
- 중국 직원: 모든 필드 편집 가능
- 한국 직원: 모든 필드 조회, 필요시 편집
- 고객: 읽기 전용, 확인요청 응답만 가능

### 5. **파일 처리**
- files: uploaded_files 테이블 연동
- quotation_pdf: 견적서 PDF 저장
- selected_quotation_pdf: 최종 선택된 견적서

## 🔍 Query 조건 예시

```sql
-- 중국 직원용 조회
SELECT * FROM factory_contact_requests
WHERE assigned_chinese_staff = $1 
OR (assigned_chinese_staff IS NULL AND status = 'submitted')
ORDER BY created_at DESC;

-- 확인 요청 조회 (고객용)
SELECT 
  id, reservation_number, request_type,
  title_korean as title,
  description_korean as description,
  options_korean as options,
  deadline, is_urgent, status
FROM confirmation_requests
WHERE reservation_number = $1
AND status = 'pending'
ORDER BY created_at DESC;

-- 견적서 조회 (고객용)
SELECT 
  id, quotation_number, quotation_date,
  supplier_name, unit_price, quantity,
  total_amount, vat_amount, final_amount,
  delivery_terms, payment_terms,
  validity_period, is_selected
FROM factory_contact_quotations
WHERE reservation_number = $1
ORDER BY created_at DESC;

-- 상태 업데이트 (견적 선택 시)
UPDATE factory_contact_requests
SET 
  payment_amount = $1,
  selected_quotation_pdf = $2,
  status = 'quoted',
  updated_at = now()
WHERE reservation_number = $3;
```

## ⚠️ 주의사항

### 필수 연동 사항
1. **자동번역 API**: GPT-4 또는 Google Translate API
2. **PDF 생성**: 견적서 PDF 자동 생성 라이브러리
3. **알림 시스템**: 확인요청 생성 시 고객 알림

### 데이터 일관성
- confirmation_requests와 factory_contact_requests는 reservation_number로 연결
- factory_contact_quotations도 reservation_number로 연결
- 모든 번역 필드는 원본과 쌍으로 관리

### 상태 전환 규칙
```
submitted → in_progress (중국직원 할당 시)
in_progress → confirming (확인요청 생성 시)
confirming → quoted (견적서 생성 시)
quoted → paid (결제 확인 시)
paid → completed (최종 완료)
```

## 📝 추가 필요 사항 (문서 기준)

### 현재 DB에 없지만 필요한 필드
1. **견적서 PDF** (selected_quotation_pdf) - ✅ 이미 있음
2. **결제금액** (payment_amount) - ✅ 이미 있음
3. **제품 중국어 번역** (product_name_chinese 등) - ✅ 이미 있음

### 구현 필요 기능
1. 확인요청 생성 UI (중국직원용)
2. 확인요청 응답 UI (고객용)
3. 견적서 생성 및 관리 UI
4. 견적서 선택 및 결제 프로세스
5. PDF 자동 생성 시스템