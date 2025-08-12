"use client";
import React from "react";
import {
  Box,
  Stack,
  Typography,
  AvatarGroup,
  Avatar,
  Container,
  Grid,
  Button,
  Link,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Services = [
  {
    name: "수입대행",
    icon: "/images/services/import-agency.svg",
    code: "수입",
  },
  {
    name: "구매대행",
    icon: "/images/services/market-research.svg",
    code: "구매",
  },
  {
    name: "검품감사",
    icon: "/images/services/quality-inspection.svg",
    code: "검품",
  },
  {
    name: "배송대행",
    icon: "/images/services/factory-audit.svg",
    code: "배송",
  },
];
const Banner = () => {
  //   sidebar
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    (<Box 
      sx={{
        position: "relative",
        pt: 7,
        pb: 7,
        bgcolor: "#fafafa",
        overflow: "hidden",
        minHeight: "600px",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.05) 50%, rgba(255,193,7,0.1) 100%)",
          zIndex: 1
        }
      }}
    >
      {/* Background Video - Optimized */}
      <Box
        component="video"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%", 
          height: "100%",
          objectFit: "cover",
          opacity: 0.2,
          zIndex: 0,
          display: { xs: "none", md: "block" } // 모바일에서는 숨김
        }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata" // 메타데이터만 미리 로드
      >
        <source src="/images/WeChat_20250625002234.mp4" type="video/mp4" />
      </Box>
      
      {/* Mobile Background Gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.05) 50%, rgba(255,193,7,0.1) 100%)",
          zIndex: 0,
          display: { xs: "block", md: "none" } // 모바일에서만 표시
        }}
      />
      
      <Container
        sx={{
          maxWidth: "1400px !important",
          position: "relative",
          zIndex: 2
        }}
      >
        <Grid container spacing={3} justifyContent="center" mb={4}>


          <Grid
            textAlign="center"
            size={{
              xs: 12,
              lg: 7
            }}>
            <Typography
              variant="h1"
              fontWeight={700}
              lineHeight="1.2"
              sx={{
                fontSize: {
                  xs: "40px",
                  sm: "56px",
                },
              }}
            >
              한-중 무역의 모든 것{" "}
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: "40px",
                    sm: "56px",
                  },
                }}
                fontWeight={700}
                component="span"
                color="primary.main"
              >
                두리무역
              </Typography>
            </Typography>
            <Stack
              my={3}
              direction={{ xs: "column", sm: "row" }}
              spacing="20px"
              alignItems="center"
              justifyContent="center"
            >
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 3,
                  py: 1,
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <Typography variant="h6" fontWeight={500}>
                  7년 경력의 중국 무역 전문가와 현지 상주팀이 함께합니다
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              spacing={3}
              mb={4}
              justifyContent="center"
            >
              <Button
                color="primary"
                size="large"
                variant="contained"
                href="/frontend-pages/services"
                sx={{
                  minWidth: 180,
                  height: 56,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                서비스 신청
              </Button>
              <Button
                color="secondary"
                size="large"
                variant="outlined"
                href="/frontend-pages/contact"
                sx={{
                  minWidth: 180,
                  height: 56,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                이용 문의
              </Button>
            </Stack>

          </Grid>

        </Grid>

        {/* 서비스 요약 섹션 추가 */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={4} 
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 6 }}
        >
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
              시장조사
            </Typography>
            <Typography variant="body1" color="text.secondary">
              중국 공장 발굴 및<br />
              제품 가격 조사
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: 40, md: 60 }, height: 2, bgcolor: 'divider' }} />
          
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
              공장컨택
            </Typography>
            <Typography variant="body1" color="text.secondary">
              알고 있는 공장과<br />
              직접 업무 진행
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: 40, md: 60 }, height: 2, bgcolor: 'divider' }} />
          
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
              검품감사
            </Typography>
            <Typography variant="body1" color="text.secondary">
              제품 품질 검사 및<br />
              현장 실사 서비스
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>)
  );
};

export default Banner;
