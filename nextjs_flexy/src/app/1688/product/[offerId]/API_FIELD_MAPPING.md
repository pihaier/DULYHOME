# API 필드 매핑 가이드 (완전판)

## 📌 이 문서의 목적
- `商品详情搜索.md`: API 스펙 정의 (중국어, 기술적 정의)
- **이 문서**: 한국어 표시명 + 실제 UI 매핑 + 구현 상태 추적

## 📌 API 실제 리턴값 완전 분석 (api리턴값.md 기준)

## 🔴 필수 표시 필드 (사용자에게 반드시 보여줘야 함)

### 실제 API에 존재하는 필드들

| API 필드명 | 실제 값 예시 | 표시 이름 | 표시 위치 | 구현 상태 |
|------------|-------------|-----------|-----------|-----------|
| `subject` | "跨境速卖通热卖混款..." | 원본 제목 | ProductInfo | ✅ 구현됨 |
| `subjectTrans` | "크로스 국경 AliExpress..." | 번역된 제목 | ProductInfo | ✅ 구현됨 |
| `productImage.images[]` | ["https://cbu01..."] | 상품 이미지 | ProductImageGallery | ✅ 구현됨 |
| `mainVideo` | "https://cloud.video..." | 메인 비디오 | ProductImageGallery | ✅ 구현됨 |
| **`productSkuInfos[].price`** | "1.5" | 가격 | SkuSelector | ✅ 구현됨 |
| **`productSkuInfos[].promotionPrice`** | "1.43" | 할인가 | SkuSelector | ✅ 구현됨 |
| **`productSkuInfos[].amountOnSale`** | 1386 | 재고 수량 | SkuSelector | ✅ 구현됨 |
| **`productSkuInfos[].skuAttributes`** | [{색상: "실버"}] | SKU 옵션 | SkuSelector | ✅ 구현됨 |
| **`minOrderQuantity`** | 1 | 최소 주문 수량 | ProductInfo | ✅ 구현됨 |
| **`productSaleInfo.priceRangeList`** | [{1개: "1.5"}] | 구간별 가격 | ProductInfo | ✅ 구현됨 |
| **`productShippingInfo.sendGoodsAddressText`** | "浙江省金华市" | 배송지 | ProductInfo, ProductTabs | ✅ 구현됨 |
| **`soldOut`** | "805" | 총 판매량 | ProductTabs (판매 정보) | ✅ 구현됨 |

## 🟡 선택적 표시 필드 (있으면 좋지만 필수는 아님)

| API 필드명 | 실제 값 예시 | 표시 이름 | 표시 위치 | 구현 상태 |
|------------|-------------|-----------|-----------|-----------|
| `productAttribute[]` | [{재료: "티타늄"}] | 제품 속성 | ProductTabs (제품 속성) | ✅ 구현됨 |
| `sellerDataInfo.compositeServiceScore` | "4.0" | 종합 서비스 점수 | SupplierInfo | ✅ 구현됨 |
| `sellerDataInfo.repeatPurchasePercent` | "0.6236" | 재구매율 | ProductTabs, SupplierInfo | ✅ 구현됨 |
| `sellerDataInfo.qualityRefundWithin30Day` | "0.0035" | 품질 환불율 | ProductTabs | ✅ 구현됨 |
| `sellerDataInfo.collect30DayWithin48HPercent` | "1.0" | 48시간 내 수금율 | ProductTabs | ✅ 구현됨 |
| `tagInfoList[]` | [{isOnePsale: true}] | 서비스 태그 | ProductInfo | ✅ 구현됨 |
| **`sellerMixSetting.mixAmount`** | 30 | 혼합 주문 최소 금액 | SupplierInfo | ✅ 구현됨 |
| **`sellerMixSetting.mixNumber`** | 5 | 혼합 주문 최소 수량 | SupplierInfo | ✅ 구현됨 |
| **`productCargoNumber`** | "E245" | 화물번호/상품코드 | ProductInfo | ✅ 구현됨 |
| `createDate` | "2025-03-28 23:36:01" | 등록일 | ProductInfo | ✅ 구현됨 |
| `tradeScore` | "0.0" | 거래 점수 | ProductInfo | ✅ 구현됨 |
| `offerIdentities[]` | ["powerful_merchants"] | 공급업체 인증 | ProductInfo | ✅ 구현됨 |
| `topCategoryId` | 54 | 1차 카테고리 | ProductInfo | ✅ 구현됨 |
| `secondCategoryId` | 122704002 | 2차 카테고리 | ProductInfo | ✅ 구현됨 |
| `thirdCategoryId` | 122700006 | 3차 카테고리 | ProductInfo | ✅ 구현됨 |

## 🔵 거래 조건 탭에 표시해야 할 필드 (실제 API 값 확인)

### API에 실제로 존재하는 필드들

| API 필드명 | 실제 값 예시 | 표시 이름 | 현재 코드 문제 |
|------------|-------------|-----------|---------------|
| **`sellerMixSetting.generalHunpi`** | true | 혼합 주문 가능 | ❌ supportMix로 잘못 접근 |
| **`sellerMixSetting.mixAmount`** | 30 | 최소 혼합 금액 | ❌ 표시 안됨 |
| **`sellerMixSetting.mixNumber`** | 5 | 최소 혼합 수량 | ❌ 표시 안됨 |
| **`batchNumber`** | null | 배치 수량 | ❌ productSaleInfo.batchNumber로 잘못 접근 |
| **`minOrderQuantity`** | 1 | 최소 주문 수량 | ❌ 거래 조건 탭에 추가 필요 |
| **`productSaleInfo.unitInfo`** | {unit: "个"} | 판매 단위 | ❌ 표시 안됨 |
| **`isJxhy`** | true | 프리미엄 상품 | ❌ 거래 조건 탭에 추가 필요 |
| **`tagInfoList`** 중 일부 | | 거래 관련 태그 | ❌ 거래 조건 탭에 추가 필요 |
| **`promotionModel`** | {hasPromotion: true} | 프로모션 여부 | ❌ 표시 안됨 |

## 🟠 실제 API에 있지만 현재 표시 안하는 필드들

| API 필드명 | 실제 값 예시 | 표시 추천 여부 | 이유 |
|------------|-------------|---------------|------|
| **`leadTime`** | 없음 (API에 없음) | ❌ | API에 존재하지 않음 |
| **`availableQuantity`** | 없음 (API에 없음) | ❌ | API에 존재하지 않음 |
| **`supplierModel`** | 없음 (API에 없음) | ❌ | API에 존재하지 않음 |
| **`in48HoursPercent`** | "1.0" | ⭕ | collect30DayWithin48HPercent로 존재 |
| **`qualityReturnPercent`** | "0.0035..." | ⭕ | qualityRefundWithin30Day로 존재 |

## 🚨 누락된 중요 필드들 (추가 필요)

### 1. 응답 구조 필드 (에러 처리용)
| API 필드명 | 실제 값 예시 | 표시 이름 | 표시 위치 | 구현 상태 |
|------------|-------------|-----------|-----------|-----------|
| `success` | true | API 성공 여부 | ErrorBoundary | ❌ 누락 |
| `code` | 200 | 응답 코드 | ErrorBoundary | ❌ 누락 |
| `message` | "操作成功" | 응답 메시지 | ErrorBoundary | ❌ 누락 |

### 2. 판매자 상세 평가 점수 (sellerDataInfo)
| API 필드명 | 실제 값 예시 | 표시 이름 | 표시 위치 | 구현 상태 |
|------------|-------------|-----------|-----------|-----------|
| `sellerDataInfo.tradeMedalLevel` | "3" | 거래 메달 레벨 | SupplierInfo | ✅ 구현됨 |
| `sellerDataInfo.logisticsExperienceScore` | "4.0" | 물류 서비스 점수 | SupplierInfo | ✅ 구현됨 |
| `sellerDataInfo.disputeComplaintScore` | "4.0" | 분쟁 처리 점수 | SupplierInfo | ❌ 누락 |
| `sellerDataInfo.offerExperienceScore` | "3.0" | 상품 품질 점수 | SupplierInfo | ✅ 구현됨 |
| `sellerDataInfo.consultingExperienceScore` | "2.0" | 상담 서비스 점수 | SupplierInfo | ❌ 누락 |
| `sellerDataInfo.afterSalesExperienceScore` | "3.7" | 애프터서비스 점수 | SupplierInfo | ✅ 구현됨 |

### 3. 배송 정보 상세 (productShippingInfo)
| API 필드명 | 실제 값 예시 | 표시 이름 | 표시 위치 | 구현 상태 |
|------------|-------------|-----------|-----------|-----------|
| `productShippingInfo.shippingTimeGuarantee` | null | 배송 시간 보장 | ProductTabs | ❌ 누락 |
| `productShippingInfo.skuShippingDetails[]` | [{skuId, weight, width, length, height}] | SKU별 상세 배송정보 | ProductTabs | ✅ 구현됨 |
| `productShippingInfo.pkgSizeSource` | null | 포장 사이즈 출처 | ProductTabs | ❌ 누락 |

## ⚫ 불필요한 필드 (표시하지 말아야 함)

| API 필드명 | 실제 값 | 이유 |
|------------|---------|------|
| `offerId` | 903006215326 | 내부 ID, 사용자에게 의미 없음 |
| `categoryId` | 122700006 | 내부 ID, 이름으로 표시 |
| `categoryName` | null | 값이 없음 |
| `sellerOpenId` | "BBBL9S1tA..." | 내부 판매자 ID |
| `status` | "published" | 내부 상태값 |
| `traceInfo` | "object_id@..." | 디버깅용 정보 |
| `specId` | "4fcc51fe..." | 내부 스펙 ID |
| `skuId` | 5793211060881 | 내부 SKU ID |
| `detailVideo` | null | 값이 없음 |
| `jxhyPrice` | null | 값이 없음 |
| `pfJxhyPrice` | null | 값이 없음 |
| `channelPrice` | null | 값이 없음 |
| `sellingPoint` | null | 값이 없음 |
| `quoteType` | 1 | 내부 견적 타입 |
| `consignPrice` | "1.5" | price와 중복 |

## 🔧 즉시 수정 필요 사항

### 1. 거래 조건 탭 수정 (실제 API 경로)
```javascript
// ❌ 잘못된 코드 (API에 없는 필드)
productDetail?.productSaleInfo?.supportMix     // API에 없음
productDetail?.productSaleInfo?.batchNumber    // API에 없음 (최상위에 있음)
productDetail?.productSaleInfo?.retailPrice    // API에 없음
productDetail?.supplierInfo?.tpYear           // API에 없음
productDetail?.supplierInfo?.isTP             // API에 없음
productDetail?.customizationInfo              // API에 없음

// ✅ 올바른 접근 (실제 API 필드)
productDetail?.sellerMixSetting?.generalHunpi  // true
productDetail?.sellerMixSetting?.mixAmount     // 30
productDetail?.sellerMixSetting?.mixNumber     // 5
productDetail?.batchNumber                     // null (최상위 필드)
productDetail?.minOrderQuantity                // 1 (최상위 필드)
productDetail?.isJxhy                         // true (최상위 필드)
productDetail?.tagInfoList                    // 배열로 존재
productDetail?.promotionModel?.hasPromotion    // true
productDetail?.productSaleInfo?.unitInfo       // {unit: "个", transUnit: "하나"}
```

### 2. 추가로 표시해야 할 정보
- 판매 단위 (`productSaleInfo.unitInfo.transUnit`)
- 프로모션 정보 (`promotionModel.hasPromotion`)
- 드롭시핑 지원 (`tagInfoList`에서 `isOnePsale`)
- 무료배송 (`tagInfoList`에서 `isOnePsaleFreePostage`)

## 📋 체크리스트

- [ ] 거래 조건 탭 필드 경로 수정
- [ ] 누락된 거래 조건 정보 추가
- [ ] 중복된 정보 제거
- [ ] null 값 처리 로직 개선
- [ ] 의미없는 내부 ID 표시 제거