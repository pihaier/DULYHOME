# inspection_applications 테이블 필드 분석

## 📊 페이지 vs 테이블 비교 분석

### 1️⃣ 페이지에서 사용하는 필드 (FormData)
```typescript
// 신청 페이지에서 실제 입력받는 필드
1. company_name ✅ (테이블에 있음)
2. contact_person ✅ (테이블에 있음)
3. contact_phone ✅ (테이블에 있음)
4. contact_email ✅ (테이블에 있음)
5. serviceSubType → service_type ✅ (테이블에 있음, 이름 다름)
6. productName → product_name ✅ (테이블에 있음, 이름 다름)
7. quantity → production_quantity ✅ (테이블에 있음, 이름 다름)
8. inspectionMethod → inspection_method ✅ (테이블에 있음, 이름 다름)
9. factoryName → factory_name ✅ (테이블에 있음, 이름 다름)
10. factoryContact → factory_contact ✅ (테이블에 있음, 이름 다름)
11. factoryPhone → factory_phone ✅ (테이블에 있음, 이름 다름)
12. factoryAddress → factory_address ✅ (테이블에 있음, 이름 다름)
13. scheduleType → schedule_type ✅ (테이블에 있음, 이름 다름)
14. confirmedDate → confirmed_date ✅ (테이블에 있음, 이름 다름)
15. inspectionDays → inspection_days ✅ (테이블에 있음, 이름 다름)
16. inspectionRequest → special_requirements ✅ (테이블에 있음, 이름 다름)
17. requestFiles ❌ (uploaded_files 테이블에 별도 저장)
```

### 2️⃣ 코드에서 추가로 설정하는 필드
```typescript
// 자동 생성/설정되는 필드
1. reservation_number ✅ (자동 생성)
2. user_id ✅ (로그인 사용자)
3. status ✅ ('submitted' 고정)
4. payment_status ✅ ('pending' 고정)
```

### 3️⃣ 테이블에 있지만 사용하지 않는 필드

#### 🔴 완전히 사용 안하는 필드 (삭제 대상)
1. **service_subtype** - service_type으로 통합됨
2. **product_name_translated** - 번역 기능 미구현
3. **moq_check** - MOQ 체크 기능 없음
4. **special_requirements_translated** - 번역 기능 미구현
5. **logo_required** - 시장조사용 필드
6. **logo_details** - 시장조사용 필드
7. **custom_box_required** - 시장조사용 필드
8. **box_details** - 시장조사용 필드
9. **service_subtype_chinese** - 중국어 번역 미구현
10. **status_chinese** - 중국어 번역 미구현
11. **detail_page** - 시장조사용 필드
12. **detail_page_cn** - 시장조사용 필드
13. **research_type** - 시장조사용 필드
14. **schedule_availability** - 사용 안함
15. **available_dates** - 사용 안함
16. **confirm_reservation** - 사용 안함
17. **inspection_photos** - uploaded_files로 관리
18. **quotation_pdf** - 별도 관리 예정
19. **tax_invoice_pdf** - 별도 관리 예정

#### 🟡 나중에 사용할 필드 (직원 페이지용)
1. **assigned_chinese_staff** - 중국직원 배정시 사용
2. **inspection_report** - 검품 완료 후 리포트
3. **inspection_summary** - 검품 요약
4. **pass_fail_status** - 합격/불합격 상태
5. **improvement_items** - 개선사항
6. **total_cost** - 총 비용
7. **vat_amount** - 부가세

#### 🟢 현재 사용 중인 시스템 필드
1. **id** - 자동생성 UUID
2. **created_at** - 생성일시
3. **updated_at** - 수정일시

## 📋 정리 결과

### ✅ 실제 사용 필드: 28개
- 고객 입력: 16개
- 자동 설정: 6개
- 직원용(예정): 6개

### ❌ 미사용 필드: 19개
- 시장조사용으로 잘못 들어간 필드: 8개
- 번역 관련 미구현: 4개
- 기타 미사용: 7개

### 🎯 권장사항
1. **테이블 정리 필요**: 19개 미사용 필드 삭제
2. **필드명 통일 필요**: 페이지와 테이블 필드명 불일치 (snake_case vs camelCase)
3. **별도 테이블 분리**: inspection과 market_research 필드 명확히 구분