'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import FileUploadCarousel from './FileUploadCarousel';
import {
  samplingSchema,
  type SamplingFormData,
  type SamplingResponse,
} from '@/lib/schemas/sampling';

// Material UI Components
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
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
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  Send as SendIcon,
  Upload as UploadIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface SamplingFormProps {
  onSuccess?: (data: { reservationNumber: string; orderId: string }) => void;
}

const steps = ['제품 정보', '배송 방법', '통관 정보', '확인 및 제출'];

export function SamplingForm({ onSuccess }: SamplingFormProps) {
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
  } = useForm<SamplingFormData>({
    resolver: zodResolver(samplingSchema),
    defaultValues: {
      productName: '',
      productNameChinese: '',
      sampleQuantity: 1,
      requirements: '',
      requestFiles: [],
      shippingMethod: 'partner',
      customsType: 'personal',
      personalName: '',
      personalCustomsCode: '',
      businessName: '',
      businessNumber: '',
      koreaShippingAddress: '',
      koreaReceiverName: '',
      koreaReceiverPhone: '',
      chinaAddress: '',
      chinaReceiverName: '',
      chinaReceiverPhone: '',
    },
  });

  const shippingMethod = watch('shippingMethod');
  const customsType = watch('customsType');

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    switch (activeStep) {
      case 0:
        fieldsToValidate = ['productName', 'sampleQuantity', 'requirements'];
        break;
      case 1:
        fieldsToValidate = ['shippingMethod'];
        if (shippingMethod === 'direct') {
          fieldsToValidate.push('koreaShippingAddress', 'koreaReceiverName', 'koreaReceiverPhone');
        }
        break;
      case 2:
        fieldsToValidate = ['customsType'];
        if (customsType === 'personal') {
          fieldsToValidate.push('personalName', 'personalCustomsCode');
        } else {
          fieldsToValidate.push('businessName', 'businessNumber');
        }
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

  const onSubmit = async (data: SamplingFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // 텍스트 데이터
      formData.append('productName', data.productName);
      if (data.productNameChinese) formData.append('productNameChinese', data.productNameChinese);
      formData.append('sampleQuantity', data.sampleQuantity.toString());
      formData.append('requirements', data.requirements);
      formData.append('shippingMethod', data.shippingMethod);
      formData.append('customsType', data.customsType);

      if (data.customsType === 'personal') {
        formData.append('personalName', data.personalName || '');
        formData.append('personalCustomsCode', data.personalCustomsCode || '');
      } else {
        formData.append('businessName', data.businessName || '');
        formData.append('businessNumber', data.businessNumber || '');
      }

      if (data.shippingMethod === 'direct') {
        formData.append('koreaShippingAddress', data.koreaShippingAddress || '');
        formData.append('koreaReceiverName', data.koreaReceiverName || '');
        formData.append('koreaReceiverPhone', data.koreaReceiverPhone || '');
      }

      if (data.chinaAddress) formData.append('chinaAddress', data.chinaAddress);
      if (data.chinaReceiverName) formData.append('chinaReceiverName', data.chinaReceiverName);
      if (data.chinaReceiverPhone) formData.append('chinaReceiverPhone', data.chinaReceiverPhone);

      // 파일 데이터
      data.requestFiles.forEach((file) => {
        formData.append('requestFiles', file);
      });

      const response = await fetch('/api/sampling', {
        method: 'POST',
        body: formData,
      });

      const result: SamplingResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '샘플링 신청 중 오류가 발생했습니다.');
      }

      toast.success('샘플링 신청이 완료되었습니다!');

      if (onSuccess && result.data) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : '샘플링 신청 중 오류가 발생했습니다.');
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
                  label="제품명 (한국어)"
                  {...register('productName')}
                  error={!!errors.productName}
                  helperText={
                    errors.productName?.message || '샘플링을 원하는 제품명을 입력해주세요'
                  }
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="제품명 (중국어) - 선택"
                  {...register('productNameChinese')}
                  helperText="중국어 제품명을 알고 있다면 입력해주세요"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="sampleQuantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="샘플 수량"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      error={!!errors.sampleQuantity}
                      helperText={
                        errors.sampleQuantity?.message || '원하시는 샘플 수량을 입력해주세요'
                      }
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="요청사항"
                  {...register('requirements')}
                  error={!!errors.requirements}
                  helperText={
                    errors.requirements?.message ||
                    '제품 사양, 색상, 사이즈 등 상세 요청사항을 입력해주세요 (최소 10자)'
                  }
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom>
                  참고 자료 업로드 (선택)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  제품 이미지, 도면, 사양서 등을 업로드해주세요
                </Typography>
                <Controller
                  name="requestFiles"
                  control={control}
                  render={({ field }) => (
                    <FileUploadCarousel
                      currentFiles={field.value}
                      onFilesChange={field.onChange}
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024}
                      label="참고 자료"
                      description="JPG, PNG, PDF, DOC, XLS 형식 지원"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Controller
              name="shippingMethod"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">배송 방법 선택</FormLabel>
                  <RadioGroup {...field}>
                    <FormControlLabel
                      value="partner"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">협력업체 배송</Typography>
                          <Typography variant="body2" color="text.secondary">
                            중국 협력업체에서 직접 한국으로 배송 (추천)
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="direct"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">직접 배송</Typography>
                          <Typography variant="body2" color="text.secondary">
                            고객님이 지정한 한국 주소로 배송
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />

            {shippingMethod === 'direct' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    한국 배송지 정보
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="배송 주소"
                    {...register('koreaShippingAddress')}
                    error={!!errors.koreaShippingAddress}
                    helperText={errors.koreaShippingAddress?.message}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="수령인 이름"
                    {...register('koreaReceiverName')}
                    error={!!errors.koreaReceiverName}
                    helperText={errors.koreaReceiverName?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="수령인 연락처"
                    {...register('koreaReceiverPhone')}
                    error={!!errors.koreaReceiverPhone}
                    helperText={errors.koreaReceiverPhone?.message}
                    placeholder="010-0000-0000"
                  />
                </Grid>
              </Grid>
            )}

            <Box mt={3}>
              <Typography variant="body2" color="text.secondary">
                ℹ️ 중국 현지 배송지 정보는 선택사항입니다. 필요한 경우에만 입력해주세요.
              </Typography>
              <Grid container spacing={3} mt={1}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="중국 배송 주소 (선택)"
                    {...register('chinaAddress')}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="중국 수령인 이름 (선택)"
                    {...register('chinaReceiverName')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="중국 수령인 연락처 (선택)"
                    {...register('chinaReceiverPhone')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Controller
              name="customsType"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">통관 구분</FormLabel>
                  <RadioGroup {...field}>
                    <FormControlLabel
                      value="personal"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">개인통관</Typography>
                          <Typography variant="body2" color="text.secondary">
                            개인용도로 수입하는 경우
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="business"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">사업자통관</Typography>
                          <Typography variant="body2" color="text.secondary">
                            사업용도로 수입하는 경우
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />

            {customsType === 'personal' ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="이름"
                    {...register('personalName')}
                    error={!!errors.personalName}
                    helperText={errors.personalName?.message || '개인통관고유부호에 등록된 이름'}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="개인통관고유부호"
                    {...register('personalCustomsCode')}
                    error={!!errors.personalCustomsCode}
                    helperText={errors.personalCustomsCode?.message || 'P로 시작하는 12자리 번호'}
                    placeholder="P000000000000"
                  />
                </Grid>
                <Grid size={12}>
                  <Alert severity="info">
                    개인통관고유부호는 관세청 홈페이지에서 발급받을 수 있습니다.
                  </Alert>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="사업자명"
                    {...register('businessName')}
                    error={!!errors.businessName}
                    helperText={errors.businessName?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="사업자등록번호"
                    {...register('businessNumber')}
                    error={!!errors.businessNumber}
                    helperText={errors.businessNumber?.message || '하이픈(-) 없이 입력'}
                    placeholder="0000000000"
                  />
                </Grid>
              </Grid>
            )}
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
              {/* 제품 정보 */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <InventoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    제품 정보
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        제품명
                      </Typography>
                      <Typography variant="body1">{formData.productName}</Typography>
                      {formData.productNameChinese && (
                        <Typography variant="body2" color="text.secondary">
                          {formData.productNameChinese}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        샘플 수량
                      </Typography>
                      <Typography variant="body1">{formData.sampleQuantity}개</Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">
                        요청사항
                      </Typography>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {formData.requirements}
                      </Typography>
                    </Grid>
                    {formData.requestFiles.length > 0 && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          첨부파일
                        </Typography>
                        <Typography variant="body1">
                          {formData.requestFiles.length}개 파일
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* 배송 정보 */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ShippingIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    배송 정보
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">
                        배송 방법
                      </Typography>
                      <Typography variant="body1">
                        {formData.shippingMethod === 'partner' ? '협력업체 배송' : '직접 배송'}
                      </Typography>
                    </Grid>
                    {formData.shippingMethod === 'direct' && (
                      <>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">
                            한국 배송지
                          </Typography>
                          <Typography variant="body1">{formData.koreaShippingAddress}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            수령인
                          </Typography>
                          <Typography variant="body1">{formData.koreaReceiverName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            연락처
                          </Typography>
                          <Typography variant="body1">{formData.koreaReceiverPhone}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* 통관 정보 */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formData.customsType === 'personal' ? (
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    ) : (
                      <BusinessIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    )}
                    통관 정보
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">
                        통관 구분
                      </Typography>
                      <Typography variant="body1">
                        {formData.customsType === 'personal' ? '개인통관' : '사업자통관'}
                      </Typography>
                    </Grid>
                    {formData.customsType === 'personal' ? (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            이름
                          </Typography>
                          <Typography variant="body1">{formData.personalName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            개인통관고유부호
                          </Typography>
                          <Typography variant="body1">{formData.personalCustomsCode}</Typography>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            사업자명
                          </Typography>
                          <Typography variant="body1">{formData.businessName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            사업자등록번호
                          </Typography>
                          <Typography variant="body1">{formData.businessNumber}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* 비용 안내 */}
              <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    서비스 수수료
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    ₩50,000
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    * 샘플 비용은 견적 확인 후 별도 안내드립니다.
                  </Typography>
                </CardContent>
              </Card>
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
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} />
                      ) : index === steps.length - 1 ? (
                        <SendIcon />
                      ) : (
                        <NextIcon />
                      )
                    }
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {isSubmitting ? '제출 중...' : index === steps.length - 1 ? '신청하기' : '다음'}
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
