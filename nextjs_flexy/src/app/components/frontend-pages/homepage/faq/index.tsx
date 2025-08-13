'use client';
import * as React from 'react';
import { Box, Divider, Typography, Grid, Button, Container, Link } from '@mui/material';

import { styled } from '@mui/material/styles';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useState } from 'react';

const FAQ = () => {
  const theme = useTheme();

  const [expanded, setExpanded] = useState(true);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [expanded4, setExpanded4] = useState(false);
  const [expanded5, setExpanded5] = useState(false);
  const [expanded6, setExpanded6] = useState(false);

  const StyledAccordian = styled(Accordion)(() => ({
    borderRadius: '8px',
    marginBottom: '16px !important',
    boxShadow: theme.palette.mode == 'light' ? '0px 3px 0px rgba(235, 241, 246, 0.25)' : 'unset',
    border: `1px solid ${theme.palette.divider}`,
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: '0',
    },
    '& .MuiAccordionSummary-root': {
      padding: '8px 24px',
      minHeight: '60px',
      fontSize: '18px',
      fontWeight: 500,
    },
    '& .MuiAccordionDetails-root': {
      padding: '0 24px 24px',
    },
  }));

  const handleChange = () => {
    setExpanded(!expanded);
  };

  const handleChange2 = () => {
    setExpanded2(!expanded2);
  };

  const handleChange3 = () => {
    setExpanded3(!expanded3);
  };

  const handleChange4 = () => {
    setExpanded4(!expanded4);
  };

  const handleChange5 = () => {
    setExpanded5(!expanded5);
  };

  const handleChange6 = () => {
    setExpanded6(!expanded6);
  };

  return (
    <Box
      sx={{
        py: { xs: 10, sm: 12, lg: 16 },
        mt: { xs: 4, lg: 6 },
        background: theme.palette.grey[50],
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              lineHeight="1.2"
              sx={{
                fontSize: {
                  lg: '40px',
                  xs: '35px',
                },
              }}
              fontWeight="700"
            >
              자주 묻는 질문
            </Typography>
            <Box mt={7}>
              <StyledAccordian expanded={expanded} onChange={handleChange}>
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
                  수입대행 서비스에는 무엇이 포함되나요?
                </AccordionSummary>
                <AccordionDetails>
                  시장조사, 업체 컨택, 제품 조사, 생산 관리, 품질 검수, 물류, 통관, 배송까지 모든
                  과정이 포함됩니다. 추가로 현지 직접 출장 검품 서비스를 무료로 제공해드립니다.
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian expanded={expanded2} onChange={handleChange2}>
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
                  서비스 이용료는 어떻게 되나요?
                </AccordionSummary>
                <AccordionDetails>
                  프로젝트별 맞춤 견적을 제공해드립니다. 기본 수수료 외에는 별도의 정기 결제나
                  숨겨진 비용이 없으며, 투명한 가격 정책을 유지하고 있습니다.
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian expanded={expanded3} onChange={handleChange3}>
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
                  검품 서비스는 어떻게 진행되나요?
                </AccordionSummary>
                <AccordionDetails>
                  중국 현지에 상주하는 전문 검품팀이 직접 공장을 방문하여 제품 품질, 수량, 포장 상태
                  등을 철저히 검수합니다. 검품 결과는 상세한 보고서와 사진으로 실시간
                  공유해드립니다.
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian expanded={expanded4} onChange={handleChange4}>
                <AccordionSummary
                  expandIcon={
                    expanded4 ? (
                      <IconMinus size="21" stroke="1.5" />
                    ) : (
                      <IconPlus size="21" stroke="1.5" />
                    )
                  }
                  aria-controls="panel2-content"
                  id="panel2-header"
                >
                  통관 과정에서 문제가 생기면 어떻게 하나요?
                </AccordionSummary>
                <AccordionDetails>
                  저희 전문 통관팀이 모든 문제를 신속히 해결해드립니다. 7년간의 경험으로 대부분의
                  통관 이슈에 대한 해결 방안을 보유하고 있으며, 문제 발생 시 즉시 대응합니다.
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian expanded={expanded5} onChange={handleChange5}>
                <AccordionSummary
                  expandIcon={
                    expanded5 ? (
                      <IconMinus size="21" stroke="1.5" />
                    ) : (
                      <IconPlus size="21" stroke="1.5" />
                    )
                  }
                  aria-controls="panel2-content"
                  id="panel2-header"
                >
                  최소 주문 수량이 있나요?
                </AccordionSummary>
                <AccordionDetails>
                  최소 주문 수량은 제품과 공급업체에 따라 다릅니다. 소량 주문도 가능한 업체를
                  연결해드리며, 고객님의 니즈에 맞는 최적의 조건을 협상해드립니다.
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian expanded={expanded6} onChange={handleChange6}>
                <AccordionSummary
                  expandIcon={
                    expanded6 ? (
                      <IconMinus size="21" stroke="1.5" />
                    ) : (
                      <IconPlus size="21" stroke="1.5" />
                    )
                  }
                  aria-controls="panel2-content"
                  id="panel2-header"
                >
                  A/S는 어떻게 처리되나요?
                </AccordionSummary>
                <AccordionDetails>
                  제품 하자 발생 시 중국 공급업체와의 직접 소통을 대행해드립니다. 클레임 접수부터
                  처리까지 전 과정을 관리하며, 필요시 현지 방문을 통해 문제를 해결합니다.
                </AccordionDetails>
              </StyledAccordian>
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={3} justifyContent="center">
          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <Box
              mt={5}
              borderRadius="8px"
              sx={{
                border: `1px dashed ${theme.palette.divider}`,
                padding: '16px 20px',
                textAlign: 'center',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                추가 상담이 필요하신가요? 신속하고 정확하게 안내드립니다.
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <Link
                  href="tel:031-699-8781"
                  color="inherit"
                  underline="always"
                  sx={{
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  전화 문의
                </Link>
                {' 또는 '}
                <Link
                  href="/frontend-pages/contact"
                  color="inherit"
                  underline="always"
                  sx={{
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  온라인 문의
                </Link>
                를 이용해주세요.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
export default FAQ;
