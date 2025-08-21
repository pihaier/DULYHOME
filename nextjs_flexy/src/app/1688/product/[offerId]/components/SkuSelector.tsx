'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StraightenIcon from '@mui/icons-material/Straighten';
import CloseIcon from '@mui/icons-material/Close';

interface SkuSelectorProps {
  productSkuInfos?: any[];
  selectedAttributes?: { [key: string]: string };
  onAttributeSelect?: (attributeName: string, value: string) => void;
  selectedSku?: any;
  onSizeQuantitiesChange?: (quantities: { [key: string]: number }, totalAmount: number) => void;
}

interface CartItem {
  qty: number;
  price: number;
  color: string;
  size: string;
}

export default function SkuSelector({
  productSkuInfos,
  selectedAttributes = {},
  onAttributeSelect,
  selectedSku,
  onSizeQuantitiesChange
}: SkuSelectorProps) {
  // 모든 옵션별 수량을 저장 (색상-사이즈 조합을 키로 사용)
  const [allQuantities, setAllQuantities] = useState<{ [colorSize: string]: CartItem }>({});
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentColorQuantities, setCurrentColorQuantities] = useState<{ [size: string]: number }>({});
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // 모바일 드로어 상태
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // 반응형 체크
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 일반 옵션용 수량 입력 상태
  const [generalOptionQuantities, setGeneralOptionQuantities] = useState<{ [key: string]: number }>({});
  
  // 색상과 사이즈가 있는지 확인
  const hasColorAndSize = productSkuInfos?.some(sku => 
    sku.skuAttributes?.some((attr: any) => 
      attr.attributeName === '颜色' || attr.attributeName === '색상' ||
      attr.attributeNameTrans === '색상'
    ) &&
    sku.skuAttributes?.some((attr: any) => 
      attr.attributeName === '尺码' || attr.attributeName === '크기' ||
      attr.attributeNameTrans === '크기' || attr.attributeNameTrans === 'Size'
    )
  );

  // 색상 선택 처리 함수
  const handleColorSelection = (attrName: string, value: string) => {
    const isColorAttribute = attrName === '색상' || attrName === '颜色' || 
                           attrName === 'Color' || attrName === '색깔';
    
    if (isColorAttribute && hasColorAndSize) {
      setSelectedColor(value);
      
      const colorSkus = productSkuInfos?.filter((sku: any) => 
        sku.skuAttributes.some((attr: any) => 
          (attr.attributeName === '颜色' || attr.attributeName === '색상' || 
           attr.attributeNameTrans === '색상') &&
          (attr.value === value || attr.valueTrans === value)
        )
      );
      
      const newSizeQuantities: { [key: string]: number } = {};
      colorSkus?.forEach((sku: any) => {
        const sizeAttr = sku.skuAttributes.find((attr: any) => 
          attr.attributeName === '尺码' || attr.attributeName === '크기' ||
          attr.attributeNameTrans === '크기' || attr.attributeNameTrans === 'Size'
        );
        if (sizeAttr) {
          const sizeValue = sizeAttr.valueTrans || sizeAttr.value;
          newSizeQuantities[sizeValue] = allQuantities[`${value}-${sizeValue}`]?.qty || 0;
        }
      });
      
      setCurrentColorQuantities(newSizeQuantities);
    }
  };
  
  // 전체 수량과 금액 계산 (모든 옵션 누적)
  useEffect(() => {
    let totalQty = 0;
    let totalAmt = 0;
    
    Object.values(allQuantities).forEach(item => {
      totalQty += item.qty;
      totalAmt += item.price * item.qty;
    });
    
    setTotalQuantity(totalQty);
    setTotalAmount(totalAmt);
    
    // 부모 컴포넌트에 변경사항 전달
    if (onSizeQuantitiesChange && totalQty > 0) {
      const quantities: { [key: string]: number } = {};
      Object.entries(allQuantities).forEach(([key, value]) => {
        quantities[key] = value.qty;
      });
      onSizeQuantitiesChange(quantities, totalAmt);
    }
  }, [allQuantities, onSizeQuantitiesChange]);
  
  if (!productSkuInfos || productSkuInfos.length === 0) {
    return null;
  }

  // 속성별로 그룹화 (크기는 제외)
  const attributeGroups: { [key: string]: Set<string> } = {};
  const attributeImages: { [key: string]: { [value: string]: string | null } } = {};
  const allSizes = new Set<string>(); // 모든 사이즈 저장

  productSkuInfos.forEach((sku: any) => {
    sku.skuAttributes?.forEach((attr: any) => {
      const attrName = attr.attributeNameTrans || attr.attributeName;
      const attrValue = attr.valueTrans || attr.value;
      
      // 크기/사이즈는 별도로 저장하고 선택 옵션에서는 제외
      if (attrName === '크기' || attrName === '尺码' || attrName === 'Size' || attrName === '사이즈') {
        allSizes.add(attrValue);
        return; // 크기는 attributeGroups에 추가하지 않음
      }
      
      if (!attributeGroups[attrName]) {
        attributeGroups[attrName] = new Set();
        attributeImages[attrName] = {};
      }
      
      attributeGroups[attrName].add(attrValue);
      
      // 이미지가 있는 속성인 경우 저장
      if (attr.skuImageUrl && !attributeImages[attrName][attrValue]) {
        attributeImages[attrName][attrValue] = attr.skuImageUrl;
      }
    });
  });

  // SKU 재고 확인
  const isSkuAvailable = (attributeName: string, attributeValue: string) => {
    return productSkuInfos.some(sku => 
      sku.skuAttributes?.some((attr: any) => {
        const attrName = attr.attributeNameTrans || attr.attributeName;
        const attrValue = attr.valueTrans || attr.value;
        return attrName === attributeName && attrValue === attributeValue && sku.amountOnSale > 0;
      })
    );
  };

  // 모바일용 하단 고정 버튼
  const MobileBottomBar = () => (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2,
        zIndex: 1200,
        borderTop: '2px solid',
        borderColor: 'primary.main',
        display: { xs: 'block', md: 'none' }
      }}
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ 
              height: 56,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {totalQuantity > 0 ? (
              <>옵션 선택 ({totalQuantity}개) - ¥{totalAmount.toFixed(2)}</>
            ) : (
              '옵션을 선택하세요'
            )}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  // 모바일 드로어
  const MobileDrawer = () => (
    <Drawer
      anchor="bottom"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: { 
          maxHeight: '80vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'auto'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">옵션 선택</Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* 사용 가능한 사이즈 표시 */}
        {allSizes.size > 0 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              사이즈: {Array.from(allSizes).join(', ')}
            </Typography>
          </Box>
        )}
        
        {/* 색상/사이즈가 있는 경우 */}
        {hasColorAndSize ? (
          <>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              {Object.keys(attributeGroups).map((attrName, index) => (
                <Tab key={index} label={attrName} />
              ))}
              <Tab label="수량 입력" />
            </Tabs>
            
            {Object.entries(attributeGroups).map(([attrName, values], tabIndex) => (
              <Box key={attrName} hidden={activeTab !== tabIndex}>
                <Stack spacing={1}>
                  {Array.from(values).map((value) => {
                    const isSelected = selectedAttributes[attrName] === value;
                    const isAvailable = isSkuAvailable(attrName, value);
                    const hasImage = attributeImages[attrName]?.[value];
                    
                    return (
                      <Button
                        key={value}
                        variant={isSelected ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable && onAttributeSelect) {
                            onAttributeSelect(attrName, value);
                            handleColorSelection(attrName, value);
                          }
                        }}
                        startIcon={hasImage ? (
                          <Box component="img" src={hasImage} sx={{ width: 24, height: 24, borderRadius: '50%' }} />
                        ) : null}
                        endIcon={isSelected ? <CheckCircleIcon /> : null}
                      >
                        {value}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            ))}
            
            {/* 수량 입력 탭 */}
            <Box hidden={activeTab !== Object.keys(attributeGroups).length}>
              {selectedColor && Object.keys(currentColorQuantities).length > 0 ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {selectedColor} - 사이즈별 수량
                  </Typography>
                  <Stack spacing={2}>
                    {Object.keys(currentColorQuantities).map((size) => {
                      const sku = productSkuInfos?.find((s: any) => 
                        s.skuAttributes.some((attr: any) => 
                          (attr.attributeName === '颜色' || attr.attributeName === '색상' || 
                           attr.attributeNameTrans === '색상') &&
                          (attr.value === selectedColor || attr.valueTrans === selectedColor)
                        ) &&
                        s.skuAttributes.some((attr: any) => 
                          (attr.attributeName === '尺码' || attr.attributeName === '크기' ||
                           attr.attributeNameTrans === '크기') &&
                          (attr.value === size || attr.valueTrans === size)
                        )
                      );
                      
                      return (
                        <Box key={size} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">{size}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              재고: {sku?.amountOnSale || '충분'} | ¥{sku?.consignPrice || sku?.price || '-'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              onClick={() => {
                                const currentQty = currentColorQuantities[size] || 0;
                                if (currentQty > 0) {
                                  const newQty = currentQty - 1;
                                  const newQuantities = {
                                    ...currentColorQuantities,
                                    [size]: newQty
                                  };
                                  setCurrentColorQuantities(newQuantities);
                                  
                                  const key = `${selectedColor}-${size}`;
                                  const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                                  
                                  setAllQuantities(prev => {
                                    const updated = { ...prev };
                                    if (newQty > 0) {
                                      updated[key] = { qty: newQty, price, color: selectedColor, size };
                                    } else {
                                      delete updated[key];
                                    }
                                    return updated;
                                  });
                                }
                              }}
                              disabled={!currentColorQuantities[size] || currentColorQuantities[size] === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            
                            <TextField
                              type="number"
                              size="small"
                              value={currentColorQuantities[size]}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 0;
                                const newQuantities = {
                                  ...currentColorQuantities,
                                  [size]: qty
                                };
                                setCurrentColorQuantities(newQuantities);
                                
                                const key = `${selectedColor}-${size}`;
                                const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                                
                                setAllQuantities(prev => {
                                  const updated = { ...prev };
                                  if (qty > 0) {
                                    updated[key] = { qty, price, color: selectedColor, size };
                                  } else {
                                    delete updated[key];
                                  }
                                  return updated;
                                });
                              }}
                              inputProps={{ min: 0 }}
                              sx={{ width: 80, textAlign: 'center' }}
                            />
                            
                            <IconButton
                              onClick={() => {
                                const currentQty = currentColorQuantities[size] || 0;
                                const newQty = currentQty + 1;
                                const newQuantities = {
                                  ...currentColorQuantities,
                                  [size]: newQty
                                };
                                setCurrentColorQuantities(newQuantities);
                                
                                const key = `${selectedColor}-${size}`;
                                const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                                
                                setAllQuantities(prev => {
                                  const updated = { ...prev };
                                  updated[key] = { qty: newQty, price, color: selectedColor, size };
                                  return updated;
                                });
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </>
              ) : (
                <Alert severity="info">
                  먼저 색상을 선택해주세요
                </Alert>
              )}
            </Box>
          </>
        ) : (
          // 일반 SKU인 경우 (색상/사이즈가 없는 경우)
          <>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              옵션별 수량 입력
            </Typography>
            <Stack spacing={2}>
              {productSkuInfos?.map((sku: any, index: number) => {
                const skuName = sku.skuAttributes
                  .map((attr: any) => attr.valueTrans || attr.value)
                  .join(' / ');
                const skuKey = `sku-${sku.skuId}`;
                
                return (
                  <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{skuName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        재고: {sku.amountOnSale || '충분'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="primary">
                        ¥{sku.promotionPrice || sku.consignPrice || sku.price || '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => {
                          const currentQty = generalOptionQuantities[skuKey] || 0;
                          if (currentQty > 0) {
                            const newQty = currentQty - 1;
                            setGeneralOptionQuantities(prev => ({
                              ...prev,
                              [skuKey]: newQty
                            }));
                            
                            const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                            setAllQuantities(prev => {
                              const updated = { ...prev };
                              if (newQty > 0) {
                                updated[skuKey] = { 
                                  qty: newQty, 
                                  price, 
                                  color: skuName, 
                                  size: '' 
                                };
                              } else {
                                delete updated[skuKey];
                              }
                              return updated;
                            });
                          }
                        }}
                        disabled={!generalOptionQuantities[skuKey] || generalOptionQuantities[skuKey] === 0}
                      >
                        <RemoveIcon />
                      </IconButton>
                      
                      <TextField
                        type="number"
                        size="small"
                        value={generalOptionQuantities[skuKey] || 0}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          setGeneralOptionQuantities(prev => ({
                            ...prev,
                            [skuKey]: qty
                          }));
                          
                          const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                          setAllQuantities(prev => {
                            const updated = { ...prev };
                            if (qty > 0) {
                              updated[skuKey] = { 
                                qty, 
                                price, 
                                color: skuName, 
                                size: '' 
                              };
                            } else {
                              delete updated[skuKey];
                            }
                            return updated;
                          });
                        }}
                        inputProps={{ min: 0 }}
                        sx={{ width: 80, textAlign: 'center' }}
                      />
                      
                      <IconButton
                        onClick={() => {
                          const currentQty = generalOptionQuantities[skuKey] || 0;
                          const newQty = currentQty + 1;
                          setGeneralOptionQuantities(prev => ({
                            ...prev,
                            [skuKey]: newQty
                          }));
                          
                          const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                          setAllQuantities(prev => ({
                            ...prev,
                            [skuKey]: { 
                              qty: newQty, 
                              price, 
                              color: skuName, 
                              size: '' 
                            }
                          }));
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );

  // 모바일 UI
  if (isMobile) {
    return (
      <>
        <MobileBottomBar />
        <MobileDrawer />
        
        {/* 선택된 항목 요약 */}
        {totalQuantity > 0 && (
          <Paper sx={{ p: 2, mb: 8 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              선택된 옵션
            </Typography>
            {Object.entries(allQuantities).map(([key, item]) => {
              if (item.qty > 0) {
                return (
                  <Chip 
                    key={key}
                    label={`${item.color}/${item.size} × ${item.qty}`}
                    onDelete={() => {
                      setAllQuantities(prev => {
                        const updated = { ...prev };
                        delete updated[key];
                        return updated;
                      });
                    }}
                    sx={{ m: 0.5 }}
                  />
                );
              }
              return null;
            })}
          </Paper>
        )}
      </>
    );
  }

  // 데스크톱 UI
  return (
    <Box sx={{ mb: 3 }}>
      {/* 옵션 선택 영역 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          옵션 선택
        </Typography>
        
        {/* 사용 가능한 사이즈 표시 (선택 불가) */}
        {allSizes.size > 0 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              사용 가능한 사이즈
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Array.from(allSizes).map((size) => (
                <Chip
                  key={size}
                  label={size}
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.7 }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        <Grid container spacing={2}>
          {Object.entries(attributeGroups).map(([attrName, values]) => (
            <Grid key={attrName} size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                {attrName}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.from(values).map((value) => {
              const isSelected = selectedAttributes[attrName] === value;
              const isAvailable = isSkuAvailable(attrName, value);
              const hasImage = attributeImages[attrName]?.[value];
              
              return (
                <Chip
                  key={value}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {hasImage && (
                        <Box
                          component="img"
                          src={hasImage}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                      <span>{value}</span>
                      {isSelected && (
                        <CheckCircleIcon sx={{ fontSize: 16, ml: 0.5 }} />
                      )}
                    </Stack>
                  }
                  onClick={() => {
                    if (isAvailable && onAttributeSelect) {
                      onAttributeSelect(attrName, value);
                      
                      // 색상 선택 시 사이즈별 수량 입력 필드 초기화
                      const isColorAttribute = attrName === '색상' || attrName === '颜色' || 
                                             attrName === 'Color' || attrName === '색깔';
                      
                      if (isColorAttribute) {
                        setSelectedColor(value);
                        
                        // 해당 색상의 사이즈들 찾기
                        const colorSkus = productSkuInfos?.filter((sku: any) => 
                          sku.skuAttributes.some((attr: any) => 
                            (attr.attributeName === '颜色' || attr.attributeName === '색상' || 
                             attr.attributeNameTrans === '색상') &&
                            (attr.value === value || attr.valueTrans === value)
                          )
                        );
                        
                        // 현재 색상의 사이즈별 수량 초기화 (기존에 입력한 값 유지)
                        const newSizeQuantities: { [key: string]: number } = {};
                        const sizeSet = new Set<string>();
                        
                        colorSkus?.forEach((sku: any) => {
                          const sizeAttr = sku.skuAttributes.find((attr: any) => 
                            attr.attributeName === '尺码' || attr.attributeName === '크기' ||
                            attr.attributeNameTrans === '크기' || attr.attributeNameTrans === 'Size'
                          );
                          if (sizeAttr) {
                            const sizeValue = sizeAttr.valueTrans || sizeAttr.value;
                            if (!sizeSet.has(sizeValue)) {
                              sizeSet.add(sizeValue);
                              // 기존에 입력한 값이 있으면 유지
                              const key = `${value}-${sizeValue}`;
                              newSizeQuantities[sizeValue] = allQuantities[key]?.qty || 0;
                            }
                          }
                        });
                        setCurrentColorQuantities(newSizeQuantities);
                      }
                    }
                  }}
                  disabled={!isAvailable}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.5,
                    '&:hover': isAvailable ? {
                      backgroundColor: isSelected ? 'primary.main' : 'action.hover'
                    } : {}
                  }}
                />
              );
            })}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 일반 옵션 수량 입력 (색상/사이즈가 없는 경우) */}
      {!hasColorAndSize && productSkuInfos && productSkuInfos.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            옵션별 수량 입력
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>옵션</TableCell>
                  <TableCell>재고</TableCell>
                  <TableCell>가격</TableCell>
                  <TableCell>수량</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productSkuInfos.map((sku: any, index: number) => {
                  const skuName = sku.skuAttributes
                    .map((attr: any) => attr.valueTrans || attr.value)
                    .join(' / ');
                  const skuKey = `sku-${sku.skuId}`;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{skuName}</TableCell>
                      <TableCell>{sku.amountOnSale || '충분'}</TableCell>
                      <TableCell>¥{sku.promotionPrice || sku.consignPrice || sku.price || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentQty = generalOptionQuantities[skuKey] || 0;
                              if (currentQty > 0) {
                                const newQty = currentQty - 1;
                                setGeneralOptionQuantities(prev => ({
                                  ...prev,
                                  [skuKey]: newQty
                                }));
                                
                                const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                                setAllQuantities(prev => {
                                  const updated = { ...prev };
                                  if (newQty > 0) {
                                    updated[skuKey] = { 
                                      qty: newQty, 
                                      price, 
                                      color: skuName, 
                                      size: '' 
                                    };
                                  } else {
                                    delete updated[skuKey];
                                  }
                                  return updated;
                                });
                              }
                            }}
                            disabled={!generalOptionQuantities[skuKey] || generalOptionQuantities[skuKey] === 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            size="small"
                            value={generalOptionQuantities[skuKey] || 0}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              setGeneralOptionQuantities(prev => ({
                                ...prev,
                                [skuKey]: qty
                              }));
                              
                              const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                              setAllQuantities(prev => {
                                const updated = { ...prev };
                                if (qty > 0) {
                                  updated[skuKey] = { 
                                    qty, 
                                    price, 
                                    color: skuName, 
                                    size: '' 
                                  };
                                } else {
                                  delete updated[skuKey];
                                }
                                return updated;
                              });
                            }}
                            inputProps={{ min: 0 }}
                            sx={{ width: 80 }}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentQty = generalOptionQuantities[skuKey] || 0;
                              const newQty = currentQty + 1;
                              setGeneralOptionQuantities(prev => ({
                                ...prev,
                                [skuKey]: newQty
                              }));
                              
                              const price = sku.promotionPrice || sku.consignPrice || sku.price || 0;
                              setAllQuantities(prev => ({
                                ...prev,
                                [skuKey]: { 
                                  qty: newQty, 
                                  price, 
                                  color: skuName, 
                                  size: '' 
                                }
                              }));
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 색상별 사이즈 수량 입력 테이블 */}
      {hasColorAndSize && selectedColor && Object.keys(currentColorQuantities).length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {selectedColor} - 사이즈별 수량 입력
            </Typography>
            <Chip 
              label={`소계: ${Object.values(currentColorQuantities).reduce((sum, qty) => sum + qty, 0)}개`}
              color="primary"
              size="small"
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>사이즈</TableCell>
                  <TableCell>재고</TableCell>
                  <TableCell>가격</TableCell>
                  <TableCell>수량</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(currentColorQuantities).map((size) => {
                  // 해당 색상과 사이즈의 SKU 찾기
                  const sku = productSkuInfos?.find((s: any) => 
                    s.skuAttributes.some((attr: any) => 
                      (attr.attributeName === '颜色' || attr.attributeName === '색상' || 
                       attr.attributeNameTrans === '색상') &&
                      (attr.value === selectedColor || attr.valueTrans === selectedColor)
                    ) &&
                    s.skuAttributes.some((attr: any) => 
                      (attr.attributeName === '尺码' || attr.attributeName === '크기' ||
                       attr.attributeNameTrans === '크기') &&
                      (attr.value === size || attr.valueTrans === size)
                    )
                  );
                  
                  return (
                    <TableRow key={size}>
                      <TableCell>{size}</TableCell>
                      <TableCell>{sku?.amountOnSale || '충분'}</TableCell>
                      <TableCell>¥{sku?.consignPrice || sku?.price || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentQty = currentColorQuantities[size] || 0;
                              if (currentQty > 0) {
                                const newQty = currentQty - 1;
                                const newQuantities = {
                                  ...currentColorQuantities,
                                  [size]: newQty
                                };
                                setCurrentColorQuantities(newQuantities);
                                
                                // 전체 수량 업데이트
                                const key = `${selectedColor}-${size}`;
                                const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                                
                                setAllQuantities(prev => {
                                  const updated = { ...prev };
                                  if (newQty > 0) {
                                    updated[key] = { qty: newQty, price, color: selectedColor, size };
                                  } else {
                                    delete updated[key];
                                  }
                                  return updated;
                                });
                              }
                            }}
                            disabled={!currentColorQuantities[size] || currentColorQuantities[size] === 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            size="small"
                            value={currentColorQuantities[size]}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              const newQuantities = {
                                ...currentColorQuantities,
                                [size]: qty
                              };
                              setCurrentColorQuantities(newQuantities);
                              
                              // 전체 수량 업데이트
                              const key = `${selectedColor}-${size}`;
                              const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                              
                              setAllQuantities(prev => {
                                const updated = { ...prev };
                                if (qty > 0) {
                                  updated[key] = { qty, price, color: selectedColor, size };
                                } else {
                                  delete updated[key];
                                }
                                return updated;
                              });
                            }}
                            inputProps={{ min: 0 }}
                            sx={{ width: 60 }}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentQty = currentColorQuantities[size] || 0;
                              const newQty = currentQty + 1;
                              const newQuantities = {
                                ...currentColorQuantities,
                                [size]: newQty
                              };
                              setCurrentColorQuantities(newQuantities);
                              
                              // 전체 수량 업데이트
                              const key = `${selectedColor}-${size}`;
                              const price = sku?.promotionPrice || sku?.consignPrice || sku?.price || 0;
                              
                              setAllQuantities(prev => {
                                const updated = { ...prev };
                                updated[key] = { qty: newQty, price, color: selectedColor, size };
                                return updated;
                              });
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
        </Paper>
      )}

      {/* 전체 주문 내역 리스트 */}
      {totalQuantity > 0 && (
        <Paper sx={{ p: 3, mt: 2, border: '2px solid', borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📋 주문 내역
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`총 ${totalQuantity}개`}
                color="primary"
                variant="filled"
              />
              <Chip 
                label={`¥${totalAmount.toFixed(2)}`}
                color="error"
                variant="filled"
              />
            </Box>
          </Box>
          
          {/* 선택된 항목 간단한 리스트 */}
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            {Object.entries(allQuantities).map(([key, item]) => {
              if (item.qty > 0) {
                return (
                  <Box 
                    key={key} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid #e0e0e0',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        <strong>{item.color}</strong> / {item.size}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">
                        {item.qty}개 × ¥{item.price}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        ¥{(item.qty * item.price).toFixed(2)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setAllQuantities(prev => {
                            const updated = { ...prev };
                            delete updated[key];
                            return updated;
                          });
                          
                          if (item.color === selectedColor) {
                            setCurrentColorQuantities(prev => ({
                              ...prev,
                              [item.size]: 0
                            }));
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              }
              return null;
            })}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 최종 합계 */}
          <Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  총 주문 수량
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {totalQuantity}개
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
                <Typography variant="body1" color="text.secondary">
                  총 금액
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  ¥{totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ ₩{Math.floor(totalAmount * 203).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* 선택된 SKU 정보 표시 */}
      {selectedSku && !selectedColor && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.50' }}>
          <Typography variant="body2" color="success.main">
            선택완료: {selectedSku.skuAttributes?.map((attr: any) => 
              attr.valueTrans || attr.value
            ).join(' / ')}
          </Typography>
          {selectedSku.price && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              가격: ¥{selectedSku.price} 
              {selectedSku.promotionPrice && (
                <span style={{ color: 'red', marginLeft: 8 }}>
                  (할인가: ¥{selectedSku.promotionPrice})
                </span>
              )}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            재고: {selectedSku.amountOnSale}개
          </Typography>
        </Paper>
      )}
    </Box>
  );
}