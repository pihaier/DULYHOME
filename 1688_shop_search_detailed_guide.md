# 1688 상점 검색 기능 상세 구현 가이드

## 🏪 기능 개요
1688 상품 상세 페이지에서 판매자(상점)의 다른 상품들을 탐색할 수 있는 기능

## 🔑 핵심 정보
- **sellerOpenId**: 상품 상세 API에서 얻은 판매자 고유 ID
- **API Endpoint**: `/alibaba/product/shopQuery`
- **위치**: 상품 상세 페이지 하단에 통합
- **최적화**: Supabase Edge Functions Client 사용 (싱글톤 패턴)
- **성능**: HTTP 연결 재사용으로 2-3배 빠른 응답

## 📁 파일 구조 및 구현 계획

```
nextjs_flexy/
├── supabase/
│   └── functions/
│       └── search-shop-products/      # ✅ Edge Function
│           └── index.ts
├── src/
│   ├── lib/
│   │   └── 1688/
│   │       └── api.ts                 # ✅ API 클라이언트 함수 추가
│   └── app/
│       └── 1688/
│           └── product/
│               └── [offerId]/
│                   ├── components/
│                   │   ├── ShopInfoCard.tsx      # ✅ 새로 생성
│                   │   ├── ShopProductCard.tsx   # ✅ 새로 생성
│                   │   └── ShopProductsSection.tsx # ✅ 새로 생성 (API 호출 포함)
│                   └── page.tsx                   # ✅ 수정 필요
```

## 📝 단계별 구현 내용 (간소화 버전)

### STEP 1: Supabase Edge Function 생성

#### 파일: `/supabase/functions/search-shop-products/index.ts`

```typescript
// 주요 기능:
// 1. sellerOpenId를 받아서 해당 상점의 상품 검색
// 2. 선택적으로 상점 내 키워드 검색 지원
// 3. 페이지네이션, 정렬, 필터 지원
// 4. 캐싱 기능 (선택사항)
// 5. Supabase SDK 최적화 적용

// 필수 파라미터:
- sellerOpenId: string  // 판매자 ID (상품 상세에서 획득)
- beginPage: number     // 페이지 번호
- pageSize: number      // 페이지당 상품 수 (최대 50)
- country: string       // 언어 코드 (ko)

// 선택 파라미터:
- keyword: string       // 상점 내 검색어
- sort: string         // 정렬 옵션 (예: {"price":"asc"})
- filter: string       // 필터 옵션
- priceStart: string   // 최소 가격
- priceEnd: string     // 최대 가격

// 참고: search-1688-products Edge Function과 동일한 구조 사용
// MD5 sign 생성 로직 포함
// CORS 헤더 설정 포함
```

### STEP 2: API 클라이언트 함수 추가 (Supabase SDK 최적화 버전)

#### 파일: `/src/lib/1688/api.ts`

```typescript
// 상점 상품 검색 함수 - Edge Functions Client 사용 (최적화)
import { getEdgeFunctionsClient } from '@/lib/supabase/edge-functions-client';

export async function searchShopProducts({
  sellerOpenId,
  keyword,
  page = 1,
  pageSize = 20,
  sort,
  filter,
  priceStart,
  priceEnd,
}: {
  sellerOpenId: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: string;
  priceStart?: string;
  priceEnd?: string;
}) {
  // Edge Functions 전용 클라이언트 사용 (성능 최적화)
  const functionsClient = getEdgeFunctionsClient();
  
  const { data, error } = await functionsClient.invoke('search-shop-products', {
    body: {
      sellerOpenId,
      keyword,
      beginPage: page,
      pageSize,
      sort,
      filter,
      priceStart,
      priceEnd,
      country: 'ko',
    },
  });
  
  if (error) {
    console.error('Shop search error:', error);
    throw new Error(error.message || '상점 검색 중 오류가 발생했습니다.');
  }
  
  return data;
}
```

#### 참고: Edge Functions Client 구조
```typescript
// /src/lib/supabase/edge-functions-client.ts
// 이미 구현되어 있음 - SUPABASE_EDGE_FUNCTIONS_OPTIMIZATION.md 참조
// 싱글톤 패턴으로 HTTP 연결 재사용
// Multiple GoTrueClient 경고 해결
// 2-3배 성능 향상
```

### STEP 3: ShopProductsSection 컴포넌트 (API 호출 통합)

#### 파일: `/src/app/1688/product/[offerId]/components/ShopProductsSection.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, CircularProgress, Alert } from '@mui/material';
import ShopProductCard from './ShopProductCard';
import type { Product1688 } from '../../../search-v2/types';

interface ShopProductsSectionProps {
  sellerOpenId: string;
  currentProductId: string;  // 현재 보고 있는 상품 제외
  sellerName?: string;
}

export default function ShopProductsSection({
  sellerOpenId,
  currentProductId,
  sellerName,
}: ShopProductsSectionProps) {
  const [products, setProducts] = useState<Product1688[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // 상점 상품 로드 함수
  const loadShopProducts = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import로 초기 로딩 최적화
      const { searchShopProducts } = await import('@/lib/1688/api');
      
      const result = await searchShopProducts({
        sellerOpenId,
        page: pageNum,
        pageSize: 8,  // 컴포넌트에서 8개만 표시
      });
      
      if (result.success) {
        // 현재 상품 제외
        const filteredProducts = result.data.data.filter(
          (product: Product1688) => product.offerId !== currentProductId
        );
        setProducts(filteredProducts);
        setTotalPages(result.data.totalPage);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load shop products:', err);
      setError('상점 상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 로드 (0.5초 지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadShopProducts();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [sellerOpenId]);
  
  // 로딩 상태
  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button size="small" onClick={() => loadShopProducts(page)} sx={{ ml: 2 }}>
          다시 시도
        </Button>
      </Alert>
    );
  }
  
  // 상품이 없는 경우
  if (products.length === 0) {
    return null;
  }
  
  return (
    <Box>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={6} sm={4} md={3} key={product.offerId}>
            <ShopProductCard product={product} />
          </Grid>
        ))}
      </Grid>
      
      {/* 더보기 버튼 */}
      {totalPages > 1 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => loadShopProducts(page + 1)}
            disabled={loading || page >= totalPages}
          >
            {loading ? '로딩 중...' : '더 많은 상품 보기'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
```

### STEP 4: UI 컴포넌트 개발

#### A. ShopInfoCard 컴포넌트

```typescript
// 파일: /components/ShopInfoCard.tsx
// 판매자 정보를 보여주는 카드 컴포넌트

interface ShopInfoCardProps {
  sellerOpenId: string;
  sellerName?: string;
  totalProducts?: number;
  onViewAllProducts: () => void;
}

// UI 구성:
// - 판매자 이름
// - 총 상품 수
// - "전체 상품 보기" 버튼
// - 판매자 평점 (선택사항)
```

#### B. ShopProductCard 컴포넌트

```typescript
// 파일: /components/ShopProductCard.tsx
// 작은 크기의 상품 카드

interface ShopProductCardProps {
  product: Product1688;
  onClick: (offerId: string) => void;
}

// UI 특징:
// - 컴팩트한 디자인
// - 이미지, 제목, 가격만 표시
// - hover 효과
// - 클릭 시 새 탭에서 상품 상세 페이지 열기
```

#### C. ShopProductsSection 컴포넌트

```typescript
// 파일: /components/ShopProductsSection.tsx
// 상점 상품들을 표시하는 메인 섹션

interface ShopProductsSectionProps {
  sellerOpenId: string;
  currentProductId: string;  // 현재 보고 있는 상품 제외
  sellerName?: string;
}

// 기능:
// - 탭 구성: [인기 상품] [최신 상품] [비슷한 가격대]
// - 그리드 레이아웃 (모바일: 2열, 태블릿: 3열, 데스크탑: 4열)
// - 무한 스크롤 또는 "더보기" 버튼
// - 로딩 스켈레톤
// - 에러 처리
```

### STEP 5: 상품 상세 페이지 통합

#### 파일: `/src/app/1688/product/[offerId]/page.tsx`

```typescript
// 추가할 위치: ProductTabs 컴포넌트 아래

{/* 판매자 정보 카드 */}
{productDetail?.sellerOpenId && (
  <Box sx={{ mt: 4 }}>
    <ShopInfoCard
      sellerOpenId={productDetail.sellerOpenId}
      sellerName={productDetail.sellerName || productDetail.sellerLoginId}
      totalProducts={shopProductsCount}
      onViewAllProducts={() => {
        // 전체 상품 보기 모달 또는 페이지 이동
        router.push(`/1688/shop/${productDetail.sellerOpenId}`);
      }}
    />
  </Box>
)}

{/* 같은 판매자의 다른 상품들 */}
{productDetail?.sellerOpenId && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
      이 판매자의 다른 상품
    </Typography>
    <ShopProductsSection
      sellerOpenId={productDetail.sellerOpenId}
      currentProductId={offerId}
      sellerName={productDetail.sellerName}
    />
  </Box>
)}
```

## 🎨 UI/UX 상세 설계

### 데스크탑 레이아웃
```
┌─────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────┐  │
│  │  📦 판매자 정보                            │  │
│  │  이름: ABC무역                             │  │
│  │  상품: 1,234개 | 평점: ⭐4.5              │  │
│  │  [전체 상품 보기] [판매자 문의]            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ━━━━━━━━ 이 판매자의 인기 상품 ━━━━━━━━      │
│                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │     │ │     │ │     │ │     │              │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │              │
│  │     │ │     │ │     │ │     │              │
│  ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│  │제목 │ │제목 │ │제목 │ │제목 │              │
│  │¥123 │ │¥456 │ │¥789 │ │¥012 │              │
│  └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │     │ │     │ │     │ │     │              │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │              │
│  │     │ │     │ │     │ │     │              │
│  ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│  │제목 │ │제목 │ │제목 │ │제목 │              │
│  │¥345 │ │¥678 │ │¥901 │ │¥234 │              │
│  └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                  │
│           [더 많은 상품 보기]                    │
└─────────────────────────────────────────────────┘
```

### 모바일 레이아웃
```
┌─────────────────┐
│ 📦 판매자 정보   │
│ ABC무역         │
│ 1,234개 상품    │
│ [전체 보기]     │
├─────────────────┤
│ 인기 상품       │
├────────┬────────┤
│  IMG   │  IMG   │
│  제목  │  제목  │
│  ¥123  │  ¥456  │
├────────┼────────┤
│  IMG   │  IMG   │
│  제목  │  제목  │
│  ¥789  │  ¥012  │
├────────┴────────┤
│   [더보기]      │
└─────────────────┘
```

## 🔧 구현 시 주의사항

### 1. sellerOpenId 확인
```typescript
// 상품 상세 API 응답에서 sellerOpenId 추출
const sellerOpenId = productDetail?.sellerOpenId || 
                     productDetail?.seller?.openId ||
                     productDetail?.supplierUserId;
```

### 2. 현재 상품 제외
```typescript
// 현재 보고 있는 상품은 목록에서 제외
const filteredProducts = products.filter(
  product => product.offerId !== currentProductId
);
```

### 3. 이미지 프록시 처리
```typescript
// 모든 1688 이미지는 프록시를 통해 로드
const proxyImageUrl = `/api/1688/image-proxy?url=${encodeURIComponent(imageUrl)}`;
```

### 4. 에러 처리
```typescript
// sellerOpenId가 없는 경우 섹션 자체를 표시하지 않음
if (!sellerOpenId) return null;

// API 에러 시 재시도 버튼 표시
if (error) {
  return <ErrorMessage onRetry={retry} />;
}
```

### 5. 성능 최적화 (Supabase SDK 최적화 적용)
```typescript
// 1. Edge Functions Client 싱글톤 패턴
//    - HTTP 연결 재사용으로 2-3배 성능 향상
//    - Multiple GoTrueClient 경고 해결

// 2. Dynamic Import 활용
//    - 필요한 시점에만 API 함수 로드
//    - 초기 번들 크기 감소

// 3. 지연 로딩
//    - 메인 상품 로딩 후 0.5초 후 상점 상품 로드
//    - Intersection Observer로 스크롤 시 로드 가능

// 4. 이미지 최적화
//    - next/image의 lazy loading
//    - 프록시를 통한 이미지 캐싱

// 5. 캐싱 전략
//    - Edge Function 레벨: 24시간 캐시
//    - 브라우저 레벨: SWR 또는 React Query 활용 가능

// 6. 페이지네이션
//    - 한 번에 20개씩만 로드
//    - 무한 스크롤 또는 "더보기" 버튼
```

## 🚀 배포 및 테스트

### 1. Edge Function 배포
```bash
cd erp-custom
npx supabase functions deploy search-shop-products
```

### 2. 환경변수 확인
```bash
# .env.local에 필요한 변수들 (이미 설정되어 있음)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DAJI_APP_KEY=your_key
DAJI_APP_SECRET=your_secret
```

### 3. Edge Functions Client 확인
```typescript
// /src/lib/supabase/edge-functions-client.ts
// 이미 최적화된 클라이언트가 구현되어 있음
// 싱글톤 패턴으로 성능 최적화
// Multiple GoTrueClient 경고 해결
```

### 3. 테스트 시나리오
- [ ] sellerOpenId가 있는 상품 페이지 확인
- [ ] 상점 상품 목록 로드 확인
- [ ] 페이지네이션 동작 확인
- [ ] 상품 클릭 시 새 탭에서 열기
- [ ] 모바일/태블릿 반응형 확인
- [ ] 로딩/에러 상태 확인

## 📊 예상 API 응답 구조

```json
{
  "success": true,
  "data": {
    "sellerOpenId": "BBBEjczPHMQ_zHE-67YyNGXyw",
    "totalRecords": 2000,
    "totalPage": 100,
    "pageSize": 20,
    "currentPage": 1,
    "data": [
      {
        "imageUrl": "https://cbu01.alicdn.com/...",
        "subject": "상품 제목 (중문)",
        "subjectTrans": "상품 제목 (번역)",
        "offerId": "769649076522",
        "priceInfo": {
          "price": "12.00",
          "consignPrice": "12.00"
        },
        "monthSold": 2456,
        "repurchaseRate": "20%"
      }
    ]
  }
}
```

## 🔄 향후 개선사항

1. **상점 전용 페이지**
   - `/1688/shop/[sellerOpenId]` 라우트 추가
   - 전체 상품 목록 및 필터링 기능

2. **상점 비교 기능**
   - 여러 상점의 비슷한 상품 가격 비교

3. **상점 즐겨찾기**
   - 자주 방문하는 상점 저장 기능

4. **상점 평가 시스템**
   - 구매 경험 기반 평가 및 리뷰

5. **상점 통계 대시보드**
   - 판매 트렌드, 인기 카테고리 분석