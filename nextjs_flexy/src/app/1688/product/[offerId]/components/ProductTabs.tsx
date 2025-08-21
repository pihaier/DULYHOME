import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProductTabsProps {
  productDetail: any;
  translatedDescription?: string | null;
  isTranslatingDescription?: boolean;
  onTranslateDescription?: () => void;
  translatingImage?: string | null;
  translatedImages?: Record<string, string>;
  onTranslateImage?: (imageUrl: string) => void;
}

export default function ProductTabs({
  productDetail,
  translatedDescription,
  isTranslatingDescription = false,
  onTranslateDescription,
  translatingImage,
  translatedImages = {},
  onTranslateImage
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 이미지 번역 함수 (부모에서 처리하고 결과를 모달로 표시)
  const handleTranslateImage = async (imageUrl: string) => {
    // 이미 번역된 이미지가 있으면 모달로 보여주기
    if (translatedImages[imageUrl]) {
      setModalImageUrl(translatedImages[imageUrl]);
      setImageModalOpen(true);
      return;
    }

    // 부모의 번역 함수 호출
    if (onTranslateImage) {
      await onTranslateImage(imageUrl);
      // 번역 완료 후 모달 표시
      if (translatedImages[imageUrl]) {
        setModalImageUrl(translatedImages[imageUrl]);
        setImageModalOpen(true);
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="product tabs" variant="scrollable" scrollButtons="auto">
            <Tab icon={<ListAltIcon />} label="상품 상세" iconPosition="start" />
            <Tab icon={<CategoryIcon />} label="제품 속성" iconPosition="start" />
            <Tab icon={<TrendingUpIcon />} label="판매 정보" iconPosition="start" />
            <Tab icon={<LocalShippingIcon />} label="배송 정보" iconPosition="start" />
            <Tab icon={<HandshakeIcon />} label="거래 조건" iconPosition="start" />
          </Tabs>
        </Box>

        {/* 상품 상세 탭 */}
        <TabPanel value={activeTab} index={0}>
          {/* 번역 버튼과 안내 */}
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">상품 상세 설명</Typography>
              {onTranslateDescription && (
                <Button
                  variant="contained"
                  startIcon={isTranslatingDescription ? <CircularProgress size={20} /> : <TranslateIcon />}
                  onClick={onTranslateDescription}
                  disabled={isTranslatingDescription || !!translatedDescription}
                  color="primary"
                >
                  {isTranslatingDescription ? '번역 중...' : translatedDescription ? '번역 완료' : '상품 설명 한글 번역'}
                </Button>
              )}
            </Box>
            
            <Alert severity="info" icon={<TranslateIcon />}>
              상품 설명의 이미지를 클릭하면 한글로 번역된 이미지를 볼 수 있습니다
            </Alert>
          </Stack>
          
          {/* 번역 중 메시지 */}
          {translatingImage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              이미지 번역 중...
            </Alert>
          )}
          
          {/* 번역된 텍스트 표시 */}
          {translatedDescription && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                📝 번역된 상품 설명
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {translatedDescription}
              </Typography>
            </Paper>
          )}
          
          {/* 상품 설명 HTML */}
          <Box
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                handleTranslateImage(img.src);
              }
            }}
            dangerouslySetInnerHTML={{ __html: productDetail.description || '' }}
            sx={{
              width: '100%',
              position: 'relative',
              '& img': {
                width: '100% !important',
                maxWidth: '100% !important',
                height: 'auto !important',
                display: 'block !important',
                margin: '0 auto !important',
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: (img: any) => translatingImage === img?.src ? 'brightness(0.7)' : 'none',
                '&:hover': {
                  opacity: 0.9,
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              },
              '& p': {
                margin: '10px 0',
                padding: '0 10px',
                wordBreak: 'break-word',
                fontSize: { xs: '14px', sm: '16px' },
                lineHeight: 1.6,
              },
              '& *': {
                maxWidth: '100%',
              },
            }}
          />

          {/* 이미지 번역 중 오버레이 */}
          {translatingImage && (
            <Box
              sx={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: 2,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <CircularProgress size={24} color="inherit" />
              <Typography variant="body2">이미지를 번역하고 있습니다...</Typography>
            </Box>
          )}
        </TabPanel>

        {/* 제품 속성 탭 */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>제품 속성</Typography>
          
          {productDetail?.productAttribute && productDetail.productAttribute.length > 0 ? (
            <Box>
              {(() => {
                // 속성을 카테고리별로 그룹화
                const groupedAttributes: { [key: string]: any[] } = {};
                productDetail.productAttribute.forEach((attr: any) => {
                  const key = attr.attributeNameTrans || attr.attributeName;
                  if (!groupedAttributes[key]) {
                    groupedAttributes[key] = [];
                  }
                  groupedAttributes[key].push(attr);
                });

                return (
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {Object.entries(groupedAttributes).map(([attributeName, values]: [string, any[]], index) => {
                          // 색상과 사이즈는 SKU에서 처리하므로 여기서는 제외
                          if (attributeName === '색상' || attributeName === '크기') {
                            return null;
                          }
                          
                          return (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 500, width: '30%' }}>
                                {attributeName}
                              </TableCell>
                              <TableCell>
                                {values.length > 1 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {values.map((v, idx) => (
                                      <Chip
                                        key={idx}
                                        label={v.valueTrans || v.value}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  values[0].valueTrans || values[0].value || '-'
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </Box>
          ) : (
            <Typography color="text.secondary">제품 속성 정보가 없습니다.</Typography>
          )}
        </TabPanel>

        {/* 판매 정보 탭 */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>판매 정보</Typography>
          
          <TableContainer>
            <Table size="small">
              <TableBody>
                {productDetail?.soldOut && (
                  <TableRow>
                    <TableCell component="th" scope="row">총 판매량</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${productDetail.soldOut}개`} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                )}
                {productDetail?.minOrderQuantity && (
                  <TableRow>
                    <TableCell component="th" scope="row">최소 주문 수량</TableCell>
                    <TableCell>{productDetail.minOrderQuantity}개</TableCell>
                  </TableRow>
                )}
                {productDetail?.batchNumber && (
                  <TableRow>
                    <TableCell component="th" scope="row">배치 수량</TableCell>
                    <TableCell>{productDetail.batchNumber}개</TableCell>
                  </TableRow>
                )}
                {productDetail?.productSaleInfo?.priceRangeList && productDetail.productSaleInfo.priceRangeList.length > 0 && (
                  <TableRow>
                    <TableCell component="th" scope="row">가격 구간</TableCell>
                    <TableCell>
                      {productDetail.productSaleInfo.priceRangeList.map((range: any, idx: number) => (
                        <div key={idx}>
                          {range.startQuantity}개 이상: ¥{range.price}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                )}
                {productDetail?.productSaleInfo?.amountOnSale !== undefined && (
                  <TableRow>
                    <TableCell component="th" scope="row">재고 수량</TableCell>
                    <TableCell>{productDetail.productSaleInfo.amountOnSale}개</TableCell>
                  </TableRow>
                )}
                {productDetail?.sellerDataInfo?.repeatPurchasePercent && (
                  <TableRow>
                    <TableCell component="th" scope="row">재구매율</TableCell>
                    <TableCell>{(parseFloat(productDetail.sellerDataInfo.repeatPurchasePercent) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                )}
                {productDetail?.sellerDataInfo?.qualityRefundWithin30Day && (
                  <TableRow>
                    <TableCell component="th" scope="row">30일 내 품질 환불율</TableCell>
                    <TableCell>{(parseFloat(productDetail.sellerDataInfo.qualityRefundWithin30Day) * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                )}
                {productDetail?.sellerDataInfo?.collect30DayWithin48HPercent && (
                  <TableRow>
                    <TableCell component="th" scope="row">48시간 내 수금율</TableCell>
                    <TableCell>{(parseFloat(productDetail.sellerDataInfo.collect30DayWithin48HPercent) * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 배송 정보 탭 */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>배송 정보</Typography>
          
          {productDetail.productShippingInfo && (
            <>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">배송지</TableCell>
                      <TableCell>
                        {productDetail.productShippingInfo.sendGoodsAddressText || '미제공'}
                      </TableCell>
                    </TableRow>
                    {(productDetail.productShippingInfo.width || 
                      productDetail.productShippingInfo.length || 
                      productDetail.productShippingInfo.height) && (
                      <TableRow>
                        <TableCell component="th" scope="row">기본 포장 크기</TableCell>
                        <TableCell>
                          {productDetail.productShippingInfo.width || '-'} × 
                          {productDetail.productShippingInfo.length || '-'} × 
                          {productDetail.productShippingInfo.height || '-'} cm
                        </TableCell>
                      </TableRow>
                    )}
                    {productDetail.productShippingInfo.weight && (
                      <TableRow>
                        <TableCell component="th" scope="row">포장 무게</TableCell>
                        <TableCell>{productDetail.productShippingInfo.weight}kg</TableCell>
                      </TableRow>
                    )}
                    {productDetail.productShippingInfo.shippingTimeGuarantee && (
                      <TableRow>
                        <TableCell component="th" scope="row">배송 시간 보장</TableCell>
                        <TableCell>{productDetail.productShippingInfo.shippingTimeGuarantee}</TableCell>
                      </TableRow>
                    )}
                    {productDetail.productShippingInfo.pkgSizeSource && (
                      <TableRow>
                        <TableCell component="th" scope="row">포장 정보 출처</TableCell>
                        <TableCell>{productDetail.productShippingInfo.pkgSizeSource}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

              {/* SKU별 배송 정보 */}
              {productDetail.productShippingInfo?.skuShippingDetails && 
               productDetail.productShippingInfo.skuShippingDetails.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>SKU별 포장 정보</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>옵션</TableCell>
                          <TableCell>포장 크기</TableCell>
                          <TableCell>무게</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productDetail.productShippingInfo.skuShippingDetails.map((detail: any, index: number) => {
                          const sku = productDetail.productSkuInfos?.find(
                            (s: any) => s.skuId.toString() === detail.skuId
                          );
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {sku?.skuAttributes?.map((attr: any) => attr.valueTrans || attr.value).join(', ') || detail.skuId}
                              </TableCell>
                              <TableCell>
                                {detail.width || '-'} × {detail.length || '-'} × {detail.height || '-'} cm
                              </TableCell>
                              <TableCell>{detail.weight || '-'} kg</TableCell>
                            </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </TabPanel>

        {/* 거래 조건 탭 */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>거래 조건</Typography>
          
          <TableContainer>
            <Table size="small">
              <TableBody>
                {/* 최소 주문 수량 */}
                {productDetail?.minOrderQuantity && (
                  <TableRow>
                    <TableCell component="th" scope="row">최소 주문 수량</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {productDetail.minOrderQuantity}개
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 판매 단위 */}
                {productDetail?.productSaleInfo?.unitInfo && (
                  <TableRow>
                    <TableCell component="th" scope="row">판매 단위</TableCell>
                    <TableCell>
                      {productDetail.productSaleInfo.unitInfo.transUnit || productDetail.productSaleInfo.unitInfo.unit}
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 혼합 주문 가능 여부 */}
                {productDetail?.sellerMixSetting?.generalHunpi !== undefined && (
                  <TableRow>
                    <TableCell component="th" scope="row">혼합 주문</TableCell>
                    <TableCell>
                      <Chip 
                        label={productDetail.sellerMixSetting.generalHunpi ? "가능" : "불가"} 
                        color={productDetail.sellerMixSetting.generalHunpi ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 혼합 주문 조건 */}
                {productDetail?.sellerMixSetting?.generalHunpi && (
                  <>
                    {productDetail.sellerMixSetting.mixAmount && (
                      <TableRow>
                        <TableCell component="th" scope="row">최소 혼합 금액</TableCell>
                        <TableCell>¥{productDetail.sellerMixSetting.mixAmount}</TableCell>
                      </TableRow>
                    )}
                    {productDetail.sellerMixSetting.mixNumber && (
                      <TableRow>
                        <TableCell component="th" scope="row">최소 혼합 수량</TableCell>
                        <TableCell>{productDetail.sellerMixSetting.mixNumber}개</TableCell>
                      </TableRow>
                    )}
                  </>
                )}
                
                {/* 배치 수량 (최상위 필드) */}
                {productDetail?.batchNumber && (
                  <TableRow>
                    <TableCell component="th" scope="row">배치 수량</TableCell>
                    <TableCell>{productDetail.batchNumber}개</TableCell>
                  </TableRow>
                )}
                
                {/* 프리미엄 상품 여부 */}
                {productDetail?.isJxhy && (
                  <TableRow>
                    <TableCell component="th" scope="row">프리미엄 상품</TableCell>
                    <TableCell>
                      <Chip 
                        label="JXHY 인증" 
                        color="error"
                        size="small"
                        icon={<VerifiedIcon />}
                      />
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 프로모션 정보 */}
                {productDetail?.promotionModel?.hasPromotion && (
                  <TableRow>
                    <TableCell component="th" scope="row">프로모션</TableCell>
                    <TableCell>
                      <Chip 
                        label={productDetail.promotionModel.promotionType || "진행중"} 
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 태그 정보들 */}
                {productDetail?.tagInfoList?.find((t: any) => t.key === 'isOnePsale')?.value && (
                  <TableRow>
                    <TableCell component="th" scope="row">드롭시핑</TableCell>
                    <TableCell>
                      <Chip label="지원" color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                )}
                
                {productDetail?.tagInfoList?.find((t: any) => t.key === 'isOnePsaleFreePostage')?.value && (
                  <TableRow>
                    <TableCell component="th" scope="row">드롭시핑 무료배송</TableCell>
                    <TableCell>
                      <Chip label="지원" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                )}
                
                {productDetail?.tagInfoList?.find((t: any) => t.key === 'isSupportMix')?.value && (
                  <TableRow>
                    <TableCell component="th" scope="row">혼합 구매</TableCell>
                    <TableCell>
                      <Chip label="지원" color="info" size="small" />
                    </TableCell>
                  </TableRow>
                )}
                
                {productDetail?.tagInfoList?.find((t: any) => t.key === 'noReason7DReturn')?.value && (
                  <TableRow>
                    <TableCell component="th" scope="row">7일 무조건 반품</TableCell>
                    <TableCell>
                      <Chip label="지원" color="secondary" size="small" />
                    </TableCell>
                  </TableRow>
                )}
                
                {/* 공급업체 인증 정보 */}
                {productDetail?.offerIdentities?.includes('tp_member') && (
                  <TableRow>
                    <TableCell component="th" scope="row">TP 회원</TableCell>
                    <TableCell>
                      <Chip label="인증" color="primary" size="small" icon={<VerifiedIcon />} />
                    </TableCell>
                  </TableRow>
                )}
                
                {productDetail?.offerIdentities?.includes('powerful_merchants') && (
                  <TableRow>
                    <TableCell component="th" scope="row">파워 머천트</TableCell>
                    <TableCell>
                      <Chip label="인증" color="warning" size="small" icon={<VerifiedIcon />} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
      
      {/* 번역된 이미지 모달 */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          {modalImageUrl && (
            <Box
              component="img"
              src={modalImageUrl}
              alt="번역된 이미지"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}