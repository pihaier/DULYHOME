import { z } from 'zod';

/**
 * 샘플링 신청 폼 스키마
 * sampling_applications 테이블 기반
 */
export const samplingSchema = z.object({
  // 제품 정보
  productName: z.string()
    .min(1, '제품명을 입력해주세요')
    .max(200, '제품명은 200자 이내로 입력해주세요'),
  
  productNameChinese: z.string()
    .max(200, '중국어 제품명은 200자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  sampleQuantity: z.number()
    .min(1, '샘플 수량은 1개 이상이어야 합니다')
    .max(10000, '수량이 너무 큽니다'),
  
  requirements: z.string()
    .min(10, '요청사항을 최소 10자 이상 입력해주세요')
    .max(1000, '요청사항은 1000자 이내로 입력해주세요'),
  
  requestFiles: z.array(z.instanceof(File))
    .max(5, '최대 5개까지 업로드 가능합니다')
    .refine(
      (files) => files.every(file => file.size <= 10 * 1024 * 1024),
      '각 파일은 10MB 이하여야 합니다'
    ),
  
  // 배송 정보
  shippingMethod: z.enum(['partner', 'direct']),
  
  // 통관 정보
  customsType: z.enum(['personal', 'business']),
  
  // 개인통관 정보
  personalName: z.string()
    .max(100, '이름은 100자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  personalCustomsCode: z.string()
    .regex(/^P\d{12}$/, 'P로 시작하는 13자리 번호를 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  // 사업자통관 정보
  businessName: z.string()
    .max(100, '사업자명은 100자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  businessNumber: z.string()
    .regex(/^\d{10}$/, '사업자등록번호는 숫자 10자리로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  // 한국 배송지 (직접배송)
  koreaShippingAddress: z.string()
    .max(500, '주소는 500자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  koreaReceiverName: z.string()
    .max(100, '수령인 이름은 100자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  koreaReceiverPhone: z.string()
    .regex(/^0\d{1,2}-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식을 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  // 중국 배송지 (선택)
  chinaAddress: z.string()
    .max(500, '주소는 500자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  chinaReceiverName: z.string()
    .max(100, '수령인 이름은 100자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  chinaReceiverPhone: z.string()
    .max(50, '연락처는 50자 이내로 입력해주세요')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // 개인통관 선택 시 필수 필드 검증
    if (data.customsType === 'personal') {
      return !!data.personalName && !!data.personalCustomsCode;
    }
    return true;
  },
  {
    message: '개인통관 정보를 모두 입력해주세요',
    path: ['personalName'],
  }
).refine(
  (data) => {
    // 사업자통관 선택 시 필수 필드 검증
    if (data.customsType === 'business') {
      return !!data.businessName && !!data.businessNumber;
    }
    return true;
  },
  {
    message: '사업자 정보를 모두 입력해주세요',
    path: ['businessName'],
  }
).refine(
  (data) => {
    // 직접배송 선택 시 필수 필드 검증
    if (data.shippingMethod === 'direct') {
      return !!data.koreaShippingAddress && !!data.koreaReceiverName && !!data.koreaReceiverPhone;
    }
    return true;
  },
  {
    message: '한국 배송지 정보를 모두 입력해주세요',
    path: ['koreaShippingAddress'],
  }
);

export type SamplingFormData = z.infer<typeof samplingSchema>;

/**
 * 서버로 전송할 데이터 타입 (File 객체는 FormData로 변환)
 */
export interface SamplingSubmitData {
  productName: string;
  productNameChinese?: string;
  sampleQuantity: number;
  requirements: string;
  shippingMethod: 'partner' | 'direct';
  customsType: 'personal' | 'business';
  personalName?: string;
  personalCustomsCode?: string;
  businessName?: string;
  businessNumber?: string;
  koreaShippingAddress?: string;
  koreaReceiverName?: string;
  koreaReceiverPhone?: string;
  chinaAddress?: string;
  chinaReceiverName?: string;
  chinaReceiverPhone?: string;
  // 파일들은 별도 FormData로 처리
  requestFiles: File[];
}

/**
 * API 응답 타입
 */
export interface SamplingResponse {
  success: boolean;
  data?: {
    reservationNumber: string;
    orderId: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}