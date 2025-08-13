# Supabase 테이블 상세 문서
> 작성일: 2025-01-13
> 용도: ERP 시스템 데이터베이스 구조 문서화

## 📊 테이블 현황 요약

### 실제 사용 중인 테이블
- **서비스 신청**: 48건 (inspection 28 + market_research 19 + factory_contact 1)
- **사용자/프로필**: 13건 (user_profiles 5 + shipping_addresses 2 + company_addresses 6)
- **커뮤니케이션**: 56건 (chat_messages 43 + inquiries 2 + notices 4 + faqs 7)
- **데이터/파일**: 29,574건 (files 48 + exchange_rates 1 + hs_codes 29,522 + logs 58)

---

## 1. 🏭 서비스 신청 테이블

## inspection_applications (검품감사 신청) - 실제 DB 49개 필드 분석

| 컬럼명 | 한글명 | 타입 | 입력값 예시 | 고객 입력 (/application/inspection) | 고객 조회 (/dashboard/orders/inspection/[id]) | 사용여부 |
|--------|--------|------|-------------|-----------|-----------|----------|
| **id** | 고유ID | uuid | auto | - | ✓ | ✅ 사용 |
| **reservation_number** | 예약번호 | text | IN-20250113-000001 | 자동생성 | ✓ | ✅ 사용 |
| **user_id** | 사용자ID | uuid | auto | 자동 | - | ✅ 사용 |
| **company_name** | 회사명 | text | (주)두리무역 | ✓ | ✓ | ✅ 사용 |
| **contact_person** | 담당자명 | text | 김철수 | ✓ | ✓ | ✅ 사용 |
| **contact_phone** | 연락처 | text | 010-1234-5678 | ✓ | ✓ | ✅ 사용 |
| **contact_email** | 이메일 | text | kim@duly.co.kr | ✓ | ✓ | ✅ 사용 |
| **service_type** | 서비스타입 | text | quality_inspection | ✓ | ✓ | ✅ 사용 |
| **service_subtype** | 서브타입 | text | - | - | - | ❌ 미사용 |-일단 내비둬 
| **product_name** | 제품명 | text | 전자제품 부품 | ✓ | ✓ | ✅ 사용 |
| **product_name_translated** | 제품명번역 | text | - | - | - | ❌ 미사용 |--중국국직원용
| **production_quantity** | 생산수량 | integer | 10000 | ✓ | ✓ | ✅ 사용 |
| **moq_check** | MOQ체크 | boolean | - | - | - | ❌ 미사용 |-삭제
| **special_requirements** | 특별요구사항 | text | 품질기준서 첨부 | ✓ | ✓ | ✅ 사용 |
| **special_requirements_translated** | 요구사항번역 | text | - | - | - | ❌ 미사용 |-중국직원용용
| **logo_required** | 로고필요 | boolean | - | - | - | ❌ 시장조사용 |-삭제
| **logo_details** | 로고상세 | text | - | - | - | ❌ 시장조사용 |-삭제
| **custom_box_required** | 박스필요 | boolean | - | - | - | ❌ 시장조사용 |-삭제
| **box_details** | 박스상세 | text | - | - | - | ❌ 시장조사용 |삭제
| **status** | 상태 | text | submitted | 자동 | ✓ | ✅ 사용 |
| **payment_status** | 결제상태 | text | pending | 자동 | ✓ | ✅ 사용 |
| **assigned_chinese_staff** | 담당중국직원 | uuid | - | - | - | 🟡 직원용 |
| **created_at** | 생성일시 | timestamp | 2025-01-13 10:00:00 | 자동 | ✓ | ✅ 사용 |
| **updated_at** | 수정일시 | timestamp | 2025-01-13 11:00:00 | 자동 | ✓ | ✅ 사용 |
| **service_subtype_chinese** | 서브타입중국어 | text | - | - | - | ❌ 미사용 |
| **status_chinese** | 상태중국어 | text | - | - | - | ❌ 미사용 |
| **detail_page** | 상세페이지 | text | - | - | - | ❌ 시장조사용 |-삭제
| **detail_page_cn** | 상세페이지중국어 | text | - | - | - | ❌ 시장조사용 |  -삭제
| **research_type** | 조사타입 | text | - | - | - | ❌ 시장조사용 |  -삭제
| **inspection_method** | 검품방법 | text | standard/full | ✓ | ✓ | ✅ 사용 |
| **factory_name** | 공장명 | text | 심천전자공장 | ✓ | ✓ | ✅ 사용 |
| **factory_contact** | 공장담당자 | text | 왕밍 | ✓ | ✓ | ✅ 사용 |
| **factory_phone** | 공장전화 | text | +86-135-1234-5678 | ✓ | ✓ | ✅ 사용 |
| **factory_address** | 공장주소 | text | 심천시 바오안구 | ✓ | ✓ | ✅ 사용 |
| **schedule_type** | 일정타입 | text | duly_coordination | ✓ | ✓ | ✅ 사용 |
| **confirmed_date** | 확정일자 | date | 2025-01-15 | ✓ | ✓ | ✅ 사용 |
| **inspection_days** | 검품일수 | integer | 3 | ✓ | ✓ | ✅ 사용 |
| **schedule_availability** | 일정가능 | text | - | - | - | ❌ 미사용 |삭제
| **available_dates** | 가능일자 | jsonb | - | - | - | ❌ 미사용 |삭제
| **confirm_reservation** | 예약확인 | boolean | - | - | - | ❌ 미사용 |삭제
| **inspection_report** | 검품리포트 | text | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ??
| **inspection_summary** | 검품요약 | text | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ??
| **inspection_photos** | 검품사진 | jsonb | - | - | - | ❌ files테이블 |-삭제제
| **pass_fail_status** | 합격불합격 | text | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ??
| **improvement_items** | 개선사항 | jsonb | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ??
| **total_cost** | 총비용 | numeric | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ??--단가 필드 도 있어야함 단가*검품일수임 
| **vat_amount** | 부가세 | numeric | - | - | - | 🟡 직원용 |고객 보여야함  파일 아님 ? 지금 안보임 ?? 자동계산이 되야함 총비용*10%임  -그리고 합계 비용 도 있어야함 --총비용 +부가세세
| **quotation_pdf** | 견적서PDF | text | - | - | - | ❌ 미사용 |
| **tax_invoice_pdf** | 세금계산서PDF | text | - | - | - | ❌ 미사용 |


### 📊 현재 구현 상태
- **✅ 구현 완료**: 
  - 고객 입력: `/application/inspection` (실제 사용 20개 필드)
  - 고객 조회: `/dashboard/orders/inspection/[reservationNumber]` (표시 22개 필드)
- **🚧 구현 예정**: 직원 관리 페이지 `/staff/inspection` (전체 필드)

### 📌 필드 사용 현황 총정리
**✅ 현재 사용 중 (23개)**: 고객 입력 및 조회 페이지에서 실제 사용
**🟡 직원용 예정 (7개)**: assigned_chinese_staff, inspection_report, inspection_summary, pass_fail_status, improvement_items, total_cost, vat_amount
**🔴 삭제 필요 (19개)**: 시장조사용 또는 미구현 기능
- service_subtype, product_name_translated, moq_check
- special_requirements_translated, logo_required, logo_details
- custom_box_required, box_details, service_subtype_chinese
- status_chinese, detail_page, detail_page_cn, research_type
- schedule_availability, available_dates, confirm_reservation
- inspection_photos, quotation_pdf, tax_invoice_pdf

### ✅ 페이지-DB 필드 매칭 확인
**모든 페이지 필드가 DB에 존재함** - 추가 필드 없음

---

## market_research_requests (시장조사 신청) - 실제 DB 81개 필드 분석

| 컬럼명 | 한글명 | 타입 | 입력값 예시 | 고객 입력 (/application/market-research) | 고객 조회 (/dashboard/orders/market-research/[id]) | 사용여부 |
|--------|--------|------|-------------|-----------|-----------|----------|
| **id** | 고유ID | uuid | auto | - | - | ✅ 사용 |
| **reservation_number** | 예약번호 | varchar | MR-20250113-000001 | 자동생성 | ✓ | ✅ 사용 |
| **user_id** | 사용자ID | uuid | auto | 자동 | - | ✅ 사용 |
| **company_name** | 회사명 | varchar | (주)두리무역 | ✓ | ✓ | ✅ 사용 |
| **contact_person** | 담당자명 | varchar | 김철수 | ✓ | ✓ | ✅ 사용 |
| **contact_phone** | 연락처 | varchar | 010-1234-5678 | ✓ | ✓ | ✅ 사용 |
| **contact_email** | 이메일 | varchar | kim@duly.co.kr | ✓ | ✓ | ✅ 사용 |
| **product_name** | 제품명 | varchar | 전자제품 | ✓ | ✓ | ✅ 사용 |
| **product_name_chinese** | 제품명(중국어) | text | 电子产品 | - | - | ❌ 미사용 |--중국직원용
| **research_quantity** | 조사수량 | integer | 10000 | ✓ (quantity로 입력) | ✓ | ✅ 사용 |
| **requirements** | 요구사항 | text | 상세 요구사항 | ✓ | ✓ | ✅ 사용 |
| **detail_page** | 상세페이지 | text | https://example.com | ✓ | ✓ | ✅ 사용 |
| **photos** | 사진 | jsonb | - | - | - | ❌ files테이블 |--- 이거 있지 지금 관련되어 ???
| **logo_required** | 로고필요 | boolean | true | ✓ | ✓ | ✅ 사용 |
| **logo_file** | 로고파일 | jsonb | - | - | - | ❌ files테이블 |--- 이거 있지 지금 관련되어 ???
| **logo_print_details** | 로고인쇄상세 | text | - | - | - | ❌ logo_details로 통합 |--삭제제
| **custom_box_required** | 커스텀박스필요 | boolean | true | ✓ | ✓ | ✅ 사용 |
| **box_design_file** | 박스디자인파일 | jsonb | - | - | - | ❌ files테이블 |--- 이거 있지 지금 관련되어 ??? 
| **status** | 상태 | varchar | submitted | 자동 | ✓ | ✅ 사용 |
| **payment_status** | 결제상태 | varchar | pending | 자동 | ✓ | ✅ 사용 |---삭제제
| **moq_check** | MOQ체크 | boolean | true | ✓ | ✓ | ✅ 사용 |
| **logo_details** | 로고상세 | text | 실크인쇄 | ✓ | ✓ | ✅ 사용 |
| **box_details** | 박스상세 | text | 박스요구사항 | ✓ | ✓ | ✅ 사용 |
| **assigned_staff** | 담당직원 | uuid | - | 자동배정 | - | ✅ 사용 |
| **created_at** | 생성일시 | timestamp | 2025-01-13 | 자동 | ✓ | ✅ 사용 |
| **updated_at** | 수정일시 | timestamp | 2025-01-13 | 자동 | ✓ | ✅ 사용 |
### 📊 고객 조회 페이지 (/dashboard/orders/market-research/[reservationNumber]) 탭별 사용 필드

#### 📁 **2. 공장정보 탭** 
| 페이지 필드명 | 한글명 | 페이지 표시 |
|--------------|--------|------------|
| **industry_kr** | 업종 | data?.industry_kr \|\| '조사중' | 
중국어 필드 필요          
| **legal_type_kr** | 법인/개인 | da이거는 선택이라 중국어 필요 없나 ????
| **company_size_kr** | 인원규모 | data?.company_size_kr \|\| '조사중' |
| **established_date** | 개업시간 | data?.established_date |
| **registered_capital** | 등록자본 | data?.registered_capital \|\| '조사중' |
| **real_paid_capital** | 실수등록자금 | data?.real_paid_capital \|\| '조사중' |
| **company_status** | 기업상태 | data?.company_status \|\| '조사중' |
중국어 필드 필요     
| **is_small_business** | 소규모기업 여부 | data?.is_small_business |
| **business_scope_kr** | 영업범위 | data?.business_scope_kr \|\| '조사중' |
중국어 필드 필요     

추가 필드(중구직원 입력하는데 고객한테 안보여야함) 
공장담당자,연락처
#### 📁 **3. 제품정보 탭**
| 페이지 필드명 | 한글명 | 페이지 표시 |
|--------------|--------|------------|
| **product_code** | 제품번호 | data?.product_code \|\| '자동발급' |
| **quoted_quantity** | 견적수량 | data?.quoted_quantity |
| **work_period** | 작업소요기간 | data?.work_period |
| **units_per_box** | 박스당 제품개수 | data?.units_per_box |
| **box_length** | 박스 길이 | data?.box_length |
| **box_width** | 박스 너비 | data?.box_width |
| **box_height** | 박스 높이 | data?.box_height |
| **total_boxes** | 총 박스수 | data?.total_boxes |
| **total_cbm** | 총 CBM | data?.total_cbm |---자동 계산이 되야 함 cbm공식 적용 필요
| **other_matters_kr** | 기타사항 | data?.other_matters_kr \|\| data?.other_matters |
중국어 필드 필요  
| **sample_available** | 샘플재고 유무 | data?.sample_available |
| **sample_unit_price** | 샘플단가 | data?.sample_unit_price |--자동 계산이 되야 함=중국단가*두리무역 적용환율율
중국단가 있어요함 
| **sample_order_qty** | 샘플 주문 가능 수량 | data?.sample_order_qty |
| **sample_weight** | 샘플 무게(kg) | data?.sample_weight |
| **sample_make_time** | 샘플 제작 기간 | data?.sample_make_time |
| **sample_price** | 샘플 가격 | data?.sample_price |---필요 없음음
| **hs_code** | HS코드 | data?.hs_code |---- 제품명이 spabase에 들어가면면 넣으면 자동으로 함수호출(현재 있음) 거기서 첫번째 추천 코드 를 파싱
| **certification_required** | 수입 시 인증 필요 | data?.certification_required | ----hs_code가 값이 나오면 세관장 확인 함수 호출 해서 값을 가져와야함
| **cert_cost** | 인증 예상 비용 | data?.cert_cost | --세관장 값이랑 hs_code를 재입력 해서 gpt한테 함수로 물어 봐야함 함수는 websearch 톨 써야함 (구현안됨)

추가 필드 제품 실제사진--고객도 보여야함 --관련 파일에도 있어야함 

(중구직원 입력하는데 고객한테 안보여야함) 
사이트 

#### 📁 **4. 가격정보 탭**
| 페이지 필드명 | 한글명 | 페이지 표시 |
|--------------|--------|------------|
| **work_duration** | 소요시간 | data?.work_duration |
| **export_port** | 수출항 | data?.export_port |
중국어 입력필드필요
| **factory_price_rmb** | 출고가 RMB | data?.factory_price_rmb |
| **product_link** | 조사제품 연결 | data?.product_link |--조회에서 빼도록
| **shipping_method** | 운송방식 | data?.shipping_method |--- 총 CBM이 계산되면 자동으로 연산해야함 15CBM이상이면 FCL아니면LCL 
| **exchange_rate** | 환율 | 조사중 |  -환율 테이블에서 빼와야함 --두리무역적용환율율
| **exchange_rate_date** | 환율 산정일 | 조사중 |  --중국직원이데이터입력하는 날 자동 입력력
| **commission_rate** | 수수료율 | 조사중 |----5% 고정 
| **commission_amount** | 수수료(금액) | 조사중 |  ----자동연산 해야함 중국단가*수량*환율*5%
| **china_unit_price** | 중국단가 | 조사중 | 
| **exw_total** | EXW 합계 | 조사중 | ----자동연산이 필요함  한국돈 으로 표기 -(중국단가*수량+중국운송료)
| **china_shipping_fee** | 중국 운송료 | 조사중 |
| **fcl_shipping_fee** | FCL 운비 | 조사중 |------만약위에 **shipping_method** | 운송방식 | 이게 FCL일경우에만 중국 직원 입력 필요 , 아니면 LCL운송비가 표기 되어 야함(필드 추가 필요)--LCL은 자동연산 ( 총 CBM*90000원)
| **first_payment_detail** | 1차 상세비용 | 조사중 |---삭제제
| **first_payment_amount** | 1차 결제비용 | 조사중 |---EXW+수수료의부가세(수수료*10%)
| **customs_duty** | 관세 | 조사중 |----자동연산이 되야함 관세율* (EXW 합계+배송비 FCL이나 LCL)
| **import_vat** | 부가세 | 조사중 |----자동연산 되야함 ---(EXW 합계+배송비 FCL이나 LCL+관세)*10%
| **expected_second_payment** | 예상 2차결제비용 | 조사중 |----자동연산 되야함=관세+부가세+배송비 FCL이나 LCL
| **expected_total_supply_price** | 예상 총 공급가 | 조사중 |--- 예상 총 합계  으로 교체 프론트 ----자동연산 되야함=1차비용+2차비용용
| **expected_unit_price** | 예상 단가 (VAT 별도) | 조사중 |---(VAT 포함) 으로교체체 프론트  ----자동연산 되야함=예상 총 합계/수량량
추가 필드 
관세율---함수를 써서 가져 와야함 (계산기 페이지로직 참고 적용세율 가장 낮은값 )


### 🔴 문제점 정리(업데이트)
- DB 81개 중 상세 페이지에서 직접 사용하는 컬럼은 다수 존재하나, 컬럼명 불일치로 표시 누락 다수
- 별도 보조 테이블의 필드(제품/샘플/비용/공급자)는 페이지에서 미조회 상태
- 파일 필드는 `uploaded_files` 기준으로 동작, 본문 컬럼들은 미사용

---

## factory_contact_requests (공장컨택 신청) - 실제 DB 21개 필드 분석

| 컬럼명 | 한글명 | 타입 | 입력값 예시 | 고객 입력 (/application/factory-contact) | 고객 조회 (/dashboard/orders/factory-contact/[id]) | 사용여부 |
|--------|--------|------|-------------|-----------|-----------|----------|
| **id** | 고유ID | uuid | auto | - | - | ✅ 사용 |
| **reservation_number** | 예약번호 | varchar | FC-20250113-000001 | 자동생성 | ✓ | ✅ 사용 |
| **user_id** | 사용자ID | uuid | auto | 자동 | - | ✅ 사용 |
| **company_name** | 회사명 | varchar | (주)두리무역 | ✓ | ✓ | ✅ 사용 |
| **contact_person** | 담당자명 | varchar | 김철수 | ✓ | ✓ | ✅ 사용 |
| **contact_phone** | 연락처 | varchar | 010-1234-5678 | ✓ | ✓ | ✅ 사용 |
| **contact_email** | 이메일 | varchar | kim@duly.co.kr | ✓ | ✓ | ✅ 사용 |
| **product_name** | 제품명 | varchar | 전자제품 | ✓ | ✓ | ✅ 사용 |---이거는 중국어 필드추가 자동 번역이 되야함
| **product_description** | 제품설명 | text | 상세 설명 | ✓ | ✓ | ✅ 사용 |----이거는 중국어 필드추가 자동 번역이 되야함
| **request_type** | 요청타입 | jsonb | {sample:true,bulk_order:false} | ✓ | ✓ | ✅ 사용 |
| **special_requirements** | 특별요구사항 | text | 특별 요청사항 | ✓ | ✓ | ✅ 사용 |--이거는 중국어 필드추가 자동 번역이 되야함
| **files** | 파일 | jsonb | [{url:'file.pdf'}] | ✓ | - | ✅ 사용 |
| **status** | 상태 | varchar | submitted | 자동 | ✓ | ✅ 사용 |
| **payment_status** | 결제상태 | varchar | pending | - | ✓ | ✅ 사용 |

| **assigned_chinese_staff** | 담당중국직원 | uuid | staff_id | - | - | 🟡 직원용 |
| **factory_name** | 공장명 | varchar | 심천공장 | ✓ | ✓ | ✅ 사용 |
| **factory_contact_person** | 공장담당자 | varchar | 왕밍 | ✓ | ✓ | ✅ 사용 |
| **factory_contact_phone** | 공장전화 | varchar | +86-135-1234-5678 | ✓ | ✓ | ✅ 사용 |
| **factory_address** | 공장주소 | text | 심천시 바오안구 | ✓ | ✓ | ✅ 사용 |
| **created_at** | 생성일시 | timestamp | 2025-01-13 10:00:00 | 자동 | ✓ | ✅ 사용 |
| **updated_at** | 수정일시 | timestamp | 2025-01-13 11:00:00 | 자동 | ✓ | ✅ 사용 |

추가 필드 견적서 PDF, 결제금액 

### 📊 현재 구현 상태
- **✅ 구현 완료**: 
  - 고객 입력: `/application/factory-contact` (실제 사용 16개 필드)
  - 고객 조회: `/dashboard/orders/factory-contact/[reservationNumber]` (표시 14개 필드)

### ⚠️ 페이지에 있는데 DB에 없는 것
- **confirmation_requests 테이블** - 페이지에서 컨펌대기 탭에서 사용하지만 테이블이 존재하지만 데이터 0건
  - 필드: id, request_type, title, description, options, status, customer_response, selected_option_id, customer_comment, is_urgent, deadline, created_at

### ✅ 장점: 
- 기본 필드는 모두 정확히 매칭됨
- factory_contact_requests 테이블 자체는 잘 정리됨 (21개 중 20개 사용)

### confirmation_requests (공장컨택 확인 요청 테이블) - 31개 필드
```
연관: factory_contact_requests와 reservation_number로 연결
용도: 중국 직원이 고객에게 확인 요청을 보낼 때 사용

기본 필드:
- id (uuid) - 고유 ID
- reservation_number (varchar) - 예약번호 (FK)
- request_type (varchar) - 요청 유형
- attachments (jsonb) - 첨부파일
- created_by (uuid) - 생성자
- created_at (timestamp) - 생성일시
- updated_at (timestamp) - 수정일시
- selected_option_id (varchar) - 선택된 옵션
- responded_at (timestamp) - 응답 시간
- status (varchar) - 상태 (pending/responded)
- is_urgent (boolean) - 긴급 여부
- deadline (timestamp) - 응답 기한
- parent_request_id (uuid) - 상위 요청 ID
- related_order_type (varchar) - 관련 주문 유형

중국직원 작성 필드 (번역 필요):
- title (varchar) - 확인 요청 제목 (원본)
- title_chinese (varchar) - 중국어 제목 (중국직원 입력)
- title_korean (varchar) - 한국어 제목 (자동번역)
- description (text) - 상세 설명 (원본)
- description_chinese (text) - 중국어 설명 (중국직원 입력)
- description_korean (text) - 한국어 설명 (자동번역)
- options (jsonb) - 선택지 목록 (원본)
- options_chinese (jsonb) - 중국어 선택지 (중국직원 입력)
- options_korean (jsonb) - 한국어 선택지 (자동번역)

고객 응답 필드 (번역 필요):
- customer_response (varchar) - 고객 응답 (원본)
- customer_response_original (varchar) - 고객 응답 원본 (한국어)
- customer_response_translated (varchar) - 고객 응답 번역 (중국어)
- customer_comment (text) - 고객 코멘트 (원본)
- customer_comment_original (text) - 고객 코멘트 원본 (한국어)
- customer_comment_translated (text) - 고객 코멘트 번역 (중국어)

언어/역할 추적 필드:
- sender_role (varchar) - 발신자 역할 (chinese_staff/korean_team)
- sender_language (varchar) - 발신자 언어 (ko/zh)
- response_language (varchar) - 응답 언어 (ko/zh)
```

고객 조회 페이지에서 표시:
- 한국 고객: title_korean, description_korean, options_korean 표시
- 중국 직원: title_chinese, description_chinese, options_chinese 표시
- 고객 응답 시: customer_response_original (한국어) 저장 → customer_response_translated (중국어) 자동번역 
---

## 2. 👥 사용자 관련 테이블

### user_profiles (사용자 프로필) - 핵심 42개 필드

| 컬럼명 | 한글명 | 타입 | 용도 |
|--------|--------|------|------|
| **user_id** | 사용자ID | uuid | Supabase Auth ID |
| **role** | 역할 | varchar | customer/chinese_staff/korean_team/admin |
| **company_name** | 회사명 | varchar | 소속 회사명 |
| **business_number** | 사업자번호 | varchar | 사업자등록번호 |
| **contact_person** | 담당자명 | varchar | 담당자 이름 |
| **phone** | 전화번호 | varchar | 연락처 |
| **email** | 이메일 | varchar | 이메일 주소 |
| **기타 35개 필드...** | | | 세금계산서, 배송지, 언어설정 등 |

---

## 3. 💬 커뮤니케이션 테이블

### chat_messages (채팅 메시지) - 20개 필드

| 컬럼명 | 한글명 | 타입 | 용도 |
|--------|--------|------|------|
| **id** | 고유ID | uuid | 자동생성 |
| **reservation_number** | 예약번호 | varchar | 관련 서비스 예약번호 |
| **sender_id** | 발신자ID | uuid | 메시지 보낸 사용자 |
| **sender_name** | 발신자명 | varchar | 발신자 이름 |
| **sender_role** | 발신자역할 | varchar | customer/staff/admin |
| **original_message** | 원본메시지 | text | 원본 메시지 내용 |
| **translated_message** | 번역메시지 | text | 번역된 메시지 |
| **기타 13개 필드...** | | | 파일첨부, 읽음표시 등 |

---

## 📌 테이블 사용 현황 총정리

| 테이블명 | 레코드수 | 상태 | 용도 |
|----------|----------|------|------|
| **inspection_applications** | 28 | ✅ 활발 | 검품감사 신청 |
| **market_research_requests** | 19 | ✅ 활발 | 시장조사 신청 |
| **factory_contact_requests** | 1 | ✅ 사용중 | 공장컨택 신청 |
| **confirmation_requests** | 0 | ⚠️ 준비됨 | 공장컨택 확인요청 |
| **user_profiles** | 5 | ✅ 핵심 | 사용자 정보 |
| **shipping_addresses** | 2 | ✅ 사용중 | 배송지 주소 |
| **company_addresses** | 6 | ⚠️ 중복가능 | 회사 주소 |
| **chat_messages** | 43 | ✅ 활발 | 채팅 메시지 |
| **contact_inquiries** | 2 | ✅ 사용중 | 문의하기 |
| **notices** | 4 | ✅ 사용중 | 공지사항 |
| **faqs** | 7 | ✅ 사용중 | FAQ |
| **uploaded_files** | 48 | ✅ 활발 | 업로드 파일 |
| **exchange_rates** | 1 | ✅ 사용중 | 환율 |
| **hs_codes** | 12,467 | ✅ 활발 | HS코드 |
| **activity_logs** | 58 | ✅ 사용중 | 활동 로그 |

---

#