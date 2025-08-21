// 실제 1688 API 응답 타입 (api리턴값.md 기준)
export interface ApiResponse {
  success: boolean;
  code?: number;
  message?: string;
  data: ProductDetail;
  timestamp?: number;  // 시간 스탬프
  traceId?: string;    // 추적 ID
}

export interface ProductDetail {
  // 기본 정보
  offerId: number;
  categoryId: number;
  categoryName: string | null;
  topCategoryId?: number;
  secondCategoryId?: number;
  thirdCategoryId?: number;
  
  // 제목
  subject: string;
  subjectTrans: string;
  
  // 설명 및 미디어
  description: string;
  mainVideo: string | null;
  detailVideo: string | null;
  
  // 이미지
  productImage: {
    images: string[];
  };
  
  // 상품 속성
  productAttribute: ProductAttribute[];
  
  // SKU 정보
  productSkuInfos: ProductSku[];
  
  // 판매 정보
  productSaleInfo: ProductSaleInfo;
  
  // 배송 정보
  productShippingInfo: ProductShippingInfo;
  
  // 판매자 정보
  sellerOpenId: string;
  sellerDataInfo: SellerDataInfo;
  sellerMixSetting: SellerMixSetting;
  
  // 상태 및 판매량
  status: string;
  soldOut: string;
  
  // 태그 정보
  tagInfoList: TagInfo[];
  
  // 기타 정보
  isJxhy: boolean;
  minOrderQuantity: number;
  batchNumber: number | null;
  productCargoNumber: string;
  channelPrice: number | null;
  promotionModel: {
    hasPromotion: boolean;
    promotionType?: string;
  };
  tradeScore: string;
  sellingPoint: string | null;
  offerIdentities: string[];
  createDate: string;
  traceInfo: string;
}

export interface ProductAttribute {
  attributeId: string;
  attributeName: string;
  value: string;
  attributeNameTrans: string;
  valueTrans: string;
}

export interface ProductSku {
  amountOnSale: number;
  price: string | null;  // null도 가능
  jxhyPrice: string | null;
  skuId: number;
  specId: string;
  skuAttributes: SkuAttribute[];
  pfJxhyPrice: string | null;
  consignPrice: string;
  cargoNumber: string;
  promotionPrice: string | null;
}

export interface SkuAttribute {
  attributeId: number;
  attributeName: string;
  attributeNameTrans: string;
  value: string;
  valueTrans: string;
  skuImageUrl?: string;
}

export interface ProductSaleInfo {
  priceRanges: any | null;
  amountOnSale: number;
  priceRangeList: PriceRange[];
  quoteType: number;
  consignPrice: string | null;
  jxhyPrice: string | null;
  unitInfo: {
    unit: string;
    transUnit: string;
  };
}

export interface PriceRange {
  startQuantity: number;
  price: string;
  promotionPrice: string | null;
}

export interface ProductShippingInfo {
  sendGoodsAddressText: string;
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  skuShippingInfoList?: SkuShippingInfo[];  // 정확한 타입
  shippingTimeGuarantee: string | null;
  skuShippingDetails: SkuShippingDetail[];
  pkgSizeSource: string | null;
}

// 새로 추가 - SKU 배송 정보
export interface SkuShippingInfo {
  specId: string;
  skuId: number;
  width: number;    // 重，단위g (무게)
  length: number;   // 长，단위cm (길이)
  height: number;   // 高，단위cm (높이)  
  weight: number;   // 宽，단위cm (너비) - API 필드명이 잘못됨
}

export interface SkuShippingDetail {
  skuId: string;
  width: number;
  length: number;
  height: number;
  weight: number;
  pkgSizeSource: string;  // 필수 필드로 변경
}

export interface SellerDataInfo {
  tradeMedalLevel: string;
  compositeServiceScore: string;
  logisticsExperienceScore: string;
  disputeComplaintScore: string;
  offerExperienceScore: string;
  consultingExperienceScore: string;
  repeatPurchasePercent: string;
  afterSalesExperienceScore: string;
  collect30DayWithin48HPercent: string | null;  // null 가능
  qualityRefundWithin30Day: string;
}

export interface SellerMixSetting {
  isGeneralHunpi: boolean | null;
  mixAmount: number;
  mixNumber: number;
  generalHunpi: boolean;
}

export interface TagInfo {
  key: string;
  value: boolean;
}