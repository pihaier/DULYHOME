# 1688 검색 페이지 리팩토링 계획서

## 📌 현재 상태 분석

### 파일 정보
- **파일 경로**: `/app/1688/search/page.tsx`
- **파일 크기**: 1,279줄
- **문제점**:
  - 모든 로직이 한 파일에 집중
  - 컴포넌트, 훅, 핸들러가 모두 섞여 있음
  - 유지보수 및 테스트 어려움
  - 재사용 불가능

### 현재 구조 분석

#### 1. 인터페이스 정의 (52-104줄)
```typescript
- Product1688: 상품 데이터 구조
- ApiResponse: API 응답 구조
- Category: 카테고리 구조
```

#### 2. 상태 관리 (113-142줄)
```typescript
// 검색 관련
- loading, apiResponse
- sortBy, currentPage
- searchKeyword

// 카테고리 관련
- categories
- selectedCategory, selectedSubCategory
- categoryMenuAnchor, hoveredCategory

// 필터 관련
- selectedFilters (7개 필터)

// 이미지 검색 관련
- imageSearchOpen
- uploadedImage
- imageSearchLoading
- dragActive
```

#### 3. useEffect 훅 (146-228줄)
- query 변경 감지
- 카테고리 로드
- 상품 검색 API 호출

#### 4. 이벤트 핸들러 (230-340줄)
- 페이지네이션: handlePageChange
- 검색: handleSearch, handleKeyPress
- 필터: handleFilterChange
- 이미지: handleImageUpload, handleDrag, handleDrop, handleImageSearch

#### 5. ProductCard 컴포넌트 (344-616줄)
- 내부 컴포넌트로 정의됨
- 272줄의 큰 컴포넌트

#### 6. JSX 렌더링 구조 (618-1278줄)
- 검색바 섹션 (624-716줄)
- 필터 섹션 (719-906줄)
- 카테고리 표시 (911-944줄)
- 상품 리스트 (945-1040줄)
- 카테고리 메뉴 (1045-1138줄)
- 이미지 검색 모달 (1141-1273줄)

## 🎯 리팩토링 목표

1. **파일 크기 감소**: 1,279줄 → 200줄 이하
2. **관심사 분리**: 각 컴포넌트가 단일 책임
3. **재사용성 향상**: 독립적인 컴포넌트
4. **테스트 용이성**: 각 부분을 독립적으로 테스트
5. **유지보수성**: 명확한 구조와 데이터 흐름

## 📁 새로운 폴더 구조

```
/app/1688/search/
├── page.tsx                      # 메인 페이지 (상태 관리 중심)
├── components/
│   ├── SearchBar/
│   │   └── index.tsx             # 검색바 + 인기 키워드
│   ├── FilterSection/
│   │   └── index.tsx             # 필터 UI 전체
│   ├── CategoryMenu/
│   │   └── index.tsx             # 카테고리 드롭다운 메뉴
│   ├── CategoryChips/
│   │   └── index.tsx             # 관련 카테고리 칩들
│   ├── ProductCard/
│   │   └── index.tsx             # 상품 카드
│   ├── ProductGrid/
│   │   └── index.tsx             # 상품 그리드 + 페이지네이션
│   ├── ImageSearchModal/
│   │   └── index.tsx             # 이미지 검색 모달
│   └── SearchResultHeader/
│       └── index.tsx             # 검색 결과 헤더 + 정렬
├── hooks/
│   ├── useProductSearch.ts       # 검색 로직
│   ├── useCategories.ts          # 카테고리 로드
│   └── useImageSearch.ts         # 이미지 검색
└── types/
    └── index.ts                  # 모든 타입 정의
```

## 📊 컴포넌트별 상세 설계

### 1. types/index.ts
```typescript
// 기존 page.tsx의 52-104줄 이동
export interface Product1688 { ... }
export interface ApiResponse { ... }
export interface Category { ... }
export interface SelectedFilters { ... }
```

### 2. components/ProductCard/index.tsx
```typescript
// 기존 page.tsx의 344-616줄 분리
interface ProductCardProps {
  product: Product1688;
  onProductClick?: (offerId: number) => void;
  onInquiry?: (product: Product1688) => void;
}

export default function ProductCard({ product, onProductClick, onInquiry }: ProductCardProps) {
  // 기존 ProductCard 로직
}
```

### 3. components/SearchBar/index.tsx
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onImageSearchOpen: () => void;
  popularKeywords?: string[];
}

export default function SearchBar({ ... }: SearchBarProps) {
  // 기존 624-716줄 로직
}
```

### 4. components/FilterSection/index.tsx
```typescript
interface FilterSectionProps {
  selectedFilters: SelectedFilters;
  onFilterChange: (filterName: string) => void;
  selectedCategory: string;
  selectedSubCategory: string;
  onCategoryMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  categoryLabel: string;
  onReset: () => void;
  categories: Category[];
}

export default function FilterSection({ ... }: FilterSectionProps) {
  // 기존 719-906줄 로직
}
```

### 5. components/CategoryMenu/index.tsx
```typescript
interface CategoryMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  categories: Category[];
  hoveredCategory: number | null;
  onHoverCategory: (categoryId: number | null) => void;
  onSelectCategory: (categoryId: string, subCategoryId?: string) => void;
}

export default function CategoryMenu({ ... }: CategoryMenuProps) {
  // 기존 1045-1138줄 로직
}
```

### 6. components/ImageSearchModal/index.tsx
```typescript
interface ImageSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (imageData: string) => Promise<void>;
}

export default function ImageSearchModal({ ... }: ImageSearchModalProps) {
  // 기존 1141-1273줄 로직
  // 내부 상태: uploadedImage, dragActive
}
```

### 7. components/ProductGrid/index.tsx
```typescript
interface ProductGridProps {
  products: Product1688[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  totalRecords: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onProductClick: (offerId: number) => void;
  apiResponse?: ApiResponse;
}

export default function ProductGrid({ ... }: ProductGridProps) {
  // 기존 984-1040줄 로직
  // ProductCard 컴포넌트 import 사용
}
```

### 8. components/SearchResultHeader/index.tsx
```typescript
interface SearchResultHeaderProps {
  query: string;
  totalRecords: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function SearchResultHeader({ ... }: SearchResultHeaderProps) {
  // 기존 949-981줄 로직
}
```

### 9. components/CategoryChips/index.tsx
```typescript
interface CategoryChipsProps {
  query: string;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function CategoryChips({ ... }: CategoryChipsProps) {
  // 기존 911-944줄 로직
}
```

### 10. hooks/useProductSearch.ts
```typescript
export function useProductSearch(
  query: string,
  page: number,
  sortBy: string,
  filters: SelectedFilters,
  categoryId?: string,
  subCategoryId?: string
) {
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    // 기존 175-228줄 로직
  }, [query, page, sortBy, filters, categoryId, subCategoryId]);

  return { loading, apiResponse };
}
```

### 11. hooks/useCategories.ts
```typescript
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 기존 151-172줄 로직
  }, []);

  return { categories, loading };
}
```

### 12. hooks/useImageSearch.ts
```typescript
export function useImageSearch() {
  const [loading, setLoading] = useState(false);

  const searchByImage = async (imageData: string) => {
    // 기존 293-339줄 로직
  };

  return { searchByImage, loading };
}
```

### 13. page.tsx (리팩토링 후)
```typescript
export default function SearchResultsPage() {
  // URL 파라미터
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // 상태 관리 (최소화)
  const [searchKeyword, setSearchKeyword] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({...});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Custom Hooks
  const { categories } = useCategories();
  const { loading, apiResponse } = useProductSearch(...);
  const { searchByImage } = useImageSearch();

  // UI 상태
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);

  // 핸들러들 (간소화)
  const handleSearch = () => {...};
  const handleFilterChange = (filterName: string) => {...};
  const handleImageSearch = async (imageData: string) => {...};

  return (
    <PageContainer>
      <HpHeader />
      <Box>
        <SearchBar ... />
        <FilterSection ... />
        <Container>
          <CategoryChips ... />
          <SearchResultHeader ... />
          <ProductGrid ... />
        </Container>
      </Box>
      <CategoryMenu ... />
      <ImageSearchModal ... />
      <Footer />
    </PageContainer>
  );
}
```

## 🔄 구현 단계

### Phase 1: 준비 작업
1. ✅ 리팩토링 계획서 작성 (현재 문서)
2. ⬜ 백업 브랜치 생성
3. ⬜ 테스트 시나리오 작성

### Phase 2: 타입 및 유틸리티 분리
4. ⬜ `types/index.ts` 생성 및 인터페이스 이동
5. ⬜ 타입 import 경로 수정

### Phase 3: 독립 컴포넌트 분리
6. ⬜ `ProductCard` 컴포넌트 분리
7. ⬜ `ImageSearchModal` 컴포넌트 분리
8. ⬜ `SearchBar` 컴포넌트 분리

### Phase 4: Custom Hooks 생성
9. ⬜ `useCategories` 훅 생성
10. ⬜ `useProductSearch` 훅 생성
11. ⬜ `useImageSearch` 훅 생성

### Phase 5: 복합 컴포넌트 분리
12. ⬜ `FilterSection` 컴포넌트 분리
13. ⬜ `CategoryMenu` 컴포넌트 분리
14. ⬜ `CategoryChips` 컴포넌트 분리
15. ⬜ `ProductGrid` 컴포넌트 분리
16. ⬜ `SearchResultHeader` 컴포넌트 분리

### Phase 6: 최종 정리
17. ⬜ `page.tsx` 최종 리팩토링
18. ⬜ 불필요한 import 정리
19. ⬜ 기능 테스트
20. ⬜ 성능 최적화

## 🚨 API 호환성 이슈 (중요!)

### 발견된 문제점
1. **API 파라미터 불일치**
   - ❌ 현재: `page` → ✅ 수정: `beginPage`
   - ❌ 현재: 일반 문자열 정렬 → ✅ 수정: JSON 문자열 (예: `{"price":"asc"}`)

2. **필터 값 검증 필요**
   - API 문서 예시: `shipInToday`, `ksCiphertext`
   - 현재 사용: `isJxhy`, `isOnePsale`, `manufacturer`
   - 실제 지원되는 필터 값 확인 필요

3. **타입 정의 수정 필요**
   ```typescript
   // API 응답과 정확히 일치하도록 수정
   interface Product1688 {
     imageUrl: string;
     subject: string;
     subjectTrans: string;
     offerId: number;
     isJxhy: boolean;
     priceInfo: {
       price: string;
       jxhyPrice: string | null;  // nullable
       pfJxhyPrice: string | null; // nullable
       consignPrice: string;
     };
     repurchaseRate: string;
     monthSold: number;
     traceInfo: string;
     isOnePsale: boolean;
     sellerIdentities: string[];  // 배열 타입
   }
   ```

### API 파라미터 매핑 테이블
| 현재 구현 | API 문서 요구사항 | 수정 필요 |
|---------|---------------|----------|
| `page` | `beginPage` | ✅ |
| `sortBy: string` | `sort: JSON string` | ✅ |
| `filter: string` | `filter: 유효한 enum 값` | ✅ |
| `categoryId: string` | `categoryId: number` | ✅ |

## ⚠️ 주의사항

### 필수 체크리스트
- [ ] 각 컴포넌트에 `'use client'` 디렉티브 추가
- [ ] 모든 타입 정의가 올바르게 import 되는지 확인
- [ ] **API 파라미터가 문서와 일치하는지 확인**
- [ ] **nullable 필드 처리 확인**
- [ ] API 호출 로직이 정상 작동하는지 확인
- [ ] 이벤트 핸들러가 올바르게 연결되었는지 확인
- [ ] 상태 업데이트가 정상적으로 반영되는지 확인

### 테스트 시나리오
1. **검색 기능**
   - 키워드 검색 동작 확인
   - Enter 키 검색 동작 확인
   - 인기 키워드 클릭 동작 확인

2. **필터 기능**
   - 각 필터 체크박스 동작 확인
   - 필터 초기화 동작 확인
   - 카테고리 선택 동작 확인

3. **이미지 검색**
   - 이미지 업로드 동작 확인
   - 드래그 앤 드롭 동작 확인
   - 이미지 검색 API 호출 확인

4. **상품 표시**
   - 상품 카드 렌더링 확인
   - 페이지네이션 동작 확인
   - 정렬 기능 동작 확인

5. **상품 상세**
   - 상품 클릭 시 상세 페이지 이동 확인
   - 문의하기 버튼 동작 확인

## 📈 예상 결과

### Before
- `page.tsx`: 1,279줄
- 유지보수: 어려움
- 재사용성: 없음
- 테스트: 어려움

### After
- `page.tsx`: ~200줄
- 각 컴포넌트: 50-150줄
- 유지보수: 용이
- 재사용성: 높음
- 테스트: 각 컴포넌트 독립 테스트 가능

## 🚀 다음 단계

1. 이 계획서 검토 및 승인
2. Phase별로 순차적 구현
3. 각 Phase 완료 후 기능 테스트
4. 문제 발생 시 즉시 롤백

---

**작성일**: 2025-01-20
**작성자**: Claude
**버전**: 1.0.0