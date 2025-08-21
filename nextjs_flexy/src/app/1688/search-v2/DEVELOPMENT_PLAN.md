# 1688 Search-v2 카테고리 시스템 교체 계획

## 📋 현재 상황 분석

### 현재 구현된 카테고리 시스템
- **위치**: `components/CategorySelector/`
- **기능**: 전체 카테고리 트리 구조 (1급 → 2급 카테고리)
- **API**: `get-categories` Edge Function
- **문제점**: 키워드 검색과 연관성 없는 전체 카테고리 표시

### 목표 시스템 (多语言搜索导航 API)
- **API**: `/alibaba/product/keywordSNQuery`
- **기능**: 키워드 검색 시 관련 카테고리만 상단에 표시
- **장점**: 검색 결과와 직접적으로 연관된 카테고리 네비게이션 제공

## 🎯 구현 목표

1. **기존 CategorySelector 제거**
2. **키워드 기반 카테고리 네비게이션 구현**
3. **검색 결과 상단에 관련 카테고리 표시**

## 📝 작업 계획

### Phase 1: 기존 카테고리 시스템 제거

#### 1.1 제거할 파일들
```
components/CategorySelector/
├── CategorySelector.tsx        # 삭제
├── CategoryChip.tsx            # 삭제
├── SubcategoryList.tsx         # 삭제
└── index.ts                    # 삭제

hooks/useCategories1688.ts      # 삭제
```

#### 1.2 수정할 파일들
- `page.tsx`: CategorySelector 컴포넌트 import 및 사용 제거
- `types/index.ts`: 불필요한 카테고리 타입 정의 제거

### Phase 2: 새로운 키워드 카테고리 시스템 구현

#### 2.1 새로 생성할 파일들
```
components/KeywordCategoryNav/
├── KeywordCategoryNav.tsx      # 메인 네비게이션 컴포넌트
├── CategoryBadge.tsx           # 카테고리 배지 컴포넌트
└── index.ts                    # 배럴 export

hooks/useKeywordCategories.ts   # 키워드 카테고리 로직
```

#### 2.2 Edge Function 생성
```
supabase/functions/get-keyword-categories/
├── index.ts                    # keywordSNQuery API 호출
└── types.ts                    # 타입 정의
```

## 🔧 구현 상세

### 1. KeywordCategoryNav 컴포넌트
```typescript
interface KeywordCategoryNavProps {
  keyword: string;
  onCategorySelect: (categoryId: string) => void;
}

// 기능:
// - 키워드 입력 시 관련 카테고리 자동 로드
// - 검색 결과 상단에 가로 스크롤 형태로 표시
// - 선택 시 해당 카테고리로 필터링
```

### 2. useKeywordCategories Hook
```typescript
export function useKeywordCategories(keyword: string) {
  // 1. 키워드 변경 시 debounce 처리
  // 2. keywordSNQuery API 호출
  // 3. 카테고리 데이터 캐싱
  // 4. 에러 처리
  
  return {
    categories,
    loading,
    error,
    selectedCategory,
    selectCategory
  };
}
```

### 3. API 구조
```typescript
// Request
interface KeywordCategoryRequest {
  keyword: string;
  language?: string;  // 기본값: 'zh_CN'
  region?: string;    // 기본값: 'CN'
  currency?: string;  // 기본값: 'CNY'
}

// Response
interface KeywordCategoryResponse {
  categoryID: number;
  name: string;
  level: number | null;
  isLeaf: boolean;
  parentIDs: number[];
  childCategorys?: Array<{
    id: number;
    name: string;
    categoryType: string;
    isLeaf: boolean;
  }>;
}
```

## 🎨 UI/UX 설계

### 레이아웃 변경
```

Before (현재):
┌─────────────────────────────────┐
│         SearchBar               │
├─────────────────────────────────┤
│    CategorySelector (트리형)     │
├─────────────────────────────────┤
│         ProductGrid             │
└─────────────────────────────────┘

After (목표):
┌─────────────────────────────────┐
│         SearchBar               │
├─────────────────────────────────┤
│  KeywordCategoryNav (가로스크롤) │  ← 키워드 관련 카테고리만
├─────────────────────────────────┤
│         ProductGrid             │
└─────────────────────────────────┘
```

### 스타일링
- 가로 스크롤 가능한 카테고리 배지
- 선택된 카테고리 하이라이트
- 모바일 반응형 디자인

## 📊 예상 변경 사항

### 삭제될 코드 라인
- 약 500줄 (CategorySelector 관련)
- 약 150줄 (useCategories1688 Hook)

### 추가될 코드 라인
- 약 200줄 (KeywordCategoryNav 컴포넌트)
- 약 100줄 (useKeywordCategories Hook)
- 약 80줄 (Edge Function)

### 성능 개선
- 불필요한 전체 카테고리 로드 제거
- 키워드 관련 카테고리만 로드하여 네트워크 사용량 감소
- 사용자 경험 개선 (관련 카테고리만 표시)

## ⚠️ 주의사항

1. **하위 호환성**: 기존 검색 기능이 중단되지 않도록 단계별 구현
2. **에러 처리**: 카테고리 로드 실패 시에도 검색 기능 유지
3. **캐싱 전략**: 동일 키워드에 대한 중복 API 호출 방지
4. **모바일 최적화**: 터치 스크롤 및 반응형 디자인 필수

## 📅 예상 일정

- **Day 1**: 기존 카테고리 시스템 제거
- **Day 2**: KeywordCategoryNav 컴포넌트 구현
- **Day 3**: Edge Function 및 API 연동
- **Day 4**: 테스트 및 버그 수정
- **Day 5**: 최적화 및 배포

## ✅ 체크리스트

- [ ] 기존 CategorySelector 관련 코드 제거
- [ ] KeywordCategoryNav 컴포넌트 생성
- [ ] useKeywordCategories Hook 구현
- [ ] get-keyword-categories Edge Function 생성
- [ ] page.tsx 통합
- [ ] 모바일 반응형 테스트
- [ ] 에러 처리 테스트
- [ ] 성능 테스트
- [ ] 배포 준비

## 🔄 롤백 계획

만약 문제가 발생할 경우:
1. Git 이전 커밋으로 롤백
2. 기존 CategorySelector 시스템 복원
3. 점진적 마이그레이션 전략으로 전환

---

**작성일**: 2025-01-28
**작성자**: Claude
**상태**: 계획 수립 완료, 구현 대기