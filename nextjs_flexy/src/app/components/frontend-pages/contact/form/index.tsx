'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  MenuItem,
  Button,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CustomFormLabel from '../../../forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../../forms/theme-elements/CustomTextField';
import CustomSelect from '../../../forms/theme-elements/CustomSelect';
import Address from './Address';
import GoogleMap from './GoogleMap';
import { IconX, IconUpload } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

const numbers = [
  {
    value: 'market-research',
    label: '시장조사 문의',
  },
  {
    value: 'factory-contact',
    label: '공장컨택 문의',
  },
  {
    value: 'inspection',
    label: '검품감사 문의',
  },
  {
    value: 'general',
    label: '일반 문의',
  },
];

const Form = () => {
  const [inquiryType, setInquiryType] = React.useState('general');
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const supabase = createClient();

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleChange3 = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInquiryType(event.target.value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 유효성 검사
      if (!formData.name || !formData.phone || !formData.email || !formData.message) {
        alert('필수 항목을 모두 입력해주세요.');
        setLoading(false);
        return;
      }

      // 파일 업로드 (있는 경우)
      const uploadedFileUrls = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `contact/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('uploads').getPublicUrl(fileName);

          uploadedFileUrls.push({
            filename: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type,
          });
        }
      }

      // contact_inquiries 테이블에 저장
      const { error: insertError } = await supabase.from('contact_inquiries').insert({
        name: formData.name,
        company_name: formData.company_name,
        phone: formData.phone,
        email: formData.email,
        inquiry_type: inquiryType,
        message: formData.message,
        files: uploadedFileUrls,
      });

      if (insertError) throw insertError;

      setShowSuccessModal(true);

      // 폼 초기화
      setFormData({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        message: '',
      });
      setInquiryType('general');
      setUploadedFiles([]);
    } catch (error) {
      console.error('문의 전송 중 오류:', error);
      alert('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          paddingTop: {
            xs: '40px',
            lg: '60px',
          },
          paddingBottom: {
            xs: '40px',
            lg: '90px',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid
              alignItems="center"
              size={{
                xs: 12,
                lg: 8,
              }}
            >
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3} justifyContent="center">
                  <Grid
                    alignItems="center"
                    size={{
                      xs: 12,
                      lg: 6,
                    }}
                  >
                    <CustomFormLabel htmlFor="fname" sx={{ mt: 0 }}>
                      이름 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="fname"
                      placeholder="이름을 입력하세요"
                      fullWidth
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid
                    alignItems="center"
                    size={{
                      xs: 12,
                      lg: 6,
                    }}
                  >
                    <CustomFormLabel htmlFor="lname" sx={{ mt: 0 }}>
                      회사명
                    </CustomFormLabel>
                    <CustomTextField
                      id="lname"
                      placeholder="회사명을 입력하세요"
                      fullWidth
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </Grid>
                  <Grid
                    alignItems="center"
                    size={{
                      xs: 12,
                      lg: 6,
                    }}
                  >
                    <CustomFormLabel htmlFor="phone" sx={{ mt: 0 }}>
                      연락처 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="phone"
                      placeholder="010-0000-0000"
                      fullWidth
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid
                    alignItems="center"
                    size={{
                      xs: 12,
                      lg: 6,
                    }}
                  >
                    <CustomFormLabel htmlFor="txt-email" sx={{ mt: 0 }}>
                      이메일 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="txt-email"
                      placeholder="이메일 주소를 입력하세요"
                      fullWidth
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid alignItems="center" size={12}>
                    <CustomFormLabel htmlFor="txt-enquire" sx={{ mt: 0 }}>
                      문의 유형 *
                    </CustomFormLabel>
                    <CustomSelect
                      fullWidth
                      id="txt-enquire"
                      variant="outlined"
                      value={inquiryType}
                      onChange={handleChange3}
                    >
                      {numbers.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </Grid>
                  <Grid alignItems="center" size={12}>
                    <CustomFormLabel htmlFor="txt-message" sx={{ mt: 0 }}>
                      문의 내용 *
                    </CustomFormLabel>
                    <CustomTextField
                      id="txt-message"
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="문의하실 내용을 자세히 작성해주세요..."
                      fullWidth
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid alignItems="center" size={12}>
                    <CustomFormLabel sx={{ mt: 0 }}>파일 첨부</CustomFormLabel>
                    <Box>
                      <input
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        style={{ display: 'none' }}
                        id="file-upload"
                        multiple
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outlined" component="span" startIcon={<IconUpload />}>
                          파일 선택
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        지원 형식: 이미지, PDF, DOC, DOCX, XLS, XLSX (최대 10MB)
                      </Typography>
                      {uploadedFiles.length > 0 && (
                        <List sx={{ mt: 2 }}>
                          {uploadedFiles.map((file, index) => (
                            <ListItem key={index} sx={{ pl: 0, pr: 6 }}>
                              <ListItemText
                                primary={file.name}
                                secondary={`${(file.size / 1024).toFixed(2)} KB`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={() => handleRemoveFile(index)}
                                  size="small"
                                >
                                  <IconX size={18} />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Grid>
                  <Grid alignItems="center" size={12}>
                    <Button variant="contained" size="large" type="submit" disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : '문의하기'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid
              alignItems="center"
              size={{
                xs: 12,
                lg: 4,
              }}
            >
              <Stack spacing={3}>
                <Address />
                <GoogleMap />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <DialogTitle>문의가 접수되었습니다!</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            문의가 성공적으로 접수되었습니다.
            <br />
            빠른 시일 내에 답변 드리겠습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccessModal(false)} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Form;
