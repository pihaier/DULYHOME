'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

interface ImageSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (imageData: string, isImageUrl?: boolean) => Promise<void>;
}

export default function ImageSearchModal({ open, onClose, onSearch }: ImageSearchModalProps) {
  const [tabValue, setTabValue] = useState(0); // 0: 업로드, 1: URL
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    setError(null);
    
    // 파일 크기 체크 (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError('파일 크기는 3MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleImageSearch = async () => {
    if (tabValue === 0) {
      // 업로드 탭
      if (!uploadedImage) {
        setError('먼저 이미지를 업로드해주세요.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await onSearch(uploadedImage, false);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : '이미지 검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      // URL 탭
      if (!imageUrl) {
        setError('이미지 URL을 입력해주세요.');
        return;
      }
      // 1688 이미지 URL 검증
      if (!imageUrl.includes('alicdn.com') && !imageUrl.includes('1688.com')) {
        setError('1688 상품 이미지 URL을 입력해주세요.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await onSearch(imageUrl, true); // isImageUrl = true
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : '이미지 검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setUploadedImage(null);
    setImageUrl('');
    setError(null);
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">이미지로 검색</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab icon={<UploadIcon />} label="이미지 업로드" />
          <Tab icon={<LinkIcon />} label="1688 URL" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 탭 0: 이미지 업로드 */}
        {tabValue === 0 && (
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: dragActive ? '2px solid primary.main' : '2px dashed grey.400',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: dragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {uploadedImage ? (
              <Box sx={{ position: 'relative', width: '100%' }}>
                <img
                  src={uploadedImage}
                  alt="업로드된 이미지"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setUploadedImage(null)}
                  sx={{ mt: 2 }}
                >
                  다른 이미지 선택
                </Button>
              </Box>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input" style={{ cursor: 'pointer' }}>
                  <Box>
                    {dragActive ? (
                      <ImageIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    ) : (
                      <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    )}
                    <Typography variant="body1" gutterBottom>
                      이미지를 드래그하거나 클릭하여 업로드
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG, WEBP (최대 3MB)
                    </Typography>
                  </Box>
                </label>
              </>
            )}
          </Box>
        )}

        {/* 탭 1: 1688 URL 입력 */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              1688 상품 이미지 URL을 입력하세요. (alicdn.com 도메인)
            </Typography>
            <TextField
              fullWidth
              label="이미지 URL"
              placeholder="https://cbu01.alicdn.com/img/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
              helperText="예: https://cbu01.alicdn.com/img/ibank/O1CN01..."
            />
            {imageUrl && imageUrl.includes('alicdn.com') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  미리보기:
                </Typography>
                <img
                  src={imageUrl}
                  alt="URL 이미지"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    marginTop: '8px',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    setError('이미지를 불러올 수 없습니다. URL을 확인해주세요.');
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = 'block';
                    setError(null);
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleImageSearch}
          disabled={(tabValue === 0 && !uploadedImage) || (tabValue === 1 && !imageUrl) || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          검색
        </Button>
      </DialogActions>
    </Dialog>
  );
}