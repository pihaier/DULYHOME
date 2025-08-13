# market_research_requests 테이블 필드 분석

## 📊 실제 DB 81개 필드 vs 페이지 사용 현황

### 1️⃣ 고객 입력 페이지 (/application/market-research)에서 사용하는 필드
```typescript
// 실제 입력받는 필드
1. reservation_number ✅ (자동생성)
2. user_id ✅ (로그인 사용자)
3. service_type ✅ ('market_research' 고정)
4. company_name ✅
5. contact_person ✅
6. contact_phone ✅
7. contact_email ✅
8. product_name ✅
9. detail_page ✅
10. research_quantity ✅ (quantity → research_quantity)
11. moq_check ✅
12. requirements ✅
13. logo_required ✅
14. logo_details ✅
15. custom_box_required ✅
16. box_details ✅
17. status ✅ ('submitted' 고정)
18. payment_status ✅ ('pending' 고정)
19. assigned_staff ✅ (중국직원 자동 배정)

// 파일은 uploaded_files 테이블에 별도 저장
- logoFiles → uploaded_files
- boxDesignFiles → uploaded_files
- files → uploaded_files
```

### 2️⃣ 고객 조회 페이지에서 사용하는 필드 (많은 필드가 나중에 중국직원이 입력)
```
기본 정보:
- product_name, research_quantity, created_at, detail_page
- moq_check, logo_required, custom_box_required
- requirements, logo_details, box_details

회사 정보 (중국직원 입력):
- industry_kr, legal_type_kr, company_size_kr
- established_date, registered_capital, real_paid_capital
- company_status, is_small_business, business_scope_kr

제품 사양 (중국직원 입력):
- product_code, quoted_quantity, work_period
- units_per_box, box_length, box_width, box_height
- total_boxes, total_cbm, other_matters_kr

샘플 정보 (중국직원 입력):
- sample_available, sample_unit_price, sample_order_qty
- sample_weight, sample_make_time, sample_price

수출입 정보 (중국직원 입력):
- hs_code, certification_required, cert_cost
- work_duration, export_port, factory_price_rmb
- product_link, shipping_method
```

### 3️⃣ DB에 있지만 페이지에서 사용 안하는 필드

#### 🔴 완전 미사용 필드
1. photos (jsonb) - uploaded_files로 관리
2. logo_file (jsonb) - uploaded_files로 관리
3. logo_print_details - logo_details로 통합
4. box_design_file (jsonb) - uploaded_files로 관리
5. research_photos (jsonb) - uploaded_files로 관리
6. moq_quantity - 사용 안함
7. production_duration - work_duration과 중복
8. product_options, product_colors, product_dimensions
9. product_materials, product_functions, product_specifications
10. product_composition, additional_notes
11. product_width_cm, product_length_cm, product_height_cm
12. box_width_cm, box_length_cm, box_height_cm - box_length 등으로 통합
13. sample_availability - sample_available로 중복
14. sample_order_quantity - sample_order_qty로 중복
15. sample_weight_kg - sample_weight로 중복
16. sample_quantity, sample_total_price, sample_delivery_time
17. shipping_cost_note, estimated_shipping_cost
18. required_certifications - certification_required로 중복
19. certification_cost - cert_cost로 중복
20. commission_rate, commission_amount, shipping_cost
21. first_payment_details, china_unit_price, exchange_rate
22. exw_total, china_shipping_cost, first_payment_amount
23. second_payment_estimate, second_payment_note
24. estimated_unit_price, estimated_total_supply
25. estimated_tax, estimated_total_amount
26. research_completed_at, quote_amount, quote_sent_at
27. product_name_chinese
28. product_url - product_link로 중복
29. reference_files (jsonb) - uploaded_files로 관리
30. service_subtype

### 4️⃣ 페이지에 있는데 DB에 없는 필드
- industry_kr ❌ (DB에 없음)
- legal_type_kr ❌ (DB에 없음)
- company_size_kr ❌ (DB에 없음)
- established_date ❌ (DB에 없음)
- registered_capital ❌ (DB에 없음)
- real_paid_capital ❌ (DB에 없음)
- company_status ❌ (DB에 없음)
- is_small_business ❌ (DB에 없음)
- business_scope_kr ❌ (DB에 없음)
- product_code ❌ (DB에 없음)
- quoted_quantity ❌ (DB에 없음)
- work_period ❌ (DB에 없음)
- total_boxes ❌ (total_box_count로 추정)
- other_matters_kr ❌ (DB에 없음)
- sample_order_qty ❌ (sample_order_quantity로 추정)
- sample_weight ❌ (sample_weight_kg로 추정)
- sample_make_time ❌ (sample_delivery_time으로 추정)
- sample_price ❌ (sample_total_price로 추정)
- certification_required ❌ (required_certifications로 추정)
- cert_cost ❌ (certification_cost로 추정)
- work_duration ❌ (production_duration으로 추정)
- export_port ❌ (DB에 없음)
- factory_price_rmb ❌ (china_unit_price로 추정)
- product_link ❌ (product_url로 추정)

## 📊 정리 결과

### ✅ 실제 사용 필드: 약 40개
- 고객 입력: 19개
- 중국직원 입력 후 표시: 약 21개

### ❌ 미사용 필드: 약 30개
- JSONB 파일 필드들 (uploaded_files로 대체)
- 중복된 필드들
- 미구현 기능 필드들

### ⚠️ 문제점
1. **필드명 불일치**: 페이지와 DB 필드명이 다름
2. **DB에 없는 필드**: 페이지에서 사용하는 약 20개 필드가 DB에 없음
3. **중복 필드**: 같은 용도의 필드가 여러 개 존재