'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  ImageList,
  ImageListItem,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TranslateIcon from '@mui/icons-material/Translate';
// getAllProductImages 함수를 컴포넌트 내부에서 정의

interface ProductImageGalleryProps {
  productDetail: any;
  currentImage?: string;
  onImageChange?: (image: string) => void;
}

export default function ProductImageGallery({
  productDetail,
  currentImage,
  onImageChange,
}: ProductImageGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [translatingImage, setTranslatingImage] = useState<string | null>(null);
  const [translatedImages, setTranslatedImages] = useState<Record<string, string>>({});
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [translationModalImage, setTranslationModalImage] = useState('');

  // getAllProductImages 함수 내부 정의
  const getAllProductImages = () => {
    if (!productDetail) return [];
    
    // productImage.images 사용
    const productImages = productDetail.productImage?.images || [];
    
    // SKU 이미지 수집
    const skuImages = productDetail.productSkuInfos?.flatMap((sku: any) => 
      sku.skuAttributes?.filter((attr: any) => attr.skuImageUrl).map((attr: any) => attr.skuImageUrl)
    ) || [];
    
    return [...new Set([...productImages, ...skuImages])];
  };

  const images = getAllProductImages();
  
  // currentImage를 기준으로 selectedImage 계산 (상태 대신 계산값 사용)
  // indexOf가 -1을 반환하면 0으로 설정
  const currentImageIndex = currentImage ? images.indexOf(currentImage) : -1;
  const selectedImage = currentImageIndex >= 0 ? currentImageIndex : 0;
  const displayImage = currentImage || images[0] || '/images/products/s1.jpg';
  
  const hasVideo = productDetail?.mainVideo || productDetail?.detailVideo;
  const hasDetailVideo = productDetail?.detailVideo;

  const handleImageSelect = (index: number) => {
    // 부모 컴포넌트의 onImageChange를 통해서만 이미지 변경
    if (onImageChange && images[index]) {
      onImageChange(images[index]);
    }
  };

  const handleOpenGallery = () => {
    setGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    setGalleryOpen(false);
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  // 이미지 번역 함수
  const handleTranslateImage = async (imageUrl: string) => {
    // 이미 번역된 이미지가 있으면 모달로 보여주기
    if (translatedImages[imageUrl]) {
      setTranslationModalImage(translatedImages[imageUrl]);
      setTranslationModalOpen(true);
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
        setTranslationModalImage(result.data.translatedImageUrl);
        setTranslationModalOpen(true);
      } else {
        console.warn('Image translation failed:', result.error);
        // 실패 시 알림 - 부모 컴포넌트에서 처리하도록 할 수도 있음
        alert(result.error || '이미지 번역 서비스가 준비 중입니다.');
      }
    } catch (error) {
      console.error('이미지 번역 오류:', error);
      alert('이미지 번역에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setTranslatingImage(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 메인 이미지 영역 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          bgcolor: 'white',
          border: '1px solid #e8e8e8',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={displayImage.startsWith('/images/') ? displayImage : `/api/1688/image-proxy?url=${encodeURIComponent(displayImage)}`}
          alt="Product"
          sx={{
            width: '100%',
            maxWidth: '100%',
            height: { xs: 250, sm: 350, md: 450, lg: 500 },
            objectFit: 'contain',
            cursor: 'pointer',
          }}
          onClick={handleZoomToggle}
        />
          
          {/* 줌 버튼 */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenGallery();
            }}
          >
            <ZoomInIcon />
          </IconButton>
          
          {/* 비디오 버튼 */}
          {hasVideo && (
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                // 비디오 재생 로직
                const videoUrl = productDetail?.mainVideo || productDetail?.detailVideo;
                if (videoUrl) {
                  window.open(videoUrl, '_blank');
                }
              }}
            >
              <PlayCircleIcon />
            </IconButton>
          )}

          {/* 이미지 번역 버튼 */}
          <Tooltip title="이미지 번역하기">
            <IconButton
              sx={{
                position: 'absolute',
                top: hasVideo ? 60 : 8,
                left: 8,
                backgroundColor: translatedImages[displayImage] 
                  ? 'rgba(76, 175, 80, 0.9)' 
                  : 'rgba(33, 150, 243, 0.9)',
                color: 'white',
                '&:hover': {
                  backgroundColor: translatedImages[displayImage] 
                    ? 'rgba(76, 175, 80, 1)' 
                    : 'rgba(33, 150, 243, 1)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'white',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Extract original URL if it's a proxy URL
                let originalUrl = displayImage;
                if (displayImage.includes('/api/1688/image-proxy?url=')) {
                  try {
                    const urlParam = displayImage.split('url=')[1];
                    originalUrl = decodeURIComponent(urlParam);
                  } catch (error) {
                    console.error('Failed to extract original URL:', error);
                  }
                } else if (!displayImage.startsWith('/images/')) {
                  // If it's not a proxy URL and not a local image, it's already an original URL
                  originalUrl = displayImage;
                }
                handleTranslateImage(originalUrl);
              }}
              disabled={(() => {
                // Check if this image is currently being translated
                if (displayImage.includes('/api/1688/image-proxy?url=')) {
                  try {
                    const urlParam = displayImage.split('url=')[1];
                    const originalUrl = decodeURIComponent(urlParam);
                    return translatingImage === originalUrl;
                  } catch {
                    return false;
                  }
                }
                return translatingImage === displayImage;
              })()}
            >
              {translatingImage === displayImage ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <TranslateIcon />
              )}
            </IconButton>
          </Tooltip>
          
          {/* 이미지 개수 표시 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '12px',
            }}
          >
            {selectedImage + 1} / {images.length}
          </Box>
      </Box>

      {/* 썸네일 리스트 */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          px: { xs: 1, sm: 0 },
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#666',
            },
          },
        }}
      >
        {images.map((image, index) => {
          // 현재 표시되는 이미지와 썸네일 이미지가 같은지 확인
          const isSelected = (currentImage && currentImage === image) || (!currentImage && index === 0);
          
          return (
            <Box
              key={index}
              onClick={() => handleImageSelect(index)}
              sx={{
                flexShrink: 0,
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                cursor: 'pointer',
                border: isSelected ? '3px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#1976d2',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={`/api/1688/image-proxy?url=${encodeURIComponent(image)}`}
                alt={`Thumbnail ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* 이미지 갤러리 다이얼로그 */}
      <Dialog
        open={galleryOpen}
        onClose={handleCloseGallery}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            m: 1,
          },
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={handleCloseGallery}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* 큰 이미지 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              backgroundColor: 'black',
            }}
          >
            <Box
              component="img"
              src={displayImage.startsWith('/images/') ? displayImage : `/api/1688/image-proxy?url=${encodeURIComponent(displayImage)}`}
              alt="Product Large"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </Box>
          
          {/* 갤러리 썸네일 */}
          <Box
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              p: 2,
              overflowX: 'auto',
            }}
          >
            <Stack direction="row" spacing={1}>
              {images.map((image, index) => {
                const isSelected = (currentImage && currentImage === image) || (!currentImage && index === 0);
                
                return (
                  <Box
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    sx={{
                      flexShrink: 0,
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      border: isSelected ? '3px solid white' : '3px solid transparent',
                      borderRadius: 1,
                      overflow: 'hidden',
                      opacity: isSelected ? 1 : 0.6,
                      transition: 'all 0.2s',
                      '&:hover': {
                        opacity: 1,
                        borderColor: 'white',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={`/api/1688/image-proxy?url=${encodeURIComponent(image)}`}
                      alt={`Gallery ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 번역된 이미지 모달 */}
      <Dialog
        open={translationModalOpen}
        onClose={() => setTranslationModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            m: 1,
          },
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setTranslationModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* 번역된 이미지 표시 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              backgroundColor: 'black',
              position: 'relative',
            }}
          >
            {translationModalImage && (
              <>
                <Box
                  component="img"
                  src={translationModalImage}
                  alt="번역된 이미지"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(76, 175, 80, 0.9)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TranslateIcon fontSize="small" />
                  <Typography variant="body2">
                    번역된 이미지
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}