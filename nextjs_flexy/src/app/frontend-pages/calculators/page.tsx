'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  InputAdornment,
  Divider,
  Chip,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Fade,
  Zoom,
  CardHeader,
  Snackbar,
} from '@mui/material';
import {
  Calculate,
  ViewInAr,
  AttachMoney,
  ContentCopy,
  Refresh,
  LocalShipping,
  Scale,
  ThreeDRotation,
  CurrencyExchange,
  Description,
  Check,
  Search,
  AccountBalance,
  LocalOffer,
  Inventory,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import ScrollToTop from '@/app/components/frontend-pages/shared/scroll-to-top';
import { motion } from 'framer-motion';

// 컴포넌트 임포트
import Container3D from './components/Container3D';
import { HSCodeSmartSearch } from './components/HSCodeSmartSearch';
import { HSCodeSimpleSearch } from './components/HSCodeSimpleSearch';
import ExchangeRateDisplay from './components/ExchangeRateDisplay';

const supabase = createClient();

// 계산기 카테고리 정의
const CALCULATOR_CATEGORIES = [
  {
    id: 'search',
    title: 'HS코드 조회',
    icon: <Search />,
    color: '#f4511e',
    calculators: ['hs'],
  },
  {
    id: 'shipping',
    title: '배송 계산',
    icon: <LocalShipping />,
    color: '#1e88e5',
    calculators: ['cbm', 'volume'],
  },
  {
    id: 'tax',
    title: '수입비용 계산기',
    icon: <AccountBalance />,
    color: '#43a047',
    calculators: ['import', 'exchange'],
  },
];

const CalculatorsPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('search');
  const [selectedCalculator, setSelectedCalculator] = useState('hs');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // CBM 계산기 상태
  const [cbmInputs, setCbmInputs] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    unit: 'cm',
  });
  const [cbmResult, setCbmResult] = useState<number | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [containerType, setContainerType] = useState<'20ft' | '40ft' | '40hc'>('20ft');

  // 용적중량 계산기 상태
  const [volumeInputs, setVolumeInputs] = useState({
    length: '',
    width: '',
    height: '',
    unit: 'cm',
    actualWeight: '',
  });
  const [volumeResult, setVolumeResult] = useState<{
    volumeWeight: number;
    actualWeight: number;
    chargeableWeight: number;
  } | null>(null);

  // 관세 계산기 상태
  const [taxInputs, setTaxInputs] = useState({
    hsCode: '',
    productPrice: '',
    quantity: '1',
    currency: 'USD',
    shippingCost: '',
    shippingCurrency: 'USD',
    insuranceCost: '',
    otherCosts: '',
    exchangeRateDate: new Date().toISOString().slice(0, 10),
  });
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [tariffRates, setTariffRates] = useState<any>(null);
  const [taxResult, setTaxResult] = useState<any>(null);

  // 환율 계산기 상태
  const [exchangeInputs, setExchangeInputs] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'KRW',
    date: new Date().toISOString().slice(0, 10),
  });
  const [exchangeResult, setExchangeResult] = useState<any>(null);

  // HS코드 검색 결과 상태
  const [hsSearchResult, setHsSearchResult] = useState<any>(null);

  useEffect(() => {
    // Supabase 테이블에서 환율 가져오기 (로그인 없이도 가능)
    fetchExchangeRateFromDB();
  }, []);

  const fetchExchangeRateFromDB = async () => {
    try {
      // 직접 테이블에서 조회 (RLS 정책으로 누구나 읽기 가능)
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('date, usd_rate, cny_rate')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      console.log('DB 환율 직접 조회:', data, error);

      if (!error && data) {
        const formattedData = {
          success: true,
          date: data.date,
          primaryCurrencies: {
            USD: { rate: parseFloat(data.usd_rate) },
            CNY: { rate: parseFloat(data.cny_rate) },
          },
        };
        setExchangeRates(formattedData);
        console.log('환율 설정 완료:', formattedData);
      } else {
        console.log('DB 조회 실패, 기본값 사용');
        // 오류시 기본값 사용
        setExchangeRates({
          success: false,
          date: new Date().toISOString().slice(0, 10),
          primaryCurrencies: {
            USD: { rate: 1470 },
            CNY: { rate: 201 },
          },
        });
      }
    } catch (error) {
      console.error('환율 조회 오류:', error);
      // 오류시 기본값 사용
      setExchangeRates({
        success: false,
        date: new Date().toISOString().slice(0, 10),
        primaryCurrencies: {
          USD: { rate: 1470 },
          CNY: { rate: 201 },
        },
      });
    }
  };

  const syncExchangeRate = async () => {
    try {
      // 환율 동기화 Edge Function 호출
      const { data, error } = await supabase.functions.invoke('exchange-rate-sync');

      if (!error && data?.data) {
        const formattedData = {
          success: true,
          date: data.data.date,
          primaryCurrencies: {
            USD: { rate: parseFloat(data.data.usd_rate) },
            CNY: { rate: parseFloat(data.data.cny_rate) },
          },
        };
        setExchangeRates(formattedData);
      }
    } catch (error) {
      console.error('환율 동기화 오류:', error);
    }
  };

  const fetchExchangeRate = async (date?: string) => {
    setLoading(true);
    try {
      const queryDate = date
        ? date.replace(/-/g, '')
        : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const { data, error } = await supabase.functions.invoke('exchange-rate', {
        body: { date: queryDate },
      });

      if (!error && data?.success) {
        setExchangeRates(data);
        // 로컬스토리지에 캐시 저장
        localStorage.setItem('exchangeRates', JSON.stringify(data));
        localStorage.setItem('exchangeRatesTime', new Date().toISOString());
        console.log('환율 캐시 저장 완료');
      } else {
        // Fallback 기본 환율 적용 (서비스 지속성 보장)
        setExchangeRates({
          success: false,
          date: queryDate,
          primaryCurrencies: {
            USD: { rate: 1470 },
            CNY: { rate: 201 },
          },
        });
        showSnackbar('환율 API 오류로 기본 환율을 적용했습니다', 'info');
      }
    } catch (error) {
      // 네트워크/엣지 함수 오류 시에도 기본 환율로 동작
      setExchangeRates({
        success: false,
        date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        primaryCurrencies: {
          USD: { rate: 1470 },
          CNY: { rate: 201 },
        },
      });
      showSnackbar('환율 API 연결 오류로 기본 환율을 적용했습니다', 'info');
    } finally {
      setLoading(false);
    }
  };

  // 가장 낮은 세율 타입 반환
  const getLowestRate = () => {
    if (!tariffRates) return null;

    const rates = [];
    if (tariffRates.basic?.rate !== undefined) {
      rates.push({ type: 'basic', rate: tariffRates.basic.rate });
    }
    if (tariffRates.wto?.rate !== undefined) {
      rates.push({ type: 'wto', rate: tariffRates.wto.rate });
    }
    if (tariffRates.fta?.rate !== undefined) {
      rates.push({ type: 'fta', rate: tariffRates.fta.rate });
    }
    if (tariffRates.fcn?.rate !== undefined) {
      rates.push({ type: 'fcn', rate: tariffRates.fcn.rate });
    }

    if (rates.length === 0) return 'basic';

    const lowest = rates.reduce((min, current) => (current.rate < min.rate ? current : min));

    return lowest.type;
  };

  const fetchHsCodeData = async (providedHsCode?: string) => {
    const hsCode = providedHsCode || taxInputs.hsCode;

    if (!hsCode) {
      showSnackbar('HS코드를 입력해주세요', 'error');
      return;
    }

    if (hsCode.length !== 10) {
      showSnackbar(`HS코드는 10자리여야 합니다. 현재 ${hsCode.length}자리`, 'error');
      return;
    }

    if (!/^\d{10}$/.test(hsCode)) {
      showSnackbar('HS코드는 숫자 10자리로 입력해주세요', 'error');
      return;
    }

    setLoading(true);
    try {
      const [tariffResponse, customsResponse] = await Promise.all([
        supabase.functions.invoke('tariff-rate', {
          body: {
            hsCode,
            date: taxInputs.exchangeRateDate.replace(/-/g, ''),
          },
        }),
        supabase.functions.invoke('customs-verification', {
          body: { hsCode },
        }),
      ]);

      if (tariffResponse?.data?.success) {
        // Edge Function에서 받은 데이터를 프론트엔드 형식으로 매핑
        const mappedRates = {
          basic: tariffResponse.data.tariffRates.basic,
          wto: tariffResponse.data.tariffRates.wto,
          fta:
            tariffResponse.data.tariffRates.fta_us || tariffResponse.data.tariffRates.fta_vietnam,
          fcn: tariffResponse.data.tariffRates.fta_china, // fta_china를 fcn으로 매핑
        };

        setTariffRates(mappedRates);

        if (
          !tariffResponse.data.tariffRates ||
          Object.keys(tariffResponse.data.tariffRates).length === 0
        ) {
          setTariffRates({ basic: { rate: 8, typeName: '기본세율 (HS코드 정보 없음)' } });
          showSnackbar('해당 HS코드의 관세율 정보를 찾을 수 없어 기본세율 8%를 적용합니다', 'info');
        }
      } else {
        setTariffRates({ basic: { rate: 8, typeName: '기본세율' } });
        showSnackbar('관세율 API 오류로 기본세율 8%를 적용했습니다', 'info');
      }

      // 세관장 확인 내역 처리
      if (customsResponse?.data?.success && customsResponse.data.requirements) {
        setTariffRates((prev) => ({
          ...prev,
          customsVerification: {
            isRequired: customsResponse.data.totalCount > 0,
            requirements: customsResponse.data.requirements,
          },
        }));
      }

      showSnackbar('관세 정보를 성공적으로 조회했습니다', 'success');
    } catch (error) {
      // 엣지 함수 오류 시 기본세율로 폴백
      setTariffRates({ basic: { rate: 8, typeName: '기본세율' } });
      showSnackbar('관세 API 연결 오류로 기본세율 8%를 적용했습니다', 'info');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar('클립보드에 복사되었습니다', 'success');
  };

  // CBM 계산
  const calculateCBM = () => {
    const { length, width, height, quantity, unit } = cbmInputs;
    if (!length || !width || !height) {
      showSnackbar('모든 크기를 입력해주세요', 'error');
      return;
    }

    let multiplier = 1;
    if (unit === 'cm') multiplier = 1 / 1000000;
    else if (unit === 'm') multiplier = 1;
    else if (unit === 'mm') multiplier = 1 / 1000000000;

    const singleBoxCBM = parseFloat(length) * parseFloat(width) * parseFloat(height) * multiplier;
    const totalCBM = singleBoxCBM * parseFloat(quantity || '1');

    setCbmResult(totalCBM);

    if (totalCBM <= 33) setContainerType('20ft');
    else if (totalCBM <= 67) setContainerType('40ft');
    else setContainerType('40hc');

    showSnackbar('CBM 계산이 완료되었습니다', 'success');
  };

  // 용적중량 계산
  const calculateVolume = () => {
    const { length, width, height, unit, actualWeight } = volumeInputs;
    if (!length || !width || !height) {
      showSnackbar('모든 크기를 입력해주세요', 'error');
      return;
    }

    let divider = 6000;
    if (unit === 'm') divider = 0.006;
    else if (unit === 'mm') divider = 6000000;

    const volumeWeight = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / divider;
    const actual = parseFloat(actualWeight || '0');
    const chargeableWeight = Math.max(volumeWeight, actual);

    setVolumeResult({ volumeWeight, actualWeight: actual, chargeableWeight });
    showSnackbar('용적중량 계산이 완료되었습니다', 'success');
  };

  // 수입비용 계산
  const calculateTax = () => {
    const {
      productPrice,
      quantity,
      currency,
      shippingCost,
      shippingCurrency,
      insuranceCost,
      otherCosts,
    } = taxInputs;

    if (!productPrice || !quantity) {
      showSnackbar('제품 단가와 수량을 입력해주세요', 'error');
      return;
    }

    if (!exchangeRates) {
      showSnackbar('환율 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요', 'error');
      fetchExchangeRate();
      return;
    }

    if (!tariffRates) {
      showSnackbar('먼저 HS코드를 조회해주세요', 'error');
      return;
    }

    const price = parseFloat(productPrice);
    const qty = parseFloat(quantity);
    const shipping = parseFloat(shippingCost || '0');
    const insurance = parseFloat(insuranceCost || '0');
    const others = parseFloat(otherCosts || '0');

    let productExchangeRate = 1;
    if (currency === 'USD') {
      productExchangeRate = exchangeRates.primaryCurrencies?.USD?.rate || 1470;
    } else if (currency === 'CNY') {
      productExchangeRate = exchangeRates.primaryCurrencies?.CNY?.rate || 201;
    }

    let shippingExchangeRate = 1;
    if (shippingCurrency === 'USD') {
      shippingExchangeRate = exchangeRates.primaryCurrencies?.USD?.rate || 1470;
    } else if (shippingCurrency === 'CNY') {
      shippingExchangeRate = exchangeRates.primaryCurrencies?.CNY?.rate || 201;
    }

    const totalProductPriceKRW = Math.round(price * qty * productExchangeRate);
    const shippingCostKRW = Math.round(shipping * shippingExchangeRate);
    const insuranceCostKRW = Math.round(insurance * productExchangeRate);
    const otherCostsKRW = others;
    const cifKRW = totalProductPriceKRW + shippingCostKRW + insuranceCostKRW;

    const CO_COST = 50000;

    // 모든 세율 수집
    const rates = [];
    if (tariffRates.basic && tariffRates.basic.rate !== undefined) {
      rates.push({ ...tariffRates.basic, type: 'basic', typeName: '기본세율' });
    }
    if (tariffRates.wto && tariffRates.wto.rate !== undefined) {
      rates.push({ ...tariffRates.wto, type: 'wto', typeName: 'WTO협정세율' });
    }
    if (tariffRates.fta && tariffRates.fta.rate !== undefined) {
      rates.push({ ...tariffRates.fta, type: 'fta', typeName: 'FTA특혜세율' });
    }
    if (tariffRates.fcn && tariffRates.fcn.rate !== undefined) {
      rates.push({ ...tariffRates.fcn, type: 'fcn', typeName: '한중FTA세율' });
    }

    // 가장 낮은 세율 자동 선택
    const appliedTariff =
      rates.length > 0
        ? rates.reduce((min, current) => (current.rate < min.rate ? current : min))
        : { rate: 8, typeName: '기본세율', type: 'basic' };

    // FTA/FCN 선택시 원산지증명서 비용 추가
    let needsCO = false;
    let coCost = 0;
    if (appliedTariff.type === 'fta' || appliedTariff.type === 'fcn') {
      needsCO = true;
      coCost = CO_COST;
    }

    const customsDuty = Math.round(cifKRW * (appliedTariff.rate / 100));
    const vatBase = cifKRW + customsDuty + otherCostsKRW + coCost;
    const vat = Math.round(vatBase * 0.1);
    const totalImportCost = cifKRW + customsDuty + vat + otherCostsKRW + coCost;
    const costPerUnit = Math.round(totalImportCost / qty);

    setTaxResult({
      totalProductPriceKRW,
      shippingCostKRW,
      insuranceCostKRW,
      cifKRW,
      customsDuty,
      vatBase,
      vat,
      otherCostsKRW,
      coCost,
      totalImportCost,
      costPerUnit,
      appliedTariff,
      needsCO,
    });

    showSnackbar('수입비용 계산이 완료되었습니다', 'success');
  };

  // 환율 계산
  const calculateExchange = () => {
    const { amount, fromCurrency, toCurrency } = exchangeInputs;

    if (!amount) {
      showSnackbar('금액을 입력해주세요', 'error');
      return;
    }

    if (!exchangeRates) {
      showSnackbar('환율 정보를 가져오는 중입니다', 'error');
      return;
    }

    const amt = parseFloat(amount);
    let result = amt;

    // 원화로 변환
    if (fromCurrency === 'USD') {
      result = amt * (exchangeRates.primaryCurrencies?.USD?.rate || 1470);
    } else if (fromCurrency === 'CNY') {
      result = amt * (exchangeRates.primaryCurrencies?.CNY?.rate || 201);
    }

    // 목표 통화로 변환
    if (toCurrency === 'USD') {
      result = result / (exchangeRates.primaryCurrencies?.USD?.rate || 1470);
    } else if (toCurrency === 'CNY') {
      result = result / (exchangeRates.primaryCurrencies?.CNY?.rate || 201);
    }

    setExchangeResult(result);
    showSnackbar('환율 계산이 완료되었습니다', 'success');
  };

  const handleHsCodeSelect = (hsCode: string, description: string) => {
    setHsSearchResult({ code: hsCode, description });
    showSnackbar(`HS코드 ${hsCode}가 선택되었습니다`, 'success');
  };

  const resetCalculator = (type: string) => {
    switch (type) {
      case 'cbm':
        setCbmInputs({ length: '', width: '', height: '', quantity: '1', unit: 'cm' });
        setCbmResult(null);
        setShow3D(false);
        break;
      case 'volume':
        setVolumeInputs({ length: '', width: '', height: '', unit: 'cm', actualWeight: '' });
        setVolumeResult(null);
        break;
      case 'tax':
        setTaxInputs({
          hsCode: '',
          productPrice: '',
          quantity: '1',
          currency: 'USD',
          shippingCost: '',
          shippingCurrency: 'USD',
          insuranceCost: '',
          otherCosts: '',
          exchangeRateDate: new Date().toISOString().slice(0, 10),
        });
        setTaxResult(null);
        setTariffRates(null);
        break;
      case 'exchange':
        setExchangeInputs({
          amount: '',
          fromCurrency: 'USD',
          toCurrency: 'KRW',
          date: new Date().toISOString().slice(0, 10),
        });
        setExchangeResult(null);
        break;
      case 'hs':
        setHsSearchResult(null);
        break;
    }
    showSnackbar('초기화되었습니다', 'info');
  };

  return (
    <PageContainer
      title="무역 계산기 - 두리무역"
      description="CBM, 용적중량, 관세, 환율, HS코드 계산기"
    >
      <HpHeader />

      {/* Hero 섹션 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          pt: { xs: 10, md: 15 },
          pb: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Chip
                label="TRADE CALCULATOR"
                sx={{
                  backgroundColor: alpha('#ffffff', 0.2),
                  color: 'white',
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              />
              <Typography
                variant="h1"
                fontWeight={700}
                color="white"
                sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}
              >
                무역 계산기
              </Typography>
              <Typography variant="h5" color="rgba(255,255,255,0.9)" maxWidth="600px">
                수출입 업무에 필요한 모든 계산을 한 곳에서
              </Typography>

              {/* 환율 표시 컴포넌트 */}
              <Box sx={{ mt: 4, width: '100%', maxWidth: '600px' }}>
                <ExchangeRateDisplay />
              </Box>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* 카테고리 선택 */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={3} alignItems="stretch">
          {CALCULATOR_CATEGORIES.map((category) => (
            <Grid size={{ xs: 12, md: 4 }} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedCategory === category.id ? 2 : 0,
                  borderColor: category.color,
                  transform: selectedCategory === category.id ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedCalculator(category.calculators[0]);
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: category.color, width: 56, height: 56 }}>
                      {category.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {category.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.calculators.length}개 계산기
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 계산기 컨텐츠 */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* 왼쪽: 계산기 선택 메뉴 */}
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 88 }}
          >
            <Card>
              <CardHeader
                title="계산기 선택"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {selectedCategory === 'shipping' && (
                    <>
                      <Button
                        fullWidth
                        variant={selectedCalculator === 'cbm' ? 'contained' : 'outlined'}
                        startIcon={<ViewInAr />}
                        onClick={() => setSelectedCalculator('cbm')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        CBM 계산기
                      </Button>
                      <Button
                        fullWidth
                        variant={selectedCalculator === 'volume' ? 'contained' : 'outlined'}
                        startIcon={<Scale />}
                        onClick={() => setSelectedCalculator('volume')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        용적중량 계산기
                      </Button>
                    </>
                  )}
                  {selectedCategory === 'tax' && (
                    <>
                      <Button
                        fullWidth
                        variant={selectedCalculator === 'import' ? 'contained' : 'outlined'}
                        startIcon={<AttachMoney />}
                        onClick={() => setSelectedCalculator('import')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        수입비용 계산기
                      </Button>
                      <Button
                        fullWidth
                        variant={selectedCalculator === 'exchange' ? 'contained' : 'outlined'}
                        startIcon={<CurrencyExchange />}
                        onClick={() => setSelectedCalculator('exchange')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        환율 계산기
                      </Button>
                    </>
                  )}
                  {selectedCategory === 'search' && (
                    <Button
                      fullWidth
                      variant={selectedCalculator === 'hs' ? 'contained' : 'outlined'}
                      startIcon={<Search />}
                      onClick={() => setSelectedCalculator('hs')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      HS코드 조회
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 오른쪽: 계산기 내용 */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Fade in={true} key={selectedCalculator}>
              <Box>
                {/* CBM 계산기 */}
                {selectedCalculator === 'cbm' && (
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ViewInAr />
                        </Avatar>
                      }
                      title="CBM 계산기"
                      subheader="화물의 부피를 계산하고 최적의 컨테이너를 추천합니다"
                      action={
                        <IconButton onClick={() => resetCalculator('cbm')}>
                          <Refresh />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Stack spacing={3}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              박스 크기 입력
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="길이 (L)"
                                  type="number"
                                  value={cbmInputs.length}
                                  onChange={(e) =>
                                    setCbmInputs({ ...cbmInputs, length: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {cbmInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="너비 (W)"
                                  type="number"
                                  value={cbmInputs.width}
                                  onChange={(e) =>
                                    setCbmInputs({ ...cbmInputs, width: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {cbmInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="높이 (H)"
                                  type="number"
                                  value={cbmInputs.height}
                                  onChange={(e) =>
                                    setCbmInputs({ ...cbmInputs, height: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {cbmInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="수량"
                                  type="number"
                                  value={cbmInputs.quantity}
                                  onChange={(e) =>
                                    setCbmInputs({ ...cbmInputs, quantity: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">개</InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                  <InputLabel>측정 단위</InputLabel>
                                  <Select
                                    value={cbmInputs.unit}
                                    label="측정 단위"
                                    onChange={(e) =>
                                      setCbmInputs({ ...cbmInputs, unit: e.target.value })
                                    }
                                  >
                                    <MenuItem value="cm">센티미터 (CM)</MenuItem>
                                    <MenuItem value="m">미터 (M)</MenuItem>
                                    <MenuItem value="mm">밀리미터 (MM)</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                size="large"
                                startIcon={<Calculate />}
                                onClick={calculateCBM}
                                disabled={loading}
                              >
                                계산하기
                              </Button>
                              {cbmResult !== null && (
                                <Button
                                  variant="outlined"
                                  size="large"
                                  startIcon={<ThreeDRotation />}
                                  onClick={() => setShow3D(!show3D)}
                                >
                                  {show3D ? '3D 숨기기' : '3D 보기'}
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          {cbmResult !== null ? (
                            <Paper sx={{ p: 3, bgcolor: 'primary.50', minHeight: 260 }}>
                              <Stack spacing={3}>
                                <Box textAlign="center">
                                  <Typography variant="h3" color="primary" fontWeight={700}>
                                    {cbmResult.toFixed(4)}
                                  </Typography>
                                  <Typography variant="h6" color="text.secondary">
                                    CBM
                                  </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    컨테이너 사용률
                                  </Typography>
                                  <Stack spacing={2}>
                                    <Box>
                                      <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">20ft</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {((cbmResult / 33) * 100).toFixed(1)}%
                                        </Typography>
                                      </Stack>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.min((cbmResult / 33) * 100, 100)}
                                        sx={{ height: 8, borderRadius: 1 }}
                                      />
                                    </Box>
                                    <Box>
                                      <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">40ft</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {((cbmResult / 67) * 100).toFixed(1)}%
                                        </Typography>
                                      </Stack>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.min((cbmResult / 67) * 100, 100)}
                                        sx={{ height: 8, borderRadius: 1 }}
                                      />
                                    </Box>
                                  </Stack>
                                </Box>

                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<ContentCopy />}
                                  onClick={() => copyToClipboard(cbmResult.toFixed(4))}
                                >
                                  결과 복사
                                </Button>
                              </Stack>
                            </Paper>
                          ) : (
                            <Box
                              sx={{
                                p: 3,
                                bgcolor: 'grey.50',
                                minHeight: 260,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography color="text.secondary">
                                계산하면 결과가 여기에 표시됩니다
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        {show3D && cbmResult !== null && (
                          <Grid size={{ xs: 12 }}>
                            <Container3D
                              boxSize={{
                                width: parseFloat(cbmInputs.length) || 0,
                                height: parseFloat(cbmInputs.height) || 0,
                                depth: parseFloat(cbmInputs.width) || 0,
                              }}
                              quantity={parseInt(cbmInputs.quantity) || 1}
                              containerType={containerType}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 용적중량 계산기 */}
                {selectedCalculator === 'volume' && (
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <Scale />
                        </Avatar>
                      }
                      title="용적중량 계산기"
                      subheader="항공 운송시 실제 중량과 비교하여 운임을 산정합니다"
                      action={
                        <IconButton onClick={() => resetCalculator('volume')}>
                          <Refresh />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Stack spacing={3}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              화물 크기 입력
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="길이 (L)"
                                  type="number"
                                  value={volumeInputs.length}
                                  onChange={(e) =>
                                    setVolumeInputs({ ...volumeInputs, length: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {volumeInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="너비 (W)"
                                  type="number"
                                  value={volumeInputs.width}
                                  onChange={(e) =>
                                    setVolumeInputs({ ...volumeInputs, width: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {volumeInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="높이 (H)"
                                  type="number"
                                  value={volumeInputs.height}
                                  onChange={(e) =>
                                    setVolumeInputs({ ...volumeInputs, height: e.target.value })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {volumeInputs.unit}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TextField
                                  fullWidth
                                  label="실제 중량"
                                  type="number"
                                  value={volumeInputs.actualWeight}
                                  onChange={(e) =>
                                    setVolumeInputs({
                                      ...volumeInputs,
                                      actualWeight: e.target.value,
                                    })
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">kg</InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                  <InputLabel>측정 단위</InputLabel>
                                  <Select
                                    value={volumeInputs.unit}
                                    label="측정 단위"
                                    onChange={(e) =>
                                      setVolumeInputs({ ...volumeInputs, unit: e.target.value })
                                    }
                                  >
                                    <MenuItem value="cm">센티미터 (CM)</MenuItem>
                                    <MenuItem value="m">미터 (M)</MenuItem>
                                    <MenuItem value="mm">밀리미터 (MM)</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<Calculate />}
                              onClick={calculateVolume}
                              disabled={loading}
                            >
                              계산하기
                            </Button>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          {volumeResult ? (
                            <Paper sx={{ p: 3, bgcolor: 'grey.50', minHeight: 300 }}>
                              <Stack spacing={3}>
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    용적중량
                                  </Typography>
                                  <Typography variant="h4" color="secondary" fontWeight={700}>
                                    {volumeResult.volumeWeight.toFixed(2)} kg
                                  </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    실제중량
                                  </Typography>
                                  <Typography variant="h5">
                                    {volumeResult.actualWeight.toFixed(2)} kg
                                  </Typography>
                                </Box>

                                <Divider />

                                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    청구중량
                                  </Typography>
                                  <Typography variant="h4" color="primary" fontWeight={700}>
                                    {volumeResult.chargeableWeight.toFixed(2)} kg
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {volumeResult.chargeableWeight === volumeResult.volumeWeight
                                      ? '용적중량 기준'
                                      : '실제중량 기준'}
                                  </Typography>
                                </Box>

                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<ContentCopy />}
                                  onClick={() =>
                                    copyToClipboard(volumeResult.chargeableWeight.toFixed(2))
                                  }
                                >
                                  결과 복사
                                </Button>
                              </Stack>
                            </Paper>
                          ) : (
                            <Box
                              sx={{
                                p: 3,
                                bgcolor: 'grey.50',
                                minHeight: 300,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography color="text.secondary">
                                계산하면 결과가 여기에 표시됩니다
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 수입비용 계산기 */}
                {selectedCalculator === 'import' && (
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <AttachMoney />
                        </Avatar>
                      }
                      title="수입비용 계산기"
                      subheader="관세, 부가세 등 수입 시 발생하는 총 비용을 계산합니다"
                      action={
                        <IconButton onClick={() => resetCalculator('tax')}>
                          <Refresh />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                HS코드 조회
                              </Typography>
                              <Stack direction="row" spacing={2}>
                                <TextField
                                  fullWidth
                                  label="HS코드 (10자리)"
                                  value={taxInputs.hsCode}
                                  onChange={(e) =>
                                    setTaxInputs({ ...taxInputs, hsCode: e.target.value })
                                  }
                                  placeholder="예: 8517120000"
                                />
                                <Button
                                  variant="contained"
                                  startIcon={<Search />}
                                  onClick={() => fetchHsCodeData()}
                                  disabled={loading}
                                  sx={{ minWidth: 120 }}
                                >
                                  관세 조회
                                </Button>
                              </Stack>
                              {tariffRates && (
                                <Box sx={{ mt: 2 }}>
                                  <Alert severity="success" sx={{ mb: 2 }}>
                                    관세율: {tariffRates.basic?.rate || 8}% (
                                    {tariffRates.basic?.typeName || '기본세율'})
                                  </Alert>

                                  {/* 관세율 비교 테이블 */}
                                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                                          <TableCell width="40%">
                                            <strong>세율 종류</strong>
                                          </TableCell>
                                          <TableCell width="20%" align="center">
                                            <strong>세율</strong>
                                          </TableCell>
                                          <TableCell width="40%" align="center">
                                            <strong>적용 여부</strong>
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell>기본세율</TableCell>
                                          <TableCell align="center">
                                            {tariffRates.basic?.rate !== undefined
                                              ? `${tariffRates.basic.rate}%`
                                              : '8%'}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={
                                                getLowestRate() === 'basic' ? '✓ 적용' : '미적용'
                                              }
                                              color={
                                                getLowestRate() === 'basic' ? 'success' : 'default'
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>WTO 협정세율</TableCell>
                                          <TableCell align="center">
                                            {tariffRates.wto?.rate !== undefined
                                              ? `${tariffRates.wto.rate}%`
                                              : '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={
                                                getLowestRate() === 'wto'
                                                  ? '✓ 적용'
                                                  : tariffRates.wto?.rate !== undefined
                                                    ? '미적용'
                                                    : '-'
                                              }
                                              color={
                                                getLowestRate() === 'wto' ? 'success' : 'default'
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>FTA 특혜세율</TableCell>
                                          <TableCell align="center">
                                            {tariffRates.fta?.rate !== undefined
                                              ? `${tariffRates.fta.rate}%`
                                              : '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={
                                                getLowestRate() === 'fta'
                                                  ? '✓ 적용 (C/O필요)'
                                                  : tariffRates.fta?.rate !== undefined
                                                    ? 'C/O필요'
                                                    : '-'
                                              }
                                              color={
                                                getLowestRate() === 'fta'
                                                  ? 'success'
                                                  : tariffRates.fta?.rate !== undefined
                                                    ? 'warning'
                                                    : 'default'
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>한중 FTA세율</TableCell>
                                          <TableCell align="center">
                                            {tariffRates.fcn?.rate !== undefined
                                              ? `${tariffRates.fcn.rate}%`
                                              : '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={
                                                getLowestRate() === 'fcn'
                                                  ? '✓ 적용 (C/O필요)'
                                                  : tariffRates.fcn?.rate !== undefined
                                                    ? 'C/O필요'
                                                    : '-'
                                              }
                                              color={
                                                getLowestRate() === 'fcn'
                                                  ? 'success'
                                                  : tariffRates.fcn?.rate !== undefined
                                                    ? 'warning'
                                                    : 'default'
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TableContainer>

                                  {/* 세관장 확인 내역 */}
                                  {tariffRates.customsVerification?.isRequired && (
                                    <Box sx={{ mt: 3 }}>
                                      <Alert severity="warning" sx={{ mb: 2 }}>
                                        <strong>세관장 확인 대상 물품입니다</strong>
                                      </Alert>
                                      <TableContainer component={Paper}>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow sx={{ bgcolor: 'warning.100' }}>
                                              <TableCell width="30%">
                                                <strong>법령</strong>
                                              </TableCell>
                                              <TableCell width="40%">
                                                <strong>필요 서류</strong>
                                              </TableCell>
                                              <TableCell width="30%">
                                                <strong>담당 기관</strong>
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {tariffRates.customsVerification.requirements.map(
                                              (req, idx) => (
                                                <TableRow key={idx}>
                                                  <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {req.lawName}
                                                  </TableCell>
                                                  <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {req.documentName}
                                                  </TableCell>
                                                  <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {req.organizationName}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Box>
                                  )}

                                  {(tariffRates.fta?.rate !== undefined ||
                                    tariffRates.fcn?.rate !== undefined) && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                      FTA 특혜세율 적용 시 원산지증명서(C/O)가 필요합니다 (발급비용:
                                      5만원)
                                    </Alert>
                                  )}
                                </Box>
                              )}
                            </Box>

                            <Divider />

                            <Typography variant="subtitle1" fontWeight={600}>
                              상품 정보
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  fullWidth
                                  label="제품 단가"
                                  type="number"
                                  value={taxInputs.productPrice}
                                  onChange={(e) =>
                                    setTaxInputs({ ...taxInputs, productPrice: e.target.value })
                                  }
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                  <InputLabel>통화</InputLabel>
                                  <Select
                                    value={taxInputs.currency}
                                    label="통화"
                                    onChange={(e) =>
                                      setTaxInputs({ ...taxInputs, currency: e.target.value })
                                    }
                                  >
                                    <MenuItem value="USD">USD (달러)</MenuItem>
                                    <MenuItem value="CNY">CNY (위안)</MenuItem>
                                    <MenuItem value="KRW">KRW (원)</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  fullWidth
                                  label="수량"
                                  type="number"
                                  value={taxInputs.quantity}
                                  onChange={(e) =>
                                    setTaxInputs({ ...taxInputs, quantity: e.target.value })
                                  }
                                />
                              </Grid>
                            </Grid>

                            <Typography variant="subtitle1" fontWeight={600}>
                              추가 비용
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  fullWidth
                                  label="운송비"
                                  type="number"
                                  value={taxInputs.shippingCost}
                                  onChange={(e) =>
                                    setTaxInputs({ ...taxInputs, shippingCost: e.target.value })
                                  }
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                  <InputLabel>운송비 통화</InputLabel>
                                  <Select
                                    value={taxInputs.shippingCurrency}
                                    label="운송비 통화"
                                    onChange={(e) =>
                                      setTaxInputs({
                                        ...taxInputs,
                                        shippingCurrency: e.target.value,
                                      })
                                    }
                                  >
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="CNY">CNY</MenuItem>
                                    <MenuItem value="KRW">KRW</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  fullWidth
                                  label="보험료"
                                  type="number"
                                  value={taxInputs.insuranceCost}
                                  onChange={(e) =>
                                    setTaxInputs({ ...taxInputs, insuranceCost: e.target.value })
                                  }
                                />
                              </Grid>
                            </Grid>

                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<Calculate />}
                              onClick={calculateTax}
                              disabled={loading || !tariffRates}
                            >
                              수입비용 계산
                            </Button>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Paper
                            sx={{
                              p: 3,
                              bgcolor: 'grey.50',
                              minHeight: 320,
                              maxHeight: 500,
                              overflow: 'auto',
                            }}
                          >
                            {taxResult ? (
                              <>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                  수입비용 계산 결과
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <TableContainer>
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>제품 가격</TableCell>
                                        <TableCell align="right">
                                          {taxResult.totalProductPriceKRW.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>운송비</TableCell>
                                        <TableCell align="right">
                                          {taxResult.shippingCostKRW.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>보험료</TableCell>
                                        <TableCell align="right">
                                          {taxResult.insuranceCostKRW.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                      <TableRow sx={{ bgcolor: 'primary.50' }}>
                                        <TableCell>
                                          <strong>CIF 가격</strong>
                                        </TableCell>
                                        <TableCell align="right">
                                          <strong>{taxResult.cifKRW.toLocaleString()} 원</strong>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>
                                          관세 ({taxResult.appliedTariff.rate}% -{' '}
                                          {taxResult.appliedTariff.typeName})
                                        </TableCell>
                                        <TableCell align="right">
                                          {taxResult.customsDuty.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>부가세 (10%)</TableCell>
                                        <TableCell align="right">
                                          {taxResult.vat.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                      <TableRow sx={{ bgcolor: 'success.50' }}>
                                        <TableCell>
                                          <strong>총 수입비용</strong>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            variant="h6"
                                            color="success.main"
                                            fontWeight={700}
                                          >
                                            {taxResult.totalImportCost.toLocaleString()} 원
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>개당 단가</TableCell>
                                        <TableCell align="right">
                                          {taxResult.costPerUnit.toLocaleString()} 원
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<ContentCopy />}
                                  onClick={() =>
                                    copyToClipboard(taxResult.totalImportCost.toString())
                                  }
                                  sx={{ mt: 2 }}
                                >
                                  결과 복사
                                </Button>
                              </>
                            ) : (
                              <Box
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography color="text.secondary">
                                  관세 조회 후 '수입비용 계산'을 클릭하면 결과가 표시됩니다
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 환율 계산기 */}
                {selectedCalculator === 'exchange' && (
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <CurrencyExchange />
                        </Avatar>
                      }
                      title="환율 계산기"
                      subheader="실시간 환율을 기준으로 통화를 변환합니다"
                      action={
                        <IconButton onClick={() => resetCalculator('exchange')}>
                          <Refresh />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Stack spacing={3}>
                            <TextField
                              fullWidth
                              label="금액"
                              type="number"
                              value={exchangeInputs.amount}
                              onChange={(e) =>
                                setExchangeInputs({ ...exchangeInputs, amount: e.target.value })
                              }
                            />
                            <FormControl fullWidth>
                              <InputLabel>변환 전 통화</InputLabel>
                              <Select
                                value={exchangeInputs.fromCurrency}
                                label="변환 전 통화"
                                onChange={(e) =>
                                  setExchangeInputs({
                                    ...exchangeInputs,
                                    fromCurrency: e.target.value,
                                  })
                                }
                              >
                                <MenuItem value="USD">USD (달러)</MenuItem>
                                <MenuItem value="CNY">CNY (위안)</MenuItem>
                                <MenuItem value="KRW">KRW (원)</MenuItem>
                              </Select>
                            </FormControl>
                            <FormControl fullWidth>
                              <InputLabel>변환 후 통화</InputLabel>
                              <Select
                                value={exchangeInputs.toCurrency}
                                label="변환 후 통화"
                                onChange={(e) =>
                                  setExchangeInputs({
                                    ...exchangeInputs,
                                    toCurrency: e.target.value,
                                  })
                                }
                              >
                                <MenuItem value="KRW">KRW (원)</MenuItem>
                                <MenuItem value="USD">USD (달러)</MenuItem>
                                <MenuItem value="CNY">CNY (위안)</MenuItem>
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<Calculate />}
                              onClick={calculateExchange}
                              disabled={loading}
                            >
                              환율 계산
                            </Button>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          {exchangeResult ? (
                            <Paper sx={{ p: 3, bgcolor: 'grey.50', minHeight: 260 }}>
                              <Stack spacing={3}>
                                <Box textAlign="center">
                                  <Typography variant="h3" color="warning.main" fontWeight={700}>
                                    {exchangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </Typography>
                                  <Typography variant="h6" color="text.secondary">
                                    {exchangeInputs.toCurrency}
                                  </Typography>
                                </Box>

                                {exchangeRates && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      기준 환율 ({exchangeRates.date})
                                    </Typography>
                                    <Typography variant="body2">
                                      1 USD = {exchangeRates.primaryCurrencies?.USD?.rate} KRW
                                    </Typography>
                                    <Typography variant="body2">
                                      1 CNY = {exchangeRates.primaryCurrencies?.CNY?.rate} KRW
                                    </Typography>
                                  </Box>
                                )}

                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<ContentCopy />}
                                  onClick={() => copyToClipboard(exchangeResult.toFixed(2))}
                                >
                                  결과 복사
                                </Button>
                              </Stack>
                            </Paper>
                          ) : (
                            <Box
                              sx={{
                                p: 3,
                                bgcolor: 'grey.50',
                                minHeight: 260,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography color="text.secondary">
                                계산하면 결과가 여기에 표시됩니다
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* HS코드 조회 */}
                {selectedCalculator === 'hs' && (
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Search />
                        </Avatar>
                      }
                      title="HS코드 조회"
                      subheader="상품명으로 HS코드를 검색하고 관세율을 확인합니다"
                      action={
                        <IconButton onClick={() => resetCalculator('hs')}>
                          <Refresh />
                        </IconButton>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <HSCodeSimpleSearch
                        onSelectHsCode={handleHsCodeSelect}
                        onReset={() => setHsSearchResult(null)}
                        onNotify={showSnackbar}
                      />

                      {hsSearchResult && (
                        <Paper
                          sx={{
                            p: 4,
                            mt: 3,
                            bgcolor: 'grey.50',
                            border: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="h6" gutterBottom fontWeight={600}>
                                선택된 HS코드
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography
                                    variant="h3"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontWeight: 700,
                                      letterSpacing: 1,
                                    }}
                                  >
                                    {hsSearchResult.code}
                                  </Typography>
                                </Box>
                                <Tooltip title="클립보드에 복사">
                                  <IconButton
                                    size="large"
                                    onClick={() => copyToClipboard(hsSearchResult.code)}
                                    sx={{
                                      bgcolor: 'background.paper',
                                      '&:hover': { bgcolor: 'grey.200' },
                                    }}
                                  >
                                    <ContentCopy fontSize="large" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                품목 설명
                              </Typography>
                              <Typography variant="body2">{hsSearchResult.description}</Typography>
                            </Box>

                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => {
                                setTaxInputs({ ...taxInputs, hsCode: hsSearchResult.code });
                                setSelectedCategory('tax');
                                setSelectedCalculator('import');
                                fetchHsCodeData(hsSearchResult.code);
                              }}
                            >
                              이 HS코드로 수입비용 계산하기
                            </Button>
                          </Stack>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      <Footer />
      <ScrollToTop />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default CalculatorsPage;
