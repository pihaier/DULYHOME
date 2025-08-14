# 📋 검품감사(inspection_applications) 필드 사용 현황

## 🔍 실제 Supabase 테이블 컬럼 (37개)

| 컬럼명 | 타입 | Nullable | 기본값 | 사용처 |
|--------|------|----------|--------|--------|
| **id** | uuid | NO | gen_random_uuid() | 시스템 자동 |
| **reservation_number** | text | NO | - | 예약번호 |
| **user_id** | uuid | NO | - | 사용자 연결 |
| **company_name** | text | NO | - | 회사명 |
| **contact_person** | text | NO | - | 담당자 |
| **contact_phone** | text | NO | - | 연락처 |
| **contact_email** | text | YES | - | 이메일 |
| **service_type** | text | NO | - | 서비스 타입 |
| **service_subtype** | text | YES | - | 서브타입 (미사용) |
| **product_name** | text | NO | - | 제품명 |
| **product_name_translated** | text | YES | - | 제품명 번역 (중국직원용) |
| **production_quantity** | integer | YES | 0 | 생산수량 |
| **special_requirements** | text | YES | - | 특별요구사항 |
| **special_requirements_translated** | text | YES | - | 요구사항 번역 (중국직원용) |
| **status** | text | YES | 'submitted' | 상태 |
| **payment_status** | text | YES | - | 결제상태 |
| **assigned_chinese_staff** | uuid | YES | - | 담당 중국직원 |
| **created_at** | timestamp | YES | now() | 생성일시 |
| **updated_at** | timestamp | YES | now() | 수정일시 |
| **service_subtype_chinese** | text | YES | - | 서브타입 중국어 (미사용) |
| **status_chinese** | text | YES | - | 상태 중국어 (미사용) |
| **inspection_method** | text | YES | - | 검품방법 |
| **factory_name** | text | YES | - | 공장명 |
| **factory_contact** | text | YES | - | 공장 담당자 |
| **factory_phone** | text | YES | - | 공장 전화 |
| **factory_address** | text | YES | - | 공장 주소 |
| **schedule_type** | text | YES | - | 일정 타입 |
| **confirmed_date** | date | YES | - | 확정일자 |
| **inspection_days** | integer | YES | - | 검품일수 |
| **inspection_report** | text | YES | - | 검품리포트 |
| **inspection_summary** | text | YES | - | 검품요약 (Staff 입력) 
| **pass_fail_status** | text | YES | - | 합격/불합격 (Staff 입력) |
| **improvement_items** | jsonb | YES | - | 개선사항 (Staff 입력) |
| **total_cost** | numeric | YES | - | 총비용 |
| **vat_amount** | numeric | YES | - | VAT |
| **unit_price** | numeric | YES | 290000 | 단가 |
| **total_amount** | numeric | YES | - | 총금액 |

## 📊 주요 필드별 사용 현황

| 컬럼명 | 고객 입력 (/application/inspection) | 고객 조회 (/dashboard/orders) | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|---------|---------|---------|---------|------|
| **reservation_number** | 자동생성 | "오더번호" 표시 | "订单号" 표시 | "오더번호" 표시 | 예약번호 |
| **company_name** | "회사명" 입력 | "회사명" 표시 | "公司名" 표시 | "회사명" 표시 | |
| **contact_person** | "담당자명" 입력 | "담당자" 표시 | "联系人" 표시 | "담당자" 표시 | |
| **contact_phone** | "연락처" 입력 | "연락처" 표시 | "电话" 표시 | "연락처" 표시 | |
| **contact_email** | "이메일" 입력 | "이메일" 표시 | "邮箱" 표시 | "이메일" 표시 | |
| **product_name** | "제품명" 입력 | "제품명" 표시 | **product_name_translated** 표시 | "제품명" 표시 | 중국 직원은 번역본 |
| **product_name_translated** | - | - | "产品名" (번역된 값) | - | 중국 직원 전용 |
| **production_quantity** | "생산수량" 입력 | "생산수량" 표시 | "生产数量" 표시 | "생산수량" 표시 | |
| **inspection_method** | "검품방법" 선택 | "표준/전수검품" 표시 | "标准/全数检验" 표시 | "표준/전수검품" 표시 | |
| **special_requirements** | "검품 요청사항" 입력 | "특별 요구사항" 표시 | **special_requirements_translated** 표시 | "특별 요구사항" 표시 | 중국 직원은 번역본 |
| **special_requirements_translated** | - | - | "特殊要求" (번역된 값) | - | 중국 직원 전용 |
| **factory_name** | "공장명" 입력 | "공장명" 표시 | "工厂名" 표시 (원본) | "공장명" 표시 (원본) | 원래 중국어 |
| **factory_contact** | "공장 담당자" 입력 | "담당자" 표시 | "联系人" 표시 (원본) | "담당자" 표시 (원본) | 원래 중국어 |
| **factory_phone** | "공장 연락처" 입력 | "연락처" 표시 | "电话" 표시 (원본) | "연락처" 표시 (원본) | |
| **factory_address** | "공장 주소" 입력 | "주소" 표시 | "地址" 표시 (원본) | "주소" 표시 (원본) | 원래 중국어 |
| **schedule_type** | "일정 옵션" 선택 | - | - | - | already_booked / coordination_needed |
| **confirmed_date** | 날짜 선택 | "확정 일자" 표시 | "确定日期" 표시 | "확정 일자" 표시 | |
| **inspection_days** | "검품 일수" 입력 | "검품 기간" 표시 | "检验天数" 표시 | "검품 기간" 표시 | |
| **status** | 자동 설정 | 상태 칩 표시 | 중국어 상태 표시 | 한국어 상태 표시 | |
| **payment_status** | - | "결제 상태" 표시 | "支付状态" 표시 | "결제 상태" 표시 | |

## 🔧 Staff 전용 입력 필드 (in_progress 상태에서만)

| 컬럼명 | 중국 직원 입력 | 한국 직원 입력 | 용도 | 타입 |
|--------|---------|---------|------|------|
| **inspection_summary** | "检验摘要" 입력 | "검품 요약" 입력 | 검품 결과 요약 | text |
| **pass_fail_status** | "合格/不合格/有条件合格" 선택 | "합격/불합격/조건부합격" 선택 | 검품 결과 | text |
| **improvement_items** | "改善事项" 입력 | "개선사항" 입력 | 개선 필요 사항 | jsonb |
| **inspection_report** | 리포트 업로드 | 리포트 업로드 | 검품 보고서 | text |
| **assigned_chinese_staff** | - | - | 자동 할당 | uuid |

## 💰 비용 관련 필드

| 컬럼명 | 용도 | 기본값 | 계산 |
|--------|------|--------|------|
| **unit_price** | 일일 단가 | 290000 | 일수별 차등 (1-4일: 290,000 / 5-9일: 270,000 / 10일+: 250,000) |
| **total_amount** | 검품비 총액 | - | unit_price × inspection_days |
| **vat_amount** | VAT | - | total_amount × 0.1 |
| **total_cost** | 최종 금액 | - | total_amount + vat_amount |

## 🚀 상태별 진행 단계 표시

### 고객 화면 (한국어)
- 대기중 → 신청접수 → 일정조율 → 견적및결제 → 검품진행 → 검품완료

### 중국 직원 화면
- 待处理 → 申请接收 → 日程协调 → 报价及付款 → 检验进行 → 检验完成

### 한국 직원 화면
- 대기중 → 신청접수 → 일정조율 → 견적및결제 → 검품진행 → 검품완료

## ❌ 미사용 필드 (향후 삭제 예정)

- **service_subtype** - 서브타입 (현재 미사용)
- **service_subtype_chinese** - 서브타입 중국어 (미사용)
- **status_chinese** - 상태 중국어 (미사용)

## ✅ 핵심 포인트

1. **번역 필드 사용**
   - 중국 직원은 `product_name_translated`, `special_requirements_translated` 표시
   - 한국 직원/고객은 원본 필드 표시

2. **공장 정보**
   - 모든 사용자가 원본 그대로 표시 (원래 중국어로 입력되기 때문)

3. **Staff 전용 기능**
   - `in_progress` 상태에서만 편집 가능
   - 검품 요약, 합격/불합격, 개선사항 입력

4. **라벨 언어**
   - 중국 직원: 모든 라벨 중국어
   - 한국 직원/고객: 모든 라벨 한국어

5. **improvement_items는 JSONB 타입**
   - 배열로 저장되는 개선사항 목록