// 가격 계산 관련 유틸리티 함수들

export interface CalculatorData {
  // 기본 정보
  exchangeRate: number;
  chinaPrice: number;
  quantity: number;
  
  // 중국 내 배송비
  chinaShippingFee: number | null;
  chinaShippingFirstUnit: number;
  chinaShippingFirstFee: number;
  chinaShippingNextUnit: number;
  chinaShippingNextFee: number;
  chinaShippingType: 'quantity' | 'weight';
  
  // 포장 정보 (박스 단위)
  packageWeight: number;  // 박스당 무게
  packageLength: number;  // 박스 길이
  packageWidth: number;   // 박스 너비
  packageHeight: number;  // 박스 높이
  piecesPerBox: number;   // 박스당 개수
  
  // 운송 정보
  shippingMethod: 'auto' | 'LCL' | 'FCL';
  lclRate: number;
  fclRate: number;
  fclQuote?: number; // FCL 견적 금액
  
  // 관세 정보
  hsCode: string;
  tariffRate: number;
  certificateOfOrigin: boolean;
  certificatePrice: number;
  customsBrokerFee: number;
}

// 현재 가격 구간 계산 (promotionPrice 우선)
export const getCurrentPriceForQuantity = (productDetail: any, quantity: number): number => {
  if (!productDetail) return 0;
  
  const priceRanges = productDetail.productSaleInfo?.priceRangeList;
  if (!priceRanges || priceRanges.length === 0) return 0;
  
  for (let i = priceRanges.length - 1; i >= 0; i--) {
    if (quantity >= priceRanges[i].startQuantity) {
      // promotionPrice가 있으면 우선 사용
      return parseFloat(priceRanges[i].promotionPrice || priceRanges[i].price) || 0;
    }
  }
  
  return parseFloat(priceRanges[0].promotionPrice || priceRanges[0].price) || 0;
};

// SKU 가격 가져오기 (promotionPrice 우선)
export const getSkuPrice = (sku: any): number => {
  if (!sku) return 0;
  return parseFloat(sku.promotionPrice || sku.consignPrice || sku.price) || 0;
};

// 모든 이미지 가져오기 (API 구조에 맞게 수정)
export const getAllProductImages = (productDetail: any): string[] => {
  if (!productDetail) return [];
  
  // productImage.images 구조 사용
  const productImages = productDetail.productImage?.images || [];
  
  // SKU 이미지는 skuImageUrl 필드 사용
  const skuImages = productDetail.productSkuInfos?.flatMap((sku: any) => 
    sku.skuAttributes?.filter((attr: any) => attr.skuImageUrl).map((attr: any) => attr.skuImageUrl)
  ) || [];
  
  return [...new Set([...productImages, ...skuImages])];
};

// 수입 비용 계산
export const calculateImportCosts = (data: CalculatorData) => {
  // 안전한 기본값 설정
  const chinaPrice = data.chinaPrice || 0;
  const quantity = data.quantity || 1;
  const exchangeRate = data.exchangeRate || 203;
  
  // 1차 비용 계산
  const chinaPriceKRW = Math.floor(chinaPrice * exchangeRate);
  const totalChinaPrice = chinaPriceKRW * quantity;
  
  // 중국 배송비 계산
  let calculatedChinaShippingFee = 0;
  if (data.chinaShippingFee !== null) {
    calculatedChinaShippingFee = data.chinaShippingFee;
  } else {
    // 기본 계산 로직
    if (data.chinaShippingType === 'weight') {
      const totalWeight = data.packageWeight * quantity;
      if (totalWeight <= data.chinaShippingFirstUnit) {
        calculatedChinaShippingFee = data.chinaShippingFirstFee;
      } else {
        const additionalWeight = totalWeight - data.chinaShippingFirstUnit;
        const additionalUnits = Math.ceil(additionalWeight / data.chinaShippingNextUnit);
        calculatedChinaShippingFee = data.chinaShippingFirstFee + (additionalUnits * data.chinaShippingNextFee);
      }
    } else {
      if (quantity <= data.chinaShippingFirstUnit) {
        calculatedChinaShippingFee = data.chinaShippingFirstFee;
      } else {
        const additionalUnits = Math.ceil((quantity - data.chinaShippingFirstUnit) / data.chinaShippingNextUnit);
        calculatedChinaShippingFee = data.chinaShippingFirstFee + (additionalUnits * data.chinaShippingNextFee);
      }
    }
  }
  
  const chinaShippingKRW = Math.floor(calculatedChinaShippingFee * exchangeRate);
  
  // EXW 총액
  const exwTotal = totalChinaPrice + chinaShippingKRW;
  
  // 수수료 (5%)
  const commission = Math.floor(exwTotal * 0.05);
  const commissionVAT = Math.floor(commission * 0.1);
  
  // 1차 결제 금액
  const firstPayment = exwTotal + commission + commissionVAT;
  
  // CBM 계산 (박스 기준)
  let totalCBM = 0;
  let totalWeight = 0;
  
  if (data.packageLength > 0 && data.packageWidth > 0 && data.packageHeight > 0) {
    // 박스당 CBM 계산 (cm³ to m³)
    const boxCBM = (data.packageLength * data.packageWidth * data.packageHeight) / 1000000;
    // 총 박스 수 계산
    const totalBoxes = Math.ceil(quantity / (data.piecesPerBox || 1));
    // 총 CBM = 박스당 CBM × 박스 수
    totalCBM = boxCBM * totalBoxes;
    // 총 무게 = 박스당 무게 × 박스 수
    totalWeight = data.packageWeight * totalBoxes;
  }
  
  // 운송비 계산
  let shippingCost = 0;
  let shippingMethodUsed = data.shippingMethod;
  
  if (data.shippingMethod === 'auto') {
    shippingMethodUsed = totalCBM >= 15 ? 'FCL' : 'LCL';
  }
  
  if (shippingMethodUsed === 'LCL') {
    // LCL은 최소 1CBM으로 계산
    const chargeableCBM = Math.max(totalCBM, 1);
    shippingCost = Math.floor(chargeableCBM * 90000); // 90,000원/CBM
  } else {
    // FCL - 직접 입력 또는 견적
    shippingCost = data.fclQuote || 0;
  }
  
  // 과세가격 (CIF)
  const dutiableValue = exwTotal + shippingCost;
  
  // 관세
  const customsDuty = Math.floor(dutiableValue * (data.tariffRate / 100));
  
  // 수입 부가세 (CIF + 관세의 10%)
  const importVAT = Math.floor((dutiableValue + customsDuty) * 0.1);
  
  // 관세사 수수료 부가세
  const customsBrokerVAT = Math.floor(data.customsBrokerFee * 0.1);
  
  // 원산지증명서 부가세
  const certificateVAT = data.certificateOfOrigin ? Math.floor(data.certificatePrice * 0.1) : 0;
  
  // 2차 결제 금액
  const secondPayment = shippingCost + customsDuty + importVAT + 
                       data.customsBrokerFee + customsBrokerVAT + 
                       (data.certificateOfOrigin ? data.certificatePrice + certificateVAT : 0);
  
  // 총 원가
  const totalCost = firstPayment + secondPayment;
  
  // 개당 원가
  const unitCost = Math.floor(totalCost / quantity);
  
  return {
    // 1차 비용
    totalChinaPrice,
    chinaShippingKRW,
    commission,
    commissionVAT,
    firstPayment,
    
    // 2차 비용
    shippingCost,
    shippingMethodUsed,
    customsDuty,
    customsBrokerFee: data.customsBrokerFee,
    customsBrokerVAT,
    certificatePrice: data.certificateOfOrigin ? data.certificatePrice : 0,
    certificateVAT,
    importVAT,
    secondPayment,
    
    // 최종
    totalCost,
    unitCost,
    
    // 추가 정보
    totalCBM,
    totalWeight,
    dutiableValue
  };
};