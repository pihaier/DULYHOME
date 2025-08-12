'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  Stack,
  Chip,
  Button,
  LinearProgress,
  Alert,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  Fab,
} from '@mui/material';
import {
  IconUpload,
  IconX,
  IconDownload,
  IconEye,
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypeXls,
  IconPlus,
} from '@tabler/icons-react';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive'
})<{ isDragActive?: boolean }>(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: (theme.shape.borderRadius as number),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  currentFiles?: File[];
}

export default function FileUpload({
  onFilesChange,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/postscript': ['.ai'],
    'image/vnd.adobe.photoshop': ['.psd'],
    '.ai': [],
    '.psd': [],
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  label,
  description,
  required = false,
  error,
  currentFiles = []
}: FileUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState<string>('');

  // 파일 타입 확인
  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const pdfExts = ['pdf'];
    const docExts = ['doc', 'docx'];
    const excelExts = ['xls', 'xlsx'];
    const designExts = ['ai', 'psd'];
    
    if (imageExts.includes(ext || '')) return 'image';
    if (pdfExts.includes(ext || '')) return 'pdf';
    if (docExts.includes(ext || '')) return 'word';
    if (excelExts.includes(ext || '')) return 'excel';
    if (designExts.includes(ext || '')) return 'design';
    return 'file';
  };

  // 파일 변경 시 미리보기 URL 생성
  React.useEffect(() => {
    // 파일이 없으면 early return
    if (!currentFiles || currentFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    // 새로운 URL 생성
    const newUrls = currentFiles.map((file) => {
      if (getFileType(file.name) === 'image') {
        return URL.createObjectURL(file);
      }
      return '';
    });

    setPreviewUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [currentFiles.length]); // length만 의존성으로 사용

  // Dropzone 설정
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...currentFiles, ...acceptedFiles];
    if (newFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }
    onFilesChange(newFiles);
  }, [currentFiles, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true
  });

  // 파일 삭제
  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  // 파일 다운로드
  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // 파일 타입별 아이콘
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <IconFileTypePdf size={24} />;
      case 'word':
        return <IconFileTypeDoc size={24} />;
      case 'excel':
        return <IconFileTypeXls size={24} />;
      default:
        return <IconFile size={24} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
        )}

        {currentFiles.length === 0 ? (
          // 파일이 없을 때
          <UploadBox {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <IconUpload size={48} style={{ marginBottom: 8, opacity: 0.6 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? '여기에 파일을 놓으세요' : '클릭하거나 파일을 드래그하세요'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              최대 {maxFiles}개, 각 {maxSize / 1024 / 1024}MB 이하
            </Typography>
          </UploadBox>
        ) : (
          // 파일이 있을 때
          <Box>
            <ImageList cols={3} gap={8} sx={{ maxHeight: 300 }}>
              {currentFiles.map((file, index) => {
                const fileType = getFileType(file.name);
                const isImage = fileType === 'image';
                
                return (
                  <ImageListItem key={index}>
                    <Card
                      sx={{
                        position: 'relative',
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      {isImage && previewUrls[index] ? (
                        <CardMedia
                          component="img"
                          image={previewUrls[index]}
                          alt={file.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setModalImage(previewUrls[index]);
                            setShowModal(true);
                          }}
                        />
                      ) : (
                        <Box textAlign="center" p={2}>
                          {getFileIcon(fileType)}
                          <Typography variant="caption" display="block" noWrap sx={{ maxWidth: 100 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* 액션 버튼 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          display: 'flex',
                          gap: 0.5,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          borderRadius: 1,
                          p: 0.5,
                        }}
                      >
                        {!isImage && (
                          <IconButton size="small" onClick={() => downloadFile(file)}>
                            <IconDownload size={16} />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => removeFile(index)}>
                          <IconX size={16} />
                        </IconButton>
                      </Box>
                    </Card>
                  </ImageListItem>
                );
              })}
              
              {/* 추가 버튼 */}
              {currentFiles.length < maxFiles && (
                <ImageListItem>
                  <Card
                    {...getRootProps()}
                    sx={{
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: 'grey.50',
                      border: '2px dashed',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <input {...getInputProps()} />
                    <Box textAlign="center">
                      <IconPlus size={32} style={{ opacity: 0.6 }} />
                      <Typography variant="caption" display="block">
                        파일 추가
                      </Typography>
                    </Box>
                  </Card>
                </ImageListItem>
              )}
            </ImageList>

            {/* 파일 개수 표시 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="body2" color="text.secondary">
                {currentFiles.length}/{maxFiles} 파일
              </Typography>
              {currentFiles.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onFilesChange([])}
                >
                  모두 제거
                </Button>
              )}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* 이미지 모달 */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}
          >
            <IconX />
          </IconButton>
          {modalImage && (
            <Box
              component="img"
              src={modalImage}
              alt="Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}