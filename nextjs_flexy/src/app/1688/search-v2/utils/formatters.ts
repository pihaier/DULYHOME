// 포맷터 유틸리티 함수들

/**
 * 가격을 위안화 형식으로 포맷
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (!price && price !== 0) return '가격 문의';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '가격 문의';
  
  return `¥${numPrice.toFixed(2)}`;
}

/**
 * 가격을 원화로 변환 (대략적인 환율 적용)
 */
export function formatPriceKRW(price: string | number | null | undefined, rate: number = 185): string {
  if (!price && price !== 0) return '가격 문의';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '가격 문의';
  
  const krwPrice = numPrice * rate;
  return `₩${krwPrice.toLocaleString('ko-KR')}`;
}

/**
 * 날짜 포맷
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 날짜와 시간 포맷
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 숫자를 천 단위 콤마 포맷
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('ko-KR');
}

/**
 * 재구매율을 퍼센트로 포맷
 */
export function formatRepurchaseRate(rate: string | number | null | undefined): string {
  if (!rate) return '';
  
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
  
  if (isNaN(numRate)) return '';
  
  return `${(numRate * 100).toFixed(0)}%`;
}

/**
 * 판매량 포맷 (K, M 단위 적용)
 */
export function formatSalesVolume(volume: number | null | undefined): string {
  if (!volume) return '0';
  
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  
  return volume.toString();
}

/**
 * 제품명 자르기
 */
export function truncateProductName(name: string, maxLength: number = 50): string {
  if (!name) return '';
  
  if (name.length <= maxLength) return name;
  
  return `${name.substring(0, maxLength)}...`;
}

/**
 * URL 쿼리 파라미터 생성
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}