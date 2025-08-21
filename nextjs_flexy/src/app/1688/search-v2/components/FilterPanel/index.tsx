'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { 
  FilterList as FilterIcon, 
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { SelectedFilters } from '../../types';

interface FilterPanelProps {
  filters: SelectedFilters;
  onFilterChange: (filters: SelectedFilters) => void;
  onReset: () => void;
}

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  onReset,
}: FilterPanelProps) {
  const handleCheckboxChange = (name: keyof SelectedFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({
      ...filters,
      [name]: event.target.checked,
    });
  };

  const handlePriceChange = (field: 'priceMin' | 'priceMax') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // 숫자만 입력 가능
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onFilterChange({
        ...filters,
        [field]: value,
      });
    }
  };



  const hasActiveFilters = 
    filters.isJxhy || 
    filters.isOnePsale || 
    filters.priceMin || 
    filters.priceMax;

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="action" />
            <Typography variant="h6">필터</Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onReset}
              color="secondary"
            >
              초기화
            </Button>
          )}
        </Box>

        <Divider />

        {/* 공급업체 필터 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            공급업체 유형
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isJxhy}
                  onChange={handleCheckboxChange('isJxhy')}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  우수 공급업체 (精选货源)
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isOnePsale}
                  onChange={handleCheckboxChange('isOnePsale')}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  드롭쉬핑 가능 (一件代发)
                </Typography>
              }
            />
          </FormGroup>
        </Box>

        <Divider />

        {/* 가격 범위 필터 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            가격 범위 (¥)
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="최소"
              value={filters.priceMin}
              onChange={handlePriceChange('priceMin')}
              sx={{ width: '100px' }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
            <Typography variant="body2">~</Typography>
            <TextField
              size="small"
              placeholder="최대"
              value={filters.priceMax}
              onChange={handlePriceChange('priceMax')}
              sx={{ width: '100px' }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Stack>
        </Box>

        {/* 활성 필터 개수 표시 */}
        {hasActiveFilters && (
          <>
            <Divider />
            <Typography variant="caption" color="text.secondary">
              {Object.values(filters).filter(v => v).length}개의 필터 적용중
            </Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}