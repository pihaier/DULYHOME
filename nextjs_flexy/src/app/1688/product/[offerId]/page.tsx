'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Rating,
  IconButton,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  ButtonGroup,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChatIcon from '@mui/icons-material/Chat';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';
import AccessTime from '@mui/icons-material/AccessTime';
import LocalShipping from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ConstructionIcon from '@mui/icons-material/Construction';
import BrushIcon from '@mui/icons-material/Brush';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TableHead from '@mui/material/TableHead';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Drawer from '@mui/material/Drawer';
import TranslateIcon from '@mui/icons-material/Translate';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Snackbar from '@mui/material/Snackbar';
// 동적 import를 위한 타입
const ChatPanel = React.lazy(() => import('@/app/dashboard/orders/_components/ChatPanel'));

// API 응답에서 추가로 발견된 필드들 포함
interface ProductDetail {
  offerId: number;
  categoryId: number;
  categoryName: string | null;
  subject: string;
  subjectTrans: string;
  description: string;
  mainVideo: string | null;
  detailVideo: string | null;
  productImage: {
    images: string[];
  };
  productAttribute: Array<{
    attributeId: string;
    attributeName: string;
    value: string;
    attributeNameTrans: string;
    valueTrans: string;
  }>;
  productSkuInfos: Array<{
    amountOnSale: number;
    price: string | null;
    jxhyPrice: string | null;
    skuId: number;
    specId: string;
    skuAttributes: Array<{
      attributeId: number;
      attributeName: string;
      attributeNameTrans: string;
      value: string;
      valueTrans: string;
      skuImageUrl: string | null;
    }>;
    pfJxhyPrice: string | null;
    consignPrice: string;
    cargoNumber: string;
    promotionPrice: string | null;
  }>;
  productSaleInfo: {
    priceRanges: string | null;
    amountOnSale: number;
    priceRangeList: Array<{
      startQuantity: number;
      price: string;
      promotionPrice: string | null;
    }>;
    quoteType: number;
    consignPrice: string | null;
    jxhyPrice: string | null;
    unitInfo: {
      unit: string;
      transUnit: string;
    };
  };
  productShippingInfo: {
    sendGoodsAddressText: string;
    weight: number | null;
    width: number | null;
    height: number | null;
    length: number | null;
    shippingTimeGuarantee: string;
    skuShippingInfoList?: Array<{
      // deprecated but in API
      specId: string;
      skuId: number;
      width: number;
      length: number;
      height: number;
      weight: number;
    }>;
    skuShippingDetails: Array<{
      skuId: string;
      width: number;
      length: number;
      height: number;
      weight: number;
      pkgSizeSource: string;
    }>;
    pkgSizeSource: string | null; // 누락된 필드 추가
  };
  isJxhy: boolean;
  sellerOpenId: string;
  minOrderQuantity: number;
  batchNumber: number | null;
  status: string;
  tagInfoList: Array<{
    key: string;
    value: boolean;
  }>;
  traceInfo: string;
  sellerMixSetting: {
    isGeneralHunpi: boolean | null; // 누락된 필드 추가
    mixAmount: number;
    mixNumber: number;
    generalHunpi: boolean;
  };
  productCargoNumber: string;
  sellerDataInfo: {
    tradeMedalLevel: string;
    compositeServiceScore: string;
    logisticsExperienceScore: string;
    disputeComplaintScore: string;
    offerExperienceScore: string;
    consultingExperienceScore: string;
    repeatPurchasePercent: string;
    afterSalesExperienceScore: string;
    collect30DayWithin48HPercent: string | null;
    qualityRefundWithin30Day: string;
  };
  soldOut: string;
  channelPrice: string | null;
  promotionModel: {
    hasPromotion: boolean;
    promotionType: string | null;
  };
  tradeScore: string;
  topCategoryId: number;
  secondCategoryId: number;
  thirdCategoryId: number | null;
  sellingPoint: string | null;
  offerIdentities: string[];
  createDate: string;
}

// 더미 데이터 제거 - API에서만 데이터 가져옴

export default function ProductDetailPage() {
  const params = useParams();
  const offerId = params.offerId as string;

  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [translatingImage, setTranslatingImage] = useState<string | null>(null);
  const [translatedImages, setTranslatedImages] = useState<Record<string, string>>({});
  const [snackbarMsg, setSnackbarMsg] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  // 계산기 상태
  const [calculatorData, setCalculatorData] = useState({
    // 기본 정보
    exchangeRate: 203, // 기본 환율
    chinaPrice: 0, // 중국 단가 (위안)
    quantity: 100, // 구매 수량
    unitsPerBox: 100, // 박스당 수량

    // 중국 내 배송 정보
    chinaShippingFee: 0, // 중국 내 총 배송비 (위안)
    chinaShippingChargeType: '0', // '0': 무게 기준, '1': 개수 기준
    chinaShippingFirstFee: 0, // 첫 단위 비용 (위안)
    chinaShippingFirstUnit: 1, // 첫 단위 (kg 또는 개수)
    chinaShippingNextFee: 0, // 추가 단위 비용 (위안)
    chinaShippingNextUnit: 1, // 추가 단위 (kg 또는 개수)

    // 포장 정보 (개별 상품 치수)
    packageWidth: 0, // cm
    packageLength: 0, // cm
    packageHeight: 0, // cm
    packageWeight: 0, // kg
    totalBoxes: 0, // 총 박스 수

    // 운송 방법
    shippingMethod: '', // 'FCL' or 'LCL' (자동 결정)
    lclShippingFee: 90000, // LCL 운송비 (CBM당 90,000원)
    fclShippingFee: 3000000, // FCL 운송비 (기본 300만원)

    // 수수료 및 세금
    commissionRate: 5, // 수수료 5%
    hsCode: '', // HS 코드
    customsRate: 8, // 관세율 8%
    customsBrokerFee: 30000, // 관세사 비용 (고정)
    coCertificateFee: 0, // 원산지증명서 비용 (FTA 적용시만) // 국내 배송비
  });

  const [hsCodeProgress, setHsCodeProgress] = useState('');
  const [lookingUpHsCode, setLookingUpHsCode] = useState(false);
  const [tariffDetails, setTariffDetails] = useState<any>(null);
  const [chinaShippingLoading, setChinaShippingLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartOptionsDialog, setCartOptionsDialog] = useState(false);
  const [cartOptions, setCartOptions] = useState({
    memo: '',
  });
  const [chatDialog, setChatDialog] = useState(false); // 채팅 모달 상태
  const router = useRouter();

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!offerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // API 유틸리티 함수 사용
        const { getProductDetail } = await import('@/lib/1688/api');
        const result = await getProductDetail({
          offerId: offerId,
          country: 'ko'
        });
        
        console.log('API Response:', result);
        
        // API 응답 구조 확인
        if (result?.data) {
          setProductDetail(result.data);
          // 첫 번째 SKU를 기본 선택
          if (result.data.productSkuInfos?.length > 0) {
            setSelectedSku(result.data.productSkuInfos[0]);
          }
        } else if (result?.success === false) {
          // API 에러 메시지 처리
          console.error('API Error:', result.error);
          setError(result.error || '상품 정보를 불러올 수 없습니다.');
        } else {
          // 예상치 못한 응답 구조
          console.error('Unexpected API response:', result);
          setError('상품 정보를 불러올 수 없습니다.');
        }
      } catch (error: any) {
        console.error('상품 상세 정보 조회 실패:', error);
        setError(error?.message || '상품 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetail();
  }, [offerId]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= (productDetail?.minOrderQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const getCurrentPrice = () => {
    if (!productDetail) return { price: '0', promotionPrice: null };

    const priceRanges = productDetail.productSaleInfo.priceRangeList;
    for (let i = priceRanges.length - 1; i >= 0; i--) {
      if (quantity >= priceRanges[i].startQuantity) {
        return {
          price: priceRanges[i].price,
          promotionPrice: priceRanges[i].promotionPrice,
        };
      }
    }
    return {
      price: priceRanges[0].price,
      promotionPrice: priceRanges[0].promotionPrice,
    };
  };

  // 계산기 계산 함수 (market-research 로직과 동일)
  const calculatePrice = () => {
    const {
      exchangeRate,
      chinaPrice,
      quantity,
      unitsPerBox,
      chinaShippingFee,
      chinaShippingChargeType,
      chinaShippingFirstFee,
      chinaShippingFirstUnit,
      chinaShippingNextFee,
      chinaShippingNextUnit,
      packageWidth,
      packageLength,
      packageHeight,
      packageWeight,
      totalBoxes,
      shippingMethod,
      lclShippingFee,
      fclShippingFee,
      commissionRate,
      customsRate,
      customsBrokerFee,
      coCertificateFee,
    } = calculatorData;

    // ========== 1. 기본 가격 계산 ==========
    // 중국 가격 (원화)
    const chinaPriceKRW = Math.floor(chinaPrice * exchangeRate);
    const totalChinaPrice = Math.floor(chinaPriceKRW * quantity);

    // 중국 내 배송비 계산
    let calculatedChinaShippingFee = 0;
    if (chinaShippingChargeType === '0') {
      // 무게 기준
      const totalWeight = packageWeight * quantity;
      if (totalWeight <= chinaShippingFirstUnit) {
        calculatedChinaShippingFee = chinaShippingFirstFee;
      } else {
        const additionalWeight = totalWeight - chinaShippingFirstUnit;
        const additionalUnits = Math.ceil(additionalWeight / chinaShippingNextUnit);
        calculatedChinaShippingFee = chinaShippingFirstFee + additionalUnits * chinaShippingNextFee;
      }
    } else if (chinaShippingChargeType === '1') {
      // 개수 기준
      if (quantity <= chinaShippingFirstUnit) {
        calculatedChinaShippingFee = chinaShippingFirstFee;
      } else {
        const additionalUnits = Math.ceil(
          (quantity - chinaShippingFirstUnit) / chinaShippingNextUnit
        );
        calculatedChinaShippingFee = chinaShippingFirstFee + additionalUnits * chinaShippingNextFee;
      }
    }

    const finalChinaShippingFee = chinaShippingFee || calculatedChinaShippingFee;
    const chinaShippingKRW = Math.floor(finalChinaShippingFee * exchangeRate);

    // ========== 2. CBM 및 운송비 계산 ==========
    // 총 박스수 계산
    const calculatedTotalBoxes =
      totalBoxes || (unitsPerBox ? Math.ceil(quantity / unitsPerBox) : Math.ceil(quantity / 100));

    // CBM 계산
    let totalCBM = 0;
    let boxCBM = 0;
    if (packageWidth && packageLength && packageHeight) {
      // 개별 상품의 CBM
      const singleItemCBM = (packageWidth * packageLength * packageHeight) / 1000000;
      // 총 CBM = 개별 CBM * 수량
      totalCBM = singleItemCBM * quantity;
      boxCBM = singleItemCBM;
    }

    // 운송 방법 자동 결정 (15 CBM 기준)
    const autoShippingMethod = totalCBM >= 15 ? 'FCL' : 'LCL';
    const finalShippingMethod = shippingMethod || autoShippingMethod;

    // 한중 국제 배송비
    let internationalShipping = 0;
    if (finalShippingMethod === 'LCL') {
      // LCL: 1 CBM 이하는 90,000원 고정, 초과 시 CBM당 90,000원
      internationalShipping =
        totalCBM <= 1 ? lclShippingFee : Math.floor(totalCBM * lclShippingFee);
    } else {
      // FCL: 사용자 입력값 사용
      internationalShipping = fclShippingFee;
    }

    // ========== 3. EXW 및 수수료 계산 ==========
    // EXW 합계 = 상품가격 + 중국 내 배송비
    const exwTotal = totalChinaPrice + chinaShippingKRW;

    // 수수료 (상품가격 기준)
    const commission = Math.floor(totalChinaPrice * (commissionRate / 100));
    const commissionVAT = Math.floor(commission * 0.1);

    // 1차 결제 비용 = EXW + 수수료 + 수수료 VAT
    const firstPayment = exwTotal + commission + commissionVAT;

    // ========== 4. 관세 및 통관 비용 계산 ==========
    // 과세가격 = EXW + 운송비
    const dutiableValue = exwTotal + internationalShipping;

    // 관세 = 과세가격 × 관세율
    const customsDuty = Math.floor(dutiableValue * (customsRate / 100));

    // 부가세 과세표준 = CIF + 관세 + 관세사 + C/O
    const vatBase = dutiableValue + customsDuty + customsBrokerFee + coCertificateFee;

    // 수입 VAT = 부가세 과세표준 × 10%
    const importVAT = Math.floor(vatBase * 0.1);

    // 2차 결제 비용 = 운송비 + 관세 + 관세사 + C/O + 수입VAT
    const secondPayment =
      internationalShipping + customsDuty + customsBrokerFee + coCertificateFee + importVAT;

    // ========== 5. 최종 계산 ==========
    // 총 비용 = 1차 결제 + 2차 결제 (국내 배송비 제외)
    const totalCost = firstPayment + secondPayment;

    // 개당 원가
    const unitCost = Math.floor(totalCost / quantity);

    // 총 무게 (kg)
    const totalWeight = packageWeight * quantity;

    return {
      // 기본 정보
      chinaPriceKRW,
      totalChinaPrice,
      chinaShippingFee: finalChinaShippingFee,
      chinaShippingKRW,

      // CBM 및 운송
      boxCBM,
      totalCBM,
      totalWeight,
      totalBoxes: calculatedTotalBoxes,
      shippingMethod: finalShippingMethod,
      internationalShipping,

      // EXW 및 수수료
      exwTotal,
      commission,
      commissionVAT,
      firstPayment,

      // 관세 및 통관
      dutiableValue,
      customsDuty,
      customsBrokerFee,
      coCertificateFee,
      vatBase,
      importVAT,
      secondPayment,

      // 최종
      domesticShippingFee: 0, // 국내 배송비 제거
      totalCost,
      unitCost,
    };
  };

  // 중국 배송비 조회 함수
  const fetchChinaShippingFee = async () => {
    if (!productDetail || !selectedSku) return;

    setChinaShippingLoading(true);
    try {
      // Supabase SDK로 Edge Function 호출
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('calculate-shipping', {
        body: {
          offerId: productDetail.offerId,
          toProvinceCode: '330000', // 저장성
          toCityCode: '330100', // 항저우시
          toCountryCode: '330108', // 빈장구
          totalNum: quantity,
          logisticsSkuNumModels: selectedSku
            ? [
                {
                  skuId: selectedSku.skuId.toString(),
                  number: quantity,
                },
              ]
            : [],
        },
      });

      if (!error && data) {
        if (data.data) {
          const shippingData = data.data;

          // 중국 배송비 정보 업데이트
          setCalculatorData((prev) => ({
            ...prev,
            chinaShippingFee: parseFloat(shippingData.freight || 0),
            chinaShippingChargeType: shippingData.chargeType || '0',
            chinaShippingFirstFee: parseFloat(shippingData.firstFee || 0),
            chinaShippingFirstUnit: parseFloat(shippingData.firstUnit || 1),
            chinaShippingNextFee: parseFloat(shippingData.nextFee || 0),
            chinaShippingNextUnit: parseFloat(shippingData.nextUnit || 1),
            // SKU 치수 정보도 함께 업데이트
            packageWidth: shippingData.singleProductWidth || prev.packageWidth,
            packageLength: shippingData.singleProductLength || prev.packageLength,
            packageHeight: shippingData.singleProductHeight || prev.packageHeight,
            packageWeight: shippingData.singleProductWeight || prev.packageWeight,
          }));
        }
      }
    } catch (error) {
      console.error('China shipping fee fetch error:', error);
    } finally {
      setChinaShippingLoading(false);
    }
  };

  const handleOpenCalculator = async () => {
    // 현재 선택된 가격으로 초기화
    const currentPrice = getCurrentPrice();

    // SKU 치수 정보가 있으면 자동으로 설정
    let packageData = {};
    if (
      productDetail?.productShippingInfo.skuShippingDetails &&
      productDetail.productShippingInfo.skuShippingDetails.length > 0
    ) {
      const sku = productDetail.productShippingInfo.skuShippingDetails[0];
      packageData = {
        packageWidth: sku.width || 0,
        packageLength: sku.length || 0,
        packageHeight: sku.height || 0,
        packageWeight: sku.weight || 0,
      };
    }

    // 박스 수 계산 (100개당 1박스 가정)
    const boxes = Math.ceil(quantity / 100);

    setCalculatorData((prev) => ({
      ...prev,
      chinaPrice: parseFloat(currentPrice.price),
      quantity: quantity,
      totalBoxes: boxes,
      ...packageData,
    }));

    // 중국 배송비 조회
    await fetchChinaShippingFee();

    setCalculatorOpen(true);
  };

  // HS 코드 조회 함수 (market-research와 동일)
  const handleHsCodeLookup = async () => {
    if (!productDetail?.subjectTrans) {
      alert('제품명이 없습니다');
      return;
    }

    setLookingUpHsCode(true);
    setHsCodeProgress('HS코드 조회 중...');

    try {
      // Edge Function URL 직접 호출 (SSE 스트리밍)
      const EDGE_FUNCTION_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/hs-code-classifier';
      const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          productName: productDetail.subjectTrans,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalHsCode = '';

      if (reader) {
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 마지막 불완전한 라인은 버퍼에 보관

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') {
                  continue;
                }

                if (jsonStr) {
                  const data = JSON.parse(jsonStr);

                  if (data.type) {
                    switch (data.type) {
                      case 'progress':
                        setHsCodeProgress(data.data?.message || '진행 중...');
                        break;
                      case 'complete':
                        if (data.data && data.data.hsCode) {
                          finalHsCode = data.data.hsCode;
                          setHsCodeProgress(`HS코드: ${finalHsCode}`);
                        }
                        break;
                      case 'error':
                        console.error('HS code error:', data.data);
                        setHsCodeProgress('조회 실패');
                        break;
                    }
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Line:', line);
              }
            }
          }
        }
      }

      // HS코드 설정 및 관세율 자동 조회
      if (finalHsCode && /^\d{10}$/.test(finalHsCode)) {
        setCalculatorData((prev) => ({ ...prev, hsCode: finalHsCode }));
        await fetchTariffRate(finalHsCode);
      } else {
        setHsCodeProgress('유효한 HS코드를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('HS code lookup error:', error);
      setHsCodeProgress('HS코드 조회 중 오류 발생');
    } finally {
      setLookingUpHsCode(false);
    }
  };

  // 관세율 조회 함수
  const fetchTariffRate = async (hsCode: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tariff-rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ hsCode }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Tariff API Response:', data);

        if (data.success && data.tariffRates) {
          // 기본관세, WTO, 한중FTA 3개만 비교하여 최저값 선택
          const rates = [];

          // 기본관세 (A)
          if (data.tariffRates.basic) {
            rates.push({
              rate: data.tariffRates.basic.rate,
              typeCode: data.tariffRates.basic.typeCode,
              typeName: '기본관세',
            });
          }

          // WTO 관세 (C)
          if (data.tariffRates.wto) {
            rates.push({
              rate: data.tariffRates.wto.rate,
              typeCode: data.tariffRates.wto.typeCode,
              typeName: 'WTO',
            });
          }

          // 한중FTA (FCN1)
          if (data.tariffRates.fta_china) {
            rates.push({
              rate: data.tariffRates.fta_china.rate,
              typeCode: data.tariffRates.fta_china.typeCode,
              typeName: '한중FTA',
            });
          }

          // 최저 관세율 찾기 (3개 중에서만)
          let lowestRate = 8; // 기본값
          let lowestType = 'A';
          let lowestName = '기본';

          if (rates.length > 0) {
            const lowest = rates.reduce((min, curr) => (curr.rate < min.rate ? curr : min));
            lowestRate = lowest.rate;
            lowestType = lowest.typeCode;
            lowestName = lowest.typeName;
          }

          // FCN1(한중FTA) 선택 시 원산지증명서 비용 추가
          const needsCertificate = lowestType === 'FCN1' || lowestType.startsWith('FCN');

          setCalculatorData((prev) => ({
            ...prev,
            customsRate: lowestRate,
            coCertificateFee: needsCertificate ? 30000 : 0,
          }));

          // 세율 정보 표시
          let progressMsg = `HS코드: ${hsCode} | 관세율: ${lowestRate}% (${lowestName})`;

          // 3개 세율 모두 표시
          const basic = data.tariffRates.basic?.rate ?? '-';
          const wto = data.tariffRates.wto?.rate ?? '-';
          const ftaChina = data.tariffRates.fta_china?.rate ?? '-';

          progressMsg += ` [기본: ${basic}%, WTO: ${wto}%, 한중FTA: ${ftaChina}%]`;

          if (needsCertificate) {
            progressMsg += ' ※ 원산지증명서 필요';
          }

          setHsCodeProgress(progressMsg);
        } else {
          // 실패 시 기본값
          setCalculatorData((prev) => ({
            ...prev,
            customsRate: 8,
            coCertificateFee: 0,
          }));
          setHsCodeProgress(`HS코드: ${hsCode} | 관세율: 8% (기본)`);
        }
      }
    } catch (error) {
      console.error('Tariff rate lookup error:', error);
    }
  };

  // 장바구니에 추가하는 함수
  const handleAddToCart = async () => {
    // 옵션 선택 체크
    if (!productDetail) {
      alert('상품 정보를 불러오는 중입니다.');
      return;
    }

    if (!selectedSku) {
      alert('상품 옵션을 선택해주세요.');
      return;
    }

    // 필수 옵션이 모두 선택되었는지 확인
    const requiredAttributes =
      productDetail.productSkuInfos[0]?.skuAttributes.map((attr) => attr.attributeName) || [];
    const selectedAttributeKeys = Object.keys(selectedAttributes);

    if (
      requiredAttributes.length > 0 &&
      selectedAttributeKeys.length !== requiredAttributes.length
    ) {
      alert('모든 옵션을 선택해주세요.');
      return;
    }

    // Supabase 세션 가져오기
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 최소 주문 수량 체크
    if (quantity < productDetail.minOrderQuantity) {
      alert(`최소 주문 수량은 ${productDetail.minOrderQuantity}개 입니다.`);
      return;
    }

    setAddingToCart(true);

    try {
      // 1. 먼저 중국 배송비 조회
      let chinaShippingFeeYuan = 0;
      let chinaShippingFeeKRW = 0;

      try {
        // Supabase SDK로 Edge Function 호출
        const { data: shippingData, error: shippingError } = await supabase.functions.invoke('calculate-shipping', {
          body: {
            offerId: productDetail.offerId,
            toProvinceCode: '330000', // 저장성
            toCityCode: '330100', // 항저우시
            toCountryCode: '330108', // 빈장구
            totalNum: quantity,
            logisticsSkuNumModels: [
              {
                skuId: selectedSku.skuId.toString(),
                number: quantity,
              },
            ],
          },
        });

        if (!shippingError && shippingData?.data) {
          chinaShippingFeeYuan = shippingData.data.freight || 0;
          chinaShippingFeeKRW = Math.floor(chinaShippingFeeYuan * calculatorData.exchangeRate);
        }
      } catch (error) {
        console.error('중국 배송비 조회 실패:', error);
        // 배송비 조회 실패해도 계속 진행 (0원으로 처리)
      }

      // 2. 1차 비용 계산 (구간 가격 사용)
      const currentPrice = getCurrentPrice();
      const actualChinaPrice = parseFloat(currentPrice.promotionPrice || currentPrice.price);
      const chinaPriceKRW = Math.floor(actualChinaPrice * calculatorData.exchangeRate);
      const totalChinaPrice = chinaPriceKRW * quantity;
      const exwTotal = totalChinaPrice + chinaShippingFeeKRW;
      const commission = Math.floor(exwTotal * 0.05); // 5% 수수료
      const commissionVAT = Math.floor(commission * 0.1);
      const firstPayment = exwTotal + commission + commissionVAT;

      // 포장 정보 가져오기 (선택된 SKU의 정보 또는 기본 정보)
      let packageInfo = {
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
      };

      // SKU별 포장 정보가 있는지 확인
      if (productDetail.productShippingInfo.skuShippingDetails && selectedSku) {
        const skuShipping = productDetail.productShippingInfo.skuShippingDetails.find(
          (detail) => detail.skuId === selectedSku.skuId.toString()
        );
        if (skuShipping) {
          packageInfo = {
            width: skuShipping.width || 0,
            length: skuShipping.length || 0,
            height: skuShipping.height || 0,
            weight: skuShipping.weight || 0,
          };
        }
      }

      // SKU별 정보가 없으면 기본 포장 정보 사용
      if (packageInfo.width === 0 && productDetail.productShippingInfo.width !== null) {
        packageInfo = {
          width: productDetail.productShippingInfo.width || 0,
          length: productDetail.productShippingInfo.length || 0,
          height: productDetail.productShippingInfo.height || 0,
          weight: productDetail.productShippingInfo.weight || 0,
        };
      }

      // 3. 장바구니에 저장 (Supabase SDK 사용)
      const cartData = {
        user_id: session?.user?.id || null,
        offer_id: productDetail.offerId,
        sku_id: selectedSku.skuId.toString(),
        product_name: productDetail.subjectTrans,
        product_image: productDetail.productImage.images[0],
        product_url: `https://detail.1688.com/offer/${productDetail.offerId}.html`,
        selected_attributes: selectedAttributes,
        min_order_quantity: productDetail.minOrderQuantity,
        china_price: actualChinaPrice, // 구간 가격 사용
        quantity: quantity,
        exchange_rate: calculatorData.exchangeRate,
        package_width: packageInfo.width,
        package_length: packageInfo.length,
        package_height: packageInfo.height,
        package_weight: packageInfo.weight,
        china_shipping_fee: chinaShippingFeeYuan,
        china_shipping_fee_krw: chinaShippingFeeKRW,
        exw_total: exwTotal,
        commission: commission,
        commission_vat: commissionVAT,
        first_payment: firstPayment,
        memo: cartOptions.memo,
        status: 'pending',
      };

      // Supabase에 직접 저장
      const { data, error } = await supabase
        .from('cart_items_1688')
        .insert(cartData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || '장바구니 추가 실패');
      }

      alert('장바구니에 추가되었습니다!');
      setCartOptionsDialog(false); // 다이얼로그 닫기
      // 옵션 초기화
      setCartOptions({
        memo: '',
      });
      // 선택적으로 장바구니 페이지로 이동
      // router.push('/dashboard/1688/cart');
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAddingToCart(false);
    }
  };

  // 맞춤 제작 문의로 이동하는 함수
  // 이미지 번역 함수
  const handleTranslateImage = async (imageUrl: string) => {
    // 이미 번역된 이미지가 있으면 모달로 보여주기
    if (translatedImages[imageUrl]) {
      setModalImageUrl(translatedImages[imageUrl]);
      setImageModalOpen(true);
      return;
    }

    setTranslatingImage(imageUrl);
    try {
      const { translateImage } = await import('@/lib/1688/api');
      const result = await translateImage(imageUrl);
      
      if (result.success && result.data?.translatedImageUrl) {
        setTranslatedImages(prev => ({
          ...prev,
          [imageUrl]: result.data.translatedImageUrl
        }));
        // 번역 성공하면 바로 모달 열기
        setModalImageUrl(result.data.translatedImageUrl);
        setImageModalOpen(true);
      } else {
        setSnackbarMsg({ open: true, message: '이미지 번역 서비스가 준비 중입니다.', severity: 'info' });
      }
    } catch (error) {
      console.error('이미지 번역 오류:', error);
      setSnackbarMsg({ open: true, message: '이미지 번역에 실패했습니다.', severity: 'error' });
    } finally {
      setTranslatingImage(null);
    }
  };

  const goToMarketResearch = () => {
    if (!productDetail) return;
    
    const params = new URLSearchParams({
      offerId: productDetail.offerId.toString(),
      productName: productDetail.subjectTrans || productDetail.subject,
      productUrl: `https://detail.1688.com/offer/${productDetail.offerId}.html`,
      productImage: productDetail.productImage.images[0] || '',
      price: selectedSku?.price || productDetail.productSaleInfo?.priceRangeList?.[0]?.price || '',
      moq: productDetail.minOrderQuantity?.toString() || '1',
      quantity: quantity.toString(),
    });
    
    router.push(`/application/market-research?${params.toString()}`);
  };

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));

    // 색상 선택 시 해당 색상의 이미지로 변경
    if (attributeName === '색상' || attributeName === '颜色') {
      const skuWithImage = productDetail?.productSkuInfos.find((sku) =>
        sku.skuAttributes.find((attr) => 
          (attr.attributeName === '颜色' || attr.attributeName === '색상') && 
          (attr.value === value || attr.valueTrans === value)
        )
      );
      const colorImage = skuWithImage?.skuAttributes.find((attr) => attr.skuImageUrl)?.skuImageUrl;
      if (colorImage && productDetail) {
        // 색상별 이미지가 있으면 추가
        const colorImageIndex = productDetail.productImage.images.findIndex(
          (img) => img === colorImage
        );
        if (colorImageIndex === -1) {
          // 이미지가 없으면 첫 번째로 추가
          productDetail.productImage.images.unshift(colorImage);
          setSelectedImage(0);
        } else {
          setSelectedImage(colorImageIndex);
        }
      }
    }
  };
  if (loading || !productDetail) {
    return (
      <PageContainer title="상품 상세" description="1688 상품 상세 정보">
        <HpHeader />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>로딩 중...</Typography>
        </Box>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={productDetail.subjectTrans} description={productDetail.subjectTrans}>
      <HpHeader />

      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
          {/* 준비중 알림 */}
          <Alert severity="warning" icon={<ConstructionIcon />} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1688 서비스 준비중
            </Typography>
            <Typography variant="body2">
              현재 1688.com API 연동 및 서비스 준비 중입니다. 빠른 시일 내에 정식 서비스를 제공할
              예정입니다.
              <br />
            </Typography>
          </Alert>

          {/* 브레드크럼 */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/1688/search" underline="hover" color="inherit">
              1688
            </Link>
            <Link href="/1688/search" underline="hover" color="inherit">
              카테고리
            </Link>
            <Typography color="text.primary">{productDetail.subjectTrans}</Typography>
          </Breadcrumbs>

          {/* 메인 상품 정보 */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, overflow: 'hidden' }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* 이미지 갤러리 - MUI v7 size prop 사용 */}
              <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                <Box sx={{ width: '100%', overflow: 'hidden' }}>
                  {/* 메인 이미지 또는 동영상 */}
                  <Box
                    sx={{
                      position: 'relative',
                      mb: 2,
                      bgcolor: 'white',
                      border: '1px solid #e8e8e8',
                      width: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    {/* 동영상이 있고 선택된 경우 동영상 표시 */}
                    {productDetail.mainVideo && selectedImage === -1 ? (
                      <Box
                        sx={{
                          width: '100%',
                          height: { xs: 250, sm: 350, md: 450, lg: 500 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#000',
                        }}
                      >
                        <video
                          controls
                          autoPlay
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        >
                          <source src={productDetail.mainVideo} type="video/mp4" />
                          동영상을 재생할 수 없습니다.
                        </video>
                      </Box>
                    ) : (
                      <>
                        <Box
                          component="img"
                          src={translatedImages[productDetail.productImage.images[selectedImage]] || productDetail.productImage.images[selectedImage]}
                          alt={productDetail.subjectTrans}
                          sx={{
                            width: '100%',
                            maxWidth: '100%',
                            height: { xs: 250, sm: 350, md: 450, lg: 500 },
                            objectFit: 'contain',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleTranslateImage(productDetail.productImage.images[selectedImage])}
                        />
                        {/* 번역 중 표시 */}
                        {translatingImage === productDetail.productImage.images[selectedImage] && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CircularProgress color="primary" />
                          </Box>
                        )}
                        {/* 번역 버튼 */}
                        <IconButton
                          onClick={() => handleTranslateImage(productDetail.productImage.images[selectedImage])}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: translatedImages[productDetail.productImage.images[selectedImage]] ? 'success.main' : 'primary.main',
                            color: 'white',
                            '&:hover': { 
                              bgcolor: translatedImages[productDetail.productImage.images[selectedImage]] ? 'success.dark' : 'primary.dark'
                            },
                          }}
                        >
                          <TranslateIcon />
                        </IconButton>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'white' },
                          }}
                        >
                          <ZoomInIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {/* 썸네일 이미지 */}
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                    {/* 동영상 썸네일 (있는 경우) */}
                    {productDetail.mainVideo && (
                      <Box
                        onClick={() => setSelectedImage(-1)}
                        sx={{
                          width: { xs: 60, sm: 70, md: 80 },
                          height: { xs: 60, sm: 70, md: 80 },
                          border:
                            selectedImage === -1 ? '2px solid #ff6900' : '1px solid #e8e8e8',
                          cursor: 'pointer',
                          flexShrink: 0,
                          position: 'relative',
                          bgcolor: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PlayCircleIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                    )}
                    {productDetail.productImage.images.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        sx={{
                          width: { xs: 60, sm: 70, md: 80 },
                          height: { xs: 60, sm: 70, md: 80 },
                          border:
                            selectedImage === index ? '2px solid #ff6900' : '1px solid #e8e8e8',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={image}
                          alt={`${productDetail.subjectTrans} ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* 상품 정보 - MUI v7 size prop 사용 */}
              <Grid size={{ xs: 12, md: 7, lg: 7 }}>
                <Box>
                  {/* 제목 */}
                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                      spacing={2}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          {productDetail.subjectTrans}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {productDetail.subject}
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                          variant="outlined"
                          startIcon={<CalculateIcon />}
                          onClick={handleOpenCalculator}
                          fullWidth
                          color="success"
                        >
                          가격 계산기
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<OpenInNewIcon />}
                          onClick={() =>
                            window.open(
                              `https://detail.1688.com/offer/${productDetail.offerId}.html`,
                              '_blank'
                            )
                          }
                          fullWidth
                          color="primary"
                        >
                          1688에서 보기
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* 태그 */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {productDetail.isJxhy && (
                      <Chip label="프리미엄 상품" size="small" color="error" />
                    )}
                    {productDetail.tagInfoList.find((t) => t.key === 'isOnePsale')?.value && (
                      <Chip label="드롭시핑" size="small" color="primary" />
                    )}
                    {productDetail.tagInfoList.find((t) => t.key === 'isSupportMix')?.value && (
                      <Chip label="혼합 구매 가능" size="small" color="info" />
                    )}
                    {productDetail.tagInfoList.find((t) => t.key === 'isOnePsaleFreePostage')
                      ?.value && <Chip label="드롭시핑 무료배송" size="small" color="success" />}
                    {productDetail.tagInfoList.find((t) => t.key === 'noReason7DReturn')?.value && (
                      <Chip label="7일 무조건 반품" size="small" color="secondary" />
                    )}
                    {productDetail.promotionModel?.hasPromotion && (
                      <Chip
                        label={
                          productDetail.promotionModel?.promotionType === 'plus'
                            ? 'PLUS 회원 할인'
                            : '프로모션 중'
                        }
                        size="small"
                        color="warning"
                      />
                    )}
                    {productDetail.offerIdentities.includes('tp_member') && (
                      <Chip label="타오바오 회원" size="small" />
                    )}
                    {productDetail.offerIdentities.includes('manufacturer') && (
                      <Chip label="제조 공장" size="small" />
                    )}
                    {productDetail.offerIdentities.includes('verified_supplier') && (
                      <Chip label="인증 판매자" size="small" icon={<VerifiedIcon />} />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* 구매 정보 및 태그 */}
                  <Box sx={{ mb: 2 }}>
                    <Stack spacing={1.5}>
                      {/* 최소 주문 수량 */}
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          최소 주문:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {productDetail.minOrderQuantity || 1}{productDetail.productSaleInfo.unitInfo.transUnit}
                        </Typography>
                      </Stack>

                      {/* 혼합 구매 정보 */}
                      {productDetail.sellerMixSetting?.generalHunpi && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            혼합 구매:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            최소 {productDetail.sellerMixSetting.mixNumber}개 / ¥{productDetail.sellerMixSetting.mixAmount}
                          </Typography>
                        </Stack>
                      )}

                      {/* 배송 보장 */}
                      {productDetail.productShippingInfo?.shippingTimeGuarantee && (
                        <Chip 
                          icon={<LocalShippingIcon />} 
                          label={
                            productDetail.productShippingInfo.shippingTimeGuarantee === 'shipIn48Hours' 
                              ? '48시간 내 배송' 
                              : '빠른 배송'
                          }
                          color="success"
                          size="small"
                        />
                      )}

                      {/* 태그 정보 */}
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {productDetail.tagInfoList?.map((tag, index) => {
                          if (tag.value) {
                            let label = '';
                            let color: any = 'default';
                            switch(tag.key) {
                              case 'isOnePsale':
                                label = '일대일 판매';
                                color = 'primary';
                                break;
                              case 'isSupportMix':
                                label = '혼합 구매 가능';
                                color = 'info';
                                break;
                              case 'isOnePsaleFreePostage':
                                label = '무료 배송';
                                color = 'success';
                                break;
                              case 'noReason7DReturn':
                                label = '7일 무조건 반품';
                                color = 'warning';
                                break;
                              default:
                                return null;
                            }
                            return label ? (
                              <Chip key={index} label={label} size="small" color={color} />
                            ) : null;
                          }
                          return null;
                        })}
                      </Stack>
                    </Stack>
                  </Box>

                  {/* 가격 정보 */}
                  <Box sx={{ bgcolor: '#fff5f0', p: { xs: 1.5, sm: 2 }, borderRadius: 1, mb: 2 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          가격 구간
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                          {getCurrentPrice().promotionPrice ? (
                            <>
                              <Typography variant="h4" color="error" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                                ¥{getCurrentPrice().promotionPrice}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                              >
                                ¥{getCurrentPrice().price}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h4" color="error" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                              ¥{getCurrentPrice().price}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* 가격 구간 표시 */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
                        {productDetail.productSaleInfo.priceRangeList.map((range, index) => (
                          <Box key={index}>
                            <Typography variant="caption" color="text.secondary">
                              ≥{range.startQuantity}
                              {productDetail.productSaleInfo.unitInfo.unit}
                            </Typography>
                            {range.promotionPrice ? (
                              <Stack direction="row" spacing={0.5} alignItems="baseline">
                                <Typography variant="body2" fontWeight={600} color="error">
                                  ¥{range.promotionPrice}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ textDecoration: 'line-through' }}
                                >
                                  ¥{range.price}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" fontWeight={600}>
                                ¥{range.price}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  </Box>

                  {/* SKU 선택 */}
                  <Box sx={{ mb: 2 }}>
                    {/* 색상 선택 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        색상
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {Array.from(
                          new Set(
                            productDetail.productSkuInfos.map(
                              (sku) => {
                                const colorAttr = sku.skuAttributes.find((attr) => 
                                  attr.attributeName === '颜色'
                                );
                                return colorAttr?.valueTrans || colorAttr?.value;
                              }
                            )
                          )
                        )
                          .filter(Boolean)
                          .map((color) => (
                            <Chip
                              key={color}
                              label={color}
                              onClick={() => handleAttributeSelect('색상', color!)}
                              variant={selectedAttributes['색상'] === color ? 'filled' : 'outlined'}
                              color={selectedAttributes['색상'] === color ? 'primary' : 'default'}
                            />
                          ))}
                      </Stack>
                    </Box>

                    {/* 사이즈 선택 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        사이즈
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {Array.from(
                          new Set(
                            productDetail.productSkuInfos.map(
                              (sku) => {
                                const sizeAttr = sku.skuAttributes.find((attr) => 
                                  attr.attributeName === '尺码'
                                );
                                return sizeAttr?.valueTrans || sizeAttr?.value;
                              }
                            )
                          )
                        )
                          .filter(Boolean)
                          .map((size) => (
                            <Chip
                              key={size}
                              label={size}
                              onClick={() => handleAttributeSelect('사이즈', size!)}
                              variant={selectedAttributes['사이즈'] === size ? 'filled' : 'outlined'}
                              color={selectedAttributes['사이즈'] === size ? 'primary' : 'default'}
                            />
                          ))}
                      </Stack>
                    </Box>
                  </Box>

                  {/* 수량 선택 */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      구매 수량
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                      <ButtonGroup size="small">
                        <Button onClick={() => handleQuantityChange(-1)}>
                          <RemoveIcon />
                        </Button>
                        <TextField
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          sx={{ width: 80 }}
                          size="small"
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                        <Button onClick={() => handleQuantityChange(1)}>
                          <AddIcon />
                        </Button>
                      </ButtonGroup>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {productDetail.productSaleInfo.unitInfo.transUnit || productDetail.productSaleInfo.unitInfo.unit} (최소주문수량: {productDetail.minOrderQuantity})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          재고: {productDetail.productSaleInfo.amountOnSale}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* 배송 정보 */}
                  <Box sx={{ mb: 3 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalShippingIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          배송지: {productDetail.productShippingInfo.sendGoodsAddressText}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {productDetail.productShippingInfo.shippingTimeGuarantee}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* 액션 버튼 */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="column" spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ bgcolor: '#ff6900' }}
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => {
                          // 옵션 체크
                          if (!productDetail) {
                            alert('상품 정보를 불러오는 중입니다.');
                            return;
                          }
                          if (!selectedSku) {
                            alert('상품 옵션을 선택해주세요.');
                            return;
                          }
                          setCartOptionsDialog(true);
                        }}
                      >
                        장바구니 담기
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        color="secondary"
                        onClick={() => router.push('/dashboard/1688/cart')}
                        sx={{ width: { xs: '100%', sm: 140 } }}
                        startIcon={<ListAltIcon />}
                      >
                        장바구니 보기
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setIsFavorite(!isFavorite)}
                        sx={{ width: { xs: '100%', sm: 120 } }}
                      >
                        {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                      </Button>
                    </Stack>
                    
                    {/* 맞춤 제작 문의 버튼 */}
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      color="primary"
                      startIcon={<BrushIcon />}
                      onClick={goToMarketResearch}
                      sx={{ mt: 2 }}
                    >
                      맞춤 제작 문의 (로고/포장/샘플)
                    </Button>

                    <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
                      {/* 제품 문의 채팅 버튼 */}
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        color="info"
                        startIcon={<ChatIcon />}
                        onClick={() => setChatDialog(true)}
                      >
                        제품 문의하기
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 배송 정보 */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              배송 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <LocalShipping color="action" />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  발송지: {productDetail.productShippingInfo.sendGoodsAddressText}
                </Typography>
              </Box>
              {productDetail.productShippingInfo.shippingTimeGuarantee && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <AccessTime color="action" />
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    배송 보증:{' '}
                    {productDetail.productShippingInfo.shippingTimeGuarantee === 'shipIn48Hours'
                      ? '48시간 내 발송'
                      : productDetail.productShippingInfo.shippingTimeGuarantee}
                  </Typography>
                </Box>
              )}

              {/* 제품 치수 정보 */}
              {(productDetail.productShippingInfo.width !== null ||
                productDetail.productShippingInfo.height !== null ||
                productDetail.productShippingInfo.length !== null ||
                productDetail.productShippingInfo.weight !== null) && (
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    제품 규격
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {productDetail.productShippingInfo.width !== null && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          너비
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {productDetail.productShippingInfo.width} cm
                        </Typography>
                      </Grid>
                    )}
                    {productDetail.productShippingInfo.length !== null && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          길이
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {productDetail.productShippingInfo.length} cm
                        </Typography>
                      </Grid>
                    )}
                    {productDetail.productShippingInfo.height !== null && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          높이
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {productDetail.productShippingInfo.height} cm
                        </Typography>
                      </Grid>
                    )}
                    {productDetail.productShippingInfo.weight !== null && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          무게
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {productDetail.productShippingInfo.weight} kg
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* 포장 규격 정보 - 대표값만 표시 */}
              {productDetail.productShippingInfo.skuShippingDetails &&
                productDetail.productShippingInfo.skuShippingDetails.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      포장 규격
                    </Typography>
                    {(() => {
                      // 첫 번째 SKU의 치수를 대표값으로 사용
                      const representativeSku =
                        productDetail.productShippingInfo.skuShippingDetails[0];
                      return (
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                포장 너비
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {representativeSku.width} cm
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                포장 길이
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {representativeSku.length} cm
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                포장 높이
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {representativeSku.height} cm
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                포장 무게
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {representativeSku.weight} kg
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            * 포장 규격은 배송비 계산에 사용됩니다
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Box>
                )}

              {/* freightTemplateId는 현재 인터페이스에 없음 
              {productDetail.productShippingInfo.freightTemplateId && (
                <Typography variant="body2" color="text.secondary">
                  운송 템플릿 ID: {productDetail.productShippingInfo.freightTemplateId}
                </Typography>
              )} */}
            </Box>
          </Paper>

          {/* 판매자 정보 */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              판매자 정보
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      종합 서비스 점수
                    </Typography>
                    <Rating
                      value={Number(productDetail.sellerDataInfo.compositeServiceScore)}
                      readOnly
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      물류 체험 점수
                    </Typography>
                    <Rating
                      value={Number(productDetail.sellerDataInfo.logisticsExperienceScore)}
                      readOnly
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      상품 체험 점수
                    </Typography>
                    <Rating
                      value={Number(productDetail.sellerDataInfo.offerExperienceScore)}
                      readOnly
                      size="small"
                    />
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      재구매율
                    </Typography>
                    <Typography variant="body2">
                      {(Number(productDetail.sellerDataInfo.repeatPurchasePercent) * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      48시간 내 수거율
                    </Typography>
                    <Typography variant="body2">
                      {productDetail.sellerDataInfo.collect30DayWithin48HPercent 
                        ? `${(Number(productDetail.sellerDataInfo.collect30DayWithin48HPercent) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      품질 환불율
                    </Typography>
                    <Typography variant="body2">
                      {(Number(productDetail.sellerDataInfo.qualityRefundWithin30Day) * 100).toFixed(2)}%
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* 상세 정보 탭 */}
          <Paper sx={{ overflow: 'hidden' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="상품 상세" />
              <Tab label="상품 속성" />
              <Tab label="배송 정보" />
              <Tab label="거래 기록" />
              <Tab label="평가" />
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
              {activeTab === 0 && (
                <>
                  {/* 이미지 번역 안내 */}
                  <Alert severity="info" sx={{ mb: 2 }} icon={<TranslateIcon />}>
                    상품 설명의 이미지를 클릭하면 한글로 번역된 이미지를 볼 수 있습니다
                  </Alert>
                  
                  {/* 번역 중 메시지 */}
                  {translatingImage && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      이미지 번역 중...
                    </Alert>
                  )}
                  
                  <Box
                    className="product-description"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'IMG') {
                        const img = target as HTMLImageElement;
                        handleTranslateImage(img.src);
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: productDetail.description }}
                    sx={{
                      width: '100%',
                      // 이미지 스타일
                      '& img': {
                        width: '100% !important',
                        maxWidth: '100% !important',
                        height: 'auto !important',
                        display: 'block !important',
                        margin: '0 auto !important',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9,
                        },
                      },
                      // 텍스트 스타일
                      '& p': {
                        margin: '10px 0',
                        padding: '0 10px',
                        wordBreak: 'break-word',
                        fontSize: { xs: '14px', sm: '16px' },
                        lineHeight: 1.6,
                      },
                      // 모바일 반응형
                      '& *': {
                        maxWidth: '100%',
                      },
                    }}
                  />
                </>
              )}

              {activeTab === 1 && (
                <TableContainer>
                  <Table>
                    <TableBody>
                      {productDetail.productAttribute.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell>{attr.attributeNameTrans}</TableCell>
                          <TableCell>{attr.valueTrans}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    배송 정보
                  </Typography>
                  
                  <Stack spacing={3}>
                    {/* 배송 보장 정보 */}
                    {productDetail.productShippingInfo?.shippingTimeGuarantee && (
                      <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <LocalShippingIcon color="success" sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {productDetail.productShippingInfo.shippingTimeGuarantee === 'shipIn48Hours' 
                                ? '48시간 내 발송 보장' 
                                : '빠른 배송 보장'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              판매자가 약속한 시간 내에 발송을 보장합니다
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    )}

                    {/* 포장 정보 */}
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        기본 포장 정보
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              가로
                            </Typography>
                            <Typography variant="body1">
                              {productDetail.productShippingInfo.width || '미제공'} cm
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              세로
                            </Typography>
                            <Typography variant="body1">
                              {productDetail.productShippingInfo.length || '미제공'} cm
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              높이
                            </Typography>
                            <Typography variant="body1">
                              {productDetail.productShippingInfo.height || '미제공'} cm
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              무게
                            </Typography>
                            <Typography variant="body1">
                              {productDetail.productShippingInfo.weight || '미제공'} kg
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                      
                      {productDetail.productShippingInfo.productNum && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            포장 단위
                          </Typography>
                          <Typography variant="body1">
                            {productDetail.productShippingInfo.productNum}개/박스
                          </Typography>
                        </Box>
                      )}
                    </Paper>

                    {/* SKU별 포장 정보 (있는 경우) */}
                    {productDetail.productShippingInfo?.skuShippingDetails && 
                     productDetail.productShippingInfo.skuShippingDetails.length > 0 && (
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          옵션별 포장 정보
                        </Typography>
                        <TableContainer sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>옵션</TableCell>
                                <TableCell align="center">가로</TableCell>
                                <TableCell align="center">세로</TableCell>
                                <TableCell align="center">높이</TableCell>
                                <TableCell align="center">무게</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {productDetail.productShippingInfo.skuShippingDetails.map((detail, index) => {
                                const sku = productDetail.productSkuInfos.find(s => s.skuId === detail.skuId);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {sku?.skuAttributes.map(attr => attr.valueTrans || attr.value).join(', ') || detail.skuId}
                                    </TableCell>
                                    <TableCell align="center">{detail.width || '-'} cm</TableCell>
                                    <TableCell align="center">{detail.length || '-'} cm</TableCell>
                                    <TableCell align="center">{detail.height || '-'} cm</TableCell>
                                    <TableCell align="center">{detail.weight || '-'} kg</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    )}

                    {/* 배송 방식 정보 */}
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        배송 방식
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">
                            중국 내 배송: 판매자 → 항저우 창고
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">
                            국제 배송: 항저우 → 한국 (해운/항공)
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">
                            통관 및 국내 배송 대행 가능
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Alert severity="info">
                      실제 배송비는 구매 수량, 배송 방법, 최종 목적지에 따라 달라질 수 있습니다.
                      정확한 배송비는 가격 계산기를 통해 확인하세요.
                    </Alert>
                  </Stack>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    거래 정보
                  </Typography>
                  
                  <Stack spacing={3}>
                    {/* 판매량 정보 */}
                    <Paper sx={{ p: 2, bgcolor: '#f8f8f8' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          총 판매량
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {productDetail.soldOut || '0'}개
                        </Typography>
                      </Stack>
                    </Paper>

                    {/* 거래 점수 */}
                    <Paper sx={{ p: 2, bgcolor: '#f8f8f8' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          거래 점수
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Rating value={Number(productDetail.tradeScore)} readOnly precision={0.1} />
                          <Typography variant="h6" color="primary">
                            {productDetail.tradeScore}/5.0
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* 판매자 거래 정보 */}
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        판매자 거래 통계
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              재구매율
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {(Number(productDetail.sellerDataInfo.repeatPurchasePercent) * 100).toFixed(1)}%
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              품질 환불율
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {(Number(productDetail.sellerDataInfo.qualityRefundWithin30Day) * 100).toFixed(2)}%
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              거래 메달 레벨
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              Level {productDetail.sellerDataInfo.tradeMedalLevel}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              48시간 내 수거율
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {productDetail.sellerDataInfo.collect30DayWithin48HPercent 
                                ? `${(Number(productDetail.sellerDataInfo.collect30DayWithin48HPercent) * 100).toFixed(1)}%`
                                : 'N/A'}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Alert severity="info">
                      거래 기록은 1688 판매자가 제공하는 데이터를 기반으로 표시됩니다.
                      상세한 거래 내역은 1688.com에서 직접 확인하실 수 있습니다.
                    </Alert>
                  </Stack>
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    서비스 평가
                  </Typography>
                  
                  <Stack spacing={3}>
                    {/* 종합 평가 점수 */}
                    <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="h6" gutterBottom>
                        종합 서비스 점수
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h3">
                          {productDetail.sellerDataInfo.compositeServiceScore}
                        </Typography>
                        <Rating 
                          value={Number(productDetail.sellerDataInfo.compositeServiceScore)} 
                          readOnly 
                          sx={{ 
                            '& .MuiRating-iconFilled': { color: 'white' },
                            '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }
                          }}
                        />
                      </Stack>
                    </Paper>

                    {/* 세부 평가 점수 */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ p: 2 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">물류 체험</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.sellerDataInfo.logisticsExperienceScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.sellerDataInfo.logisticsExperienceScore}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">상품 체험</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.sellerDataInfo.offerExperienceScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.sellerDataInfo.offerExperienceScore}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">상담 체험</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.sellerDataInfo.consultingExperienceScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.sellerDataInfo.consultingExperienceScore}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ p: 2 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">분쟁 해결</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.sellerDataInfo.disputeComplaintScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.sellerDataInfo.disputeComplaintScore}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">교환/환불</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.sellerDataInfo.afterSalesExperienceScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.sellerDataInfo.afterSalesExperienceScore}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">거래 평가</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={Number(productDetail.tradeScore)} 
                                  readOnly 
                                  size="small" 
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {productDetail.tradeScore}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* 평가 요약 */}
                    <Alert severity="success">
                      <Typography variant="subtitle2" gutterBottom>
                        판매자 평가 요약
                      </Typography>
                      <Typography variant="body2">
                        • 재구매율: {(Number(productDetail.sellerDataInfo.repeatPurchasePercent) * 100).toFixed(1)}%<br/>
                        • 품질 환불율: {(Number(productDetail.sellerDataInfo.qualityRefundWithin30Day) * 100).toFixed(2)}%<br/>
                        • 거래 메달: Level {productDetail.sellerDataInfo.tradeMedalLevel}
                      </Typography>
                    </Alert>

                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                      * 평가 점수는 1688 플랫폼에서 제공하는 판매자 데이터를 기반으로 표시됩니다.
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 가격 계산기 다이얼로그 */}
      <Dialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">수입 가격 계산기</Typography>
            <IconButton onClick={() => setCalculatorOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* 입력 필드 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="primary">
                  💵 기본 정보 (입력 필수)
                </Typography>
                <TextField
                  fullWidth
                  label="중국 단가"
                  type="number"
                  value={calculatorData.chinaPrice}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({ ...prev, chinaPrice: Number(e.target.value) }))
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                  helperText={`원화: ₩${Math.floor(calculatorData.chinaPrice * calculatorData.exchangeRate).toLocaleString()}`}
                  sx={{ bgcolor: '#fffbf0' }}
                />
                <TextField
                  fullWidth
                  label="구매 수량"
                  type="number"
                  value={calculatorData.quantity}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">개</InputAdornment>,
                  }}
                  sx={{ bgcolor: '#fffbf0' }}
                />
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    환율: ¥1 = ₩{calculatorData.exchangeRate} (두리무역 고정환율)
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  🚚 중국 내 배송비
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={fetchChinaShippingFee}
                  disabled={chinaShippingLoading}
                  startIcon={<LocalShippingIcon />}
                  sx={{ mb: 1 }}
                >
                  {chinaShippingLoading ? '조회 중...' : '중국 배송비 자동 조회'}
                </Button>
                <Box sx={{ p: 2, bgcolor: '#f0f8ff', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    중국 내 배송비: ¥{calculatorData.chinaShippingFee.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    원화: ₩
                    {Math.floor(
                      calculatorData.chinaShippingFee * calculatorData.exchangeRate
                    ).toLocaleString()}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  📦 포장 정보
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {calculatorData.packageWidth > 0 &&
                  calculatorData.packageLength > 0 &&
                  calculatorData.packageHeight > 0 ? (
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          너비
                        </Typography>
                        <Typography variant="body2">{calculatorData.packageWidth} cm</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          길이
                        </Typography>
                        <Typography variant="body2">{calculatorData.packageLength} cm</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          높이
                        </Typography>
                        <Typography variant="body2">{calculatorData.packageHeight} cm</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          무게
                        </Typography>
                        <Typography variant="body2">{calculatorData.packageWeight} kg</Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      중국 배송비 조회 시 자동 입력됩니다
                    </Typography>
                  )}
                </Box>

                {/* CBM 실시간 계산 표시 */}
                {calculatorData.packageWidth > 0 &&
                  calculatorData.packageLength > 0 &&
                  calculatorData.packageHeight > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            개별 CBM
                          </Typography>
                          <Typography variant="h6">
                            {(
                              (calculatorData.packageWidth *
                                calculatorData.packageLength *
                                calculatorData.packageHeight) /
                              1000000
                            ).toFixed(6)} m³
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            총 CBM
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {(
                              (calculatorData.packageWidth *
                                calculatorData.packageLength *
                                calculatorData.packageHeight *
                                calculatorData.quantity) /
                              1000000
                            ).toFixed(2)} m³
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        * 15 CBM 이상: FCL 권장 | 15 CBM 미만: LCL 권장
                      </Typography>
                    </Box>
                  )}

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  🚢 운송 방법
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {(() => {
                    const totalCBM =
                      calculatorData.packageWidth > 0 &&
                      calculatorData.packageLength > 0 &&
                      calculatorData.packageHeight > 0
                        ? (calculatorData.packageWidth *
                            calculatorData.packageLength *
                            calculatorData.packageHeight *
                            calculatorData.quantity) /
                          1000000
                        : 0;
                    const autoMethod = totalCBM >= 15 ? 'FCL' : 'LCL';

                    return (
                      <>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={autoMethod === 'FCL' ? 'error' : 'primary'}
                        >
                          {autoMethod} 운송 (자동 선택)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {autoMethod === 'LCL'
                            ? `LCL: ${totalCBM <= 1 ? '₩90,000 (1CBM 이하)' : `₩${Math.floor(totalCBM * 90000).toLocaleString()} (${totalCBM.toFixed(2)} CBM × ₩90,000)`}`
                            : 'FCL: ₩3,000,000 (컨테이너 운송)'}
                        </Typography>
                        {totalCBM > 0 && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            총 CBM: {totalCBM.toFixed(2)} m³ (
                            {totalCBM >= 15 ? '15 CBM 이상' : '15 CBM 미만'})
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  🏛️ 세금 및 수수료
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleHsCodeLookup}
                  disabled={lookingUpHsCode}
                  startIcon={<SearchIcon />}
                  sx={{ mb: 2 }}
                >
                  {lookingUpHsCode ? 'HS코드 조회 중...' : 'HS코드 및 관세율 자동 조회'}
                </Button>

                {hsCodeProgress && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {hsCodeProgress}
                  </Alert>
                )}

                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        HS코드
                      </Typography>
                      <Typography variant="body2">
                        {calculatorData.hsCode || '조회 필요'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        관세율
                      </Typography>
                      <Typography variant="body2">{calculatorData.customsRate}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        수수료
                      </Typography>
                      <Typography variant="body2">
                        {calculatorData.commissionRate}% (고정)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        관세사 비용
                      </Typography>
                      <Typography variant="body2">
                        ₩{calculatorData.customsBrokerFee.toLocaleString()} (고정)
                      </Typography>
                    </Box>
                    {calculatorData.coCertificateFee > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          원산지증명서
                        </Typography>
                        <Typography variant="body2" color="error">
                          ₩{calculatorData.coCertificateFee.toLocaleString()} (한중FTA 적용)
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* 계산 결과 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>
                  계산 결과
                </Typography>
                <Table size="small">
                  <TableBody>
                    {(() => {
                      const result = calculatePrice();
                      return (
                        <>
                          {/* 기본 가격 */}
                          <TableRow>
                            <TableCell>중국 단가 (원화)</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.chinaPriceKRW || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>총 상품가격</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.totalChinaPrice || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>중국 내 배송비</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.chinaShippingKRW || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* EXW 합계 */}
                          <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                            <TableCell sx={{ fontWeight: 600 }}>EXW 합계</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              ₩{Math.floor(result.exwTotal || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* 수수료 */}
                          <TableRow>
                            <TableCell>수수료 ({calculatorData.commissionRate}%)</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.commission || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>수수료 VAT (10%)</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.commissionVAT || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* 1차 결제 비용 */}
                          <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 700 }}>1차 결제 비용</TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              ₩{Math.floor(result.firstPayment || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* CBM 및 운송비 */}
                          {result.totalCBM > 0 && (
                            <>
                              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                                  운송비 계산
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 4 }}>박스당 CBM</TableCell>
                                <TableCell align="right">
                                  {result.boxCBM?.toFixed(4) || 0} m³
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 4 }}>총 CBM</TableCell>
                                <TableCell align="right">
                                  {result.totalCBM?.toFixed(2) || 0} m³
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 4 }}>총 무게</TableCell>
                                <TableCell align="right">
                                  {result.totalWeight?.toFixed(2) || 0} kg
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pl: 4 }}>
                                  운송방법: {result.shippingMethod}
                                </TableCell>
                                <TableCell align="right">
                                  {result.shippingMethod === 'LCL'
                                    ? result.totalCBM <= 1
                                      ? '1CBM 이하 ₩90,000'
                                      : `${result.totalCBM?.toFixed(2) || 0} CBM × ₩90,000`
                                    : 'FCL 운송'}
                                </TableCell>
                              </TableRow>
                            </>
                          )}

                          <TableRow>
                            <TableCell>한중 운송비</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.internationalShipping || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* 관세 및 통관 */}
                          <TableRow>
                            <TableCell>관세 ({calculatorData.customsRate}%)</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.customsDuty || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>관세사 비용</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.customsBrokerFee || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>원산지증명서</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.coCertificateFee || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>수입 VAT (10%)</TableCell>
                            <TableCell align="right">
                              ₩{Math.floor(result.importVAT || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* 2차 결제 비용 */}
                          <TableRow sx={{ bgcolor: '#fce4ec' }}>
                            <TableCell sx={{ fontWeight: 700 }}>2차 결제 비용</TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, color: 'secondary.main' }}
                            >
                              ₩{Math.floor(result.secondPayment || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>

                          {/* 최종 비용 */}
                          <TableRow sx={{ bgcolor: '#ffebee' }}>
                            <TableCell sx={{ fontWeight: 700 }}>총 비용</TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, color: 'error.main', fontSize: '1.2rem' }}
                            >
                              ₩{Math.floor(result.totalCost || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: '#fff3e0' }}>
                            <TableCell sx={{ fontWeight: 700 }}>개당 원가</TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}
                            >
                              ₩{Math.floor(result.unitCost || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>

                {/* 장바구니 추가 버튼 */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? '추가 중...' : '장바구니에 추가'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<ListAltIcon />}
                    onClick={() => router.push('/dashboard/1688/cart')}
                  >
                    장바구니 보기
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorOpen(false)} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 장바구니 옵션 다이얼로그 */}
      <Dialog
        open={cartOptionsDialog}
        onClose={() => setCartOptionsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>장바구니 담기 옵션</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* 선택된 상품 정보 표시 */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {productDetail?.subjectTrans}
              </Typography>
              {selectedSku && (
                <>
                  <Typography variant="body2">
                    옵션: {selectedSku.skuAttributes.map((attr: any) => `${attr.value}`).join(', ')}
                  </Typography>
                  <Typography variant="body2">수량: {quantity}개</Typography>
                  <Typography variant="body2" color="primary">
                    단가: ¥{getCurrentPrice().promotionPrice || getCurrentPrice().price}
                    (₩
                    {Math.floor(
                      parseFloat(getCurrentPrice().promotionPrice || getCurrentPrice().price) *
                        calculatorData.exchangeRate
                    ).toLocaleString()}
                    )
                  </Typography>
                </>
              )}
            </Alert>

            {/* 메모 입력 */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="메모 (선택사항)"
              placeholder="특별 요청사항이나 메모를 입력하세요"
              value={cartOptions.memo}
              onChange={(e) => setCartOptions({ ...cartOptions, memo: e.target.value })}
              sx={{ mb: 3 }}
            />

            {/* 커스터마이징 안내 */}
            <Typography variant="subtitle2" gutterBottom>
              커스터마이징이 필요하신가요?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              로고 인쇄, 포장 변경, 샘플 제작 등이 필요하시면 '맞춤 제작 문의' 버튼을 이용해주세요.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOptionsDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={addingToCart}
            startIcon={<ShoppingCartIcon />}
          >
            {addingToCart ? '추가 중...' : '장바구니에 담기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 채팅 모달 (Drawer) */}
      <Drawer
        anchor="right"
        open={chatDialog}
        onClose={() => setChatDialog(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 500, md: 600 },
            maxWidth: '100%',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 헤더 */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ChatIcon color="info" />
              <Box>
                <Typography variant="h6">제품 문의</Typography>
                <Typography variant="caption" color="text.secondary">
                  {productDetail?.subjectTrans}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setChatDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 채팅 컴포넌트 */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <React.Suspense
              fallback={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Typography>채팅 로딩 중...</Typography>
                </Box>
              }
            >
              {chatDialog && productDetail && (
                <ChatPanel
                  reservationNumber={`PROD-${productDetail.offerId}`}
                  currentUserId={undefined} // GlobalContext에서 자동으로 가져옴
                  currentUserRole={undefined} // GlobalContext에서 자동으로 가져옴
                  currentUserName={undefined} // GlobalContext에서 자동으로 가져옴
                  serviceType="product-inquiry"
                />
              )}
            </React.Suspense>
          </Box>
        </Box>
      </Drawer>

      {/* 이미지 번역 모달 */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { bgcolor: 'rgba(0, 0, 0, 0.8)' }
        }}
      >
        <Fade in={imageModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
              maxWidth: '1200px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              outline: 'none',
            }}
          >
            {/* 닫기 버튼 */}
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* 번역된 이미지 */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
            >
              <img
                src={modalImageUrl}
                alt="번역된 이미지"
                style={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Footer />
    </PageContainer>
  );
}
