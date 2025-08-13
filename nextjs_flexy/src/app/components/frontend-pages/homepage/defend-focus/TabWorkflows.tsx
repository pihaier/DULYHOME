'use client';
import * as React from 'react';
import { Box, Divider, Typography, Grid, Button } from '@mui/material';

import { styled } from '@mui/material/styles';
import { IconMinus, IconPlus } from '@tabler/icons-react';
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

const TabWorkflows = () => {
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
            src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20delivery%20agency%20service%20illustration%20with%20delivery%20truck%2C%20package%20boxes%2C%20logistics%20network%2C%20shipping%20routes%2C%20warehouse%20operations%2C%20modern%20transportation%20style%2C%20red%20and%20white%20color%20scheme&image_size=square_hd"
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
            alt="배송대행 서비스"
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
          배송대행 서비스
        </Typography>
        <Box mt={4}>
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
                다양한 운송 옵션 제공
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                항공, 해상, 육상 운송 등 제품과 일정에 맞는 최적의 운송 방법을 제안합니다. 비용과
                시간을 고려한 맞춤형 물류 솔루션을 제공합니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
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
                신속하고 안전한 통관
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                전문 통관사와의 협력으로 신속하고 정확한 통관 처리를 보장합니다. 필요 서류 준비부터
                세관 신고까지 원스톱으로 처리합니다.
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
                문턱에서 문턱까지 책임 배송
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                중국 공장에서 국내 지정 장소까지 안전하게 배송해드립니다. 실시간 위치 추적과 배송
                현황 공유로 투명한 물류 서비스를 제공합니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
          <Box mt={3}>
            <Button variant="contained" color="primary" size="large">
              배송대행 문의하기
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
export default TabWorkflows;
