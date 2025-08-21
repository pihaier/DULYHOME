'use client';

import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box, 
  Chip,
  Stack,
  Typography,
  Paper,
  Skeleton,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CameraAlt as CameraIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { KeywordCategory, SelectedFilters } from '../../types';

interface SearchBarWithCategoriesProps {
  // 검색바 props
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onImageSearchOpen?: () => void;
  popularKeywords?: string[];
  placeholder?: string;
  
  // 카테고리 props
  categories: KeywordCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  selectedCategoryIds: string[];
  onCategorySelect: (categoryId: number | null, parentId?: number) => void;
  
  // 필터 props
  filters: SelectedFilters;
  onFilterChange: (filters: SelectedFilters) => void;
}

export default function SearchBarWithCategories({
  value,
  onChange,
  onSearch,
  onImageSearchOpen,
  popularKeywords = [],
  placeholder = '상품명을 입력하세요 (중국어/한국어)',
  categories,
  categoriesLoading,
  categoriesError,
  selectedCategoryIds,
  onCategorySelect,
  filters,
  onFilterChange,
}: SearchBarWithCategoriesProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleKeywordClick = (keyword: string) => {
    onChange(keyword);
    setTimeout(onSearch, 100);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        {/* 검색바 */}
        <TextField
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={1}>
                  {value && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  {onImageSearchOpen && (
                    <IconButton 
                      color="primary" 
                      onClick={onImageSearchOpen}
                      title="이미지로 검색"
                    >
                      <CameraIcon />
                    </IconButton>
                  )}
                  <IconButton color="primary" onClick={onSearch}>
                    <SearchIcon />
                  </IconButton>
                </Stack>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused': {
                '& fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
            },
          }}
        />

        {/* 인기 검색어 */}
        {popularKeywords.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              인기 검색어
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {popularKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onClick={() => handleKeywordClick(keyword)}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* 카테고리 섹션 */}
        {categoriesLoading && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              관련 카테고리 로딩중...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" width={100} height={32} />
              ))}
            </Box>
          </Box>
        )}

        {!categoriesLoading && !categoriesError && categories.length > 0 && (
          <>
            <Divider />
            <Box>
              {/* 카테고리 헤더 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CategoryIcon color="action" />
                <Typography variant="body1" fontWeight="medium">
                  관련 카테고리
                </Typography>
                {selectedCategoryIds.length > 0 && (
                  <Chip
                    label={`초기화 (${selectedCategoryIds.length})`}
                    size="small"
                    variant="outlined"
                    onClick={() => onCategorySelect(null)}
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Box>

              {/* 카테고리 목록 - API 응답 개수만큼만 표시 */}
              <Stack spacing={2}>
                {categories.map((category, index) => (
                  <Box key={category.categoryID}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* 카테고리 그룹 이름과 하위 카테고리 */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ minWidth: 100, fontWeight: 'bold' }}
                          >
                            {category.name}:
                          </Typography>
                          {category.childCategorys && category.childCategorys.map((subCategory) => {
                            const snId = `${category.categoryID}:${subCategory.id}`;
                            return (
                              <Chip
                                key={subCategory.id}
                                label={subCategory.name}
                                onClick={() => onCategorySelect(subCategory.id, category.categoryID)}
                                color={selectedCategoryIds.includes(snId) ? 'primary' : 'default'}
                                variant={selectedCategoryIds.includes(snId) ? 'filled' : 'outlined'}
                                sx={{ 
                                  mb: 0.5,
                                  fontSize: '0.875rem',
                                  height: 32,
                                  '& .MuiChip-label': {
                                    px: 2,
                                    fontSize: '0.875rem',
                                  }
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>

                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}