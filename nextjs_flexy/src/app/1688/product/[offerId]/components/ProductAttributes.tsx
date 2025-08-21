'use client';

import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';

interface ProductAttributesProps {
  productDetail: any;
}

export default function ProductAttributes({ productDetail }: ProductAttributesProps) {
  // API에서는 productAttribute (s 없음) 배열로 제공
  const attributes = productDetail?.productAttribute || [];
  
  if (!attributes || attributes.length === 0) {
    return null;
  }

  // 속성을 카테고리별로 그룹화
  const groupedAttributes: { [key: string]: any[] } = {};
  attributes.forEach((attr: any) => {
    const key = attr.attributeNameTrans || attr.attributeName;
    if (!groupedAttributes[key]) {
      groupedAttributes[key] = [];
    }
    groupedAttributes[key].push(attr);
  });

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        제품 속성
      </Typography>

      {/* 그룹화된 속성 표시 */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          p: 2,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2}>
          {Object.entries(groupedAttributes).map(([attributeName, values]: [string, any[]], index) => {
            // 색상과 사이즈는 SKU에서 처리하므로 여기서는 제외
            if (attributeName === '색상' || attributeName === '크기') {
              return null;
            }
            
            // 여러 값이 있는 경우 (예: 기능)
            if (values.length > 1) {
              return (
                <Grid key={index} size={{ xs: 12 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      {attributeName}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {values.map((v, idx) => (
                        <Chip
                          key={idx}
                          label={v.valueTrans || v.value}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              );
            }
            
            // 단일 값인 경우
            return (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: 'text.secondary',
                      minWidth: '100px',
                      flexShrink: 0,
                      fontWeight: 500
                    }}
                  >
                    {attributeName}:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, wordBreak: 'break-word' }}>
                    {values[0].valueTrans || values[0].value || '-'}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* 추가 정보가 있는 경우 */}
      {productDetail.productExtends && (
        <Box sx={{ mt: 2 }}>
          {productDetail.productExtends.map((ext: any, index: number) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {ext.key}: {ext.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}