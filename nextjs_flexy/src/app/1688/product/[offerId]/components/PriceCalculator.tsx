'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { CalculatorData, calculateImportCosts, getCurrentPriceForQuantity } from '../utils/calculations';
import type { ProductDetail } from '../types';

interface PriceCalculatorProps {
  open: boolean;
  onClose: () => void;
  productDetail: ProductDetail;
  selectedSku?: any;
  selectedSkus?: any[];
  quantity: number;
}

export default function PriceCalculator({
  open,
  onClose,
  productDetail,
  selectedSku,
  selectedSkus,
  quantity
}: PriceCalculatorProps) {
  
  // 계산기 상태
  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    // 기본 정보
    exchangeRate: 203,
    chinaPrice: 0,
    quantity: 1,
    
    // 중국 내 배송비
    chinaShippingFee: null,
    chinaShippingFirstUnit: 1,
    chinaShippingFirstFee: 10,
    chinaShippingNextUnit: 1,
    chinaShippingNextFee: 5,
    chinaShippingType: 'quantity',
    
    // 포장 정보
    packageWeight: 0,
    packageLength: 0,
    packageWidth: 0,
    packageHeight: 0,
    
    // 운송 정보
    shippingMethod: 'auto',
    lclRate: 90000,
    fclRate: 0,
    fclQuote: 0,
    
    // 관세 정보
    hsCode: '',
    tariffRate: 0,
    certificateOfOrigin: false,
    certificatePrice: 30000,
    customsBrokerFee: 30000
  });

  const [chinaShippingLoading, setChinsShippingLoading] = useState(false);
  const [lookingUpHsCode, setLookingUpHsCode] = useState(false);
  const [hsCodeProgress, setHsCodeProgress] = useState<string | null>(null);
  const [tariffDetails, setTariffDetails] = useState<any>(null);

  // 다이얼로그 열릴 때 초기화
  useEffect(() => {
    if (open && productDetail) {
      console.log('PriceCalculator opened with:', {
        selectedSku,
        selectedSkus,
        quantity,
        productDetail
      });
      
      const currentPrice = getCurrentPriceForQuantity(productDetail, quantity);
      
      // SKU 정보가 있으면 자동으로 설정
      let packageInfo = {
        packageWeight: 0,
        packageLength: 0,
        packageWidth: 0,
        packageHeight: 0
      };

      // 여러 SKU 선택된 경우 CBM 합산
      if (selectedSkus && selectedSkus.length > 0) {
        let totalCBM = 0;
        let totalWeight = 0;
        
        selectedSkus.forEach((sku: any) => {
          const skuQty = sku.quantity || 1;
          let skuCBM = 0;
          let skuWeight = 0;
          
          // productShippingInfo.skuShippingDetails에서 찾기
          if (productDetail.productShippingInfo?.skuShippingDetails) {
            const skuShipping = productDetail.productShippingInfo.skuShippingDetails.find(
              detail => detail.skuId === sku.skuId?.toString()
            );
            if (skuShipping) {
              const length = skuShipping.packageLength || 0;
              const width = skuShipping.packageWidth || 0;
              const height = skuShipping.packageHeight || 0;
              skuCBM = (length * width * height) / 1000000; // mm³ to m³
              skuWeight = skuShipping.grossWeight || 0;
            }
          }
          
          // skuShippingDetails에 없으면 SKU 속성에서 찾기
          if (skuCBM === 0 && sku.skuAttributes) {
            // SKU 속성에 포장 정보가 있는 경우 (예: 무게, 크기 등)
            sku.skuAttributes.forEach((attr: any) => {
              if (attr.attributeName?.includes('重量') || attr.attributeName?.includes('weight')) {
                const weight = parseFloat(attr.value);
                if (!isNaN(weight)) skuWeight = weight;
              }
            });
          }
          
          totalCBM += skuCBM * skuQty;
          totalWeight += skuWeight * skuQty;
        });
        
        // CBM을 역산하여 평균 치수 계산 (간단한 방법)
        // 실제로는 패킹 효율을 고려해야 하지만, 여기서는 단순 합산
        if (totalCBM > 0) {
          // CBM에서 평균 치수 역산 (정육면체 가정)
          const avgDimension = Math.cbrt(totalCBM * 1000000); // m³ to mm³의 세제곱근
          packageInfo = {
            packageWeight: totalWeight,
            packageLength: Math.round(avgDimension),
            packageWidth: Math.round(avgDimension),
            packageHeight: Math.round(avgDimension)
          };
        } else {
          // CBM 정보가 없으면 기본값 사용
          packageInfo = {
            packageWeight: totalWeight,
            packageLength: 0,
            packageWidth: 0,
            packageHeight: 0
          };
        }
      }
      // 단일 SKU 선택된 경우 해당 SKU의 포장 정보 사용
      else if (selectedSku) {
        // productShippingInfo.skuShippingDetails에서 찾기
        if (productDetail.productShippingInfo?.skuShippingDetails) {
          const skuShipping = productDetail.productShippingInfo.skuShippingDetails.find(
            detail => detail.skuId === selectedSku.skuId?.toString()
          );
          if (skuShipping) {
            packageInfo = {
              packageWeight: skuShipping.grossWeight || 0,
              packageLength: skuShipping.packageLength || 0,
              packageWidth: skuShipping.packageWidth || 0,
              packageHeight: skuShipping.packageHeight || 0
            };
          }
        }
        
        // skuShippingDetails에 없으면 SKU 속성에서 찾기
        if (packageInfo.packageWeight === 0 && selectedSku.skuAttributes) {
          // SKU 속성에 포장 정보가 있는 경우 (예: 무게, 크기 등)
          selectedSku.skuAttributes.forEach((attr: any) => {
            if (attr.attributeName?.includes('重量') || attr.attributeName?.includes('weight')) {
              const weight = parseFloat(attr.value);
              if (!isNaN(weight)) packageInfo.packageWeight = weight;
            }
          });
        }
      } 
      // SKU가 없으면 기본 상품 포장 정보 사용
      else if (productDetail.productShippingInfo) {
        const shipping = productDetail.productShippingInfo;
        packageInfo = {
          packageWeight: shipping.weight || 0,
          packageLength: shipping.length || 0,
          packageWidth: shipping.width || 0,
          packageHeight: shipping.height || 0
        };
      }

      setCalculatorData(prev => ({
        ...prev,
        chinaPrice: currentPrice,
        quantity: quantity,
        ...packageInfo
      }));
    }
  }, [open, productDetail, selectedSku, selectedSkus, quantity]);

  // 중국 배송비 조회
  const handleFetchChinaShipping = async () => {
    if (!productDetail || !selectedSku) {
      alert('옵션을 먼저 선택해주세요.');
      return;
    }

    setChinsShippingLoading(true);
    try {
      const { getEdgeFunctionsClient } = await import('@/lib/supabase/edge-functions-client');
      const functionsClient = getEdgeFunctionsClient();
      
      const { data, error } = await functionsClient.invoke('calculate-shipping', {
        body: {
          offerId: productDetail.offerId,
          skuId: selectedSku.skuId,
          quantity: calculatorData.quantity,
          cityCode: '310100' // 상하이
        }
      });

      if (error) throw error;

      if (data?.freightFee) {
        setCalculatorData(prev => ({
          ...prev,
          chinaShippingFee: data.freightFee
        }));
      }
    } catch (error) {
      console.error('Failed to fetch shipping fee:', error);
      alert('배송비 조회 실패. 수동으로 입력해주세요.');
    } finally {
      setChinsShippingLoading(false);
    }
  };

  // HS 코드 조회
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
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          productName: productDetail.subjectTrans
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
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
                        finalHsCode = data.data?.hsCode || '';
                        setHsCodeProgress(
                          `HS 코드: ${finalHsCode} - ${data.data?.description || '설명 없음'}`
                        );
                        break;
                      case 'step':
                        setHsCodeProgress(data.data?.description || '처리 중...');
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
            tariffRate: lowestRate,
            certificateOfOrigin: needsCertificate,
            certificatePrice: 30000, // 고정금액
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
          setTariffDetails(data.tariffRates);
        } else {
          // 실패 시 기본값
          setCalculatorData((prev) => ({
            ...prev,
            tariffRate: 8,
            certificateOfOrigin: false,
          }));
          setHsCodeProgress(`HS코드: ${hsCode} | 관세율: 8% (기본)`);
        }
      }
    } catch (error) {
      console.error('Tariff rate lookup error:', error);
      setCalculatorData((prev) => ({
        ...prev,
        tariffRate: 8,
        certificateOfOrigin: false,
      }));
    }
  };

  // 가격 계산
  const calculatePrice = () => {
    return calculateImportCosts(calculatorData);
  };

  const result = calculatePrice();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">수입 가격 계산기</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 입력 필드 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {/* 선택된 SKU 정보 표시 */}
              {(selectedSkus && selectedSkus.length > 0) ? (
                <>
                  <Typography variant="subtitle2" color="primary">
                    📦 선택된 상품 옵션
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                    {selectedSkus.map((sku, index) => {
                      // SKU 속성에서 색상과 사이즈 추출
                      const attributes = sku.skuAttributes || [];
                      const color = attributes.find((attr: any) => 
                        attr.attributeName === '颜色' || 
                        attr.attributeNameTrans === '색상' ||
                        attr.attributeName?.toLowerCase().includes('color')
                      );
                      const size = attributes.find((attr: any) => 
                        attr.attributeName === '尺码' || 
                        attr.attributeName === '尺寸' ||
                        attr.attributeNameTrans === '사이즈' ||
                        attr.attributeName?.toLowerCase().includes('size')
                      );
                      
                      return (
                        <Box key={index} sx={{ mb: index < selectedSkus.length - 1 ? 1 : 0 }}>
                          <Typography variant="body2">
                            {color && (
                              <span>
                                색상: {color.valueTrans || color.value}
                              </span>
                            )}
                            {color && size && ' / '}
                            {size && (
                              <span>
                                사이즈: {size.valueTrans || size.value}
                              </span>
                            )}
                            {' × '}
                            <strong>{sku.quantity || 1}개</strong>
                          </Typography>
                          {sku.price && (
                            <Typography variant="caption" color="text.secondary">
                              단가: ¥{sku.price}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                    <Typography variant="body2" sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <strong>총 수량: {selectedSkus.reduce((sum, sku) => sum + (sku.quantity || 1), 0)}개</strong>
                    </Typography>
                  </Paper>
                </>
              ) : selectedSku && (
                <>
                  <Typography variant="subtitle2" color="primary">
                    📦 선택된 상품 옵션
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                    {(() => {
                      const attributes = selectedSku.skuAttributes || [];
                      const color = attributes.find((attr: any) => 
                        attr.attributeName === '颜色' || 
                        attr.attributeNameTrans === '색상' ||
                        attr.attributeName?.toLowerCase().includes('color')
                      );
                      const size = attributes.find((attr: any) => 
                        attr.attributeName === '尺码' || 
                        attr.attributeName === '尺寸' ||
                        attr.attributeNameTrans === '사이즈' ||
                        attr.attributeName?.toLowerCase().includes('size')
                      );
                      
                      return (
                        <Box>
                          <Typography variant="body2">
                            {color && (
                              <span>
                                색상: {color.valueTrans || color.value}
                              </span>
                            )}
                            {color && size && ' / '}
                            {size && (
                              <span>
                                사이즈: {size.valueTrans || size.value}
                              </span>
                            )}
                            {' × '}
                            <strong>{quantity}개</strong>
                          </Typography>
                          {selectedSku.price && (
                            <Typography variant="caption" color="text.secondary">
                              단가: ¥{selectedSku.price}
                            </Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </Paper>
                </>
              )}
              
              <Typography variant="subtitle2" color="primary">
                💵 기본 정보
              </Typography>
              
              <TextField
                fullWidth
                label="중국 단가"
                type="number"
                value={calculatorData.chinaPrice}
                onChange={(e) =>
                  setCalculatorData(prev => ({ ...prev, chinaPrice: Number(e.target.value) }))
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                helperText={`원화: ₩${Math.floor(calculatorData.chinaPrice * calculatorData.exchangeRate).toLocaleString()}`}
              />
              
              <TextField
                fullWidth
                label="구매 수량"
                type="number"
                value={calculatorData.quantity}
                onChange={(e) =>
                  setCalculatorData(prev => ({ ...prev, quantity: Number(e.target.value) }))
                }
                InputProps={{
                  endAdornment: <InputAdornment position="end">개</InputAdornment>,
                }}
              />

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                🚚 중국 내 배송비
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleFetchChinaShipping}
                disabled={chinaShippingLoading}
                startIcon={chinaShippingLoading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
              >
                {chinaShippingLoading ? '조회 중...' : '배송비 자동 조회'}
              </Button>

              {calculatorData.chinaShippingFee !== null && (
                <Alert severity="success">
                  조회된 배송비: ¥{calculatorData.chinaShippingFee}
                </Alert>
              )}

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                📦 포장 정보
              </Typography>
              
              {/* 여러 SKU 선택 시 정보 표시 */}
              {selectedSkus && selectedSkus.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    <strong>선택된 SKU {selectedSkus.length}개의 CBM 합산:</strong>
                  </Typography>
                  {selectedSkus.map((sku, index) => (
                    <Typography key={index} variant="caption" display="block">
                      • {sku.skuAttributes?.map((attr: any) => attr.valueTrans || attr.value).join(' / ')} 
                      × {sku.quantity}개
                    </Typography>
                  ))}
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    총 CBM: {result.totalCBM?.toFixed(3)} m³
                  </Typography>
                </Alert>
              )}
              
              <Grid container spacing={1}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="무게"
                    type="number"
                    value={calculatorData.packageWeight}
                    onChange={(e) =>
                      setCalculatorData(prev => ({ ...prev, packageWeight: Number(e.target.value) }))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="길이"
                    type="number"
                    value={calculatorData.packageLength}
                    onChange={(e) =>
                      setCalculatorData(prev => ({ ...prev, packageLength: Number(e.target.value) }))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="너비"
                    type="number"
                    value={calculatorData.packageWidth}
                    onChange={(e) =>
                      setCalculatorData(prev => ({ ...prev, packageWidth: Number(e.target.value) }))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="높이"
                    type="number"
                    value={calculatorData.packageHeight}
                    onChange={(e) =>
                      setCalculatorData(prev => ({ ...prev, packageHeight: Number(e.target.value) }))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                🚚 운송 정보
              </Typography>
              
              <TextField
                fullWidth
                label="운송 방법"
                select
                value={calculatorData.shippingMethod}
                onChange={(e) =>
                  setCalculatorData(prev => ({ ...prev, shippingMethod: e.target.value as 'auto' | 'LCL' | 'FCL' }))
                }
                SelectProps={{ native: true }}
              >
                <option value="auto">자동 선택</option>
                <option value="LCL">LCL (CBM * 90,000원)</option>
                <option value="FCL">FCL (직접 입력)</option>
              </TextField>
              
              {calculatorData.shippingMethod === 'FCL' && (
                <TextField
                  fullWidth
                  label="FCL 운송비"
                  type="number"
                  value={calculatorData.fclQuote}
                  onChange={(e) =>
                    setCalculatorData(prev => ({ ...prev, fclQuote: Number(e.target.value) }))
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                  }}
                  helperText="견적 받은 FCL 운송비를 입력하세요"
                />
              )}

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                🏛️ 관세 정보
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleHsCodeLookup}
                disabled={lookingUpHsCode}
                startIcon={lookingUpHsCode ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                HS 코드 자동 조회
              </Button>
              
              {hsCodeProgress && (
                <Alert severity={lookingUpHsCode ? "info" : hsCodeProgress.includes('실패') ? "error" : "success"} sx={{ mt: 1 }}>
                  {hsCodeProgress}
                </Alert>
              )}

              <TextField
                fullWidth
                label="HS 코드"
                value={calculatorData.hsCode}
                onChange={(e) =>
                  setCalculatorData(prev => ({ ...prev, hsCode: e.target.value }))
                }
                placeholder="예: 8501100000"
                helperText="자동 조회가 정확하지 않은 경우 직접 수정해주세요"
              />

              <TextField
                fullWidth
                label="관세율"
                type="number"
                value={calculatorData.tariffRate}
                onChange={(e) =>
                  setCalculatorData(prev => ({ ...prev, tariffRate: Number(e.target.value) }))
                }
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText={calculatorData.hsCode ? "HS 코드에 따라 자동 설정됨" : "HS 코드 조회 후 자동 설정"}
              />
            </Stack>
          </Grid>

          {/* 계산 결과 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>
                💰 계산 결과
              </Typography>
              
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>상품 가격</TableCell>
                    <TableCell align="right">₩{result.totalChinaPrice.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>중국 배송비</TableCell>
                    <TableCell align="right">₩{result.chinaShippingKRW.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>수수료 (5%)</TableCell>
                    <TableCell align="right">₩{result.commission.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>부가세 (수수료)</TableCell>
                    <TableCell align="right">₩{result.commissionVAT.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                    <TableCell><strong>1차 결제</strong></TableCell>
                    <TableCell align="right"><strong>₩{result.firstPayment.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={2}><Box sx={{ my: 1 }} /></TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>운송비 ({result.shippingMethodUsed})</TableCell>
                    <TableCell align="right">₩{result.shippingCost.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>관세 ({calculatorData.tariffRate}%)</TableCell>
                    <TableCell align="right">₩{result.customsDuty.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>수입 부가세</TableCell>
                    <TableCell align="right">₩{result.importVAT.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>관세사 수수료</TableCell>
                    <TableCell align="right">₩{result.customsBrokerFee.toLocaleString()}</TableCell>
                  </TableRow>
                  {result.customsBrokerVAT > 0 && (
                    <TableRow>
                      <TableCell>관세사 수수료 부가세</TableCell>
                      <TableCell align="right">₩{result.customsBrokerVAT.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {result.certificatePrice > 0 && (
                    <TableRow>
                      <TableCell>원산지증명서</TableCell>
                      <TableCell align="right">₩{result.certificatePrice.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {result.certificateVAT > 0 && (
                    <TableRow>
                      <TableCell>원산지증명서 부가세</TableCell>
                      <TableCell align="right">₩{result.certificateVAT.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                    <TableCell><strong>2차 결제</strong></TableCell>
                    <TableCell align="right"><strong>₩{result.secondPayment.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={2}><Box sx={{ my: 1 }} /></TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ bgcolor: '#fff3e0' }}>
                    <TableCell><strong>총 원가</strong></TableCell>
                    <TableCell align="right"><strong>₩{result.totalCost.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>개당 원가</TableCell>
                    <TableCell align="right">₩{result.unitCost.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {result.totalCBM > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  총 CBM: {result.totalCBM.toFixed(3)}㎥ / 총 중량: {result.totalWeight.toFixed(1)}kg
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button 
          variant="contained" 
          startIcon={<ShoppingCartIcon />}
          onClick={() => {
            // TODO: 장바구니 추가 로직
            alert('장바구니 추가 기능 구현 예정');
          }}
        >
          장바구니 추가
        </Button>
      </DialogActions>
    </Dialog>
  );
}