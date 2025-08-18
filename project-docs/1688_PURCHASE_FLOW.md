# 1688 구매 프로세스 정의서

> 작성일: 2024-12-28  
> 버전: 1.0  
> 목적: 1688 플랫폼의 구매, 견적, 맞춤제작 프로세스 명확화

## 📌 개요

본 문서는 1688 중국 도매 플랫폼 제품의 구매 프로세스를 정의합니다. 고객의 다양한 니즈(즉시구매, 견적요청, 맞춤제작)에 따라 세 가지 주요 프로세스로 구분하여 운영합니다.

## 🔄 프로세스 구분

### A. 즉시 구매 프로세스 (Standard Purchase)

**용도**: 표준 제품을 커스터마이징 없이 즉시 구매

**플로우**:
```
1. 제품 검색/탐색
2. 제품 상세 페이지 진입
3. 옵션 선택 (색상, 사이즈 등)
4. 수량 입력
5. 장바구니 담기
6. 장바구니 확인
7. 결제 진행
8. 주문 완료
```

**특징**:
- 커스터마이징 없음
- 실시간 가격 확인
- 빠른 처리 (당일 주문 확정)
- 표준 배송비 적용

**데이터 저장**:
- 테이블: `cart_items_1688` → `orders`
- 상태: `pending` → `paid` → `processing` → `shipped`

### B. 견적 요청 프로세스 (Quote Request)

**용도**: 가격 협상, 대량 구매, 배송비 조정이 필요한 경우

**플로우**:
```
1. 제품들을 장바구니에 담기 (단일 또는 복수)
2. 장바구니 페이지에서 "견적 요청" 버튼 클릭
3. 추가 요구사항 작성 (선택)
4. 견적 요청 제출
5. 중국직원이 공장과 협의
6. 견적서 발행 (24-48시간 내)
7. 고객 견적 확인
8. 견적 승인 시 결제 진행
9. 주문 완료
```

**특징**:
- 여러 제품 통합 견적 가능
- 가격 협상 가능
- 대량 구매 할인 적용
- 맞춤 배송비 산정
- 결제 조건 협의 가능 (선금/잔금)

**데이터 저장**:
- 테이블: `cart_items_1688` → `quote_requests` → `quotes` → `orders`
- 상태: `requested` → `quoted` → `approved` → `paid`

**견적서 포함 내용**:
```json
{
  "quote_number": "QT-20241228-123456",
  "items": [
    {
      "product_name": "제품명",
      "quantity": 1000,
      "unit_price": 5000,
      "total_price": 5000000
    }
  ],
  "shipping_fee": 200000,
  "handling_fee": 100000,
  "total_amount": 5300000,
  "valid_until": "2024-12-31",
  "payment_terms": "50% 선금, 50% 잔금",
  "delivery_time": "15-20일"
}
```

### C. 맞춤 제작 프로세스 (Customization Request)

**용도**: 로고 인쇄, 포장 변경, 사양 변경 등 커스터마이징이 필요한 경우

**플로우**:
```
1. 제품 상세 페이지에서 "맞춤 제작 문의" 버튼 클릭
2. 시장조사 신청 페이지로 이동 (제품 정보 자동 입력)
3. 커스터마이징 상세 내용 작성
   - 로고 파일 업로드
   - 포장 디자인 업로드
   - 상세 요구사항 작성
4. 신청서 제출
5. 중국직원이 공장과 상담
6. 샘플 제작 (필요시)
7. 샘플 확인 및 승인
8. 최종 견적서 발행
9. 결제 진행
10. 생산 시작
11. 품질 검수
12. 배송
```

**특징**:
- 상세 커스터마이징 지원
- 파일 업로드 기능
- 샘플 제작 프로세스
- 품질 검수 포함
- 생산 진행 상황 실시간 공유

**데이터 저장**:
- 테이블: `market_research_requests` → `customization_quotes` → `orders`
- 상태: `submitted` → `consulting` → `sample_making` → `approved` → `production`

## 🎨 UI/UX 가이드

### 제품 상세 페이지 버튼 배치

```html
<div class="product-actions">
  <!-- 기본 구매 액션 -->
  <button class="primary">
    🛒 장바구니 담기
  </button>
  
  <!-- 커스터마이징 액션 -->
  <button class="secondary">
    🎨 맞춤 제작 문의
  </button>
</div>
```

### 장바구니 페이지 액션

```html
<div class="cart-actions">
  <!-- 즉시 구매 -->
  <button class="primary">
    💳 바로 구매
  </button>
  
  <!-- 견적 요청 -->
  <button class="secondary">
    📋 견적 요청
  </button>
  
  <p class="help-text">
    💡 여러 제품을 선택하여 통합 견적을 받아보세요
  </p>
</div>
```

### 프로세스별 안내 메시지

**즉시 구매**:
> "선택하신 제품을 바로 구매합니다. 표시된 가격으로 즉시 결제가 진행됩니다."

**견적 요청**:
> "선택하신 제품들의 최적 가격을 제안드립니다. 대량 구매 시 할인이 적용될 수 있습니다."

**맞춤 제작**:
> "로고, 포장, 사양 변경이 필요하신가요? 전문 상담을 통해 맞춤 제작을 도와드립니다."

## 💾 데이터베이스 구조

### 1. cart_items_1688 테이블 수정

**제거할 컬럼**:
- ❌ `is_sample_needed`
- ❌ `is_logo_needed`
- ❌ `is_custom_packaging`

**유지할 컬럼**:
- ✅ `memo` - 간단한 메모용

### 2. quote_requests 테이블 (신규)

```sql
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL, -- QR-YYYYMMDD-XXXXXX
  user_id UUID REFERENCES auth.users(id),
  source_type VARCHAR(20), -- 'cart', 'single', 'bulk'
  items JSONB NOT NULL, -- 제품 정보 배열
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'requested',
  assigned_staff UUID REFERENCES auth.users(id),
  quoted_at TIMESTAMP WITH TIME ZONE,
  quote_data JSONB, -- 견적 상세 정보
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 상태 흐름

```
즉시구매: cart → order
견적요청: cart → quote_request → quote → order
맞춤제작: market_research → consultation → quote → order
```

## 📊 프로세스 선택 가이드

| 상황 | 추천 프로세스 | 이유 |
|------|--------------|------|
| 10개 미만 표준 제품 구매 | 즉시 구매 | 빠른 처리, 명확한 가격 |
| 100개 이상 대량 구매 | 견적 요청 | 대량 할인 가능 |
| 여러 종류 제품 동시 구매 | 견적 요청 | 통합 배송비 절감 |
| 로고 인쇄 필요 | 맞춤 제작 | 파일 업로드 및 상담 필요 |
| 포장 변경 필요 | 맞춤 제작 | 디자인 상담 필요 |
| 제품 사양 변경 | 맞춤 제작 | 기술 상담 필요 |
| 가격 협상 희망 | 견적 요청 | 협상 가능 |
| 샘플 먼저 확인 | 맞춤 제작 | 샘플 프로세스 포함 |

## 🔄 프로세스 전환

고객은 필요에 따라 프로세스를 전환할 수 있습니다:

1. **장바구니 → 견적**: 장바구니에 담은 후 견적 요청 가능
2. **견적 → 구매**: 견적 확인 후 즉시 구매로 전환 가능
3. **구매 → 맞춤제작**: 구매 전 맞춤제작 문의로 전환 가능

## 📱 모바일 대응

모든 프로세스는 모바일에서도 원활하게 작동해야 합니다:
- 터치 친화적 버튼 크기 (최소 44x44px)
- 스와이프로 제품 이미지 확인
- 간소화된 입력 폼
- 모바일 최적화 파일 업로드

## 🚀 구현 우선순위

1. **Phase 1**: 장바구니 체크박스 제거 및 UI 정리
2. **Phase 2**: 맞춤 제작 문의 버튼 및 연동
3. **Phase 3**: 견적 요청 시스템 구축
4. **Phase 4**: 통합 대시보드 구현

## 📈 성공 지표 (KPI)

- 평균 주문 완료 시간 단축 (목표: 30% 감소)
- 견적 요청 전환율 (목표: 15% 이상)
- 맞춤 제작 문의 증가율 (목표: 월 20% 성장)
- 고객 만족도 (목표: 4.5/5.0 이상)

## 🔍 자주 묻는 질문 (FAQ)

**Q: 장바구니에 담은 제품을 일부는 구매, 일부는 견적 요청할 수 있나요?**
> A: 네, 장바구니에서 제품을 선택하여 원하는 액션을 수행할 수 있습니다.

**Q: 견적 요청 후 응답 시간은 얼마나 걸리나요?**
> A: 일반적으로 24-48시간 내에 견적서를 받아보실 수 있습니다.

**Q: 맞춤 제작 시 최소 수량이 있나요?**
> A: 제품과 커스터마이징 내용에 따라 다르며, 상담을 통해 확인 가능합니다.

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2024-12-28 | 1.0 | 최초 작성 | System |

---

*본 문서는 지속적으로 업데이트됩니다. 최신 버전은 항상 이 파일을 참조하세요.*