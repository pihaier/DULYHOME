"use client";
import * as React from "react";
import { Box, Divider, Typography, Grid, Button } from "@mui/material";

import { styled } from "@mui/material/styles";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { useState } from "react";

const StyledAccordian = styled(Accordion)(() => ({
  boxShadow: "none",
  marginBottom: "0 !important",
  backgroundColor: 'transparent',
  "&.Mui-expanded": {
    margin: "0",
  },
  "& .MuiAccordionSummary-root": {
    padding: 0,
    minHeight: "60px",
  },
  "& .MuiAccordionDetails-root": {
    padding: "0 0 20px",
  },
}));

const TabTeamScheduling = () => {
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
    (<Grid container spacing={{ xs: 3, lg: 8 }}>
      <Grid
        size={{
          xs: 12,
          lg: 6
        }}>
        <Box
          sx={{
            width: "100%",
            height: "400px",
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Image
            src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20import%20agency%20service%20illustration%20with%20cargo%20containers%2C%20shipping%20documents%2C%20customs%20clearance%2C%20international%20trade%20symbols%2C%20modern%20business%20style%2C%20blue%20and%20white%20color%20scheme&image_size=square_hd"
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "120%",
              objectFit: 'cover',
              position: 'absolute',
              top: '0',
              left: '0'
            }}
            alt="수입대행 서비스"
          />
        </Box>
        {/* TODO: 수입대행 이미지 - 중국 현지 사무실, 컨테이너 선적, 또는 비즈니스 미팅 장면 */}
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 6
        }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              lg: "40px",
              xs: "35px",
            },
          }}
          fontWeight="700"
          mt={5}
        >
          수입대행 서비스
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
                시장조사 및 업체 발굴
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                중국 현지 시장 조사와 신뢰할 수 있는 공급업체 발굴, 제품 비교 분석을 통해 최적의 거래처를 찾아드립니다.
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
                생산 관리 및 품질 검수
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                주문부터 생산 완료까지 전 과정을 관리하며, 현지 직접 방문을 통한 철저한 품질 검수를 진행합니다.
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
                물류 • 통관 • 배송
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                안전한 국제 운송부터 신속한 통관, 국내 배송까지 원스톱으로 처리하여 문턱에서 문턱까지 책임집니다.
              </Typography>
            </AccordionDetails>
          </StyledAccordian>
          <Divider />
          <Box mt={3}>
            <Button variant="contained" color="primary" size="large">
              수입대행 문의하기
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>)
  );
};
export default TabTeamScheduling;
