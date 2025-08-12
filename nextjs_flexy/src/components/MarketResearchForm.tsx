'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import FileUploadCarousel from './FileUploadCarousel';
import { 
  marketResearchSchema, 
  type MarketResearchFormData,
  type MarketResearchResponse 
} from '@/lib/schemas/market-research';

// Material UI Components
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  Stack,
} from '@mui/material';
import {
  Send as SendIcon,
  Upload as UploadIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
} from '@mui/icons-material';

interface MarketResearchFormProps {
  onSuccess?: (data: { reservationNumber: string; applicationId: string }) => void;
}

const steps = [
  '제품 정보',
  '요청사항',
  '부가 서비스',
  '확인 및 제출'
];

export function MarketResearchForm({ onSuccess }: MarketResearchFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<MarketResearchFormData>({
    resolver: zodResolver(marketResearchSchema),
    defaultValues: {
      productName: '',
      researchQuantity: 1,
      requirements: '',
      photos: [],
      detailPage: '',
      logoRequired: false,
      logoFile: [],
      logoPrintDetails: '',
      customBoxRequired: false,
      boxDesignFile: [],
    },
  });

  const logoRequired = watch('logoRequired');
  const customBoxRequired = watch('customBoxRequired');

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['productName', 'researchQuantity', 'photos'];
        break;
      case 1:
        fieldsToValidate = ['requirements', 'detailPage'];
        break;
      case 2:
        fieldsToValidate = logoRequired ? ['logoFile', 'logoPrintDetails'] : [];
        fieldsToValidate = [...fieldsToValidate, ...(customBoxRequired ? ['boxDesignFile'] : [])];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: MarketResearchFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // 텍스트 데이터
      formData.append('productName', data.productName);
      formData.append('researchQuantity', data.researchQuantity.toString());
      formData.append('requirements', data.requirements);
      if (data.detailPage) formData.append('detailPage', data.detailPage);
      formData.append('logoRequired', data.logoRequired.toString());
      if (data.logoPrintDetails) formData.append('logoPrintDetails', data.logoPrintDetails);
      formData.append('customBoxRequired', data.customBoxRequired.toString());

      // 파일 데이터
      data.photos.forEach((file) => {
        formData.append('photos', file);
      });
      
      if (data.logoFile) {
        data.logoFile.forEach((file) => {
          formData.append('logoFiles', file);
        });
      }
      
      if (data.boxDesignFile) {
        data.boxDesignFile.forEach((file) => {
          formData.append('boxDesignFiles', file);
        });
      }

      const response = await fetch('/api/market-research', {
        method: 'POST',
        body: formData,
      });

      const result: MarketResearchResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '시장조사 신청 중 오류가 발생했습니다.');
      }

      toast.success('시장조사 신청이 완료되었습니다!');
      
      if (onSuccess && result.data) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : '시장조사 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="제품명"
                  {...register('productName')}
                  error={!!errors.productName}
                  helperText={errors.productName?.message || '시장조사를 원하는 제품명을 입력해주세요'}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="researchQuantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="조사 수량"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      error={!!errors.researchQuantity}
                      helperText={errors.researchQuantity?.message || '중국에서 구매할 예상 수량을 입력해주세요'}
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>
              
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom>
                  제품 사진 업로드 *
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  제품을 잘 보여주는 사진을 1~5장 업로드해주세요
                </Typography>
                <Controller
                  name="photos"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <FileUploadCarousel
                        currentFiles={field.value}
                        onFilesChange={field.onChange}
                        maxFiles={5}
                        maxSize={10 * 1024 * 1024}
                        label="제품 사진"
                        description="JPG, PNG, GIF 형식 지원"
                        required
                        error={errors.photos?.message}
                      />
                      {errors.photos && (
                        <FormHelperText error>{errors.photos.message}</FormHelperText>
                      )}
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="요청사항"
                  {...register('requirements')}
                  error={!!errors.requirements}
                  helperText={errors.requirements?.message || '조사시 참고할 상세 요청사항을 입력해주세요 (최소 10자)'}
                />
              </Grid>
              
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="상세페이지 URL (선택)"
                  {...register('detailPage')}
                  error={!!errors.detailPage}
                  helperText={errors.detailPage?.message || '참고할 상품 상세페이지가 있다면 입력해주세요'}
                  placeholder="https://example.com/product/123"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Stack spacing={3}>
              {/* 로고 인쇄 */}
              <Card variant="outlined">
                <CardContent>
                  <Controller
                    name="logoRequired"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1">로고 인쇄 필요</Typography>
                            <Typography variant="body2" color="text.secondary">
                              제품에 로고를 인쇄해야 하는 경우 선택하세요
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                  
                  {logoRequired && (
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <Typography variant="body2" gutterBottom>
                            로고 파일 업로드
                          </Typography>
                          <Controller
                            name="logoFile"
                            control={control}
                            render={({ field }) => (
                              <FileUploadCarousel
                                currentFiles={field.value}
                                onFilesChange={field.onChange}
                                maxFiles={5}
                                maxSize={10 * 1024 * 1024}
                                label="로고 파일"
                                description="JPG, PNG, PDF 형식 지원"
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="로고 인쇄 상세 정보"
                            {...register('logoPrintDetails')}
                            placeholder="인쇄 위치, 크기, 색상 등을 자세히 적어주세요"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* 박스 제작 */}
              <Card variant="outlined">
                <CardContent>
                  <Controller
                    name="customBoxRequired"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1">박스 제작 필요</Typography>
                            <Typography variant="body2" color="text.secondary">
                              맞춤형 박스 제작이 필요한 경우 선택하세요
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                  
                  {customBoxRequired && (
                    <Box mt={2}>
                      <Typography variant="body2" gutterBottom>
                        박스 디자인 파일 업로드
                      </Typography>
                      <Controller
                        name="boxDesignFile"
                        control={control}
                        render={({ field }) => (
                          <FileUploadCarousel
                            currentFiles={field.value}
                            onFilesChange={field.onChange}
                            maxFiles={5}
                            maxSize={10 * 1024 * 1024}
                            label="박스 디자인 파일"
                            description="JPG, PNG, PDF 형식 지원"
                          />
                        )}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        );
        
      case 3:
        const formData = watch();
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              신청 내용을 최종 확인해주세요. 제출 후에는 수정이 어려울 수 있습니다.
            </Alert>
            
            <Stack spacing={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>제품 정보</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">제품명</Typography>
                      <Typography variant="body1">{formData.productName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">조사 수량</Typography>
                      <Typography variant="body1">{formData.researchQuantity}개</Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">업로드된 사진</Typography>
                      <Typography variant="body1">{formData.photos.length}개</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>요청사항</Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {formData.requirements}
                  </Typography>
                  {formData.detailPage && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">참고 URL</Typography>
                      <Typography variant="body1">{formData.detailPage}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              {(formData.logoRequired || formData.customBoxRequired) && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>부가 서비스</Typography>
                    <Stack spacing={2}>
                      {formData.logoRequired && (
                        <Box>
                          <Typography variant="body1">✓ 로고 인쇄 요청</Typography>
                          <Typography variant="body2" color="text.secondary">
                            파일 {formData.logoFile.length}개 업로드
                          </Typography>
                        </Box>
                      )}
                      {formData.customBoxRequired && (
                        <Box>
                          <Typography variant="body1">✓ 박스 제작 요청</Typography>
                          <Typography variant="body2" color="text.secondary">
                            파일 {formData.boxDesignFile.length}개 업로드
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box mt={2} mb={3}>
                  {getStepContent(index)}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : (index === steps.length - 1 ? <SendIcon /> : <NextIcon />)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {isSubmitting ? '제출 중...' : (index === steps.length - 1 ? '신청하기' : '다음')}
                  </Button>
                  <Button
                    disabled={index === 0 || isSubmitting}
                    onClick={handleBack}
                    startIcon={<BackIcon />}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    이전
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
}