// 1688 API 타입 정의 (API 문서 기반)

// ==================== 상품 관련 타입 ====================

// 상품 정보
export interface Product1688 {
  imageUrl: string;
  subject: string;
  subjectTrans: string;
  offerId: number;
  isJxhy: boolean;
  priceInfo: {
    price: string;
    jxhyPrice: string | null;
    pfJxhyPrice: string | null;
    consignPrice: string;
  };
  repurchaseRate: string;
  monthSold: number;
  traceInfo: string;
  isOnePsale: boolean;
  sellerIdentities: string[];
}

// ==================== 카테고리 관련 타입 ====================

// 카테고리 정보
export interface Category {
  categoryID: number;
  name: string;
  level?: number | null;
  isLeaf: boolean;
  parentIDs?: number[] | null;
  childCategorys?: {
    id: number;
    name: string;
    categoryType: string;
    isLeaf: boolean;
  }[];
}

// 키워드 기반 카테고리 (keywordSNQuery API 응답)
export interface KeywordCategory {
  categoryID: number;
  name: string;
  level: number | null;
  isLeaf: boolean;
  parentIDs: number[];
  childCategorys?: {
    id: number;
    name: string;
    categoryType: string;
    isLeaf: boolean;
  }[];
}

// ==================== API 응답 타입 ====================

// 기본 API 응답 형식
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  traceId: string;
}

// 검색 결과 데이터
export interface SearchData {
  totalRecords: number;
  totalPage: number;
  pageSize: number;
  currentPage: number;
  data: Product1688[];
}

// 이미지 업로드 응답 데이터
export interface ImageUploadData {
  imageId: string;
}

// ==================== 요청 파라미터 타입 ====================

// 키워드 검색 요청 파라미터
export interface KeywordSearchParams {
  keyword: string;          // 필수, 중문 키워드
  beginPage: number;        // 필수, 페이지 번호 (1부터 시작)
  pageSize: number;         // 필수, 페이지 크기 (최대 50)
  country: string;          // 필수, 언어 코드 (ko)
  filter?: string;          // 선택, 콤마 구분 필터
  sort?: string;            // 선택, JSON 문자열 {"price":"asc"}
  priceStart?: string;      // 선택, 최소 가격
  priceEnd?: string;        // 선택, 최대 가격
  categoryId?: number;      // 선택, 단일 카테고리 ID
  snId?: string;            // 선택, 다중 카테고리 ID (예: "123:456:789")
}

// 이미지 검색 요청 파라미터
export interface ImageSearchParams {
  imageId?: string;         // imageId 또는 imageAddress 중 하나 필수
  imageAddress?: string;    // imageId 또는 imageAddress 중 하나 필수
  page: number;             // 필수 (Edge Function이 page를 기대함)
  pageSize: number;         // 필수
  country: string;          // 필수
  filter?: string;          // 선택
  sort?: string;            // 선택
  priceStart?: string;      // 선택
  priceEnd?: string;        // 선택
  categoryId?: number;      // 선택
}

// 카테고리 조회 요청 파라미터
export interface CategoryQueryParams {
  categoryID: string;       // '0'이면 1급 카테고리 반환
}

// ==================== 필터 및 정렬 타입 ====================

// 필터 옵션
export interface FilterOptions {
  isJxhy?: boolean;          // 精选货源 (우수 공급업체)
  isOnePsale?: boolean;      // 一件代发 (드롭쉬핑 가능)
  priceRange?: {
    min?: string;
    max?: string;
  };
  categoryId?: number;
}

// 정렬 옵션 (JSON 문자열로 전송)
export type SortOption = 
  | 'default'                       // 추천순 (빈 문자열)
  | '{"price":"asc"}'               // 가격 낮은순
  | '{"price":"desc"}'              // 가격 높은순
  | '{"soldQuantity":"desc"}'       // 판매량순
  | '{"repurchaseRate":"desc"}';    // 재구매율순

// 정렬 옵션 매핑
export const SORT_OPTIONS: Record<string, { label: string; value: SortOption }> = {
  default: { label: '추천순', value: 'default' },
  priceAsc: { label: '가격 낮은순', value: '{"price":"asc"}' },
  priceDesc: { label: '가격 높은순', value: '{"price":"desc"}' },
  soldQuantity: { label: '판매량순', value: '{"soldQuantity":"desc"}' },
  repurchaseRate: { label: '재구매율순', value: '{"repurchaseRate":"desc"}' },
};

// ==================== UI 상태 타입 ====================

// 선택된 필터 상태
export interface SelectedFilters {
  isJxhy: boolean;
  isOnePsale: boolean;
  priceMin: string;
  priceMax: string;
}

// 검색 상태
export interface SearchState {
  keyword: string;
  currentPage: number;
  sortBy: SortOption;
  filters: SelectedFilters;
  loading: boolean;
  error: string | null;
}

// ==================== Edge Function 헬퍼 타입 ====================

// Edge Function 호출 옵션
export interface EdgeFunctionOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Edge Function 에러 응답
export interface EdgeFunctionError {
  error: string;
  details?: any;
}

// ==================== 유틸리티 타입 ====================

// 페이지네이션 정보
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}