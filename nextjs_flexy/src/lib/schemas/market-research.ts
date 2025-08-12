import { z } from 'zod';

/**
 * 시장조사 신청 폼 스키마
 * 00_INDEX.md에 정의된 8개 필드 기반
 */
export const marketResearchSchema = z.object({
  // 1. 제품 정보 (필수)
  productName: z.string()
    .min(1, '제품명을 입력해주세요')
    .max(200, '제품명은 200자 이내로 입력해주세요'),
  
  // 2. 조사 수량 (필수)
  researchQuantity: z.number()
    .min(1, '조사 수량을 입력해주세요')
    .max(1000000, '수량이 너무 큽니다'),
  
  // 3. 요청사항 (필수)
  requirements: z.string()
    .min(10, '요청사항을 최소 10자 이상 입력해주세요')
    .max(1000, '요청사항은 1000자 이내로 입력해주세요'),
  
  // 4. 사진 업로드 (필수)
  photos: z.array(z.instanceof(File))
    .min(1, '최소 1개의 사진을 업로드해주세요')
    .max(5, '최대 5개까지 업로드 가능합니다')
    .refine(
      (files) => files.every(file => file.size <= 10 * 1024 * 1024),
      '각 파일은 10MB 이하여야 합니다'
    )
    .refine(
      (files) => files.every(file => 
        ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      ),
      '이미지 파일만 업로드 가능합니다 (JPG, PNG, GIF)'
    ),
  
  // 5. 상세페이지 URL (선택)
  detailPage: z.string()
    .url('올바른 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  // 6. 로고 인쇄 관련 (조건부)
  logoRequired: z.boolean(),
  logoFile: z.array(z.instanceof(File))
    .max(5, '로고 파일은 최대 5개까지 업로드 가능합니다'),
  logoPrintDetails: z.string()
    .max(500, '로고 인쇄 상세 정보는 500자 이내로 입력해주세요')
    .optional(),
  
  // 7. 박스 제작 관련 (조건부)
  customBoxRequired: z.boolean(),
  boxDesignFile: z.array(z.instanceof(File))
    .max(5, '박스 디자인 파일은 최대 5개까지 업로드 가능합니다')
}).refine(
  (data) => {
    // 로고 파일 검증
    if (data.logoFile && data.logoFile.length > 0) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const invalidLogoFiles = data.logoFile.filter(file => !validTypes.includes(file.type));
      if (invalidLogoFiles.length > 0) {
        return false;
      }
    }
    
    // 박스 디자인 파일 검증
    if (data.boxDesignFile && data.boxDesignFile.length > 0) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const invalidBoxFiles = data.boxDesignFile.filter(file => !validTypes.includes(file.type));
      if (invalidBoxFiles.length > 0) {
        return false;
      }
    }
    
    return true;
  },
  {
    message: '파일은 이미지(JPG, PNG) 또는 PDF 형식만 지원합니다',
    path: ['logoFile']
  }
);

export type MarketResearchFormData = z.infer<typeof marketResearchSchema>;

/**
 * 서버로 전송할 데이터 타입 (File 객체는 FormData로 변환)
 */
export interface MarketResearchSubmitData {
  productName: string;
  researchQuantity: number;
  requirements: string;
  detailPage?: string;
  logoRequired: boolean;
  logoPrintDetails?: string;
  customBoxRequired: boolean;
  // 파일들은 별도 FormData로 처리
  photoFiles: File[];
  logoFiles: File[];
  boxDesignFiles: File[];
}

/**
 * API 응답 타입
 */
export interface MarketResearchResponse {
  success: boolean;
  data?: {
    reservationNumber: string;
    applicationId: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}