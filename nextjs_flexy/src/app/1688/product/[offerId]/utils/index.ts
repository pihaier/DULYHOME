import { PriceInfo, SkuInfo } from '../types';

export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('ko-KR').format(numPrice);
};

export const formatPriceRange = (priceInfo: PriceInfo[]): string => {
  if (!priceInfo || priceInfo.length === 0) {
    return '가격 정보 없음';
  }

  if (priceInfo.length === 1) {
    return `¥${priceInfo[0].price}`;
  }

  const minPrice = Math.min(...priceInfo.map((p) => parseFloat(p.price)));
  const maxPrice = Math.max(...priceInfo.map((p) => parseFloat(p.price)));

  return minPrice === maxPrice ? `¥${minPrice}` : `¥${minPrice} ~ ¥${maxPrice}`;
};

export const extractSkuOptions = (skuMap: Record<string, SkuInfo> | undefined) => {
  if (!skuMap) return [];

  const optionsMap = new Map<string, Set<string>>();

  Object.values(skuMap).forEach((sku) => {
    if (sku.specAttrs) {
      const attrs = sku.specAttrs.split(';').filter((attr) => attr);
      attrs.forEach((attr) => {
        const [key, value] = attr.split(':');
        if (key && value) {
          if (!optionsMap.has(key)) {
            optionsMap.set(key, new Set());
          }
          optionsMap.get(key)?.add(value);
        }
      });
    }
  });

  return Array.from(optionsMap.entries()).map(([key, values]) => ({
    name: key,
    values: Array.from(values),
  }));
};

export const findSkuByOptions = (
  skuMap: Record<string, SkuInfo> | undefined,
  selectedOptions: Record<string, string>
): SkuInfo | undefined => {
  if (!skuMap) return undefined;

  return Object.values(skuMap).find((sku) => {
    if (!sku.specAttrs) return false;

    const skuAttrs = sku.specAttrs.split(';').filter((attr) => attr);
    const skuOptionsMap: Record<string, string> = {};

    skuAttrs.forEach((attr) => {
      const [key, value] = attr.split(':');
      if (key && value) {
        skuOptionsMap[key] = value;
      }
    });

    return Object.entries(selectedOptions).every(
      ([key, value]) => skuOptionsMap[key] === value
    );
  });
};

export const extractVideoId = (videoUrl: string): string | null => {
  if (!videoUrl) return null;

  // YouTube URL 패턴
  const youtubeMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  if (youtubeMatch) return youtubeMatch[1];

  // 1688 비디오 URL 처리
  if (videoUrl.includes('1688.com') || videoUrl.includes('alibaba.com')) {
    return videoUrl;
  }

  return null;
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // 위험한 태그 제거
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');

  return cleaned;
};

export const getImageUrl = (url: string, size: 'thumb' | 'medium' | 'large' = 'medium'): string => {
  if (!url) return '/images/products/s1.jpg'; // 실제 존재하는 기본 이미지

  // 1688 이미지 URL 처리
  if (url.includes('alicdn.com') || url.includes('1688.com')) {
    const sizeMap = {
      thumb: '100x100',
      medium: '400x400',
      large: '800x800',
    };

    // 이미 사이즈가 지정된 경우 교체
    if (url.includes('_')) {
      return url.replace(/_\d+x\d+/, `_${sizeMap[size]}`);
    }

    // 사이즈 추가
    return `${url}_${sizeMap[size]}.jpg`;
  }

  return url;
};

export const generateReservationNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

  return `DL-${year}${month}${day}-${random}`;
};

export const parseQuantityRange = (range: string): { min: number; max: number } => {
  const defaultRange = { min: 1, max: 999999 };

  if (!range) return defaultRange;

  const match = range.match(/(\d+)-(\d+)/);
  if (match) {
    return {
      min: parseInt(match[1], 10),
      max: parseInt(match[2], 10),
    };
  }

  const singleNumber = parseInt(range, 10);
  if (!isNaN(singleNumber)) {
    return { min: singleNumber, max: 999999 };
  }

  return defaultRange;
};