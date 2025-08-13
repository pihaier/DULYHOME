'use client';
import React from "react";
import { Box, Grid, Typography, Container, Stack, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import useMediaQuery from '@mui/material/useMediaQuery';

const C2a = () => {

    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const smUp = useMediaQuery((theme) => theme.breakpoints.only('sm'));
    const theme = useTheme();
    return (<>
        <Container sx={{
            maxWidth: '1400px !important',
            py: {
                xs: '20px',
                lg: '30px',
            },
        }}>
            <Box borderRadius="24px" overflow="hidden" position="relative" sx={{
                py: {
                    xs: '40px',
                    lg: '70px'
                },
                backgroundColor: theme.palette.mode == 'light' ? 'primary.light' : 'background.paper'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid
                            size={{
                                xs: 12,
                                lg: 6,
                                sm: 8
                            }}>
                            <Typography 
                                variant="h4" 
                                mb={3} 
                                fontWeight={700} 
                                fontSize="40px" 
                                lineHeight="1.4" 
                                sx={{
                                    fontSize: {
                                        lg: '40px',
                                        xs: '30px'
                                    }
                                }}
                            >
                                중국 무역의 성공 파트너, 두리무역과 함께하세요
                            </Typography>
                            <Stack spacing={{ xs: 1, sm: 2 }} direction="row" flexWrap="wrap" mb={3}>
                                <Button variant="contained" size="large" href="/frontend-pages/services">서비스 시작하기</Button>
                                <Button variant="outlined" size="large" href="/frontend-pages/contact">무료 상담 신청</Button>
                            </Stack>
                            <Typography fontSize="14px">
                                <Box fontWeight={600} component="span">7년 무역 경험 -</Box> 1,000+ 기업이 선택한 전문 서비스
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>

                {lgUp ?
                    <Image 
                        src="/images/services/home2.jpg" 
                        alt="두리무역 서비스 비주얼" 
                        width={1200} 
                        height={365} 
                        style={{
                            position: 'absolute', 
                            right: 0,
                            top: 0, 
                            width: '50%', 
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0
                        }} 
                    /> : null
                }

                {smUp ?
                    <Image 
                        src="/images/services/cta-side.png" 
                        alt="두리무역 서비스 비주얼" 
                        width={1200} 
                        height={365} 
                        style={{
                            position: 'absolute', 
                            right: '-200px',
                            top: 0, 
                            width: 'auto', 
                            height: '100%',
                            objectFit: 'cover'
                        }} 
                    /> : null
                }



            </Box>
        </Container>
    </>);
};

export default C2a;
