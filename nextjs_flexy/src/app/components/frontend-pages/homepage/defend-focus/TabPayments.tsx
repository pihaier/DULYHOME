'use client';
import * as React from 'react';
import { Box, Divider, Typography, Grid, Button } from '@mui/material';

import { styled } from '@mui/material/styles';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useState } from 'react';

const StyledAccordian = styled(Accordion)(() => ({
  boxShadow: 'none',
  marginBottom: '0 !important',
  backgroundColor: 'transparent',
  '&.Mui-expanded': {
    margin: '0',
  },
  '& .MuiAccordionSummary-root': {
    padding: 0,
    minHeight: '60px',
  },
  '& .MuiAccordionDetails-root': {
    padding: '0 0 20px',
  },
}));

const TabPayments = () => {
  const [expanded, setExpanded] = useState(true);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);

  const handleChange2 = () => {
    setExpanded(!expanded);
  };

  const handleChange3 = () => {
    setExpanded2(!expanded2);
  };

  const handleChange4 = () => {
    setExpanded3(!expanded3);
  };

  return (
    <Grid container spacing={{ xs: 3, lg: 8 }}>
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20purchasing%20agency%20service%20illustration%20with%20shopping%20cart%2C%20product%20selection%2C%20payment%20processing%2C%20business%20handshake%2C%20modern%20e-commerce%20style%2C%20green%20and%20white%20color%20scheme&image_size=square_hd"
            width={500}
            height={500}
            style={{
              width: '100%',
              height: '120%',
              objectFit: 'cover',
              position: 'absolute',
              top: '0',
              left: '0',
            }}
            alt="구매대행 서비스"
          />
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              lg: '40px',
              xs: '35px',
            },
          }}
          fontWeight="700"
          mt={5}
        >
          구매대행 서비스
        </Typography>
        <Box mt={4}>
          <StyledAccordian expanded={expanded} onChange={handleChange2}>
            <AccordionSummary
              expandIcon={
                expanded ? (
                  <IconMinus size="21" stroke="1.5" />
                ) : (
                  <IconPlus size="21" stroke="1.5" />
                )
              }
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontSize="17px" fontWeight="600">
                신뢰할 수 있는 공급업체 네트워크
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                7년간 검증된 우수 공급업체들과의 파트너십을 통해 안정적이고 경쟁력 있는 가격으로
                제품을 구매해드립니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
          <StyledAccordian expanded={expanded2} onChange={handleChange3}>
            <AccordionSummary
              expandIcon={
                expanded2 ? (
                  <IconMinus size="21" stroke="1.5" />
                ) : (
                  <IconPlus size="21" stroke="1.5" />
                )
              }
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography fontSize="17px" fontWeight="600">
                안전한 거래 프로세스
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                계약서 작성부터 결제, 배송까지 체계적인 프로세스로 안전하고 투명한 거래를
                보장합니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
          <StyledAccordian expanded={expanded3} onChange={handleChange4}>
            <AccordionSummary
              expandIcon={
                expanded3 ? (
                  <IconMinus size="21" stroke="1.5" />
                ) : (
                  <IconPlus size="21" stroke="1.5" />
                )
              }
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography fontSize="17px" fontWeight="600">
                실시간 진행상황 공유
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                구매 진행 상황을 실시간으로 공유하여 언제든지 현황을 파악하고 빠른 의사결정을 내릴
                수 있습니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
          <Box mt={3}>
            <Button variant="contained" color="primary" size="large">
              구매대행 문의하기
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
export default TabPayments;
