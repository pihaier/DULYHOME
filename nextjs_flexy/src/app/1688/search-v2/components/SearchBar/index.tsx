'use client';

import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box, 
  Chip,
  Stack,
  Typography 
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CameraAlt as CameraIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onImageSearchOpen?: () => void;
  popularKeywords?: string[];
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onImageSearchOpen,
  popularKeywords = [],
  placeholder = '상품명을 입력하세요 (중국어/한국어)',
}: SearchBarProps) {
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
    // 자동 검색 트리거
    setTimeout(onSearch, 100);
  };

  return (
    <Box sx={{ width: '100%' }}>
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
        <Box sx={{ mt: 2 }}>
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
    </Box>
  );
}