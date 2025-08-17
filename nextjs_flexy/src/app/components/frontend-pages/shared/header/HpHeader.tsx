'use client';
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import Navigations from './Navigations';
import MobileSidebar from './MobileSidebar';
import Profile from '@/app/dashboard/layout/vertical/header/Profile';
import { IconMenu2 } from '@tabler/icons-react';
import { useUser } from '@/lib/context/GlobalContext';

const HpHeader = (props: any) => {
  const { user, userProfile } = useUser();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    justifyContent: 'center',
    [theme.breakpoints.up('lg')]: {
      minHeight: '100px',
    },
    backgroundColor:
      theme.palette.mode == 'light' ? theme.palette.primary.light : 'background.paper',
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    paddingLeft: '0 !important',
    paddingRight: '0 !important',
    color: theme.palette.text.secondary,
    justifyContent: 'space-between',
  }));

  //   sidebar
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const toggleDrawer = (newOpen: boolean | ((prevState: boolean) => boolean)) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBarStyled position="sticky" elevation={0}>
      <Container
        sx={{
          maxWidth: '1400px !important',
        }}
      >
        <ToolbarStyled>
          <Logo />
          {lgDown ? (
            <IconButton color="inherit" aria-label="menu" onClick={handleDrawerOpen}>
              <IconMenu2 size="20" />
            </IconButton>
          ) : null}
          {lgUp ? (
            <>
              <Stack spacing={1} direction="row" alignItems="center">
                <Navigations />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                {user ? (
                  // 로그인된 사용자 UI - 대시보드 Profile 컴포넌트 사용
                  <>
                    <Button color="primary" variant="outlined" href="/dashboard">
                      마이페이지
                    </Button>
                    <Profile />
                  </>
                ) : (
                  // 비로그인 사용자 UI
                  <>
                    <Button color="primary" variant="contained" href="/auth/customer/login">
                      고객 로그인
                    </Button>
                  </>
                )}
              </Stack>
            </>
          ) : null}
        </ToolbarStyled>
      </Container>
      <Drawer
        anchor="left"
        open={open}
        variant="temporary"
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: 270,
              border: '0 !important',
              boxShadow: (theme) => theme.shadows[8],
            },
          },
        }}
      >
        <MobileSidebar />
      </Drawer>
    </AppBarStyled>
  );
};

export default HpHeader;
