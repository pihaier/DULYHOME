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

export function HSCodeSimpleSearch({ onSelectHsCode, onReset, onNotify }: Props) {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<HSCodeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [explanation, setExplanation] = useState<SearchExplanation | null>(null);

  // AI 생각 메시지 업데이트
  useEffect(() => {
    if (loading && thinkingStep > 0) {
      const messages = [
        '🤔 제품명을 분석하고 있습니다... (약 5초)',
        '🔍 관세청 데이터베이스를 검색하고 있습니다... (약 10초)',
        '🎯 가장 적합한 HS코드를 매칭하고 있습니다... (약 15초)',
        '✨ 결과를 검증하고 정리하고 있습니다... (약 20초)',
      ];
      setThinkingMessage(messages[Math.min(thinkingStep - 1, messages.length - 1)]);
    }
  }, [loading, thinkingStep]);

  // 검색 실행 (GPT-5 Tool Calling 사용)
  const handleSearch = async () => {
    if (query.length < 2) {
      onNotify?.('검색어를 2자 이상 입력해주세요', 'error');
      return;
    }

    setLoading(true);
    setRecommendations([]);
    setSelectedCode(null);
    setThinkingStep(1);

    // AI 생각 단계 시뮬레이션 (실제 처리 시간에 맞춤)
    const stepInterval = setInterval(() => {
      setThinkingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 500); // 더 빠른 업데이트

    try {
      const supabase = createClient();

      // hs-code-classifier Edge Function 호출 (GPT-5 Tool Calling)
      const { data, error } = await supabase.functions.invoke('hs-code-classifier', {
        body: { productName: query },
      });

      if (error) {
        console.error('Search error:', error);
        onNotify?.('검색 중 오류가 발생했습니다', 'error');
        return;
      }

      // GPT-5 응답을 기존 포맷으로 변환
      if (data?.results && data.results.length > 0) {
        const formattedRecommendations = data.results.map((result: any, index: number) => ({
          hs_code: result.hs_code,
          name_ko: result.name_ko,
          name_en: result.name_en || '',
          category_name: result.category_name || '',
          reason: `신뢰도: ${(result.confidence * 100).toFixed(0)}%`,
          rank: index + 1,
        }));

        setRecommendations(formattedRecommendations);

        // GPT 응답을 설명으로 표시
        if (data.gptResponse) {
          setExplanation({
            exact_match: false,
            difference: data.gptResponse,
            tip: `GPT-5가 ${data.toolCalls || 0}번의 DB 검색을 수행했습니다`,
            similar_products: [],
          });
        }

        onNotify?.(`${formattedRecommendations.length}개의 HS코드를 찾았습니다`, 'success');
      } else {
        onNotify?.('검색 결과가 없습니다. 다른 검색어를 시도해보세요.', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      onNotify?.('검색 중 오류가 발생했습니다', 'error');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setThinkingStep(0);
      setThinkingMessage('');
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
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
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            size="large"
            sx={{ minWidth: 150 }}
          >
            {loading ? 'AI 분석 중...' : 'HS코드 검색'}
          </Button>
          {recommendations.length > 0 && (
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

      {/* AI 생각 중 표시 */}
      {loading && (
        <Fade in={loading}>
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PsychologyIcon color="primary" sx={{ animation: 'pulse 2s infinite' }} />
                  <Typography variant="h6" color="primary">
                    GPT-5 AI가 제품을 분석 중입니다
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (약 10-30초 소요)
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={(thinkingStep / 4) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                />

                <Stack spacing={1}>
                  <Fade in={thinkingStep >= 1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AutoFixHighIcon
                        fontSize="small"
                        color={thinkingStep > 1 ? 'success' : 'action'}
                      />
                      <Typography
                        variant="body2"
                        color={thinkingStep > 1 ? 'success.main' : 'text.secondary'}
                      >
                        제품명 분석 중... "{query}"
                      </Typography>
                    </Stack>
                  </Fade>

                  <Fade in={thinkingStep >= 2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StorageIcon
                        fontSize="small"
                        color={thinkingStep > 2 ? 'success' : 'action'}
                      />
                      <Typography
                        variant="body2"
                        color={thinkingStep > 2 ? 'success.main' : 'text.secondary'}
                      >
                        데이터베이스 검색 중...
                      </Typography>
                    </Stack>
                  </Fade>

                  <Fade in={thinkingStep >= 3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PsychologyIcon
                        fontSize="small"
                        color={thinkingStep > 3 ? 'success' : 'action'}
                      />
                      <Typography
                        variant="body2"
                        color={thinkingStep > 3 ? 'success.main' : 'text.secondary'}
                      >
                        최적 HS코드 매칭 중...
                      </Typography>
                    </Stack>
                  </Fade>

                  <Fade in={thinkingStep >= 4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="body2" color="success.main">
                        결과 정리 중...
                      </Typography>
                    </Stack>
                  </Fade>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {thinkingMessage}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* 검색 결과 */}
      {recommendations.length > 0 && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            <Typography variant="body2" fontWeight={600}>
              "{query}"에 대한 추천 HS코드 {recommendations.length}개
            </Typography>
          </Alert>

          {/* 차이점 설명 */}
          {explanation && !explanation.exact_match && explanation.difference && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                💡 AI 분석 결과
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {explanation.difference}
              </Typography>
              {explanation.similar_products && explanation.similar_products.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  유사 제품: {explanation.similar_products.join(', ')}
                </Typography>
              )}
            </Alert>
          )}

          <Card variant="outlined" sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                추천 HS코드 (클릭하여 선택)
              </Typography>
            </CardContent>

            <List sx={{ p: 0 }}>
              {recommendations.map((rec, idx) => (
                <React.Fragment key={rec.hs_code}>
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
                            label={rec.rank === 1 ? '🏆 최고추천' : `#${rec.rank}`}
                            size="small"
                            color={rec.rank === 1 ? 'success' : 'primary'}
                            sx={{
                              minWidth: rec.rank === 1 ? 80 : 40,
                              fontWeight: 'bold',
                              animation: rec.rank === 1 ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.05)' },
                                '100%': { transform: 'scale(1)' },
                              },
                            }}
                          />
                          <Box>
                            <Typography variant="h6" component="span" fontWeight={600}>
                              {rec.name_ko}
                            </Typography>
                            {rec.category_name && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ ml: 1 }}
                              >
                                ({rec.category_name})
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                bgcolor: selectedCode === rec.hs_code ? 'primary.main' : 'grey.800',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="span"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  letterSpacing: 1,
                                }}
                              >
                                {rec.hs_code}
                              </Typography>
                            </Box>
                            {rec.name_en && (
                              <Typography variant="caption" color="text.secondary">
                                {rec.name_en}
                              </Typography>
                            )}
                          </Stack>
                          {rec.reason && (
                            <Typography
                              variant="caption"
                              color="info.main"
                              sx={{ mt: 0.5, display: 'block' }}
                            >
                              💡 {rec.reason}
                            </Typography>
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
