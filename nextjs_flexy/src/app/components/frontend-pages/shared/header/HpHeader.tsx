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
import { Typography, Avatar, Menu, MenuItem } from '@mui/material';
import Logo from '@/app/dashboard/layout/shared/logo/Logo';
import Navigations from './Navigations';
import MobileSidebar from './MobileSidebar';
import { IconMenu2, IconUser, IconLogout } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/context/GlobalContext';

const HpHeader = (props: any) => {
  const supabase = createClient();
  const { user, userProfile } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
      } else {
        handleMenuClose();
        // 로그아웃 성공 시 GlobalContext가 자동으로 상태 업데이트
        // 페이지 새로고침하여 세션 완전히 정리
        window.location.href = '/';
      }
    } catch (error) {}
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
              <Stack direction="row" spacing={2}>
                {user ? (
                  // 로그인된 사용자 UI
                  <>
                    <Button color="primary" variant="outlined" href="/dashboard">
                      대시보드
                    </Button>
                    <IconButton onClick={handleMenuOpen}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {userProfile?.contact_person?.charAt(0) || user.email?.charAt(0)}
                      </Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          window.location.href = '/dashboard/profile';
                        }}
                      >
                        <IconUser size={18} style={{ marginRight: 8 }} />
                        프로필
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <IconLogout size={18} style={{ marginRight: 8 }} />
                        로그아웃
                      </MenuItem>
                    </Menu>
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
