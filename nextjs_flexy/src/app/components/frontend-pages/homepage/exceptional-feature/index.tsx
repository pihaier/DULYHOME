'use client';
import React from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

const StyledAnimationFeature = styled(Box)(() => ({
    width: '100%',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
}));



const slide1 = [
    {
        icon: '/images/frontend-pages/icons/icon-color.svg',
        text: '7년 무역 경험'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sidebar.svg',
        text: '현지 상주팀 운영'
    },
    {
        icon: '/images/frontend-pages/icons/icon-pages.svg',
        text: '1000+ 성공 사례'
    },
    {
        icon: '/images/frontend-pages/icons/icon-components.svg',
        text: '투명한 가격 정책'
    },
    {
        icon: '/images/frontend-pages/icons/icon-color.svg',
        text: '7년 무역 경험'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sidebar.svg',
        text: '현지 상주팀 운영'
    },
    {
        icon: '/images/frontend-pages/icons/icon-pages.svg',
        text: '1000+ 성공 사례'
    },
    {
        icon: '/images/frontend-pages/icons/icon-components.svg',
        text: '투명한 가격 정책'
    },
    {
        icon: '/images/frontend-pages/icons/icon-color.svg',
        text: '7년 무역 경험'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sidebar.svg',
        text: '현지 상주팀 운영'
    },
    {
        icon: '/images/frontend-pages/icons/icon-pages.svg',
        text: '1000+ 성공 사례'
    },
    {
        icon: '/images/frontend-pages/icons/icon-components.svg',
        text: '투명한 가격 정책'
    },
]

const slide2 = [
    {
        icon: '/images/frontend-pages/icons/icon-framework.svg',
        text: '원스톱 서비스'
    },
    {
        icon: '/images/frontend-pages/icons/icon-icons.svg',
        text: '실시간 진행상황 공유'
    },
    {
        icon: '/images/frontend-pages/icons/icon-responsive.svg',
        text: '24시간 고객지원'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sass.svg',
        text: '안전한 거래 보장'
    },
    {
        icon: '/images/frontend-pages/icons/icon-framework.svg',
        text: '원스톱 서비스'
    },
    {
        icon: '/images/frontend-pages/icons/icon-icons.svg',
        text: '실시간 진행상황 공유'
    },
    {
        icon: '/images/frontend-pages/icons/icon-responsive.svg',
        text: '24시간 고객지원'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sass.svg',
        text: '안전한 거래 보장'
    },
    {
        icon: '/images/frontend-pages/icons/icon-framework.svg',
        text: '원스톱 서비스'
    },
    {
        icon: '/images/frontend-pages/icons/icon-icons.svg',
        text: '실시간 진행상황 공유'
    },
    {
        icon: '/images/frontend-pages/icons/icon-responsive.svg',
        text: '24시간 고객지원'
    },
    {
        icon: '/images/frontend-pages/icons/icon-sass.svg',
        text: '안전한 거래 보장'
    },
]

const slide3 = [
    {
        icon: '/images/frontend-pages/icons/icon-customize.svg',
        text: '맞춤형 솔루션'
    },
    {
        icon: '/images/frontend-pages/icons/icon-chart.svg',
        text: '데이터 기반 분석'
    },
    {
        icon: '/images/frontend-pages/icons/icon-table.svg',
        text: '상세한 보고서 제공'
    },
    {
        icon: '/images/frontend-pages/icons/icon-update.svg',
        text: '지속적인 서비스 개선'
    },
    {
        icon: '/images/frontend-pages/icons/icon-support.svg',
        text: '전담 담당자 배정'
    },
    {
        icon: '/images/frontend-pages/icons/icon-customize.svg',
        text: '맞춤형 솔루션'
    },
    {
        icon: '/images/frontend-pages/icons/icon-chart.svg',
        text: '데이터 기반 분석'
    },
    {
        icon: '/images/frontend-pages/icons/icon-table.svg',
        text: '상세한 보고서 제공'
    },
    {
        icon: '/images/frontend-pages/icons/icon-update.svg',
        text: '지속적인 서비스 개선'
    },
    {
        icon: '/images/frontend-pages/icons/icon-support.svg',
        text: '전담 담당자 배정'
    },
    {
        icon: '/images/frontend-pages/icons/icon-customize.svg',
        text: '맞춤형 솔루션'
    },
    {
        icon: '/images/frontend-pages/icons/icon-chart.svg',
        text: '데이터 기반 분석'
    },
    {
        icon: '/images/frontend-pages/icons/icon-table.svg',
        text: '상세한 보고서 제공'
    },
    {
        icon: '/images/frontend-pages/icons/icon-update.svg',
        text: '지속적인 서비스 개선'
    },
    {
        icon: '/images/frontend-pages/icons/icon-support.svg',
        text: '전담 담당자 배정'
    },
]

const ExceptionalFeature = () => {

    const theme = useTheme();

    const StyledAnimationContent = styled(Box)(() => ({
        animation: theme.direction == 'ltr' ? 'marquee 25s linear infinite' : 'marqueeRtl 45s linear infinite'
    }));

    const StyledAnimationContent2 = styled(Box)(() => ({
        animation: theme.direction == 'ltr' ? 'marquee2 25s linear infinite' : 'marquee2Rtl 45s linear infinite'
    }));

    const StyledFeatureBox = styled(Box)(() => ({
        boxShadow: theme.shadows[9],
        backgroundColor: theme.palette.background.default,
        minHeight: '72px',
        width: '315px',
        borderRadius: '16px', 
        marginTop: '15px', 
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexShrink: 0
    }));

    return (<>
        <Container sx={{
            maxWidth: '1400px !important',
        }}>
            <Box borderRadius="24px" sx={{
                py: {
                    xs: '40px',
                    lg: '70px'
                },
                backgroundColor: theme.palette.mode == 'light' ? 'primary.light' : 'background.paper'
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        <Grid
                            size={{
                                xs: 12,
                                lg: 8,
                                sm: 10
                        }}>
                            <Typography 
                                variant="h4" 
                                mb={6} 
                                textAlign="center" 
                                fontWeight={700} 
                                fontSize="40px" 
                                lineHeight="1.2" 
                                sx={{
                                    fontSize: {
                                        lg: '40px',
                                        xs: '30px'
                                    }
                                }}
                            >
                                중국 무역의 모든 것을 하나로, 두리무역과 함께하세요
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>

                <StyledAnimationFeature>
                    <StyledAnimationContent display="flex" gap="30px">
                        {slide1.map((slide, i) => (
                            <StyledFeatureBox key={i}>
                                <Image src={slide.icon} alt="color" width={24} height={24} />
                                <Typography fontSize="15px" fontWeight={600}>
                                    {slide.text}
                                </Typography>
                            </StyledFeatureBox>
                        ))}
                    </StyledAnimationContent>
                </StyledAnimationFeature>

                <StyledAnimationFeature>
                    <StyledAnimationContent2 display="flex" gap="30px">
                        {slide2.map((slide, i) => (
                            <StyledFeatureBox key={i}>
                                <Image src={slide.icon} alt="color" width={24} height={24} />
                                <Typography fontSize="15px" fontWeight={600}>
                                    {slide.text}
                                </Typography>
                            </StyledFeatureBox>
                        ))}
                    </StyledAnimationContent2>
                </StyledAnimationFeature>

                <StyledAnimationFeature>
                    <StyledAnimationContent display="flex" gap="30px">
                        {slide3.map((slide, i) => (
                            <StyledFeatureBox key={i}>
                                <Image src={slide.icon} alt="color" width={24} height={24} />
                                <Typography fontSize="15px" fontWeight={600}>
                                    {slide.text}
                                </Typography>
                            </StyledFeatureBox>
                        ))}
                    </StyledAnimationContent>
                </StyledAnimationFeature>
            </Box>
        </Container>
    </>);
};

export default ExceptionalFeature;
