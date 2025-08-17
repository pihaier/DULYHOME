'use client';
import { styled, Container, Box, useTheme } from '@mui/material';
import React, { useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './layout/vertical/header/Header';
import Sidebar from './layout/vertical/sidebar/Sidebar';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';

import Navigation from './layout/horizontal/navbar/Navigation';
import HorizontalHeader from './layout/horizontal/header/Header';
import { CustomizerContext } from '@/app/context/customizerContext';
import config from '../context/config';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
  overflowX: 'hidden',
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeLayout, isLayout, activeMode, isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const pathname = usePathname();

  const theme = useTheme();

  // market-research와 orders 페이지에서는 full width 사용
  const isFullWidthPage = pathname?.includes('/market-research/') || pathname?.includes('/orders/');

  return (
    <>
      {/* 홈페이지 헤더 추가 */}
      <HpHeader />

      <MainWrapper>
        <title>두리무역 ERP 시스템</title>
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        {activeLayout === 'horizontal' ? '' : <Sidebar />}
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}
        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(isCollapse === 'mini-sidebar' && {
              [theme.breakpoints.up('lg')]: {
                ml: `${MiniSidebarWidth}px`,
              },
            }),
          }}
        >
          {/* ------------------------------------------- */}
          {/* 대시보드 헤더 숨김 - HpHeader 사용 */}
          {/* ------------------------------------------- */}
          {/* {activeLayout === 'horizontal' ? <HorizontalHeader /> : <Header />} */}
          {/* PageContent */}
          {activeLayout === 'horizontal' ? <Navigation /> : ''}
          <Container
            sx={{
              maxWidth: isFullWidthPage
                ? '1600px !important'
                : isLayout === 'boxed'
                  ? '1300px !important'
                  : '100%!important',
              px: isFullWidthPage ? 3 : undefined,
            }}
          >
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}

            <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
              {/* <Outlet /> */}
              {children}
              {/* <Index /> */}
            </Box>

            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
        </PageWrapper>
      </MainWrapper>

      {/* Footer 추가 */}
      <Footer />
    </>
  );
}
