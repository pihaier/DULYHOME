'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Search as SearchIcon,
  Category as CategoryIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface HSCodeOption {
  hs_code: string;
  name_ko: string;
  name_en: string;
  description: string;
  confidence: number;
  tax_rate: number;
}

interface HSCodeGroup {
  hs_code: string; // 6자리 prefix
  description_korean: string;
  description_english: string;
  total_codes: number;
  has_specifications?: boolean;
  detail_codes?: Array<{
    hs_code: string;
    name_ko: string;
    name_en: string;
    specs?: {
      spec_name?: string;
      required_spec_name?: string;
      reference_spec_name?: string;
      spec_description?: string;
      spec_details?: string;
    } | null;
    units?: {
      quantity?: string;
      weight?: string;
    };
    trade_codes?: {
      export?: string;
      import?: string;
    };
  }>;
}

interface HSCodeCategory {
  code: string;
  hs6digit?: string;
  name: string;
  description: string;
  usage: string;
  difference?: string;
  itemCount?: number;
  sampleItems?: Array<{
    hs_code: string;
    name_ko: string;
    name_en?: string;
  }>;
}

interface HierarchicalStep {
  chapter?: string;
  heading?: string;
  subheading?: string;
  final?: string;
}

interface SelectionOption {
  code: string;
  title: string;
  description: string;
  examples?: string;
  confidence?: number;
}

interface Props {
  onSelectHsCode?: (code: string, description: string) => void;
  onReset?: () => void;
  onNotify?: (message: string, severity: 'success' | 'error' | 'info') => void;
}

export function HSCodeSmartSearch({ onSelectHsCode, onReset, onNotify }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<HSCodeOption[]>([]);
  const [categories, setCategories] = useState<HSCodeCategory[]>([]);
  const [groups, setGroups] = useState<HSCodeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<
    'search' | 'category' | 'group' | 'detail' | 'hierarchical' | 'selection'
  >('search');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<HSCodeGroup | null>(null);
  const [detailCodes, setDetailCodes] = useState<HSCodeGroup['detail_codes']>([]);

  // 계층적 분류용 상태
  const [hierarchicalSteps, setHierarchicalSteps] = useState<HierarchicalStep>({});
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([]);
  const [searchMode, setSearchMode] = useState<'smart' | 'hierarchical'>('hierarchical');

  // 계층적 검색 실행 함수
  const handleHierarchicalSearch = async () => {
    if (query.length < 2) {
      onNotify?.('검색어를 2자 이상 입력해주세요', 'error');
      return;
    }

    // 새 검색 시 모든 상태 초기화
    setLoading(true);
    setOptions([]);
    setCategories([]);
    setGroups([]);
    setDetailCodes([]);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setHierarchicalSteps({});
    setSelectionOptions([]);
    setMode('hierarchical');

    // 부모 컴포넌트의 선택된 HS코드도 초기화
    if (onReset) {
      onReset();
    }

    try {
      const supabase = createClient();

      // 계층적 분류 실행
      const { data, error } = await supabase.functions.invoke('hs-code-smart-search', {
        body: {
          query: query,
          mode: 'hierarchical',
        },
      });

      if (error) {
        console.error('Hierarchical search error:', error);
        onNotify?.('검색 중 오류가 발생했습니다', 'error');
        return;
      }

      if (data?.status === 'needs_selection') {
        // 선택이 필요한 경우
        setSelectionOptions(data.options);
        setHierarchicalSteps(data.steps || {});
        setMode('selection');
      } else if (data?.status === 'success') {
        // 자동으로 완료된 경우
        if (onSelectHsCode) {
          onSelectHsCode(data.hsCode, data.description);
        }
        setHierarchicalSteps(data.steps || {});
        onNotify?.(`HS 코드 ${data.hsCode}가 자동으로 선택되었습니다`, 'success');
      } else {
        onNotify?.('검색 결과가 없습니다', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      onNotify?.('검색 중 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 선택지에서 코드 선택
  const handleSelectionChoice = async (selectedCode: string) => {
    setLoading(true);

    try {
      const supabase = createClient();

      // 선택한 코드로 최종 확정
      const { data, error } = await supabase.functions.invoke('hs-code-smart-search', {
        body: {
          code: selectedCode,
          mode: 'finalize',
        },
      });

      if (error) {
        console.error('Finalize error:', error);
        onNotify?.('코드 확정 중 오류가 발생했습니다', 'error');
        return;
      }

      if (data?.status === 'success') {
        if (onSelectHsCode) {
          onSelectHsCode(data.hsCode, data.description);
        }
        onNotify?.(`HS 코드 ${data.hsCode}가 선택되었습니다`, 'success');
        setMode('search');
        setSelectionOptions([]);
      }
    } catch (error) {
      console.error('Selection error:', error);
      onNotify?.('선택 중 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행 함수 (기존 스마트 검색 또는 계층적 검색)
  const handleSearch = async () => {
    if (searchMode === 'hierarchical') {
      await handleHierarchicalSearch();
    } else {
      await handleSmartSearch();
    }
  };

  // 기존 스마트 검색 (카테고리 추출)
  const handleSmartSearch = async () => {
    if (query.length < 2) {
      onNotify?.('검색어를 2자 이상 입력해주세요', 'error');
      return;
    }

    // 새 검색 시 모든 상태 초기화
    setLoading(true);
    setOptions([]);
    setCategories([]);
    setGroups([]);
    setDetailCodes([]);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setMode('search');

    // 부모 컴포넌트의 선택된 HS코드도 초기화
    if (onReset) {
      onReset();
    }

    try {
      const supabase = createClient();
      // 1단계: 카테고리 추출 (빠른 응답)
      const { data, error } = await supabase.functions.invoke('hs-code-category-extract', {
        body: {
          query: query,
        },
      });

      if (error) {
        console.error('Category extraction error:', error);
        onNotify?.('검색 중 오류가 발생했습니다', 'error');
        return;
      }

      if (data?.categories && data.categories.length > 0) {
        setCategories(data.categories);
        setMode('category');
        setOptions([]);
      } else {
        onNotify?.('검색 결과가 없습니다', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      onNotify?.('검색 중 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  // 카테고리 선택 시 6자리 그룹 조회 (2단계) - 4자리 카테고리로 조회
  const handleCategorySelect = async (category: HSCodeCategory) => {
    setLoading(true);
    setSelectedCategory(category.code);

    // 4자리 카테고리 코드로 6자리 그룹 목록 조회
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('hs-code-vector-search', {
        body: {
          query: query,
          categoryCode: category.code, // 4자리 카테고리 코드
        },
      });

      if (error) {
        console.error('Group search error:', error);
        onNotify?.('그룹 조회 중 오류가 발생했습니다', 'error');
        return;
      }

      if (data?.results && data.results.length > 0) {
        console.log('API Response from hs-code-vector-search:', data);
        console.log('Groups received:', data.results);
        setGroups(data.results);
        setMode('group');
        setCategories([]);
      }
    } catch (error) {
      console.error('Category search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 6자리 그룹 선택 시 10자리 상세 표시 (3단계)
  const handleGroupSelect = (group: HSCodeGroup) => {
    console.log('Selected group:', group);
    console.log('Detail codes count:', group.detail_codes?.length);
    console.log('Detail codes:', group.detail_codes);

    setSelectedGroup(group);
    if (group.detail_codes && group.detail_codes.length > 0) {
      // detail_codes를 그대로 저장 (specs 정보 포함)
      setDetailCodes(group.detail_codes);
      setOptions(
        group.detail_codes.map((code) => ({
          hs_code: code.hs_code,
          name_ko: code.name_ko,
          name_en: code.name_en || '',
          description: '',
          confidence: 0,
          tax_rate: 0,
        }))
      );
      setMode('detail');
    }
  };

  // 항목 선택
  const handleSelect = async (option: HSCodeOption) => {
    if (onSelectHsCode) {
      onSelectHsCode(option.hs_code, option.name_ko);
    }
  };

  // 초기화
  const handleReset = () => {
    setQuery('');
    setOptions([]);
    setCategories([]);
    setGroups([]);
    setDetailCodes([]);
    setMode('search');
    setSelectedCategory(null);
    setSelectedGroup(null);
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
          placeholder="제품명 또는 제품 설명을 입력해주세요 (예: 노트북, 스마트폰, 의류 등)"
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
            sx={{ minWidth: 120 }}
          >
            {loading ? '검색 중...' : 'HS코드 검색'}
          </Button>
          {(categories.length > 0 ||
            options.length > 0 ||
            groups.length > 0 ||
            selectionOptions.length > 0) && (
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

      {/* 계층적 분류 진행 상황 표시 */}
      {mode === 'hierarchical' && hierarchicalSteps && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">계층적 분류를 진행 중입니다...</Typography>
          </Alert>
          <Stack direction="row" spacing={2}>
            {hierarchicalSteps.chapter && (
              <Chip label={`Chapter: ${hierarchicalSteps.chapter}`} color="primary" />
            )}
            {hierarchicalSteps.heading && (
              <Chip label={`Heading: ${hierarchicalSteps.heading}`} color="primary" />
            )}
            {hierarchicalSteps.subheading && (
              <Chip label={`Subheading: ${hierarchicalSteps.subheading}`} color="primary" />
            )}
          </Stack>
        </Box>
      )}

      {/* 선택지 표시 (애매한 경우) */}
      {mode === 'selection' && selectionOptions.length > 0 && (
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              다음 중 가장 적합한 것을 선택해주세요:
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            {selectionOptions.map((option, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={option.code}>
                <Card
                  onClick={() => handleSelectionChoice(option.code)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      borderColor: 'primary.main',
                    },
                    border: 2,
                    borderColor: 'transparent',
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      {option.confidence && option.confidence > 0.5 && idx === 0 && (
                        <Chip label="추천" size="small" color="primary" />
                      )}
                      <Typography variant="h6" color="primary">
                        {option.title}
                      </Typography>
                      <Chip label={option.code} size="small" variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                      {option.examples && (
                        <Typography variant="caption" color="text.secondary">
                          예: {option.examples}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 카테고리 선택 화면 */}
      {mode === 'category' && categories.length > 0 && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CategoryIcon />}>
            <Typography variant="body2" fontWeight={600}>
              "{query}" 제품에 대한 실제 HS코드 {categories.length}개 그룹을 찾았습니다:
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              💡 DB에서 검색된 실제 HS코드를 재질/용도별로 분류했습니다
            </Typography>
          </Alert>

          <Box>
            <Stack spacing={2} sx={{ pr: 1 }}>
              {categories.map((category, idx) => (
                <Card
                  key={`${category.code}-${idx}`}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      bgcolor: 'action.hover',
                    },
                    border: 1,
                    borderColor: 'divider',
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Chip
                        label={idx + 1}
                        color="primary"
                        size="small"
                        sx={{ minWidth: 32, fontWeight: 'bold' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight={600} color="primary">
                            HS {category.code}
                          </Typography>
                          {category.itemCount && (
                            <Chip
                              label={`${category.itemCount}개 품목`}
                              size="small"
                              color="success"
                            />
                          )}
                          {category.usage && (
                            <Chip
                              label={category.usage}
                              size="small"
                              variant="outlined"
                              color="info"
                            />
                          )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                        {category.sampleItems && category.sampleItems.length > 0 && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <strong>포함 품목:</strong>{' '}
                              {category.sampleItems.map((item) => item.name_ko).join(', ')}
                            </Typography>
                          </Box>
                        )}
                        {category.difference && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="warning.dark">
                              💡 <strong>특징:</strong> {category.difference}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <ArrowForwardIcon sx={{ color: 'action.active', mt: 1 }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* 6자리 그룹 선택 화면 */}
      {mode === 'group' && groups.length > 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }} icon={<CategoryIcon />}>
            <Typography variant="body2">
              카테고리 {selectedCategory}의 세부 분류입니다. 선택하면 상세 코드를 볼 수 있습니다.
            </Typography>
          </Alert>

          <Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                pr: 1,
              }}
            >
              {groups.map((group) => (
                <Box key={group.hs_code} sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      height: '180px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        bgcolor: 'action.hover',
                      },
                      border: 1,
                      borderColor: 'divider',
                      overflow: 'hidden',
                    }}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6" fontWeight={600} color="primary">
                            HS {group.hs_code}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {group.has_specifications && (
                              <Chip label="규격" size="small" color="warning" />
                            )}
                            <Chip
                              label={`${group.total_codes}개`}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                        <Typography variant="body2">{group.description_korean}</Typography>
                        {group.description_english && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            {group.description_english}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* 상세 검색 결과 */}
      {mode === 'detail' && options.length > 0 && (
        <Box>
          {selectedGroup && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  HS {selectedGroup.hs_code}: {selectedGroup.description_korean}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setMode('group');
                      setOptions([]);
                      setSelectedGroup(null);
                    }}
                  >
                    다른 그룹 선택
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setMode('category');
                      setOptions([]);
                      setGroups([]);
                      setSelectedGroup(null);
                    }}
                  >
                    카테고리 다시 선택
                  </Button>
                </Stack>
              </Box>
            </Alert>
          )}

          <Card variant="outlined" sx={{ boxShadow: 0 }}>
            <CardContent sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={500}>
                검색 결과 ({options.length}개)
              </Typography>
            </CardContent>

            <Box>
              <List sx={{ p: 0 }}>
                {detailCodes &&
                  detailCodes.map((code, idx) => {
                    const hasSpecs =
                      code.specs &&
                      (code.specs.spec_name ||
                        code.specs.required_spec_name ||
                        code.specs.reference_spec_name ||
                        code.specs.spec_description ||
                        code.specs.spec_details);

                    return (
                      <React.Fragment key={code.hs_code}>
                        <ListItemButton
                          onClick={() =>
                            handleSelect({
                              hs_code: code.hs_code,
                              name_ko: code.name_ko,
                              name_en: code.name_en || '',
                              description: '',
                              confidence: 0,
                              tax_rate: 0,
                            })
                          }
                          sx={{
                            py: 2,
                            px: 3,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={idx + 1} size="small" sx={{ minWidth: 32 }} />
                                <Typography fontWeight={600}>{code.name_ko}</Typography>
                                {hasSpecs && (
                                  <Chip
                                    label="📋"
                                    size="small"
                                    color="warning"
                                    sx={{ minWidth: 20 }}
                                  />
                                )}
                              </Stack>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                            secondary={
                              <React.Fragment>
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                  component="span"
                                >
                                  <Box
                                    sx={{
                                      bgcolor: 'primary.main',
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
                                        letterSpacing: 0.5,
                                      }}
                                    >
                                      {code.hs_code}
                                    </Typography>
                                  </Box>
                                  {code.name_en && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      component="span"
                                    >
                                      {code.name_en}
                                    </Typography>
                                  )}
                                </Stack>

                                {/* 규격 정보 표시 */}
                                {hasSpecs && (
                                  <Box sx={{ mt: 1, pl: 2, borderLeft: '3px solid orange' }}>
                                    {code.specs?.spec_name && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="warning.main"
                                      >
                                        📌 품목규격: {code.specs.spec_name}
                                      </Typography>
                                    )}
                                    {code.specs?.required_spec_name && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="error.main"
                                      >
                                        ⚠️ 필수규격: {code.specs.required_spec_name}
                                      </Typography>
                                    )}
                                    {code.specs?.reference_spec_name && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="info.main"
                                      >
                                        📎 참고규격: {code.specs.reference_spec_name}
                                      </Typography>
                                    )}
                                    {code.specs?.spec_description && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                      >
                                        💡 설명: {code.specs.spec_description}
                                      </Typography>
                                    )}
                                    {code.specs?.spec_details && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                      >
                                        📝 상세: {code.specs.spec_details}
                                      </Typography>
                                    )}
                                  </Box>
                                )}

                                {/* 단위 정보 */}
                                {code.units && (code.units.quantity || code.units.weight) && (
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    {code.units.quantity && (
                                      <Chip
                                        label={`수량: ${code.units.quantity}`}
                                        size="small"
                                        variant="outlined"
                                        color="default"
                                      />
                                    )}
                                    {code.units.weight && (
                                      <Chip
                                        label={`중량: ${code.units.weight}`}
                                        size="small"
                                        variant="outlined"
                                        color="default"
                                      />
                                    )}
                                  </Stack>
                                )}
                              </React.Fragment>
                            }
                          />
                        </ListItemButton>
                        {idx < (detailCodes?.length || 0) - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
              </List>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}
