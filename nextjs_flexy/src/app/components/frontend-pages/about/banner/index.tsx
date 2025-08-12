"use client";
import React from "react";
import { Box, Stack, Typography, Container, Grid, Button } from "@mui/material";
import Link from "next/link";

const Banner = () => {
  return (
    (<Box
      bgcolor="primary.light"
      sx={{
        paddingTop: {
          xs: "40px",
          lg: "100px",
        },
        paddingBottom: {
          xs: "40px",
          lg: "100px",
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid
            alignItems="center"
            size={{
              xs: 12,
              lg: 6
            }}>
            <Typography
              variant="h1"
              mb={3}
              lineHeight={1.4}
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: "34px",
                  sm: "48px",
                },
              }}
            >
              한-중 무역의 든든한 파트너, 두리무역
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/frontend-pages/services"
              >
                서비스 신청하기
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                href="/frontend-pages/contact"
              >
                문의하기
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://fzpyfzpmwyvqumvftfbr.supabase.co/storage/v1/object/public/uploads/duly/company-intro.pdf.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                회사 소개서 다운로드
              </Button>
            </Stack>
          </Grid>
          <Grid
            display="flex"
            alignItems="center"
            size={{
              xs: 12,
              lg: 5
            }}>
            <Typography lineHeight={1.9}>
              7년간의 한-중 무역 경험을 바탕으로 신뢰할 수 있는 전문 서비스를 제공합니다. 
              시장조사부터 검품감사까지, 수입 과정의 모든 단계를 체계적으로 지원하여 
              고객의 성공적인 중국 무역을 실현합니다.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>)
  );
};

export default Banner;
