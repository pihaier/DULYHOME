'use client';

import React from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { SORT_OPTIONS, type SortOption } from '../../types';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  disabled?: boolean;
}

export default function SortSelector({ value, onChange, disabled = false }: SortSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as SortOption);
  };

  // 현재 선택된 옵션의 키 찾기
  const currentKey = Object.keys(SORT_OPTIONS).find(
    (key) => SORT_OPTIONS[key].value === value
  ) || 'default';

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={SORT_OPTIONS[currentKey].value}
        onChange={handleChange}
        disabled={disabled}
        displayEmpty
        sx={{
          '& .MuiSelect-select': {
            py: 1,
            fontSize: '0.875rem',
          },
        }}
      >
        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
          <MenuItem key={key} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}