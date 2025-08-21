'use client';

import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { KeywordCategory } from '../../types';

interface KeywordCategoryNavProps {
  categories: KeywordCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryIds: string[];  // snId 형식 배열 (예: ["3216:28320", "3216:28335"])
  onCategorySelect: (categoryId: number | null, parentId?: number) => void;
}

export default function KeywordCategoryNav({
  categories,
  loading,
  error,
  selectedCategoryIds,
  onCategorySelect,
}: KeywordCategoryNavProps) {

  // 로딩 상태
  if (loading) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            관련 카테고리 로딩중...
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" width={100} height={32} />
            ))}
          </Box>
        </Stack>
      </Paper>
    );
  }

  // 에러 상태
  if (error) {
    return null; // 에러 시 카테고리 네비게이션 숨김
  }

  // 카테고리가 없는 경우
  if (categories.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
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

        {/* 각 카테고리 그룹별로 표시 */}
        {categories.map((category) => (
          <Box key={category.categoryID}>
            {/* 카테고리 그룹 이름 */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {category.name}
            </Typography>
            
            {/* 해당 그룹의 하위 카테고리들 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {category.childCategorys && category.childCategorys.map((subCategory) => {
                // snId 형식 생성: "부모ID:자식ID"
                const snId = `${category.categoryID}:${subCategory.id}`;
                return (
                  <Chip
                    key={subCategory.id}
                    label={subCategory.name}
                    onClick={() => onCategorySelect(subCategory.id, category.categoryID)}
                    color={selectedCategoryIds.includes(snId) ? 'primary' : 'default'}
                    variant={selectedCategoryIds.includes(snId) ? 'filled' : 'outlined'}
                    size="small"
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}