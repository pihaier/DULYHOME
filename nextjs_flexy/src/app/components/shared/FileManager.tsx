'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Modal,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

interface FileManagerProps {
  reservationNumber: string;
  fileCategory?: 'documents' | 'images' | 'reports' | 'all';
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onFilesChange?: (files: FileInfo[]) => void;
  readOnly?: boolean;
  showUploadButton?: boolean;
}

export default function FileManager({
  reservationNumber,
  fileCategory = 'all',
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  onFilesChange,
  readOnly = false,
  showUploadButton = true,
}: FileManagerProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load existing files
  React.useEffect(() => {
    loadFiles();
  }, [reservationNumber, fileCategory]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      let query = supabase
        .from('uploaded_files')
        .select('*')
        .eq('reservation_number', reservationNumber)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (fileCategory !== 'all') {
        query = query.eq('upload_purpose', fileCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const fileList: FileInfo[] = (data || []).map((file) => ({
        id: file.id,
        name: file.original_filename,
        size: file.file_size,
        type: file.mime_type,
        url: file.file_path,
        uploadedAt: new Date(file.created_at),
        uploadedBy: file.uploaded_by,
      }));

      setFiles(fileList);
      onFilesChange?.(fileList);
    } catch (err) {
      setError('파일 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Check file count limit
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const supabase = createClient();
      const uploadedFiles: FileInfo[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`${file.name}의 크기가 ${maxFileSize}MB를 초과합니다.`);
          continue;
        }

        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${reservationNumber}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('order-files').getPublicUrl(fileName);

        // Save file info to database
        const { data: fileRecord, error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            reservation_number: reservationNumber,
            original_filename: file.name,
            file_path: publicUrl,
            file_size: file.size,
            file_type: fileCategory,
            mime_type: file.type,
            upload_purpose: fileCategory === 'all' ? 'documents' : fileCategory,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        uploadedFiles.push({
          id: fileRecord.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          uploadedAt: new Date(fileRecord.created_at),
        });

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      // Update files list
      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();

      // Soft delete in database
      const { error } = await supabase
        .from('uploaded_files')
        .update({ is_deleted: true })
        .eq('id', fileId);

      if (error) throw error;

      // Update local state
      const newFiles = files.filter((f) => f.id !== fileId);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    } catch (err) {
      setError('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFilePreview = (file: FileInfo) => {
    if (file.type.startsWith('image/')) {
      setPreviewUrl(file.url);
      setPreviewOpen(true);
    } else {
      // For non-image files, open in new tab
      window.open(file.url, '_blank');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType === 'application/pdf') return <PdfIcon />;
    if (mimeType.includes('word') || mimeType.includes('doc')) return <DocIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!readOnly && showUploadButton && (
        <Box sx={{ mb: 2 }}>
          <input
            accept={allowedTypes.join(',')}
            style={{ display: 'none' }}
            id="file-upload-button"
            multiple
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload-button">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading || files.length >= maxFiles}
            >
              파일 업로드 ({files.length}/{maxFiles})
            </Button>
          </label>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary">
                업로드 중... {uploadProgress.toFixed(0)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {files.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">업로드된 파일이 없습니다.</Typography>
        </Paper>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem key={file.id} divider>
              <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${formatFileSize(file.size)} • ${new Date(file.uploadedAt).toLocaleDateString('ko-KR')}`}
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" onClick={() => handleFilePreview(file)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => window.open(file.url, '_blank')}
                    size="small"
                  >
                    <DownloadIcon />
                  </IconButton>
                  {!readOnly && (
                    <IconButton
                      edge="end"
                      onClick={() => handleFileDelete(file.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="image-preview"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="File preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
