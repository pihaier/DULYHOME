# 📋 제품조사(market_research_requests) 필드 사용 현황

## 🔍 실제 Supabase 테이블 컬럼 (81개)

| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 (/application/market-research) | 고객 조회 (/dashboard/orders/market-research) | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **id** | uuid | NO | gen_random_uuid() | - | ✓ (숨김) | ✓ (숨김) | ✓ (숨김) | 시스템 자동 |
| **reservation_number** | varchar | NO | - | 자동생성 | "오더번호" 표시 | "订单号" 표시 | "오더번호" 표시 | MR-YYYYMMDD-XXXXXX |
| **user_id** | uuid | NO | - | 자동 | - | - | - | 사용자 연결 |
| **company_name** | varchar | NO | - | "회사명" 입력 | "회사명" 표시 | - | "회사명" 표시 | 중국직원 미표시 |
| **contact_person** | varchar | NO | - | "담당자명" 입력 | "담당자" 표시 | - | "담당자" 표시 | 중국직원 미표시 |
| **contact_phone** | varchar | NO | - | "연락처" 입력 | "연락처" 표시 | - | "연락처" 표시 | 중국직원 미표시 |
| **contact_email** | varchar | NO | - | "이메일" 입력 | "이메일" 표시 | - | "이메일" 표시 | 중국직원 미표시 |
| **product_name** | varchar | NO | - | "제품명" 입력 | "제품명" 표시 | **product_name_chinese** 표시 | "제품명" 표시 | 중국 직원은 번역본 |
| **product_name_chinese** | text | YES | - | - | - | "产品名" (번역된 값) | - | 중국 직원 전용 |
| **research_quantity** | integer | NO | - | "조사수량" 입력 | "조사수량" 표시 | "调查数量" 표시 | "조사수량" 표시 | |
| **requirements** | text | NO | - | "요구사항" 입력 | "요구사항" 표시 | **requirements_chinese** 표시 | "요구사항" 표시 | 중국 직원은 번역본 |
| **requirements_chinese** | text | YES | - | - | - | "要求事项" (번역된 값) | - | 중국 직원 전용 (추가 필요) |
| **detail_page** | text | YES | - | "상세페이지 URL" 입력 | "상세페이지" 표시 | "详细页面" 표시 | "상세페이지" 표시 | |
| **moq_check** | boolean | YES | false | "MOQ 확인" 체크박스 | "MOQ 확인" 표시 | "MOQ确认" 표시 | "MOQ 확인" 표시 | |
| **logo_required** | boolean | YES | false | "로고 필요" 체크박스 | "로고 필요" 표시 | "需要Logo" 표시 | "로고 필요" 표시 | |
| **logo_details** | text | YES | - | "로고 상세" 입력 | "로고 상세" 표시 | **logo_details_chinese** 표시 | "로고 상세" 표시 | 중국 직원은 번역본 |
| **logo_details_chinese** | text | YES | - | - | - | "Logo详情" (번역된 값) | - | 중국 직원 전용 (추가 필요) |
| **custom_box_required** | boolean | YES | false | "커스텀박스" 체크박스 | "커스텀박스" 표시 | "定制包装" 표시 | "커스텀박스" 표시 | |
| **box_details** | text | YES | - | "박스 상세" 입력 | "박스 상세" 표시 | **box_details_chinese** 표시 | "박스 상세" 표시 | 중국 직원은 번역본 |
| **box_details_chinese** | text | YES | - | - | - | "包装详情" (번역된 값) | - | 중국 직원 전용 (추가 필요) |
| **status** | varchar | YES | 'submitted' | 자동 | 상태 칩 표시 | 중국어 상태 표시 | 한국어 상태 표시 | |
| **assigned_staff** | uuid | YES | - | - | - | ✓ (숨김) | ✓ (숨김) | 담당 중국직원 |
| **created_at** | timestamp | YES | now() | 자동 | "신청일" 표시 | "申请日期" 표시 | "신청일" 표시 | |
| **updated_at** | timestamp | YES | now() | 자동 | - | - | - | 수정일시 |

### 🏢 공장/회사 정보 필드 (Staff 입력)
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **industry_kr** | varchar | YES | - | - | "업종" 표시 | - | "업종" 입력/표시 | 한국어 번역 |
| **industry_cn** | varchar | YES | - | - | - | "行业" 입력 | - | 중국 직원 입력 |
| **legal_type_kr** | varchar | YES | - | - | "법인형태" 표시 | "法人类型" 선택 | "법인형태" 선택 | 중국직원도 표시 |
| **company_size_kr** | varchar | YES | - | - | "인원규모" 표시 | "人员规模" 입력 | "인원규모" 입력/표시 | 중국직원도 표시 |
| **established_date** | date | YES | - | - | "개업시간" 표시 | "开业时间" 입력 | "개업시간" 입력/표시 | |
| **registered_capital** | varchar | YES | - | - | "등록자본" 표시 | "注册资本" 입력 | "등록자본" 입력/표시 | |
| **real_paid_capital** | varchar | YES | - | - | "실납자본금" 표시 | "实缴资本" 입력 | "실납자본금" 입력/표시 | |
| **company_status** | varchar | YES | - | - | "기업상태" 표시 | - | "기업상태" 입력/표시 | 한국어 번역 |
| **company_status_cn** | varchar | YES | - | - | - | "企业状态" 입력 | - | 중국 직원 입력 |
| **is_small_business** | boolean | YES | - | - | "소규모기업" 표시 | "小微企业" 체크박스 | "소규모기업" 체크박스 | |
| **business_scope_kr** | text | YES | - | - | "영업범위" 표시 | - | "영업범위" 입력/표시 | 한국어 번역 |
| **business_scope_cn** | text | YES | - | - | - | "经营范围" 입력 | - | 중국 직원 입력 |
| **factory_contact_person** | varchar | YES | - | - | - | "工厂联系人" 입력 | - | 중국직원만, 고객 미표시 |
| **factory_contact_phone** | varchar | YES | - | - | - | "工厂电话" 입력 | - | 중국직원만, 고객 미표시 |
| **product_site_url** | text | YES | - | - | - | "产品网站" 입력 | - | 중국직원만, 고객 미표시 |

### 📐 제품 사양 필드 (Staff 입력)
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **product_code** | varchar | YES | - | - | "제품번호" 표시 | 자동생성 표시 | 자동생성 표시 | 자동 발급 |
| **quoted_quantity** | integer | YES | - | - | "견적수량" 표시 | "报价数量" 입력 | "견적수량" 입력/표시 | Staff 입력 |
| **work_period** | varchar | YES | - | - | - | - | - | ❌ 삭제됨 (work_duration 사용) |
| **work_duration** | varchar | YES | - | - | "소요시간" 표시 | "所需时间" 입력 | "소요시간" 입력/표시 | 가격정보 탭 |
| **units_per_box** | integer | YES | - | - | "박스당 개수" 표시 | "每箱数量" 입력 | "박스당 개수" 입력/표시 | Staff 입력 |
| **box_length** | numeric | YES | - | - | "박스 길이" 표시 | "箱长" 입력 | "박스 길이" 입력/표시 | cm 단위 |
| **box_width** | numeric | YES | - | - | "박스 너비" 표시 | "箱宽" 입력 | "박스 너비" 입력/표시 | cm 단위 |
| **box_height** | numeric | YES | - | - | "박스 높이" 표시 | "箱高" 입력 | "박스 높이" 입력/표시 | cm 단위 |
| **total_boxes** | integer | YES | - | - | "총 박스수" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **total_cbm** | numeric | YES | - | - | "총 CBM" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **other_matters_kr** | text | YES | - | - | "기타사항" 표시 | - | "기타사항" 입력/표시 | 한국어 번역 |
| **other_matters_cn** | text | YES | - | - | - | "其他事项" 입력 | - | 중국 직원 입력 |
| **product_actual_photos** | jsonb | YES | - | - | 사진 표시 | "产品实物照片" 업로드 | "제품실물사진" 표시 | uploaded_files 연동 |
| **product_link** | text | YES | - | - | - | "产品链接" 입력 | - | 고객 미표시 |

### 🎁 샘플 정보 필드 (Staff 입력)
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **sample_available** | boolean | YES | false | - | "샘플재고 유무" 표시 | "样品库存" 체크박스 | "샘플재고 유무" 체크박스 | Staff 입력 |
| **sample_unit_price** | numeric | YES | - | - | "샘플단가" 표시 | "样品单价" 입력 | "샘플단가" 입력/표시 | Staff 입력 (중국단가*환율 참고) |
| **sample_order_qty** | integer | YES | - | - | "샘플 주문 가능 수량" 표시 | "样品订购量" 입력 | "샘플 주문 가능 수량" 입력/표시 | Staff 입력 |
| **sample_weight** | numeric | YES | - | - | "샘플 무게(kg)" 표시 | "样品重量" 입력 | "샘플 무게(kg)" 입력/표시 | Staff 입력 |
| **sample_make_time** | varchar | YES | - | - | "샘플 제작 기간" 표시 | "样品制作时间" 입력 | "샘플 제작 기간" 입력/표시 | Staff 입력 |

### 🚢 수출입/인증 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **hs_code** | varchar | YES | - | - | "HS코드" 표시 | 자동함수호출 | 자동함수호출 | 자동 조회 |--조회 버튼 만들어줘 
| **certification_required** | boolean | YES | - | - | "수입 시 인증 필요" 표시 | 자동함수호출 | 자동함수호출 | 자동 확인 |
| **cert_cost** | numeric | YES | - | - | "인증 예상 비용" 표시 | WebSearch 함수 | WebSearch 함수 | 자동 예상 |
| **export_port** | varchar | YES | - | - | "수출항" 표시 | - | "수출항" 입력/표시 | 한국어 |
| **export_port_cn** | varchar | YES | - | - | - | "出口港" 입력 | - | 중국어 |
| **shipping_method** | varchar | YES | 'LCL' | - | "운송방식" 표시 | 자동계산 표시 | 자동계산 표시 | 15CBM 기준 |
| **customs_rate** | numeric | YES | - | - | "관세율" 표시 | 자동함수호출 | 자동함수호출 | 자동 조회 |
| **customs_duty** | numeric | YES | - | - | "관세" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |

### 💰 가격/비용 필드
| 컬럼명 | 타입 | Nullable | 기본값 | 고객 입력 | 고객 조회 | 중국 직원 (/staff) | 한국 직원 (/staff) | 비고 |
|--------|------|----------|--------|---------|---------|---------|---------|------|
| **china_unit_price** | numeric | YES | - | - | - | "中国单价" 입력 | "중국단가" 입력/표시 | Staff 페이지 전용 |
| **factory_price_rmb** | numeric | YES | - | - | "출고가 RMB" 표시 | - | - | 고객 조회 전용 (china_unit_price와 동일값) |
| **exchange_rate** | numeric | YES | 192.0 | - | "환율" 표시 | exchange_rates.applied_cny_rate 자동조회 + 수동입력 가능 | exchange_rates.applied_cny_rate 자동조회 + 수동입력 가능 | 두리무역 적용환율 (203.00) |
| **exchange_rate_date** | date | YES | - | - | "환율 산정일" 표시 | 자동입력 | 자동입력 | 오늘 날짜 |
| **commission_rate** | numeric | YES | 5.0 | - | "수수료율" 표시 | "5%" 고정 | "5%" 고정 | 5% 고정 |
| **commission_amount** | numeric | YES | - | - | "수수료 금액" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **exw_total** | numeric | YES | - | - | "EXW 합계" 표시 | 자동계산 표시 | 자동계산 표시 | KRW 환산 |
| **china_shipping_fee** | numeric | YES | - | - | "중국 운송료" 표시 | "中国运费" 입력 | "중국 운송료" 입력/표시 | Staff 입력 |
| **lcl_shipping_fee** | numeric | YES | - | - | "LCL 운비" 표시 | 자동계산 표시 | 자동계산 표시 | CBM*90000 |
| **fcl_shipping_fee** | numeric | YES | - | - | "FCL 운비" 표시 | "FCL运费" 입력 | "FCL 운비" 입력/표시 | FCL시 입력 |
| **first_payment_amount** | numeric | YES | - | - | "1차 결제비용" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **import_vat** | numeric | YES | - | - | "부가세" 표시 | 자동계산 표시 | 자동계산 표시 | 10% 자동 |
| **expected_second_payment** | numeric | YES | - | - | "예상 2차결제비용" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **expected_total_supply_price** | numeric | YES | - | - | "예상 총 합계" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **expected_unit_price** | numeric | YES | - | - | "예상 단가(VAT포함)" 표시 | 자동계산 표시 | 자동계산 표시 | 자동계산 |
| **estimated_unit_price** | numeric | YES | - | - | - | - | - | ❌ 삭제됨 (expected_unit_price 사용) |
| **estimated_total_supply** | numeric | YES | - | - | - | - | - | ❌ 삭제됨 (expected_total_supply_price 사용) |

## ✅ 핵심 포인트

1. **중국 직원 미표시 필드**
   - company_name, contact_person, contact_phone, contact_email은 중국직원 화면에 미표시
   - 단, legal_type_kr, company_size_kr은 중국직원도 입력/표시

2. **공장 정보 (중국직원 전용)**
   - factory_contact_person, factory_contact_phone, product_site_url은 고객에게 미표시

3. **필드 중복 및 용도 구분**
   - china_unit_price: Staff 페이지에서만 사용
   - factory_price_rmb: 고객 조회 페이지에서만 사용 (같은 값)
   - product_code: 자동 발급 (Staff 입력 아님)
   - sample_unit_price: Staff가 직접 입력 (자동계산 아님)

4. **자동 함수 호출 필드**
   - hs_code: 제품명 기반 자동 조회
   - certification_required: HS코드 기반 자동 확인
   - cert_cost: WebSearch 활용 예상 비용
   - customs_rate: 관세율 자동 조회
   - exchange_rate: 환율 테이블 참조

### 💰 가격/비용 필드 (21개)
| 컬럼명 | 타입 | Nullable | 기본값 | 사용처 |
|--------|------|----------|--------|--------|
| **china_unit_price** | numeric | YES | - | 중국단가 - Staff 입력 |
| **factory_price_rmb** | numeric | YES | - | 출고가 RMB - Staff 입력 |
| **exchange_rate** | numeric | YES | 192.0 | 환율 - 환율테이블 참조 |
| **exchange_rate_date** | date | YES | - | 환율 산정일 - 자동입력 |
| **commission_rate** | numeric | YES | 5.0 | 수수료율 - 5% 고정 |
| **commission_amount** | numeric | YES | - | 수수료 금액 - 자동계산 |
| **exw_total** | numeric | YES | - | EXW 합계(KRW) - 자동계산 |
| **china_shipping_fee** | numeric | YES | - | 중국 운송료 - Staff 입력 |
| **lcl_shipping_fee** | numeric | YES | - | LCL 운비 - 자동계산 (CBM*90000) |
| **fcl_shipping_fee** | numeric | YES | - | FCL 운비 - Staff 입력 (FCL인 경우) |
| **first_payment_amount** | numeric | YES | - | 1차 결제비용 - 자동계산 |
| **import_vat** | numeric | YES | - | 부가세 - 자동계산 |
| **expected_second_payment** | numeric | YES | - | 예상 2차결제비용 - 자동계산 |
| **expected_total_supply_price** | numeric | YES | - | 예상 총 합계 - 자동계산 |
| **expected_unit_price** | numeric | YES | - | 예상 단가(VAT포함) - 자동계산 |
| **estimated_unit_price** | numeric | YES | - | (중복) 예상 단가 |
| **estimated_total_supply** | numeric | YES | - | (중복) 예상 공급가 |

### 🎨 로고/박스 커스터마이징 필드 (3개)
| 컬럼명 | 타입 | Nullable | 기본값 | 사용처 |
|--------|------|----------|--------|--------|
| **logo_details** | text | YES | - | 로고 상세 - 고객 입력 |
| **box_details** | text | YES | - | 박스 상세 - 고객 입력 |
| **product_link** | text | YES | - | 조사제품 연결 (조회에서 제외) |

## 📊 주요 필드별 사용 현황

### 🌐 중국 직원 화면 (/staff/orders/market-research/[reservationNumber])

| 단계 | 필드 그룹 | 입력 필드 | 자동 계산/호출 필드 |
|------|----------|-----------|------------------|
| **1. 기본정보 확인** | 고객 정보 | - | reservation_number, company_name, contact_*, product_name, requirements |
| **2. 공장정보 입력** | 회사 정보 | industry_cn, company_status_cn, business_scope_cn, factory_contact_person, factory_contact_phone, product_site_url | industry_kr, company_status (번역) |
| **3. 제품사양 입력** | 제품 정보 | product_code, quoted_quantity, units_per_box, box_length, box_width, box_height, work_period, work_duration, other_matters_cn, product_actual_photos | total_boxes, total_cbm (자동계산) |
| **4. 샘플정보 입력** | 샘플 | sample_available, sample_order_qty, sample_weight, sample_make_time | sample_unit_price (중국단가*환율) |
| **5. 가격정보 입력** | 가격/비용 | china_unit_price, factory_price_rmb, china_shipping_fee, fcl_shipping_fee (FCL인 경우), export_port_cn | 모든 자동계산 필드들 |
| **6. 수출입정보** | 인증/물류 | - | hs_code, certification_required, customs_rate (함수호출) |

### 🇰🇷 한국 직원 화면 (동일 경로, isChineseStaff=false)

| 표시 언어 | 중국 직원 | 한국 직원 |
|-----------|----------|----------|
| **라벨** | 중국어 | 한국어 |
| **회사정보** | industry_cn (입력) | industry_kr (번역 표시) |
| **제품정보** | product_name_chinese | product_name (원본) |
| **요구사항** | requirements → 중국어 번역 | requirements (원본) |
| **상태** | "待处理", "调查中", "已完成" | "대기중", "조사중", "완료" |

### 📋 고객 조회 페이지 (/dashboard/orders/market-research/[reservationNumber])

| 탭 | 표시 필드 | 설명 |
|----|----------|------|
| **기본정보** | product_name, research_quantity, moq_check, requirements, logo_*, custom_box_* | 고객 입력값 |
| **공장정보** | industry_kr, legal_type_kr, company_size_kr, established_date, registered_capital, real_paid_capital, company_status, is_small_business, business_scope_kr | Staff 입력 후 번역 표시 |
| **제품정보** | product_code, quoted_quantity, work_period, units_per_box, box_*, total_boxes, total_cbm, other_matters_kr, sample_*, hs_code, certification_required, cert_cost | Staff 입력 + 자동계산 |
| **가격정보** | work_duration, export_port, factory_price_rmb, shipping_method, exchange_rate, exchange_rate_date, commission_rate, commission_amount, china_unit_price, exw_total, china_shipping_fee, fcl/lcl_shipping_fee, first_payment_amount, customs_duty, import_vat, expected_second_payment, expected_total_supply_price, expected_unit_price | 모든 비용 계산값 |

## 💰 자동 계산 로직

```typescript
// 1. 환율 적용
const currentExchangeRate = await getLatestExchangeRate() // 환율 테이블에서 조회
exchange_rate_date = new Date() // 오늘 날짜

// 2. 박스 계산
total_boxes = Math.ceil(quoted_quantity / units_per_box)
total_cbm = (box_length * box_width * box_height) / 1000000 * total_boxes

// 3. 운송방식 자동 결정
shipping_method = total_cbm >= 15 ? 'FCL' : 'LCL'

// 4. 샘플 단가
sample_unit_price = china_unit_price * exchange_rate

// 5. EXW 합계 (한국돈)
exw_total = (china_unit_price * quoted_quantity + china_shipping_fee) * exchange_rate

// 6. 수수료 (5% 고정)
commission_amount = china_unit_price * quoted_quantity * exchange_rate * 0.05

// 7. 1차 결제비용
const commission_vat = commission_amount * 0.1
first_payment_amount = exw_total + commission_amount + commission_vat

// 8. 운송비
if (shipping_method === 'LCL') {
  lcl_shipping_fee = total_cbm * 90000
  shipping_fee = lcl_shipping_fee
} else {
  shipping_fee = fcl_shipping_fee // Staff 입력값
}

// 9. 관세 (관세율은 함수호출로 가져옴)
customs_duty = customs_rate * (exw_total + shipping_fee)

// 10. 부가세
import_vat = (exw_total + shipping_fee + customs_duty) * 0.1

// 11. 2차 결제비용
expected_second_payment = customs_duty + import_vat + shipping_fee

// 12. 예상 총 합계
expected_total_supply_price = first_payment_amount + expected_second_payment

// 13. 예상 단가 (VAT 포함)
expected_unit_price = expected_total_supply_price / quoted_quantity
```

## 🔄 자동 함수 호출

```typescript
// 1. HS코드 자동 조회
if (product_name) {
  const hsResult = await searchHSCode(product_name)
  hs_code = hsResult[0]?.code // 첫번째 추천 코드
}

// 2. 인증 필요 여부 확인
if (hs_code) {
  certification_required = await checkCertificationRequired(hs_code)
}

// 3. 인증 비용 예상 (WebSearch 활용)
if (certification_required && hs_code) {
  cert_cost = await estimateCertificationCost(hs_code, product_name)
}

// 4. 관세율 조회
if (hs_code) {
  customs_rate = await getCustomsRate(hs_code) // 가장 낮은 세율 적용
}
```

## 🚀 상태별 진행 단계

### 중국 직원 화면
```
待处理 (대기) → 调查中 (조사중) → 报价完成 (견적완료) → 调查完成 (조사완료)
```

### 한국 직원 화면
```
대기중 → 조사중 → 견적완료 → 조사완료
```

### 고객 화면
```
접수완료 → 조사진행중 → 견적확인 → 조사완료
```

## ✅ 핵심 구현 포인트

### 1. **번역 처리**
- 중국 직원: `*_cn` 필드 입력, `*_kr` 필드 자동번역
- 한국 직원: 모든 필드 한국어로 표시
- 고객: 모든 중국어 필드를 한국어로 번역 표시

### 2. **권한별 편집**
- 중국 직원: `in_progress` 상태에서만 편집 가능
- 한국 직원: 모든 상태에서 편집 가능
- 고객: 읽기 전용

### 3. **필수 입력 순서**
1. 공장정보 → 2. 제품사양 → 3. 샘플정보 → 4. 가격정보 → 5. 수출입정보

### 4. **파일 처리**
- `product_actual_photos`: 제품 실제사진 (uploaded_files 테이블 연동)
- 고객도 조회 가능

### 5. **진행 상태 자동 변경**
- 모든 필수 정보 입력 완료 시 → `quoted` 상태로 자동 변경
- 최종 보고서 제출 시 → `completed` 상태로 변경

## 🔍 Query 조건 예시

```sql
-- 중국 직원용 조회
SELECT * FROM market_research_requests
WHERE assigned_staff = $1 
OR (assigned_staff IS NULL AND status = 'submitted')
ORDER BY created_at DESC;

-- 한국 직원용 조회 (전체)
SELECT * FROM market_research_requests
ORDER BY created_at DESC;

-- 고객용 조회
SELECT * FROM market_research_requests
WHERE user_id = $1
ORDER BY created_at DESC;

-- 상태별 필터링
SELECT * FROM market_research_requests
WHERE status = $1
AND ($2 IS NULL OR assigned_staff = $2)
ORDER BY created_at DESC;
```

## ⚠️ 주의사항

### 필드 매핑 주의
- `factory_price_rmb` = `china_unit_price` (동일한 값, 다른 용도)
- `expected_total_supply_price` = "예상 총 합계"로 표시
- `expected_unit_price` = "예상 단가 (VAT 포함)"으로 표시

### 자동계산 트리거
- 박스 치수 입력 → total_cbm 계산 → shipping_method 결정
- china_unit_price 입력 → 모든 가격 재계산
- hs_code 입력 → 인증/관세 정보 자동 조회

### 중국직원 전용 필드 (고객 미표시)
- factory_contact_person, factory_contact_phone
- product_site_url
- 모든 `*_cn` 필드들

### 필수 외부 API 연동
1. 환율 조회 API
2. HS코드 검색 API
3. 관세율 조회 API
4. 인증 요구사항 확인 API
5. WebSearch (인증 비용 예상)