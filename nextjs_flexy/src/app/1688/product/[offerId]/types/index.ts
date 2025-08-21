export interface ProductDetail {
  offerId: string;
  subject: string;
  subjectTrans: string;
  status: string;
  supplierUserId?: string;
  supplierLoginId?: string;
  categoryName?: string;
  mainVideo?: string;
  mainVedio?: string; // backward compatibility
  productImage: {
    images: string[];
  };
  description: string;
  descriptionTrans?: string;
  translatedAt?: string;
  isTranslating?: boolean;
  
  // SKU 정보
  productSkuInfos?: any[];
  
  // 판매 정보
  productSaleInfo?: {
    priceRangeList?: any[];
    amountOnSale?: number;
    unitInfo?: {
      unit: string;
      transUnit: string;
    };
  };
  
  // 배송 정보
  productShippingInfo?: {
    sendGoodsAddressText?: string;
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
    skuShippingDetails?: any[];
  };
  
  // 판매자 정보
  sellerOpenId?: string;
  sellerName?: string;
  sellerLoginId?: string;
  sellerDataInfo?: any;
  sellerMixSetting?: any;
  
  // 기타 필드
  minOrderQuantity?: number;
  batchNumber?: number | null;
  soldOut?: string;
  tagInfoList?: any[];
  isJxhy?: boolean;
  productCargoNumber?: string;
  promotionModel?: any;
  tradeScore?: string;
  offerIdentities?: string[];
  createDate?: string;
  
  // 기존 필드들 (backward compatibility)
  skuMap?: Record<string, SkuInfo>;
  priceInfo?: PriceInfo[];
  freightInfo?: FreightInfo;
  saleInfo?: SaleInfo;
  supplierInfo?: SupplierInfo;
  tradeInfo?: TradeInfo;
  refPrice?: string;
  productAttribute?: ProductAttribute[];
  isVirtual?: boolean;
  renderResult?: {
    success: boolean;
    message?: string;
    components?: {
      sellerSpecific?: string;
      default?: string;
      feedbackUrl?: string;
    };
  };
}

export interface SkuInfo {
  canBookCount: string;
  saleCount: string;
  specAttrs: string;
  price: string;
  specId: string;
  discountPrice?: string;
  retailPrice?: string;
  skuId: string;
  unit?: string;
  specColor?: string;
  specSize?: string;
  tagPrice?: string;
}

export interface PriceInfo {
  price: string;
  priceType?: string;
  beginAmount?: string;
  endAmount?: string;
  promotionInfo?: {
    type?: string;
    discount?: string;
    startTime?: string;
    endTime?: string;
  };
}

export interface FreightInfo {
  unitWeight?: string;
  freightTemplateId?: string;
  location?: string;
  sendGoodsAddressId?: string;
  sendGoodsAddressText?: string;
}

export interface SaleInfo {
  minOrderQuantity?: string;
  mixWholeSale?: boolean;
  unit?: string;
  priceAuth?: boolean;
  quoteType?: number;
  supportOnlineTrade?: boolean;
  priceAuthOffer?: boolean;
  amountOnSale?: string;
  sellunit?: string;
  batchNumber?: string;
  retailprice?: string;
}

export interface SupplierInfo {
  companyName?: string;
  sellerName?: string;
  sellerLoginId?: string;
  contactor?: string;
  mobilePhone?: string;
  telephone?: string;
  winportUrl?: string;
  creditLevel?: string;
  categoryName?: string;
  address?: string;
  city?: string;
  province?: string;
  createTime?: string;
  deliveryRate?: number;
}

export interface TradeInfo {
  tradeWay?: string;
  paymentMethod?: string[];
}

export interface ProductAttribute {
  attributeId?: number;
  attributeName?: string;
  required?: boolean;
  order?: number;
  value?: string;
  skuAttribute?: boolean;
  values?: {
    name: string;
    selected?: boolean;
  }[];
}

export interface CartItem {
  offerId: string;
  subject: string;
  productImage: string;
  skuId?: string;
  skuInfo?: SkuInfo;
  selectedOptions?: Record<string, string>;
  quantity: number;
  price: number;
  totalPrice: number;
  note?: string;
  priceOptions?: {
    shippingMethod: 'sea' | 'air';
    exchangeRate: number;
    shippingFee: number;
    customsFee: number;
    additionalFees: number;
  };
  addedAt: string;
}

export interface TranslationStatus {
  isTranslating: boolean;
  translatedSections: {
    subject: boolean;
    description: boolean;
  };
  error?: string;
}

export interface PriceOptions {
  shippingMethod: 'sea' | 'air';
  exchangeRate: number;
  shippingFee: number;
  customsFee: number;
  additionalFees: number;
}

export interface ImageGalleryState {
  selectedImage: number;
  isZoomed: boolean;
  galleryOpen: boolean;
}