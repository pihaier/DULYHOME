'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  InputAdornment,
  LinearProgress,
  Fade,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  Storage as StorageIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface HSCodeRecommendation {
  hs_code: string;
  name_ko: string;
  name_en: string;
  category_name?: string;
  reason?: string;
  rank: number;
}

interface Props {
  onSelectHsCode?: (code: string, description: string) => void;
  onReset?: () => void;
  onNotify?: (message: string, severity: 'success' | 'error' | 'info') => void;
}

interface SearchExplanation {
  exact_match: boolean;
  difference?: string | null;
  tip?: string;
  similar_products?: string[];
}

interface StepProgress {
  step: number;
  selected?: string;
  description?: string;
  message?: string;
  reason?: string;
  candidates?: string[];
}

export function HSCodeSimpleSearch({ onSelectHsCode, onReset, onNotify }: Props) {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<HSCodeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<SearchExplanation | null>(null);

  // 단계별 진행 상황 state
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [currentStepInfo, setCurrentStepInfo] = useState<string>('');

  // 전체 10자리 코드 목록과 평가
  const [allItems, setAllItems] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  // AbortController를 위한 ref
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const steps = ['97개 류(Chapter) 선택', '4자리 호(Heading) 선택', '10자리 세번(Item) 최종 선택'];

  // SSE를 사용한 검색 실행
  const handleSearchWithSSE = async () => {
    if (query.length < 2) {
      onNotify?.('검색어를 2자 이상 입력해주세요', 'error');
      return;
    }

    // 이미 로딩 중이면 무시
    if (loading) {
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setRecommendations([]);
    setSelectedCode(null);
    setActiveStep(0);
    setStepProgress([]);
    setCurrentStepInfo('');
    setAllItems([]);
    setEvaluations([]);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/hs-code-classifier`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            productName: query,
            stream: true, // SSE 스트리밍 모드 활성화
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('검색 요청 실패');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('스트림 읽기 실패');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 마지막 불완전한 줄은 버퍼에 남김

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  // 분류 시작
                  break;

                case 'step':
                  if (data.data && typeof data.data.step === 'number') {
                    setActiveStep(data.data.step - 1);
                    setCurrentStepInfo(data.data.description || '');
                  }
                  break;

                case 'info':
                  setCurrentStepInfo((prev) => `${prev} - ${data.data.message}`);
                  break;

                case 'progress':
                  if (data.data && typeof data.data.step === 'number') {
                    const progressData = data.data as StepProgress;
                    // 중복 방지 - 같은 step이 이미 있으면 업데이트만
                    setStepProgress((prev) => {
                      const existing = prev.findIndex((p) => p.step === progressData.step);
                      if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = progressData;
                        return updated;
                      }
                      return [...prev, progressData];
                    });
                    setActiveStep(progressData.step);

                    // 3단계에서 전체 10자리 목록 저장
                    if (progressData.step === 3 && data.data.allItems) {
                      setAllItems(data.data.allItems);
                    }
                    if (progressData.step === 3 && data.data.evaluations) {
                      setEvaluations(data.data.evaluations);
                    }

                    onNotify?.(progressData.message || `${progressData.step}단계 완료`, 'info');
                  }
                  break;

                case 'complete':
                  // 최종 결과 처리
                  handleCompleteResult(data.data);
                  break;

                case 'error':
                  throw new Error(data.data.message);
              }
            } catch (err) {
              // 데이터 파싱 오류
            }
          }
        }
      }
    } catch (error: any) {
      // AbortError는 무시
      if (error?.name !== 'AbortError') {
        onNotify?.('검색 중 오류가 발생했습니다', 'error');
      }
    } finally {
      setLoading(false);
      setCurrentStepInfo('');
      abortControllerRef.current = null;
    }
  };

  // 완료 결과 처리
  const handleCompleteResult = (data: any) => {
    if (data?.hsCode) {
      let formattedRecommendations = [];

      // 상위 5개 추천 (중복 제거)
      const seenCodes = new Set<string>();
      if (data.candidates && data.candidates.length > 0) {
        formattedRecommendations = data.candidates
          .filter((candidate: any) => {
            if (seenCodes.has(candidate.hsCode)) return false;
            seenCodes.add(candidate.hsCode);
            return true;
          })
          .slice(0, 5) // 최대 5개만
          .map((candidate: any, index: number) => ({
            hs_code: candidate.hsCode,
            name_ko: candidate.description || '',
            name_en: '',
            category_name:
              candidate.rank === 1
                ? '1순위'
                : candidate.rank === 2
                  ? '2순위'
                  : candidate.rank === 3
                    ? '3순위'
                    : `대안 ${index}`,
            reason: candidate.reason || (index === 0 ? '최우선 추천' : '대체 가능'),
            rank: candidate.rank || index + 1,
          }));
      } else {
        formattedRecommendations = [
          {
            hs_code: data.hsCode,
            name_ko: data.description || '',
            name_en: '',
            category_name: '1순위',
            reason: data.reason || '최적 매칭',
            rank: 1,
          },
        ];
      }

      // 모든 10자리 코드와 평가 저장 (있는 경우)
      if (data.allItems) {
        setAllItems(data.allItems);
      }

      if (data.evaluations) {
        setEvaluations(data.evaluations);
      }

      setRecommendations(formattedRecommendations);

      if (data.hierarchy) {
        const hierarchy = data.hierarchy;
        // 3단계 분류로 업데이트
        const pathParts = [`${hierarchy.chapter}류`, `${hierarchy.heading}호`, `${data.hsCode}`];
        setExplanation({
          exact_match: false,
          difference: `분류 경로: ${pathParts.join(' → ')}`,
          tip: `GPT-5 모델이 3단계 분류를 수행했습니다`,
          similar_products: [],
        });
      }

      onNotify?.(`HS코드 ${data.hsCode}를 찾았습니다`, 'success');
    } else {
      onNotify?.('검색 결과가 없습니다. 다른 검색어를 시도해보세요.', 'info');
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearchWithSSE();
    }
  };

  // 항목 선택
  const handleSelect = (recommendation: HSCodeRecommendation) => {
    setSelectedCode(recommendation.hs_code);
    if (onSelectHsCode) {
      onSelectHsCode(recommendation.hs_code, recommendation.name_ko);
    }
    onNotify?.(`HS코드 ${recommendation.hs_code} 선택됨`, 'success');
  };

  // 초기화
  const handleReset = () => {
    setQuery('');
    setRecommendations([]);
    setSelectedCode(null);
    setActiveStep(0);
    setStepProgress([]);
    setAllItems([]);
    setEvaluations([]);
    if (onReset) {
      onReset();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 검색 입력 영역 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="제품명을 입력해주세요 (예: 음료수, 커피, 면봉, 노트북 등)"
          disabled={loading}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSearchWithSSE}
            disabled={loading || query.length < 2}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            size="large"
            sx={{ minWidth: 150 }}
          >
            {loading ? 'AI 분석 중...' : 'HS코드 검색'}
          </Button>
          {(recommendations.length > 0 || stepProgress.length > 0) && (
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
              size="large"
            >
              초기화
            </Button>
          )}
        </Stack>
      </Box>

      {/* 실시간 단계별 진행 상황 표시 */}
      {loading && (
        <Fade in={loading}>
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PsychologyIcon color="primary" sx={{ animation: 'pulse 2s infinite' }} />
                  <Typography variant="h6" color="primary">
                    GPT-5 AI가 제품 "{query}"를 분석 중입니다
                  </Typography>
                </Stack>

                {/* 단계별 진행 표시 */}
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label, index) => {
                    const stepData = stepProgress.find((p) => p && p.step === index + 1);
                    return (
                      <Step key={label}>
                        <StepLabel
                          optional={
                            stepData && (
                              <Typography variant="caption" color="success.main">
                                ✅ {stepData.selected} - {stepData.description}
                              </Typography>
                            )
                          }
                        >
                          {label}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {index === activeStep - 1 && currentStepInfo}
                          </Typography>
                          {stepData?.candidates &&
                            Array.isArray(stepData.candidates) &&
                            stepData.candidates.length > 1 && (
                              <Typography variant="caption" color="info.main">
                                후보: {stepData.candidates.join(', ')}
                              </Typography>
                            )}
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* 검색 완료 후 진행 경로 표시 */}
      {!loading && stepProgress.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 AI 분류 경로
            </Typography>
            <Stack spacing={1}>
              {stepProgress.map((step, index) =>
                step && step.step ? (
                  <Stack key={index} direction="column" spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${step.step}단계`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        <strong>{step.selected}</strong> - {step.description}
                      </Typography>
                    </Stack>
                    {step.step === 3 && step.reason && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 8 }}>
                        💡 최종 선택 이유: {step.reason}
                      </Typography>
                    )}
                  </Stack>
                ) : null
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 검색 결과 */}
      {recommendations.length > 0 && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            <Typography variant="body2" fontWeight={600}>
              "{query}"에 대한 상위 추천 HS코드 {recommendations.length}개
            </Typography>
          </Alert>

          <Card variant="outlined" sx={{ boxShadow: 2 }}>
            <List sx={{ p: 0 }}>
              {recommendations.map((rec, idx) => (
                <React.Fragment key={`${rec.hs_code}-${idx}`}>
                  <ListItemButton
                    onClick={() => handleSelect(rec)}
                    selected={selectedCode === rec.hs_code}
                    sx={{
                      py: 2.5,
                      px: 3,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                        '&:hover': {
                          bgcolor: 'primary.100',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip
                            label={
                              rec.rank === 1
                                ? '🏆 최종추천'
                                : rec.rank === 2
                                  ? '🥈 대안1'
                                  : rec.rank === 3
                                    ? '🥉 대안2'
                                    : `대안${rec.rank - 1}`
                            }
                            size="small"
                            color={
                              rec.rank === 1
                                ? 'success'
                                : rec.rank === 2
                                  ? 'primary'
                                  : rec.rank === 3
                                    ? 'secondary'
                                    : 'default'
                            }
                            variant={rec.rank === 1 ? 'filled' : 'outlined'}
                            sx={{
                              minWidth: rec.rank <= 3 ? 90 : 60,
                              fontWeight: 'bold',
                              animation: rec.rank === 1 ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.05)' },
                                '100%': { transform: 'scale(1)' },
                              },
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="span" fontWeight={600}>
                              {rec.hs_code}
                            </Typography>
                            {rec.name_ko && (
                              <Typography variant="body1" component="span" sx={{ ml: 2 }}>
                                {rec.name_ko}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {rec.reason && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5, fontStyle: 'italic' }}
                            >
                              💡 선택 이유: {rec.reason}
                            </Typography>
                          )}
                          {selectedCode === rec.hs_code && (
                            <Chip
                              label="✓ 선택됨"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {idx < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Box>
      )}
    </Box>
  );
}
